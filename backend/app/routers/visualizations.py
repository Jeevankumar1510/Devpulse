from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.services.visualization_service import VisualizationService

router = APIRouter(prefix="/visualizations", tags=["Visualizations"])

@router.get("/histogram/{dataset_id}")
def get_histogram(dataset_id: str, column: str, bins: int = Query(12, ge=3, le=50), db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        return VisualizationService.get_histogram_data(ds, column, bins)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/boxplot/{dataset_id}")
def get_boxplot(dataset_id: str, column: str, group_by: Optional[str] = None, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        return VisualizationService.get_boxplot_data(ds, column, group_by)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/scatter/{dataset_id}")
def get_scatter(
    dataset_id: str, 
    x_col: str, 
    y_col: str, 
    category_col: Optional[str] = None,
    limit: int = Query(500, ge=10, le=2000),
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        return VisualizationService.get_scatter_data(ds, x_col, y_col, category_col, limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/aggregated/{dataset_id}")
def get_aggregated(
    dataset_id: str,
    dimension: str,
    metric: str,
    agg_func: str = "sum",
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        return VisualizationService.get_aggregated_chart_data(ds, dimension, metric, agg_func, limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
