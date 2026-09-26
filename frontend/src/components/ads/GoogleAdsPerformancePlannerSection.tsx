"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  MousePointerClick,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
  CheckCircle,
  HelpCircle,
  Target,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

interface CampaignItem {
  id: string;
  name: string;
  campaignType?: string;
}

interface ForecastResult {
  success: boolean;
  campaignId: string;
  campaignName: string;
  currencyCode: string;
  forecastPeriod: {
    startDate: string;
    endDate: string;
  };
  current: {
    dailyBudget: number;
    biddingStrategyType: string;
    advertisingChannelType: string;
    status: string;
    keywordCount: number;
  };
  forecast: {
    clicks?: number;
    cost?: number;
    averageCpc?: number;
    conversions?: number;
    averageCpa?: number;
  };
  rawGoogleAdsForecastMetrics: Record<string, any>;
  targetingUsed: {
    languages: string[];
    geoTargets: string[];
    keywordsCount: number;
  };
  notice?: string;
}

interface GoogleAdsPerformancePlannerSectionProps {
  customerId: string;
  orgId: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Predefined forecast window presets
const FORECAST_PRESETS = [
  { label: "Next 7 Days", days: 7 },
  { label: "Next 14 Days", days: 14 },
  { label: "Next 30 Days", days: 30 },
  { label: "Next Calendar Month", month: 1 }
];

export function GoogleAdsPerformancePlannerSection({
  customerId,
  orgId
}: GoogleAdsPerformancePlannerSectionProps) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [campaignsLoading, setCampaignsLoading] = useState<boolean>(false);

