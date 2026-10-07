from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class IndicatorSummary(BaseModel):
    id: int
    malware_id: int
    malware_name: str
    malware_slug: str
    indicator_type: str
    value: str
    confidence: str
    severity: str
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    status: str
    source: str
    model_config = ConfigDict(from_attributes=True)

class IndicatorLookupResponse(BaseModel):
    query: str
    matched_type: Optional[str] = None
    results: List[IndicatorSummary]
    total: int
