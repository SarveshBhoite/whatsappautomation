"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Megaphone,
  Eye,
  CheckCircle2,
  X,
  FileQuestion,
  Tag
} from "lucide-react";

export interface NormalizedAssetPolicyRecord {
  assetResourceName: string;
  assetId: string;
  assetType: string;
  assetName: string;
  policyApprovalStatus: string;
  policyReviewStatus: string;
  policyTopics: Array<{
    topic?: string;
    type?: string;
    evidences?: any[];
    constraints?: any[];
  }>;
  primaryPolicyTopic?: string;
  primarySeverity?: string;
  disapprovalReasons: string[];
  findings: string[];
  campaignResourceName?: string;
  campaignId?: string;
  campaignName?: string;
  adGroupResourceName?: string;
  adGroupId?: string;
  adGroupName?: string;
  associationLevel: "CAMPAIGN" | "AD_GROUP" | "CUSTOMER" | "ASSET_GROUP" | "GLOBAL";
  fieldType?: string;
  associationStatus?: string;
  textContent?: string;
  mediaDetails?: {
    fileSize?: number;
    mimeType?: string;
    youtubeVideoId?: string;
    youtubeVideoTitle?: string;
    callPhoneNumber?: string;
    sitelinkText?: string;
    sitelinkFinalUrls?: string[];
    appId?: string;
    appStore?: string;
  };
}

export interface ListAssetPolicyResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  summary: {
    totalAssets: number;
    approvedCount: number;
    disapprovedCount: number;
    limitedCount: number;
    underReviewCount: number;
    otherCount: number;
  };
  filtersAvailable: {
    assetTypes: string[];
    campaigns: Array<{ id: string; name: string }>;
    policyStatuses: string[];
  };
  records: NormalizedAssetPolicyRecord[];
}

interface AssetPolicyDisapprovalsSectionProps {
  customerId: string;
  orgId: string;
}

