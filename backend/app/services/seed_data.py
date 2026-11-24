import os
import uuid
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.config import settings
from app.models.dataset import Dataset
from app.models.kpi import KPI
from app.services.dataset_service import DatasetService

def seed_demo_datasets(db: Session):
    """Seed authentic-feeling synthetic datasets with full transparency and disclosures."""
    existing = db.query(Dataset).first()
    if existing:
        return # Already seeded

    np.random.seed(42)

    # 1. Engineering Productivity Dataset
    num_prs = 400
    repos = ["core-api", "web-dashboard", "data-pipeline", "auth-service", "infra-deploy"]
    roles = ["Senior Engineer", "Staff Engineer", "Mid-level Engineer", "Junior Engineer"]
    ci_statuses = ["PASSED", "PASSED", "PASSED", "FAILED", "PASSED"]

    start_date = datetime(2026, 1, 1)
    pr_data = []
    
    for i in range(1, num_prs + 1):
        repo = np.random.choice(repos)
        role = np.random.choice(roles, p=[0.3, 0.15, 0.35, 0.2])
        created = start_date + timedelta(days=np.random.randint(0, 150), hours=np.random.randint(0, 24))
        
        # Turnaround correlates slightly with PR size
        lines_add = int(np.random.exponential(scale=120) + 10)
        lines_del = int(lines_add * np.random.uniform(0.1, 0.8))
        files = max(1, int((lines_add + lines_del) / 45) + np.random.randint(-1, 3))
        
        # Review turnaround hours
        review_turnaround = round(float(np.random.lognormal(mean=2.6, sigma=0.8)), 1)
        lead_time = round(review_turnaround + float(np.random.exponential(scale=14)), 1)
        
        merged = created + timedelta(hours=lead_time)
        comments = max(0, int(np.random.poisson(lam=4) + (lines_add / 150)))
        ci_stat = np.random.choice(ci_statuses)
        ci_dur = round(float(np.random.normal(loc=12, scale=3.5)), 1)
        ci_dur = max(2.0, ci_dur)
        has_tests = np.random.choice([True, True, True, False], p=[0.75, 0.1, 0.1, 0.05])
        
        # 4% chance of revert
        is_reverted = np.random.choice([0, 1], p=[0.96, 0.04])
        revert_time = round(float(np.random.uniform(1.5, 18.0)), 1) if is_reverted else 0.0

        pr_data.append({
            "pr_id": f"PR-{1000 + i}",
            "repo_name": repo,
            "author_role": role,
            "created_at": created.strftime("%Y-%m-%d %H:%M:%S"),
            "merged_at": merged.strftime("%Y-%m-%d %H:%M:%S"),
            "lead_time_hours": lead_time,
            "review_turnaround_hours": review_turnaround,
            "review_comments": comments,
            "lines_added": lines_add,
            "lines_deleted": lines_del,
            "files_changed": files,
            "ci_status": ci_stat,
            "ci_duration_min": ci_dur,
            "has_test_coverage": "Yes" if has_tests else "No",
            "is_reverted": is_reverted,
            "revert_resolution_hours": revert_time
        })

    df_eng = pd.DataFrame(pr_data)
    eng_path = os.path.join(settings.DEMO_DATA_PATH, "engineering_productivity.csv")
    df_eng.to_csv(eng_path, index=False)

    ds_eng = Dataset(
        id="demo-eng-productivity",
        name="Engineering Productivity & PR Velocity",
        description="PR review cycle times, code changes, CI/CD duration, and merge outcomes across microservices.",
        file_path=eng_path,
        file_type="csv",
        file_size_bytes=os.path.getsize(eng_path),
        row_count=len(df_eng),
        column_count=len(df_eng.columns),
        columns_metadata=DatasetService.inspect_dataframe(df_eng),
        is_synthetic=True,
        synthetic_disclosure="Synthetic dataset generated using calibrated log-normal distributions to simulate engineering team velocity.",
        category="Engineering"
    )
    db.add(ds_eng)

    # 2. CI/CD Deployments Dataset (Reliable DORA source)
    dep_data = []
    dep_count = 180
    for i in range(1, dep_count + 1):
        srv = np.random.choice(repos)
        dep_date = start_date + timedelta(days=int(i * 0.8), hours=np.random.randint(8, 20))
        # 8% change failure rate
        failed = np.random.choice([0, 1], p=[0.92, 0.08])
        status = "Failed" if failed else "Success"
        ttr = round(float(np.random.exponential(scale=2.8) + 0.5), 1) if failed else 0.0
        lead_time_deploy = round(float(np.random.normal(loc=18.5, scale=4.0)), 1)

        dep_data.append({
            "deployment_id": f"DEP-{5000 + i}",
            "service_name": srv,
            "environment": "Production",
            "deployed_at": dep_date.strftime("%Y-%m-%d %H:%M:%S"),
            "status": status,
            "lead_time_hours": max(2.0, lead_time_deploy),
            "is_failure": failed,
            "time_to_restore_hours": ttr,
            "change_type": np.random.choice(["Feature", "Bugfix", "Config", "Hotfix"], p=[0.6, 0.25, 0.1, 0.05])
        })

    df_dep = pd.DataFrame(dep_data)
    dep_path = os.path.join(settings.DEMO_DATA_PATH, "ci_cd_deployments.csv")
    df_dep.to_csv(dep_path, index=False)

    ds_dep = Dataset(
        id="demo-ci-cd-deployments",
        name="CI/CD Deployments & DORA Reliability",
        description="Production releases, deployment duration, change failure outcomes, and incident recovery durations.",
        file_path=dep_path,
        file_type="csv",
        file_size_bytes=os.path.getsize(dep_path),
        row_count=len(df_dep),
        column_count=len(df_dep.columns),
        columns_metadata=DatasetService.inspect_dataframe(df_dep),
        is_synthetic=True,
        synthetic_disclosure="Synthetic verified production release audit log calibrated for reliable DORA benchmarking.",
        category="Engineering"
    )
    db.add(ds_dep)

    # 3. Software Defects Dataset
    num_defects = 250
    components = ["Authentication", "Billing & Checkout", "API Gateway", "Search & Indexer", "Notification Service", "Analytics UI"]
    severities = ["Critical", "High", "Medium", "Low"]
    causes = ["Concurrency/Race Condition", "Unhandled Null/Missing Value", "Database Index Lock", "Schema Incompatibility", "Third-Party API Outage", "Input Validation Error"]
    
    defect_data = []
    for i in range(1, num_defects + 1):
        sev = np.random.choice(severities, p=[0.1, 0.25, 0.45, 0.2])
        comp = np.random.choice(components)
        cause = np.random.choice(causes)
        detected = start_date + timedelta(days=np.random.randint(0, 150), hours=np.random.randint(0, 24))
        
        # Critical defects resolved faster
        res_scale = {"Critical": 8.0, "High": 24.0, "Medium": 48.0, "Low": 96.0}[sev]
        res_time = round(float(np.random.exponential(scale=res_scale) + 1.0), 1)
        resolved = detected + timedelta(hours=res_time)
        escape = np.random.choice(["Yes", "No"], p=[0.22, 0.78])

        defect_data.append({
            "defect_id": f"BUG-{2000 + i}",
            "title": f"Issue in {comp}: {cause[:20]}",
            "severity": sev,
            "component": comp,
            "environment": np.random.choice(["Production", "Staging", "QA"], p=[0.35, 0.45, 0.2]),
            "detected_at": detected.strftime("%Y-%m-%d %H:%M:%S"),
            "resolved_at": resolved.strftime("%Y-%m-%d %H:%M:%S"),
            "resolution_time_hours": res_time,
            "root_cause": cause,
            "escape_defect": escape,
            "status": "Closed"
        })

    df_defects = pd.DataFrame(defect_data)
    defects_path = os.path.join(settings.DEMO_DATA_PATH, "software_defects.csv")
    df_defects.to_csv(defects_path, index=False)

    ds_defects = Dataset(
        id="demo-software-defects",
        name="Software Defect & Quality Intelligence",
        description="Defect tracking, severity distributions, escape rates, and mean time to resolution.",
        file_path=defects_path,
        file_type="csv",
        file_size_bytes=os.path.getsize(defects_path),
        row_count=len(df_defects),
        column_count=len(df_defects.columns),
        columns_metadata=DatasetService.inspect_dataframe(df_defects),
        is_synthetic=True,
        synthetic_disclosure="Synthetic defect intelligence dataset calibrated to reflect multi-service software bug lifecycles.",
        category="Quality"
    )
    db.add(ds_defects)

    # 4. Enterprise Sales & Customer Analytics (for BI, SQL, Statistics, ML)
    num_sales = 500
    regions = ["North America", "EMEA", "Asia Pacific", "Latin America"]
    segments = ["Enterprise", "Mid-Market", "SMB"]
    products = ["DevPulse Enterprise", "CodeQuality AI", "CloudOps Monitor", "CI/CD Accelerator"]
    
    sales_data = []
    for i in range(1, num_sales + 1):
        seg = np.random.choice(segments, p=[0.25, 0.45, 0.3])
        reg = np.random.choice(regions, p=[0.45, 0.25, 0.2, 0.1])
        prod = np.random.choice(products)
        order_date = start_date + timedelta(days=np.random.randint(0, 160))
        
        base_val = {"Enterprise": 24000, "Mid-Market": 7500, "SMB": 1800}[seg]
        val = round(float(np.random.normal(loc=base_val, scale=base_val * 0.25)), 2)
        val = max(500.0, val)
        discount = round(float(np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20])), 2)
        net_revenue = round(val * (1.0 - discount), 2)
        
        satisfaction = int(np.clip(np.random.normal(loc=8.4, scale=1.2), 1, 10))
        churn_risk = round(float(np.clip(1.0 - (satisfaction / 10.0) + np.random.normal(0, 0.1), 0.05, 0.95)), 2)

        sales_data.append({
            "order_id": f"ORD-{7000 + i}",
            "order_date": order_date.strftime("%Y-%m-%d"),
            "customer_segment": seg,
            "region": reg,
            "product_name": prod,
            "contract_value_usd": val,
            "discount_pct": discount,
            "net_revenue_usd": net_revenue,
            "customer_satisfaction_score": satisfaction,
            "churn_risk_probability": churn_risk
        })

    df_sales = pd.DataFrame(sales_data)
    sales_path = os.path.join(settings.DEMO_DATA_PATH, "enterprise_sales.csv")
    df_sales.to_csv(sales_path, index=False)

    ds_sales = Dataset(
        id="demo-enterprise-sales",
        name="Enterprise SaaS Revenue & Churn Risk",
        description="B2B contract transactions, regional segmentation, Net Promoter satisfaction, and predictive churn risk.",
        file_path=sales_path,
        file_type="csv",
        file_size_bytes=os.path.getsize(sales_path),
        row_count=len(df_sales),
        column_count=len(df_sales.columns),
        columns_metadata=DatasetService.inspect_dataframe(df_sales),
        is_synthetic=True,
        synthetic_disclosure="Synthetic B2B SaaS financial dataset generated for regression, classification, and BI dashboards.",
        category="Business"
    )
    db.add(ds_sales)

    # Seed Default KPIs
    kpis = [
        KPI(id="kpi-1", name="Deployment Frequency", category="Engineering", target_value=1.5, current_value=1.2, unit="deploys/day", status="HEALTHY", trend="UP", change_percentage=12.5, formula_description="Total production deployments divided by active engineering days."),
        KPI(id="kpi-2", name="Lead Time for Changes", category="Engineering", target_value=24.0, current_value=18.5, unit="hours", status="HEALTHY", trend="DOWN", change_percentage=-15.4, formula_description="Elapsed time from code commit to successful production deployment."),
        KPI(id="kpi-3", name="Change Failure Rate", category="Quality", target_value=5.0, current_value=7.8, unit="%", status="WARNING", trend="UP", change_percentage=8.2, formula_description="Percentage of production deployments requiring hotfix or rollback."),
        KPI(id="kpi-4", name="Mean Time to Restore (MTTR)", category="Quality", target_value=2.0, current_value=2.8, unit="hours", status="WARNING", trend="DOWN", change_percentage=-6.5, formula_description="Average hours required to recover from a production failure incident."),
        KPI(id="kpi-5", name="PR Review Turnaround", category="Engineering", target_value=12.0, current_value=14.2, unit="hours", status="HEALTHY", trend="DOWN", change_percentage=-9.1, formula_description="Time from pull request submission to first approved or commented review."),
        KPI(id="kpi-6", name="Automated Test Coverage", category="Quality", target_value=85.0, current_value=78.4, unit="%", status="WARNING", trend="UP", change_percentage=4.3, formula_description="Percentage of code executed during automated test suite runs."),
    ]
    for k in kpis:
        db.add(k)

    db.commit()
