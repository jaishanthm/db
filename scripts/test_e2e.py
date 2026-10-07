#!/usr/bin/env python3
"""
Comprehensive End-to-End (E2E) Test Suite for Malware Information Database.
Simulates real SOC analyst investigation workflows, verifies every API endpoint,
tests security defenses against adversarial SQL injections, and benchmarks latency.
"""

import sys
import time
import json
import urllib.request
import urllib.error

BACKEND_BASE = "http://127.0.0.1:8000"
FRONTEND_PROXY_BASE = "http://localhost:5173/api/v1"

passed_steps = 0
failed_steps = 0
benchmarks = []

def log_step(name: str):
    print(f"\n[E2E STEP] {name}...")

def record_pass(detail: str):
    global passed_steps
    passed_steps += 1
    print(f"  [+] PASS: {detail}")

def record_fail(detail: str):
    global failed_steps
    failed_steps += 1
    print(f"  [-] FAIL: {detail}")

def http_get(url: str):
    start = time.perf_counter()
    req = urllib.request.Request(url, headers={"User-Agent": "E2E-Automated-Tester"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            data = json.loads(response.read().decode())
            return response.status, data, latency_ms
    except urllib.error.HTTPError as e:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        try:
            data = json.loads(e.read().decode())
        except Exception:
            data = {"error": str(e)}
        return e.code, data, latency_ms

def http_post(url: str, payload: dict):
    start = time.perf_counter()
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "E2E-Automated-Tester"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            data = json.loads(response.read().decode())
            return response.status, data, latency_ms
    except urllib.error.HTTPError as e:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        try:
            data = json.loads(e.read().decode())
        except Exception:
            data = {"error": str(e)}
        return e.code, data, latency_ms

def run_e2e_tests():
    print("=" * 70)
    print("STARTING END-TO-END (E2E) VERIFICATION & INVESTIGATION WORKFLOWS")
    print(f"Backend Target: {BACKEND_BASE}")
    print(f"Frontend Target: {FRONTEND_PROXY_BASE}")
    print("=" * 70)

    # 1. Health Probe
    log_step("1. Health Probe & Database Status")
    status, data, lat = http_get(f"{BACKEND_BASE}/health")
    if status == 200 and data.get("status") == "healthy" and data.get("database") == "connected":
        record_pass(f"System healthy, database connected ({lat}ms)")
    else:
        record_fail(f"Health probe degraded: {data}")
    benchmarks.append(("Health Check", lat))

    # 2. Global Search (Ctrl+K simulation)
    log_step("2. Global Cross-Entity Search (Simulating Ctrl+K for 'lockbit')")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/search?q=lockbit")
    res = data.get("results", {})
    if status == 200 and data.get("total_matches", 0) > 0 and len(res.get("malware", [])) > 0:
        record_pass(f"Search returned {data['total_matches']} total matches across {len(res['malware'])} malware and {len(res['indicators'])} IOCs ({lat}ms)")
    else:
        record_fail(f"Global search failed: {data}")
    benchmarks.append(("Global Search", lat))

    # 3. Malware Catalog Filtering
    log_step("3. Malware Catalog Filtering (Type=Ransomware, Severity=Critical)")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/malware?type=Ransomware&severity=Critical&per_page=5")
    items = data.get("data", [])
    if status == 200 and len(items) > 0 and all(i["severity"] == "Critical" for i in items):
        record_pass(f"Catalog filtered {data['total']} critical ransomware strains, retrieved {len(items)} items ({lat}ms)")
    else:
        record_fail(f"Malware catalog filter failed: {data}")
    benchmarks.append(("Malware Filter", lat))

    # 4. Detailed Malware Dossier Inspection (LockBit)
    log_step("4. Deep Malware Dossier (LockBit Profile Inspection)")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/malware/lockbit")
    dossier = data.get("data", {})
    has_caps = len(dossier.get("capabilities", [])) > 0
    has_techs = len(dossier.get("techniques", [])) > 0
    has_rules = len(dossier.get("defensive_rules", [])) > 0
    has_iocs = len(dossier.get("indicators", [])) > 0
    if status == 200 and has_caps and has_techs and has_rules and has_iocs:
        record_pass(f"Retrieved LockBit dossier: {len(dossier['capabilities'])} capabilities, {len(dossier['techniques'])} ATT&CK techniques, {len(dossier['defensive_rules'])} defensive rules, {len(dossier['indicators'])} IOCs ({lat}ms)")
    else:
        record_fail(f"Dossier incomplete: {dossier.keys()}")
    benchmarks.append(("Malware Dossier", lat))

    # 5. Side-by-Side Malware Comparison (LockBit vs WannaCry)
    log_step("5. Comparative Threat Analysis (LockBit vs WannaCry)")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/malware/compare?family_a=lockbit&family_b=wannacry")
    overlap = data.get("overlap", {})
    if status == 200 and "capabilities" in overlap and "techniques" in overlap:
        record_pass(f"Comparison calculated: {len(overlap['capabilities'])} shared capabilities, {len(overlap['techniques'])} shared techniques ({lat}ms)")
    else:
        record_fail(f"Comparison failed: {data}")
    benchmarks.append(("Malware Compare", lat))

    # 6. Threat Actor Intelligence (Lazarus Group)
    log_step("6. Threat Actor Dossier (Lazarus Group)")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/actors/lazarus-group")
    actor = data.get("data", {})
    if status == 200 and actor.get("origin_country") == "North Korea" and len(actor.get("malware", [])) > 0:
        record_pass(f"Actor Lazarus Group verified: {actor['origin_country']}, {len(actor['malware'])} linked malware strains ({lat}ms)")
    else:
        record_fail(f"Actor lookup failed: {data}")
    benchmarks.append(("Actor Dossier", lat))

    # 7. Campaign Operations Intelligence
    log_step("7. Campaign Operations Intelligence")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/campaigns?per_page=5")
    camps = data.get("data", [])
    if status == 200 and len(camps) > 0 and camps[0].get("name"):
        camp_slug = camps[0]["slug"]
        c_status, c_data, c_lat = http_get(f"{BACKEND_BASE}/api/v1/campaigns/{camp_slug}")
        if c_status == 200 and len(c_data.get("data", {}).get("malware", [])) > 0:
            record_pass(f"Campaign '{camp_slug}' retrieved with linked malware and actors ({c_lat}ms)")
        else:
            record_fail(f"Campaign detail failed: {c_data}")
    else:
        record_fail(f"Campaign list failed: {data}")
    benchmarks.append(("Campaign Intel", lat))

    # 8. Indicator of Compromise (IOC) Reverse Lookup
    log_step("8. Reverse Indicator of Compromise (IOC) Hash Lookup")
    # Grab an indicator first
    _, ind_data, _ = http_get(f"{BACKEND_BASE}/api/v1/indicators?type=SHA256&per_page=1")
    sample_sha = ind_data["data"][0]["value"]
    status, lookup_data, lat = http_get(f"{BACKEND_BASE}/api/v1/indicators/lookup?value={sample_sha}")
    if status == 200 and lookup_data.get("total_matches", 0) >= 1:
        matched_malware = lookup_data["results"][0]["malware_name"]
        record_pass(f"IOC '{sample_sha[:16]}...' resolved to attributed malware: {matched_malware} ({lat}ms)")
    else:
        record_fail(f"IOC lookup failed: {lookup_data}")
    benchmarks.append(("IOC Hash Lookup", lat))

    # 9. MITRE ATT&CK Matrix & Technique Exploration
    log_step("9. MITRE ATT&CK Enterprise Matrix & Technique Exploration")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/techniques/matrix")
    tactics = data.get("tactics", [])
    if status == 200 and len(tactics) >= 12:
        # Check technique detail for T1059.001 (PowerShell)
        t_status, t_data, t_lat = http_get(f"{BACKEND_BASE}/api/v1/techniques/T1059.001")
        tech_detail = t_data.get("data", {})
        if t_status == 200 and len(tech_detail.get("malware", [])) > 0:
            record_pass(f"ATT&CK Matrix verified with {len(tactics)} tactics; T1059.001 links to {len(tech_detail['malware'])} weaponizing malware strains ({t_lat}ms)")
        else:
            record_fail(f"Technique detail failed: {t_data}")
    else:
        record_fail(f"Matrix fetch failed: {data}")
    benchmarks.append(("ATT&CK Matrix", lat))

    # 10. Interactive Relationship Topology Graph
    log_step("10. Relationship Topology Graph Generation")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/graph?focus_malware=lockbit")
    nodes = data.get("nodes", [])
    links = data.get("links", [])
    if status == 200 and len(nodes) > 0 and len(links) > 0:
        record_pass(f"Graph topology generated with {len(nodes)} nodes and {len(links)} relationship edges ({lat}ms)")
    else:
        record_fail(f"Graph generation failed: {data}")
    benchmarks.append(("Relationship Graph", lat))

    # 11. Technical Incident Case Studies
    log_step("11. Forensic Case Study Deep Breakdown (Colonial Pipeline)")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/case-studies/colonial-pipeline-darkside")
    cs = data.get("data", {})
    has_phases = cs.get("initial_access") and cs.get("containment_actions") and cs.get("lessons_learned")
    if status == 200 and has_phases and len(cs.get("mitre_attack", [])) > 0:
        record_pass(f"Case study loaded: {len(cs['mitre_attack'])} ATT&CK mappings, {len(cs['iocs'])} forensic IOCs ({lat}ms)")
    else:
        record_fail(f"Case study failed: {data}")
    benchmarks.append(("Case Study Dossier", lat))

    # 12. Relational Schema Explorer
    log_step("12. Relational Schema Explorer & Foreign Key Mappings")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/schema")
    tables = data.get("tables", [])
    relationships = data.get("relationships", [])
    if status == 200 and len(tables) >= 15 and len(relationships) >= 10:
        record_pass(f"Schema introspection verified: {len(tables)} tables, {len(relationships)} foreign key constraints ({lat}ms)")
    else:
        record_fail(f"Schema introspection failed: {data}")
    benchmarks.append(("Schema Introspection", lat))

    # 13. Safe SQL Explorer: Read-Only Aggregation Execution
    log_step("13. Safe SQL Explorer: Valid Query Execution")
    valid_query = {
        "query": "SELECT primary_type, COUNT(*) as count FROM malware_families GROUP BY primary_type ORDER BY count DESC LIMIT 5;"
    }
    status, data, lat = http_post(f"{BACKEND_BASE}/api/v1/sql/execute", valid_query)
    if status == 200 and data.get("status") == "success" and len(data.get("rows", [])) == 5:
        record_pass(f"Executed analytical aggregation query in {data['execution_time_ms']}ms, returned {data['row_count']} rows ({lat}ms)")
    else:
        record_fail(f"SQL execution failed: {data}")
    benchmarks.append(("Safe SQL Execution", lat))

    # 14. Adversarial SQL Security Testing (Trapping All Attacks)
    log_step("14. Adversarial SQL Security Testing: Verification of Attack Defense")
    attack_payloads = [
        ("DROP TABLE attack", {"query": "DROP TABLE malware_families;"}),
        ("DELETE FROM mutation", {"query": "DELETE FROM malware_families;"}),
        ("UPDATE mutation", {"query": "UPDATE malware_families SET severity = 'Low';"}),
        ("INSERT mutation", {"query": "INSERT INTO malware_families (name) VALUES ('Hacked');"}),
        ("ATTACH DATABASE file I/O", {"query": "ATTACH DATABASE '/tmp/evil.db' AS evil;"}),
        ("PRAGMA inspection", {"query": "PRAGMA table_info(malware_families);"}),
        ("Multi-statement injection", {"query": "SELECT 1; DROP TABLE malware_families;"}),
        ("Comment evasion trick", {"query": "SELECT * FROM malware_families /* DROP TABLE malware_families */"}),
    ]
    all_attacks_blocked = True
    for test_name, attack in attack_payloads:
        status, data, _ = http_post(f"{BACKEND_BASE}/api/v1/sql/execute", attack)
        if data.get("status") == "error" and data.get("error"):
            print(f"      [✓] Blocked {test_name}: \"{data['error'][:60]}...\"")
        else:
            record_fail(f"VULNERABILITY DETECTED! Failed to block {test_name}: {data}")
            all_attacks_blocked = False

    if all_attacks_blocked:
        record_pass("All 8 adversarial SQL injection & mutation attacks were strictly rejected by AST guard!")

    # 15. Live Data Quality Engine Audit
    log_step("15. Live Data Quality Engine Forensic Audit")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/quality-report")
    if status == 200 and data.get("status") == "PASS" and data.get("quality_score") == 100.0:
        record_pass(f"Data quality score: 100.0% ({data['checks_passed']}/{data['checks_total']} checks passed, 0 defects) ({lat}ms)")
    else:
        record_fail(f"Data quality audit reported defects: {data}")
    benchmarks.append(("Data Quality Audit", lat))

    # 16. Frontend-Backend Proxy End-to-End Probe
    log_step("16. Frontend Dev Server Reverse Proxy End-to-End Connectivity")
    proxy_status, proxy_data, proxy_lat = http_get(f"{FRONTEND_PROXY_BASE}/malware?per_page=1")
    if proxy_status == 200 and proxy_data.get("status") == "success" and len(proxy_data.get("data", [])) == 1:
        record_pass(f"Frontend proxy (port 5173 -> 8000) resolved cleanly ({proxy_lat}ms)")
    else:
        record_fail(f"Frontend proxy check failed: status {proxy_status}")
    benchmarks.append(("Frontend Proxy E2E", proxy_lat))

    # 17. Research Mode: 10-Tier Intelligence Dossier Assembly
    log_step("17. Research Mode Multi-Tier Intelligence Dossier Assembly")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/research/lockbit")
    kg = data.get("knowledge_graph", {})
    if (status == 200 and data.get("status") == "success" and
        data.get("malware", {}).get("name") == "LockBit" and
        len(kg.get("actors", [])) > 0 and
        len(kg.get("techniques", [])) > 0 and
        len(kg.get("iocs", [])) > 0 and
        len(kg.get("detection_rules", [])) > 0 and
        len(kg.get("mitigations", [])) > 0):
        record_pass(f"Research Mode generated complete 10-tier dossier for LockBit: {len(kg['actors'])} actors, {len(kg['campaigns'])} campaigns, {len(kg['techniques'])} techniques, {len(kg['iocs'])} IOCs, {len(kg['detection_rules'])} detection rules ({lat}ms)")
    else:
        record_fail(f"Research Mode dossier assembly failed: {data}")
    benchmarks.append(("Research Mode Dossier", lat))

    # 18. Malware Classification Taxonomy Hierarchy
    log_step("18. Malware Classification Taxonomy Hierarchy Tree")
    status, data, lat = http_get(f"{BACKEND_BASE}/api/v1/taxonomy")
    tax = data.get("taxonomy", [])
    has_trojan_branch = any(t.get("id") == "trojan" and len(t.get("children", [])) > 0 for t in tax)
    if status == 200 and data.get("total_catalog") >= 105 and len(tax) >= 8 and has_trojan_branch:
        record_pass(f"Taxonomy hierarchy verified: {len(tax)} root categories, {data['total_catalog']} classified families ({lat}ms)")
    else:
        record_fail(f"Taxonomy hierarchy test failed: {data}")
    benchmarks.append(("Taxonomy Hierarchy", lat))

    # 19. Security Knowledge Base: Glossary, Concepts, Mitigations, Telemetry
    log_step("19. Security Knowledge Base (Glossary, Concepts, Mitigations, Telemetry)")
    g_stat, g_data, _ = http_get(f"{BACKEND_BASE}/api/v1/knowledge/glossary")
    m_stat, m_data, _ = http_get(f"{BACKEND_BASE}/api/v1/knowledge/mitigations")
    c_stat, c_data, _ = http_get(f"{BACKEND_BASE}/api/v1/knowledge/analysis-concepts")
    t_stat, t_data, lat = http_get(f"{BACKEND_BASE}/api/v1/knowledge/telemetry-hub")

    if (g_stat == 200 and g_data.get("total", 0) >= 10 and
        m_stat == 200 and m_data.get("total", 0) >= 5 and
        c_stat == 200 and c_data.get("total", 0) >= 4 and
        t_stat == 200 and t_data.get("total", 0) >= 5):
        record_pass(f"Knowledge Base operational: {g_data['total']} glossary terms, {c_data['total']} analysis concepts, {m_data['total']} CISA mitigations, {t_data['total']} telemetry sources ({lat}ms)")
    else:
        record_fail("Knowledge Base endpoint verification failed")
    benchmarks.append(("Knowledge Base Hub", lat))

    # Summary
    print("\n" + "=" * 70)
    print("E2E VERIFICATION TEST SUMMARY")
    print(f"Total Steps Tested:  {passed_steps + failed_steps}")
    print(f"Total Steps Passed:  {passed_steps}")
    print(f"Total Steps Failed:  {failed_steps}")
    print(f"Success Rate:        {round((passed_steps / (passed_steps + failed_steps)) * 100, 1)}%")
    print("=" * 70)

    print("\nLatency Benchmarks:")
    for name, lat in benchmarks:
        print(f"  • {name:<26}: {lat:>6.2f} ms")
    print("=" * 70)

    if failed_steps > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_e2e_tests()
