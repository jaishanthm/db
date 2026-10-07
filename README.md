# Malware Information Database & Threat Intelligence Research Platform

A production-grade, full-stack cybersecurity research and threat intelligence platform for analyzing malware families, threat actors, campaigns, MITRE ATT&CK techniques, indicators of compromise (IOCs), and defensive detection rules.

Backed by **FastAPI**, **SQLAlchemy 2.0**, **PostgreSQL / SQLite**, and a modern **React 19 + TypeScript + Vite + Tailwind CSS** frontend.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React 19 + TypeScript         │
                      │   (Tailwind CSS, Lucide, Vite SPA)     │
                      └───────────────────┬────────────────────┘
                                          │  REST API (JSON)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │             FastAPI Backend            │
                      │  (Pydantic v2, OpenAPI, Versioned API) │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                    Standard Queries          Sandboxed SQL Explorer
                              │                        │
                              ▼                        ▼
                      ┌───────────────┐        ┌───────────────────────┐
                      │ SQLAlchemy    │        │  AST Security Guard   │
                      │ Read/Write    │        │ (sqlglot Parser,      │
                      │ ORM Engine    │        │  Row Clamp, Read-Only)│
                      └───────┬───────┘        └───────────┬───────────┘
                              │                            │
                              ▼                            ▼
                      ┌────────────────────────────────────────┐
                      │    Normalized Relational Database      │
                      │   (PostgreSQL / Sandboxed SQLite)      │
                      └────────────────────────────────────────┘
```

---

## Tech Stack

- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, `sqlglot` AST Parser, Uvicorn
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Database**: SQLite (default local development with URI `mode=ro`) / PostgreSQL (production)
- **DevSecOps & Testing**: PyTest, Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions CI

---

## Key Features

1. **Flagship Research Mode (`/research-mode`)**:
   - Assembles an autonomous, 10-tier threat intelligence investigation dossier traversing the entire knowledge graph: `Malware -> [Threat Actors | Campaigns | Variants] -> Techniques -> [IOCs | Vulnerabilities] -> Case Studies -> Detection Rules -> NIST/CISA Mitigations`.
   - Single-click export of complete Markdown threat dossiers.
2. **Malware Classification Taxonomy (`/taxonomy`)**:
   - Ontological classification hierarchy featuring 9 root classes (Ransomware, Trojans [Banking, RAT, Downloader], Infostealers, Wipers, Rootkits, Botnets, Mobile Malware) with dynamic family drilldown.
3. **Security Knowledge Base (`/knowledge-base`)**:
   - **Cybersecurity Glossary**: Definitions, technical examples, and ATT&CK mappings for evasions and artifacts (`BYOVD`, `Process Hollowing`, `LOLBAS`, `DGA`, `Reflective DLL`, etc.).
   - **Malware Analysis Concepts**: Structural analysis for PE architecture, ELF Linux/IoT binaries, anti-analysis/anti-debugging hooks, and crypter/packer evasion.
   - **Mitigation Playbooks**: Hardening guidelines across Prevention, Detection, Containment, Eradication, Recovery, and Hardening mapped to CISA Performance Goals.
   - **Telemetry & Event Log Hub**: Sysmon (Events 1, 3, 8, 11) and Windows Security Event Logs (4624, 7045) with detection value and log signatures.
4. **Malware Families Explorer (`/malware`)**:
   - Filter 105+ malware families across classification, severity, target platform, operating status, year, and target industry.
5. **Deep Malware Dossiers (`/malware/{slug}`)**:
   - Technical analysis, documented variants, tactical capability checklist, MITRE ATT&CK mapping, attributed threat actors, active campaigns, IOC tables, and exploited CVEs.
6. **MITRE ATT&CK Matrix Navigator (`/attack`)**:
   - Interactive 14-tactic Enterprise matrix showing technique weaponization counts with click-to-inspect malware drawers.
7. **Interactive Relationship Topology (`/graph`)**:
   - Force-directed SVG graph with pan, zoom, and node filtering (Threat Actor → Operation → Malware Family → CVE → ATT&CK Technique).
8. **Threat Actor Intelligence (`/actors`)**:
   - Profiles of 50+ APT groups and cybercrime cartels with origin nation, motivations, sophistication levels, and deployed malware toolsets.
9. **Campaign Database (`/campaigns`)**:
   - Track 105+ documented cyber campaigns and intrusion waves with active date ranges and deployment roles.
10. **Indicator of Compromise (IOC) Explorer (`/ioc`)**:
    - Real-time search across 1,190+ SHA256 hashes, MD5s, IPv4 C2 addresses, domains, and mutexes with one-click copy.
11. **Malware Comparison Engine (`/compare`)**:
    - Side-by-side comparative analysis of any two malware strains identifying shared capabilities and overlapping ATT&CK techniques.
12. **Technical Incident Case Studies (`/case-studies`)**:
    - 15 deep forensic incident breakdowns (Colonial Pipeline DarkSide, SolarWinds SUNBURST, WannaCry NHS, MOVEit Clop zero-day, NotPetya).
13. **Interactive Schema Explorer (`/schema`)**:
    - Relational schema browser with interactive table inspection, column constraints, and foreign key topology.
14. **Sandboxed Read-Only SQL Explorer (`/sql-explorer`)**:
    - Live query editor with AST-based security validation, execution telemetry (duration in ms, rows returned), pre-built query templates, and CSV export.
15. **Global Command Palette (`Ctrl + K`)**:
    - Instant fuzzy search modal matching across all 6 entity databases simultaneously.

---

## Database Relational Model

The database contains over 20 interconnected relational tables:

```
                    ┌── Threat Actor (threat_actors)
                    │        └── actor_malware
                    │
                    ├── Campaign (campaigns)
                    │        └── campaign_malware
                    │
                    ├── Vulnerability (vulnerabilities)
                    │        └── malware_vulnerabilities
                    │
