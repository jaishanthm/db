from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class DefensiveRule(Base):
    __tablename__ = "defensive_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    rule_type = Column(String(32), index=True, nullable=False)  # Sigma, YARA, Suricata, Splunk_SPL, KQL
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    rule_content = Column(Text, nullable=False)
    target_component = Column(String(64), default="Process Creation / Endpoint")  # Network, Endpoint, Memory, Registry
    severity = Column(String(32), default="High")
    created_at = Column(DateTime, default=datetime.utcnow)

    malware = relationship("MalwareFamily", back_populates="defensive_rules")
