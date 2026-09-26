"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ListFilter,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
  Layers,
  Link as LinkIcon,
  Unlink,
  FileText,
  ShieldAlert,
  ArrowRight,
  FolderOpen
} from "lucide-react";

export type KeywordMatchType = "EXACT" | "PHRASE" | "BROAD";

export interface SharedSetItem {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  status: string;
  memberCount: number;
  referenceCount: number;
}

export interface SharedCriterionItem {
  criterionId: string;
  resourceName: string;
  sharedSet: string;
  type: string;
  text: string;
  matchType: KeywordMatchType;
}

export interface CampaignSharedSetItem {
  resourceName: string;
  campaignId: string;
  campaignName: string;
  campaignResourceName: string;
  sharedSetResourceName: string;
  status: string;
}

interface CampaignOption {
  id: string;
  name: string;
  resourceName?: string;
  campaignType?: string;
}

interface GoogleAdsSharedNegativeListsSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignOption[];
}

export function GoogleAdsSharedNegativeListsSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsSharedNegativeListsSectionProps) {
  const [lists, setLists] = useState<SharedSetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected List Details
  const [selectedList, setSelectedList] = useState<SharedSetItem | null>(null);
  const [listKeywords, setListKeywords] = useState<SharedCriterionItem[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState<boolean>(false);
  const [listCampaigns, setListCampaigns] = useState<CampaignSharedSetItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState<boolean>(false);

  // Create List Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [creatingList, setCreatingList] = useState<boolean>(false);

  // Add Keyword Modal
  const [isAddKeywordModalOpen, setIsAddKeywordModalOpen] = useState<boolean>(false);
  const [newKeywordText, setNewKeywordText] = useState<string>("");
  const [newKeywordMatchType, setNewKeywordMatchType] = useState<KeywordMatchType>("BROAD");
  const [addingKeyword, setAddingKeyword] = useState<boolean>(false);

  // Attach Campaign Modal
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false);
  const [attachCampaignId, setAttachCampaignId] = useState<string>("");
  const [attachingCampaign, setAttachingCampaign] = useState<boolean>(false);

  // Delete Confirmations
  const [listToDelete, setListToDelete] = useState<SharedSetItem | null>(null);
  const [keywordToDelete, setKeywordToDelete] = useState<SharedCriterionItem | null>(null);
  const [campaignToDetach, setCampaignToDetach] = useState<CampaignSharedSetItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Fetch all shared lists
  const fetchLists = useCallback(async () => {
    if (!customerId || !orgId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ads/shared-negative-lists?customerId=${customerId}&orgId=${orgId}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch shared negative lists");
      }

      setLists(json.data || []);
      // If currently selected list is updated, refresh it
      if (selectedList) {
        const updated = (json.data || []).find((l: SharedSetItem) => l.id === selectedList.id);
        if (updated) setSelectedList(updated);
      }
    } catch (err: any) {
      console.error("[GoogleAdsSharedNegativeListsSection] fetch error:", err);
      setError(err.message || "Failed to load shared negative keyword lists");
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId, selectedList]);

  useEffect(() => {
    fetchLists();
  }, [customerId, orgId]);

  // Fetch details (keywords & campaigns) for selected list
  const fetchListDetails = useCallback(async (list: SharedSetItem) => {
    if (!customerId || !orgId || !list) return;

    setLoadingKeywords(true);
    setLoadingCampaigns(true);

    try {
      const [kwRes, campRes] = await Promise.all([
        fetch(`/api/ads/shared-negative-lists/${list.id}/keywords?customerId=${customerId}&orgId=${orgId}`),
        fetch(`/api/ads/shared-negative-lists/${list.id}/campaigns?customerId=${customerId}&orgId=${orgId}`)
      ]);

      const kwJson = await kwRes.json();
      const campJson = await campRes.json();

      if (kwRes.ok) {
        setListKeywords(kwJson.data || []);
      } else {
        console.warn("Keywords fetch error:", kwJson.error);
      }

      if (campRes.ok) {
        setListCampaigns(campJson.data || []);
      } else {
        console.warn("Campaigns fetch error:", campJson.error);
      }
    } catch (err: any) {
      console.error("[GoogleAdsSharedNegativeListsSection] details error:", err);
    } finally {
      setLoadingKeywords(false);
      setLoadingCampaigns(false);
    }
  }, [customerId, orgId]);

  const handleSelectList = (list: SharedSetItem) => {
    setSelectedList(list);
    fetchListDetails(list);
  };

  // Create List
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setCreatingList(true);
    setError(null);

    try {
      const res = await fetch("/api/ads/shared-negative-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          orgId,
          name: newListName.trim()
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create shared list");
      }

      setSuccessToast(`Created shared list '${newListName.trim()}' successfully.`);
      setNewListName("");
      setIsCreateModalOpen(false);
      await fetchLists();
    } catch (err: any) {
      setError(err.message || "Failed to create list");
    } finally {
      setCreatingList(false);
    }
  };

  // Delete List
  const handleDeleteList = async () => {
    if (!listToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/ads/shared-negative-lists/${listToDelete.id}?customerId=${customerId}&orgId=${orgId}`, {
        method: "DELETE"
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete list");
      }

      setSuccessToast(`Removed shared list '${listToDelete.name}'.`);
      if (selectedList?.id === listToDelete.id) {
        setSelectedList(null);
        setListKeywords([]);
        setListCampaigns([]);
      }
      setListToDelete(null);
      await fetchLists();
    } catch (err: any) {
      setError(err.message || "Failed to delete shared list");
    } finally {
      setDeleting(false);
    }
  };

  // Add Keyword
  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList || !newKeywordText.trim()) return;

    setAddingKeyword(true);
    setError(null);

    try {
      const res = await fetch(`/api/ads/shared-negative-lists/${selectedList.id}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          orgId,
          text: newKeywordText.trim(),
          matchType: newKeywordMatchType
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to add keyword to shared list");
      }

      setSuccessToast(`Added negative keyword '${newKeywordText.trim()}' to ${selectedList.name}.`);
      setNewKeywordText("");
      setIsAddKeywordModalOpen(false);
      await fetchListDetails(selectedList);
      await fetchLists();
    } catch (err: any) {
      setError(err.message || "Failed to add keyword");
    } finally {
      setAddingKeyword(false);
    }
  };

  // Remove Keyword
  const handleRemoveKeyword = async () => {
    if (!selectedList || !keywordToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/shared-negative-lists/${selectedList.id}/keywords/${keywordToDelete.criterionId}?customerId=${customerId}&orgId=${orgId}`,
        { method: "DELETE" }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to remove keyword from shared list");
      }

      setSuccessToast(`Removed negative keyword '${keywordToDelete.text}'.`);
      setKeywordToDelete(null);
      await fetchListDetails(selectedList);
      await fetchLists();
    } catch (err: any) {
      setError(err.message || "Failed to remove keyword");
    } finally {
      setDeleting(false);
    }
  };

  // Attach Campaign
  const handleAttachCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList || !attachCampaignId) return;

    setAttachingCampaign(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/shared-negative-lists/${selectedList.id}/campaigns/${attachCampaignId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, orgId })
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to attach list to campaign");
      }

      setSuccessToast(`Attached shared list to campaign successfully.`);
      setAttachCampaignId("");
      setIsAttachModalOpen(false);
      await fetchListDetails(selectedList);
      await fetchLists();
    } catch (err: any) {
      setError(err.message || "Failed to attach campaign");
    } finally {
      setAttachingCampaign(false);
    }
  };

  // Detach Campaign
  const handleDetachCampaign = async () => {
    if (!selectedList || !campaignToDetach) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/shared-negative-lists/${selectedList.id}/campaigns/${campaignToDetach.campaignId}?customerId=${customerId}&orgId=${orgId}`,
        { method: "DELETE" }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to detach list from campaign");
      }

      setSuccessToast(`Detached shared list from ${campaignToDetach.campaignName}.`);
      setCampaignToDetach(null);
      await fetchListDetails(selectedList);
      await fetchLists();
    } catch (err: any) {
      setError(err.message || "Failed to detach campaign");
    } finally {
      setDeleting(false);
    }
  };

  const filteredLists = lists.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.id.includes(searchQuery)
  );

  // Available campaigns that are not already attached to this list
  const attachedCampaignIds = new Set(listCampaigns.map(c => c.campaignId));
  const attachableCampaigns = campaigns.filter(c => !attachedCampaignIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* Informative Header Callout */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
            <ListFilter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">Shared Negative Keyword Lists</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300/40">
                Official Google Ads v24
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
              Create reusable negative keyword libraries (<code className="font-mono font-semibold">shared_set</code>) and link them across multiple campaigns simultaneously (<code className="font-mono font-semibold">campaign_shared_set</code>). Distinct from individual campaign-level negative keywords.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Shared List</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Shared Lists Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-slate-600" />
              <h4 className="text-sm font-bold text-slate-800">Shared Lists ({lists.length})</h4>
            </div>
            <button
              onClick={fetchLists}
              disabled={loading}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Refresh Shared Lists"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search lists by name or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Lists Table/Directory */}
          {loading && lists.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              <span className="text-xs">Loading shared negative lists...</span>
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl p-4">
              {searchQuery ? "No shared lists match your search query." : "No shared negative keyword lists found in this Google Ads account."}
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredLists.map(list => {
                const isSelected = selectedList?.id === list.id;
                return (
                  <div
                    key={list.id}
                    onClick={() => handleSelectList(list)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{list.name}</p>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 font-mono text-slate-600">
                            ID: {list.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {list.memberCount} keyword{list.memberCount === 1 ? "" : "s"}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {list.referenceCount} campaign{list.referenceCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setListToDelete(list);
                          }}
                          className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className={`w-4 h-4 ${isSelected ? "text-amber-600 font-bold" : "text-slate-300"}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected List Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-6">
          {!selectedList ? (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Select a shared list to inspect keywords and attached campaigns</p>
              <p className="text-[11px] text-slate-400">Or click &quot;New Shared List&quot; above to create one in Google Ads API v24.</p>
            </div>
          ) : (
            <>
              {/* Selected List Title Bar */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedList.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      {selectedList.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{selectedList.resourceName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchListDetails(selectedList)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    title="Refresh List Details"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${(loadingKeywords || loadingCampaigns) ? "animate-spin text-blue-600" : ""}`} />
                  </button>
                  <button
                    onClick={() => setListToDelete(selectedList)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete List</span>
                  </button>
                </div>
              </div>

              {/* Sub-Section 1: Keywords Contained In List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-bold text-slate-800">
                      Keywords in this list ({listKeywords.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsAddKeywordModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Negative Keyword</span>
                  </button>
                </div>

                {loadingKeywords ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Loading keywords...</span>
                  </div>
                ) : listKeywords.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
                    No negative keywords inside this shared list. Click &quot;Add Negative Keyword&quot; to add one.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2 px-3">Keyword</th>
                          <th className="py-2 px-3">Match Type</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {listKeywords.map(kw => (
                          <tr key={kw.criterionId} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {kw.text}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                                {kw.matchType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => setKeywordToDelete(kw)}
                                className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Remove keyword"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sub-Section 2: Campaigns Attached To This List */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-bold text-slate-800">
                      Campaigns Using This List ({listCampaigns.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsAttachModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Attach to Campaign</span>
                  </button>
                </div>

                {loadingCampaigns ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading attached campaigns...</span>
                  </div>
                ) : listCampaigns.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
                    This shared negative list is not yet attached to any campaigns. Click &quot;Attach to Campaign&quot; to apply it.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2 px-3">Campaign</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {listCampaigns.map(camp => (
                          <tr key={camp.campaignId} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {camp.campaignName}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                ID: {camp.campaignId}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {camp.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => setCampaignToDetach(camp)}
                                className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded text-[11px] font-semibold flex items-center gap-1 ml-auto transition-colors"
                                title="Detach from campaign"
                              >
                                <Unlink className="w-3 h-3" />
                                <span>Detach</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: Create Shared List */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Shared Negative Keyword List</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  List Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Competitor Exclusions, Universal Negative Terms"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This list will be registered under Google Ads API v24 with type <code className="font-mono">NEGATIVE_KEYWORDS</code>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingList || !newListName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creatingList && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create List</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Negative Keyword To List */}
      {isAddKeywordModalOpen && selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Negative Keyword</h3>
                <p className="text-[11px] text-slate-500">Adding to &quot;{selectedList.name}&quot;</p>
              </div>
              <button onClick={() => setIsAddKeywordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddKeyword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keyword Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. cheap, free, crack, login"
                  value={newKeywordText}
                  onChange={e => setNewKeywordText(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Match Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newKeywordMatchType}
                  onChange={e => setNewKeywordMatchType(e.target.value as KeywordMatchType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="BROAD">Broad Match (Negative Broad)</option>
                  <option value="PHRASE">Phrase Match (Negative Phrase)</option>
                  <option value="EXACT">Exact Match (Negative Exact)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingKeyword || !newKeywordText.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {addingKeyword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Keyword</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Attach List To Campaign */}
      {isAttachModalOpen && selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attach List to Campaign</h3>
                <p className="text-[11px] text-slate-500">Applying &quot;{selectedList.name}&quot; across campaigns</p>
              </div>
              <button onClick={() => setIsAttachModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAttachCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Campaign <span className="text-rose-500">*</span>
                </label>
                {attachableCampaigns.length === 0 ? (
                  <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    All available campaigns in this account are already using this shared list.
                  </p>
                ) : (
                  <select
                    value={attachCampaignId}
                    onChange={e => setAttachCampaignId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose Campaign --</option>
                    {Array.from(new Map(attachableCampaigns.map(c => [String(c.id), c])).values()).map((c, idx) => (
                      <option key={`attach-camp-${c.id}-${idx}`} value={c.id}>
                        {c.name} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAttachModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={attachingCampaign || !attachCampaignId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {attachingCampaign && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Attach Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Delete List */}
      {listToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900">Delete Shared List?</h4>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">&quot;{listToDelete.name}&quot;</span> from Google Ads? It will be unlinked from all campaigns.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setListToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteList}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Remove Keyword */}
      {keywordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900">Remove Negative Keyword?</h4>
            </div>
            <p className="text-xs text-slate-600">
              Remove negative keyword <span className="font-semibold text-slate-900">&quot;{keywordToDelete.text}&quot;</span> from this shared list?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setKeywordToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleRemoveKeyword}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Detach Campaign */}
      {campaignToDetach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900">Detach Shared List?</h4>
            </div>
            <p className="text-xs text-slate-600">
              Detach this shared negative list from <span className="font-semibold text-slate-900">&quot;{campaignToDetach.campaignName}&quot;</span>? The campaign will no longer inherit these negative keywords.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCampaignToDetach(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDetachCampaign}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Detach</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
