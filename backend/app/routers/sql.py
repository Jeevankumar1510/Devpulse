from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.query_history import QueryHistory
from app.schemas.analytics import SQLExecuteRequest, SQLExecuteResponse
from app.services.sql_service import SQLService

router = APIRouter(prefix="/sql", tags=["SQL Studio"])

@router.post("/execute", response_model=SQLExecuteResponse)
def execute_sql(req: SQLExecuteRequest, db: Session = Depends(get_db)):
    return SQLService.execute_query(req.query, req.dataset_id, db)

@router.get("/history")
def get_query_history(limit: int = 20, db: Session = Depends(get_db)):
    records = db.query(QueryHistory).order_by(QueryHistory.created_at.desc()).limit(limit).all()
    return records