Malware Family ────┼── MITRE Technique (mitre_techniques)
(malware_families)  │        └── malware_techniques
                    │
                    ├── Capability (capabilities)
                    │        └── malware_capabilities
                    │
                    ├── Platform (platforms)
                    │        └── malware_platforms
                    │
                    ├── Indicators / IOCs (indicators)
                    ├── Variants (malware_variants)
                    ├── Timeline Events (timeline_events)
                    ├── Defensive Rules (defensive_rules)
                    └── Case Studies (case_studies)
```

---

## SQL Explorer Security Architecture

The SQL Explorer implements a defense-in-depth model:
1. **AST Parsing (`sqlglot`)**: The raw query is parsed into an Abstract Syntax Tree. If AST parsing fails or detects multiple statements, the query is rejected.
2. **Whitelist Root Validation**: Only `Select` or `With ... Select` root statement nodes are permitted.
3. **AST Node Walking**: Every node in the syntax tree is inspected. Any appearance of mutating statements (`Insert`, `Update`, `Delete`, `Drop`, `Alter`, `Create`, `Truncate`, `Pragma`, `Command`, `Transaction`) causes an immediate security violation error.
4. **Comment Prohibition**: All SQL comments (`--` and `/* */`) are rejected before execution to eliminate comment-based obfuscation tricks.
5. **Execution Limits**: Queries are clamped to a maximum row limit (default: 300 rows) and a 3.0 second statement execution timeout.
6. **Read-Only Engine Handle**: SQLite connections use URI `mode=ro` (read-only mode), ensuring the database engine itself rejects any write attempts.

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ or Bun
- Git

### 2. Backend Setup & Seeding

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run deterministic database seeder
python scripts/seed.py --reset --seed 2026

# Verify data quality (100% check pass)
python scripts/verify_quality.py

# Run backend server (http://127.0.0.1:8000)
uvicorn backend.app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install   # or npm install

# Start Vite development server (http://localhost:5173)
bun run dev   # or npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## Running Automated Tests

Run the PyTest test suite (39 tests covering APIs, SQL security, and relationships):

```bash
pytest -v
```

---

## Docker Deployment

To launch the complete application with Nginx reverse proxy:

```bash
docker compose up -d --build
```

Access the application at `http://localhost`.

---

## REST API Specification

OpenAPI Swagger UI documentation is available at:
- **`http://127.0.0.1:8000/api/docs`**
- ReDoc: **`http://127.0.0.1:8000/api/redoc`**

Key endpoints:
- `GET /health` — Service health check
- `GET /api/v1/malware` — Paginated and filtered malware catalog
- `GET /api/v1/malware/{slug}` — Comprehensive malware dossier
- `GET /api/v1/malware/compare` — Differential malware comparison
- `GET /api/v1/actors` — Threat actor intelligence
- `GET /api/v1/campaigns` — Threat campaigns
- `GET /api/v1/techniques/matrix` — 14-tactic ATT&CK matrix
- `GET /api/v1/indicators` — IOC explorer & hash search
- `GET /api/v1/case-studies` — Forensic case studies
- `GET /api/v1/analytics` — Threat telemetry metrics
- `GET /api/v1/graph` — Interactive relationship topology
- `GET /api/v1/schema` — Relational schema metadata
- `POST /api/v1/sql/execute` — Sandboxed read-only SQL query runner
