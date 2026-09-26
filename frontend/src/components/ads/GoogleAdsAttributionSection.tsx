"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GitMerge,
  Sparkles,
  MousePointerClick,
  Info,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Sliders,
  Filter,
  Layers,
  ArrowRight
} from "lucide-react";

interface GoogleAdsAttributionSectionProps {
  customerId: string;
  orgId: string;
}

const DATE_RANGES = [
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
  { label: "Last 90 Days", value: "LAST_90_DAYS" }
];

export function GoogleAdsAttributionSection({
  customerId,
  orgId
}: GoogleAdsAttributionSectionProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("LAST_30_DAYS");
  const [selectedActionId, setSelectedActionId] = useState<string>("ALL");

  const fetchAttributionData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ads/measurement/attribution?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(
          customerId
        )}&dateRange=${encodeURIComponent(selectedDateRange)}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load conversion attribution data");
      }
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attribution overview");
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId, selectedDateRange]);

  useEffect(() => {
    fetchAttributionData();
  }, [fetchAttributionData]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col items-center justify-center min-h-[260px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-700 font-bold text-sm">Loading Conversion Attribution Settings &amp; Reporting...</p>
        <p className="text-slate-400 text-xs mt-1">Inspecting Google Ads API v24 attribution models</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-rose-900 text-sm">Attribution Reporting Error</h3>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <button
              onClick={fetchAttributionData}
              className="mt-3 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currency = data?.customer?.currencyCode || "INR";
  const summary = data?.summary || {};
  const catalog = data?.attributionModelCatalog || [];
  const conversionActions: any[] = data?.conversionActions || [];
  const campaignPerformance: any[] = data?.campaignPerformance || [];

  const filteredActions =
    selectedActionId === "ALL"
      ? conversionActions
      : conversionActions.filter((a) => a.id === selectedActionId);

  const filteredCampaigns =
    selectedActionId === "ALL"
      ? campaignPerformance
      : campaignPerformance.filter((c) => {
          const action = conversionActions.find((a) => a.id === selectedActionId);
          return action && c.conversionActionName === action.name;
        });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Conversion Attribution Reporting
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Google Ads API v24
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Official Google Ads attribution models, lookback windows, and data-driven status
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              {DATE_RANGES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedActionId}
              onChange={(e) => setSelectedActionId(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL">All Conversion Actions</option>
              {conversionActions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchAttributionData}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Conversion Actions
            </span>
            <p className="text-xl font-black text-slate-900 mt-1 font-mono">{summary.totalActions || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active goals in customer account</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Data-Driven (DDA)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <p className="text-xl font-black text-indigo-900 mt-1 font-mono">
              {summary.dataDrivenActionsCount || 0}
            </p>
            <p className="text-[11px] text-indigo-700/80 mt-0.5">Recommended attribution model</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Last Click</span>
              <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xl font-black text-blue-900 mt-1 font-mono">
              {summary.lastClickActionsCount || 0}
            </p>
            <p className="text-[11px] text-blue-700/80 mt-0.5">Direct 100% final-click credit</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Customer Currency
            </span>
            <p className="text-xl font-black text-emerald-900 mt-1 font-mono">{currency}</p>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">Resolved dynamically from Google</p>
          </div>
        </div>

        {/* Official Google Ads Attribution Model Info Banner */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Official Google Ads Attribution Rule</p>
              <p className="text-slate-600 leading-relaxed">
                Rules-based attribution models (First Click, Linear, Time Decay, and Position-Based) have been retired
                across Google Ads. Google Ads API v24 officially supports <strong>Data-Driven Attribution</strong> (recommended
                multi-touch credit using machine learning) and <strong>Last Click</strong>. All values shown below are
                reported directly from Google without fabrication.
              </p>
            </div>
          </div>
        </div>

        {/* Conversion Action Attribution Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Conversion Actions Attribution Configuration ({filteredActions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Action Name</th>
                  <th className="p-3.5">Type &amp; Category</th>
                  <th className="p-3.5">Attribution Model</th>
                  <th className="p-3.5">Data-Driven Status</th>
                  <th className="p-3.5">Counting</th>
                  <th className="p-3.5">Lookback Windows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredActions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                      No conversion actions found.
                    </td>
                  </tr>
                ) : (
                  filteredActions.map((action) => {
                    const isDDA = action.attributionModel.includes("DATA_DRIVEN");
                    return (
                      <tr key={action.id} className="hover:bg-slate-50/60 transition-all">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{action.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {action.id}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800">{action.category}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{action.type}</span>
                        </td>
                        <td className="p-3.5">
                          {isDDA ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              Data-Driven
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]">
                              <MousePointerClick className="w-3 h-3 text-slate-500" />
                              Last Click
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              action.dataDrivenModelStatus === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : action.dataDrivenModelStatus === "ELIGIBLE"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {action.dataDrivenModelStatus}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          {action.countingType === "ONE_PER_CLICK" ? "One per click" : "Many per click"}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <span className="font-bold text-slate-800">{action.clickThroughLookbackWindowDays}d</span> click /{" "}
                          <span className="font-bold text-slate-800">{action.viewThroughLookbackWindowDays}d</span> view
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Attributed Performance Breakdown */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Campaign Attributed Performance ({selectedDateRange})
            </h3>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-slate-600 font-bold">No Attributed Campaign Conversions Recorded</p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                No campaign conversions were credited under the selected date window ({selectedDateRange}). When your
                ads generate conversions, Google Ads will allocate credited fractions here according to each action&apos;s
                model.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Campaign</th>
                    <th className="p-3.5">Conversion Action</th>
                    <th className="p-3.5 text-right">Attributed Conversions</th>
                    <th className="p-3.5 text-right">Attributed Value ({currency})</th>
                    <th className="p-3.5 text-right">All Conversions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCampaigns.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-all">
                      <td className="p-3.5 font-bold text-slate-900">{row.campaignName}</td>
                      <td className="p-3.5 text-slate-700">{row.conversionActionName}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-indigo-700">
                        {Number(row.conversions || 0).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        {currency} {Number(row.conversionsValue || 0).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600">
                        {Number(row.allConversions || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
