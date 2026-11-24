from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.bi_service import BIService

router = APIRouter(prefix="/business-insights", tags=["Business Intelligence"])

@router.get("/overview")
def get_bi_overview(db: Session = Depends(get_db)):
    return BIService.get_business_insights(db)
