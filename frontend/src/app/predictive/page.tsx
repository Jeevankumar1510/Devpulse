"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import {
  Brain,
  Play,
  Cpu,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  Layers,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function PredictiveLabPage() {
  const { selectedDatasetId, selectedDataset } = useDataset();
  const [taskType, setTaskType] = useState<string>("regression");
  const [algorithm, setAlgorithm] = useState<string>("random_forest");
  const [targetCol, setTargetCol] = useState<string>("");
  const [featureCols, setFeatureCols] = useState<string[]>([]);
  const [testSize, setTestSize] = useState<number>(0.2);
  const [training, setTraining] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns = selectedDataset?.columns_metadata?.map((c: any) => c.name) || [];
  const numericCols = selectedDataset?.columns_metadata?.filter((c: any) =>
    ["int64", "float64", "int32", "float32", "number"].some((t) => c.data_type.includes(t))
  ).map((c: any) => c.name) || [];

  // Setup defaults when dataset changes
  useEffect(() => {
    if (numericCols.length >= 2) {
      setTargetCol(numericCols[0]);
      setFeatureCols(numericCols.slice(1, 5));
    }
  }, [selectedDatasetId]);

  const toggleFeature = (col: string) => {
    if (featureCols.includes(col)) {
      setFeatureCols(featureCols.filter((c) => c !== col));
    } else {
      setFeatureCols([...featureCols, col]);
    }
  };

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId || featureCols.length === 0) return;
    setTraining(true);
    try {
      const res = await api.trainMLModel({
        dataset_id: selectedDatasetId,
        task_type: taskType,
        algorithm: algorithm,
        target_column: taskType !== "clustering" && taskType !== "anomaly_detection" ? targetCol : undefined,
        feature_columns: featureCols,
        test_size: Number(testSize),
      });
      setResult(res);
    } catch (err: any) {
      alert(err.message || "Model training failed");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Predictive Analytics &amp; Machine Learning Lab
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Train, evaluate, and interpret supervised regression, classification, clustering, time-series forecasting, and anomaly detection models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Configuration Form (1 Col) */}
        <form onSubmit={handleTrain} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> Pipeline Configuration
          </h2>

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">Learning Task</label>
            <select
              value={taskType}
              onChange={(e) => {
                const nextTask = e.target.value;
                setTaskType(nextTask);
                if (nextTask === "regression") setAlgorithm("random_forest");
                else if (nextTask === "classification") setAlgorithm("random_forest");
                else if (nextTask === "clustering") setAlgorithm("kmeans");
                else if (nextTask === "time_series") setAlgorithm("arima_exp");
                else if (nextTask === "anomaly_detection") setAlgorithm("isolation_forest");
              }}
              className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="regression">Supervised Regression (Continuous)</option>
              <option value="classification">Supervised Classification (Categorical)</option>
              <option value="clustering">Unsupervised Clustering (K-Means)</option>
              <option value="time_series">Time-Series Forecasting</option>
              <option value="anomaly_detection">Anomaly Detection (Isolation Forest)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
            >
              {taskType === "regression" && (
                <>
                  <option value="random_forest">Random Forest Regressor (Non-linear)</option>
                  <option value="linear_regression">Ordinary Least Squares (OLS) Linear</option>
                </>
              )}
              {taskType === "classification" && (
                <>
                  <option value="random_forest">Random Forest Classifier (Ensemble)</option>
                  <option value="logistic_regression">Logistic Regression (Probabilistic)</option>
                </>
              )}
              {taskType === "clustering" && <option value="kmeans">K-Means Clustering</option>}
              {taskType === "time_series" && <option value="arima_exp">Exponential Trend Projection</option>}
              {taskType === "anomaly_detection" && <option value="isolation_forest">Isolation Forest Contamination</option>}
            </select>
          </div>

          {taskType !== "clustering" && taskType !== "anomaly_detection" && (
            <div>
              <label className="text-[11px] font-medium text-foreground block mb-1">Target Column (y)</label>
              <select
                value={targetCol}
                onChange={(e) => setTargetCol(e.target.value)}
                className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
              >
                <option value="">Select target variable...</option>
                {columns.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">
              Feature Columns (X) ({featureCols.length} selected)
            </label>
            <div className="max-h-36 overflow-y-auto rounded border border-border p-2 space-y-1 bg-muted/20 text-xs">
              {columns
                .filter((c: string) => c !== targetCol)
                .map((col: string) => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={featureCols.includes(col)}
                      onChange={() => toggleFeature(col)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="font-mono text-[11px] text-foreground truncate">{col}</span>
                  </label>
                ))}
            </div>
          </div>

          {(taskType === "regression" || taskType === "classification") && (
            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Holdout Test Split:</span>
                <span className="font-mono font-bold text-foreground">{Math.round(testSize * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.4}
                step={0.05}
                value={testSize}
                onChange={(e) => setTestSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={training || featureCols.length === 0}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {training ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Training Model Pipeline...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" /> Train &amp; Evaluate Model
              </>
            )}
          </button>
        </form>

        {/* Results & Interpretations (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Top Evaluation Header */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{result.algorithm}</h3>
                    <span className="text-[11px] text-muted-foreground">
                      Task: {result.task_type} • Train Set: {result.train_size} records • Test Set: {result.test_size} records
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Model Evaluated
                  </span>
                </div>

                {/* Performance Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.metrics?.r_squared !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">R² Score</span>
                      <span className="text-xl font-bold font-mono text-primary">{result.metrics.r_squared}</span>
                    </div>
                  )}
                  {result.metrics?.rmse !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">RMSE</span>
                      <span className="text-xl font-bold font-mono text-foreground">{result.metrics.rmse}</span>
                    </div>
                  )}
                  {result.metrics?.mae !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">MAE</span>
                      <span className="text-xl font-bold font-mono text-foreground">{result.metrics.mae}</span>
                    </div>
                  )}
                  {result.metrics?.accuracy !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Accuracy</span>
                      <span className="text-xl font-bold font-mono text-emerald-500">{(result.metrics.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {result.metrics?.f1_score !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">F1-Score</span>
                      <span className="text-xl font-bold font-mono text-primary">{result.metrics.f1_score}</span>
                    </div>
                  )}
                  {result.metrics?.inertia !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Inertia</span>
                      <span className="text-xl font-bold font-mono text-foreground">{result.metrics.inertia}</span>
                    </div>
                  )}
                  {result.metrics?.anomalies_detected !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Anomalies</span>
                      <span className="text-xl font-bold font-mono text-amber-500">{result.metrics.anomalies_detected}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Importance Ranking Chart */}
              {result.feature_importance && result.feature_importance.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-foreground">Feature Importance Ranking</h3>
                  <div className="h-56 w-full">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.feature_importance} layout="vertical" margin={{ left: 40, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis type="number" stroke="#888888" fontSize={11} />
                          <YAxis dataKey="feature" type="category" stroke="#888888" fontSize={10} width={100} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Relative Importance" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}

              {/* Sample Predictions Table */}
              {result.predictions_sample && result.predictions_sample.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-foreground">Holdout Sample Predictions (Actual vs Model)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                        <tr>
                          {Object.keys(result.predictions_sample[0]).map((k) => (
                            <th key={k} className="py-2 px-3 font-semibold">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                        {result.predictions_sample.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-accent/40">
                            {Object.keys(row).map((k) => (
                              <td key={k} className="py-2 px-3 whitespace-nowrap">{String(row[k])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <Brain className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs font-medium">Select your machine learning task and features on the left to train a model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
