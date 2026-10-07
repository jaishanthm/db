from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, timezone
import json

from backend.app.core.database import get_db
from backend.app.models import (
    MalwareFamily, ThreatActor, Campaign,
    MitreTechnique, Indicator, CaseStudy,
    DefensiveRule, MitigationGuideline, TelemetrySource
)

router = APIRouter(prefix="/research", tags=["Research Mode"])

@router.get("/{slug}", response_model=Dict[str, Any])
def get_research_dossier(slug: str, db: Session = Depends(get_db)):
    """
    Assembles a unified, multi-tiered Threat Intelligence Research Dossier for a selected malware family:
    MALWARE -> [THREAT ACTORS | CAMPAIGNS | VARIANTS] -> TECHNIQUES -> [IOCs | VULNERABILITIES] -> CASE STUDIES -> DETECTION -> MITIGATION
    """
    if slug.isdigit():
        m = db.query(MalwareFamily).filter(MalwareFamily.id == int(slug)).first()
    else:
        m = db.query(MalwareFamily).filter(MalwareFamily.slug == slug).first()

    if not m:
        raise HTTPException(status_code=404, detail=f"Malware family '{slug}' not found for Research Mode.")

    aliases_list = json.loads(m.aliases) if m.aliases else []
    platforms_list = [mp.platform.name for mp in m.platforms if mp.platform]
    industries_list = [mi.industry.name for mi in m.industries if mi.industry]

    # 1. Tier: Actors
    actors_list = []
    for am in m.actors:
        if am.actor:
            actors_list.append({
                "id": am.actor.id,
                "slug": am.actor.slug,
                "name": am.actor.name,
                "origin_country": am.actor.origin_country,
                "motivation": am.actor.motivation,
                "role": am.role,
                "sophistication": am.actor.sophistication
            })

    # 2. Tier: Campaigns
    campaigns_list = []
    for cm in m.campaigns:
        if cm.campaign:
            campaigns_list.append({
                "id": cm.campaign.id,
                "slug": cm.campaign.slug,
                "name": cm.campaign.name,
                "start_date": cm.campaign.start_date,
                "status": cm.campaign.status,
                "objective": cm.campaign.objective,
                "deployment_role": cm.deployment_role
            })

    # 3. Tier: Variants
    variants_list = [
        {
            "id": v.id,
            "variant_name": v.variant_name,
            "version": v.version,
            "release_date": v.release_date,
            "differences": v.differences,
            "c2_protocol": v.c2_protocol
        }
        for v in m.variants
    ]

    # 4. Tier: Techniques
    techniques_list = [
        {
            "technique_id": mt.technique.id,
            "technique_name": mt.technique.name,
            "tactic_id": mt.technique.tactic_id,
            "tactic_name": mt.technique.tactic_name,
            "use_case": mt.use_case,
            "url": mt.technique.url
        }
        for mt in m.techniques if mt.technique
    ]

    # 5. Tier: Indicators (IOCs)
    indicators_list = [
        {
            "id": ind.id,
            "type": ind.indicator_type,
            "value": ind.value,
            "confidence": ind.confidence,
            "severity": ind.severity,
            "status": ind.status
        }
        for ind in m.indicators
    ]

    # 6. Tier: Vulnerabilities (CVEs)
    vulnerabilities_list = [
        {
            "cve_id": mv.vulnerability.id,
            "title": mv.vulnerability.title,
            "cvss_score": mv.vulnerability.cvss_score,
            "severity": mv.vulnerability.severity,
            "stage": mv.exploitation_stage
        }
        for mv in m.vulnerabilities if mv.vulnerability
    ]

    # 7. Tier: Case Studies
    case_studies_list = [
        {
            "id": cs.id,
            "slug": cs.slug,
            "title": cs.title,
            "incident_date": cs.incident_date,
            "target_entity": cs.target_entity,
            "executive_summary": cs.executive_summary[:200] + "..." if len(cs.executive_summary) > 200 else cs.executive_summary
        }
        for cs in m.case_studies
    ]

    # 8. Tier: Defensive Rules
    defensive_rules_list = [
        {
            "id": r.id,
            "rule_type": r.rule_type,
            "name": r.name,
            "target_component": r.target_component,
            "rule_content": r.rule_content,
            "severity": r.severity
        }
        for r in m.defensive_rules
    ]

    # 9. Tier: Recommended Mitigations
    generic_mitigations = db.query(MitigationGuideline).all()
    mitigations_list = [
        {
            "phase": mg.phase,
            "title": mg.title,
            "objective": mg.objective,
            "technical_controls": mg.technical_controls
        }
        for mg in generic_mitigations
    ]

    # 10. Tier: Relevant Telemetry Signatures (Sysmon / Event Log mappings)
    telemetry_list = db.query(TelemetrySource).all()
    telemetry_data = [
        {
            "source_type": ts.source_type,
            "event_id": ts.event_id,
            "name": ts.name,
            "detection_value": ts.detection_value
        }
        for ts in telemetry_list
    ]

    return {
        "status": "success",
        "malware": {
            "id": m.id,
            "slug": m.slug,
            "name": m.name,
            "aliases": aliases_list,
            "primary_type": m.primary_type,
            "severity": m.severity,
            "first_seen": m.first_seen,
            "last_seen": m.last_seen,
            "status": m.status,
            "architecture": m.architecture,
            "platforms": platforms_list,
            "industries": industries_list,
            "description": m.description,
            "technical_analysis": m.technical_analysis,
            "source": m.source,
            "confidence": m.confidence
        },
        "knowledge_graph": {
            "actors": actors_list,
            "campaigns": campaigns_list,
            "variants": variants_list,
            "techniques": techniques_list,
            "indicators": indicators_list,
            "iocs": indicators_list,
            "vulnerabilities": vulnerabilities_list,
            "case_studies": case_studies_list,
            "defensive_rules": defensive_rules_list,
            "detection_rules": defensive_rules_list,
            "mitigations": mitigations_list,
            "telemetry": telemetry_data
        },
        "meta": {
            "assembled_at": datetime.now(timezone.utc).isoformat(),
            "intelligence_tier_count": 10,
            "research_ready": True
        }
    }
