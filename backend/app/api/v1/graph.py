from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from backend.app.core.database import get_db
from backend.app.models import (
    MalwareFamily, ThreatActor, Campaign,
    MitreTechnique, ActorMalware, CampaignMalware,
    MalwareTechnique, Vulnerability, MalwareVulnerability
)

router = APIRouter(prefix="/graph", tags=["Relationship Graph"])

@router.get("", response_model=Dict[str, Any])
def get_relationship_graph(
    focus_malware: Optional[str] = Query(None, description="Center graph around specific malware slug"),
    limit_nodes: int = Query(75, ge=20, le=250),
    db: Session = Depends(get_db)
):
    nodes = []
    links = []
    node_ids = set()

    def add_node(n_id: str, label: str, group: str, subtype: str = "", extra: Dict[str, Any] = None):
        if n_id not in node_ids:
            node_ids.add(n_id)
            node_dict = {
                "id": n_id,
                "label": label,
                "group": group,
                "subtype": subtype,
                "extra": extra or {}
            }
            nodes.append(node_dict)

    def add_link(source: str, target: str, rel: str):
        if source in node_ids and target in node_ids:
            links.append({
                "source": source,
                "target": target,
                "label": rel
            })

    if focus_malware:
        mf = db.query(MalwareFamily).filter(MalwareFamily.slug == focus_malware).first()
        if not mf:
            mf = db.query(MalwareFamily).first()
        selected_malware = [mf] if mf else []
    else:
        # Pick top prominent malware
        selected_malware = db.query(MalwareFamily).limit(18).all()

    for m in selected_malware:
        m_nid = f"malware_{m.id}"
        add_node(m_nid, m.name, "malware", m.primary_type, {"slug": m.slug, "severity": m.severity})

        # Link Actors
        for am in m.actors[:3]:
            if am.actor:
                a_nid = f"actor_{am.actor.id}"
                add_node(a_nid, am.actor.name, "actor", am.actor.origin_country, {"slug": am.actor.slug})
                add_link(a_nid, m_nid, am.role)

        # Link Campaigns
        for cm in m.campaigns[:2]:
            if cm.campaign:
                c_nid = f"campaign_{cm.campaign.id}"
                add_node(c_nid, cm.campaign.name, "campaign", cm.campaign.status, {"slug": cm.campaign.slug})
                add_link(c_nid, m_nid, cm.deployment_role)

        # Link Techniques
        for mt in m.techniques[:4]:
            if mt.technique:
                t_nid = f"technique_{mt.technique.id}"
                add_node(t_nid, f"{mt.technique.id} {mt.technique.name}", "technique", mt.technique.tactic_name, {"url": mt.technique.url})
                add_link(m_nid, t_nid, "uses")

        # Link Vulnerabilities
        for mv in m.vulnerabilities[:2]:
            if mv.vulnerability:
                v_nid = f"vuln_{mv.vulnerability.id}"
                add_node(v_nid, mv.vulnerability.id, "vulnerability", mv.vulnerability.severity, {"cvss": mv.vulnerability.cvss_score})
                add_link(m_nid, v_nid, "exploits")

    return {
        "status": "success",
        "nodes": nodes,
        "links": links,
        "total_nodes": len(nodes),
        "total_links": len(links)
    }
