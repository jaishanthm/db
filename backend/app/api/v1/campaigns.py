from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Dict, Any, Optional
import json

from backend.app.core.database import get_db
from backend.app.models import Campaign, CampaignMalware, CampaignActor

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("", response_model=Dict[str, Any])
def list_campaigns(
    q: Optional[str] = Query(None, description="Search campaign name or objective"),
    status: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Campaign)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Campaign.name.ilike(search_pattern),
                Campaign.objective.ilike(search_pattern),
                Campaign.description.ilike(search_pattern)
            )
        )

    if status:
        query = query.filter(Campaign.status.ilike(status.strip()))

    if year:
        query = query.filter(Campaign.start_date.like(f"{year}%"))

    total = query.count()
    items = query.order_by(Campaign.start_date.desc()).offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for c in items:
        ind_list = json.loads(c.target_industries) if c.target_industries else []
        reg_list = json.loads(c.target_regions) if c.target_regions else []
        results.append({
            "id": c.id,
            "slug": c.slug,
            "name": c.name,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "status": c.status,
            "objective": c.objective,
            "target_industries": ind_list,
            "target_regions": reg_list,
            "confidence": c.confidence,
            "malware_count": len(c.malware_links),
            "actor_count": len(c.actors)
        })

    return {
        "status": "success",
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page if per_page else 1,
        "data": results
    }


@router.get("/{ident}", response_model=Dict[str, Any])
def get_campaign_detail(ident: str, db: Session = Depends(get_db)):
    if ident.isdigit():
        c = db.query(Campaign).filter(Campaign.id == int(ident)).first()
    else:
        c = db.query(Campaign).filter(Campaign.slug == ident).first()

    if not c:
        raise HTTPException(status_code=404, detail=f"Campaign '{ident}' not found.")

    ind_list = json.loads(c.target_industries) if c.target_industries else []
    reg_list = json.loads(c.target_regions) if c.target_regions else []

    malware_list = []
    for cm in c.malware_links:
        if cm.malware:
            malware_list.append({
                "malware_id": cm.malware.id,
                "malware_slug": cm.malware.slug,
                "malware_name": cm.malware.name,
                "primary_type": cm.malware.primary_type,
                "deployment_role": cm.deployment_role
            })

    actors_list = []
    for ca in c.actors:
        if ca.actor:
            actors_list.append({
                "actor_id": ca.actor.id,
                "actor_slug": ca.actor.slug,
                "actor_name": ca.actor.name,
                "attribution_confidence": ca.attribution_confidence
            })

    return {
        "status": "success",
        "data": {
            "id": c.id,
            "slug": c.slug,
            "name": c.name,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "status": c.status,
            "objective": c.objective,
            "description": c.description,
            "impact_summary": c.impact_summary,
            "target_industries": ind_list,
            "target_regions": reg_list,
            "confidence": c.confidence,
            "source": c.source,
            "malware": malware_list,
            "actors": actors_list
        }
    }
