import duckdb
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Engine configuration with sqlite fallback / postgresql support
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class DuckDBManager:
    """In-memory or persistent analytical query engine supporting CTEs, window functions and EXPLAIN."""
    _instance = None

    @classmethod
    def get_connection(cls):
        if cls._instance is None:
            cls._instance = duckdb.connect(database=":memory:")
        return cls._instance

duckdb_conn = DuckDBManager.get_connection()
