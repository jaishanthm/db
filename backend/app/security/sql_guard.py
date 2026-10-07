"""
AST-based SQL Query Security Validator for the Malware Information Database.
Enforces defense-in-depth security:
1. Length and character sanity checks
2. Exact AST parsing via sqlglot
3. Single statement restriction
4. Read-only SELECT / WITH CTE validation
5. AST node walking to forbid any DDL, DML, TCL, or administrative statements
6. Rejection of dangerous database functions (e.g. load_extension, file I/O)
7. Automatic LIMIT clamping
"""

import re
from typing import Tuple, Optional
import sqlglot
from sqlglot import exp
from backend.app.core.config import SQL_MAX_ROWS, SQL_MAX_QUERY_LENGTH

FORBIDDEN_KEYWORDS = {
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "REPLACE",
    "TRUNCATE", "PRAGMA", "ATTACH", "DETACH", "VACUUM", "REINDEX",
    "GRANT", "REVOKE", "SAVEPOINT", "RELEASE", "BEGIN", "COMMIT",
    "ROLLBACK", "EXEC", "EXECUTE", "LOAD_EXTENSION", "INTO", "OUTFILE",
    "DUMPFILE", "PG_SLEEP", "BENCHMARK", "SLEEP"
}

FORBIDDEN_AST_TYPES = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Alter,
    exp.Create,
    exp.Command,
    exp.Transaction,
    exp.Commit,
    exp.Rollback,
    exp.Pragma,
)

def validate_and_sanitize_sql(raw_query: str) -> Tuple[bool, str, Optional[str]]:
    """
    Validates a SQL query using AST parsing.
    Returns:
        (is_valid, error_message, sanitized_query_or_none)
    """
    if not raw_query or not raw_query.strip():
        return False, "Query cannot be empty.", None

    query = raw_query.strip()

    # Layer 1: Query length protection
    if len(query) > SQL_MAX_QUERY_LENGTH:
        return False, f"Query exceeds maximum allowed length of {SQL_MAX_QUERY_LENGTH} characters.", None

    # Layer 2: Reject SQL comments to eliminate comment-based obfuscation tricks
    if re.search(r'(--|/\*|\*/)', query):
        return False, "Security Violation: SQL comments (-- or /* */) are prohibited in SQL Explorer.", None

    # Layer 3: Reject multiple statements separated by semicolons
    # Strip single trailing semicolon
    clean = query.rstrip(";").strip()
    if ";" in clean:
        return False, "Multiple SQL statements are strictly forbidden.", None

    # Layer 3: AST Parsing
    try:
        parsed_statements = sqlglot.parse(clean, read="sqlite")
    except Exception as e:
        return False, f"SQL Syntax Error: Unable to parse query AST: {str(e)}", None

    if not parsed_statements:
        return False, "No valid SQL statement found.", None

    if len(parsed_statements) > 1:
        return False, "Multiple statements detected in AST. Only a single SELECT query is permitted.", None

    statement = parsed_statements[0]

    # Layer 4: Statement root type verification
    is_select = isinstance(statement, (exp.Select, exp.Union))
    is_cte_select = False

    if isinstance(statement, exp.Select):
        is_select = True
    elif isinstance(statement, exp.With):
        # A WITH query must culminate in a SELECT
        if isinstance(statement.this, (exp.Select, exp.Union)):
            is_cte_select = True
        else:
            return False, "WITH (CTE) statement must terminate in a SELECT clause.", None
    elif isinstance(statement, exp.Union):
        is_select = True
    else:
        return False, f"Forbidden statement type: {statement.__class__.__name__}. Only read-only SELECT queries are allowed.", None

    if not (is_select or is_cte_select):
        return False, "Only read-only SELECT or WITH ... SELECT queries are permitted.", None

    # Layer 5: AST Walk for dangerous nodes
    for node in statement.walk():
        if isinstance(node, FORBIDDEN_AST_TYPES):
            return False, f"Security Violation: Mutating AST node '{node.__class__.__name__}' is prohibited.", None

        # Check for function calls
        if isinstance(node, exp.Anonymous):
            func_name = node.name.upper()
            if func_name in FORBIDDEN_KEYWORDS:
                return False, f"Security Violation: Prohibited function '{func_name}' detected.", None

        if isinstance(node, exp.Command):
            return False, "Security Violation: Administrative commands are strictly prohibited.", None

    # Layer 6: Keyword token verification outside literals
    sql_text = statement.sql()
    # Check for disallowed functions like load_extension
    if re.search(r'\b(load_extension|pg_sleep|sleep|benchmark)\b', sql_text, re.IGNORECASE):
        return False, "Security Violation: Disallowed function detected in query.", None

    # Layer 7: Safe limit enforcement
    # If the user didn't specify a limit, or if the limit exceeds SQL_MAX_ROWS, clamp it
    has_limit = False
    for node in statement.find_all(exp.Limit):
        has_limit = True
        # Clamp if numeric
        if isinstance(node.expression, exp.Literal):
            try:
                val = int(node.expression.this)
                if val > SQL_MAX_ROWS:
                    node.set("expression", exp.Literal.number(SQL_MAX_ROWS))
            except ValueError:
                pass

    if not has_limit:
        # Wrap or add limit
        if isinstance(statement, exp.Select):
            statement = statement.limit(SQL_MAX_ROWS)
        else:
            # Append limit to CTE or Union
            statement = sqlglot.parse_one(f"SELECT * FROM ({statement.sql()}) AS subq LIMIT {SQL_MAX_ROWS}")

    final_sql = statement.sql()
    return True, "", final_sql