export function AssetPolicyDisapprovalsSection({
  customerId,
  orgId
}: AssetPolicyDisapprovalsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ListAssetPolicyResponse | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("ALL");
  const [campaignFilter, setCampaignFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Drawer / Detail View
  const [selectedAsset, setSelectedAsset] = useState<NormalizedAssetPolicyRecord | null>(null);

  const fetchPolicyData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const cleanCid = customerId.replace(/-/g, "").trim();

      const params = new URLSearchParams();
      params.append("customerId", cleanCid);
      if (statusFilter !== "ALL") params.append("policyStatus", statusFilter);
      if (assetTypeFilter !== "ALL") params.append("assetType", assetTypeFilter);
      if (campaignFilter !== "ALL") params.append("campaignId", campaignFilter);
      params.append("limit", "150");

      const res = await fetch(`${BACKEND}/api/ads/asset-policy?${params.toString()}`, {
        headers: {
          "x-organization-id": orgId || "demo-org-123"
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to fetch asset policy information`);
      }

      const json: ListAssetPolicyResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("[AssetPolicyDisapprovalsSection] Error loading policy data:", err);
      setError(err.message || "Failed to load Google Ads asset policy data");
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId, statusFilter, assetTypeFilter, campaignFilter]);

  useEffect(() => {
    fetchPolicyData();
  }, [fetchPolicyData]);

  // Client-side text search on asset name or topic
  const records = data?.records || [];
  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = r.assetName?.toLowerCase().includes(query);
    const typeMatch = r.assetType?.toLowerCase().includes(query);
    const idMatch = r.assetId?.includes(query);
    const campMatch = r.campaignName?.toLowerCase().includes(query);
    const topicMatch = r.disapprovalReasons?.some((d) => d.toLowerCase().includes(query));
    return nameMatch || typeMatch || idMatch || campMatch || topicMatch;
  });

  const summary = data?.summary || {
    totalAssets: 0,
    approvedCount: 0,
    disapprovedCount: 0,
    limitedCount: 0,
    underReviewCount: 0,
    otherCount: 0
  };

  const getStatusBadge = (status: string) => {
    const norm = status?.toUpperCase() || "";
    if (norm === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
      );
    }
    if (norm === "DISAPPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3 h-3" /> Disapproved
        </span>
      );
    }
    if (norm === "AREA_OF_INTEREST_ONLY" || norm === "APPROVED_LIMITED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3" /> Limited
        </span>
      );
    }
    if (norm === "UNDER_REVIEW" || norm.includes("REVIEW")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3" /> Under Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {status || "Unknown"}
      </span>
    );
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return <span className="text-slate-400 font-mono">—</span>;
    const sev = severity.toUpperCase();
    if (sev === "PROHIBITED") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          PROHIBITED
        </span>
      );
    }
    if (sev === "LIMITED") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          LIMITED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
        {severity}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Header Banner & Audit Metrics ── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Google Ads Asset Policy &amp; Disapprovals</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    Read-Only
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Google Ads API v24
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official live policy compliance, disapproval reasons, and review statuses across images, logos, videos, and extension assets linked to customer ID:{" "}
                  <strong className="font-mono text-slate-700">{customerId}</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPolicyData()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh Asset Policy Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span>Refresh Policy</span>
            </button>
          </div>
        </div>

        {/* Audit Metrics Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assets</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{summary.totalAssets}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Approved</p>
            <p className="text-xl font-bold text-emerald-800 mt-1">{summary.approvedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Disapproved</p>
            <p className="text-xl font-bold text-rose-800 mt-1">{summary.disapprovedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Limited</p>
            <p className="text-xl font-bold text-amber-900 mt-1">{summary.limitedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Under Review</p>
            <p className="text-xl font-bold text-blue-800 mt-1">{summary.underReviewCount}</p>
          </div>
        </div>
      </div>

      {/* ── 2. Filters & Search Control Bar ── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All", value: "ALL" },
            { label: "Disapproved", value: "DISAPPROVED" },
            { label: "Approved", value: "APPROVED" },
            { label: "Limited", value: "APPROVED_LIMITED" },
            { label: "Under Review", value: "UNDER_REVIEW" }
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st.value
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Secondary Select Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Asset Type Filter */}
          <select
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">All Asset Types</option>
            {(data?.filtersAvailable?.assetTypes || []).map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Campaign Filter */}
          {(data?.filtersAvailable?.campaigns || []).length > 0 && (
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none focus:border-blue-500 focus:bg-white max-w-[180px] truncate"
            >
              <option value="ALL">All Campaigns</option>
              {data?.filtersAvailable.campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID, issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 w-48 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Table / Empty / Error States ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-700">Loading Google Ads policy evaluations…</p>
            <p className="text-[11px] text-slate-500">Querying live policy summaries for assets in customer #{customerId}</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900">Failed to load policy data</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchPolicyData()}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-base font-bold text-slate-900">
              {statusFilter === "DISAPPROVED"
                ? "No disapproved assets found"
                : "No policy issues found for this Google Ads account."}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter === "DISAPPROVED"
                ? "All evaluated assets for this customer account are approved or under review."
                : "No assets match your selected filter criteria. All assets comply with official Google Ads advertising policies."}
            </p>
            {(statusFilter !== "ALL" || assetTypeFilter !== "ALL" || campaignFilter !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("ALL");
                  setAssetTypeFilter("ALL");
                  setCampaignFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Asset</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Campaign</th>
                  <th className="p-4">Ad Group</th>
                  <th className="p-4">Policy Status</th>
                  <th className="p-4">Issue / Finding</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Review Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((item, idx) => (
                  <tr
                    key={`${item.assetId}_${item.associationLevel}_${idx}`}
                    onClick={() => setSelectedAsset(item)}
                    className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                  >
                    {/* Asset Name & ID */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors max-w-[220px] truncate" title={item.assetName}>
                        {item.assetName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        ID: {item.assetId}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
                        {item.assetType.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Campaign */}
                    <td className="p-4 text-slate-600 max-w-[160px] truncate" title={item.campaignName || "Global / Account Level"}>
                      {item.campaignName ? (
                        <div>
                          <p className="font-medium text-slate-800 truncate">{item.campaignName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {item.campaignId}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Account Level</span>
                      )}
                    </td>

                    {/* Ad Group */}
                    <td className="p-4 text-slate-600 max-w-[140px] truncate" title={item.adGroupName || "—"}>
                      {item.adGroupName ? (
                        <div>
                          <p className="font-medium text-slate-800 truncate">{item.adGroupName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {item.adGroupId}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Policy Status */}
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(item.policyApprovalStatus)}
                    </td>

                    {/* Issue / Finding */}
                    <td className="p-4 max-w-[200px]">
                      {item.disapprovalReasons.length > 0 ? (
                        <div className="space-y-0.5">
                          {item.disapprovalReasons.map((r, ri) => (
                            <span
                              key={ri}
                              className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 truncate max-w-full"
                              title={r}
                            >
                              {r.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No policy violations</span>
                      )}
                    </td>

                    {/* Severity */}
                    <td className="p-4 whitespace-nowrap">
                      {getSeverityBadge(item.primarySeverity)}
                    </td>

                    {/* Review Status */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-600 text-[11px]">
                      {item.policyReviewStatus ? item.policyReviewStatus.replace(/_/g, " ") : "REVIEWED"}
                    </td>

                    {/* Actions (READ-ONLY view details) */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(item);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                        title="View Policy Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Detail Drawer / Modal (Read-Only) ── */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedAsset(null)}
          />

          <div className="relative z-10 w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Info className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Asset Policy Review Details</h3>
                  <p className="text-[11px] text-slate-500">Official Google Ads policy diagnostic information (Read-Only)</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Asset Identity Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Identity</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-200 text-slate-800">
                    {selectedAsset.assetType}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedAsset.assetName}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Asset ID: {selectedAsset.assetId}</p>
                  <p className="text-[11px] text-slate-400 font-mono break-all mt-0.5">
                    Resource: {selectedAsset.assetResourceName}
                  </p>
                </div>

                {/* Text or Media preview if available */}
                {selectedAsset.textContent && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                    &ldquo;{selectedAsset.textContent}&rdquo;
                  </div>
                )}
                {selectedAsset.mediaDetails?.callPhoneNumber && (
                  <p className="text-xs font-bold text-slate-700">Phone: {selectedAsset.mediaDetails.callPhoneNumber}</p>
                )}
                {selectedAsset.mediaDetails?.sitelinkText && (
                  <p className="text-xs font-bold text-slate-700">Sitelink Text: {selectedAsset.mediaDetails.sitelinkText}</p>
                )}
                {selectedAsset.mediaDetails?.youtubeVideoId && (
                  <p className="text-xs font-bold text-slate-700">YouTube Video ID: {selectedAsset.mediaDetails.youtubeVideoId}</p>
                )}
              </div>

              {/* Policy Assessment Card */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Policy Decision</span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">Approval Status</p>
                    <div className="mt-1">{getStatusBadge(selectedAsset.policyApprovalStatus)}</div>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">Review Status</p>
                    <p className="mt-1 text-xs font-bold text-slate-800 font-mono">
                      {selectedAsset.policyReviewStatus || "REVIEWED"}
                    </p>
                  </div>
                </div>

                {/* Primary Topic & Severity */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">Policy Topic</p>
                    <p className="mt-1 text-xs font-bold text-slate-800 font-mono">
                      {selectedAsset.primaryPolicyTopic || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">Severity</p>
                    <div className="mt-1">{getSeverityBadge(selectedAsset.primarySeverity)}</div>
                  </div>
                </div>
              </div>

              {/* Policy Topic Findings / Disapproval Reasons */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Policy Findings &amp; Violations
                  </span>
                </div>

                {selectedAsset.policyTopics && selectedAsset.policyTopics.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAsset.policyTopics.map((topic, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-rose-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-800 font-mono">
                            {topic.topic || "POLICY VIOLATION"}
                          </span>
                          {getSeverityBadge(topic.type)}
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Finding recorded officially by Google Ads review pipeline.
                        </p>
                        {topic.constraints && topic.constraints.length > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Constraints: {JSON.stringify(topic.constraints)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic">No specific violation entries logged for this asset.</p>
                )}
              </div>

              {/* Campaign / Ad Group Associations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Hierarchy &amp; Associations
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[11px] text-slate-500">Association Level</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedAsset.associationLevel}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Field Type</p>
                    <p className="font-mono text-slate-800 mt-0.5">{selectedAsset.fieldType || "DEFAULT"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Campaign Name</p>
                    <p className="font-medium text-slate-800 mt-0.5 truncate">{selectedAsset.campaignName || "—"}</p>
                    {selectedAsset.campaignId && (
                      <p className="text-[10px] text-slate-400 font-mono">ID: {selectedAsset.campaignId}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Ad Group Name</p>
                    <p className="font-medium text-slate-800 mt-0.5 truncate">{selectedAsset.adGroupName || "—"}</p>
                    {selectedAsset.adGroupId && (
                      <p className="text-[10px] text-slate-400 font-mono">ID: {selectedAsset.adGroupId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (READ-ONLY) */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-400">
                Read-only diagnostic view · Modifications are disabled
              </span>
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
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
