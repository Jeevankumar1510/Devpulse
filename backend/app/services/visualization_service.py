from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService

class VisualizationService:
    @staticmethod
    def get_histogram_data(dataset: Dataset, column: str, bins_count: int = 12) -> List[Dict[str, Any]]:
        df = DatasetService.load_dataframe(dataset)
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            raise ValueError(f"Column '{column}' is not a valid numeric column.")

        series = df[column].dropna()
        if len(series) == 0:
            return []

        counts, bin_edges = np.histogram(series, bins=bins_count)
        result = []
        for i in range(len(counts)):
            bin_label = f"{bin_edges[i]:.1f} - {bin_edges[i+1]:.1f}"
            result.append({
                "bin": bin_label,
                "bin_start": round(float(bin_edges[i]), 2),
                "bin_end": round(float(bin_edges[i+1]), 2),
                "count": int(counts[i])
            })
        return result

    @staticmethod
    def get_boxplot_data(dataset: Dataset, column: str, group_by: Optional[str] = None) -> List[Dict[str, Any]]:
        df = DatasetService.load_dataframe(dataset)
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            raise ValueError(f"Column '{column}' is not a valid numeric column.")

        results = []
        if group_by and group_by in df.columns:
            for grp_val, sub_df in df.groupby(group_by):
                s = sub_df[column].dropna()
                if len(s) > 0:
                    q1 = float(s.quantile(0.25))
                    q3 = float(s.quantile(0.75))
                    iqr = q3 - q1
                    whisker_low = max(float(s.min()), q1 - 1.5 * iqr)
                    whisker_high = min(float(s.max()), q3 + 1.5 * iqr)
                    outliers = s[(s < whisker_low) | (s > whisker_high)].tolist()
                    results.append({
                        "category": str(grp_val),
                        "min": round(whisker_low, 2),
                        "q1": round(q1, 2),
                        "median": round(float(s.median()), 2),
                        "q3": round(q3, 2),
                        "max": round(whisker_high, 2),
                        "outlier_count": len(outliers)
                    })
        else:
            s = df[column].dropna()
            if len(s) > 0:
                q1 = float(s.quantile(0.25))
                q3 = float(s.quantile(0.75))
                iqr = q3 - q1
                whisker_low = max(float(s.min()), q1 - 1.5 * iqr)
                whisker_high = min(float(s.max()), q3 + 1.5 * iqr)
                results.append({
                    "category": "Overall Distribution",
                    "min": round(whisker_low, 2),
                    "q1": round(q1, 2),
                    "median": round(float(s.median()), 2),
                    "q3": round(q3, 2),
                    "max": round(whisker_high, 2),
                    "outlier_count": int(((s < whisker_low) | (s > whisker_high)).sum())
                })
        return results

    @staticmethod
    def get_scatter_data(dataset: Dataset, x_col: str, y_col: str, category_col: Optional[str] = None, limit: int = 500) -> List[Dict[str, Any]]:
        df = DatasetService.load_dataframe(dataset)
        cols = [x_col, y_col]
        if category_col and category_col in df.columns:
            cols.append(category_col)
        
        valid = df[cols].dropna().head(limit)
        points = []
        for _, row in valid.iterrows():
            pt = {
                "x": round(float(row[x_col]), 2) if pd.api.types.is_numeric_dtype(df[x_col]) else str(row[x_col]),
                "y": round(float(row[y_col]), 2) if pd.api.types.is_numeric_dtype(df[y_col]) else str(row[y_col]),
            }
            if category_col and category_col in df.columns:
                pt["category"] = str(row[category_col])
            points.append(pt)
        return points

    @staticmethod
    def get_aggregated_chart_data(
        dataset: Dataset, 
        dimension: str, 
        metric: str, 
        agg_func: str = "sum",
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        df = DatasetService.load_dataframe(dataset)
        if dimension not in df.columns or metric not in df.columns:
            raise ValueError("Dimension or metric column not found in dataset.")

        agg = "count" if agg_func.lower() == "count" else "mean" if agg_func.lower() == "mean" else "sum"
        grouped = df.groupby(dimension)[metric].agg(agg).reset_index()
        grouped = grouped.sort_values(by=metric, ascending=False).head(limit)

        results = []
        for _, row in grouped.iterrows():
            val = float(row[metric]) if pd.api.types.is_numeric_dtype(grouped[metric]) else int(row[metric])
            results.append({
                "label": str(row[dimension]),
                "value": round(val, 2)
            })
        return results
