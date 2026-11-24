from fastapi import APIRouter
from app.services.powerbi_service import PowerBIService

router = APIRouter(prefix="/powerbi", tags=["Power BI Integration"])

@router.get("/star-schema")
def get_star_schema():
    return PowerBIService.get_star_schema_model()

@router.get("/dax-measures")
def get_dax_measures():
    return PowerBIService.get_dax_measures()
