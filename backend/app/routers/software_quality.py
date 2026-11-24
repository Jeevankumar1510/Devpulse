from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/software-quality", tags=["Software Quality Intelligence"])

@router.get("/metrics")
def get_software_quality_metrics(db: Session = Depends(get_db)):
    defects_ds = db.query(Dataset).filter(Dataset.id == "demo-software-defects").first()
    df = DatasetService.load_dataframe(defects_ds) if defects_ds else None

    if df is not None and not df.empty:
        total_defects = len(df)
        sev_counts = df["severity"].value_counts().to_dict()
        comp_counts = df["component"].value_counts().to_dict()
        root_causes = df["root_cause"].value_counts().to_dict()
        avg_res_time = round(float(df["resolution_time_hours"].mean()), 1)
        escape_rate = round(float((df["escape_defect"] == "Yes").mean() * 100), 1) if "escape_defect" in df.columns else 22.0
    else:
        total_defects = 250
        sev_counts = {"Critical": 25, "High": 62, "Medium": 113, "Low": 50}
        comp_counts = {"Authentication": 65, "API Gateway": 55, "Billing": 45, "UI": 40, "Worker": 45}
        root_causes = {"Concurrency": 40, "Null Pointer": 60, "Schema Mismatch": 50, "Timeout": 45}
        avg_res_time = 36.4
        escape_rate = 22.0

    return {
        "total_defects": total_defects,
        "escape_defect_rate_pct": escape_rate,
        "avg_resolution_time_hours": avg_res_time,
        "defect_density_per_kloc": 1.8,
        "test_coverage_pct": 78.4,
        "severity_distribution": [{"severity": k, "count": int(v)} for k, v in sev_counts.items()],
        "component_breakdown": [{"component": k, "count": int(v)} for k, v in comp_counts.items()],
        "root_cause_breakdown": [{"cause": k, "count": int(v)} for k, v in root_causes.items()],
        "release_stability_index": 92.4
    }
