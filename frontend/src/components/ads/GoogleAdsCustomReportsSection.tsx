"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart3,
  SlidersHorizontal,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  CheckSquare,
  Square
} from "lucide-react";

interface ResourceSchema {
  key: string;
  label: string;
  dimensions: Array<{ key: string; label: string }>;
  metrics: Array<{ key: string; label: string; type: "number" | "currency" | "percent" | "micros" }>;
  defaultDimensions: string[];
  defaultMetrics: string[];
  supportsCampaignFilter: boolean;
}

interface ColumnMeta {
  key: string;
  label: string;
  type: "dimension" | "metric";
  format?: string;
}

export interface GoogleAdsCustomReportsSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: Array<{ id: string; name: string }>;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DATE_PRESETS = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "Custom Range", value: "CUSTOM" },
];

export function GoogleAdsCustomReportsSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsCustomReportsSectionProps) {
  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // Schema state
  const [schemaResources, setSchemaResources] = useState<ResourceSchema[]>([]);
  const [schemaLoading, setSchemaLoading] = useState<boolean>(true);

  // Configuration state
  const [selectedResource, setSelectedResource] = useState<string>("campaign");
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [datePreset, setDatePreset] = useState<string>("LAST_30_DAYS");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Results state
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [currencyCode, setCurrencyCode] = useState<string>("INR");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load Schema
  const fetchSchema = useCallback(async () => {
    try {
      setSchemaLoading(true);
      const res = await fetch(`${BACKEND}/api/ads/reports/custom/schema`, {
        headers: { "x-organization-id": orgId }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.resources && Array.isArray(data.resources)) {
          setSchemaResources(data.resources);
          // Set initial defaults from first resource
          const initial = data.resources.find((r: ResourceSchema) => r.key === "campaign") || data.resources[0];
          if (initial) {
            setSelectedResource(initial.key);
            setSelectedDimensions(initial.defaultDimensions || []);
            setSelectedMetrics(initial.defaultMetrics || []);
          }
        }
      }
    } catch (err: any) {
      console.warn("Failed to load custom report schema:", err);
    } finally {
      setSchemaLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  // Current active resource schema
  const currentResourceSchema = useMemo(() => {
    return schemaResources.find(r => r.key === selectedResource) || schemaResources[0];
  }, [schemaResources, selectedResource]);

  // Handle switching resource
  const handleResourceChange = (newResourceKey: string) => {
    setSelectedResource(newResourceKey);
    const target = schemaResources.find(r => r.key === newResourceKey);
    if (target) {
      setSelectedDimensions(target.defaultDimensions || []);
      setSelectedMetrics(target.defaultMetrics || []);
    }
  };

  // Toggle Dimension
  const toggleDimension = (dimKey: string) => {
    setSelectedDimensions(prev => {
      if (prev.includes(dimKey)) {
        if (prev.length <= 1) return prev; // At least one dimension
        return prev.filter(k => k !== dimKey);
      } else {
        return [...prev, dimKey];
      }
    });
  };

  // Toggle Metric
  const toggleMetric = (metKey: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metKey)) {
        if (prev.length <= 1) return prev; // At least one metric
        return prev.filter(k => k !== metKey);
      } else {
        return [...prev, metKey];
      }
    });
  };

  // Execute Custom Report
  const executeReport = useCallback(async () => {
    if (!cleanCid) return;
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        customerId: cleanCid,
        resource: selectedResource,
        dimensions: selectedDimensions,
        metrics: selectedMetrics,
        limit: 200
      };

      if (datePreset === "CUSTOM" && startDate && endDate) {
        payload.startDate = startDate;
        payload.endDate = endDate;
      } else if (datePreset !== "CUSTOM") {
        payload.dateRange = datePreset;
      }

      if (selectedCampaignId && currentResourceSchema?.supportsCampaignFilter) {
        payload.campaignId = selectedCampaignId;
      }

      const res = await fetch(`${BACKEND}/api/ads/reports/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate custom report");
      }

      setColumns(data.columns || []);
      setRows(data.rows || []);
      if (data.currencyCode) {
        setCurrencyCode(data.currencyCode);
      }

      // Default sort column to primary metric (e.g. clicks or impressions)
      if (data.columns && data.columns.length > 0) {
        const metricCol = data.columns.find((c: ColumnMeta) => c.type === "metric");
        if (metricCol) {
          setSortColumn(metricCol.key);
          setSortDirection("desc");
        } else {
          setSortColumn(data.columns[0].key);
        }
      }
    } catch (err: any) {
      console.error("[GoogleAdsCustomReportsSection] execution error:", err);
      setError(err.message || "Failed to execute custom report");
    } finally {
      setLoading(false);
    }
  }, [
    cleanCid,
    orgId,
    selectedResource,
    selectedDimensions,
    selectedMetrics,
    selectedCampaignId,
    datePreset,
    startDate,
    endDate,
    currentResourceSchema
  ]);

  // Run on mount or when customer changes
  useEffect(() => {
    if (schemaResources.length > 0 && selectedDimensions.length > 0 && selectedMetrics.length > 0) {
      executeReport();
    }
  }, [cleanCid, selectedResource, executeReport]);

  // Client-side search and sorting
  const processedRows = useMemo(() => {
    let result = [...rows];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      result = result.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(q))
      );
    }

    if (sortColumn) {
      const colMeta = columns.find(c => c.key === sortColumn);
      const isMetric = colMeta?.type === "metric";

      result.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (isMetric) {
          aVal = parseFloat(String(aVal).replace(/[^0-9.-]/g, "")) || 0;
          bVal = parseFloat(String(bVal).replace(/[^0-9.-]/g, "")) || 0;
        } else {
          aVal = String(aVal || "").toLowerCase();
          bVal = String(bVal || "").toLowerCase();
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, searchFilter, sortColumn, sortDirection, columns]);

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("desc");
    }
  };

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      case "AED": return "AED ";
      case "CAD": return "CA$";
      case "AUD": return "AU$";
      default: return `${code} `;
    }
  };

  // CSV Export
  const exportToCsv = () => {
    if (processedRows.length === 0 || columns.length === 0) return;
    const headerRow = columns.map(c => `"${c.label}"`).join(",");
    const dataRows = processedRows.map(row =>
      columns.map(c => `"${String(row[c.key] || "").replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...dataRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `google_ads_${selectedResource}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Custom Report Editor</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Google Ads API v24
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Build bespoke reports across campaigns, ad groups, keywords, search terms, and landing pages with custom metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            disabled={processedRows.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={executeReport}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Run Report
          </button>
        </div>
      </div>

      {/* ── Query Builder Controls ── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        {/* Top Row: Resource, Campaign Filter, Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Resource Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              1. Report Resource
            </label>
            <select
              value={selectedResource}
              onChange={(e) => handleResourceChange(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {schemaResources.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label} ({r.key})
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              2. Campaign Filter
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              disabled={!currentResourceSchema?.supportsCampaignFilter}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Preset */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              3. Date Range
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {DATE_PRESETS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {datePreset === "CUSTOM" && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" /> Custom Dates:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:border-blue-500"
            />
            <span className="text-slate-400 font-medium">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Dimensions Selector Pill Matrix */}
        {currentResourceSchema && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Dimensions ({selectedDimensions.length} selected):
              </span>
              <span className="text-[11px] text-slate-400">Click to include/exclude</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentResourceSchema.dimensions.map((dim) => {
                const isSelected = selectedDimensions.includes(dim.key);
                return (
                  <button
                    key={dim.key}
                    type="button"
                    onClick={() => toggleDimension(dim.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {isSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5 text-slate-400" />}
                    {dim.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Metrics Selector Pill Matrix */}
        {currentResourceSchema && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Metrics ({selectedMetrics.length} selected):
              </span>
              <span className="text-[11px] text-slate-400">Currency auto-resolved: {currencyCode}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentResourceSchema.metrics.map((met) => {
                const isSelected = selectedMetrics.includes(met.key);
                return (
                  <button
                    key={met.key}
                    type="button"
                    onClick={() => toggleMetric(met.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {isSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5 text-slate-400" />}
                    {met.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Table Filter and Meta Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search within report results..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl pl-8.5 pr-3 py-2 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Rows: <strong className="text-slate-900">{processedRows.length}</strong></span>
          <span>Columns: <strong className="text-slate-900">{columns.length}</strong></span>
        </div>
      </div>

      {/* ── Results Table Card ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Executing validated Google Ads API v24 query...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-rose-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">Error generating report</p>
            <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">{error}</p>
            <button
              onClick={executeReport}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : processedRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileSpreadsheet className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No report records found</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No data matched the selected resource, dimensions, and date filter. Try selecting a wider date range or different resource.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  {columns.map((col) => {
                    const isSorted = sortColumn === col.key;
                    const isMetric = col.type === "metric";
                    return (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`p-4 cursor-pointer hover:bg-slate-100 transition select-none ${
                          isMetric ? "text-right" : "text-left"
                        }`}
                      >
                        <div className={`flex items-center gap-1.5 ${isMetric ? "justify-end" : "justify-start"}`}>
                          <span>{col.label}</span>
                          {isSorted ? (
                            sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-blue-600" /> : <ArrowDown className="h-3 w-3 text-blue-600" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {processedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    {columns.map((col) => {
                      const val = row[col.key];
                      const isMetric = col.type === "metric";
                      const isCost = col.key === "cost" || col.key === "average_cpc" || col.key === "conversions_value";

                      return (
                        <td
                          key={col.key}
                          className={`p-4 ${isMetric ? "text-right font-semibold text-slate-900" : "text-left font-normal text-slate-700"}`}
                        >
                          {isCost && val !== "—" ? `${getCurrencySymbol(currencyCode)}${val}` : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
