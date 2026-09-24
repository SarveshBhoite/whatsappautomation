"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
  Filter,
  Check,
  ShieldAlert,
  Layers,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Sparkles
} from "lucide-react";

export type KeywordMatchType = "EXACT" | "PHRASE" | "BROAD";

export interface KeywordCriterionItem {
  id: string;
  resourceName: string;
  text: string;
  matchType: KeywordMatchType;
  status: string;
  isNegative: boolean;
  scope: "AD_GROUP" | "CAMPAIGN";
  cpcBidMicros?: number;
  qualityScore?: number;
  campaignId: string;
  campaignName: string;
  adGroupId?: string;
  adGroupName?: string;
}

export interface AdGroupOptionItem {
  id: string;
  name: string;
  resourceName: string;
  status: string;
  campaignId: string;
}

export interface CampaignKeywordsData {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportsKeywords: boolean;
  limitationMessage?: string;
  adGroups: AdGroupOptionItem[];
  keywords: KeywordCriterionItem[];
}

interface CampaignItem {
  id: string;
  name: string;
  resourceName?: string;
  campaignType?: string;
  advertisingChannelType?: string;
}

interface GoogleAdsKeywordTargetingSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignItem[];
}

export function GoogleAdsKeywordTargetingSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsKeywordTargetingSectionProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<CampaignKeywordsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [matchTypeFilter, setMatchTypeFilter] = useState<string>("ALL");
  const [sentimentFilter, setSentimentFilter] = useState<string>("ALL"); // ALL | POSITIVE | NEGATIVE

  // Add Keyword Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalScope, setModalScope] = useState<"AD_GROUP" | "CAMPAIGN">("AD_GROUP");
  const [modalAdGroupId, setModalAdGroupId] = useState<string>("");
  const [modalKeywordText, setModalKeywordText] = useState<string>("");
  const [modalMatchType, setModalMatchType] = useState<KeywordMatchType>("BROAD");
  const [modalIsNegative, setModalIsNegative] = useState<boolean>(false);
  const [modalCpcBid, setModalCpcBid] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Edit Keyword Modal
  const [keywordToEdit, setKeywordToEdit] = useState<KeywordCriterionItem | null>(null);
  const [editStatus, setEditStatus] = useState<"ENABLED" | "PAUSED">("ENABLED");
  const [editCpcBid, setEditCpcBid] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Remove Modal
  const [keywordToDelete, setKeywordToDelete] = useState<KeywordCriterionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Auto-select first campaign
  useEffect(() => {
    if (campaigns && campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(String(campaigns[0].id));
    }
  }, [campaigns, selectedCampaignId]);

  // Load keywords for selected campaign and ad group
  const fetchKeywords = useCallback(async () => {
    if (!selectedCampaignId || !customerId || !orgId) return;
    setLoading(true);
    setError(null);

    try {
      const adGroupParam = selectedAdGroupId ? `&adGroupId=${encodeURIComponent(selectedAdGroupId)}` : "";
      const res = await fetch(
        `/api/ads/keyword-targeting?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(
          customerId
        )}&campaignId=${encodeURIComponent(selectedCampaignId)}${adGroupParam}`
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load keyword targeting");
      }

      setData(json.data);
      // Auto-set modal ad-group if available
      if (json.data?.adGroups?.length) {
        setModalAdGroupId(json.data.adGroups[0].id);
      }
    } catch (err: any) {
      console.error("[GoogleAdsKeywordTargetingSection] fetch error:", err);
      setError(err.message || "Failed to load keywords");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignId, selectedAdGroupId, customerId, orgId]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  // Toast timer
  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  // Add Keyword Handler
  const handleAddKeyword = async () => {
    if (!modalKeywordText.trim() || !customerId || !orgId) return;
    if (modalScope === "AD_GROUP" && !modalAdGroupId) {
      setError("Please select an Ad Group for this keyword.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ads/keyword-targeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId,
          campaignId: selectedCampaignId,
          adGroupId: modalScope === "AD_GROUP" ? modalAdGroupId : undefined,
          text: modalKeywordText.trim(),
          matchType: modalMatchType,
          isNegative: modalScope === "CAMPAIGN" ? true : modalIsNegative,
          scope: modalScope,
          cpcBid: modalCpcBid ? Number(modalCpcBid) : undefined
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to add keyword");
      }

      setSuccessToast(`Keyword '${modalKeywordText.trim()}' added to Google Ads successfully.`);
      setIsAddModalOpen(false);
      setModalKeywordText("");
      setModalCpcBid("");
      await fetchKeywords();
    } catch (err: any) {
      console.error("[GoogleAdsKeywordTargetingSection] add error:", err);
      setError(err.message || "Failed to add keyword");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Keyword Handler
  const handleUpdateKeyword = async () => {
    if (!keywordToEdit || !customerId || !orgId) return;
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch("/api/ads/keyword-targeting", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId,
          resourceName: keywordToEdit.resourceName,
          status: editStatus,
          cpcBid: editCpcBid ? Number(editCpcBid) : undefined
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update keyword");
      }

      setSuccessToast(`Keyword '${keywordToEdit.text}' updated successfully.`);
      setKeywordToEdit(null);
      await fetchKeywords();
    } catch (err: any) {
      console.error("[GoogleAdsKeywordTargetingSection] update error:", err);
      setError(err.message || "Failed to update keyword");
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove Keyword Handler
  const handleRemoveKeyword = async () => {
    if (!keywordToDelete || !customerId || !orgId) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/keyword-targeting?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(
          customerId
        )}&resourceName=${encodeURIComponent(keywordToDelete.resourceName)}`,
        { method: "DELETE" }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to remove keyword");
      }

      setSuccessToast(`Keyword '${keywordToDelete.text}' removed from Google Ads.`);
      setKeywordToDelete(null);
      await fetchKeywords();
    } catch (err: any) {
      console.error("[GoogleAdsKeywordTargetingSection] delete error:", err);
      setError(err.message || "Failed to remove keyword");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Keywords
  const filteredKeywords = (data?.keywords || []).filter(kw => {
    const matchesSearch =
      kw.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kw.adGroupName && kw.adGroupName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMatchType = matchTypeFilter === "ALL" || kw.matchType === matchTypeFilter;
    const matchesSentiment =
      sentimentFilter === "ALL" ||
      (sentimentFilter === "POSITIVE" && !kw.isNegative) ||
      (sentimentFilter === "NEGATIVE" && kw.isNegative);

    return matchesSearch && matchesMatchType && matchesSentiment;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* ── Header ── */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50/50 to-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Tag className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Keyword Targeting Management</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                Google Ads v24
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live customer-scoped search keyword targeting, match types (EXACT, PHRASE, BROAD), positive bids &amp; negative exclusions.
            </p>
          </div>
        </div>

        {/* Campaign & Ad Group Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Campaign Selector */}
          {campaigns.length > 0 ? (
            <select
              value={selectedCampaignId}
              onChange={e => {
                setSelectedCampaignId(e.target.value);
                setSelectedAdGroupId("");
              }}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs max-w-[190px] truncate"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.campaignType || c.advertisingChannelType || "SEARCH"})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400 italic">No campaigns</span>
          )}

          {/* Ad Group Selector */}
          <select
            value={selectedAdGroupId}
            onChange={e => setSelectedAdGroupId(e.target.value)}
            disabled={!data || data.adGroups.length === 0}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs max-w-[170px] truncate disabled:opacity-50"
          >
            <option value="">All Ad Groups</option>
            {(data?.adGroups || []).map(ag => (
              <option key={ag.id} value={ag.id}>
                {ag.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchKeywords}
            disabled={loading || !selectedCampaignId}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh Keywords"
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

      {/* ── Campaign Metadata / Limitation Notice ── */}
      {data && (
        <div className="p-5 pb-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Campaign:</span>
            <span className="text-xs font-bold text-slate-900">{data.campaignName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {data.campaignType}
            </span>
            {data.isPMax && (
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Performance Max
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-semibold ml-2">
              ({data.keywords.length} keywords found across {data.adGroups.length} ad groups)
            </span>
          </div>

          {/* PMax limitation alert */}
          {data.limitationMessage && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Performance Max Campaign Limitation</span>
                <p className="text-[11px] leading-relaxed mt-0.5">{data.limitationMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Toolbar: Search & Action Buttons ── */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search keywords or ad group..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Match Type Filter */}
            <select
              value={matchTypeFilter}
              onChange={e => setMatchTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Match Types</option>
              <option value="EXACT">EXACT [ ]</option>
              <option value="PHRASE">PHRASE &quot; &quot;</option>
              <option value="BROAD">BROAD</option>
            </select>

            {/* Positive / Negative Filter */}
            <select
              value={sentimentFilter}
              onChange={e => setSentimentFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Positive &amp; Negative</option>
              <option value="POSITIVE">Positive Only</option>
              <option value="NEGATIVE">Negative Only</option>
            </select>
          </div>

          <button
            onClick={() => {
              setModalScope("AD_GROUP");
              setModalIsNegative(false);
              setIsAddModalOpen(true);
            }}
            disabled={!data || data.isPMax || !data.supportsKeywords}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Add Keyword / Negative
          </button>
        </div>

        {/* ── Keywords Table ── */}
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
          ) : !data || data.isPMax ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                {data?.isPMax ? "Performance Max does not support traditional keyword targeting" : "No campaign selected"}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {data?.isPMax ? "Use Asset Group Search Themes to provide AI audience intent signals." : "Select an active Search campaign to view and manage keywords."}
              </p>
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <Tag className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                {searchQuery || matchTypeFilter !== "ALL" || sentimentFilter !== "ALL"
                  ? "No matching keywords found"
                  : "No keywords found in this campaign"}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Add search keywords to trigger ads when potential customers search on Google.
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Add Your First Keyword
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Keyword Text</th>
                    <th className="p-3.5">Match Type</th>
                    <th className="p-3.5">Targeting Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Scope / Ad Group</th>
                    <th className="p-3.5">Max CPC</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKeywords.map(kw => (
                    <tr key={kw.resourceName} className="hover:bg-slate-50/80 transition-all">
                      {/* Keyword Text */}
                      <td className="p-3.5 font-bold text-slate-900">
                        {kw.matchType === "EXACT" ? `[${kw.text}]` : kw.matchType === "PHRASE" ? `"${kw.text}"` : kw.text}
                      </td>

                      {/* Match Type */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 font-mono">
                          {kw.matchType}
                        </span>
                      </td>

                      {/* Positive vs Negative */}
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            kw.isNegative
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {kw.isNegative ? "Negative Exclusion" : "Positive Keyword"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            kw.status === "ENABLED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : kw.status === "PAUSED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {kw.status}
                        </span>
                      </td>

                      {/* Scope & Ad Group */}
                      <td className="p-3.5 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px] font-medium">
                            {kw.scope === "CAMPAIGN" ? "Campaign Negative" : kw.adGroupName || `Ad Group #${kw.adGroupId}`}
                          </span>
                        </div>
                      </td>

                      {/* CPC Bid */}
                      <td className="p-3.5 text-slate-800 font-mono text-[11px]">
                        {kw.cpcBidMicros ? `₹${(kw.cpcBidMicros / 1_000_000).toFixed(2)}` : "—"}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {kw.scope === "AD_GROUP" && (
                            <button
                              onClick={() => {
                                setKeywordToEdit(kw);
                                setEditStatus(kw.status === "PAUSED" ? "PAUSED" : "ENABLED");
                                setEditCpcBid(kw.cpcBidMicros ? (kw.cpcBidMicros / 1_000_000).toString() : "");
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                              title="Edit Status / Bid"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setKeywordToDelete(kw)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove Keyword"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Add Keyword ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Add Keyword to Google Ads</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Scope Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Keyword Level</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setModalScope("AD_GROUP")}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      modalScope === "AD_GROUP"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Ad Group Level
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalScope("CAMPAIGN");
                      setModalIsNegative(true);
                    }}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      modalScope === "CAMPAIGN"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Campaign Negative
                  </button>
                </div>
              </div>

              {/* Ad Group Selection */}
              {modalScope === "AD_GROUP" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Target Ad Group</label>
                  <select
                    value={modalAdGroupId}
                    onChange={e => setModalAdGroupId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {(data?.adGroups || []).map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Keyword Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Keyword Text</label>
                <input
                  type="text"
                  placeholder="e.g. cloud accounting software"
                  value={modalKeywordText}
                  onChange={e => setModalKeywordText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Match Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Match Type</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(["BROAD", "PHRASE", "EXACT"] as KeywordMatchType[]).map(mt => (
                    <button
                      key={mt}
                      type="button"
                      onClick={() => setModalMatchType(mt)}
                      className={`p-2 rounded-xl border text-center font-bold font-mono transition-all cursor-pointer ${
                        modalMatchType === mt
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {mt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Positive or Negative toggle (for Ad Group) */}
              {modalScope === "AD_GROUP" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isNegCheckbox"
                    checked={modalIsNegative}
                    onChange={e => setModalIsNegative(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isNegCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Add as Negative Keyword Exclusion (Do not show ads for this query)
                  </label>
                </div>
              )}

              {/* Optional CPC Bid (for Positive Ad Group Keywords) */}
              {modalScope === "AD_GROUP" && !modalIsNegative && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Optional Max CPC Bid (₹)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.00"
                    value={modalCpcBid}
                    onChange={e => setModalCpcBid(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* API Preview */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <span className="font-bold">Google Ads API v24 Mutation:</span>
                <p className="font-mono text-[10px] text-blue-800 break-all">
                  {modalScope === "CAMPAIGN"
                    ? `campaignCriteria:mutate { create: { negative: true, keyword: { text: "${modalKeywordText || "keyword"}", matchType: "${modalMatchType}" } } }`
                    : `adGroupCriteria:mutate { create: { negative: ${modalIsNegative}, keyword: { text: "${modalKeywordText || "keyword"}", matchType: "${modalMatchType}" } } }`}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKeyword}
                  disabled={isSubmitting || !modalKeywordText.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving to Google...
                    </>
                  ) : (
                    "Save Keyword"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Keyword ── */}
      {keywordToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Edit Keyword</h3>
              </div>
              <button
                onClick={() => setKeywordToEdit(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Keyword Text</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{keywordToEdit.text}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{keywordToEdit.resourceName}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as "ENABLED" | "PAUSED")}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="ENABLED">ENABLED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>

              {!keywordToEdit.isNegative && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Max CPC Bid (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 20.00"
                    value={editCpcBid}
                    onChange={e => setEditCpcBid(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setKeywordToEdit(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateKeyword}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Keyword ── */}
      {keywordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">Remove Keyword</h3>
              </div>
              <button
                onClick={() => setKeywordToDelete(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove the keyword <strong className="text-slate-900">{keywordToDelete.text}</strong>?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This executes a mutation on Google Ads API v24 to remove this criterion from your campaign/ad group.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-600 break-all">
                {keywordToDelete.resourceName}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setKeywordToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveKeyword}
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
