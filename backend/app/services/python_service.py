import sys
import io
import time
import json
import traceback
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService
from app.schemas.analytics import PythonScriptResponse

class PythonAnalyticsService:
    @staticmethod
    def execute_script(code: str, dataset: Optional[Dataset] = None) -> PythonScriptResponse:
        start_time = time.time()
        output_buffer = io.StringIO()

        # Build execution sandbox
        df = None
        if dataset:
            df = DatasetService.load_dataframe(dataset)

        local_scope = {
            "pd": pd,
            "np": np,
            "df": df.copy() if df is not None else None,
            "result_df": None
        }

        # Whitelist safe modules for import
        ALLOWED_MODULES = {"pandas", "numpy", "scipy", "math", "statistics", "datetime", "json", "re"}

        def safe_import(name, *args, **kwargs):
            base_mod = name.split(".")[0]
            if base_mod in ALLOWED_MODULES:
                return __import__(name, *args, **kwargs)
            raise ImportError(f"Import of module '{name}' is restricted for security.")

        # Safe restricted builtins
        safe_builtins = {
            "__import__": safe_import,
            "print": lambda *args, **kwargs: print(*args, file=output_buffer, **kwargs),
            "range": range,
            "len": len,
            "min": min,
            "max": max,
            "sum": sum,
            "abs": abs,
            "round": round,
            "sorted": sorted,
            "enumerate": enumerate,
            "zip": zip,
            "map": map,
            "filter": filter,
            "list": list,
            "dict": dict,
            "set": set,
            "tuple": tuple,
            "str": str,
            "int": int,
            "float": float,
            "bool": bool,
            "isinstance": isinstance
        }
        global_scope = {"__builtins__": safe_builtins}

        original_stdout = sys.stdout
        try:
            sys.stdout = output_buffer
            exec(code, global_scope, local_scope)
            sys.stdout = original_stdout

            exec_duration = round((time.time() - start_time) * 1000, 2)
            stdout_text = output_buffer.getvalue()

            # Check if dataframe was modified or produced
            active_df = local_scope.get("result_df")
            if active_df is None or not isinstance(active_df, pd.DataFrame):
                active_df = local_scope.get("df")

            preview_records = None
            cols = None
            shape = None
            if isinstance(active_df, pd.DataFrame):
                preview_records = json.loads(active_df.head(20).to_json(orient="records", date_format="iso"))
                cols = [str(c) for c in active_df.columns]
                shape = [int(active_df.shape[0]), int(active_df.shape[1])]

            return PythonScriptResponse(
                output=stdout_text if stdout_text else "Execution completed with no console output.",
                execution_time_ms=exec_duration,
                dataframe_preview=preview_records,
                dataframe_columns=cols,
                dataframe_shape=shape
            )

        except Exception as e:
            sys.stdout = original_stdout
            exec_duration = round((time.time() - start_time) * 1000, 2)
            err_trace = traceback.format_exc()
            return PythonScriptResponse(
                output=output_buffer.getvalue(),
                execution_time_ms=exec_duration,
                error=f"Runtime Exception: {str(e)}\n\n{err_trace}"
            )
