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

interface DatasetContextType {
  datasets: DatasetItem[];
  selectedDataset: DatasetItem | null;
  selectedDatasetId: string;
  setSelectedDatasetId: (id: string) => void;
  isLoading: boolean;
  refreshDatasets: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType>({
  datasets: [],
  selectedDataset: null,
  selectedDatasetId: "",
  setSelectedDatasetId: () => {},
  isLoading: true,
  refreshDatasets: async () => {},
});

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0 && !selectedDatasetId) {
        // Default to engineering productivity if available
        const defaultDs = data.find((d: any) => d.id === "demo-eng-productivity") || data[0];
        setSelectedDatasetId(defaultDs.id);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDatasets();
  }, []);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || null;

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        selectedDataset,
        selectedDatasetId,
        setSelectedDatasetId,
        isLoading,
        refreshDatasets,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export const useDataset = () => useContext(DatasetContext);
