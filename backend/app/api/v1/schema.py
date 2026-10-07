from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.core.database import Base

router = APIRouter(prefix="/schema", tags=["Schema Explorer"])

@router.get("", response_model=Dict[str, Any])
def get_database_schema():
    """
    Introspects and returns relational schema metadata:
    tables, columns, types, primary keys, foreign keys, and relations for the interactive ER diagram.
    """
    tables_meta = []
    relationships = []

    for table_name, table in Base.metadata.tables.items():
        columns = []
        for col in table.columns:
            fk_target = None
            if col.foreign_keys:
                fk = next(iter(col.foreign_keys))
                fk_target = f"{fk.column.table.name}.{fk.column.name}"
                relationships.append({
                    "from_table": table_name,
                    "from_column": col.name,
                    "to_table": fk.column.table.name,
                    "to_column": fk.column.name
                })

            columns.append({
                "name": col.name,
                "type": str(col.type),
                "primary_key": col.primary_key,
                "nullable": col.nullable,
                "foreign_key": fk_target
            })

        tables_meta.append({
            "name": table_name,
            "columns": columns,
            "column_count": len(columns)
        })

    return {
        "status": "success",
        "tables": sorted(tables_meta, key=lambda t: t["name"]),
        "relationships": relationships,
        "total_tables": len(tables_meta),
        "total_relationships": len(relationships)
    }
