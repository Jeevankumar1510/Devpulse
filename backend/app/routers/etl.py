from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.etl_pipeline import ETLPipeline, ETLLog
from app.services.etl_service import ETLService

router = APIRouter(prefix="/etl", tags=["ETL Pipeline Manager"])

@router.get("/pipelines")
def get_pipelines(db: Session = Depends(get_db)):
    return ETLService.get_or_seed_pipelines(db)

@router.post("/run/{pipeline_id}")
def run_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    try:
        return ETLService.run_pipeline(pipeline_id, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/logs/{pipeline_id}")
def get_pipeline_logs(pipeline_id: str, db: Session = Depends(get_db)):
    return db.query(ETLLog).filter(ETLLog.pipeline_id == pipeline_id).order_by(ETLLog.created_at.desc()).all()
