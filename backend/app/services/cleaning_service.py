import json
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService
from app.schemas.analytics import CleanOperation, CleanResultResponse

class CleaningService:
    @staticmethod
    def clean_dataset(dataset: Dataset, operations: List[CleanOperation]) -> CleanResultResponse:
        df = DatasetService.load_dataframe(dataset)
        orig_count = len(df)
        cleaned_df = df.copy()
        summary_log = []

        for op in operations:
            col = op.column
            strat = op.strategy
            val = op.value

            if op.type == "drop_duplicates":
                before_len = len(cleaned_df)
                cleaned_df = cleaned_df.drop_duplicates()
                diff = before_len - len(cleaned_df)
                summary_log.append(f"Removed {diff} duplicate rows.")

            elif op.type == "drop_na":
                before_len = len(cleaned_df)
                if col and col in cleaned_df.columns:
                    cleaned_df = cleaned_df.dropna(subset=[col])
                else:
                    cleaned_df = cleaned_df.dropna()
                summary_log.append(f"Dropped {before_len - len(cleaned_df)} rows containing null values.")

            elif op.type == "fill_na" and col in cleaned_df.columns:
                null_count = int(cleaned_df[col].isnull().sum())
                if null_count > 0:
                    if strat == "mean" and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                        cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].mean())
                    elif strat == "median" and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                        cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].median())
                    elif strat == "mode":
                        mode_val = cleaned_df[col].mode().iloc[0] if not cleaned_df[col].mode().empty else ""
                        cleaned_df[col] = cleaned_df[col].fillna(mode_val)
                    elif strat == "constant" and val is not None:
                        cleaned_df[col] = cleaned_df[col].fillna(val)
                    summary_log.append(f"Imputed {null_count} nulls in '{col}' using {strat}.")

            elif op.type == "remove_outliers" and col in cleaned_df.columns and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                series = cleaned_df[col].dropna()
                if strat == "iqr":
                    q1 = series.quantile(0.25)
                    q3 = series.quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers = cleaned_df[(cleaned_df[col] < lower_bound) | (cleaned_df[col] > upper_bound)]
                    cleaned_df = cleaned_df[(cleaned_df[col] >= lower_bound) & (cleaned_df[col] <= upper_bound)]
                    summary_log.append(f"Removed {len(outliers)} IQR outliers in '{col}' ([{lower_bound:.2f}, {upper_bound:.2f}]).")
                elif strat == "zscore":
                    mean = series.mean()
                    std = series.std()
                    if std > 0:
                        z_scores = (cleaned_df[col] - mean) / std
                        outliers = cleaned_df[z_scores.abs() > 3]
                        cleaned_df = cleaned_df[z_scores.abs() <= 3]
                        summary_log.append(f"Removed {len(outliers)} 3-sigma Z-score outliers in '{col}'.")

            elif op.type == "normalize" and col in cleaned_df.columns and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                if strat == "minmax":
                    min_val = cleaned_df[col].min()
                    max_val = cleaned_df[col].max()
                    if max_val > min_val:
                        cleaned_df[col] = (cleaned_df[col] - min_val) / (max_val - min_val)
                        summary_log.append(f"Min-Max normalized '{col}' to range [0, 1].")
                elif strat == "standard":
                    mean = cleaned_df[col].mean()
                    std = cleaned_df[col].std()
                    if std > 0:
                        cleaned_df[col] = (cleaned_df[col] - mean) / std
                        summary_log.append(f"Standardized '{col}' (mean=0, std=1).")

            elif op.type == "convert_type" and col in cleaned_df.columns:
                target_t = op.target_type
                try:
                    if target_t == "int":
                        cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors="coerce").fillna(0).astype(int)
                    elif target_t == "float":
                        cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors="coerce")
                    elif target_t == "datetime":
                        cleaned_df[col] = pd.to_datetime(cleaned_df[col], errors="coerce")
                    elif target_t == "string":
                        cleaned_df[col] = cleaned_df[col].astype(str)
                    summary_log.append(f"Converted '{col}' to type '{target_t}'.")
                except Exception as e:
                    summary_log.append(f"Failed type conversion for '{col}': {str(e)}")

        preview = json.loads(cleaned_df.head(25).to_json(orient="records", date_format="iso"))

        return CleanResultResponse(
            dataset_id=dataset.id,
            original_row_count=orig_count,
            cleaned_row_count=len(cleaned_df),
            operations_applied=len(operations),
            summary={"log": summary_log, "retained_percentage": round(len(cleaned_df) / orig_count * 100, 2) if orig_count > 0 else 0},
            preview_data=preview
        )
