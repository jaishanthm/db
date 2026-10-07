from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Dict, Any

from backend.app.core.database import get_db
from backend.app.models import (
    MalwareFamily, ThreatActor, Campaign,
    MitreTechnique, Indicator, CaseStudy, Vulnerability
)

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("", response_model=Dict[str, Any])
def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    db: Session = Depends(get_db)
):
    keyword = f"%{q.strip()}%"

    # Search Malware
    malware_hits = (
        db.query(MalwareFamily)
        .filter(
            or_(
                MalwareFamily.name.ilike(keyword),
                MalwareFamily.aliases.ilike(keyword),
                MalwareFamily.description.ilike(keyword),
                MalwareFamily.primary_type.ilike(keyword)
            )
        )
        .limit(6)
        .all()
    )

    # Search Threat Actors
    actor_hits = (
        db.query(ThreatActor)
        .filter(
            or_(
                ThreatActor.name.ilike(keyword),
                ThreatActor.aliases.ilike(keyword),
                ThreatActor.origin_country.ilike(keyword)
            )
        )
        .limit(5)
        .all()
    )

    # Search Campaigns
    campaign_hits = (
        db.query(Campaign)
        .filter(
            or_(
                Campaign.name.ilike(keyword),
                Campaign.objective.ilike(keyword)
            )
        )
        .limit(5)
        .all()
    )

    # Search Techniques
    technique_hits = (
        db.query(MitreTechnique)
        .filter(
            or_(
                MitreTechnique.id.ilike(keyword),
                MitreTechnique.name.ilike(keyword),
                MitreTechnique.tactic_name.ilike(keyword)
            )
        )
        .limit(5)
        .all()
    )

    # Search Indicators
    ioc_hits = (
        db.query(Indicator)
        .filter(Indicator.value.ilike(keyword))
        .limit(5)
        .all()
    )

    # Search Case Studies
    case_hits = (
        db.query(CaseStudy)
        .filter(
            or_(
                CaseStudy.title.ilike(keyword),
                CaseStudy.target_entity.ilike(keyword)
            )
        )
        .limit(4)
        .all()
    )

    results = {
        "malware": [
            {
                "id": m.id,
                "slug": m.slug,
                "title": m.name,
                "subtitle": f"{m.primary_type} · {m.severity}",
                "type": "malware"
            }
            for m in malware_hits
        ],
        "actors": [
            {
                "id": a.id,
                "slug": a.slug,
                "title": a.name,
                "subtitle": f"Nation: {a.origin_country} · {a.motivation}",
                "type": "actor"
            }
            for a in actor_hits
        ],
        "campaigns": [
            {
                "id": c.id,
                "slug": c.slug,
                "title": c.name,
                "subtitle": f"{c.start_date} · {c.status}",
                "type": "campaign"
            }
            for c in campaign_hits
        ],
        "techniques": [
            {
                "id": t.id,
                "slug": t.id,
                "title": f"{t.id}: {t.name}",
                "subtitle": f"Tactic: {t.tactic_name}",
                "type": "technique"
            }
            for t in technique_hits
        ],
        "indicators": [
            {
                "id": ind.id,
                "slug": str(ind.id),
                "title": ind.value,
                "subtitle": f"Type: {ind.indicator_type} ({ind.severity})",
                "type": "indicator"
            }
            for ind in ioc_hits
        ],
        "case_studies": [
            {
                "id": cs.id,
                "slug": cs.slug,
                "title": cs.title,
                "subtitle": f"{cs.target_entity} ({cs.industry})",
                "type": "case_study"
            }
            for cs in case_hits
        ]
    }

    total_matches = sum(len(v) for v in results.values())

    return {
        "status": "success",
        "query": q,
        "total_matches": total_matches,
        "results": results
    }
