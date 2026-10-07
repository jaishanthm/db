from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import DATABASE_URL, DATA_DIR

# Primary Engine
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine_kwargs = {"connect_args": connect_args}
if not DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({"pool_pre_ping": True, "pool_recycle": 3600})

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sandboxed Read-Only Engine for SQL Explorer
if DATABASE_URL.startswith("sqlite"):
    db_file = DATA_DIR / "malware_intel.db"
    ro_sqlite_url = f"sqlite:///file:{db_file.as_posix()}?mode=ro&uri=true"
    ro_engine = create_engine(ro_sqlite_url, connect_args={"check_same_thread": False, "uri": True})
else:
    # For MySQL/MariaDB, enforce autocommit read-only connection pooling
    ro_engine = create_engine(
        DATABASE_URL,
        execution_options={"isolation_level": "AUTOCOMMIT"},
        pool_pre_ping=True,
        pool_recycle=3600
    )

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
