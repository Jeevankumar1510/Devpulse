import time
import uuid
import re
import duckdb
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database import duckdb_conn
from app.models.dataset import Dataset
from app.models.query_history import QueryHistory
from app.services.dataset_service import DatasetService
from app.schemas.analytics import SQLExecuteResponse

FORBIDDEN_KEYWORDS = [
    r"\bDROP\b", r"\bDELETE\b", r"\bTRUNCATE\b", r"\bALTER\b", 
    r"\bUPDATE\b", r"\bINSERT\b", r"\bGRANT\b", r"\bREVOKE\b"
]

class SQLService:
    @staticmethod
    def execute_query(query: str, dataset_id: Optional[str], db: Session) -> SQLExecuteResponse:
        start_time = time.time()
        
        # 1. Security Check: Prevent destructive DDL/DML in analytical studio
        clean_q = query.strip()
        for pattern in FORBIDDEN_KEYWORDS:
            if re.search(pattern, clean_q, re.IGNORECASE):
                return SQLExecuteResponse(
                    columns=[],
                    rows=[],
                    row_count=0,
                    execution_time_ms=0,
                    error=f"Security violation: Query contains non-read-only analytical keyword '{pattern.replace(chr(92) + 'b', '')}'."
                )

        # 2. Register dataset if specified
        if dataset_id:
            ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            if ds:
                df = DatasetService.load_dataframe(ds)
                clean_df = df.copy()
                clean_df.columns = [str(c).replace(" ", "_").replace("-", "_").lower() for c in clean_df.columns]
                duckdb_conn.register("target_table", clean_df)
                duckdb_conn.register("dataset", clean_df)
                duckdb_conn.register(ds.name.lower().replace(" ", "_"), clean_df)

        try:
            # Generate EXPLAIN plan
            plan_str = None
            try:
                plan_res = duckdb_conn.execute(f"EXPLAIN {clean_q}").fetchall()
                plan_str = "\n".join([str(r[1]) if len(r) > 1 else str(r[0]) for r in plan_res])
            except Exception:
                plan_str = "Execution plan not available for this query construct."

            # Execute actual query
            result = duckdb_conn.execute(clean_q)
            cols = [desc[0] for desc in result.description] if result.description else []
            raw_rows = result.fetchdf()
            
            # Format rows as JSON friendly
            rows = raw_rows.to_dict(orient="records")
            row_count = len(rows)
            duration_ms = round((time.time() - start_time) * 1000, 2)

            # Log to QueryHistory
            history = QueryHistory(
                id=str(uuid.uuid4()),
                query_text=query,
                dataset_id=dataset_id,
                status="SUCCESS",
                execution_time_ms=duration_ms,
                row_count=row_count
            )
            db.add(history)
            db.commit()

            return SQLExecuteResponse(
                columns=cols,
                rows=rows[:1000], # safe cap for UI
                row_count=row_count,
                execution_time_ms=duration_ms,
                query_plan=plan_str
            )
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            err_msg = str(e)
            
            history = QueryHistory(
                id=str(uuid.uuid4()),
                query_text=query,
                dataset_id=dataset_id,
                status="ERROR",
                execution_time_ms=duration_ms,
                row_count=0,
                error_message=err_msg
            )
            db.add(history)
            db.commit()

            return SQLExecuteResponse(
                columns=[],
                rows=[],
                row_count=0,
                execution_time_ms=duration_ms,
                error=err_msg
            )
