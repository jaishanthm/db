from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Dict, Any, Optional
import json

from backend.app.core.database import get_db
from backend.app.models import ThreatActor, ActorMalware, CampaignActor

router = APIRouter(prefix="/actors", tags=["Threat Actors"])

@router.get("", response_model=Dict[str, Any])
def list_threat_actors(
    q: Optional[str] = Query(None, description="Search actor name, alias, country, or description"),
    country: Optional[str] = Query(None),
    motivation: Optional[str] = Query(None),
    sophistication: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(ThreatActor)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                ThreatActor.name.ilike(search_pattern),
                ThreatActor.aliases.ilike(search_pattern),
                ThreatActor.origin_country.ilike(search_pattern),
                ThreatActor.description.ilike(search_pattern)
            )
        )

    if country:
        query = query.filter(ThreatActor.origin_country.ilike(f"%{country.strip()}%"))

    if motivation:
        query = query.filter(ThreatActor.motivation.ilike(f"%{motivation.strip()}%"))

    if sophistication:
        query = query.filter(ThreatActor.sophistication.ilike(sophistication.strip()))

    total = query.count()
    items = query.order_by(ThreatActor.name.asc()).offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for a in items:
        aliases_list = json.loads(a.aliases) if a.aliases else []
        sectors_list = json.loads(a.target_sectors) if a.target_sectors else []
        countries_list = json.loads(a.target_countries) if a.target_countries else []
        results.append({
            "id": a.id,
            "slug": a.slug,
            "name": a.name,
            "aliases": aliases_list,
            "origin_country": a.origin_country,
            "motivation": a.motivation,
            "first_seen": a.first_seen,
            "status": a.status,
            "sophistication": a.sophistication,
            "target_sectors": sectors_list,
            "target_countries": countries_list,
            "malware_count": len(a.malware_links),
            "campaign_count": len(a.campaigns)
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
def get_threat_actor_detail(ident: str, db: Session = Depends(get_db)):
    if ident.isdigit():
        a = db.query(ThreatActor).filter(ThreatActor.id == int(ident)).first()
    else:
        a = db.query(ThreatActor).filter(ThreatActor.slug == ident).first()

    if not a:
        raise HTTPException(status_code=404, detail=f"Threat actor '{ident}' not found.")

    aliases_list = json.loads(a.aliases) if a.aliases else []
    sectors_list = json.loads(a.target_sectors) if a.target_sectors else []
    countries_list = json.loads(a.target_countries) if a.target_countries else []

    malware_list = []
    for am in a.malware_links:
        if am.malware:
            malware_list.append({
                "malware_id": am.malware.id,
                "malware_slug": am.malware.slug,
                "malware_name": am.malware.name,
                "primary_type": am.malware.primary_type,
                "role": am.role
            })

    campaigns_list = []
    for ca in a.campaigns:
        if ca.campaign:
            campaigns_list.append({
                "campaign_id": ca.campaign.id,
                "campaign_slug": ca.campaign.slug,
                "campaign_name": ca.campaign.name,
                "start_date": ca.campaign.start_date,
                "attribution_confidence": ca.attribution_confidence
            })

    return {
        "status": "success",
        "data": {
            "id": a.id,
            "slug": a.slug,
            "name": a.name,
            "aliases": aliases_list,
            "origin_country": a.origin_country,
            "motivation": a.motivation,
            "first_seen": a.first_seen,
            "status": a.status,
            "sophistication": a.sophistication,
            "description": a.description,
            "source": a.source,
            "target_sectors": sectors_list,
            "target_countries": countries_list,
            "malware": malware_list,
            "campaigns": campaigns_list
        }
    }
