from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.analytics import EDAResponse
from app.services.eda_service import EDAService

router = APIRouter(prefix="/eda", tags=["Exploratory Data Analysis"])

@router.get("/report/{dataset_id}", response_model=EDAResponse)
def get_eda_report(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return EDAService.generate_eda(ds)
