from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DEFAULT_SQLITE_URL = f"sqlite:///{DATA_DIR / 'malware_intel.db'}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
API_V1_PREFIX = "/api/v1"
APP_NAME = "Malware Information Database & Threat Intelligence Platform"
VERSION = "1.0.0"

# SQL Explorer limits
SQL_MAX_ROWS = int(os.getenv("SQL_MAX_ROWS", "300"))
SQL_TIMEOUT_SECONDS = float(os.getenv("SQL_TIMEOUT_SECONDS", "3.0"))
SQL_MAX_QUERY_LENGTH = int(os.getenv("SQL_MAX_QUERY_LENGTH", "4000"))
