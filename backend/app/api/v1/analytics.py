from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from collections import Counter
import json

from backend.app.core.database import get_db
from backend.app.models import (
    MalwareFamily, ThreatActor, Campaign, Indicator,
    MitreTechnique, MalwareTechnique, Platform, MalwarePlatform,
    Industry, MalwareIndustry, CaseStudy, DefensiveRule
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Telemetry"])

@router.get("", response_model=Dict[str, Any])
def get_analytics(db: Session = Depends(get_db)):
    # 1. High-level metric counters
    total_malware = db.query(MalwareFamily).count()
    total_actors = db.query(ThreatActor).count()
    total_campaigns = db.query(Campaign).count()
    total_indicators = db.query(Indicator).count()
    total_case_studies = db.query(CaseStudy).count()
    total_rules = db.query(DefensiveRule).count()

    # 2. Malware by Type
    type_counts = (
        db.query(MalwareFamily.primary_type, func.count(MalwareFamily.id))
        .group_by(MalwareFamily.primary_type)
        .order_by(func.count(MalwareFamily.id).desc())
        .all()
    )
    malware_by_type = [{"type": t[0], "count": t[1]} for t in type_counts]

    # 3. Severity Distribution
    sev_counts = (
        db.query(MalwareFamily.severity, func.count(MalwareFamily.id))
        .group_by(MalwareFamily.severity)
        .all()
    )
    severity_distribution = [{"severity": s[0], "count": s[1]} for s in sev_counts]

    # 4. Malware Timeline by Year (First seen)
    malware_all = db.query(MalwareFamily.first_seen).all()
    years_counter = Counter()
    for m in malware_all:
        if m.first_seen:
            yr = m.first_seen.split("-")[0]
            if yr.isdigit():
                years_counter[int(yr)] += 1

    sorted_years = sorted(years_counter.keys())
    malware_by_year = [{"year": str(y), "count": years_counter[y]} for y in sorted_years]

    # 5. Platforms Distribution
    platform_counts = (
        db.query(Platform.name, func.count(MalwarePlatform.id))
        .join(MalwarePlatform, Platform.id == MalwarePlatform.platform_id)
        .group_by(Platform.name)
        .order_by(func.count(MalwarePlatform.id).desc())
        .all()
    )
    platforms_distribution = [{"platform": p[0], "count": p[1]} for p in platform_counts]

    # 6. Top MITRE ATT&CK Techniques
    top_techniques = (
        db.query(MitreTechnique.id, MitreTechnique.name, MitreTechnique.tactic_name, func.count(MalwareTechnique.id))
        .join(MalwareTechnique, MitreTechnique.id == MalwareTechnique.technique_id)
        .group_by(MitreTechnique.id, MitreTechnique.name, MitreTechnique.tactic_name)
        .order_by(func.count(MalwareTechnique.id).desc())
        .limit(10)
        .all()
    )
    top_techniques_data = [
        {"id": t[0], "name": t[1], "tactic": t[2], "malware_count": t[3]}
        for t in top_techniques
    ]

    # 7. Top Target Industries
    industry_counts = (
        db.query(Industry.name, func.count(MalwareIndustry.id))
        .join(MalwareIndustry, Industry.id == MalwareIndustry.industry_id)
        .group_by(Industry.name)
        .order_by(func.count(MalwareIndustry.id).desc())
        .limit(10)
        .all()
    )
    top_industries = [{"industry": ind[0], "count": ind[1]} for ind in industry_counts]

    # 8. Threat Actor Motivations
    actor_mot = (
        db.query(ThreatActor.motivation, func.count(ThreatActor.id))
        .group_by(ThreatActor.motivation)
        .order_by(func.count(ThreatActor.id).desc())
        .all()
    )
    actor_motivations = [{"motivation": am[0], "count": am[1]} for am in actor_mot]

    return {
        "status": "success",
        "metrics": {
            "total_malware": total_malware,
            "total_threat_actors": total_actors,
            "total_campaigns": total_campaigns,
            "total_indicators": total_indicators,
            "total_case_studies": total_case_studies,
            "total_defensive_rules": total_rules
        },
        "malware_by_type": malware_by_type,
        "severity_distribution": severity_distribution,
        "malware_by_year": malware_by_year,
        "platforms_distribution": platforms_distribution,
        "top_techniques": top_techniques_data,
        "top_industries": top_industries,
        "actor_motivations": actor_motivations
    }
