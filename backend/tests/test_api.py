"""
API and Integration Test Suite for Malware Information Database.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

class TestMalwareApi:

    def test_health_check(self):
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"

    def test_list_malware(self):
        res = client.get("/api/v1/malware?page=1&per_page=10")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["data"]) == 10
        assert data["total"] >= 100

    def test_filter_malware_by_type_and_severity(self):
        res = client.get("/api/v1/malware?type=Ransomware&severity=Critical")
        assert res.status_code == 200
        data = res.json()
        for item in data["data"]:
            assert "Ransomware" in item["primary_type"]
            assert item["severity"] == "Critical"

    def test_get_malware_detail(self):
        res = client.get("/api/v1/malware/lockbit")
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["name"] == "LockBit"
        assert len(data["capabilities"]) > 0
        assert len(data["techniques"]) > 0
        assert len(data["variants"]) > 0
        assert len(data["indicators"]) > 0

    def test_malware_compare(self):
        res = client.get("/api/v1/malware/compare?family_a=lockbit&family_b=wannacry")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["family_a"]["name"] == "LockBit"
        assert data["family_b"]["name"] == "WannaCry"
        assert "overlap" in data

    def test_list_threat_actors(self):
        res = client.get("/api/v1/actors?page=1&per_page=10")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 50
        assert len(data["data"]) == 10

    def test_get_threat_actor_detail(self):
        res = client.get("/api/v1/actors/lazarus-group")
        assert res.status_code == 200
        data = res.json()["data"]
        assert "Lazarus" in data["name"]
        assert data["origin_country"] == "North Korea"
        assert len(data["malware"]) > 0

    def test_attack_matrix(self):
        res = client.get("/api/v1/techniques/matrix")
        assert res.status_code == 200
        data = res.json()
        assert len(data["tactics"]) >= 12
        assert len(data["tactics"][0]["techniques"]) > 0

    def test_indicators_lookup(self):
        # Fetch an indicator first
        list_res = client.get("/api/v1/indicators?page=1&per_page=1")
        assert list_res.status_code == 200
        sample_ioc = list_res.json()["data"][0]["value"]

        lookup_res = client.get(f"/api/v1/indicators/lookup?value={sample_ioc}")
        assert lookup_res.status_code == 200
        data = lookup_res.json()
        assert data["total_matches"] >= 1
        assert data["results"][0]["value"] == sample_ioc

    def test_case_studies(self):
        res = client.get("/api/v1/case-studies")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 15

        detail_res = client.get("/api/v1/case-studies/colonial-pipeline-darkside")
        assert detail_res.status_code == 200
        cs = detail_res.json()["data"]
        assert "Colonial Pipeline" in cs["title"]
        assert len(cs["mitre_attack"]) > 0
        assert len(cs["iocs"]) > 0

    def test_analytics(self):
        res = client.get("/api/v1/analytics")
        assert res.status_code == 200
        data = res.json()
        assert data["metrics"]["total_malware"] >= 100
        assert len(data["malware_by_type"]) > 0
        assert len(data["platforms_distribution"]) > 0
        assert len(data["top_techniques"]) > 0

    def test_global_search(self):
        res = client.get("/api/v1/search?q=lockbit")
        assert res.status_code == 200
        data = res.json()
        assert data["total_matches"] > 0
        assert len(data["results"]["malware"]) > 0

    def test_schema_explorer(self):
        res = client.get("/api/v1/schema")
        assert res.status_code == 200
        data = res.json()
        assert data["total_tables"] >= 15
        assert data["total_relationships"] > 0

    def test_sql_explorer_safe_select(self):
        payload = {"query": "SELECT name, primary_type FROM malware_families LIMIT 5;"}
        res = client.post("/api/v1/sql/execute", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["rows"]) == 5
        assert "name" in data["columns"]

    def test_sql_explorer_blocks_drop(self):
        payload = {"query": "DROP TABLE malware_families;"}
        res = client.post("/api/v1/sql/execute", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "error"
        assert "Mutating" in data["error"] or "Forbidden" in data["error"] or "Prohibited" in data["error"] or "Only" in data["error"]
