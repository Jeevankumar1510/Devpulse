import json
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService
from app.schemas.analytics import PivotTableRequest, PivotTableResponse, FormulaDemoResponse

class ExcelService:
    @staticmethod
    def create_pivot_table(req: PivotTableRequest, dataset: Dataset) -> PivotTableResponse:
        df = DatasetService.load_dataframe(dataset)
        
        # Validate columns
        for col in req.rows:
            if col not in df.columns:
                raise ValueError(f"Index column '{col}' not found in dataset.")
        
        valid_cols = [c for c in (req.columns or []) if c in df.columns]
        if req.values not in df.columns:
            raise ValueError(f"Values column '{req.values}' not found in dataset.")

        agg_map = {
            "sum": "sum",
            "count": "count",
            "mean": "mean",
            "min": "min",
            "max": "max",
            "std": "std"
        }
        agg = agg_map.get(req.agg_func.lower(), "sum")

        pivot_df = pd.pivot_table(
            df,
            index=req.rows,
            columns=valid_cols if valid_cols else None,
            values=req.values,
            aggfunc=agg,
            fill_value=0,
            margins=True,
            margins_name="Total"
        )

        # Flatten multi-index if present
        if isinstance(pivot_df.columns, pd.MultiIndex):
            col_headers = ["_".join([str(c) for c in col]).strip("_") for col in pivot_df.columns.values]
        else:
            col_headers = [str(c) for c in pivot_df.columns]

        # Reset index for JSON presentation
        reset_df = pivot_df.reset_index()
        reset_df.columns = [str(c) for c in reset_df.columns]

        records = json.loads(reset_df.to_json(orient="records"))
        
        return PivotTableResponse(
            index_names=req.rows,
            column_names=list(reset_df.columns),
            data=records[:500]
        )

    @staticmethod
    def demonstrate_formula(formula_type: str, params: Dict[str, Any], dataset: Dataset) -> FormulaDemoResponse:
        df = DatasetService.load_dataframe(dataset)
        ftype = formula_type.lower()
        
        if ftype == "vlookup":
            key_col = params.get("lookup_column", df.columns[0])
            val_col = params.get("return_column", df.columns[1] if len(df.columns) > 1 else df.columns[0])
            sample_val = params.get("lookup_value", df[key_col].dropna().iloc[0] if len(df[key_col].dropna()) > 0 else "")

            match_row = df[df[key_col].astype(str) == str(sample_val)]
            res_val = match_row[val_col].iloc[0] if not match_row.empty else "N/A"

            expr = f'=VLOOKUP("{sample_val}", A:D, 3, FALSE)'
            expl = f"Searches for '{sample_val}' in first column '{key_col}' and returns value from '{val_col}'."
            m_code = f'Table.NestedJoin(TableA, {{"{key_col}"}}, TableB, {{"{key_col}"}}, "Match", JoinKind.LeftOuter)'
            eval_res = [{"lookup_key": sample_val, "matched_value": str(res_val), "status": "MATCH_FOUND" if not match_row.empty else "NOT_FOUND"}]

        elif ftype == "sumifs":
            val_col = params.get("sum_column", [c for c in df.select_dtypes(include=[np.number]).columns] or [df.columns[0]])
            val_col = val_col[0] if isinstance(val_col, list) and val_col else val_col
            crit_col = params.get("criteria_column", df.columns[0])
            crit_val = params.get("criteria_value", df[crit_col].dropna().iloc[0] if len(df[crit_col].dropna()) > 0 else "")

            filtered = df[df[crit_col].astype(str) == str(crit_val)]
            sum_res = float(filtered[val_col].sum()) if val_col in filtered.columns else 0.0

            expr = f'=SUMIFS({val_col}_Range, {crit_col}_Range, "{crit_val}")'
            expl = f"Calculates sum of '{val_col}' where '{crit_col}' equals '{crit_val}'."
            m_code = f'Table.Group(Source, {{"{crit_col}"}}, {{"Total", each List.Sum([#"{val_col}"]), type number}})'
            eval_res = [{"criteria_column": crit_col, "criteria_value": crit_val, "sum_result": round(sum_res, 2), "matched_records": len(filtered)}]

        elif ftype == "index_match":
            key_col = params.get("lookup_column", df.columns[0])
            ret_col = params.get("return_column", df.columns[1] if len(df.columns) > 1 else df.columns[0])
            sample_val = params.get("lookup_value", df[key_col].dropna().iloc[0] if len(df[key_col].dropna()) > 0 else "")
            
            match_row = df[df[key_col].astype(str) == str(sample_val)]
            val = match_row[ret_col].iloc[0] if not match_row.empty else "#N/A"

            expr = f'=INDEX({ret_col}_Range, MATCH("{sample_val}", {key_col}_Range, 0))'
            expl = f"INDEX retrieves value from '{ret_col}' at the exact row position MATCH located '{sample_val}' in '{key_col}' (safer than VLOOKUP)."
            m_code = f'let matched = Table.SelectRows(Source, each [#{key_col}] = "{sample_val}") in matched[#{ret_col}]{{0}}'
            eval_res = [{"lookup_value": sample_val, "result": str(val)}]

        elif ftype == "xlookup":
            key_col = params.get("lookup_column", df.columns[0])
            ret_col = params.get("return_column", df.columns[1] if len(df.columns) > 1 else df.columns[0])
            sample_val = params.get("lookup_value", "PR-1005")

            expr = f'=XLOOKUP("{sample_val}", {key_col}_Col, {ret_col}_Col, "Not Found", 0)'
            expl = "Modern bi-directional lookup with default not-found handling and native array spill capabilities."
            m_code = f'Record.FieldOrDefault(Table.First(Table.SelectRows(Source, each [#{key_col}] = "{sample_val}")), "{ret_col}", "Not Found")'
            eval_res = [{"lookup_target": sample_val, "result": "Retrieved via dynamic array index"}]

        else: # nested_if
            expr = '=IF(LeadTime > 48, "Critical Delay", IF(LeadTime > 24, "Slow", "Optimal"))'
            expl = "Multi-level conditional tiering evaluating SLA thresholds."
            m_code = 'Table.AddColumn(Source, "SLA_Tier", each if [LeadTime] > 48 then "Critical Delay" else if [LeadTime] > 24 then "Slow" else "Optimal")'
            eval_res = [
                {"condition": "LeadTime > 48h", "tier": "Critical Delay"},
                {"condition": "LeadTime 24-48h", "tier": "Slow"},
                {"condition": "LeadTime < 24h", "tier": "Optimal"}
            ]

        return FormulaDemoResponse(
            formula_expression=expr,
            formula_explanation=expl,
            evaluated_results=eval_res,
            power_query_m_equivalent=m_code
        )
