from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.analytics import PythonScriptRequest, PythonScriptResponse
from app.services.python_service import PythonAnalyticsService

router = APIRouter(prefix="/python", tags=["Python Analytics"])

@router.post("/execute", response_model=PythonScriptResponse)
def execute_python(req: PythonScriptRequest, db: Session = Depends(get_db)):
    ds = None
    if req.dataset_id:
        ds = db.query(Dataset).filter(Dataset.id == req.dataset_id).first()
    
    return PythonAnalyticsService.execute_script(req.code, ds)