  // Date range state (default to next 30 days)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 31);
    return d.toISOString().split("T")[0];
  });

  const [customDailyBudget, setCustomDailyBudget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [forecastData, setForecastData] = useState<ForecastResult | null>(null);
  const [error, setError] = useState<string>("");

  // Load campaigns for customer
  const fetchCampaigns = useCallback(async () => {
    if (!customerId) return;
    setCampaignsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/campaigns?orgId=${orgId}&customerId=${customerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const list = data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          campaignType: c.campaignType || c.advertisingChannelType
        }));
        setCampaigns(list);
        if (list.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(list[0].id);
        }
      }
    } catch (err: any) {
      console.warn("Could not load campaigns for performance planner:", err.message);
    } finally {
      setCampaignsLoading(false);
    }
  }, [customerId, orgId, selectedCampaignId]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handlePresetSelect = (preset: typeof FORECAST_PRESETS[0]) => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    setStartDate(start.toISOString().split("T")[0]);

    if (preset.days) {
      const end = new Date();
      end.setDate(end.getDate() + preset.days);
      setEndDate(end.toISOString().split("T")[0]);
    } else if (preset.month) {
      // First day of next month to last day of next month
      const today = new Date();
      const nextMonthFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthLast = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      setStartDate(nextMonthFirst.toISOString().split("T")[0]);
      setEndDate(nextMonthLast.toISOString().split("T")[0]);
    }
  };

  const generateForecast = async () => {
    if (!customerId) {
      setError("Please select a valid Google Ads account.");
      return;
    }
    if (!selectedCampaignId) {
      setError("Please select an active Google Ads campaign to forecast.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both start date and end date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND}/api/ads/planner/performance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId,
          campaignId: selectedCampaignId,
          startDate,
          endDate,
          customDailyBudget: customDailyBudget ? Number(customDailyBudget) : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate campaign performance forecast");
      }

      setForecastData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating forecast.");
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number | undefined, currency: string) => {
    if (val === undefined || val === null || isNaN(val)) return "—";
    return `${currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header and Setup Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                Google Ads Performance Planner
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Forecast upcoming campaign clicks, spend, and average CPC based on Google Ads API v24 bidding models.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Account: {customerId || "None"}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Official v24 Forecast Engine
            </span>
          </div>
        </div>

        {/* ── Parameters Form ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Campaign Selector */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Select Campaign to Forecast
            </label>
            <div className="relative">
              <select
                value={selectedCampaignId}
                onChange={e => setSelectedCampaignId(e.target.value)}
                disabled={campaignsLoading || campaigns.length === 0}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50"
              >
                {campaigns.length === 0 ? (
                  <option value="">No campaigns available</option>
                ) : (
                  campaigns.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.campaignType || "Search"})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Forecast Date Range */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Forecast Period</span>
              <div className="flex items-center gap-1.5 font-normal text-[11px]">
                {FORECAST_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    {p.label}
                    {idx < FORECAST_PRESETS.length - 1 && <span className="text-slate-300 ml-1.5">|</span>}
                  </button>
                ))}
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Optional Planned Daily Spend Override */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700" title="Optional daily budget simulation">
              Planned Daily Budget
            </label>
            <div className="relative">
              <input
                type="number"
                value={customDailyBudget}
                onChange={e => setCustomDailyBudget(e.target.value)}
                placeholder="Current"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <span>
              Forecasts are generated in real-time from the Google Ads forecast model using active campaign keywords and geo targeting.
            </span>
          </div>

          <button
            onClick={generateForecast}
            disabled={loading || !selectedCampaignId}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculating Forecast...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Forecast
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Forecast Simulation Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ── Forecast Result ── */}
      {forecastData && (
        <div className="space-y-6 animate-in fade-in">
          {/* Notice banner if baseline keywords used */}
          {forecastData.notice && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Planning Notice</p>
                <p className="mt-0.5">{forecastData.notice}</p>
              </div>
            </div>
          )}

          {/* Primary Forecast Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Projected Clicks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Clicks</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MousePointerClick className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {forecastData.forecast.clicks !== undefined ? forecastData.forecast.clicks.toLocaleString() : "—"}
              </p>
              <p className="text-[11px] text-slate-400">
                Over {forecastData.forecastPeriod.startDate} to {forecastData.forecastPeriod.endDate}
              </p>
            </div>

            {/* Projected Spend / Cost */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Spend</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(forecastData.forecast.cost, forecastData.currencyCode)}
              </p>
              <p className="text-[11px] text-slate-400">
                Total planned budget required
              </p>
            </div>

            {/* Projected Avg. CPC */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Avg. CPC</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(forecastData.forecast.averageCpc, forecastData.currencyCode)}
              </p>
              <p className="text-[11px] text-slate-400">
                Average cost per click forecasted
              </p>
            </div>

            {/* Projected Conversions or CPA */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {forecastData.forecast.conversions !== undefined ? "Projected Conversions" : "Bidding Model"}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {forecastData.forecast.conversions !== undefined
                  ? forecastData.forecast.conversions.toLocaleString()
                  : forecastData.current.biddingStrategyType.replace(/_/g, " ")}
              </p>
              <p className="text-[11px] text-slate-400">
                {forecastData.forecast.averageCpa !== undefined
                  ? `Est. CPA: ${formatCurrency(forecastData.forecast.averageCpa, forecastData.currencyCode)}`
                  : "Based on active campaign strategy"}
              </p>
            </div>
          </div>

          {/* Current vs Forecast Performance Comparison Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Campaign Configuration &amp; Forecast Details
                </h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                Google Ads API v24 Model
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Parameter</th>
                    <th className="p-3.5">Current Campaign Setting</th>
                    <th className="p-3.5">Forecast Period Plan</th>
                    <th className="p-3.5">Forecast Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Campaign Name</td>
                    <td className="p-3.5">{forecastData.campaignName}</td>
                    <td className="p-3.5">{forecastData.campaignName}</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Active Model</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Daily Budget</td>
                    <td className="p-3.5 font-mono">
                      {formatCurrency(forecastData.current.dailyBudget, forecastData.currencyCode)} / day
                    </td>
                    <td className="p-3.5 font-mono font-bold text-indigo-700">
                      {formatCurrency(
                        customDailyBudget ? Number(customDailyBudget) : forecastData.current.dailyBudget,
                        forecastData.currencyCode
                      )}{" "}
                      / day
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {customDailyBudget ? "Simulated Override" : "Standard Daily"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Forecast Period</td>
                    <td className="p-3.5 text-slate-500">—</td>
                    <td className="p-3.5 font-medium">
                      {forecastData.forecastPeriod.startDate} ~ {forecastData.forecastPeriod.endDate}
                    </td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Configured</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Bidding Strategy</td>
                    <td className="p-3.5">{forecastData.current.biddingStrategyType.replace(/_/g, " ")}</td>
                    <td className="p-3.5 font-medium">{forecastData.current.biddingStrategyType.replace(/_/g, " ")}</td>
                    <td className="p-3.5 text-slate-500">Primary Optimization</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Forecasted Volume</td>
                    <td className="p-3.5 text-slate-500">Historical Tracking</td>
                    <td className="p-3.5 font-bold text-slate-900 font-mono">
                      {forecastData.forecast.clicks !== undefined
                        ? `${forecastData.forecast.clicks.toLocaleString()} clicks`
                        : "—"}
                    </td>
                    <td className="p-3.5 text-emerald-700 font-semibold">Google Prediction</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Targeting Used</td>
                    <td className="p-3.5 text-slate-600">
                      {forecastData.targetingUsed.keywordsCount} keyword(s), {forecastData.targetingUsed.geoTargets.length} location(s)
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {forecastData.targetingUsed.languages.join(", ")}
                    </td>
                    <td className="p-3.5 text-slate-500">Direct v24 Parameter</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !forecastData && !error && (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Plan and Forecast Campaign Performance</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select a campaign and a future date range above, then click <strong>&quot;Generate Forecast&quot;</strong> to model projected clicks, total spend, and average CPC directly using Google Ads API v24.
          </p>
        </div>
      )}
    </div>
  );
}
