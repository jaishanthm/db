"""
Database Relationship Integrity Tests for Malware Information Database.
"""

from backend.app.core.database import SessionLocal
from backend.app.models import MalwareFamily, ThreatActor, Campaign, MitreTechnique, Indicator

def test_relationship_integrity():
    db = SessionLocal()
    try:
        # Check that lockbit has relationships
        lockbit = db.query(MalwareFamily).filter(MalwareFamily.slug == "lockbit").first()
        assert lockbit is not None
        assert len(lockbit.platforms) > 0
        assert len(lockbit.capabilities) > 0
        assert len(lockbit.techniques) > 0
        assert len(lockbit.variants) > 0
        assert len(lockbit.timeline_events) > 0
        assert len(lockbit.indicators) > 0

        # Check actor relationships
        actor = db.query(ThreatActor).first()
        assert actor is not None
        assert len(actor.malware_links) > 0

        # Check campaigns
        campaign = db.query(Campaign).first()
        assert campaign is not None
        assert len(campaign.malware_links) > 0
        assert len(campaign.actors) > 0

    finally:
        db.close()
