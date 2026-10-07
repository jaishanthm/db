from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(128), index=True, nullable=False)
    start_date = Column(String(32), index=True, nullable=False)
    end_date = Column(String(32), nullable=True)  # null or "Ongoing"
    status = Column(String(32), default="Concluded")  # Active, Concluded, Intermittent
    objective = Column(String(128), default="Ransomware Extortion / Data Theft")
    target_industries = Column(Text, default="[]")  # JSON array
    target_regions = Column(Text, default="[]")  # JSON array
    description = Column(Text, nullable=False)
    impact_summary = Column(Text, nullable=False)
    confidence = Column(String(32), default="High")
    source = Column(String(256), default="CISA / ENISA / Vendor Intel")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    malware_links = relationship("CampaignMalware", back_populates="campaign", cascade="all, delete-orphan")
    actors = relationship("CampaignActor", back_populates="campaign", cascade="all, delete-orphan")
    case_studies = relationship("CaseStudy", back_populates="campaign")


class CampaignMalware(Base):
    __tablename__ = "campaign_malware"

    id = Column(Integer, primary_key=True, autoincrement=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), index=True, nullable=False)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    deployment_role = Column(String(64), default="Primary Payload")  # Initial Dropper, Secondary Payload, C2 Agent

    campaign = relationship("Campaign", back_populates="malware_links")
    malware = relationship("MalwareFamily", back_populates="campaigns")


class CampaignActor(Base):
    __tablename__ = "campaign_actors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), index=True, nullable=False)
    actor_id = Column(Integer, ForeignKey("threat_actors.id", ondelete="CASCADE"), index=True, nullable=False)
    attribution_confidence = Column(String(32), default="High")  # Confirmed, High, Moderate, Suspected

    campaign = relationship("Campaign", back_populates="actors")
    actor = relationship("ThreatActor", back_populates="campaigns")
