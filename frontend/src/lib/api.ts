const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) errorMsg = errorData.detail;
      } catch {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Call failed on ${endpoint}:`, err);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 1. Datasets
export const api = {
  getDatasets: (category?: string) => 
    request<any[]>(`/datasets/${category ? `?category=${category}` : ""}`),
  
  getDataset: (id: string) => 
    request<any>(`/datasets/${id}`),

  uploadDataset: async (file: File, description: string, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("category", category);

    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Upload failed");
    }
    return await res.json();
  },

  deleteDataset: (id: string) => 
    request<any>(`/datasets/${id}`, { method: "DELETE" }),

  // 2. Overview
  getOverviewMetrics: () => 
    request<any>("/overview/metrics"),

  // 3. Explorer
  getPreview: (
    id: string, 
    page: number = 1, 
    pageSize: number = 50, 
    sortBy?: string, 
    sortOrder: string = "asc",
    filterCol?: string,
    filterVal?: string
  ) => {
    let q = `/explorer/preview/${id}?page=${page}&page_size=${pageSize}&sort_order=${sortOrder}`;
    if (sortBy) q += `&sort_by=${sortBy}`;
    if (filterCol && filterVal) q += `&filter_col=${encodeURIComponent(filterCol)}&filter_val=${encodeURIComponent(filterVal)}`;
    return request<any>(q);
  },

  // 4. Cleaning
  applyCleaning: (datasetId: string, operations: any[]) =>
    request<any>("/cleaning/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_id: datasetId, operations }),
    }),

  // 5. Excel
  getPivotTable: (datasetId: string, rows: string[], columns: string[], values: string, aggFunc: string = "sum") =>
    request<any>("/excel/pivot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_id: datasetId, rows, columns, values, agg_func: aggFunc }),
    }),

  demonstrateFormula: (datasetId: string, formulaType: string, parameters: any) =>
    request<any>("/excel/formula", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_id: datasetId, formula_type: formulaType, parameters }),
    }),

  // 6. SQL Studio
  executeSQL: (query: string, datasetId?: string) =>
    request<any>("/sql/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, dataset_id: datasetId }),
    }),

  getQueryHistory: () =>
    request<any[]>("/sql/history"),

  // 7. Python
  executePython: (code: string, datasetId?: string) =>
    request<any>("/python/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, dataset_id: datasetId }),
    }),

  // 8. EDA
  getEDAReport: (datasetId: string) =>
    request<any>(`/eda/report/${datasetId}`),

  // 9. Statistics
  getDescriptiveStats: (datasetId: string) =>
    request<any>(`/statistics/descriptive/${datasetId}`),

  runHypothesisTest: (data: any) =>
    request<any>("/statistics/hypothesis-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  calculateABTest: (data: any) =>
    request<any>("/statistics/ab-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // 10. Visualizations
  getHistogram: (datasetId: string, column: string, bins: number = 12) =>
    request<any>(`/visualizations/histogram/${datasetId}?column=${column}&bins=${bins}`),

  getBoxplot: (datasetId: string, column: string, groupBy?: string) =>
    request<any>(`/visualizations/boxplot/${datasetId}?column=${column}${groupBy ? `&group_by=${groupBy}` : ""}`),

  getScatter: (datasetId: string, xCol: string, yCol: string, categoryCol?: string) =>
    request<any>(`/visualizations/scatter/${datasetId}?x_col=${xCol}&y_col=${yCol}${categoryCol ? `&category_col=${categoryCol}` : ""}`),

  getAggregatedChart: (datasetId: string, dimension: string, metric: string, aggFunc: string = "sum") =>
    request<any>(`/visualizations/aggregated/${datasetId}?dimension=${dimension}&metric=${metric}&agg_func=${aggFunc}`),

  // 11. ETL
  getPipelines: () =>
    request<any[]>("/etl/pipelines"),

  runPipeline: (id: string) =>
    request<any>(`/etl/run/${id}`, { method: "POST" }),

  getPipelineLogs: (id: string) =>
    request<any[]>(`/etl/logs/${id}`),

  // 12. Quality
  getQualityAudit: (datasetId: string) =>
    request<any>(`/quality/audit/${datasetId}`),

  // 13. Power BI
  getStarSchema: () =>
    request<any>("/powerbi/star-schema"),

  getDaxMeasures: () =>
    request<any[]>("/powerbi/dax-measures"),

  // 14. Predictive
  trainMLModel: (data: any) =>
    request<any>("/predictive/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // 15. GitHub Analytics
  getEngineeringMetrics: (timeframe: string = "last_90_days") =>
    request<any>(`/github-analytics/metrics?timeframe=${timeframe}`),

  // 16. Software Quality
  getSoftwareQualityMetrics: () =>
    request<any>("/software-quality/metrics"),

  // 17. Business Insights
  getBusinessInsights: () =>
    request<any>("/business-insights/overview"),

  // 18. Reports
  generateReport: (reportType: string = "engineering_dora", format: string = "markdown") =>
    request<any>(`/reports/generate?report_type=${reportType}&format=${format}`),

  // 19. Settings
  getSystemStatus: () =>
    request<any>("/settings/status"),
};
