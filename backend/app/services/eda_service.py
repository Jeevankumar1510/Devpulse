from typing import Dict, Any, List
import pandas as pd
import numpy as np
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService
from app.schemas.analytics import EDAResponse

class EDAService:
    @staticmethod
    def generate_eda(dataset: Dataset) -> EDAResponse:
        df = DatasetService.load_dataframe(dataset)
        total_rows = len(df)
        total_cols = len(df.columns)
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

        # Overview
        overview = {
            "total_rows": total_rows,
            "total_columns": total_cols,
            "numeric_columns_count": len(num_cols),
            "categorical_columns_count": len(cat_cols),
            "duplicate_rows_count": int(df.duplicated().sum()),
            "total_missing_cells": int(df.isnull().sum().sum()),
            "missing_cells_pct": round(float(df.isnull().sum().sum()) / (total_rows * total_cols) * 100, 2) if (total_rows * total_cols) > 0 else 0
        }

        # Missing data summary
        missing_summary = []
        for col in df.columns:
            m_count = int(df[col].isnull().sum())
            if m_count > 0:
                missing_summary.append({
                    "column": col,
                    "missing_count": m_count,
                    "percentage": round(m_count / total_rows * 100, 2)
                })

        # Correlations
        correlations = {}
        if len(num_cols) >= 2:
            corr_df = df[num_cols].corr(method="pearson").round(3)
            correlations = {
                "columns": num_cols,
                "matrix": corr_df.fillna(0).to_dict(orient="split")["data"]
            }

        # Numerical distributions
        num_dist = {}
        for col in num_cols:
            series = df[col].dropna()
            if len(series) > 0:
                q25 = float(series.quantile(0.25))
                q75 = float(series.quantile(0.75))
                num_dist[col] = {
                    "mean": round(float(series.mean()), 2),
                    "std": round(float(series.std()), 2),
                    "median": round(float(series.median()), 2),
                    "iqr": round(q75 - q25, 2),
                    "min": round(float(series.min()), 2),
                    "max": round(float(series.max()), 2),
                    "skewness": round(float(series.skew()), 2) if len(series) > 2 else 0.0,
                    "kurtosis": round(float(series.kurtosis()), 2) if len(series) > 3 else 0.0,
                }

        # Categorical breakdowns
        cat_dist = {}
        for col in cat_cols:
            val_counts = df[col].value_counts().head(5).to_dict()
            cat_dist[col] = {
                "unique_values": int(df[col].nunique()),
                "top_categories": [{"label": str(k), "count": int(v)} for k, v in val_counts.items()]
            }

        # Automated Analytical Insights
        insights = []
        # Missing data insights
        if overview["duplicate_rows_count"] > 0:
            insights.append(f"Identified {overview['duplicate_rows_count']} duplicated rows ({round(overview['duplicate_rows_count']/total_rows*100, 1)}% of dataset) that warrant deduplication.")
        else:
            insights.append("No duplicate rows detected; row uniqueness integrity is 100%.")

        # Correlation insights
        if len(num_cols) >= 2 and correlations.get("matrix"):
            matrix = correlations["matrix"]
            strong_pairs = []
            for i in range(len(num_cols)):
                for j in range(i + 1, len(num_cols)):
                    val = matrix[i][j]
                    if abs(val) >= 0.5:
                        strong_pairs.append((num_cols[i], num_cols[j], val))
            for c1, c2, val in strong_pairs[:3]:
                polarity = "positive" if val > 0 else "negative"
                insights.append(f"Significant {polarity} correlation (r = {val:.2f}) observed between '{c1}' and '{c2}'.")

        # Skewness insights
        for col, stats in num_dist.items():
            if abs(stats["skewness"]) > 1.2:
                direction = "right-skewed (positive tail)" if stats["skewness"] > 0 else "left-skewed (negative tail)"
                insights.append(f"Feature '{col}' is heavily {direction} (skewness = {stats['skewness']}). Consider log or Box-Cox transformation for linear models.")
                break

        return EDAResponse(
            dataset_id=dataset.id,
            dataset_name=dataset.name,
            overview=overview,
            correlations=correlations,
            missing_data_summary=missing_summary,
            numerical_distributions=num_dist,
            categorical_breakdowns=cat_dist,
            automated_insights=insights
        )
