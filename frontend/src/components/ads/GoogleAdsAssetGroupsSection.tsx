"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Search,
  RefreshCw,
  Plus,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Type,
  Video,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Link,
  Sliders,
  Check,
  Building2
} from "lucide-react";

export interface AssetGroupListItem {
  resourceName: string;
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED" | string;
  campaignResourceName: string;
  campaignId: string;
  campaignName: string;
  finalUrls: string[];
  finalMobileUrls: string[];
  path1?: string;
  path2?: string;
  adStrength?: string;
  assetCount?: number;
}

export interface AssetGroupAssetItem {
  resourceName: string;
  assetGroup: string;
  asset: string;
  assetId: string;
  fieldType: string;
  status: string;
  assetName?: string;
  assetType?: string;
  text?: string;
  imageUrl?: string;
  youtubeVideoId?: string;
  youtubeVideoTitle?: string;
}

export interface AssetGroupDetail {
  assetGroup: AssetGroupListItem;
  assets: AssetGroupAssetItem[];
  assetsByFieldType: Record<string, AssetGroupAssetItem[]>;
  signals: any[];
  requirements: {
    headlinesCount: number;
    minHeadlinesMet: boolean;
    longHeadlinesCount: number;
    minLongHeadlinesMet: boolean;
    descriptionsCount: number;
    minDescriptionsMet: boolean;
    marketingImagesCount: number;
    minMarketingImagesMet: boolean;
    squareMarketingImagesCount: number;
    minSquareMarketingImagesMet: boolean;
    logosCount: number;
    minLogosMet: boolean;
    businessNameMet: boolean;
    allMinimumsMet: boolean;
  };
}

interface GoogleAdsAssetGroupsSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: any[];
}

export function GoogleAdsAssetGroupsSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsAssetGroupsSectionProps) {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // Filter campaigns to PERFORMANCE_MAX only
  const pmaxCampaigns = campaigns.filter(c => {
    const type = (c.campaignType || c.advertisingChannelType || "").toUpperCase();
    return type === "PERFORMANCE_MAX" || type === "PERFORMANCEMAX" || type.includes("PMAX");
  });

  // State
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [assetGroups, setAssetGroups] = useState<AssetGroupListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Detail Modal / Drawer state
  const [selectedAssetGroup, setSelectedAssetGroup] = useState<AssetGroupListItem | null>(null);
  const [detailData, setDetailData] = useState<AssetGroupDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Editing Asset Group state
  const [isEditingAg, setIsEditingAg] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"ENABLED" | "PAUSED">("ENABLED");
  const [editFinalUrl, setEditFinalUrl] = useState("");
  const [editPath1, setEditPath1] = useState("");
  const [editPath2, setEditPath2] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Create Asset Group Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaignId, setNewCampaignId] = useState("");
  const [newName, setNewName] = useState("");
  const [newFinalUrl, setNewFinalUrl] = useState("");
  const [newPath1, setNewPath1] = useState("");
  const [newPath2, setNewPath2] = useState("");
  const [creatingAg, setCreatingAg] = useState(false);

  // Link Asset Modal (reuse existing account assets)
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<string>("HEADLINE");
  const [accountAssets, setAccountAssets] = useState<any[]>([]);
  const [loadingAccountAssets, setLoadingAccountAssets] = useState(false);
  const [selectedAssetToLink, setSelectedAssetToLink] = useState<any | null>(null);
  const [linkingAsset, setLinkingAsset] = useState(false);

  // Remove Asset Association Confirmation Modal
  const [assetToRemove, setAssetToRemove] = useState<AssetGroupAssetItem | null>(null);
  const [removingAsset, setRemovingAsset] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Fetch Asset Groups ──────────────────────────────────────────────────────
  const fetchAssetGroups = useCallback(async () => {
    if (!cleanCid) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      let url = `${BACKEND}/api/ads/asset-groups?customerId=${cleanCid}`;
      if (selectedCampaignId !== "ALL") {
        url += `&campaignId=${selectedCampaignId}`;
      }
      const res = await fetch(url, {
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAssetGroups(data.assetGroups || []);
      } else {
        setErrorMsg(data.error || "Failed to load Asset Groups");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error loading Asset Groups");
    } finally {
      setLoading(false);
    }
  }, [cleanCid, orgId, selectedCampaignId, BACKEND]);

  useEffect(() => {
    fetchAssetGroups();
  }, [fetchAssetGroups]);

  // ── Fetch Details for Selected Asset Group ─────────────────────────────────
  const fetchDetail = useCallback(async (resourceName: string) => {
    if (!cleanCid || !resourceName) return;
    setDetailLoading(true);
    try {
      const res = await fetch(
        `${BACKEND}/api/ads/asset-groups/detail?customerId=${cleanCid}&resourceName=${encodeURIComponent(resourceName)}`,
        { headers: { "x-organization-id": orgId } }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setDetailData(data.detail);
        // Pre-fill edit fields
        const ag = data.detail.assetGroup;
        setEditName(ag.name);
        setEditStatus(ag.status === "PAUSED" ? "PAUSED" : "ENABLED");
        setEditFinalUrl(ag.finalUrls?.[0] || "");
        setEditPath1(ag.path1 || "");
        setEditPath2(ag.path2 || "");
      } else {
        showToast(data.error || "Failed to load Asset Group details");
      }
    } catch (err: any) {
      showToast(err.message || "Error fetching details");
    } finally {
      setDetailLoading(false);
    }
  }, [cleanCid, orgId, BACKEND]);

  const handleOpenDetail = (ag: AssetGroupListItem) => {
    setSelectedAssetGroup(ag);
    setIsEditingAg(false);
    fetchDetail(ag.resourceName);
  };

  // ── Save Asset Group Updates ────────────────────────────────────────────────
  const handleSaveAssetGroup = async () => {
    if (!selectedAssetGroup || !editName.trim()) {
      showToast("Asset Group name cannot be empty");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/asset-groups`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          resourceName: selectedAssetGroup.resourceName,
          name: editName.trim(),
          status: editStatus,
          finalUrls: editFinalUrl ? [editFinalUrl.trim()] : undefined,
          path1: editPath1.trim(),
          path2: editPath2.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Asset Group updated successfully ✓");
        setIsEditingAg(false);
        fetchDetail(selectedAssetGroup.resourceName);
        fetchAssetGroups();
      } else {
        showToast(data.error || "Failed to update Asset Group");
      }
    } catch (err: any) {
      showToast(err.message || "Error saving Asset Group");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Create New Asset Group ─────────────────────────────────────────────────
  const handleCreateAssetGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignId) {
      showToast("Please select a target Performance Max campaign");
      return;
    }
    if (!newName.trim() || !newFinalUrl.trim()) {
      showToast("Name and Final URL are required");
      return;
    }
    setCreatingAg(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/asset-groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          campaignId: newCampaignId,
          name: newName.trim(),
          finalUrls: [newFinalUrl.trim()],
          path1: newPath1.trim() || undefined,
          path2: newPath2.trim() || undefined,
          status: "PAUSED"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Asset Group created successfully ✓");
        setIsCreateModalOpen(false);
        setNewName("");
        setNewFinalUrl("");
        setNewPath1("");
        setNewPath2("");
        fetchAssetGroups();
      } else {
        showToast(data.error || "Failed to create Asset Group");
      }
    } catch (err: any) {
      showToast(err.message || "Error creating Asset Group");
    } finally {
      setCreatingAg(false);
    }
  };

  // ── Fetch Existing Account Assets for Association ─────────────────────────
  const fetchAccountAssets = async (fieldType: string) => {
    setLoadingAccountAssets(true);
    try {
      let typeFilter = "";
      if (["HEADLINE", "LONG_HEADLINE", "DESCRIPTION", "BUSINESS_NAME"].includes(fieldType)) {
        typeFilter = "TEXT";
      } else if (["MARKETING_IMAGE", "SQUARE_MARKETING_IMAGE", "PORTRAIT_MARKETING_IMAGE", "LOGO", "LANDSCAPE_LOGO"].includes(fieldType)) {
        typeFilter = "IMAGE";
      } else if (fieldType === "YOUTUBE_VIDEO") {
        typeFilter = "YOUTUBE_VIDEO";
      }
      const res = await fetch(
        `${BACKEND}/api/ads/asset-groups/account-assets?customerId=${cleanCid}${typeFilter ? `&type=${typeFilter}` : ""}`,
        { headers: { "x-organization-id": orgId } }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setAccountAssets(data.assets || []);
      } else {
        setAccountAssets([]);
      }
    } catch (e: any) {
      console.warn("Error fetching account assets:", e.message);
      setAccountAssets([]);
    } finally {
      setLoadingAccountAssets(false);
    }
  };

  const handleOpenAddAsset = (fieldType: string) => {
    setSelectedFieldType(fieldType);
    setSelectedAssetToLink(null);
    setIsAddAssetModalOpen(true);
    fetchAccountAssets(fieldType);
  };

  // ── Link Asset Association ────────────────────────────────────────────────
  const handleLinkAsset = async () => {
    if (!selectedAssetGroup || !selectedAssetToLink) return;
    setLinkingAsset(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/asset-groups/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          assetGroupResourceName: selectedAssetGroup.resourceName,
          assetResourceName: selectedAssetToLink.resourceName,
          fieldType: selectedFieldType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Asset linked to ${selectedFieldType} ✓`);
        setIsAddAssetModalOpen(false);
        setSelectedAssetToLink(null);
        fetchDetail(selectedAssetGroup.resourceName);
      } else {
        showToast(data.error || "Failed to link asset");
      }
    } catch (err: any) {
      showToast(err.message || "Error linking asset");
    } finally {
      setLinkingAsset(false);
    }
  };

  // ── Remove Asset Association ──────────────────────────────────────────────
  const handleRemoveAsset = async () => {
    if (!assetToRemove) return;
    setRemovingAsset(true);
    try {
      const res = await fetch(
        `${BACKEND}/api/ads/asset-groups/assets?customerId=${cleanCid}&resourceName=${encodeURIComponent(assetToRemove.resourceName)}`,
        {
          method: "DELETE",
          headers: { "x-organization-id": orgId }
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Asset association removed ✓");
        setAssetToRemove(null);
        if (selectedAssetGroup) fetchDetail(selectedAssetGroup.resourceName);
      } else {
        showToast(data.error || "Failed to remove asset association");
      }
    } catch (err: any) {
      showToast(err.message || "Error removing association");
    } finally {
      setRemovingAsset(false);
    }
  };

  // Filtered asset groups table rows
  const filteredGroups = assetGroups.filter(ag => {
    const q = searchQuery.toLowerCase();
    return ag.name.toLowerCase().includes(q) || ag.campaignName.toLowerCase().includes(q) || ag.id.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[300] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Performance Max Asset Groups
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Google Ads API v24
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Manage creative asset groups, headlines, descriptions, images, logos, and association requirements for Performance Max campaigns.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => fetchAssetGroups()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                if (pmaxCampaigns.length > 0) setNewCampaignId(pmaxCampaigns[0].id || pmaxCampaigns[0].googleAdsCampaignId);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Asset Group
            </button>
          </div>
        </div>

        {/* Campaign Filter & Search Bar */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">PMax Campaign:</span>
            <select
              value={selectedCampaignId}
              onChange={e => setSelectedCampaignId(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Performance Max Campaigns</option>
              {pmaxCampaigns.map(c => {
                const cId = c.id || c.googleAdsCampaignId;
                return (
                  <option key={cId} value={cId}>
                    {c.name} ({cId})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search asset groups..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Asset Groups List Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Asset Groups</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredGroups.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="text-xs font-semibold">Loading Asset Groups from Google Ads...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-2xs">
              <Layers className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">No Asset Groups Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No Performance Max asset groups matched your filter. Click &quot;New Asset Group&quot; to create one for your PMax campaign.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Asset Group Name</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Campaign</th>
                  <th className="px-4 py-3.5">Ad Strength</th>
                  <th className="px-4 py-3.5">Final URL</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredGroups.map(ag => {
                  const isEnabled = ag.status === "ENABLED";
                  return (
                    <tr key={ag.resourceName} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => handleOpenDetail(ag)}
                            className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{ag.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                          </button>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {ag.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isEnabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                          {ag.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800 max-w-[200px] truncate" title={ag.campaignName}>
                          {ag.campaignName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {ag.campaignId}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            ag.adStrength === "EXCELLENT" || ag.adStrength === "GOOD"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ag.adStrength === "AVERAGE"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {ag.adStrength?.replace(/_/g, " ") || "UNSPECIFIED"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {ag.finalUrls?.[0] ? (
                          <a
                            href={ag.finalUrls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-blue-600 truncate max-w-[180px] block font-mono text-[11px] underline"
                          >
                            {ag.finalUrls[0].replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">None</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(ag)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                        >
                          Manage Assets
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Asset Group Detail Modal / Drawer ───────────────────────────────── */}
      {selectedAssetGroup && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {selectedAssetGroup.name}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        selectedAssetGroup.status === "ENABLED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {selectedAssetGroup.status}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Campaign: {selectedAssetGroup.campaignName} · ID: {selectedAssetGroup.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingAg(!isEditingAg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isEditingAg
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5 inline mr-1" />
                  {isEditingAg ? "Cancel Editing" : "Edit Settings"}
                </button>
                <button
                  onClick={() => setSelectedAssetGroup(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {detailLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-xs font-semibold">Loading creative assets and requirements...</p>
                </div>
              ) : detailData ? (
                <>
                  {/* Inline Settings Editor */}
                  {isEditingAg && (
                    <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-blue-600" /> Edit Asset Group Live in Google Ads
                        </h4>
                        <span className="text-[10px] text-blue-600 font-semibold">API v24 Mutation</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Asset Group Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="ENABLED">ENABLED</option>
                            <option value="PAUSED">PAUSED</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Final URL</label>
                          <input
                            type="url"
                            value={editFinalUrl}
                            onChange={e => setEditFinalUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Display Path 1 (Optional)</label>
                          <input
                            type="text"
                            maxLength={15}
                            value={editPath1}
                            onChange={e => setEditPath1(e.target.value)}
                            placeholder="e.g. deals"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Display Path 2 (Optional)</label>
                          <input
                            type="text"
                            maxLength={15}
                            value={editPath2}
                            onChange={e => setEditPath2(e.target.value)}
                            placeholder="e.g. sale"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setIsEditingAg(false)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAssetGroup}
                          disabled={savingEdit}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Save Changes Live
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Requirements Checklist Card */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="h-4 w-4 text-blue-600" /> Performance Max Asset Requirements
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          detailData.requirements.allMinimumsMet
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {detailData.requirements.allMinimumsMet ? "All Minimums Satisfied ✓" : "Minimum Requirements Incomplete"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                      {[
                        { label: "Headlines", count: detailData.requirements.headlinesCount, min: 3, met: detailData.requirements.minHeadlinesMet },
                        { label: "Long Headlines", count: detailData.requirements.longHeadlinesCount, min: 1, met: detailData.requirements.minLongHeadlinesMet },
                        { label: "Descriptions", count: detailData.requirements.descriptionsCount, min: 2, met: detailData.requirements.minDescriptionsMet },
                        { label: "Landscape Images", count: detailData.requirements.marketingImagesCount, min: 1, met: detailData.requirements.minMarketingImagesMet },
                        { label: "Square Images", count: detailData.requirements.squareMarketingImagesCount, min: 1, met: detailData.requirements.minSquareMarketingImagesMet },
                        { label: "Logos", count: detailData.requirements.logosCount, min: 1, met: detailData.requirements.minLogosMet }
                      ].map(item => (
                        <div key={item.label} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
                            {item.met ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900 mt-1">
                            {item.count} <span className="text-[10px] font-normal text-slate-400">/ min {item.min}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creative Assets Grouped by Field Type */}
                  <div className="space-y-5">
                    {/* 1. Text Assets */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Type className="h-4 w-4 text-blue-600" /> Text Assets
                        </h4>
                      </div>

                      {/* Headlines */}
                      <AssetGroupCategorySection
                        title="Headlines (3 to 15 required)"
                        fieldType="HEADLINE"
                        items={detailData.assetsByFieldType["HEADLINE"] || []}
                        onAdd={() => handleOpenAddAsset("HEADLINE")}
                        onRemove={item => setAssetToRemove(item)}
                      />

                      {/* Long Headlines */}
                      <AssetGroupCategorySection
                        title="Long Headlines (1 to 5 required)"
                        fieldType="LONG_HEADLINE"
                        items={detailData.assetsByFieldType["LONG_HEADLINE"] || []}
                        onAdd={() => handleOpenAddAsset("LONG_HEADLINE")}
                        onRemove={item => setAssetToRemove(item)}
                      />

                      {/* Descriptions */}
                      <AssetGroupCategorySection
                        title="Descriptions (2 to 5 required)"
                        fieldType="DESCRIPTION"
                        items={detailData.assetsByFieldType["DESCRIPTION"] || []}
                        onAdd={() => handleOpenAddAsset("DESCRIPTION")}
                        onRemove={item => setAssetToRemove(item)}
                      />

                      {/* Business Name */}
                      <AssetGroupCategorySection
                        title="Business Name (1 required)"
                        fieldType="BUSINESS_NAME"
                        items={detailData.assetsByFieldType["BUSINESS_NAME"] || []}
                        onAdd={() => handleOpenAddAsset("BUSINESS_NAME")}
                        onRemove={item => setAssetToRemove(item)}
                      />
                    </div>

                    {/* 2. Visual & Media Assets */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="h-4 w-4 text-purple-600" /> Image & Media Assets
                        </h4>
                      </div>

                      {/* Landscape Images */}
                      <AssetGroupCategorySection
                        title="Marketing Images (1.91:1 Landscape · 1 to 20)"
                        fieldType="MARKETING_IMAGE"
                        items={detailData.assetsByFieldType["MARKETING_IMAGE"] || []}
                        onAdd={() => handleOpenAddAsset("MARKETING_IMAGE")}
                        onRemove={item => setAssetToRemove(item)}
                      />

                      {/* Square Marketing Images */}
                      <AssetGroupCategorySection
                        title="Square Marketing Images (1:1 · 1 to 20)"
                        fieldType="SQUARE_MARKETING_IMAGE"
                        items={detailData.assetsByFieldType["SQUARE_MARKETING_IMAGE"] || []}
                        onAdd={() => handleOpenAddAsset("SQUARE_MARKETING_IMAGE")}
                        onRemove={item => setAssetToRemove(item)}
                      />

                      {/* Logos */}
                      <AssetGroupCategorySection
                        title="Logos (1:1 Square Logo · 1 to 5)"
                        fieldType="LOGO"
                        items={detailData.assetsByFieldType["LOGO"] || []}
                        onAdd={() => handleOpenAddAsset("LOGO")}
                        onRemove={item => setAssetToRemove(item)}
                      />

                      {/* Portrait Images */}
                      <AssetGroupCategorySection
                        title="Portrait Images (4:5 Optional · Up to 20)"
                        fieldType="PORTRAIT_MARKETING_IMAGE"
                        items={detailData.assetsByFieldType["PORTRAIT_MARKETING_IMAGE"] || []}
                        onAdd={() => handleOpenAddAsset("PORTRAIT_MARKETING_IMAGE")}
                        onRemove={item => setAssetToRemove(item)}
                      />

                      {/* YouTube Videos */}
                      <AssetGroupCategorySection
                        title="YouTube Videos (Optional · Up to 5)"
                        fieldType="YOUTUBE_VIDEO"
                        items={detailData.assetsByFieldType["YOUTUBE_VIDEO"] || []}
                        onAdd={() => handleOpenAddAsset("YOUTUBE_VIDEO")}
                        onRemove={item => setAssetToRemove(item)}
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Asset Group Resource: {selectedAssetGroup.resourceName}
              </span>
              <button
                onClick={() => setSelectedAssetGroup(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Asset Group Modal ────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Asset Group</h3>
                  <p className="text-[11px] text-slate-500">Add to a Performance Max campaign</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssetGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target PMax Campaign *</label>
                <select
                  value={newCampaignId}
                  onChange={e => setNewCampaignId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Select a Performance Max Campaign</option>
                  {pmaxCampaigns.map(c => {
                    const cId = c.id || c.googleAdsCampaignId;
                    return (
                      <option key={cId} value={cId}>
                        {c.name} ({cId})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Group Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Summer Deals - Sales Growth"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Final URL *</label>
                <input
                  type="url"
                  value={newFinalUrl}
                  onChange={e => setNewFinalUrl(e.target.value)}
                  placeholder="https://yourwebsite.com/landing"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Path 1</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={newPath1}
                    onChange={e => setNewPath1(e.target.value)}
                    placeholder="deals"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Path 2</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={newPath2}
                    onChange={e => setNewPath2(e.target.value)}
                    placeholder="sale"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAg}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {creatingAg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Create Asset Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Link Existing Account Asset Modal ───────────────────────────────── */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-[260] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Link className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Associate Existing Asset</h3>
                  <p className="text-[11px] text-slate-500">
                    Target Field Type: <span className="font-bold text-blue-600">{selectedFieldType}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAssetModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select an existing asset from this Google Ads customer account to attach without creating duplicates.
            </p>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 border border-slate-200 rounded-2xl max-h-72">
              {loadingAccountAssets ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <p className="text-xs">Fetching eligible account assets...</p>
                </div>
              ) : accountAssets.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No existing {selectedFieldType} assets found in account.
                </div>
              ) : (
                accountAssets.map(asset => {
                  const isSelected = selectedAssetToLink?.resourceName === asset.resourceName;
                  return (
                    <button
                      key={asset.resourceName}
                      type="button"
                      onClick={() => setSelectedAssetToLink(asset)}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-all cursor-pointer ${
                        isSelected ? "bg-blue-50/80 border-l-4 border-blue-600" : "hover:bg-slate-50"
                      }`}
                    >
                      {asset.imageUrl ? (
                        <img
                          src={asset.imageUrl}
                          alt={asset.name || "Asset"}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                          {asset.type === "YOUTUBE_VIDEO" ? <Video className="h-5 w-5" /> : <Type className="h-5 w-5" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {asset.text || asset.youtubeVideoTitle || asset.name || `Asset ${asset.id}`}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          ID: {asset.id} · Type: {asset.type}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddAssetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkAsset}
                disabled={!selectedAssetToLink || linkingAsset}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {linkingAsset ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link className="h-3.5 w-3.5" />}
                Associate Asset Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Asset Removal Modal ──────────────────────────────────────── */}
      {assetToRemove && (
        <div className="fixed inset-0 z-[270] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Remove Asset Association?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to detach this asset from the Asset Group? This removes the link in Google Ads API v24 without deleting the underlying asset.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 space-y-1">
              <p>
                <span className="font-bold">Field Type:</span> {assetToRemove.fieldType}
              </p>
              <p className="truncate">
                <span className="font-bold">Content:</span> {assetToRemove.text || assetToRemove.assetName || assetToRemove.assetId}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setAssetToRemove(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAsset}
                disabled={removingAsset}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {removingAsset ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Confirm Remove Association
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Asset Group Category Section ─────────────────────────────
interface AssetGroupCategorySectionProps {
  title: string;
  fieldType: string;
  items: AssetGroupAssetItem[];
  onAdd: () => void;
  onRemove: (item: AssetGroupAssetItem) => void;
}

function AssetGroupCategorySection({
  title,
  fieldType,
  items,
  onAdd,
  onRemove
}: AssetGroupCategorySectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-900">{title}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {items.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add Asset
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">No assets linked for this field type.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {items.map(item => (
            <div
              key={item.resourceName}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 group hover:border-slate-300 transition-all"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="Asset"
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                />
              ) : null}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate" title={item.text || item.assetName}>
                  {item.text || item.youtubeVideoTitle || item.assetName || `Asset ${item.assetId}`}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">ID: {item.assetId}</p>
              </div>

              <button
                onClick={() => onRemove(item)}
                title="Remove asset association"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
