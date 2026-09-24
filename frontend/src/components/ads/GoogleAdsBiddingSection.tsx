"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Target,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Edit2,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  ShieldAlert,
  Percent
} from "lucide-react";

interface PortfolioStrategy {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  status: string;
  campaignCount: number;
  targetDisplay: string;
  targetCpa?: number | null;
  targetRoas?: number | null;
  campaigns: Array<{ id: string; name: string; status: string }>;
}

interface DataExclusion {
  id: string;
  resourceName: string;
  name: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  scope: string;
  campaigns: string[];
  devices: string[];
  status: string;
}

interface CampaignItem {
  id: string;
  name: string;
  resourceName?: string;
}

interface GoogleAdsBiddingSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignItem[];
}

const STRATEGY_TYPES = [
  { value: "TARGET_CPA", label: "Target CPA", desc: "Sets bids to help get as many conversions as possible at the target cost-per-action." },
  { value: "TARGET_ROAS", label: "Target ROAS", desc: "Sets bids to help get as much conversion value as possible at the target return on ad spend." },
  { value: "MAXIMIZE_CONVERSIONS", label: "Maximize Conversions", desc: "Sets bids to help get the most conversions for your budget." },
  { value: "MAXIMIZE_CONVERSION_VALUE", label: "Maximize Conversion Value", desc: "Sets bids to help get the most conversion value for your budget." },
  { value: "TARGET_SPEND", label: "Maximize Clicks", desc: "Sets bids to help get as many clicks as possible within your target spend." }
];

