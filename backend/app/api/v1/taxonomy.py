from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from backend.app.core.database import get_db
from backend.app.models import MalwareFamily

router = APIRouter(prefix="/taxonomy", tags=["Malware Taxonomy"])

TAXONOMY_STRUCTURE = [
    {
        "id": "ransomware",
        "name": "Ransomware",
        "description": "Cryptographic extortion malware that encrypts user/system data and demands payment for decryption keys.",
        "db_types": ["Ransomware"],
        "children": []
    },
    {
        "id": "trojan",
        "name": "Trojan",
        "description": "Malicious program masquerading as benign software to establish covert execution and backdoor access.",
        "db_types": ["Trojan"],
        "children": [
            {
                "id": "banking-trojan",
                "name": "Banking Trojan",
                "description": "Specialized trojan performing web injection, Man-in-the-Browser (MitB), and financial credential harvesting.",
                "db_types": ["Banking Trojan", "Mobile Banking"]
            },
            {
                "id": "rat",
                "name": "Remote Access Trojan (RAT)",
                "description": "Full-featured remote administration tool enabling interactive shell, desktop streaming, and telemetry exfiltration.",
                "db_types": ["RAT", "C2 Framework"]
            },
            {
                "id": "loader",
                "name": "Loader / Dropper",
                "description": "Staged malware designed specifically to bypass perimeter controls and download secondary high-impact payloads.",
                "db_types": ["Loader", "Dropper"]
            }
        ]
    },
    {
        "id": "infostealer",
        "name": "Infostealer",
        "description": "Malware specialized in exfiltrating stored browser logins, cookies, cryptocurrency wallets, and authentication tokens.",
        "db_types": ["Infostealer"],
        "children": []
    },
    {
        "id": "wiper",
        "name": "Wiper / Sabotage",
        "description": "Destructive cyberweapon designed to overwrite Master Boot Records (MBR), partition tables, or delete raw storage with unrecoverable patterns.",
        "db_types": ["Wiper", "ICS/SCADA"],
        "children": []
    },
    {
        "id": "botnet",
        "name": "Botnet",
        "description": "Network of compromised endpoints under decentralized or centralized C2 command, used for distributed DDoS and credential attacks.",
        "db_types": ["Botnet", "Banking Botnet"],
        "children": []
    },
    {
        "id": "spyware",
        "name": "Spyware & Surveillance",
        "description": "Covert surveillance agents intercepting ambient microphones, GPS location, screen buffers, and messaging databases.",
        "db_types": ["Spyware", "Mobile Spyware", "APT Platform"],
        "children": []
    },
    {
        "id": "worm",
        "name": "Worm / Network Propagator",
        "description": "Self-replicating malware that traverses network subnets and spreads autonomously via vulnerable services (e.g. SMB, RDP).",
        "db_types": ["Worm"],
        "children": []
    },
    {
        "id": "rootkit",
        "name": "Rootkit / Kernel Implant",
        "description": "Kernel-mode or ring 0 driver manipulating OS data structures to hide files, processes, network ports, and bypass EDR hooks.",
        "db_types": ["Rootkit", "Backdoor", "Backdoor/Implant"],
        "children": []
    },
    {
        "id": "mobile-malware",
        "name": "Mobile Malware",
        "description": "Threats engineered for Android and iOS devices, abusing accessibility services, SMS interceptors, and zero-click webkit exploits.",
        "db_types": ["Mobile Banking", "Mobile Spyware", "Mobile Adware"],
        "children": []
    }
]

@router.get("", response_model=Dict[str, Any])
def get_malware_taxonomy(db: Session = Depends(get_db)):
    """
    Returns the comprehensive, hierarchical Malware Taxonomy tree with family volume counts.
    """
    # Fetch all counts
    all_malware = db.query(MalwareFamily.primary_type, func.count(MalwareFamily.id)).group_by(MalwareFamily.primary_type).all()
    type_counts = {t[0]: t[1] for t in all_malware}

    def populate_counts(nodes: List[Dict[str, Any]]):
        result = []
        for n in nodes:
            direct_count = sum(type_counts.get(t, 0) for t in n.get("db_types", []))
            children = populate_counts(n.get("children", []))
            total_count = direct_count + sum(c["count"] for c in children)
            result.append({
                "id": n["id"],
                "name": n["name"],
                "description": n["description"],
                "count": total_count,
                "db_types": n.get("db_types", []),
                "children": children
            })
        return result

    enriched_taxonomy = populate_counts(TAXONOMY_STRUCTURE)
    total_catalog = sum(type_counts.values())

    return {
        "status": "success",
        "total_catalog": total_catalog,
        "taxonomy": enriched_taxonomy
    }
