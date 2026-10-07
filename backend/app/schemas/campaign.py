from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class CampaignMalwareBrief(BaseModel):
    malware_id: int
    malware_slug: str
    malware_name: str
    primary_type: str
    deployment_role: str

class CampaignActorBrief(BaseModel):
    actor_id: int
    actor_slug: str
    actor_name: str
    attribution_confidence: str

class CampaignSummary(BaseModel):
    id: int
    slug: str
    name: str
    start_date: str
    end_date: Optional[str] = None
    status: str
    objective: str
    target_industries: List[str]
    target_regions: List[str]
    confidence: str
    malware_count: int
    actor_count: int
    model_config = ConfigDict(from_attributes=True)

class CampaignDetail(BaseModel):
    id: int
    slug: str
    name: str
    start_date: str
    end_date: Optional[str] = None
    status: str
    objective: str
    description: str
    impact_summary: str
    target_industries: List[str]
    target_regions: List[str]
    confidence: str
    source: str
    malware: List[CampaignMalwareBrief]
    actors: List[CampaignActorBrief]
    model_config = ConfigDict(from_attributes=True)
