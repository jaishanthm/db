from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.core.database import get_db
from backend.app.models import MitreTactic, MitreTechnique, MalwareTechnique

router = APIRouter(prefix="/techniques", tags=["MITRE ATT&CK"])

@router.get("/matrix", response_model=Dict[str, Any])
def get_attack_matrix(db: Session = Depends(get_db)):
    tactics = db.query(MitreTactic).order_by(MitreTactic.order_index.asc()).all()

    matrix = []
    for tac in tactics:
        tech_list = []
        for tech in tac.techniques:
            m_count = db.query(MalwareTechnique).filter(MalwareTechnique.technique_id == tech.id).count()
            tech_list.append({
                "id": tech.id,
                "name": tech.name,
                "tactic_id": tech.tactic_id,
                "tactic_name": tech.tactic_name,
                "description": tech.description,
                "url": tech.url,
                "malware_count": m_count
            })
        matrix.append({
            "id": tac.id,
            "name": tac.name,
            "description": tac.description,
            "order_index": tac.order_index,
            "techniques": tech_list
        })

    return {
        "status": "success",
        "tactics": matrix
    }


@router.get("/{tech_id}", response_model=Dict[str, Any])
def get_technique_detail(tech_id: str, db: Session = Depends(get_db)):
    tech = db.query(MitreTechnique).filter(MitreTechnique.id == tech_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail=f"MITRE technique '{tech_id}' not found.")

    malware_links = db.query(MalwareTechnique).filter(MalwareTechnique.technique_id == tech_id).all()
    malware_list = []
    for ml in malware_links:
        if ml.malware:
            malware_list.append({
                "id": ml.malware.id,
                "slug": ml.malware.slug,
                "name": ml.malware.name,
                "primary_type": ml.malware.primary_type,
                "severity": ml.malware.severity,
                "use_case": ml.use_case,
                "confidence": ml.confidence
            })

    return {
        "status": "success",
        "data": {
            "id": tech.id,
            "name": tech.name,
            "tactic_id": tech.tactic_id,
            "tactic_name": tech.tactic_name,
            "description": tech.description,
            "url": tech.url,
            "malware": malware_list
        }
    }
