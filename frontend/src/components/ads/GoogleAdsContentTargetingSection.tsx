"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Tag,
  Target,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Trash2,
  Loader2,
  X,
  Plus,
  ShieldAlert,
  Layers,
  ExternalLink,
  BookOpen,
  FolderMinus,
  Ban
} from "lucide-react";

export interface PlacementCriterionItem {
  resourceName: string;
  criterionId: string;
  url: string;
  negative: boolean;
  status?: string;
  isMutable: boolean;
}

export interface TopicCriterionItem {
  resourceName: string;
  criterionId: string;
  topicConstant: string;
  topicId: string;
  path: string[];
  displayName: string;
  negative: boolean;
  status?: string;
  isMutable: boolean;
}

export interface TopicConstantItem {
  id: string;
  resourceName: string;
  path: string[];
  displayName: string;
}

export interface CampaignContentTargetingData {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportNotes: {
    placementSupported: boolean;
    placementExclusionSupported: boolean;
    topicSupported: boolean;
    topicExclusionSupported: boolean;
    limitationMessage?: string;
    unsupportedDimensions?: string[];
  };
  placements: {
    activeCriteria: PlacementCriterionItem[];
    canExclude: boolean;
  };
  topics: {
    activeCriteria: TopicCriterionItem[];
    popularTopics: TopicConstantItem[];
    canExclude: boolean;
  };
}

interface CampaignItem {
  id: string;
  name: string;
  resourceName?: string;
  campaignType?: string;
  advertisingChannelType?: string;
}

interface GoogleAdsContentTargetingSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignItem[];
}

export function GoogleAdsContentTargetingSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsContentTargetingSectionProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<CampaignContentTargetingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active Tab: PLACEMENTS vs TOPICS
  const [activeTab, setActiveTab] = useState<"PLACEMENTS" | "TOPICS">("PLACEMENTS");

  // Add Placement Exclusion Modal
  const [isAddPlacementModalOpen, setIsAddPlacementModalOpen] = useState<boolean>(false);
  const [placementUrlInput, setPlacementUrlInput] = useState<string>("");
  const [isSubmittingPlacement, setIsSubmittingPlacement] = useState<boolean>(false);

  // Add Topic Exclusion Modal
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState<boolean>(false);
  const [selectedTopicConstant, setSelectedTopicConstant] = useState<string>("");
  const [isSubmittingTopic, setIsSubmittingTopic] = useState<boolean>(false);

  // Removal Modal
  const [itemToDelete, setItemToDelete] = useState<{
    resourceName: string;
    type: "PLACEMENT" | "TOPIC";
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Search filter inside lists
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Auto-select first campaign
  useEffect(() => {
    if (campaigns && campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(String(campaigns[0].id));
    }
  }, [campaigns, selectedCampaignId]);

  // Load content targeting for selected campaign
  const fetchContentTargeting = useCallback(async () => {
    if (!selectedCampaignId || !customerId || !orgId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/content-targeting?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(
          customerId
        )}&campaignId=${encodeURIComponent(selectedCampaignId)}`
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load content targeting data");
      }

      setData(json.contentTargeting);
      // Pre-select first popular topic for modal
      if (json.contentTargeting?.topics?.popularTopics?.length) {
        setSelectedTopicConstant(json.contentTargeting.topics.popularTopics[0].resourceName);
      }
    } catch (err: any) {
      console.error("[GoogleAdsContentTargetingSection] fetch error:", err);
      setError(err.message || "Failed to load campaign content targeting");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignId, customerId, orgId]);

  useEffect(() => {
    fetchContentTargeting();
  }, [fetchContentTargeting]);

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Add Placement Exclusion
  const handleAddPlacement = async () => {
    if (!selectedCampaignId || !placementUrlInput.trim() || !customerId || !orgId) return;
    setIsSubmittingPlacement(true);
    setError(null);

    try {
      const res = await fetch("/api/ads/content-targeting/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId,
          campaignId: selectedCampaignId,
          url: placementUrlInput.trim(),
          negative: true
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to exclude placement");
      }

      setSuccessToast(`Placement exclusion for '${placementUrlInput.trim()}' saved to Google Ads.`);
      setIsAddPlacementModalOpen(false);
      setPlacementUrlInput("");
      await fetchContentTargeting();
    } catch (err: any) {
      console.error("[GoogleAdsContentTargetingSection] add placement error:", err);
      setError(err.message || "Failed to exclude placement");
    } finally {
      setIsSubmittingPlacement(false);
    }
  };

  // Add Topic Exclusion
  const handleAddTopic = async () => {
    if (!selectedCampaignId || !selectedTopicConstant || !customerId || !orgId) return;
    setIsSubmittingTopic(true);
    setError(null);

    try {
      const res = await fetch("/api/ads/content-targeting/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId,
          campaignId: selectedCampaignId,
          topicConstantOrId: selectedTopicConstant,
          negative: true
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to exclude topic");
      }

      setSuccessToast("Topic exclusion saved to Google Ads successfully.");
      setIsAddTopicModalOpen(false);
      await fetchContentTargeting();
    } catch (err: any) {
      console.error("[GoogleAdsContentTargetingSection] add topic error:", err);
      setError(err.message || "Failed to exclude topic");
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // Remove Criterion
  const handleRemoveCriterion = async () => {
    if (!itemToDelete || !customerId || !orgId) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/content-targeting?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(
          customerId
        )}&resourceName=${encodeURIComponent(itemToDelete.resourceName)}`,
        { method: "DELETE" }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to remove criterion");
      }

      setSuccessToast(`${itemToDelete.type === "PLACEMENT" ? "Placement" : "Topic"} exclusion removed.`);
      setItemToDelete(null);
      await fetchContentTargeting();
    } catch (err: any) {
      console.error("[GoogleAdsContentTargetingSection] remove error:", err);
      setError(err.message || "Failed to remove criterion");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered lists
  const filteredPlacements = (data?.placements?.activeCriteria || []).filter(p =>
    p.url.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredTopics = (data?.topics?.activeCriteria || []).filter(t =>
    t.displayName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const isTopicSupported = data?.supportNotes?.topicSupported || false;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* ── Header ── */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50/50 to-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Content Targeting (Placements &amp; Topics)</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                Google Ads v24
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control where your ads show by managing campaign-level Placement Exclusions and Topic Exclusions.
            </p>
          </div>
        </div>

        {/* Campaign Selector & Refresh */}
        <div className="flex items-center gap-2">
          {campaigns.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Campaign:</span>
              <select
                value={selectedCampaignId}
                onChange={e => setSelectedCampaignId(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs max-w-[220px] truncate"
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.campaignType || c.advertisingChannelType || "SEARCH"})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No campaigns found</span>
          )}

          <button
            onClick={fetchContentTargeting}
            disabled={loading || !selectedCampaignId}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh Content Targeting"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Toast Notifications ── */}
      {successToast && (
        <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Campaign Metadata & API Limitation Warning ── */}
      {data && (
        <div className="p-5 pb-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Selected:</span>
            <span className="text-xs font-bold text-slate-900">{data.campaignName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {data.campaignType}
            </span>
            {data.isPMax && (
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Performance Max
              </span>
            )}
          </div>

          {/* Limitation Banner */}
          {data.supportNotes.limitationMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                data.isPMax
                  ? "bg-amber-50/80 border-amber-200 text-amber-900"
                  : "bg-blue-50/70 border-blue-200 text-blue-900"
              }`}
            >
              {data.isPMax ? (
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold">
                  {data.isPMax ? "Performance Max Placement Policy" : "Google Ads API v24 Campaign Rules"}
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">{data.supportNotes.limitationMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs (Placements vs Topics) ── */}
      <div className="px-5 pt-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab("PLACEMENTS"); setSearchFilter(""); }}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "PLACEMENTS"
              ? "border-blue-600 text-blue-700 bg-blue-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Placements</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600">
            {data?.placements?.activeCriteria?.length || 0}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("TOPICS"); setSearchFilter(""); }}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "TOPICS"
              ? "border-blue-600 text-blue-700 bg-blue-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Topics</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600">
            {data?.topics?.activeCriteria?.length || 0}
          </span>
          {!isTopicSupported && (
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-500 border border-slate-200">
              {data?.isPMax ? "PMax N/A" : "Display Only"}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <Globe className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No content targeting data available</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Select a campaign to inspect its placement and topic criteria</p>
          </div>
        ) : activeTab === "PLACEMENTS" ? (
          /* ══════════════ PLACEMENTS SECTION ══════════════ */
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="relative flex-1 max-w-xs">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter placements..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setIsAddPlacementModalOpen(true)}
                disabled={data.isPMax}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Exclude Placement URL
              </button>
            </div>

            {/* Placements List */}
            {data.isPMax ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
                <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
                <h3 className="text-xs font-bold text-slate-800">Placements Not Configurable for Performance Max</h3>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                  Performance Max campaigns dynamically allocate delivery across Google Search, Maps, Display, YouTube, Gmail, and Discover using Google AI. Campaign-level placement criteria are not supported.
                </p>
              </div>
            ) : filteredPlacements.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30 space-y-2">
                <Globe className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  {searchFilter ? "No matching placements found" : "No placement exclusions configured"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  By default, ads are eligible to show across all standard Google network placements. Add exclusions to block unwanted websites, domains, or YouTube channels.
                </p>
                {!searchFilter && (
                  <button
                    onClick={() => setIsAddPlacementModalOpen(true)}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Add Placement Exclusion
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">Placement URL</th>
                      <th className="p-3.5">Targeting Type</th>
                      <th className="p-3.5">Criterion ID</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlacements.map(placement => (
                      <tr key={placement.resourceName} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{placement.url}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              placement.negative
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {placement.negative ? "EXCLUDED" : "TARGETED"}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {placement.criterionId}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() =>
                              setItemToDelete({
                                resourceName: placement.resourceName,
                                type: "PLACEMENT",
                                name: placement.url
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove Placement Exclusion"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ══════════════ TOPICS SECTION ══════════════ */
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="relative flex-1 max-w-xs">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setIsAddTopicModalOpen(true)}
                disabled={!isTopicSupported}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Exclude Topic
              </button>
            </div>

            {/* Topics List or Limitation */}
            {!isTopicSupported ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
                <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
                <h3 className="text-xs font-bold text-slate-800">
                  {data.isPMax
                    ? "Topics Not Configurable for Performance Max"
                    : "Topics Exclusively Supported on Display Campaigns"}
                </h3>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                  {data.isPMax
                    ? "Performance Max automates topic and interest targeting using Google AI. Use Asset Group Audience Signals instead."
                    : "In Google Ads API v24, Search campaigns do not permit campaign-level topic criteria (OPERATION_NOT_PERMITTED_FOR_CONTEXT). Switch to a Display campaign or configure topic targeting at the Ad Group level."}
                </p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30 space-y-2">
                <Tag className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  {searchFilter ? "No matching topics found" : "No topic exclusions configured"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  By default, ads can show alongside content related to all topics. Add negative topic exclusions to prevent your ads showing next to specific content categories.
                </p>
                {!searchFilter && (
                  <button
                    onClick={() => setIsAddTopicModalOpen(true)}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Add Topic Exclusion
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">Topic Name</th>
                      <th className="p-3.5">Targeting Type</th>
                      <th className="p-3.5">Topic Constant</th>
                      <th className="p-3.5">Criterion ID</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTopics.map(topic => (
                      <tr key={topic.resourceName} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{topic.displayName}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              topic.negative
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {topic.negative ? "EXCLUDED" : "TARGETED"}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {topic.topicConstant}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {topic.criterionId}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() =>
                              setItemToDelete({
                                resourceName: topic.resourceName,
                                type: "TOPIC",
                                name: topic.displayName
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove Topic Exclusion"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Add Placement Exclusion ── */}
      {isAddPlacementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900">Add Placement Exclusion</h3>
              </div>
              <button
                onClick={() => setIsAddPlacementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter a domain, website URL, or app where you do not want your ads to show.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Placement URL / Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. example.com or app.package.id"
                  value={placementUrlInput}
                  onChange={e => setPlacementUrlInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Prefixes like http:// or https:// will be automatically stripped.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <span className="font-bold">Google Ads API v24 Mutation:</span>
                <p className="font-mono text-[10px] text-blue-800 break-all">
                  campaignCriteria:mutate &#123; create: &#123; campaign, negative: true, placement: &#123; url: &#34;{placementUrlInput || "domain.com"}&#34; &#125; &#125; &#125;
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsAddPlacementModalOpen(false)}
                  disabled={isSubmittingPlacement}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlacement}
                  disabled={isSubmittingPlacement || !placementUrlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPlacement ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving to Google...
                    </>
                  ) : (
                    "Exclude Placement"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Topic Exclusion ── */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderMinus className="h-4 w-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900">Add Topic Exclusion</h3>
              </div>
              <button
                onClick={() => setIsAddTopicModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Exclude a standard Google Ads Topic Constant to prevent your ads from serving on pages related to this topic.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Select Topic</label>
                <select
                  value={selectedTopicConstant}
                  onChange={e => setSelectedTopicConstant(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {(data?.topics?.popularTopics || []).map(top => (
                    <option key={top.id} value={top.resourceName}>
                      {top.displayName} ({top.resourceName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <span className="font-bold">Google Ads API v24 Mutation:</span>
                <p className="font-mono text-[10px] text-blue-800 break-all">
                  campaignCriteria:mutate &#123; create: &#123; campaign, negative: true, topic: &#123; topicConstant: &#34;{selectedTopicConstant}&#34; &#125; &#125; &#125;
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsAddTopicModalOpen(false)}
                  disabled={isSubmittingTopic}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTopic}
                  disabled={isSubmittingTopic || !selectedTopicConstant}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingTopic ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving to Google...
                    </>
                  ) : (
                    "Exclude Topic"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Criterion ── */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">
                  Remove {itemToDelete.type === "PLACEMENT" ? "Placement" : "Topic"} Exclusion
                </h3>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove the exclusion for{" "}
                <strong className="text-slate-900">{itemToDelete.name}</strong>?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Removing this exclusion will re-allow ads to be displayed on this {itemToDelete.type === "PLACEMENT" ? "placement" : "topic"}.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-600 break-all">
                {itemToDelete.resourceName}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveCriterion}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Removing...
                    </>
                  ) : (
                    "Confirm Removal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
