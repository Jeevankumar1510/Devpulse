"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface DatasetItem {
  id: string;
  name: string;
  description?: string;
  file_type: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  columns_metadata?: any[];
  is_synthetic: boolean;
  synthetic_disclosure?: string;
  category: string;
}

const FALLBACK_DATASETS: DatasetItem[] = [
  {
    id: "demo-eng-productivity",
    name: "Engineering Productivity & PR Velocity",
    description: "PR review cycle times, code changes, CI/CD duration, and merge outcomes across microservices.",
    file_type: "csv",
    file_size_bytes: 48200,
    row_count: 400,
    column_count: 16,
    columns_metadata: [
      { name: "pr_id", data_type: "string", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 400 },
      { name: "repo_name", data_type: "string", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 5 },
      { name: "lead_time_hours", data_type: "float64", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 310, min: 2.5, max: 72.0, mean: 18.5 },
      { name: "review_turnaround_hours", data_type: "float64", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 280, min: 1.0, max: 48.0, mean: 14.2 },
      { name: "lines_added", data_type: "int64", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 220, min: 10, max: 1200, mean: 180 },
      { name: "lines_deleted", data_type: "int64", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 180, min: 5, max: 600, mean: 75 },
      { name: "ci_duration_min", data_type: "float64", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 90, min: 2.0, max: 25.0, mean: 12.3 },
      { name: "ci_status", data_type: "string", non_null_count: 400, null_count: 0, null_percentage: 0, unique_count: 2 }
    ],
    is_synthetic: true,
    synthetic_disclosure: "Synthetic dataset generated using calibrated log-normal distributions to simulate engineering team velocity.",
    category: "Engineering",
  },
  {
    id: "demo-ci-cd-deployments",
    name: "CI/CD Deployments & DORA Reliability",
    description: "Production releases, deployment duration, change failure outcomes, and incident recovery durations.",
    file_type: "csv",
    file_size_bytes: 24500,
    row_count: 180,
    column_count: 9,
    columns_metadata: [
      { name: "deployment_id", data_type: "string", non_null_count: 180, null_count: 0, null_percentage: 0, unique_count: 180 },
      { name: "service_name", data_type: "string", non_null_count: 180, null_count: 0, null_percentage: 0, unique_count: 5 },
      { name: "lead_time_hours", data_type: "float64", non_null_count: 180, null_count: 0, null_percentage: 0, unique_count: 120, min: 2.0, max: 35.0, mean: 18.5 },
      { name: "is_failure", data_type: "int64", non_null_count: 180, null_count: 0, null_percentage: 0, unique_count: 2 },
      { name: "time_to_restore_hours", data_type: "float64", non_null_count: 180, null_count: 0, null_percentage: 0, unique_count: 45, min: 0.5, max: 12.0, mean: 2.8 }
    ],
    is_synthetic: true,
    synthetic_disclosure: "Synthetic verified production release audit log calibrated for reliable DORA benchmarking.",
    category: "Engineering",
  },
  {
    id: "demo-software-defects",
    name: "Software Defect & Quality Intelligence",
    description: "Defect tracking, severity distributions, escape rates, and mean time to resolution.",
    file_type: "csv",
    file_size_bytes: 31200,
    row_count: 250,
    column_count: 11,
    columns_metadata: [
      { name: "defect_id", data_type: "string", non_null_count: 250, null_count: 0, null_percentage: 0, unique_count: 250 },
      { name: "severity", data_type: "string", non_null_count: 250, null_count: 0, null_percentage: 0, unique_count: 4 },
      { name: "component", data_type: "string", non_null_count: 250, null_count: 0, null_percentage: 0, unique_count: 6 },
      { name: "resolution_time_hours", data_type: "float64", non_null_count: 250, null_count: 0, null_percentage: 0, unique_count: 180, min: 1.0, max: 120.0, mean: 36.4 }
    ],
    is_synthetic: true,
    synthetic_disclosure: "Synthetic defect intelligence dataset calibrated to reflect multi-service software bug lifecycles.",
    category: "Quality",
  },
  {
    id: "demo-enterprise-sales",
    name: "Enterprise SaaS Revenue & Churn Risk",
    description: "B2B contract transactions, regional segmentation, Net Promoter satisfaction, and predictive churn risk.",
    file_type: "csv",
    file_size_bytes: 52400,
    row_count: 500,
    column_count: 10,
    columns_metadata: [
      { name: "order_id", data_type: "string", non_null_count: 500, null_count: 0, null_percentage: 0, unique_count: 500 },
      { name: "region", data_type: "string", non_null_count: 500, null_count: 0, null_percentage: 0, unique_count: 4 },
      { name: "customer_segment", data_type: "string", non_null_count: 500, null_count: 0, null_percentage: 0, unique_count: 3 },
      { name: "net_revenue_usd", data_type: "float64", non_null_count: 500, null_count: 0, null_percentage: 0, unique_count: 480, min: 500, max: 35000, mean: 12400 },
      { name: "churn_risk_probability", data_type: "float64", non_null_count: 500, null_count: 0, null_percentage: 0, unique_count: 90, min: 0.05, max: 0.95, mean: 0.28 }
    ],
    is_synthetic: true,
    synthetic_disclosure: "Synthetic B2B SaaS financial dataset generated for regression, classification, and BI dashboards.",
    category: "Business",
  },
];

interface DatasetContextType {
  datasets: DatasetItem[];
  selectedDataset: DatasetItem | null;
  selectedDatasetId: string;
  setSelectedDatasetId: (id: string) => void;
  isLoading: boolean;
  isBackendConnected: boolean;
  refreshDatasets: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType>({
  datasets: FALLBACK_DATASETS,
  selectedDataset: FALLBACK_DATASETS[0],
  selectedDatasetId: "demo-eng-productivity",
  setSelectedDatasetId: () => {},
  isLoading: false,
  isBackendConnected: true,
  refreshDatasets: async () => {},
});

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = useState<DatasetItem[]>(FALLBACK_DATASETS);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("demo-eng-productivity");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  const refreshDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatasets();
      if (Array.isArray(data) && data.length > 0) {
        setDatasets(data);
        setIsBackendConnected(true);
        if (!selectedDatasetId || !data.some(d => d.id === selectedDatasetId)) {
          const defaultDs = data.find((d: any) => d.id === "demo-eng-productivity") || data[0];
          setSelectedDatasetId(defaultDs.id);
        }
      }
    } catch (err) {
      console.warn("Backend API not reachable; operating with preloaded local datasets:", err);
      setIsBackendConnected(false);
      // Fallback datasets ensure zero UI crash
      setDatasets(FALLBACK_DATASETS);
      if (!selectedDatasetId) {
        setSelectedDatasetId("demo-eng-productivity");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDatasets();
  }, []);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0] || null;

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        selectedDataset,
        selectedDatasetId,
        setSelectedDatasetId,
        isLoading,
        isBackendConnected,
        refreshDatasets,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export const useDataset = () => useContext(DatasetContext);
