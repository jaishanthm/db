"""
Security Test Suite: Validating that the SQL Guard strictly blocks all malicious and mutating SQL attempts.
"""

import pytest
from backend.app.security.sql_guard import validate_and_sanitize_sql
from backend.app.services.sql_service import execute_safe_query

class TestSqlSecurityGuard:

    def test_valid_select_queries(self):
        valid_queries = [
            "SELECT name, severity FROM malware_families LIMIT 10",
            "SELECT * FROM threat_actors WHERE origin_country = 'Russia'",
            "SELECT count(*) FROM indicators",
            "SELECT mf.name, i.value FROM malware_families mf JOIN indicators i ON mf.id = i.malware_id",
            "WITH ranked AS (SELECT name, severity FROM malware_families) SELECT * FROM ranked LIMIT 5;",
        ]
        for q in valid_queries:
            is_valid, err, sanitized = validate_and_sanitize_sql(q)
            assert is_valid is True, f"Expected query to be valid: {q}. Error: {err}"
            assert sanitized is not None
            assert "LIMIT" in sanitized

    @pytest.mark.parametrize("attack_query", [
        # DDL Attacks
        "DROP TABLE malware_families;",
        "DROP DATABASE test;",
        "ALTER TABLE malware_families ADD COLUMN pwned TEXT;",
        "CREATE TABLE backdoor (id INT);",
        "TRUNCATE TABLE indicators;",
        # DML Mutation Attacks
        "DELETE FROM malware_families;",
        "UPDATE malware_families SET severity = 'Low';",
        "INSERT INTO malware_families (name) VALUES ('Hacked');",
        "REPLACE INTO threat_actors (id, name) VALUES (1, 'Evil');",
        # SQLite Specific & Dangerous Pragma Attacks
        "ATTACH DATABASE '/tmp/evil.db' AS evil;",
        "DETACH DATABASE evil;",
        "PRAGMA table_info(malware_families);",
        "SELECT load_extension('evil.so');",
        # Multi-statement injection
        "SELECT 1; DROP TABLE malware_families;",
        "SELECT * FROM threat_actors; DELETE FROM threat_actors;",
        # Comment obfuscation tricks
        "SELECT 1; -- DROP TABLE malware_families",
        "SELECT * FROM malware_families /* DROP TABLE malware_families */",
        # Non-select statements
        "VACUUM;",
        "REINDEX;",
        "BEGIN TRANSACTION;",
        "COMMIT;",
    ])
    def test_mutation_and_attack_queries_blocked(self, attack_query):
        is_valid, err, sanitized = validate_and_sanitize_sql(attack_query)
        assert is_valid is False or sanitized is None, f"Attack query should have been rejected: {attack_query}"
        
        # Also test execution service
        result = execute_safe_query(attack_query)
        assert result["status"] == "error", f"Execute service did not fail for: {attack_query}"
        assert result["error"] is not None

    def test_limit_clamping(self):
        # Even if user requests 50,000 rows, guard clamps to SQL_MAX_ROWS (300)
        query = "SELECT * FROM indicators LIMIT 50000;"
        is_valid, err, sanitized = validate_and_sanitize_sql(query)
        assert is_valid is True
        assert "LIMIT 300" in sanitized or "limit 300" in sanitized.lower()
