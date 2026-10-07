import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.core.config import (
    APP_NAME, VERSION, API_V1_PREFIX,
    CORS_ORIGINS, DATABASE_URL
)
from backend.app.core.database import get_db
from backend.app.services.data_quality import run_data_quality_audit
from backend.app.api.v1 import (
    malware, actors, campaigns, techniques,
    indicators, case_studies, analytics,
    search, graph, schema, sql_explorer,
    research, taxonomy, knowledge
)

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="Production-grade Malware Information Database & Threat Intelligence Research Platform REST API. Provides comprehensive intelligence regarding malware families, campaigns, threat actors, MITRE ATT&CK mappings, IOCs, defensive detection rules, and sandboxed read-only SQL queries.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(malware.router, prefix=API_V1_PREFIX)
app.include_router(actors.router, prefix=API_V1_PREFIX)
app.include_router(campaigns.router, prefix=API_V1_PREFIX)
app.include_router(techniques.router, prefix=API_V1_PREFIX)
app.include_router(indicators.router, prefix=API_V1_PREFIX)
app.include_router(case_studies.router, prefix=API_V1_PREFIX)
app.include_router(analytics.router, prefix=API_V1_PREFIX)
app.include_router(search.router, prefix=API_V1_PREFIX)
app.include_router(graph.router, prefix=API_V1_PREFIX)
app.include_router(schema.router, prefix=API_V1_PREFIX)
app.include_router(sql_explorer.router, prefix=API_V1_PREFIX)
app.include_router(research.router, prefix=API_V1_PREFIX)
app.include_router(taxonomy.router, prefix=API_V1_PREFIX)
app.include_router(knowledge.router, prefix=API_V1_PREFIX)

@app.get("/health", tags=["System"])
@app.get(f"{API_V1_PREFIX}/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint validating database connectivity and system status."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": VERSION,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get(f"{API_V1_PREFIX}/quality-report", tags=["System"])
def data_quality_report(db: Session = Depends(get_db)):
    """Runs on-demand forensic consistency and data quality engine audit."""
    return run_data_quality_audit(db)
