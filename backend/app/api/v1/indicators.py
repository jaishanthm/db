from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Dict, Any, Optional

from backend.app.core.database import get_db
from backend.app.models import Indicator

router = APIRouter(prefix="/indicators", tags=["Indicators of Compromise"])

@router.get("", response_model=Dict[str, Any])
def list_indicators(
    q: Optional[str] = Query(None, description="Search indicator hash, IP, domain, or value"),
    type: Optional[str] = Query(None, description="SHA256, MD5, IPv4, Domain, Mutex, RegistryKey"),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Indicator)

    if q:
        query = query.filter(Indicator.value.ilike(f"%{q.strip()}%"))

    if type:
        query = query.filter(Indicator.indicator_type == type.strip())

    if severity:
        query = query.filter(Indicator.severity.ilike(severity.strip()))

    if status:
        query = query.filter(Indicator.status.ilike(status.strip()))

    total = query.count()
    items = query.order_by(Indicator.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for ind in items:
        results.append({
            "id": ind.id,
            "malware_id": ind.malware.id if ind.malware else None,
            "malware_name": ind.malware.name if ind.malware else "Unknown",
            "malware_slug": ind.malware.slug if ind.malware else "unknown",
            "indicator_type": ind.indicator_type,
            "value": ind.value,
            "confidence": ind.confidence,
            "severity": ind.severity,
            "first_seen": ind.first_seen,
            "last_seen": ind.last_seen,
            "status": ind.status,
            "source": ind.source
        })

    return {
        "status": "success",
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page if per_page else 1,
        "data": results
    }


@router.get("/lookup", response_model=Dict[str, Any])
def lookup_ioc(
    value: str = Query(..., description="Hash, IP, Domain, or Mutex value to look up"),
    db: Session = Depends(get_db)
):
    clean_val = value.strip()
    matches = db.query(Indicator).filter(Indicator.value.ilike(f"%{clean_val}%")).all()

    results = []
    for ind in matches:
        results.append({
            "id": ind.id,
            "malware_id": ind.malware.id if ind.malware else None,
            "malware_name": ind.malware.name if ind.malware else "Unknown",
            "malware_slug": ind.malware.slug if ind.malware else "unknown",
            "malware_type": ind.malware.primary_type if ind.malware else "Unknown",
            "indicator_type": ind.indicator_type,
            "value": ind.value,
            "confidence": ind.confidence,
            "severity": ind.severity,
            "first_seen": ind.first_seen,
            "last_seen": ind.last_seen,
            "status": ind.status,
            "source": ind.source
        })

    return {
        "status": "success",
        "query": clean_val,
        "total_matches": len(results),
        "results": results
    }
