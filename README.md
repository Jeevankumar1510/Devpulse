# DevPulse – Engineering Productivity & Software Quality Intelligence Platform

DevPulse is an industry-level Engineering Productivity, DORA Metrics, and Software Quality Intelligence platform coupled with a comprehensive end-to-end Data Analytics Workspace. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **FastAPI**, **Python**, **SQLAlchemy**, and **DuckDB/PostgreSQL**.

---

## 🌟 Core Architecture & Capabilities

DevPulse demonstrates the complete Data Analyst, Analytics Engineer, and BI Developer skill set from foundational transformations to advanced predictive modeling across 19 fully functional pages.

### 1. Flexible Data Analytics Workspace
- **Excel Analytics**: Cross-tabulation pivot tables (SUM, AVERAGE, COUNT, MIN, MAX), advanced Excel formula simulations (VLOOKUP, INDEX/MATCH, SUMIFS, XLOOKUP, Nested IFs), and automatic Power Query (M Language) equivalent script generation.
- **SQL Analytics Studio**: In-memory analytical SQL engine powered by DuckDB with PostgreSQL compatibility. Execute complex queries with CTEs (`WITH ... AS`), Window Functions (`RANK()`, `DENSE_RANK()`, `ROW_NUMBER()`, `LAG()`, `LEAD()`), subqueries, and execution plans (`EXPLAIN`). Safe read-only mode prevents destructive statements.
- **Python Analytics Lab**: Sandboxed Python execution environment pre-bound with Pandas (`pd`), NumPy (`np`), and dataset DataFrame (`df`). Execute custom transformations, capture console `stdout`, and render output DataFrames.
- **Data Cleaning Studio**: Interactive imputation (mean, median, mode, constant), deduplication, outlier filtering (IQR and Z-score methods), normalization (Min-Max and Standard Z-Score), and before-and-after comparison diagnostics.
- **Exploratory Data Analysis (EDA)**: Automatic EDA reporting with univariate distributions, skewness/kurtosis analysis, missingness matrix, Pearson correlation heatmaps, and AI/analytical narrative insights.
- **Statistics & Experimentation Lab**: Parametric and non-parametric hypothesis testing (Welch Two-Sample t-Test, Paired t-Test, One-Way ANOVA, Pearson Chi-Square) and A/B Testing calculator with Z-scores, p-values, 95% confidence intervals, sample size estimations, and decision guidance.
- **Visualization Studio**: Multi-chart builder using Recharts: Histograms with dynamic binning, Box plots with 5-number quantiles, Scatter plots for bivariate correlation, and Aggregated Bar/Line series.
- **ETL Pipeline Manager**: Orchestrate Extract-Transform-Load pipelines, trigger incremental warehouse syncs, and monitor execution logs.
- **Data Quality Center**: Weighted data quality scorecard (Grade A+ to F) evaluating Completeness, Uniqueness, Validity, and Consistency with column-level anomaly diagnostics.
- **Power BI Integration**: Semantic Star Schema dimensional modeling (Fact tables, Dimension tables, Many-to-One relationships), copyable DAX measure repository, and curated export documentation.
- **Predictive Analytics Lab**: Scikit-Learn pipelines for Supervised Regression, Classification, K-Means Clustering, Time-Series Forecasting, and Isolation Forest Anomaly Detection with metrics, confusion matrices, and feature importance rankings.

### 2. Specialized Engineering Intelligence
- **DORA Velocity Metrics**: Rigorous calculation of the 4 DORA metrics:
  1. *Deployment Frequency* (deploys per day)
  2. *Lead Time for Changes* (median commit-to-deploy hours)
  3. *Change Failure Rate* (% of releases causing incidents)
  4. *Mean Time to Restore (MTTR)* (hours to resolve failures)
  > [!IMPORTANT]
  > DORA metrics are calculated **strictly when reliable production deployment audit records are available**. In accordance with modern engineering standards, **commit counts are never treated as individual productivity scores**.
- **Code Review Velocity & Turnaround**: Time-to-first-review analysis, pull request size correlation, and review comment density.
- **Workflow Bottlenecks**: Automated detection of review wait states, CI/CD pipeline latency, and PR revert risks.
- **Software Quality Intelligence**: Defect density per KLOC, escape defect rates, architectural component vulnerabilities, and resolution velocity.
- **Business Intelligence**: Strategic KPI scorecards, diagnostic root-cause trees, month-over-month trend comparisons, and executive summaries with prioritized recommendations (P0, P1, P2).

---

## 🧭 The 19 Application Pages