export function GoogleAdsBiddingSection({ customerId, orgId, campaigns = [] }: GoogleAdsBiddingSectionProps) {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // Subtab
  const [subTab, setSubTab] = useState<"portfolio" | "data-exclusions">("portfolio");

  // Data
  const [strategies, setStrategies] = useState<PortfolioStrategy[]>([]);
  const [exclusions, setExclusions] = useState<DataExclusion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<PortfolioStrategy | null>(null);
  const [editingExclusion, setEditingExclusion] = useState<DataExclusion | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Strategy Form
  const [stratName, setStratName] = useState("");
  const [stratType, setStratType] = useState<any>("TARGET_CPA");
  const [stratCpa, setStratCpa] = useState<number | "">(500);
  const [stratRoas, setStratRoas] = useState<number | "">(3.5);
  const [stratCpcCeiling, setStratCpcCeiling] = useState<number | "">("");

  // Exclusion Form
  const [exclName, setExclName] = useState("");
  const [exclDesc, setExclDesc] = useState("");
  const [exclStart, setExclStart] = useState("");
  const [exclEnd, setExclEnd] = useState("");
  const [exclScope, setExclScope] = useState<"GLOBAL" | "CAMPAIGN">("GLOBAL");
  const [exclCampaigns, setExclCampaigns] = useState<string[]>([]);

  // Assign to Campaign Form
  const [assignStrategy, setAssignStrategy] = useState<PortfolioStrategy | null>(null);
  const [selectedCampaignToAssign, setSelectedCampaignToAssign] = useState("");

  // ── Fetch Bidding Data ──────────────────────────────────────────────────────
  const fetchBiddingData = useCallback(async () => {
    if (!cleanCid) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      if (subTab === "portfolio") {
        const res = await fetch(`${BACKEND}/api/ads/bidding/portfolio-strategies?customerId=${cleanCid}`, {
          headers: { "x-organization-id": orgId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStrategies(data.items || []);
        } else {
          setErrorMsg(data.error || "Failed to load portfolio strategies");
        }
      } else {
        const res = await fetch(`${BACKEND}/api/ads/bidding/data-exclusions?customerId=${cleanCid}`, {
          headers: { "x-organization-id": orgId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setExclusions(data.items || []);
        } else {
          setErrorMsg(data.error || "Failed to load bidding data exclusions");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error loading bidding settings");
    } finally {
      setLoading(false);
    }
  }, [cleanCid, orgId, subTab, BACKEND]);

  useEffect(() => {
    fetchBiddingData();
  }, [fetchBiddingData]);

  // ── Save Portfolio Strategy ────────────────────────────────────────────────
  const handleSaveStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stratName.trim()) {
      alert("Strategy name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingStrategy) {
        // PATCH
        const res = await fetch(`${BACKEND}/api/ads/bidding/portfolio-strategies`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            resourceName: editingStrategy.resourceName,
            name: stratName.trim(),
            targetCpa: stratType === "TARGET_CPA" && stratCpa ? Number(stratCpa) : undefined,
            targetRoas: stratType === "TARGET_ROAS" && stratRoas ? Number(stratRoas) : undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsStrategyModalOpen(false);
          setEditingStrategy(null);
          fetchBiddingData();
        } else {
          alert(data.error || "Failed to update strategy");
        }
      } else {
        // POST
        const res = await fetch(`${BACKEND}/api/ads/bidding/portfolio-strategies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            name: stratName.trim(),
            type: stratType,
            targetCpa: stratType === "TARGET_CPA" && stratCpa ? Number(stratCpa) : undefined,
            targetRoas: stratType === "TARGET_ROAS" && stratRoas ? Number(stratRoas) : undefined,
            cpcBidCeiling: stratCpcCeiling ? Number(stratCpcCeiling) : undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsStrategyModalOpen(false);
          fetchBiddingData();
        } else {
          alert(data.error || "Failed to create strategy");
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed saving portfolio strategy");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Strategy ────────────────────────────────────────────────────────
  const handleDeleteStrategy = async (item: PortfolioStrategy) => {
    if (item.campaignCount > 0) {
      alert(`Cannot delete strategy: ${item.campaignCount} campaigns are currently assigned to it. Reassign those campaigns first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to remove portfolio strategy "${item.name}" from Google Ads?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/bidding/portfolio-strategies?customerId=${cleanCid}&resourceName=${encodeURIComponent(item.resourceName)}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBiddingData();
      } else {
        alert(data.error || "Failed to remove strategy");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting strategy");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Assign Strategy to Campaign ────────────────────────────────────────────
  const handleAssignStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStrategy || !selectedCampaignToAssign) {
      alert("Please select a target campaign.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/bidding/portfolio-strategies/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          biddingStrategyResourceName: assignStrategy.resourceName,
          campaignResourceName: selectedCampaignToAssign
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAssignModalOpen(false);
        setAssignStrategy(null);
        setSelectedCampaignToAssign("");
        fetchBiddingData();
      } else {
        alert(data.error || "Failed to assign strategy to campaign");
      }
    } catch (err: any) {
      alert(err.message || "Error assigning strategy");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Save Data Exclusion ────────────────────────────────────────────────────
  const handleSaveExclusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exclName.trim()) {
      alert("Data exclusion name is required.");
      return;
    }
    if (!exclStart || !exclEnd) {
      alert("Start and End dates/times are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingExclusion) {
        // PATCH
        const res = await fetch(`${BACKEND}/api/ads/bidding/data-exclusions`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            resourceName: editingExclusion.resourceName,
            name: exclName.trim(),
            description: exclDesc.trim(),
            startDateTime: exclStart,
            endDateTime: exclEnd,
            campaignIds: exclScope === "CAMPAIGN" ? exclCampaigns : undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsExclusionModalOpen(false);
          setEditingExclusion(null);
          fetchBiddingData();
        } else {
          alert(data.error || "Failed to update data exclusion");
        }
      } else {
        // POST
        const res = await fetch(`${BACKEND}/api/ads/bidding/data-exclusions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            name: exclName.trim(),
            description: exclDesc.trim(),
            startDateTime: exclStart,
            endDateTime: exclEnd,
            scope: exclScope,
            campaignIds: exclScope === "CAMPAIGN" ? exclCampaigns : []
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsExclusionModalOpen(false);
          fetchBiddingData();
        } else {
          alert(data.error || "Failed to create data exclusion in Google Ads");
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed saving data exclusion");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Data Exclusion ──────────────────────────────────────────────────
  const handleDeleteExclusion = async (item: DataExclusion) => {
    if (!window.confirm(`Are you sure you want to remove data exclusion "${item.name}"?`)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/bidding/data-exclusions?customerId=${cleanCid}&resourceName=${encodeURIComponent(item.resourceName)}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBiddingData();
      } else {
        alert(data.error || "Failed to delete data exclusion");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting data exclusion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Google Ads Portfolio Bidding &amp; Exclusions</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                v24 Official
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Create shared <strong>Portfolio Bidding Strategies</strong> across multiple campaigns and schedule <strong>Bidding Data Exclusions</strong> to prevent temporary tracking anomalies from impacting automated Smart Bidding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBiddingData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            {subTab === "portfolio" ? (
              <button
                onClick={() => {
                  setEditingStrategy(null);
                  setStratName("");
                  setStratType("TARGET_CPA");
                  setStratCpa(500);
                  setStratRoas(3.5);
                  setStratCpcCeiling("");
                  setIsStrategyModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Portfolio Strategy</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingExclusion(null);
                  setExclName("");
                  setExclDesc("");
                  setExclStart("");
                  setExclEnd("");
                  setExclScope("GLOBAL");
                  setExclCampaigns([]);
                  setIsExclusionModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Data Exclusion</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab("portfolio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === "portfolio"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Portfolio Strategies ({strategies.length})</span>
            </button>

            <button
              onClick={() => setSubTab("data-exclusions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === "data-exclusions"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bidding Data Exclusions ({exclusions.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Information note */}
      {subTab === "data-exclusions" && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <p className="font-bold">Bidding Data Exclusion Behavior</p>
            <p>
              Data exclusions inform Google Smart Bidding algorithms to ignore conversion rate and volume fluctuations during technical website outages or tracking issues. <strong>They do NOT delete historical conversion records or reporting data</strong>; they only protect your Smart Bidding models from over- or under-reacting.
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchBiddingData} className="font-bold underline hover:text-rose-900 cursor-pointer">Retry</button>
        </div>
      )}

      {/* 3. Table rendering */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500 rounded-2xl bg-white border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs font-bold">Querying Google Ads Bidding API...</p>
        </div>
      ) : subTab === "portfolio" ? (
        strategies.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Portfolio Bidding Strategies Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Portfolio strategies allow you to optimize performance across multiple campaigns with shared Target CPA or Target ROAS goals.
            </p>
            <button
              onClick={() => {
                setEditingStrategy(null);
                setStratName("");
                setStratType("TARGET_CPA");
                setStratCpa(500);
                setStratRoas(3.5);
                setStratCpcCeiling("");
                setIsStrategyModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Portfolio Strategy</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Strategy Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Target Setting</th>
                    <th className="p-4">Campaigns ({campaigns.length} in account)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {strategies
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.type.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(strat => (
                      <tr key={strat.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{strat.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {strat.id}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[10px]">
                            {strat.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">
                          {strat.targetDisplay}
                        </td>
                        <td className="p-4">
                          {strat.campaigns && strat.campaigns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {strat.campaigns.map((c) => (
                                <span key={c.id} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">0 campaigns assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {strat.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setAssignStrategy(strat);
                                setSelectedCampaignToAssign(campaigns[0]?.resourceName || "");
                                setIsAssignModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-emerald-700 hover:bg-emerald-50 font-bold text-[11px] border border-emerald-200 transition-all cursor-pointer"
                              title="Assign to campaign"
                            >
                              Assign Campaign
                            </button>
                            <button
                              onClick={() => {
                                setEditingStrategy(strat);
                                setStratName(strat.name);
                                setStratType(strat.type);
                                setStratCpa(strat.targetCpa || "");
                                setStratRoas(strat.targetRoas ? strat.targetRoas / 100 : "");
                                setIsStrategyModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                              title="Edit Strategy"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStrategy(strat)}
                              disabled={submitting}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Strategy"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        exclusions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Bidding Data Exclusions Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Exclude specific timeframes (e.g., website maintenance, conversion tag outage) so automated Smart Bidding disregards misleading conversion signals.
            </p>
            <button
              onClick={() => {
                setEditingExclusion(null);
                setExclName("");
                setExclDesc("");
                setExclStart("");
                setExclEnd("");
                setExclScope("GLOBAL");
                setExclCampaigns([]);
                setIsExclusionModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Data Exclusion</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Exclusion Name</th>
                    <th className="p-4">Period (Start &rarr; End)</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {exclusions
                    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(excl => (
                      <tr key={excl.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{excl.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{excl.description || "Conversion anomaly exclusion"}</div>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-700">
                          <div>{excl.startDateTime}</div>
                          <div className="text-slate-400">&rarr; {excl.endDateTime}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-semibold">
                            {excl.scope === "GLOBAL" ? "All Campaigns (Global)" : `${excl.campaigns.length} Campaigns`}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {excl.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteExclusion(excl)}
                            disabled={submitting}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete Exclusion"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE / EDIT PORTFOLIO STRATEGY                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isStrategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {editingStrategy ? "Edit Portfolio Strategy" : "Create Portfolio Strategy"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Google Ads API v24 (bidding_strategy)</p>
              </div>
              <button
                onClick={() => setIsStrategyModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStrategy} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Strategy Name *</label>
                <input
                  type="text"
                  placeholder="e.g. High ROI Portfolio Bidding"
                  value={stratName}
                  onChange={(e) => setStratName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {!editingStrategy && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Strategy Type *</label>
                  <select
                    value={stratType}
                    onChange={(e) => setStratType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    {STRATEGY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {stratType === "TARGET_CPA" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target CPA (Cost Per Action) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min={1}
                      placeholder="500"
                      value={stratCpa}
                      onChange={(e) => setStratCpa(e.target.value ? Number(e.target.value) : "")}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {stratType === "TARGET_ROAS" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target ROAS (e.g. 3.5 = 350%) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min={0.1}
                      placeholder="3.5"
                      value={stratRoas}
                      onChange={(e) => setStratRoas(e.target.value ? Number(e.target.value) : "")}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {!editingStrategy && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max CPC Bid Limit / Ceiling (Optional)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 50"
                    value={stratCpcCeiling}
                    onChange={(e) => setStratCpcCeiling(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Prevents automated bidding from exceeding this single click cost.</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStrategyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingStrategy ? "Update Strategy" : "Create Strategy"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: ASSIGN STRATEGY TO CAMPAIGN                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isAssignModalOpen && assignStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Assign Portfolio Strategy</h4>
                <p className="text-xs text-slate-500 mt-0.5">{assignStrategy.name}</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignStrategy} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Campaign *</label>
                <select
                  value={selectedCampaignToAssign}
                  onChange={(e) => setSelectedCampaignToAssign(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Campaign --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.resourceName || `customers/${cleanCid}/campaigns/${c.id}`}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Assigning this portfolio strategy will update the campaign's bidding architecture in Google Ads.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedCampaignToAssign}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Assign to Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE / EDIT BIDDING DATA EXCLUSION                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isExclusionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {editingExclusion ? "Edit Data Exclusion" : "Create Bidding Data Exclusion"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Google Ads v24 (bidding_data_exclusion)</p>
              </div>
              <button
                onClick={() => setIsExclusionModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExclusion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exclusion Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Website Checkout Outage July 2026"
                  value={exclName}
                  onChange={(e) => setExclName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Server maintenance caused broken conversion tag for 6 hours"
                  value={exclDesc}
                  onChange={(e) => setExclDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    value={exclStart}
                    onChange={(e) => setExclStart(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    value={exclEnd}
                    onChange={(e) => setExclEnd(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExclScope("GLOBAL")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      exclScope === "GLOBAL"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Campaigns (Global)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExclScope("CAMPAIGN")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      exclScope === "CAMPAIGN"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Specific Campaigns
                  </button>
                </div>
              </div>

              {exclScope === "CAMPAIGN" && campaigns.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Affected Campaigns</label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {campaigns.map((c) => {
                      const isSelected = exclCampaigns.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExclCampaigns([...exclCampaigns, c.id]);
                              } else {
                                setExclCampaigns(exclCampaigns.filter(x => x !== c.id));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-slate-800">{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExclusionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingExclusion ? "Update Exclusion" : "Create Exclusion in Google Ads"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
