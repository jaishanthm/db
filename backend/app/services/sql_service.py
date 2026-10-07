import time
from typing import Dict, Any, List
from sqlalchemy import text
from backend.app.core.database import ro_engine
from backend.app.core.config import SQL_TIMEOUT_SECONDS
from backend.app.security.sql_guard import validate_and_sanitize_sql

def execute_safe_query(raw_query: str) -> Dict[str, Any]:
    """
    Validates and executes a user query against the read-only connection.
    Returns structured results including column names, rows, execution time, and status.
    """
    is_valid, err_msg, sanitized_sql = validate_and_sanitize_sql(raw_query)
    if not is_valid:
        return {
            "status": "error",
            "error": err_msg,
            "columns": [],
            "rows": [],
            "row_count": 0,
            "execution_time_ms": 0.0,
            "query": raw_query
        }

    start_time = time.perf_counter()
    try:
        with ro_engine.connect() as conn:
            # Enforce read-only transaction or timeout where available
            result = conn.execute(text(sanitized_sql))
            columns = list(result.keys()) if result.returns_rows else []
            raw_rows = result.fetchall() if result.returns_rows else []
            
            # Convert rows to serializable dicts/lists
            rows: List[List[Any]] = []
            for row in raw_rows:
                row_data = []
                for val in row:
                    if isinstance(val, (bytes, bytearray)):
                        row_data.append(val.hex())
                    else:
                        row_data.append(val)
                rows.append(row_data)

            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

            return {
                "status": "success",
                "error": None,
                "columns": columns,
                "rows": rows,
                "row_count": len(rows),
                "execution_time_ms": duration_ms,
                "query": sanitized_sql
            }
    except Exception as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "error",
            "error": f"Execution Error: {str(e)}",
            "columns": [],
            "rows": [],
            "row_count": 0,
            "execution_time_ms": duration_ms,
            "query": sanitized_sql or raw_query
        }
