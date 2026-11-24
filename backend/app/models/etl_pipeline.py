from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ETLPipeline(Base):
    __tablename__ = "etl_pipelines"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String, nullable=False) # file, api, database
    source_config = Column(JSON, default=dict)
    transformation_rules = Column(JSON, default=list) # [{operation: 'filter', params: {...}}]
    destination_table = Column(String, nullable=False)
    schedule_interval = Column(String, default="daily") # manual, hourly, daily, weekly
    status = Column(String, default="ACTIVE") # ACTIVE, PAUSED, FAILED
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    logs = relationship("ETLLog", back_populates="pipeline", cascade="all, delete-orphan")

class ETLLog(Base):
    __tablename__ = "etl_logs"

    id = Column(String, primary_key=True, index=True)
    pipeline_id = Column(String, ForeignKey("etl_pipelines.id"), nullable=False)
    status = Column(String, default="RUNNING") # SUCCESS, FAILED, RUNNING
    rows_extracted = Column(Integer, default=0)
    rows_transformed = Column(Integer, default=0)
    rows_loaded = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    pipeline = relationship("ETLPipeline", back_populates="logs")
