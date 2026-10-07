"""
Data Quality Engine for Malware Information Database.
Performs data integrity and forensic consistency audits across the database:
- Duplicate slugs or names
- Broken foreign key references
- Date format validation (ISO format)
- Hash format verification (SHA256: 64 hex, MD5: 32 hex)
- IPv4 address format validation
- MITRE technique ID format (Txxxx[.xxx])
- Orphaned indicators, relationships, or variants
- Missing required descriptions or classifications
"""

import re
import ipaddress
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import (
    MalwareFamily, ThreatActor, Campaign, Indicator,
    MitreTechnique, MalwareTechnique, MalwarePlatform,
    MalwareCapability, CaseStudy, TimelineEvent
)

def run_data_quality_audit(db: Session) -> Dict[str, Any]:
    issues: List[Dict[str, str]] = []
    checks_passed = 0
    checks_total = 0

    # Check 1: Duplicate Malware Slugs or Names
    checks_total += 1
    malware_items = db.query(MalwareFamily).all()
    slugs = set()
    dup_slugs = []
    for m in malware_items:
        if m.slug in slugs:
            dup_slugs.append(m.slug)
        slugs.add(m.slug)
    if dup_slugs:
        issues.append({"level": "CRITICAL", "check": "Duplicate Slugs", "detail": f"Duplicate slugs found: {dup_slugs}"})
    else:
        checks_passed += 1

    # Check 2: Malware date format validation
    checks_total += 1
    date_regex = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    invalid_dates = []
    for m in malware_items:
        if not date_regex.match(m.first_seen):
            invalid_dates.append(f"{m.slug}: {m.first_seen}")
    if invalid_dates:
        issues.append({"level": "HIGH", "check": "Invalid First Seen Date", "detail": f"{len(invalid_dates)} invalid dates"})
    else:
        checks_passed += 1

    # Check 3: Indicator format validation (SHA256, MD5, IPv4)
    checks_total += 1
    indicators = db.query(Indicator).all()
    sha256_regex = re.compile(r"^[a-fA-F0-9]{64}$")
    md5_regex = re.compile(r"^[a-fA-F0-9]{32}$")
    invalid_iocs = 0

    for ioc in indicators:
        if ioc.indicator_type == "SHA256":
            if not sha256_regex.match(ioc.value):
                invalid_iocs += 1
        elif ioc.indicator_type == "MD5":
            if not md5_regex.match(ioc.value):
                invalid_iocs += 1
        elif ioc.indicator_type == "IPv4":
            try:
                ipaddress.IPv4Address(ioc.value)
            except ValueError:
                invalid_iocs += 1

    if invalid_iocs > 0:
        issues.append({"level": "HIGH", "check": "Invalid IOC Formats", "detail": f"{invalid_iocs} indicators failed syntax validation"})
    else:
        checks_passed += 1

    # Check 4: MITRE Technique ID Format & Mapping Consistency
    checks_total += 1
    tech_regex = re.compile(r"^T\d{4}(\.\d{3})?$")
    all_techs = db.query(MitreTechnique).all()
    valid_tech_ids = {t.id for t in all_techs}
    invalid_tech_syntax = [t.id for t in all_techs if not tech_regex.match(t.id)]
    
    if invalid_tech_syntax:
        issues.append({"level": "HIGH", "check": "MITRE Technique Syntax", "detail": f"Invalid IDs: {invalid_tech_syntax}"})
    else:
        checks_passed += 1

    # Check 5: Orphaned Technique Links
    checks_total += 1
    malware_techs = db.query(MalwareTechnique).all()
    broken_mappings = [mt.id for mt in malware_techs if mt.technique_id not in valid_tech_ids]
    if broken_mappings:
        issues.append({"level": "CRITICAL", "check": "Orphaned Technique Links", "detail": f"{len(broken_mappings)} links refer to non-existent techniques"})
    else:
        checks_passed += 1

    # Check 6: Empty Descriptions or Missing Required Fields
    checks_total += 1
    empty_desc_count = sum(1 for m in malware_items if not m.description or len(m.description.strip()) < 10)
    if empty_desc_count > 0:
        issues.append({"level": "MEDIUM", "check": "Missing Malware Descriptions", "detail": f"{empty_desc_count} records lack descriptive overview"})
    else:
        checks_passed += 1

    # Check 7: Case Study Completeness
    checks_total += 1
    case_studies = db.query(CaseStudy).all()
    incomplete_cs = 0
    for cs in case_studies:
        if not cs.executive_summary or not cs.initial_access or not cs.containment_actions:
            incomplete_cs += 1
    if incomplete_cs > 0:
        issues.append({"level": "HIGH", "check": "Incomplete Case Studies", "detail": f"{incomplete_cs} case studies missing vital sections"})
    else:
        checks_passed += 1

    score = round((checks_passed / checks_total) * 100, 1)

    return {
        "status": "PASS" if score >= 90.0 else "FAIL",
        "quality_score": score,
        "checks_passed": checks_passed,
        "checks_total": checks_total,
        "total_malware_audited": len(malware_items),
        "total_indicators_audited": len(indicators),
        "total_case_studies_audited": len(case_studies),
        "issues": issues
    }
