import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_demo_datasets

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_demo_datasets(db)
    db.close()
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_list_datasets(client):
    res = client.get("/api/v1/datasets/")
    assert res.status_code == 200
    datasets = res.json()
    assert len(datasets) >= 4
    assert any(d["id"] == "demo-eng-productivity" for d in datasets)

def test_explorer_preview(client):
    res = client.get("/api/v1/explorer/preview/demo-eng-productivity?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 400
    assert len(data["data"]) == 10
    assert "columns" in data

def test_sql_studio_execution(client):
    # Test SELECT with CTE and Window Function
    query = """
    WITH repo_agg AS (
        SELECT repo_name, AVG(lead_time_hours) as avg_lt
        FROM current_dataset
        GROUP BY repo_name
    )
    SELECT repo_name, avg_lt,
           RANK() OVER (ORDER BY avg_lt ASC) as rank_velocity
    FROM repo_agg
    ORDER BY rank_velocity;
    """
    res = client.post("/api/v1/sql/execute", json={
        "query": query,
        "dataset_id": "demo-eng-productivity"
    })
    assert res.status_code == 200
    result = res.json()
    assert result["error"] is None
    assert len(result["rows"]) > 0
    assert "rank_velocity" in result["columns"]
    assert result["query_plan"] is not None

def test_data_cleaning_operations(client):
    res = client.post("/api/v1/cleaning/apply", json={
        "dataset_id": "demo-enterprise-sales",
        "operations": [
            {"type": "drop_duplicates"},
            {"type": "fill_na", "column": "discount_pct", "strategy": "mean"},
            {"type": "remove_outliers", "column": "contract_value_usd", "strategy": "iqr"}
        ]
    })
    assert res.status_code == 200
    result = res.json()
    assert result["cleaned_row_count"] > 0
    assert result["operations_applied"] == 3

def test_excel_pivot_table(client):
    res = client.post("/api/v1/excel/pivot", json={
        "dataset_id": "demo-enterprise-sales",
        "rows": ["region"],
        "columns": ["customer_segment"],
        "values": "net_revenue_usd",
        "agg_func": "sum"
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["data"]) > 0
    assert "index_names" in data

def test_excel_formula_demonstration(client):
    res = client.post("/api/v1/excel/formula", json={
        "dataset_id": "demo-eng-productivity",
        "formula_type": "vlookup",
        "parameters": {
            "lookup_column": "pr_id",
            "return_column": "lead_time_hours",
            "lookup_value": "PR-1001"
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert "=VLOOKUP" in data["formula_expression"]
    assert "power_query_m_equivalent" in data

def test_python_analytics_execution(client):
    code = """
import pandas as pd
result_df = df.groupby('repo_name')['lead_time_hours'].agg(['mean', 'count']).reset_index()
print('Aggregated rows:', len(result_df))
"""
    res = client.post("/api/v1/python/execute", json={
        "dataset_id": "demo-eng-productivity",
        "code": code
    })
    assert res.status_code == 200
    data = res.json()
    assert data["error"] is None
    assert "Aggregated rows: 5" in data["output"]
    assert len(data["dataframe_preview"]) > 0

def test_eda_report(client):
    res = client.get("/api/v1/eda/report/demo-enterprise-sales")
    assert res.status_code == 200
    data = res.json()
    assert "overview" in data
    assert "correlations" in data
    assert len(data["automated_insights"]) > 0

def test_statistics_hypothesis_test(client):
    res = client.post("/api/v1/statistics/hypothesis-test", json={
        "dataset_id": "demo-eng-productivity",
        "test_type": "two_sample_ttest",
        "col_a": "lead_time_hours",
        "group_col": "has_test_coverage"
    })
    assert res.status_code == 200
    data = res.json()
    assert "statistic_value" in data
    assert "p_value" in data
    assert "interpretation" in data

def test_ab_testing_calculator(client):
    res = client.post("/api/v1/statistics/ab-test", json={
        "control_visitors": 10000,
        "control_conversions": 500,
        "variant_visitors": 10000,
        "variant_conversions": 620,
        "confidence_level": 0.95
    })
    assert res.status_code == 200
    data = res.json()
    assert data["is_statistically_significant"] is True
    assert data["relative_uplift_pct"] == 24.0

def test_predictive_machine_learning(client):
    # Test Regression
    res = client.post("/api/v1/predictive/train", json={
        "dataset_id": "demo-eng-productivity",
        "target_column": "lead_time_hours",
        "feature_columns": ["lines_added", "lines_deleted", "files_changed", "review_turnaround_hours"],
        "task_type": "regression",
        "algorithm": "linear_regression"
    })
    assert res.status_code == 200
    data = res.json()
    assert "r_squared" in data["metrics"]
    assert len(data["feature_importance"]) > 0

def test_engineering_intelligence_and_dora(client):
    res = client.get("/api/v1/github-analytics/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["has_reliable_deployment_data"] is True
    assert "deployment_frequency" in data["dora_metrics"]
    assert "change_failure_rate" in data["dora_metrics"]
    assert len(data["bottlenecks"]) > 0

def test_business_insights(client):
    res = client.get("/api/v1/business-insights/overview")
    assert res.status_code == 200
    data = res.json()
    assert len(data["kpi_summary"]) > 0
    assert len(data["root_cause_analysis"]) > 0
    assert len(data["actionable_recommendations"]) > 0
