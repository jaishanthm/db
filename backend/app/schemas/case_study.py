from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict

class CaseStudySummary(BaseModel):
    id: int
    slug: str
    title: str
    subtitle: str
    malware_id: Optional[int] = None
    malware_name: Optional[str] = None
    malware_slug: Optional[str] = None
    incident_date: str
    target_entity: str
    industry: str
    region: str
    model_config = ConfigDict(from_attributes=True)

class CaseStudyDetail(BaseModel):
    id: int
    slug: str
    title: str
    subtitle: str
    malware_id: Optional[int] = None
    malware_name: Optional[str] = None
    malware_slug: Optional[str] = None
    campaign_id: Optional[int] = None
    campaign_name: Optional[str] = None
    incident_date: str
    target_entity: str
    industry: str
    region: str
    executive_summary: str
    threat_context: str
    initial_access: str
    execution_flow: str
    persistence_mechanism: str
    privilege_escalation: str
    defense_evasion: str
    lateral_movement: str
    command_and_control: str
    exfiltration_impact: str
    detection_opportunities: str
    containment_actions: str
    lessons_learned: str
    mitre_attack: List[Dict[str, Any]] = []
    iocs: List[Dict[str, Any]] = []
    references: List[str] = []
    model_config = ConfigDict(from_attributes=True)
