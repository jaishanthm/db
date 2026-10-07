from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import json

from backend.app.core.database import get_db
from backend.app.models import CaseStudy

router = APIRouter(prefix="/case-studies", tags=["Case Studies"])

@router.get("", response_model=Dict[str, Any])
def list_case_studies(
    industry: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(CaseStudy)

    if q:
        query = query.filter(
            CaseStudy.title.ilike(f"%{q.strip()}%") |
            CaseStudy.target_entity.ilike(f"%{q.strip()}%") |
            CaseStudy.executive_summary.ilike(f"%{q.strip()}%")
        )

    if industry:
        query = query.filter(CaseStudy.industry.ilike(f"%{industry.strip()}%"))

    total = query.count()
    items = query.order_by(CaseStudy.incident_date.desc()).offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for cs in items:
        results.append({
            "id": cs.id,
            "slug": cs.slug,
            "title": cs.title,
            "subtitle": cs.subtitle,
            "malware_id": cs.malware.id if cs.malware else None,
            "malware_name": cs.malware.name if cs.malware else None,
            "malware_slug": cs.malware.slug if cs.malware else None,
            "incident_date": cs.incident_date,
            "target_entity": cs.target_entity,
            "industry": cs.industry,
            "region": cs.region,
            "executive_summary": cs.executive_summary[:240] + "..." if len(cs.executive_summary) > 240 else cs.executive_summary
        })

    return {
        "status": "success",
        "total": total,
        "page": page,
        "per_page": per_page,
        "data": results
    }


@router.get("/{slug}", response_model=Dict[str, Any])
def get_case_study_detail(slug: str, db: Session = Depends(get_db)):
    cs = db.query(CaseStudy).filter(CaseStudy.slug == slug).first()
    if not cs:
        raise HTTPException(status_code=404, detail=f"Case study '{slug}' not found.")

    mitre_attack = json.loads(cs.mitre_attack_json) if cs.mitre_attack_json else []
    iocs = json.loads(cs.iocs_json) if cs.iocs_json else []
    refs = json.loads(cs.references_json) if cs.references_json else []

    return {
        "status": "success",
        "data": {
            "id": cs.id,
            "slug": cs.slug,
            "title": cs.title,
            "subtitle": cs.subtitle,
            "malware_id": cs.malware.id if cs.malware else None,
            "malware_name": cs.malware.name if cs.malware else None,
            "malware_slug": cs.malware.slug if cs.malware else None,
            "campaign_id": cs.campaign.id if cs.campaign else None,
            "campaign_name": cs.campaign.name if cs.campaign else None,
            "incident_date": cs.incident_date,
            "target_entity": cs.target_entity,
            "industry": cs.industry,
            "region": cs.region,
            "executive_summary": cs.executive_summary,
            "threat_context": cs.threat_context,
            "initial_access": cs.initial_access,
            "execution_flow": cs.execution_flow,
            "persistence_mechanism": cs.persistence_mechanism,
            "privilege_escalation": cs.privilege_escalation,
            "defense_evasion": cs.defense_evasion,
            "lateral_movement": cs.lateral_movement,
            "command_and_control": cs.command_and_control,
            "exfiltration_impact": cs.exfiltration_impact,
            "detection_opportunities": cs.detection_opportunities,
            "containment_actions": cs.containment_actions,
            "lessons_learned": cs.lessons_learned,
            "mitre_attack": mitre_attack,
            "iocs": iocs,
            "references": refs
        }
    }
