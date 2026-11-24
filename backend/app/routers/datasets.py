import os
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.analytics import DatasetResponse
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("/", response_model=List[DatasetResponse])
def list_datasets(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Dataset)
    if category and category.lower() != "all":
        query = query.filter(Dataset.category == category)
    return query.order_by(Dataset.created_at.desc()).all()

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    description: str = Form(""),
    category: str = Form("General"),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        dataset = DatasetService.save_upload(
            file_bytes=content,
            filename=file.filename or "uploaded_dataset.csv",
            db=db,
            description=description,
            category=category
        )
        return dataset
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if os.path.exists(ds.file_path) and not ds.is_synthetic:
        try:
            os.remove(ds.file_path)
        except Exception:
            pass
    db.delete(ds)
    db.commit()
    return {"message": "Dataset deleted successfully", "id": dataset_id}
