from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Report Center"])

@router.get("/generate")
def generate_report(
    report_type: str = Query("engineering_dora", regex="^(engineering_dora|quality_audit|general_overview)$"),
    format: str = Query("markdown", regex="^(markdown|json)$"),
    db: Session = Depends(get_db)
):
    return ReportService.generate_report(report_type, db, format)
