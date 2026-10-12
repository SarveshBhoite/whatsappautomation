"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Globe,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  ExternalLink,
  ChevronRight,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Eye,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export interface LandingPageItem {
  url: string;
  campaigns: Array<{ id: string; name: string }>;
  clicks: number;
  impressions: number;
  ctr: string;
  cost: string;
  currencyCode: string;
  avgCpc: string;
  conversions: number;
  conversionValue: number;
  conversionRate: string;
}

export interface GoogleAdsLandingPagesSectionProps {
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

type SortField =
  | "url"
  | "clicks"
  | "impressions"
  | "ctr"
  | "cost"
  | "avgCpc"
  | "conversions"
  | "conversionRate"
  | "conversionValue";

export function GoogleAdsLandingPagesSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsLandingPagesSectionProps) {
  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // Filter States
  const [datePreset, setDatePreset] = useState<string>("LAST_30_DAYS");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [searchTermFilter, setSearchTermFilter] = useState<string>("");

  // Data States
  const [items, setItems] = useState<LandingPageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string>("INR");
  const [selectedRow, setSelectedRow] = useState<LandingPageItem | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("clicks");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch Landing Pages
  const fetchLandingPages = useCallback(async () => {
    if (!cleanCid) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ customerId: cleanCid, orgId });
      if (datePreset === "CUSTOM" && startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else if (datePreset !== "CUSTOM") {
        params.append("dateRange", datePreset);
      }
      if (selectedCampaignId) {
        params.append("campaignId", selectedCampaignId);
      }

      const res = await fetch(`${BACKEND}/api/ads/reports/landing-pages?${params.toString()}`, {
        headers: { "x-organization-id": orgId },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load Landing Page performance");
      }

      setItems(data.items || []);
      if (data.currencyCode) {
        setCurrencyCode(data.currencyCode);
      }
    } catch (err: any) {
      console.error("[GoogleAdsLandingPagesSection] error:", err);
      setError(err.message || "Failed to load Landing Page report");
    } finally {
      setLoading(false);
    }
  }, [cleanCid, orgId, datePreset, startDate, endDate, selectedCampaignId]);

  useEffect(() => {
    fetchLandingPages();
  }, [fetchLandingPages]);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter & Sort
  const processedItems = useMemo(() => {
    let result = [...items];

    if (searchTermFilter.trim()) {
      const query = searchTermFilter.toLowerCase().trim();
      result = result.filter(
        item =>
          item.url.toLowerCase().includes(query) ||
          item.campaigns.some(c => c.name.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "ctr" || sortField === "conversionRate") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (sortField === "cost" || sortField === "avgCpc") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchTermFilter, sortField, sortDirection]);

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

  return (
    <div className="space-y-4">
      {/* Header and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Landing Page Performance</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              API v24
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track clicks, cost efficiency, conversions, and bounce trends across destination URLs (landing_page_view).
          </p>
        </div>

        <button
          onClick={fetchLandingPages}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          title="Refresh Landing Pages"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        {/* Campaign Filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Campaign
          </label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Eligible Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Preset */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Date Range
          </label>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {DATE_PRESETS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Range (conditional) */}
        {datePreset === "CUSTOM" ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">End</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Source Currency
            </label>
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-700">
              {currencyCode} ({getCurrencySymbol(currencyCode).trim() || currencyCode})
            </div>
          </div>
        )}

        {/* Search URL Filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Search URL
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter landing pages..."
              value={searchTermFilter}
              onChange={(e) => setSearchTermFilter(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-2 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Querying Google Ads API v24 for landing page performance...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">Error loading landing pages</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button
              onClick={fetchLandingPages}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : processedItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Globe className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No landing page views recorded</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Destination URLs will appear here once ads drive clicks in the chosen date range. Try widening the date preset.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("url")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Landing Page URL</span>
                      {sortField === "url" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("clicks")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Clicks</span>
                      {sortField === "clicks" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("impressions")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Impressions</span>
                      {sortField === "impressions" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("ctr")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>CTR</span>
                      {sortField === "ctr" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("cost")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Cost ({currencyCode})</span>
                      {sortField === "cost" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("avgCpc")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Avg CPC</span>
                      {sortField === "avgCpc" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("conversions")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Conv.</span>
                      {sortField === "conversions" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("conversionRate")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Conv. Rate</span>
                      {sortField === "conversionRate" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort("conversionValue")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Conv. Value</span>
                      {sortField === "conversionValue" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {processedItems.map((page, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedRow(page)}
                    className="hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate" title={page.url}>
                        {page.url}
                      </div>
                      {page.campaigns.length > 0 && (
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {page.campaigns.map((c) => c.name).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-900">
                      {page.clicks.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-900">
                      {page.impressions.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">{page.ctr}</td>
                    <td className="p-4 text-right font-bold text-emerald-700">
                      {getCurrencySymbol(page.currencyCode)}
                      {page.cost}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">
                      {getCurrencySymbol(page.currencyCode)}
                      {page.avgCpc}
                    </td>
                    <td className="p-4 text-right font-semibold text-purple-700">
                      {page.conversions}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">
                      {page.conversionRate}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-900">
                      {getCurrencySymbol(page.currencyCode)}
                      {page.conversionValue.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 group-hover:underline">
                        Details <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Landing Page Detail Drawer/Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Landing Page Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Destination URL Performance</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">Destination URL</p>
                  <a
                    href={selectedRow.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    Open Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs font-mono font-semibold text-slate-900 mt-1 break-all select-all">
                  {selectedRow.url}
                </p>
              </div>

              {selectedRow.campaigns.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Campaigns Using This URL ({selectedRow.campaigns.length})
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {selectedRow.campaigns.map((c) => (
                      <span
                        key={c.id}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">
                      {selectedRow.clicks.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Clicks</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">
                      {selectedRow.impressions.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Impressions</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">{selectedRow.ctr}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">CTR</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                    <p className="text-lg font-bold text-emerald-800">
                      {getCurrencySymbol(selectedRow.currencyCode)}
                      {selectedRow.cost}
                    </p>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">Spend</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">
                      {getCurrencySymbol(selectedRow.currencyCode)}
                      {selectedRow.avgCpc}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Avg. CPC</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
                    <p className="text-lg font-bold text-purple-800">
                      {selectedRow.conversions}
                    </p>
                    <p className="text-xs font-semibold text-purple-700 mt-0.5">Conversions</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">
                      {selectedRow.conversionRate}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Conversion Rate</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">
                      {getCurrencySymbol(selectedRow.currencyCode)}
                      {selectedRow.conversionValue.toFixed(2)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Conversion Value</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
