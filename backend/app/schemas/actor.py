from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ActorMalwareBrief(BaseModel):
    malware_id: int
    malware_slug: str
    malware_name: str
    primary_type: str
    role: str

class ActorCampaignBrief(BaseModel):
    campaign_id: int
    campaign_slug: str
    campaign_name: str
    start_date: str
    attribution_confidence: str

class ThreatActorSummary(BaseModel):
    id: int
    slug: str
    name: str
    aliases: List[str]
    origin_country: str
    motivation: str
    first_seen: str
    status: str
    sophistication: str
    target_sectors: List[str]
    target_countries: List[str]
    malware_count: int
    campaign_count: int
    model_config = ConfigDict(from_attributes=True)

class ThreatActorDetail(BaseModel):
    id: int
    slug: str
    name: str
    aliases: List[str]
    origin_country: str
    motivation: str
    first_seen: str
    status: str
    sophistication: str
    description: str
    source: str
    target_sectors: List[str]
    target_countries: List[str]
    malware: List[ActorMalwareBrief]
    campaigns: List[ActorCampaignBrief]
    model_config = ConfigDict(from_attributes=True)
