"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FlaskConical,
  Plus,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  Search,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders,
  Info,
  Check,
  Megaphone,
  ArrowRight
} from "lucide-react";

interface GoogleAdsExperimentsSectionProps {
  customerId: string;
  orgId: string;
}

interface ExperimentItem {
  id: string;
  resourceName: string;
  name: string;
  description: string;
  suffix: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  trafficSplitPercent: number;
  arms: any[];
  baseCampaignResource: string | null;
  baseCampaignId: string | null;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const EXPERIMENT_TYPES = [
  { value: "SEARCH_CUSTOM", label: "Search Custom A/B Experiment", desc: "Test ad copy, bidding, or settings on Search campaigns" },
  { value: "DISPLAY_CUSTOM", label: "Display Custom Experiment", desc: "Test responsive display ads and audience targeting" },
  { value: "VIDEO_CUSTOM", label: "Video Campaign Experiment", desc: "A/B test YouTube video variations and strategies" },
  { value: "APP_CUSTOM", label: "App Promotion Experiment", desc: "Test mobile app install and engagement assets" }
];

export function GoogleAdsExperimentsSection({ customerId, orgId }: GoogleAdsExperimentsSectionProps) {
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTermFilter] = useState("");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignsList, setCampaignsList] = useState<Array<{ id: string; name: string; channelType?: string }>>([]);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createSuffix, setCreateSuffix] = useState("Exp");
  const [createType, setCreateType] = useState("SEARCH_CUSTOM");
  const [createCampaignId, setCreateCampaignId] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createEndDate, setCreateEndDate] = useState("");
  const [createTrafficSplit, setCreateTrafficSplit] = useState(50);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Detail Modal
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentItem | null>(null);

  // Action confirmations
  const [actionConfirm, setActionConfirm] = useState<{
    type: "schedule" | "promote" | "end" | "remove";
    experiment: ExperimentItem;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load Campaigns
  const loadCampaigns = useCallback(async () => {
    if (!customerId) return;
    try {
      const res = await fetch(`${BACKEND}/api/ads/campaigns?customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((c: any) => ({ id: String(c.id), name: c.name, channelType: c.advertisingChannelType }))
          : data?.campaigns?.map((c: any) => ({ id: String(c.id), name: c.name, channelType: c.advertisingChannelType })) || [];
        setCampaignsList(list);
      }
    } catch {
      // Fallback
    }
  }, [customerId, orgId]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Fetch Experiments
  const fetchExperiments = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ customerId });
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`${BACKEND}/api/ads/experiments?${params.toString()}`, {
        headers: { "x-organization-id": orgId }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load experiments");

      setExperiments(data.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve experiments");
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId, statusFilter]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  // Handle Create Experiment
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError("Please enter an experiment name.");
      return;
    }
    if (createStartDate && createEndDate && createStartDate > createEndDate) {
      setCreateError("Start date cannot be after end date.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/experiments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          name: createName.trim(),
          description: createDesc.trim() || undefined,
          suffix: createSuffix.trim() || undefined,
          type: createType,
          startDate: createStartDate || undefined,
          endDate: createEndDate || undefined,
          campaignId: createCampaignId || undefined,
          trafficSplitPercent: createTrafficSplit
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create experiment");

      setActionSuccess(`Experiment "${createName}" created in SETUP state.`);
      setShowCreateModal(false);
      setCreateName("");
      setCreateDesc("");
      setCreateCampaignId("");
      fetchExperiments();
    } catch (err: any) {
      setCreateError(err.message || "Experiment creation failed");
    } finally {
      setCreating(false);
    }
  };

  // Handle Lifecycle Action
  const handleExecuteAction = async () => {
    if (!actionConfirm) return;
    setActionLoading(true);

    const { type, experiment } = actionConfirm;

    try {
      let endpoint = "";
      let method = "POST";

      if (type === "schedule") endpoint = `${BACKEND}/api/ads/experiments/schedule`;
      if (type === "promote") endpoint = `${BACKEND}/api/ads/experiments/promote`;
      if (type === "end") endpoint = `${BACKEND}/api/ads/experiments/end`;
      if (type === "remove") {
        endpoint = `${BACKEND}/api/ads/experiments`;
        method = "DELETE";
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          resourceName: experiment.resourceName
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${type} experiment`);

      setActionSuccess(`Experiment ${type} action completed successfully.`);
      setActionConfirm(null);
      if (selectedExperiment?.resourceName === experiment.resourceName) {
        setSelectedExperiment(null);
      }
      fetchExperiments();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLED":
      case "RUNNING":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "SETUP":
      case "INITIALIZING":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "GRADUATED":
      case "PROMOTED":
        return "text-purple-700 bg-purple-50 border-purple-200";
      case "REMOVED":
      case "ENDED":
        return "text-slate-600 bg-slate-100 border-slate-200";
      default:
        return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  const filteredExperiments = experiments.filter((e) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      (e.id && e.id.toLowerCase().includes(term)) ||
      (e.description && e.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Google Ads Experiments
              <span className="text-slate-500 font-normal">({filteredExperiments.length} experiments)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Run statistical A/B tests to measure the direct performance impact of changes to bidding, targeting, and creatives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Experiment
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SETUP">Setup</option>
            <option value="INITIALIZING">Initializing</option>
            <option value="ENABLED">Running / Enabled</option>
            <option value="GRADUATED">Graduated / Promoted</option>
            <option value="REMOVED">Removed</option>
          </select>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search experiments by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTermFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={fetchExperiments}
          disabled={loading}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
          title="Refresh Experiments"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <p className="font-bold">Error loading experiments</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Experiments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-xs font-medium text-slate-500">Querying Google Ads API v24 for experiments...</p>
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <FlaskConical className="h-7 w-7 text-blue-600" />
            </div>
            <p className="text-slate-900 font-bold text-sm">No Experiments Found</p>
            <p className="text-slate-500 text-xs max-w-sm">
              You haven&apos;t created any experiments in this Google Ads account yet. Click &quot;New Experiment&quot; to test changes against a control campaign.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Experiment Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Split (Trial/Control)</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExperiments.map((exp, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedExperiment(exp)}
                    className="hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{exp.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {exp.id}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(exp.status)}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-600">
                      {exp.type.replace(/_/g, " ")}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {exp.trafficSplitPercent}% / {100 - exp.trafficSplitPercent}%
                    </td>
                    <td className="p-4 text-slate-600">
                      <p className="font-medium">{exp.startDate} ~ {exp.endDate}</p>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Schedule / Start Button */}
                        {(exp.status === "SETUP" || exp.status === "INITIALIZING") && (
                          <button
                            onClick={() => setActionConfirm({ type: "schedule", experiment: exp })}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                            title="Schedule and start experiment"
                          >
                            Start
                          </button>
                        )}

                        {/* Promote Button */}
                        {(exp.status === "ENABLED" || exp.status === "RUNNING") && (
                          <button
                            onClick={() => setActionConfirm({ type: "promote", experiment: exp })}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer"
                            title="Apply trial changes to base campaign"
                          >
                            Apply
                          </button>
                        )}

                        {/* End Button */}
                        {(exp.status === "ENABLED" || exp.status === "RUNNING") && (
                          <button
                            onClick={() => setActionConfirm({ type: "end", experiment: exp })}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
                            title="End active experiment"
                          >
                            End
                          </button>
                        )}

                        {/* Remove / Delete Button */}
                        {exp.status !== "REMOVED" && (
                          <button
                            onClick={() => setActionConfirm({ type: "remove", experiment: exp })}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove experiment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        <span className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 group-hover:underline ml-2">
                          Details <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CREATE EXPERIMENT MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Create Google Ads Experiment</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experiment Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Search Bidding Target CPA Test"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Base Campaign to Test Against
                </label>
                <select
                  value={createCampaignId}
                  onChange={(e) => setCreateCampaignId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Base Campaign...</option>
                  {campaignsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.channelType || "Campaign"})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  A control arm will be created using this campaign and an identical trial arm will be prepared.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experiment Type</label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {EXPERIMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Name Suffix</label>
                  <input
                    type="text"
                    placeholder="e.g. Exp"
                    value={createSuffix}
                    onChange={(e) => setCreateSuffix(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={createEndDate}
                    onChange={(e) => setCreateEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Traffic / Budget Split</label>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {createTrafficSplit}% Trial / {100 - createTrafficSplit}% Control
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={createTrafficSplit}
                  onChange={(e) => setCreateTrafficSplit(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Notes about the hypothesis, target changes, or KPI goals..."
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Experiment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EXPERIMENT DETAIL MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-sm">
                    {selectedExperiment.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedExperiment.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-medium">Status</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedExperiment.status)}`}>
                    {selectedExperiment.status}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-medium">Experiment Type</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {selectedExperiment.type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="text-slate-500 font-medium">Schedule Period</p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedExperiment.startDate} ~ {selectedExperiment.endDate}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="text-slate-500 font-medium">Traffic / Split Allocation</p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedExperiment.trafficSplitPercent}% Treatment / {100 - selectedExperiment.trafficSplitPercent}% Control
                </p>
              </div>

              {selectedExperiment.arms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Experiment Arms ({selectedExperiment.arms.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedExperiment.arms.map((arm: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {arm.name}
                            {arm.isControl && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">Control</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{arm.resourceName}</p>
                        </div>
                        <span className="font-mono font-bold text-slate-700">{arm.trafficSplit}% Split</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(selectedExperiment.status === "SETUP" || selectedExperiment.status === "INITIALIZING") && (
                  <button
                    onClick={() => {
                      setActionConfirm({ type: "schedule", experiment: selectedExperiment });
                      setSelectedExperiment(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Start Experiment
                  </button>
                )}
                {(selectedExperiment.status === "ENABLED" || selectedExperiment.status === "RUNNING") && (
                  <button
                    onClick={() => {
                      setActionConfirm({ type: "promote", experiment: selectedExperiment });
                      setSelectedExperiment(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer"
                  >
                    Apply to Base Campaign
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedExperiment(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACTION CONFIRMATION MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {actionConfirm.type} Experiment?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to {actionConfirm.type} experiment &quot;{actionConfirm.experiment.name}&quot; in Google Ads?
                {actionConfirm.type === "promote" && " This will apply the trial arm configuration directly to the base campaign."}
                {actionConfirm.type === "remove" && " This will delete the experiment permanently."}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActionConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : `Confirm ${actionConfirm.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
