"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Globe,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  Layers,
  ExternalLink,
  ChevronRight,
  X,
  Info,
  AlertCircle,
  BarChart2,
  DollarSign,
  MousePointerClick,
  Eye,
  CheckCircle,
  ShieldCheck,
  ChevronDown
} from "lucide-react";

interface GoogleAdsReportingSectionProps {
  customerId: string;
  orgId: string;
}

interface AuctionInsightItem {
  domain: string;
  campaignId: string;
  campaignName: string;
  impressionShare: string;
  overlapRate: string;
  positionAboveRate: string;
  topOfPageRate: string;
  absTopOfPageRate: string;
  outrankingShare: string;
}

interface LandingPageItem {
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

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DATE_PRESETS = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "Custom Range", value: "CUSTOM" },
];

export function GoogleAdsReportingSection({ customerId, orgId }: GoogleAdsReportingSectionProps) {
  const [activeReport, setActiveReport] = useState<"auction-insights" | "landing-pages">("auction-insights");

  // Filters state
  const [datePreset, setDatePreset] = useState<string>("LAST_30_DAYS");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [searchTermFilter, setSearchTermFilter] = useState<string>("");
  const [campaignsList, setCampaignsList] = useState<Array<{ id: string; name: string }>>([]);

  // Auction Insights State
  const [auctionItems, setAuctionItems] = useState<AuctionInsightItem[]>([]);
  const [auctionLoading, setAuctionLoading] = useState<boolean>(false);
  const [auctionError, setAuctionError] = useState<string | null>(null);
  const [auctionNotice, setAuctionNotice] = useState<string | null>(null);
  const [selectedAuctionRow, setSelectedAuctionRow] = useState<AuctionInsightItem | null>(null);

  // Landing Page Performance State
  const [landingPageItems, setLandingPageItems] = useState<LandingPageItem[]>([]);
  const [landingPageLoading, setLandingPageLoading] = useState<boolean>(false);
  const [landingPageError, setLandingPageError] = useState<string | null>(null);
  const [customerCurrency, setCustomerCurrency] = useState<string>("INR");
  const [selectedLandingRow, setSelectedLandingRow] = useState<LandingPageItem | null>(null);

  // Load Campaigns for filtering dropdown
  const loadCampaigns = useCallback(async () => {
    if (!customerId) return;
    try {
      const res = await fetch(`${BACKEND}/api/ads/campaigns?customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((c: any) => ({ id: String(c.id), name: c.name }))
          : data?.campaigns?.map((c: any) => ({ id: String(c.id), name: c.name })) || [];
        setCampaignsList(list);
      }
    } catch {
      // Quiet fallback
    }
  }, [customerId, orgId]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Fetch Auction Insights
  const fetchAuctionInsights = useCallback(async () => {
    if (!customerId) return;
    setAuctionLoading(true);
    setAuctionError(null);
    setAuctionNotice(null);

    try {
      const params = new URLSearchParams({ customerId });
      if (datePreset === "CUSTOM" && startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else if (datePreset !== "CUSTOM") {
        params.append("dateRange", datePreset);
      }
      if (selectedCampaignId) {
        params.append("campaignId", selectedCampaignId);
      }

      const res = await fetch(`${BACKEND}/api/ads/reports/auction-insights?${params.toString()}`, {
        headers: { "x-organization-id": orgId },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load Auction Insights");
      }

      setAuctionItems(data.items || []);
      if (data.notice) {
        setAuctionNotice(data.notice);
      }
    } catch (err: any) {
      setAuctionError(err.message || "Failed to load Auction Insights report");
    } finally {
      setAuctionLoading(false);
    }
  }, [customerId, orgId, datePreset, startDate, endDate, selectedCampaignId]);

  // Fetch Landing Pages
  const fetchLandingPages = useCallback(async () => {
    if (!customerId) return;
    setLandingPageLoading(true);
    setLandingPageError(null);

    try {
      const params = new URLSearchParams({ customerId });
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

      setLandingPageItems(data.items || []);
      if (data.currencyCode) {
        setCustomerCurrency(data.currencyCode);
      }
    } catch (err: any) {
      setLandingPageError(err.message || "Failed to load Landing Page report");
    } finally {
      setLandingPageLoading(false);
    }
  }, [customerId, orgId, datePreset, startDate, endDate, selectedCampaignId]);

  // Trigger loads when active report or relevant filter changes
  useEffect(() => {
    if (activeReport === "auction-insights") {
      fetchAuctionInsights();
    } else {
      fetchLandingPages();
    }
  }, [activeReport, fetchAuctionInsights, fetchLandingPages]);

  // Client-side text filter
  const filteredAuctionItems = auctionItems.filter((item) => {
    if (!searchTermFilter.trim()) return true;
    const term = searchTermFilter.toLowerCase();
    return (
      item.domain.toLowerCase().includes(term) ||
      (item.campaignName && item.campaignName.toLowerCase().includes(term))
    );
  });

  const filteredLandingPages = landingPageItems.filter((item) => {
    if (!searchTermFilter.trim()) return true;
    const term = searchTermFilter.toLowerCase();
    return (
      item.url.toLowerCase().includes(term) ||
      item.campaigns.some((c) => c.name.toLowerCase().includes(term))
    );
  });

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "INR":
        return "₹";
      case "AED":
        return "AED ";
      case "CAD":
        return "CA$";
      case "AUD":
        return "AU$";
      default:
        return `${code} `;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveReport("auction-insights")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === "auction-insights"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Auction Insights
          </button>
          <button
            onClick={() => setActiveReport("landing-pages")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === "landing-pages"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Globe className="h-4 w-4" />
            Landing Page Performance
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Account: {customerId || "None"}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Read-Only
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  datePreset === p.value
                    ? "bg-white text-blue-600 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {datePreset === "CUSTOM" && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none"
              />
            </div>
          )}

          {/* Campaign Selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Campaigns</option>
              {campaignsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Term Filter */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeReport === "auction-insights"
                  ? "Search competitor domain..."
                  : "Search landing page URL..."
              }
              value={searchTermFilter}
              onChange={(e) => setSearchTermFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchTermFilter && (
              <button
                onClick={() => setSearchTermFilter("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() =>
              activeReport === "auction-insights"
                ? fetchAuctionInsights()
                : fetchLandingPages()
            }
            disabled={auctionLoading || landingPageLoading}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer border border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                auctionLoading || landingPageLoading ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. AUCTION INSIGHTS TABLE & DETAIL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeReport === "auction-insights" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Auction Insights Report
                <span className="text-slate-500 font-normal">
                  ({filteredAuctionItems.length} competitors)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare your Search campaign visibility against other advertisers participating in the same auctions.
              </p>
            </div>
          </div>

          {/* Developer Token Notice if METRIC_ACCESS_DENIED */}
          {auctionNotice && (
            <div className="m-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold">Google Ads API Developer Access Level Notice</p>
                <p className="mt-1">{auctionNotice}</p>
                <p className="mt-1 text-slate-600">
                  Once your developer token has Standard Access approved in the Google Ads MCC API Center, real-time competitor domain shares will stream automatically here.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {auctionError && (
            <div className="m-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">Error loading Auction Insights</p>
                <p className="mt-1">{auctionError}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {auctionLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-xs font-medium text-slate-500">Querying Google Ads API v24 for Auction Insights...</p>
            </div>
          ) : filteredAuctionItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-blue-600" />
              </div>
              <p className="text-slate-900 font-bold text-sm">No Auction Insights data available</p>
              <p className="text-slate-500 text-xs max-w-sm">
                Google Ads requires sufficient Search impression volume in the selected date range to calculate competitor overlap. Try expanding your date range or selecting a different campaign.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Competitor / Domain</th>
                    <th className="p-4">Impression Share</th>
                    <th className="p-4">Overlap Rate</th>
                    <th className="p-4">Position Above Rate</th>
                    <th className="p-4">Top of Page Rate</th>
                    <th className="p-4">Absolute Top Rate</th>
                    <th className="p-4">Outranking Share</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAuctionItems.map((item, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedAuctionRow(item)}
                      className="hover:bg-blue-50/50 transition-all cursor-pointer group"
                    >
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600" />
                        <span>{item.domain}</span>
                        {item.campaignName && (
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            ({item.campaignName})
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {item.impressionShare}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {item.overlapRate}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {item.positionAboveRate}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {item.topOfPageRate}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {item.absTopOfPageRate}
                      </td>
                      <td className="p-4 font-semibold text-emerald-700">
                        {item.outrankingShare}
                      </td>
                      <td className="p-4 text-right">
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
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. LANDING PAGE PERFORMANCE TABLE & DETAIL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeReport === "landing-pages" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Landing Page Performance Report
                <span className="text-slate-500 font-normal">
                  ({filteredLandingPages.length} landing pages)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyze traffic volume, cost efficiency, and conversion rates across destination URLs in your campaigns.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {landingPageError && (
            <div className="m-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">Error loading Landing Page report</p>
                <p className="mt-1">{landingPageError}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {landingPageLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-xs font-medium text-slate-500">Querying Google Ads API v24 for landing page metrics...</p>
            </div>
          ) : filteredLandingPages.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Globe className="h-7 w-7 text-blue-600" />
              </div>
              <p className="text-slate-900 font-bold text-sm">No Landing Page performance data</p>
              <p className="text-slate-500 text-xs max-w-sm">
                No landing page views recorded for the selected date range and campaigns. Try selecting a wider date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Landing Page</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">Impressions</th>
                    <th className="p-4">CTR</th>
                    <th className="p-4">Cost ({customerCurrency})</th>
                    <th className="p-4">Avg. CPC</th>
                    <th className="p-4">Conversions</th>
                    <th className="p-4">Conv. Rate</th>
                    <th className="p-4">Conv. Value</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLandingPages.map((page, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedLandingRow(page)}
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
                      <td className="p-4 font-semibold text-slate-900">
                        {page.clicks.toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {page.impressions.toLocaleString()}
                      </td>
                      <td className="p-4 font-medium text-slate-700">{page.ctr}</td>
                      <td className="p-4 font-bold text-emerald-700">
                        {getCurrencySymbol(page.currencyCode)}
                        {page.cost}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {getCurrencySymbol(page.currencyCode)}
                        {page.avgCpc}
                      </td>
                      <td className="p-4 font-semibold text-purple-700">
                        {page.conversions}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {page.conversionRate}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {getCurrencySymbol(page.currencyCode)}
                        {page.conversionValue.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
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
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AUCTION INSIGHTS DETAIL MODAL / DRAWER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedAuctionRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Auction Insight Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Domain: {selectedAuctionRow.domain}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuctionRow(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Competitor Domain</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {selectedAuctionRow.domain}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Campaign</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {selectedAuctionRow.campaignName || "All Eligible Campaigns"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Auction Metrics (Google Ads API v24)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Impression Share</span>
                    <span className="text-base font-bold text-slate-900">
                      {selectedAuctionRow.impressionShare}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Percentage of auctions won vs eligible
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Overlap Rate</span>
                    <span className="text-base font-bold text-slate-900">
                      {selectedAuctionRow.overlapRate}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Frequency competitor also received impression
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Position Above Rate</span>
                    <span className="text-base font-bold text-slate-900">
                      {selectedAuctionRow.positionAboveRate}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Competitor was higher when both showed
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Top of Page Rate</span>
                    <span className="text-base font-bold text-slate-900">
                      {selectedAuctionRow.topOfPageRate}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Shown at top above organic results
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Absolute Top Rate</span>
                    <span className="text-base font-bold text-slate-900">
                      {selectedAuctionRow.absTopOfPageRate}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Shown as first ad above organic results
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-emerald-700 block">Outranking Share</span>
                    <span className="text-base font-bold text-emerald-800">
                      {selectedAuctionRow.outrankingShare}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      Your ad ranked higher or showed when theirs did not
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="font-medium">Active Date Range:</span>
                <span className="font-bold text-slate-900">
                  {datePreset === "CUSTOM" && startDate && endDate
                    ? `${startDate} ~ ${endDate}`
                    : datePreset.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAuctionRow(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LANDING PAGE DETAIL MODAL / DRAWER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedLandingRow && (
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
                onClick={() => setSelectedLandingRow(null)}
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
                    href={selectedLandingRow.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    Open Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs font-mono font-semibold text-slate-900 mt-1 break-all select-all">
                  {selectedLandingRow.url}
                </p>
              </div>

              {selectedLandingRow.campaigns.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Campaigns Using This URL ({selectedLandingRow.campaigns.length})
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {selectedLandingRow.campaigns.map((c) => (
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
                      {selectedLandingRow.clicks.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Clicks</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">
                      {selectedLandingRow.impressions.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Impressions</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">{selectedLandingRow.ctr}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">CTR</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                    <p className="text-lg font-bold text-emerald-800">
                      {getCurrencySymbol(selectedLandingRow.currencyCode)}
                      {selectedLandingRow.cost}
                    </p>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">Spend</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900">
                      {getCurrencySymbol(selectedLandingRow.currencyCode)}
                      {selectedLandingRow.avgCpc}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Avg. CPC</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
                    <p className="text-lg font-bold text-purple-800">
                      {selectedLandingRow.conversions}
                    </p>
                    <p className="text-xs font-semibold text-purple-700 mt-0.5">Conversions</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-base font-bold text-slate-900">
                      {selectedLandingRow.conversionRate}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Conversion Rate</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-base font-bold text-slate-900">
                      {getCurrencySymbol(selectedLandingRow.currencyCode)}
                      {selectedLandingRow.conversionValue.toFixed(2)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Conversion Value</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="font-medium">Active Date Range:</span>
                <span className="font-bold text-slate-900">
                  {datePreset === "CUSTOM" && startDate && endDate
                    ? `${startDate} ~ ${endDate}`
                    : datePreset.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLandingRow(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
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
