import sys
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings

router = APIRouter(prefix="/settings", tags=["Settings & Integrations"])

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)):
    # Test DB connection
    db_healthy = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_healthy = False

    return {
        "status": "HEALTHY" if db_healthy else "DEGRADED",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "python_version": sys.version.split()[0],
        "database": {
            "type": "PostgreSQL / SQLite",
            "connected": db_healthy,
            "url_sanitized": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL
        },
        "integrations": {
            "github_api": {
                "configured": bool(settings.GITHUB_TOKEN),
                "mode": "Live GitHub REST API" if settings.GITHUB_TOKEN else "Calibrated Synthetic Engine"
            },
            "analytical_duckdb": {
                "in_memory_engine": "Active & Ready",
                "features": ["CTEs", "Window Functions", "EXPLAIN Plans", "Parquet/CSV Direct Query"]
            },
            "powerbi_export": {
                "star_schema_engine": "Active",
                "dax_generator": "Active"
            }
        }
    }
