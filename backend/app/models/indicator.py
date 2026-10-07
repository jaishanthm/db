from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    indicator_type = Column(String(32), index=True, nullable=False)  # SHA256, MD5, Domain, IPv4, URL, Mutex, RegistryKey
    value = Column(String(256), index=True, nullable=False)
    confidence = Column(String(32), default="High")  # Confirmed, High, Medium, Synthetic
    severity = Column(String(32), default="High")  # Critical, High, Medium
    first_seen = Column(String(32), nullable=True)
    last_seen = Column(String(32), nullable=True)
    status = Column(String(32), default="Active")  # Active, Revoked, Sinkholed
    source = Column(String(256), default="MalwareBazaar / CISA Alert")
    created_at = Column(DateTime, default=datetime.utcnow)

    malware = relationship("MalwareFamily", back_populates="indicators")


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(String(64), primary_key=True)  # CVE-2023-34362
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    cvss_score = Column(Float, default=9.8)
    severity = Column(String(32), default="Critical")
    affected_component = Column(String(128), default="MOVEit Transfer / Log4j")

    malware_links = relationship("MalwareVulnerability", back_populates="vulnerability")


class MalwareVulnerability(Base):
    __tablename__ = "malware_vulnerabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    vulnerability_id = Column(String(64), ForeignKey("vulnerabilities.id"), index=True, nullable=False)
    exploitation_stage = Column(String(64), default="Initial Access / Weaponization")

    malware = relationship("MalwareFamily", back_populates="vulnerabilities")
    vulnerability = relationship("Vulnerability", back_populates="malware_links")


class Industry(Base):
    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(64), unique=True, nullable=False)  # Healthcare, Financial Services, Critical Infrastructure, etc.
    description = Column(Text, nullable=True)


class MalwareIndustry(Base):
    __tablename__ = "malware_target_industries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    industry_id = Column(Integer, ForeignKey("industries.id"), nullable=False)

    malware = relationship("MalwareFamily", back_populates="industries")
    industry = relationship("Industry")
