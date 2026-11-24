from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.analytics import PivotTableRequest, PivotTableResponse, FormulaDemoRequest, FormulaDemoResponse
from app.services.excel_service import ExcelService

router = APIRouter(prefix="/excel", tags=["Excel Analytics"])

@router.post("/pivot", response_model=PivotTableResponse)
def generate_pivot(req: PivotTableRequest, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == req.dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        return ExcelService.create_pivot_table(req, ds)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/formula", response_model=FormulaDemoResponse)
def evaluate_formula(req: FormulaDemoRequest, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == req.dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        return ExcelService.demonstrate_formula(req.formula_type, req.parameters, ds)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
