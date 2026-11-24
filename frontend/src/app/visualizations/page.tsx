"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import {
  BarChart3,
  LineChart as LineChartIcon,
  ScatterChart as ScatterIcon,
  Box as BoxIcon,
  Download,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const DEFAULT_CHART_DATA = [
  { label: "auth-service", value: 18.5 },
  { label: "payment-api", value: 14.2 },
  { label: "web-client", value: 22.1 },
  { label: "checkout-worker", value: 16.8 },
  { label: "notification-svc", value: 11.4 },
];

export default function VisualizationStudioPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [chartType, setChartType] = useState<"histogram" | "bar" | "line" | "scatter" | "boxplot">("bar");
  const [mounted, setMounted] = useState(false);

  // Chart configuration parameters
  const [selectedCol, setSelectedCol] = useState("");
  const [dimCol, setDimCol] = useState("");
  const [metricCol, setMetricCol] = useState("");
  const [aggFunc, setAggFunc] = useState("mean");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [bins, setBins] = useState(12);

  const [chartData, setChartData] = useState<any[]>(DEFAULT_CHART_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns = selectedDataset?.columns_metadata?.map((c: any) => c.name) || [];
  const numericCols = selectedDataset?.columns_metadata?.filter((c: any) =>
    ["int64", "float64", "int32", "float32", "number"].some((t) => c.data_type.includes(t))
  ).map((c: any) => c.name) || [];

  // Set intelligent initial defaults
  useEffect(() => {
    if (columns.length > 0) {
      setDimCol(columns[0]);
      setMetricCol(numericCols[0] || columns[1] || columns[0]);
      setSelectedCol(numericCols[0] || columns[0]);
      setXCol(numericCols[0] || columns[0]);
      setYCol(numericCols[1] || numericCols[0] || columns[1] || columns[0]);
    }
  }, [selectedDatasetId]);

  const loadChartData = async () => {
    if (!selectedDatasetId) return;
    setLoading(true);
    try {
      if (chartType === "histogram" && selectedCol) {
        const res = await api.getHistogram(selectedDatasetId, selectedCol, bins);
        setChartData(res);
      } else if (chartType === "boxplot" && selectedCol) {
        const res = await api.getBoxplot(selectedDatasetId, selectedCol);
        setChartData(res);
      } else if (chartType === "scatter" && xCol && yCol) {
        const res = await api.getScatter(selectedDatasetId, xCol, yCol);
        setChartData(res);
      } else if ((chartType === "bar" || chartType === "line") && dimCol && metricCol) {
        const res = await api.getAggregatedChart(selectedDatasetId, dimCol, metricCol, aggFunc);
        setChartData(res);
      }
    } catch (err: any) {
      console.error("Failed to load chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [chartType, selectedCol, dimCol, metricCol, aggFunc, xCol, yCol, bins, selectedDatasetId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Visualization Studio: {selectedDataset?.name || "Dataset"}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Dynamic multi-dimensional chart builder supporting histograms, scatter correlations, box plots, and aggregations.
        </p>
      </div>

      {/* Chart Type Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "bar", name: "Bar Aggregation" },
            { id: "line", name: "Line Trajectory" },
            { id: "histogram", name: "Histogram Bins" },
            { id: "scatter", name: "Scatter Correlation" },
            { id: "boxplot", name: "Box Plot Quantiles" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                chartType === type.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Dynamic Parameter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(chartType === "bar" || chartType === "line") && (
            <>
              <select
                value={dimCol}
                onChange={(e) => setDimCol(e.target.value)}
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                {columns.map((c: string) => (
                  <option key={c} value={c}>Group: {c}</option>
                ))}
              </select>
              <select
                value={metricCol}
                onChange={(e) => setMetricCol(e.target.value)}
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                {columns.map((c: string) => (
                  <option key={c} value={c}>Metric: {c}</option>
                ))}
              </select>
              <select
                value={aggFunc}
                onChange={(e) => setAggFunc(e.target.value)}
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                <option value="mean">Average</option>
                <option value="sum">Sum</option>
                <option value="count">Count</option>
              </select>
            </>
          )}

          {(chartType === "histogram" || chartType === "boxplot") && (
            <>
              <select
                value={selectedCol}
                onChange={(e) => setSelectedCol(e.target.value)}
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                {numericCols.map((c: string) => (
                  <option key={c} value={c}>Metric: {c}</option>
                ))}
              </select>
              {chartType === "histogram" && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span>Bins:</span>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    value={bins}
                    onChange={(e) => setBins(Number(e.target.value))}
                    className="w-20"
                  />
                  <span>{bins}</span>
                </div>
              )}
            </>
          )}

          {chartType === "scatter" && (
            <>
              <select
                value={xCol}
                onChange={(e) => setXCol(e.target.value)}
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                {numericCols.map((c: string) => (
                  <option key={c} value={c}>X: {c}</option>
                ))}
              </select>
              <select
                value={yCol}
                onChange={(e) => setYCol(e.target.value)}
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                {numericCols.map((c: string) => (
                  <option key={c} value={c}>Y: {c}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground capitalize">
              {chartType === "histogram" && `Distribution of ${selectedCol} (${bins} bins)`}
              {chartType === "bar" && `${aggFunc.toUpperCase()} of ${metricCol} grouped by ${dimCol}`}
              {chartType === "line" && `Trajectory of ${metricCol} by ${dimCol}`}
              {chartType === "scatter" && `Scatter Correlation: ${xCol} vs ${yCol}`}
              {chartType === "boxplot" && `5-Number Quantile Breakdown: ${selectedCol}`}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">{chartData.length} observation points loaded</span>
          </div>
        </div>

        <div className="h-96 w-full flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /> Rendering Visualization...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
              No data points available for the chosen parameters.
            </div>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#888888" fontSize={11} angle={-25} textAnchor="end" />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={`${aggFunc.toUpperCase()}`} />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#888888" fontSize={11} angle={-25} textAnchor="end" />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name={`${aggFunc.toUpperCase()}`} />
                </LineChart>
              ) : chartType === "histogram" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="bin" stroke="#888888" fontSize={10} angle={-20} textAnchor="end" />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Frequency Count" />
                </BarChart>
              ) : chartType === "scatter" ? (
                <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="x" name={xCol} stroke="#888888" fontSize={11} />
                  <YAxis dataKey="y" name={yCol} stroke="#888888" fontSize={11} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Scatter name="Data Point" data={chartData} fill="hsl(var(--primary))" opacity={0.7} />
                </ScatterChart>
              ) : (
                /* Boxplot Representation */
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="category" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="q1" fill="hsl(var(--primary))" stackId="a" opacity={0.4} name="Q1 (25th Percentile)" />
                  <Bar dataKey="median" fill="hsl(var(--primary))" stackId="a" name="Median (50th Percentile)" />
                  <Bar dataKey="q3" fill="#10b981" stackId="a" opacity={0.8} name="Q3 (75th Percentile)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
