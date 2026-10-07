from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from backend.app.core.database import Base

class GlossaryTerm(Base):
    __tablename__ = "glossary_terms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    term = Column(String(128), unique=True, index=True, nullable=False)
    category = Column(String(64), index=True, nullable=False)  # Concepts, Cryptography, Artifacts, Operations, Defenses
    definition = Column(Text, nullable=False)
    technical_example = Column(Text, nullable=True)
    related_mitre = Column(String(64), nullable=True)
    references = Column(Text, default="[]")  # JSON array

class MitigationGuideline(Base):
    __tablename__ = "mitigation_guidelines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    phase = Column(String(64), index=True, nullable=False)  # Prevention, Detection, Containment, Eradication, Recovery, Hardening
    title = Column(String(256), nullable=False)
    objective = Column(Text, nullable=False)
    technical_controls = Column(Text, nullable=False)  # Markdown or list
    target_environment = Column(String(128), default="Enterprise IT / Active Directory / Cloud")
    cisa_guideline = Column(String(256), default="CISA Cross-Sector Cybersecurity Performance Goals (CPGs)")

class AnalysisConcept(Base):
    __tablename__ = "analysis_concepts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    category = Column(String(64), index=True, nullable=False)  # PE_Characteristics, ELF_Characteristics, Anti_Analysis, Packing_Obfuscation, C2_Behavior, Persistence_Mechanisms
    title = Column(String(256), nullable=False)
    technical_overview = Column(Text, nullable=False)
    forensic_indicators = Column(Text, nullable=False)
    investigation_tooling = Column(String(256), default="Ghidra, IDA Pro, x64dbg, PEStudio, Wireshark, Volatility")

class TelemetrySource(Base):
    __tablename__ = "telemetry_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String(64), index=True, nullable=False)  # Sysmon, Windows_Event_Log, Suricata_NIDS, DNS_Telemetry, EDR
    event_id = Column(String(32), index=True, nullable=True)  # e.g. "Sysmon 1", "Event ID 4624"
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    detection_value = Column(Text, nullable=False)
    sample_log = Column(Text, nullable=True)
