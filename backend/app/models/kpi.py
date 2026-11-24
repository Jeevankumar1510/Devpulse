from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Float, Text, Boolean, JSON
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class KPI(Base):
    __tablename__ = "kpis"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, default="Engineering") # Engineering, Quality, Operations, Business
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    unit = Column(String, default="") # %, hours, days, count
    status = Column(String, default="HEALTHY") # HEALTHY, WARNING, CRITICAL
    trend = Column(String, default="UP") # UP, DOWN, NEUTRAL
    change_percentage = Column(Float, default=0.0)
    formula_description = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class DataQualityRule(Base):
    __tablename__ = "data_quality_rules"

    id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, nullable=False)
    column_name = Column(String, nullable=True)
    rule_type = Column(String, nullable=False) # completeness, uniqueness, range, regex, type
    parameters = Column(JSON, default=dict)
    score = Column(Float, default=100.0)
    status = Column(String, default="PASSED") # PASSED, FAILED, WARNING
    violation_count = Column(Integer, default=0)
    last_evaluated_at = Column(DateTime, default=utc_now)
