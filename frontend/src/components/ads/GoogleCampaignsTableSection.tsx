"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sliders,
  RefreshCw,
  Plus,
  Play,
  Pause,
  DollarSign,
  Trash2,
  Edit3,
  Bot,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  Check,
  ChevronDown,
  Megaphone,
  Loader2,
  Eye
} from "lucide-react";

interface GoogleCampaignsTableSectionProps {
  campaigns: any[];
  campsLoading: boolean;
  selectedCustomerId: string;
  isCampaignSelectionMode: boolean;
  setIsCampaignSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCampaignIds: string[];
  setSelectedCampaignIds: React.Dispatch<React.SetStateAction<string[]>>;
  isBulkOperating: boolean;
  loadCampaigns: (cid: string) => void;
  openEditCampaignModal: (c: any, tab?: "info" | "assets" | "targeting" | "all" | "preview") => void;
  toggleCampaign: (c: any) => void;
  analyzeCampaign: (c: any) => void;
  deleteCampaign: (c: any) => void;
  toggling: string | null;
  handleBulkToggleStatus: (status: "ENABLED" | "PAUSED") => void;
  setShowBulkBudgetModal: (show: boolean) => void;
  handleBulkDeleteCampaigns: () => void;
  router: any;
  Pill: React.FC<{ status: string }>;
  EmptyState: React.FC<any>;
}

