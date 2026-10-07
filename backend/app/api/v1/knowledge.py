from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from backend.app.core.database import get_db
from backend.app.models import (
    GlossaryTerm, MitigationGuideline, AnalysisConcept, TelemetrySource
)

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & Intelligence"])

@router.get("/glossary", response_model=Dict[str, Any])
def get_glossary(
    q: Optional[str] = Query(None, description="Search term or definition"),
    category: Optional[str] = Query(None, description="Category filter"),
    db: Session = Depends(get_db)
):
    query = db.query(GlossaryTerm)
    if q:
        query = query.filter(
            GlossaryTerm.term.ilike(f"%{q.strip()}%") |
            GlossaryTerm.definition.ilike(f"%{q.strip()}%")
        )
    if category:
        query = query.filter(GlossaryTerm.category.ilike(category.strip()))

    terms = query.order_by(GlossaryTerm.term.asc()).all()
    return {
        "status": "success",
        "total": len(terms),
        "terms": [
            {
                "id": t.id,
                "term": t.term,
                "category": t.category,
                "definition": t.definition,
                "example": t.technical_example,
                "related_mitre": t.related_mitre
            }
            for t in terms
        ]
    }

@router.get("/mitigations", response_model=Dict[str, Any])
def get_mitigations(
    phase: Optional[str] = Query(None, description="Prevention, Detection, Containment, Eradication, Recovery, Hardening"),
    db: Session = Depends(get_db)
):
    query = db.query(MitigationGuideline)
    if phase:
        query = query.filter(MitigationGuideline.phase.ilike(phase.strip()))

    guidelines = query.order_by(MitigationGuideline.id.asc()).all()
    return {
        "status": "success",
        "total": len(guidelines),
        "guidelines": [
            {
                "id": g.id,
                "slug": g.slug,
                "phase": g.phase,
                "title": g.title,
                "objective": g.objective,
                "technical_controls": g.technical_controls,
                "target_environment": g.target_environment,
                "framework": g.cisa_guideline
            }
            for g in guidelines
        ]
    }

@router.get("/analysis-concepts", response_model=Dict[str, Any])
def get_analysis_concepts(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(AnalysisConcept)
    if category:
        query = query.filter(AnalysisConcept.category.ilike(category.strip()))

    concepts = query.order_by(AnalysisConcept.id.asc()).all()
    return {
        "status": "success",
        "total": len(concepts),
        "concepts": [
            {
                "id": c.id,
                "slug": c.slug,
                "category": c.category,
                "title": c.title,
                "technical_overview": c.technical_overview,
                "forensic_indicators": c.forensic_indicators,
                "tooling": c.investigation_tooling
            }
            for c in concepts
        ]
    }

@router.get("/telemetry-hub", response_model=Dict[str, Any])
def get_telemetry_sources(
    source_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(TelemetrySource)
    if source_type:
        query = query.filter(TelemetrySource.source_type.ilike(source_type.strip()))

    sources = query.order_by(TelemetrySource.id.asc()).all()
    return {
        "status": "success",
        "total": len(sources),
        "sources": [
            {
                "id": s.id,
                "source_type": s.source_type,
                "event_id": s.event_id,
                "name": s.name,
                "description": s.description,
                "detection_value": s.detection_value,
                "sample_log": s.sample_log
            }
            for s in sources
        ]
    }
