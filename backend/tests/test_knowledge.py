import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

class TestKnowledgeAndResearch:
    def test_taxonomy_hierarchy(self):
        response = client.get("/api/v1/taxonomy")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["total_catalog"] >= 105
        taxonomy = data["taxonomy"]
        assert len(taxonomy) >= 8
        trojan_node = next((n for n in taxonomy if n["id"] == "trojan"), None)
        assert trojan_node is not None
        assert len(trojan_node["children"]) >= 3

    def test_research_dossier_assembly(self):
        response = client.get("/api/v1/research/lockbit")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["malware"]["slug"] == "lockbit"
        kg = data["knowledge_graph"]
        assert "actors" in kg
        assert "campaigns" in kg
        assert "variants" in kg
        assert "techniques" in kg
        assert "indicators" in kg
        assert "vulnerabilities" in kg
        assert "case_studies" in kg
        assert "defensive_rules" in kg
        assert "mitigations" in kg
        assert "telemetry" in kg
        assert data["meta"]["intelligence_tier_count"] == 10

    def test_research_dossier_not_found(self):
        response = client.get("/api/v1/research/nonexistent-malware-strain")
        assert response.status_code == 404

    def test_glossary_endpoints(self):
        response = client.get("/api/v1/knowledge/glossary")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["total"] >= 10
        terms = data["terms"]
        assert any(t["term"].startswith("BYOVD") for t in terms)

    def test_mitigations_endpoints(self):
        response = client.get("/api/v1/knowledge/mitigations")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["total"] >= 6
        phases = [m["phase"] for m in data["guidelines"]]
        assert "Prevention" in phases
        assert "Detection" in phases
        assert "Containment" in phases

    def test_analysis_concepts_endpoints(self):
        response = client.get("/api/v1/knowledge/analysis-concepts")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["total"] >= 4

    def test_telemetry_hub_endpoints(self):
        response = client.get("/api/v1/knowledge/telemetry-hub")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["total"] >= 6
