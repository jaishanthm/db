from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class MitreTactic(Base):
    __tablename__ = "mitre_tactics"

    id = Column(String(32), primary_key=True)  # e.g. TA0001
    name = Column(String(128), nullable=False)  # e.g. Initial Access
    description = Column(Text, nullable=False)
    order_index = Column(Integer, default=0)

    techniques = relationship("MitreTechnique", back_populates="tactic")


class MitreTechnique(Base):
    __tablename__ = "mitre_techniques"

    id = Column(String(32), primary_key=True)  # e.g. T1059.001
    name = Column(String(128), nullable=False)  # e.g. PowerShell
    tactic_id = Column(String(32), ForeignKey("mitre_tactics.id"), index=True, nullable=False)
    tactic_name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    url = Column(String(256), default="https://attack.mitre.org")

    tactic = relationship("MitreTactic", back_populates="techniques")
    malware_links = relationship("MalwareTechnique", back_populates="technique")


class MalwareTechnique(Base):
    __tablename__ = "malware_techniques"

    id = Column(Integer, primary_key=True, autoincrement=True)
    malware_id = Column(Integer, ForeignKey("malware_families.id", ondelete="CASCADE"), index=True, nullable=False)
    technique_id = Column(String(32), ForeignKey("mitre_techniques.id"), index=True, nullable=False)
    use_case = Column(Text, nullable=False)
    confidence = Column(String(32), default="High")  # Confirmed, High, Medium, Synthetic

    malware = relationship("MalwareFamily", back_populates="techniques")
    technique = relationship("MitreTechnique", back_populates="malware_links")
