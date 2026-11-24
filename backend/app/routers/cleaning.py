from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.analytics import DataCleanRequest, CleanResultResponse
from app.services.cleaning_service import CleaningService

router = APIRouter(prefix="/cleaning", tags=["Data Cleaning"])

@router.post("/apply", response_model=CleanResultResponse)
def apply_cleaning(req: DataCleanRequest, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == req.dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        return CleaningService.clean_dataset(ds, req.operations)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