| # | Page Name | Path | Primary Purpose |
| :-: | :--- | :--- | :--- |
| **1** | **Overview Dashboard** | `/` | Executive summary, DORA velocity index, KPI pulse, and bottleneck alerts |
| **2** | **Data Upload Center** | `/upload` | Drag-and-drop ingest for CSV, Excel (.xlsx/.xls), and JSON with metadata profiling |
| **3** | **Data Explorer** | `/explorer` | Paginated data grid with sorting, conditional filtering, and column profiling |
| **4** | **Data Cleaning Studio** | `/cleaning` | Imputation, deduplication, outlier handling, scaling, and before/after comparisons |
| **5** | **Excel Analytics** | `/excel` | Pivot tables, VLOOKUP/INDEX/MATCH/SUMIFS emulation, and Power Query M scripts |
| **6** | **SQL Studio** | `/sql` | Read-only SQL query console with CTEs, window functions, and EXPLAIN plans |
| **7** | **Python Analytics** | `/python` | Sandboxed Python runner with Pandas, NumPy, stdout capture, and table preview |
| **8** | **EDA Workspace** | `/eda` | Automated statistical moments, skewness, missingness, and correlation heatmap |
| **9** | **Statistics Lab** | `/statistics` | Hypothesis testing (t-tests, ANOVA, Chi-Square) and A/B experimentation calculator |
| **10** | **Visualization Studio** | `/visualizations` | Histograms, box plots, scatter correlations, and aggregated bar/line charts |
| **11** | **ETL Pipeline Manager** | `/etl` | Pipeline stage designer, incremental sync simulator, and execution audit logs |
| **12** | **Data Quality Center** | `/quality` | Four-dimension scorecard (Completeness, Uniqueness, Validity, Consistency) |
| **13** | **Power BI Integration** | `/powerbi` | Star schema architecture, DAX measure library, and curated dimensional exports |
| **14** | **Predictive Lab** | `/predictive` | Scikit-Learn Regression, Classification, Clustering, Forecasting, and Anomalies |
| **15** | **GitHub Analytics** | `/github-analytics` | PR turnaround, code review velocity, CI pass rates, and DORA benchmarks |
| **16** | **Software Quality** | `/software-quality` | Defect density per KLOC, MTTR, escape defects, and component risk ranking |
| **17** | **Business Insights** | `/business-insights` | KPI management, root-cause diagnostic trees, and prioritized action roadmaps |
| **18** | **Report Center** | `/reports` | Automated Markdown, HTML, and JSON intelligence report generation and export |
| **19** | **Settings & Integrations** | `/settings` | System health, database connectivity, GitHub tokens, and query guardrails |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons, clsx, tailwind-merge.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, Uvicorn, Pydantic v2.
- **Data & Scientific Libraries**: Pandas, NumPy, SciPy, Statsmodels, Scikit-learn, OpenPyXL, DuckDB.
- **Databases**: SQLite (default local zero-config) / PostgreSQL (configured via `DATABASE_URL`), DuckDB (in-memory OLAP query engine).

---

## 🚀 Quickstart & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Setup Workspace
```bash
git clone <repo-url> DEVPULSE
cd DEVPULSE
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install fastapi uvicorn sqlalchemy pandas numpy scipy scikit-learn statsmodels openpyxl duckdb pydantic-settings python-multipart pytest httpx

# Run test suite
pytest tests/test_analytics.py -v

# Start FastAPI Server (runs on http://localhost:8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install npm dependencies
npm install

# Run Next.js production build check
npm run build

# Start Next.js Development Server (runs on http://localhost:3000)
npm run dev
```

### 4. Single-Command Launch (Both Backend and Frontend)
```bash
python start_devpulse.py
```
Open **http://localhost:3000** in your browser.

---

## 📊 Seeded Datasets & Transparency Disclosures

DevPulse seeds 4 realistic demo datasets upon first launch to enable immediate interactive exploration:

1. **`engineering_productivity.csv`**: 400 pull requests with log-normal review turnaround distributions, code changes, CI runtimes, and revert outcomes.
2. **`ci_cd_deployments.csv`**: 180 production release events with deployment statuses, lead times, and recovery durations for reliable DORA metric benchmarking.
3. **`software_defects.csv`**: 250 multi-component bug records with severity tiers, escape rates, and resolution times.
4. **`enterprise_sales.csv`**: 500 B2B contract transactions with regional breakdowns, customer satisfaction scores, and predictive churn risk indicators.

> [!NOTE]
> All preloaded demo datasets are explicitly tagged with `is_synthetic: true` and have visible disclosure banners in the UI detailing their generative statistical origin.

---

## 🧪 Automated Test Coverage

The platform includes comprehensive unit and integration tests covering all analytical engines and REST endpoints:

```bash
pytest backend/tests/test_analytics.py -v
```

Tests verified:
- `test_health_check`: Root and health probes
- `test_list_datasets`: Dataset inventory and synthetic tags
- `test_explorer_preview`: Paginated preview and column profiling
- `test_sql_studio_execution`: CTEs, Window ranking (`RANK()`), and `EXPLAIN` query plans
- `test_data_cleaning_operations`: Imputation, deduplication, and IQR outlier removal
- `test_excel_pivot_table`: Cross-tabulation multidimensional summaries
- `test_excel_formula_demonstration`: VLOOKUP and Power Query M code generation
- `test_python_analytics_execution`: Sandboxed DataFrame transformations and stdout
- `test_eda_report`: Statistical moments, skewness, and Pearson correlation matrices
- `test_statistics_hypothesis_test`: Welch's t-test and ANOVA variance ratios
- `test_ab_testing_calculator`: Two-proportion Z-test, p-value, and confidence intervals
- `test_predictive_machine_learning`: Linear Regression, R², RMSE, and feature importance
- `test_engineering_intelligence_and_dora`: DORA metrics and engineering bottlenecks
- `test_business_insights`: Executive summaries, root-cause trees, and recommendation roadmaps
