from pydantic import BaseModel, Field
from typing import List, Optional, Any

class SqlQueryRequest(BaseModel):
    query: str = Field(..., max_length=4000, description="Read-only SELECT SQL query")

class SqlQueryResponse(BaseModel):
    status: str
    error: Optional[str] = None
    columns: List[str] = []
    rows: List[List[Any]] = []
    row_count: int = 0
    execution_time_ms: float = 0.0
    query: str
