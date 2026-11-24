"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { useDataset } from "@/components/DatasetContext";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Trash2,
  Table2,
  Database,
  Loader2,
  FileText,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";

export default function UploadPage() {
  const { datasets, refreshDatasets, setSelectedDatasetId } = useDataset();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split(".").pop()?.toLowerCase();
      if (!["csv", "xlsx", "xls", "json"].includes(ext || "")) {
        setMessage({ text: "Please upload a CSV, Excel (.xlsx/.xls), or JSON file.", type: "error" });
        setFile(null);
        return;
      }
      setFile(selected);
      setMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: "Please select a file to upload.", type: "error" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const newDs = await api.uploadDataset(file, description, category);
      await refreshDatasets();
      setSelectedDatasetId(newDs.id);
      setMessage({ text: `Successfully uploaded and registered '${file.name}' (${newDs.row_count} rows).`, type: "success" });
      setFile(null);
      setDescription("");
    } catch (err: any) {
      setMessage({ text: err.message || "Upload failed.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete dataset '${name}'?`)) return;
    try {
      await api.deleteDataset(id);
      await refreshDatasets();
      setMessage({ text: `Dataset '${name}' deleted.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Deletion failed.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Data Upload Center</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ingest CSV, Excel, and JSON datasets for end-to-end data exploration, cleaning, SQL, and predictive analytics.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Dropzone Form */}
      <form onSubmit={handleUpload} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/20">
          <UploadCloud className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {file ? file.name : "Select or drag & drop dataset file"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports CSV, Excel (.xlsx, .xls), and JSON files up to 50MB
          </p>

          <label className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
            <span>Browse Files</span>
            <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Dataset Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Engineering">Engineering & Productivity</option>
              <option value="Quality">Software Quality & Defects</option>
              <option value="Business">Business & Operations</option>
              <option value="General">General Analytics</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Q3 Sprint Pull Request and Code Review Audit"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!file || uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Ingesting & Profiling...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" /> Ingest Dataset
              </>
            )}
          </button>
        </div>
      </form>

      {/* Dataset Inventory Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Registered Datasets ({datasets.length})</h2>
          <span className="text-[11px] text-muted-foreground">Ready for analytical querying and modeling</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3">Dimensions</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {datasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">
                    <div>{ds.name}</div>
                    <div className="text-[10px] text-muted-foreground font-normal truncate max-w-xs">{ds.description}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                      {ds.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 uppercase font-mono text-[10px]">{ds.file_type}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {ds.row_count.toLocaleString()} r × {ds.column_count} c
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{formatBytes(ds.file_size_bytes)}</td>
                  <td className="py-2.5 px-3">
                    {ds.is_synthetic ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Synthetic
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Authentic
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <Link
                      href="/explorer"
                      onClick={() => setSelectedDatasetId(ds.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary hover:bg-accent text-[11px] font-medium text-foreground transition-colors"
                      title="Inspect in Data Explorer"
                    >
                      <Table2 className="h-3 w-3" /> Explore
                    </Link>
                    <Link
                      href="/sql"
                      onClick={() => setSelectedDatasetId(ds.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-[11px] font-medium text-primary transition-colors"
                      title="Query in SQL Studio"
                    >
                      <Database className="h-3 w-3" /> SQL
                    </Link>
                    {!ds.is_synthetic && (
                      <button
                        onClick={() => handleDelete(ds.id, ds.name)}
                        className="inline-flex items-center p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
                        title="Delete dataset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
