from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Float, Text
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # csv, xlsx, json
    file_size_bytes = Column(Integer, default=0)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    columns_metadata = Column(JSON, default=list) # [{name, type, null_count, unique_count}]
    is_synthetic = Column(Boolean, default=False)
    synthetic_disclosure = Column(Text, nullable=True)
    category = Column(String, default="General") # Engineering, Sales, Quality, HR, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
