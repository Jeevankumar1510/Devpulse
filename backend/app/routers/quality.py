from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.services.quality_service import QualityService

router = APIRouter(prefix="/quality", tags=["Data Quality"])

@router.get("/audit/{dataset_id}")
def audit_quality(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return QualityService.audit_dataset_quality(ds)
