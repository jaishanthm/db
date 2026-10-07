from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class ThreatActor(Base):
    __tablename__ = "threat_actors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(128), index=True, nullable=False)
    aliases = Column(Text, default="[]")  # JSON string of aliases
    origin_country = Column(String(64), index=True, default="Unknown")
    motivation = Column(String(64), index=True, default="Financial")  # Financial, Espionage, Sabotage, Hacktivism
    first_seen = Column(String(32), index=True, nullable=False)
    status = Column(String(32), default="Active")  # Active, Dormant, Sanctioned, Disrupted
    target_sectors = Column(Text, default="[]")  # JSON array
    target_countries = Column(Text, default="[]")  # JSON array
    description = Column(Text, nullable=False)
    sophistication = Column(String(32), default="Advanced")  # Advanced, Intermediate, Nation-State
    source = Column(String(256), default="MITRE ATT&CK Groups / CISA Alerts")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    malware_links = relationship("ActorMalware", back_populates="actor", cascade="all, delete-orphan")
    campaigns = relationship("CampaignActor", back_populates="actor", cascade="all, delete-orphan")


class ActorMalware(Base):
    __tablename__ = "actor_malware"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor_id = Column(Integer, ForeignKey("threat_actors.id", ondelete="CASCADE"), index=True, nullable=False)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(64), default="Operator")  # Primary Author, Operator, Affiliate, Reseller
    first_observed_use = Column(String(32), nullable=True)

    actor = relationship("ThreatActor", back_populates="malware_links")
    malware = relationship("MalwareFamily", back_populates="actors")
