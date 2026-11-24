from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.engineering_service import EngineeringService

router = APIRouter(prefix="/github-analytics", tags=["GitHub Engineering Analytics"])

@router.get("/metrics")
def get_engineering_metrics(timeframe: str = "last_90_days", db: Session = Depends(get_db)):
    return EngineeringService.get_engineering_intelligence(db, timeframe)
