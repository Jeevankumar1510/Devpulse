import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
DEMO_DATA_DIR = Path(__file__).resolve().parent / "demo_data"
EXPORT_DIR = STORAGE_DIR / "exports"

# Ensure runtime directories exist
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DEMO_DATA_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "DevPulse Analytics Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR}/devpulse.db"
    )
    
    # GitHub Integration
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    
    # Analytics Storage
    UPLOAD_PATH: str = str(UPLOAD_DIR)
    DEMO_DATA_PATH: str = str(DEMO_DATA_DIR)
    EXPORT_PATH: str = str(EXPORT_DIR)
    
    # Celery / Redis (Optional background task queues)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Safe Query Limits
    MAX_QUERY_ROWS: int = 10000
    QUERY_TIMEOUT_SECONDS: int = 15
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
