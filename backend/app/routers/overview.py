from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.models.kpi import KPI
from app.services.engineering_service import EngineeringService
from app.services.bi_service import BIService

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("/metrics")
def get_overview_metrics(db: Session = Depends(get_db)):
    datasets_count = db.query(Dataset).count()
    kpis = db.query(KPI).all()
    eng = EngineeringService.get_engineering_intelligence(db)
    bi = BIService.get_business_insights(db)

    return {
        "datasets_count": datasets_count,
        "overall_health_score": bi.overall_health_score,
        "dora_tier": eng.dora_classification.tier if eng.dora_classification else "High Performer",
        "dora_score": eng.dora_classification.score if eng.dora_classification else 84.2,
        "kpis": bi.kpi_summary[:4],
        "dora_metrics": eng.dora_metrics,
        "bottlenecks": eng.bottlenecks[:2],
        "executive_summary": bi.executive_summary,
        "quality_trend": eng.quality_trend
    }
