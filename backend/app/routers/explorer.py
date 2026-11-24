from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.analytics import DataPreviewResponse
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/explorer", tags=["Explorer"])

@router.get("/preview/{dataset_id}", response_model=DataPreviewResponse)
def preview_dataset(
    dataset_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    sort_by: Optional[str] = None,
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    filter_col: Optional[str] = None,
    filter_val: Optional[str] = None,
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return DatasetService.get_preview(
        dataset=ds,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        filter_col=filter_col,
        filter_val=filter_val
    )
