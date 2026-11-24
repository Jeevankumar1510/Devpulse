from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "General"

class DatasetResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    file_type: str
    file_size_bytes: int
    row_count: int
    column_count: int
    columns_metadata: List[Dict[str, Any]] = []
    is_synthetic: bool = False
    synthetic_disclosure: Optional[str] = None
    category: str = "General"
    created_at: datetime

    class Config:
        from_attributes = True

class ColumnProfile(BaseModel):
    name: str
    data_type: str
    non_null_count: int
    null_count: int
    null_percentage: float
    unique_count: int
    sample_values: List[Any] = []
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None
    mean: Optional[float] = None
    std: Optional[float] = None

class DataPreviewResponse(BaseModel):
    dataset_id: str
    total_rows: int
    page: int
    page_size: int
    total_pages: int
    columns: List[str]
    column_profiles: List[ColumnProfile]
    data: List[Dict[str, Any]]

class SQLExecuteRequest(BaseModel):
    query: str
    dataset_id: Optional[str] = None

class SQLExecuteResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    query_plan: Optional[str] = None
    error: Optional[str] = None

class CleanOperation(BaseModel):
    type: str # fill_na, drop_na, drop_duplicates, remove_outliers, normalize, convert_type
    column: Optional[str] = None
    strategy: Optional[str] = None # mean, median, mode, constant, iqr, zscore, minmax, standard
    value: Optional[Any] = None
    target_type: Optional[str] = None

class DataCleanRequest(BaseModel):
    dataset_id: str
    operations: List[CleanOperation]

class CleanResultResponse(BaseModel):
    dataset_id: str
    original_row_count: int
    cleaned_row_count: int
    operations_applied: int
    summary: Dict[str, Any]
    preview_data: List[Dict[str, Any]]

class PivotTableRequest(BaseModel):
    dataset_id: str
    rows: List[str]
    columns: Optional[List[str]] = []
    values: str
    agg_func: str = "sum" # sum, count, mean, min, max, std

class PivotTableResponse(BaseModel):
    index_names: List[str]
    column_names: List[str]
    data: List[Dict[str, Any]]
    grand_totals: Optional[Dict[str, Any]] = None

class FormulaDemoRequest(BaseModel):
    dataset_id: str
    formula_type: str # vlookup, index_match, sumifs, xlookup, nested_if
    parameters: Dict[str, Any]

class FormulaDemoResponse(BaseModel):
    formula_expression: str
    formula_explanation: str
    evaluated_results: List[Dict[str, Any]]
    power_query_m_equivalent: str

class PythonScriptRequest(BaseModel):
    dataset_id: Optional[str] = None
    code: str

class PythonScriptResponse(BaseModel):
    output: str
    execution_time_ms: float
    dataframe_preview: Optional[List[Dict[str, Any]]] = None
    dataframe_columns: Optional[List[str]] = None
    dataframe_shape: Optional[List[int]] = None
    error: Optional[str] = None

class EDAResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    overview: Dict[str, Any]
    correlations: Dict[str, Any]
    missing_data_summary: List[Dict[str, Any]]
    numerical_distributions: Dict[str, Any]
    categorical_breakdowns: Dict[str, Any]
    automated_insights: List[str]

class HypothesisTestRequest(BaseModel):
    dataset_id: str
    test_type: str # two_sample_ttest, paired_ttest, anova, chi_square
    col_a: str
    col_b: Optional[str] = None
    group_col: Optional[str] = None
    alpha: float = 0.05

class HypothesisTestResponse(BaseModel):
    test_name: str
    statistic_name: str
    statistic_value: float
    p_value: float
    degrees_of_freedom: Optional[float] = None
    alpha: float
    reject_null_hypothesis: bool
    interpretation: str
    confidence_interval: Optional[List[float]] = None

class ABTestRequest(BaseModel):
    control_visitors: int
    control_conversions: int
    variant_visitors: int
    variant_conversions: int
    confidence_level: float = 0.95

class ABTestResponse(BaseModel):
    control_cr: float
    variant_cr: float
    relative_uplift_pct: float
    absolute_difference: float
    z_score: float
    p_value: float
    confidence_interval: List[float]
    is_statistically_significant: bool
    sample_size_recommendation: int
    business_recommendation: str

class MLTrainRequest(BaseModel):
    dataset_id: str
    target_column: Optional[str] = None
    feature_columns: List[str]
    task_type: str # regression, classification, clustering, time_series, anomaly_detection
    algorithm: str # random_forest, linear_regression, logistic_regression, kmeans, isolation_forest, arima_exp
    test_size: float = 0.2
    hyperparameters: Optional[Dict[str, Any]] = None

class MLTrainResponse(BaseModel):
    task_type: str
    algorithm: str
    train_size: int
    test_size: int
    metrics: Dict[str, Any]
    feature_importance: Optional[List[Dict[str, Any]]] = None
    confusion_matrix: Optional[Dict[str, Any]] = None
    predictions_sample: List[Dict[str, Any]] = []

class DORAClassification(BaseModel):
    tier: str # Elite, High, Medium, Low
    deployment_frequency_text: str
    lead_time_text: str
    change_failure_rate_text: str
    time_to_restore_text: str
    score: float

class EngineeringIntelligenceResponse(BaseModel):
    timeframe: str
    total_pull_requests: int
    avg_review_turnaround_hours: float
    avg_pr_lead_time_hours: float
    merge_ratio_pct: float
    revert_ratio_pct: float
    defect_density_per_kloc: float
    test_coverage_pct: float
    ci_build_success_rate: float
    avg_ci_duration_minutes: float
    dora_metrics: Optional[Dict[str, Any]] = None
    has_reliable_deployment_data: bool = True
    dora_classification: Optional[DORAClassification] = None
    bottlenecks: List[Dict[str, Any]] = []
    quality_trend: List[Dict[str, Any]] = []

class BusinessInsightsResponse(BaseModel):
    overall_health_score: float
    kpi_summary: List[Dict[str, Any]]
    root_cause_analysis: List[Dict[str, Any]]
    trend_comparisons: List[Dict[str, Any]]
    executive_summary: str
    actionable_recommendations: List[Dict[str, Any]]