export const GoogleCampaignsTableSection: React.FC<GoogleCampaignsTableSectionProps> = ({
  campaigns,
  campsLoading,
  selectedCustomerId,
  isCampaignSelectionMode,
  setIsCampaignSelectionMode,
  selectedCampaignIds,
  setSelectedCampaignIds,
  isBulkOperating,
  loadCampaigns,
  openEditCampaignModal,
  toggleCampaign,
  analyzeCampaign,
  deleteCampaign,
  toggling,
  handleBulkToggleStatus,
  setShowBulkBudgetModal,
  handleBulkDeleteCampaigns,
  router,
  Pill,
  EmptyState
}) => {
  // ── Universal Global Search & Filter Bar States ──
  const [globalSearch, setGlobalSearch] = useState("");
  const [quickStatusFilter, setQuickStatusFilter] = useState<string>("ALL");
  const [quickTypeFilter, setQuickTypeFilter] = useState<string>("ALL");

  // ── Individual Column Filters & Sorting States ──
  const [colFilters, setColFilters] = useState<{
    name: string;
    publishDate: string;
    status: string;
    type: string;
    minBudget: string;
    maxBudget: string;
    minImpressions: string;
    minClicks: string;
    minSpend: string;
    minConv: string;
  }>({
    name: "",
    publishDate: "",
    status: "ALL",
    type: "ALL",
    minBudget: "",
    maxBudget: "",
    minImpressions: "",
    minClicks: "",
    minSpend: "",
    minConv: ""
  });

  const [activeColFilterDropdown, setActiveColFilterDropdown] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "publishDate",
    direction: "desc"
  });

  // Extract unique campaign types for dynamic filter dropdowns
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    campaigns.forEach((c) => {
      if (c.campaignType) types.add(c.campaignType);
      if (c.advertisingChannelType) types.add(c.advertisingChannelType);
    });
    return Array.from(types).sort();
  }, [campaigns]);

  // Format Helper for Publish / Start Date
  const formatPublishDate = (dateVal: any) => {
    if (!dateVal) return "—";
    try {
      if (typeof dateVal === "string") {
        const cleanStr = dateVal.trim();
        // Handle YYYYMMDD
        if (cleanStr.length === 8 && /^\d{8}$/.test(cleanStr)) {
          const y = cleanStr.slice(0, 4);
          const m = parseInt(cleanStr.slice(4, 6), 10) - 1;
          const day = parseInt(cleanStr.slice(6, 8), 10);
          return new Date(Number(y), m, day).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
        }
        // Handle YYYY-MM-DD or YYYY-MM-DD HH:MM:SS
        const datePart = cleanStr.split("T")[0].split(" ")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          const [y, m, day] = datePart.split("-").map(Number);
          return new Date(y, m - 1, day).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
        }
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) {
        return String(dateVal).split("T")[0].split(" ")[0] || "—";
      }
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return String(dateVal).split("T")[0] || "—";
    }
  };

  // ── Filter & Sort Logic ──
  const processedCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        // Exclude removed
        if (c.status === "REMOVED" || c.liveStatus === "REMOVED") return false;

        const liveSt = (c.liveStatus || c.status || "").toUpperCase();
        const campType = (c.campaignType || c.advertisingChannelType || "SEARCH").toUpperCase();
        const name = (c.name || "").toLowerCase();
        const gId = String(c.googleAdsCampaignId || "").toLowerCase();
        const budget = Number(c.budget || (c.amountMicros ? Number(c.amountMicros) / 1_000_000 : 0));
        const impr = Number(c.impressions || 0);
        const clicks = Number(c.clicks || 0);
        const spend = parseFloat(c.cost || "0");
        const conv = Number(c.conversions || 0);
        const pubDateFormatted = formatPublishDate(c.publishDate || c.startDate || c.createdAt).toLowerCase();

        // 1. Universal Search (Matches name, Google ID, or type)
        if (globalSearch.trim()) {
          const q = globalSearch.toLowerCase().trim();
          const matches = name.includes(q) || gId.includes(q) || campType.toLowerCase().includes(q) || pubDateFormatted.includes(q);
          if (!matches) return false;
        }

        // 2. Quick Universal Status Filter
        if (quickStatusFilter !== "ALL") {
          if (liveSt !== quickStatusFilter) return false;
        }

        // 3. Quick Universal Type Filter
        if (quickTypeFilter !== "ALL") {
          if (campType !== quickTypeFilter.toUpperCase()) return false;
        }

        // 4. Individual Column Filters
        if (colFilters.name.trim()) {
          if (!name.includes(colFilters.name.toLowerCase().trim())) return false;
        }
        if (colFilters.publishDate.trim()) {
          if (!pubDateFormatted.includes(colFilters.publishDate.toLowerCase().trim())) return false;
        }
        if (colFilters.status !== "ALL") {
          if (liveSt !== colFilters.status) return false;
        }
        if (colFilters.type !== "ALL") {
          if (campType !== colFilters.type.toUpperCase()) return false;
        }
        if (colFilters.minBudget && budget < Number(colFilters.minBudget)) return false;
        if (colFilters.maxBudget && budget > Number(colFilters.maxBudget)) return false;
        if (colFilters.minImpressions && impr < Number(colFilters.minImpressions)) return false;
        if (colFilters.minClicks && clicks < Number(colFilters.minClicks)) return false;
        if (colFilters.minSpend && spend < Number(colFilters.minSpend)) return false;
        if (colFilters.minConv && conv < Number(colFilters.minConv)) return false;

        return true;
      })
      .sort((a, b) => {
        if (!sortConfig.key || !sortConfig.direction) return 0;
        const multiplier = sortConfig.direction === "asc" ? 1 : -1;

        switch (sortConfig.key) {
          case "name":
            return multiplier * (a.name || "").localeCompare(b.name || "");
          case "publishDate": {
            const dateA = new Date(a.publishDate || a.startDate || a.createdAt || 0).getTime() || 0;
            const dateB = new Date(b.publishDate || b.startDate || b.createdAt || 0).getTime() || 0;
            return multiplier * (dateA - dateB);
          }
          case "status": {
            const stA = a.liveStatus || a.status || "";
            const stB = b.liveStatus || b.status || "";
            return multiplier * stA.localeCompare(stB);
          }
          case "type": {
            const tA = a.campaignType || a.advertisingChannelType || "";
            const tB = b.campaignType || b.advertisingChannelType || "";
            return multiplier * tA.localeCompare(tB);
          }
          case "budget": {
            const bA = Number(a.budget || (a.amountMicros ? Number(a.amountMicros) / 1_000_000 : 0));
            const bB = Number(b.budget || (b.amountMicros ? Number(b.amountMicros) / 1_000_000 : 0));
            return multiplier * (bA - bB);
          }
          case "impressions":
            return multiplier * (Number(a.impressions || 0) - Number(b.impressions || 0));
          case "clicks":
            return multiplier * (Number(a.clicks || 0) - Number(b.clicks || 0));
          case "ctr": {
            const ctrA = parseFloat(a.ctr || "0");
            const ctrB = parseFloat(b.ctr || "0");
            return multiplier * (ctrA - ctrB);
          }
          case "cost": {
            const cA = parseFloat(a.cost || "0");
            const cB = parseFloat(b.cost || "0");
            return multiplier * (cA - cB);
          }
          case "conversions":
            return multiplier * (Number(a.conversions || 0) - Number(b.conversions || 0));
          default:
            return 0;
        }
      });
  }, [campaigns, globalSearch, quickStatusFilter, quickTypeFilter, colFilters, sortConfig]);

  // Handle Sort Click
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: "publishDate", direction: "desc" };
        return { key, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />;
    if (sortConfig.direction === "asc") return <ArrowUp className="h-3 w-3 text-blue-600 font-bold" />;
    return <ArrowDown className="h-3 w-3 text-blue-600 font-bold" />;
  };

  const toggleSelectAll = () => {
    if (selectedCampaignIds.length === processedCampaigns.length) {
      setSelectedCampaignIds([]);
    } else {
      setSelectedCampaignIds(processedCampaigns.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedCampaignIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const hasActiveFilters = Boolean(
    globalSearch.trim() ||
    quickStatusFilter !== "ALL" ||
    quickTypeFilter !== "ALL" ||
    colFilters.name ||
    colFilters.publishDate ||
    colFilters.status !== "ALL" ||
    colFilters.type !== "ALL" ||
    colFilters.minBudget ||
    colFilters.maxBudget ||
    colFilters.minImpressions ||
    colFilters.minClicks ||
    colFilters.minSpend ||
    colFilters.minConv
  );

  const resetAllFilters = () => {
    setGlobalSearch("");
    setQuickStatusFilter("ALL");
    setQuickTypeFilter("ALL");
    setColFilters({
      name: "",
      publishDate: "",
      status: "ALL",
      type: "ALL",
      minBudget: "",
      maxBudget: "",
      minImpressions: "",
      minClicks: "",
      minSpend: "",
      minConv: ""
    });
    setActiveColFilterDropdown(null);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. UNIVERSAL GLOBAL FILTER & ACTION CONTROLS ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Universal Search */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by name, ID, type, or publish date..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Universal Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Quick Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider">Status:</span>
              {(["ALL", "ENABLED", "PAUSED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setQuickStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                    quickStatusFilter === st
                      ? "bg-white text-blue-700 font-bold shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  {st === "ALL" ? "All" : st === "ENABLED" ? "Active" : "Paused"}
                </button>
              ))}
            </div>

            {/* Type Quick Dropdown */}
            <div className="relative">
              <select
                value={quickTypeFilter}
                onChange={(e) => setQuickTypeFilter(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Types ({campaigns.length})</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                title="Reset all search & column filters"
              >
                <X className="h-3.5 w-3.5" /> Clear Filters
              </button>
            )}
          </div>

          {/* Top-Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <button
              onClick={() => {
                setIsCampaignSelectionMode((prev) => {
                  if (prev) setSelectedCampaignIds([]);
                  return !prev;
                });
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                isCampaignSelectionMode
                  ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title="Toggle multi-select mode"
            >
              <Sliders className="h-4 w-4 text-blue-600" />
              <span>{isCampaignSelectionMode ? "Exit Multi-Select" : "Edit Campaigns"}</span>
              {selectedCampaignIds.length > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                  {selectedCampaignIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => loadCampaigns(selectedCustomerId)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
              title="Refresh campaigns from Google Ads"
            >
              <RefreshCw className={`h-4 w-4 ${campsLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>

            <button
              onClick={() => router.push(`/ads/campaigns/create/manual?customerId=${selectedCustomerId}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Campaign
            </button>
          </div>
        </div>

        {/* Live Filter Indicator Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              Showing <strong>{processedCampaigns.length}</strong> of <strong>{campaigns.length}</strong> Google Ads campaigns
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Filters Applied
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Active: <strong className="text-emerald-700">{campaigns.filter(c => (c.liveStatus || c.status) === "ENABLED").length}</strong></span>
            <span>Paused: <strong className="text-amber-700">{campaigns.filter(c => (c.liveStatus || c.status) === "PAUSED").length}</strong></span>
          </div>
        </div>
      </div>

      {/* ── 2. MULTI-SELECT FLOATING BULK ACTIONS BAR ── */}
      {isCampaignSelectionMode && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 flex-wrap shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={processedCampaigns.length > 0 && selectedCampaignIds.length === processedCampaigns.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 cursor-pointer"
              />
              <span>Select All ({selectedCampaignIds.length}/{processedCampaigns.length})</span>
            </label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkToggleStatus("ENABLED")}
              disabled={isBulkOperating || selectedCampaignIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Enable ({selectedCampaignIds.length})</span>
            </button>

            <button
              onClick={() => handleBulkToggleStatus("PAUSED")}
              disabled={isBulkOperating || selectedCampaignIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause ({selectedCampaignIds.length})</span>
            </button>

            <button
              onClick={() => {
                if (selectedCampaignIds.length === 0) return;
                setShowBulkBudgetModal(true);
              }}
              disabled={isBulkOperating || selectedCampaignIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Update Budget</span>
            </button>

            <button
              onClick={handleBulkDeleteCampaigns}
              disabled={isBulkOperating || selectedCampaignIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isBulkOperating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Delete ({selectedCampaignIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedCampaignIds([])}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── 3. DATA TABLE WITH PUBLISH DATE & INDIVIDUAL COLUMN FILTERS ── */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {campsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
          </div>
        ) : processedCampaigns.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <EmptyState
              icon={Megaphone}
              title={hasActiveFilters ? "No matching campaigns" : "No campaigns"}
              sub={
                hasActiveFilters
                  ? "Try clearing your universal or column filters to view all campaigns."
                  : "Create your first campaign to start reaching customers."
              }
              action={hasActiveFilters ? "Clear Filters" : "Create Campaign"}
              onAction={
                hasActiveFilters
                  ? resetAllFilters
                  : () => router.push(`/ads/campaigns/create/manual?customerId=${selectedCustomerId}`)
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider select-none">
                  {isCampaignSelectionMode && (
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={processedCampaigns.length > 0 && selectedCampaignIds.length === processedCampaigns.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}

                  {/* 1. Campaign Name Column */}
                  <th className="px-4 py-3.5 min-w-[200px]">
                    <div className="flex items-center justify-between gap-1 group">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-slate-900 cursor-pointer text-left"
                      >
                        <span>Campaign</span>
                        {getSortIcon("name")}
                      </button>
                      <button
                        onClick={() => setActiveColFilterDropdown(activeColFilterDropdown === "name" ? null : "name")}
                        className={`p-1 rounded hover:bg-slate-200/70 transition-all cursor-pointer ${
                          colFilters.name ? "text-blue-600 font-bold" : "text-slate-400"
                        }`}
                        title="Filter by campaign name"
                      >
                        <Filter className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Filter Popup: Name */}
                    {activeColFilterDropdown === "name" && (
                      <div className="absolute z-30 mt-2 p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200 w-56 text-normal normal-case">
                        <p className="text-[11px] font-bold text-slate-700 mb-1.5">Filter by Name:</p>
                        <input
                          value={colFilters.name}
                          onChange={(e) => setColFilters((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Type name..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              setColFilters((p) => ({ ...p, name: "" }));
                              setActiveColFilterDropdown(null);
                            }}
                            className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => setActiveColFilterDropdown(null)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* 2. Publish Date Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[130px]">
                    <div className="flex items-center justify-between gap-1 group">
                      <button
                        onClick={() => handleSort("publishDate")}
                        className="flex items-center gap-1 hover:text-slate-900 cursor-pointer text-left"
                      >
                        <span>Publish Date</span>
                        {getSortIcon("publishDate")}
                      </button>
                      <button
                        onClick={() => setActiveColFilterDropdown(activeColFilterDropdown === "publishDate" ? null : "publishDate")}
                        className={`p-1 rounded hover:bg-slate-200/70 transition-all cursor-pointer ${
                          colFilters.publishDate ? "text-blue-600 font-bold" : "text-slate-400"
                        }`}
                        title="Filter by publish date"
                      >
                        <Filter className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Filter Popup: Publish Date */}
                    {activeColFilterDropdown === "publishDate" && (
                      <div className="absolute z-30 mt-2 p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200 w-52 normal-case">
                        <p className="text-[11px] font-bold text-slate-700 mb-1.5">Search Date (e.g. 2026 or Oct):</p>
                        <input
                          value={colFilters.publishDate}
                          onChange={(e) => setColFilters((p) => ({ ...p, publishDate: e.target.value }))}
                          placeholder="e.g. 2026, Oct, 09"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              setColFilters((p) => ({ ...p, publishDate: "" }));
                              setActiveColFilterDropdown(null);
                            }}
                            className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => setActiveColFilterDropdown(null)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* 3. Status Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1 group">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-1 hover:text-slate-900 cursor-pointer text-left"
                      >
                        <span>Status</span>
                        {getSortIcon("status")}
                      </button>
                      <button
                        onClick={() => setActiveColFilterDropdown(activeColFilterDropdown === "status" ? null : "status")}
                        className={`p-1 rounded hover:bg-slate-200/70 transition-all cursor-pointer ${
                          colFilters.status !== "ALL" ? "text-blue-600 font-bold" : "text-slate-400"
                        }`}
                        title="Filter by status"
                      >
                        <Filter className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Filter Popup: Status */}
                    {activeColFilterDropdown === "status" && (
                      <div className="absolute z-30 mt-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 w-36 normal-case">
                        {(["ALL", "ENABLED", "PAUSED"] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              setColFilters((p) => ({ ...p, status: st }));
                              setActiveColFilterDropdown(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                              colFilters.status === st ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {st === "ALL" ? "All Statuses" : st === "ENABLED" ? "Active (Enabled)" : "Paused"}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>

                  {/* 4. Type Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1 group">
                      <button
                        onClick={() => handleSort("type")}
                        className="flex items-center gap-1 hover:text-slate-900 cursor-pointer text-left"
                      >
                        <span>Type</span>
                        {getSortIcon("type")}
                      </button>
                      <button
                        onClick={() => setActiveColFilterDropdown(activeColFilterDropdown === "type" ? null : "type")}
                        className={`p-1 rounded hover:bg-slate-200/70 transition-all cursor-pointer ${
                          colFilters.type !== "ALL" ? "text-blue-600 font-bold" : "text-slate-400"
                        }`}
                        title="Filter by type"
                      >
                        <Filter className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Filter Popup: Type */}
                    {activeColFilterDropdown === "type" && (
                      <div className="absolute z-30 mt-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 w-44 max-h-56 overflow-y-auto normal-case">
                        <button
                          onClick={() => {
                            setColFilters((p) => ({ ...p, type: "ALL" }));
                            setActiveColFilterDropdown(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            colFilters.type === "ALL" ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          All Types
                        </button>
                        {availableTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setColFilters((p) => ({ ...p, type: t }));
                              setActiveColFilterDropdown(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                              colFilters.type === t ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>

                  {/* 5. Budget Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1 group">
                      <button
                        onClick={() => handleSort("budget")}
                        className="flex items-center gap-1 hover:text-slate-900 cursor-pointer text-left"
                      >
                        <span>Budget/day</span>
                        {getSortIcon("budget")}
                      </button>
                      <button
                        onClick={() => setActiveColFilterDropdown(activeColFilterDropdown === "budget" ? null : "budget")}
                        className={`p-1 rounded hover:bg-slate-200/70 transition-all cursor-pointer ${
                          colFilters.minBudget || colFilters.maxBudget ? "text-blue-600 font-bold" : "text-slate-400"
                        }`}
                        title="Filter by budget range"
                      >
                        <Filter className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Filter Popup: Budget Range */}
                    {activeColFilterDropdown === "budget" && (
                      <div className="absolute z-30 mt-2 p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200 w-52 normal-case">
                        <p className="text-[11px] font-bold text-slate-700 mb-1.5">Budget Range (₹):</p>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Min"
                            value={colFilters.minBudget}
                            onChange={(e) => setColFilters((p) => ({ ...p, minBudget: e.target.value }))}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={colFilters.maxBudget}
                            onChange={(e) => setColFilters((p) => ({ ...p, maxBudget: e.target.value }))}
                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              setColFilters((p) => ({ ...p, minBudget: "", maxBudget: "" }));
                              setActiveColFilterDropdown(null);
                            }}
                            className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => setActiveColFilterDropdown(null)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* 6. Impressions Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleSort("impressions")}
                      className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                    >
                      <span>Impressions</span>
                      {getSortIcon("impressions")}
                    </button>
                  </th>

                  {/* 7. Clicks Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleSort("clicks")}
                      className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                    >
                      <span>Clicks</span>
                      {getSortIcon("clicks")}
                    </button>
                  </th>

                  {/* 8. CTR Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleSort("ctr")}
                      className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                    >
                      <span>CTR</span>
                      {getSortIcon("ctr")}
                    </button>
                  </th>

                  {/* 9. Spend Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleSort("cost")}
                      className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                    >
                      <span>Spend</span>
                      {getSortIcon("cost")}
                    </button>
                  </th>

                  {/* 10. Conversions Column */}
                  <th className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleSort("conversions")}
                      className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                    >
                      <span>Conv.</span>
                      {getSortIcon("conversions")}
                    </button>
                  </th>

                  {/* 11. Actions Column */}
                  <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {processedCampaigns.map((c) => {
                  const isSelected = selectedCampaignIds.includes(c.id);
                  const effectiveBudget = Number(c.budget || (c.amountMicros ? Number(c.amountMicros) / 1_000_000 : 0));
                  const pubDateStr = formatPublishDate(c.publishDate || c.startDate || c.createdAt);

                  return (
                    <tr
                      key={c.id}
                      className={`transition-all group ${
                        isSelected ? "bg-blue-50/60 hover:bg-blue-50" : "hover:bg-slate-50/80"
                      }`}
                    >
                      {isCampaignSelectionMode && (
                        <td className="p-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(c.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}

                      {/* Campaign Name & ID */}
                      <td className="p-4 min-w-[200px]">
                        <button
                          onClick={() => openEditCampaignModal(c, "info")}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left text-xs truncate max-w-[220px] block focus:outline-none cursor-pointer"
                        >
                          {c.name}
                        </button>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {c.googleAdsCampaignId || "Not synced"}
                        </p>
                      </td>

                      {/* Publish Date */}
                      <td className="p-4 whitespace-nowrap text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{pubDateStr}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <Pill status={c.liveStatus || c.status} />
                      </td>

                      {/* Type */}
                      <td className="p-4 font-mono text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {c.campaignType || c.advertisingChannelType || "SEARCH"}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        ₹{effectiveBudget.toLocaleString()}/d
                      </td>

                      {/* Impressions */}
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        {Number(c.impressions || 0).toLocaleString()}
                      </td>

                      {/* Clicks */}
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        {Number(c.clicks || 0).toLocaleString()}
                      </td>

                      {/* CTR */}
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        {c.ctr || "0%"}
                      </td>

                      {/* Spend */}
                      <td className="p-4 font-bold text-emerald-700 whitespace-nowrap">
                        ₹{c.cost || "0.00"}
                      </td>

                      {/* Conversions */}
                      <td className="p-4 font-semibold text-purple-700 whitespace-nowrap">
                        {Number(c.conversions || 0).toFixed(1)}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditCampaignModal(c, "preview")}
                            title="Live Ad Preview (Google Search Mockup)"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>

                          <button
                            onClick={() => openEditCampaignModal(c, "info")}
                            title="Edit Campaign Settings"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => toggleCampaign(c)}
                            disabled={toggling === c.id || !c.googleAdsCampaignId}
                            title={
                              (c.liveStatus || c.status) === "ENABLED"
                                ? "Pause Campaign in Google Ads"
                                : "Enable Campaign in Google Ads"
                            }
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              (c.liveStatus || c.status) === "ENABLED"
                                ? "text-amber-700 hover:bg-amber-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {toggling === c.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (c.liveStatus || c.status) === "ENABLED" ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => analyzeCampaign(c)}
                            title="Run AI Audit & Recommendations"
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                          >
                            <Bot className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => deleteCampaign(c)}
                            title="Remove/Delete Campaign"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
