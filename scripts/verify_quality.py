#!/usr/bin/env python3
import sys
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.core.database import SessionLocal
from backend.app.services.data_quality import run_data_quality_audit

def main():
    db = SessionLocal()
    try:
        report = run_data_quality_audit(db)
        print("\n================ DATA QUALITY AUDIT REPORT ================")
        print(f"Status:               {report['status']}")
        print(f"Quality Score:        {report['quality_score']}%")
        print(f"Passed Checks:        {report['checks_passed']} / {report['checks_total']}")
        print(f"Malware Families:     {report['total_malware_audited']}")
        print(f"Indicators Audited:   {report['total_indicators_audited']}")
        print(f"Case Studies Audited: {report['total_case_studies_audited']}")
        if report["issues"]:
            print("\nIssues Discovered:")
            for issue in report["issues"]:
                print(f"  [{issue['level']}] {issue['check']}: {issue['detail']}")
        else:
            print("\n[+] Zero data quality defects found. All checks passed!")
        print("===========================================================\n")
    finally:
        db.close()

if __name__ == "__main__":
    main()
