from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.analytics import MLTrainRequest, MLTrainResponse
from app.services.predictive_service import PredictiveService

router = APIRouter(prefix="/predictive", tags=["Predictive Analytics"])

@router.post("/train", response_model=MLTrainResponse)
def train_model(req: MLTrainRequest, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == req.dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        return PredictiveService.train_model(req, ds)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
