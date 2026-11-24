from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Float, Text, Boolean
from app.database import Base

class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(String, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    dataset_id = Column(String, nullable=True)
    status = Column(String, default="SUCCESS") # SUCCESS, ERROR
    execution_time_ms = Column(Float, default=0.0)
    row_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
