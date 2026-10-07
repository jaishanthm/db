from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class CaseStudy(Base):
    __tablename__ = "case_studies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    title = Column(String(256), nullable=False)
    subtitle = Column(String(256), nullable=False)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="SET NULL"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    incident_date = Column(String(32), index=True, nullable=False)
    target_entity = Column(String(128), nullable=False)
    industry = Column(String(64), nullable=False)
    region = Column(String(64), default="North America / Global")
    
    # Comprehensive Incident Breakdown Sections
    executive_summary = Column(Text, nullable=False)
    threat_context = Column(Text, nullable=False)
    initial_access = Column(Text, nullable=False)
    execution_flow = Column(Text, nullable=False)
    persistence_mechanism = Column(Text, nullable=False)
    privilege_escalation = Column(Text, nullable=False)
    defense_evasion = Column(Text, nullable=False)
    lateral_movement = Column(Text, nullable=False)
    command_and_control = Column(Text, nullable=False)
    exfiltration_impact = Column(Text, nullable=False)
    detection_opportunities = Column(Text, nullable=False)
    containment_actions = Column(Text, nullable=False)
    lessons_learned = Column(Text, nullable=False)
    
    mitre_attack_json = Column(Text, default="[]")  # JSON string of mapped techniques
    iocs_json = Column(Text, default="[]")  # JSON string of IOCs
    references_json = Column(Text, default="[]")  # JSON string of external links
    created_at = Column(DateTime, default=datetime.utcnow)

    malware = relationship("MalwareFamily", back_populates="case_studies")
    campaign = relationship("Campaign", back_populates="case_studies")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    event_date = Column(String(32), index=True, nullable=False)
    event_year = Column(Integer, index=True, nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    event_type = Column(String(64), default="Discovery")  # Discovery, Variant, Campaign, Takedown, Evolution
    significance = Column(String(32), default="High")  # Critical, High, Medium

    malware = relationship("MalwareFamily", back_populates="timeline_events")
