from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.schemas.sql_explorer import SqlQueryRequest, SqlQueryResponse
from backend.app.services.sql_service import execute_safe_query

router = APIRouter(prefix="/sql", tags=["SQL Explorer"])

SAMPLE_QUERIES = [
    {
        "title": "Top 10 Most Severe Malware Families",
        "description": "Lists the top critical and high severity malware families ordered by first observation date.",
        "sql": "SELECT name, primary_type, severity, first_seen, status FROM malware_families WHERE severity = 'Critical' ORDER BY first_seen DESC LIMIT 10;"
    },
    {
        "title": "Malware Families Count by Primary Type",
        "description": "Aggregates malware family volume by primary categorization.",
        "sql": "SELECT primary_type, COUNT(*) AS total_count FROM malware_families GROUP BY primary_type ORDER BY total_count DESC;"
    },
    {
        "title": "Threat Actors with Origin & Associated Malware Count",
        "description": "Shows active threat actors and how many malware strains they deploy.",
        "sql": "SELECT ta.name, ta.origin_country, ta.motivation, COUNT(am.malware_id) AS malware_count FROM threat_actors ta LEFT JOIN actor_malware am ON ta.id = am.actor_id GROUP BY ta.id ORDER BY malware_count DESC LIMIT 15;"
    },
    {
        "title": "Top MITRE ATT&CK Techniques Employed by Malware",
        "description": "Examines which attack techniques are most frequently weaponized across the corpus.",
        "sql": "SELECT mt.id, mt.name, mt.tactic_name, COUNT(ml.malware_id) AS weaponized_count FROM mitre_techniques mt JOIN malware_techniques ml ON mt.id = ml.technique_id GROUP BY mt.id ORDER BY weaponized_count DESC LIMIT 12;"
    },
    {
        "title": "Active Network and Hash Indicators for Ransomware",
        "description": "Extracts active IOCs for confirmed ransomware families.",
        "sql": "SELECT mf.name AS malware_name, i.indicator_type, i.value, i.severity FROM indicators i JOIN malware_families mf ON i.malware_id = mf.id WHERE mf.primary_type = 'Ransomware' AND i.status = 'Active' LIMIT 20;"
    }
]

@router.get("/samples", response_model=Dict[str, Any])
def get_sample_queries():
    return {
        "status": "success",
        "samples": SAMPLE_QUERIES
    }

@router.post("/execute", response_model=SqlQueryResponse)
def execute_sql_query(payload: SqlQueryRequest):
    result = execute_safe_query(payload.query)
    return SqlQueryResponse(**result)
