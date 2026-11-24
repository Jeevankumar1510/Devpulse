import os
import uuid
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.config import settings
from app.models.dataset import Dataset
from app.database import duckdb_conn
from app.schemas.analytics import ColumnProfile, DataPreviewResponse

class DatasetService:
    @staticmethod
    def inspect_dataframe(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Profile columns for metadata and statistics."""
        metadata = []
        for col in df.columns:
            series = df[col]
            dtype_str = str(series.dtype)
            null_count = int(series.isnull().sum())
            unique_count = int(series.nunique())
            total = len(series)
            
            profile = {
                "name": str(col),
                "data_type": dtype_str,
                "null_count": null_count,
                "null_percentage": round((null_count / total * 100) if total > 0 else 0, 2),
                "unique_count": unique_count,
            }
            if pd.api.types.is_numeric_dtype(series):
                profile["min"] = float(series.min()) if not series.isnull().all() else None
                profile["max"] = float(series.max()) if not series.isnull().all() else None
                profile["mean"] = float(series.mean()) if not series.isnull().all() else None
                profile["std"] = float(series.std()) if not series.isnull().all() else None
            metadata.append(profile)
        return metadata

    @staticmethod
    def load_dataframe(dataset: Dataset) -> pd.DataFrame:
        """Load dataframe from disk based on file type."""
        path = dataset.file_path
        if not os.path.exists(path):
            raise FileNotFoundError(f"Dataset file not found at {path}")
            
        if dataset.file_type == "csv":
            df = pd.read_csv(path)
        elif dataset.file_type in ["xlsx", "xls"]:
            df = pd.read_excel(path)
        elif dataset.file_type == "json":
            df = pd.read_json(path)
        else:
            raise ValueError(f"Unsupported file type: {dataset.file_type}")
        
        # Register in DuckDB for SQL execution
        table_name = f"dataset_{dataset.id.replace('-', '_')}"
        clean_df = df.copy()
        clean_df.columns = [str(c).replace(" ", "_").replace("-", "_").lower() for c in clean_df.columns]
        duckdb_conn.register(table_name, clean_df)
        duckdb_conn.register("current_dataset", clean_df)
        return df

    @staticmethod
    def save_upload(file_bytes: bytes, filename: str, db: Session, description: str = "", category: str = "General") -> Dataset:
        """Save uploaded dataset file and record in database."""
        ext = filename.split(".")[-1].lower()
        dataset_id = str(uuid.uuid4())
        saved_filename = f"{dataset_id}_{filename}"
        dest_path = os.path.join(settings.UPLOAD_PATH, saved_filename)

        with open(dest_path, "wb") as f:
            f.write(file_bytes)

        if ext == "csv":
            df = pd.read_csv(dest_path)
        elif ext in ["xlsx", "xls"]:
            df = pd.read_excel(dest_path)
        elif ext == "json":
            df = pd.read_json(dest_path)
        else:
            raise ValueError("Only CSV, Excel (.xlsx, .xls), and JSON files are supported.")

        meta = DatasetService.inspect_dataframe(df)

        dataset = Dataset(
            id=dataset_id,
            name=filename.rsplit(".", 1)[0].replace("_", " ").title(),
            description=description or f"User uploaded dataset: {filename}",
            file_path=dest_path,
            file_type=ext,
            file_size_bytes=len(file_bytes),
            row_count=len(df),
            column_count=len(df.columns),
            columns_metadata=meta,
            is_synthetic=False,
            category=category
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        # Register in duckdb
        DatasetService.load_dataframe(dataset)
        return dataset

    @staticmethod
    def get_preview(
        dataset: Dataset, 
        page: int = 1, 
        page_size: int = 50, 
        sort_by: Optional[str] = None, 
        sort_order: str = "asc",
        filter_col: Optional[str] = None,
        filter_val: Optional[str] = None
    ) -> DataPreviewResponse:
        """Paginated, sortable, filterable preview of dataset."""
        df = DatasetService.load_dataframe(dataset)

        if filter_col and filter_val and filter_col in df.columns:
            # Flexible case-insensitive string containment or exact matching
            df = df[df[filter_col].astype(str).str.contains(filter_val, case=False, na=False)]

        if sort_by and sort_by in df.columns:
            ascending = (sort_order.lower() == "asc")
            df = df.sort_values(by=sort_by, ascending=ascending)

        total_rows = len(df)
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        sliced_df = df.iloc[start_idx:end_idx].copy()

        # Fill NaNs with None for clean JSON serialization
        clean_records = json.loads(sliced_df.to_json(orient="records", date_format="iso"))

        profiles = []
        for col in df.columns:
            s = df[col]
            null_c = int(s.isnull().sum())
            raw_samples = s.dropna().unique()[:3]
            clean_samples = [v.item() if hasattr(v, 'item') else v for v in raw_samples]
            p = ColumnProfile(
                name=str(col),
                data_type=str(s.dtype),
                non_null_count=int(s.count()),
                null_count=null_c,
                null_percentage=round((null_c / len(s) * 100) if len(s) > 0 else 0, 2),
                unique_count=int(s.nunique()),
                sample_values=clean_samples
            )
            if pd.api.types.is_numeric_dtype(s):
                p.min_value = float(s.min()) if not s.isnull().all() else None
                p.max_value = float(s.max()) if not s.isnull().all() else None
                p.mean = round(float(s.mean()), 2) if not s.isnull().all() else None
                p.std = round(float(s.std()), 2) if not s.isnull().all() else None
            profiles.append(p)

        return DataPreviewResponse(
            dataset_id=dataset.id,
            total_rows=total_rows,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            columns=[str(c) for c in df.columns],
            column_profiles=profiles,
            data=clean_records
        )
