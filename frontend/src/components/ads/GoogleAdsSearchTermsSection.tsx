"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Filter,
  Calendar,
  AlertCircle,
  Loader2,
  Tag,
  CheckCircle,
  X,
  ChevronDown,
  Info,
  ShieldAlert,
  ArrowUpDown,
  CheckSquare,
  Square,
  Ban
} from "lucide-react";

interface SearchTermItem {
  searchTerm: string;
  status: string; // ADDED, EXCLUDED, ADDED_EXCLUDED, NONE
  resourceName: string;
  campaignId: string;
  campaignName: string;
  campaignType: string;
  supportsKeywords: boolean;
  adGroupId?: string;
  adGroupName?: string;
  searchTermMatchType?: string;
  keywordText?: string;
  keywordMatchType?: string;
  impressions: number;
  clicks: number;
  ctr: string;
  cost: string;
  avgCpc: string;
  conversions: number;
  conversionValue: number;
  currencyCode: string;
}

interface CampaignOption {
  id: string;
  name: string;
  resourceName?: string;
  campaignType?: string;
}

interface AdGroupOption {
  id: string;
  name: string;
  campaignId: string;
}

interface GoogleAdsSearchTermsSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignOption[];
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DATE_RANGES = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
];

export function GoogleAdsSearchTermsSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsSearchTermsSectionProps) {
  const [searchTerms, setSearchTerms] = useState<SearchTermItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string>("");
  const [adGroups, setAdGroups] = useState<AdGroupOption[]>([]);
  const [loadingAdGroups, setLoadingAdGroups] = useState(false);
  const [dateRange, setDateRange] = useState<string>("LAST_30_DAYS");
  const [queryFilter, setQueryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection
  const [selectedTerms, setSelectedTerms] = useState<SearchTermItem[]>([]);

  // Action Modal State
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    isNegative: boolean;
    terms: SearchTermItem[];
    targetCampaignId: string;
    targetAdGroupId: string;
    matchType: "EXACT" | "PHRASE" | "BROAD";
    scope: "AD_GROUP" | "CAMPAIGN";
    cpcBid?: number;
    submitting: boolean;
  }>({
    open: false,
    isNegative: false,
    terms: [],
    targetCampaignId: "",
    targetAdGroupId: "",
    matchType: "EXACT",
    scope: "AD_GROUP",
    submitting: false
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load Ad Groups when a campaign is selected
  useEffect(() => {
    if (!customerId || !selectedCampaignId) {
      setAdGroups([]);
      setSelectedAdGroupId("");
      return;
    }

    const fetchAdGroups = async () => {
      setLoadingAdGroups(true);
      try {
        const res = await fetch(
          `${BACKEND}/api/ads/keyword-targeting?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(customerId)}&campaignId=${encodeURIComponent(selectedCampaignId)}`
        );
        const data = await res.json();
        if (data.success && data.data?.adGroups) {
          setAdGroups(data.data.adGroups);
        } else {
          setAdGroups([]);
        }
      } catch (e) {
        console.warn("[GoogleAdsSearchTermsSection] Failed to load ad groups:", e);
        setAdGroups([]);
      } finally {
        setLoadingAdGroups(false);
      }
    };

    fetchAdGroups();
  }, [customerId, orgId, selectedCampaignId]);

  // Load Search Terms from Google Ads API v24
  const loadSearchTerms = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    setSelectedTerms([]);

    try {
      const params = new URLSearchParams({
        orgId,
        customerId,
        dateRange,
        limit: "200"
      });
      if (selectedCampaignId) params.append("campaignId", selectedCampaignId);
      if (selectedAdGroupId) params.append("adGroupId", selectedAdGroupId);

      const res = await fetch(`${BACKEND}/api/ads/reports/search-terms?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const items = Array.isArray(json) ? json : json.items || [];
      setSearchTerms(items);
    } catch (err: any) {
      setError(err.message || "Failed to load search terms report.");
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId, dateRange, selectedCampaignId, selectedAdGroupId]);

  useEffect(() => {
    loadSearchTerms();
  }, [loadSearchTerms]);

  // Filtered Items
  const filteredTerms = searchTerms.filter(st => {
    if (queryFilter.trim()) {
      const q = queryFilter.toLowerCase();
      const matchTerm = st.searchTerm?.toLowerCase().includes(q);
      const matchKw = st.keywordText?.toLowerCase().includes(q);
      const matchCamp = st.campaignName?.toLowerCase().includes(q);
      if (!matchTerm && !matchKw && !matchCamp) return false;
    }
    if (statusFilter !== "ALL") {
      if (st.status !== statusFilter) return false;
    }
    return true;
  });

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedTerms.length === filteredTerms.length && filteredTerms.length > 0) {
      setSelectedTerms([]);
    } else {
      setSelectedTerms([...filteredTerms]);
    }
  };

  const toggleSelectRow = (item: SearchTermItem) => {
    const exists = selectedTerms.some(t => t.searchTerm === item.searchTerm && t.campaignId === item.campaignId);
    if (exists) {
      setSelectedTerms(selectedTerms.filter(t => !(t.searchTerm === item.searchTerm && t.campaignId === item.campaignId)));
    } else {
      setSelectedTerms([...selectedTerms, item]);
    }
  };

  const isSelected = (item: SearchTermItem) => {
    return selectedTerms.some(t => t.searchTerm === item.searchTerm && t.campaignId === item.campaignId);
  };

  // Open Add Keyword Modal
  const openAddKeywordModal = (terms: SearchTermItem[], isNegative: boolean) => {
    if (terms.length === 0) return;
    const first = terms[0];
    const targetCamp = first.campaignId || selectedCampaignId || (campaigns[0]?.id || "");
    const targetAg = first.adGroupId || selectedAdGroupId || (adGroups[0]?.id || "");

    setActionModal({
      open: true,
      isNegative,
      terms,
      targetCampaignId: targetCamp,
      targetAdGroupId: targetAg,
      matchType: isNegative ? "EXACT" : "PHRASE",
      scope: isNegative ? "CAMPAIGN" : "AD_GROUP",
      cpcBid: undefined,
      submitting: false
    });
  };

  // Handle Add Keyword Mutation
  const handleExecuteKeywordAction = async () => {
    if (!actionModal.targetCampaignId) {
      showToast("Please select a target campaign.");
      return;
    }
    if (actionModal.scope === "AD_GROUP" && !actionModal.targetAdGroupId) {
      showToast("Please select an ad group for ad group targeting.");
      return;
    }

    setActionModal(prev => ({ ...prev, submitting: true }));

    let successCount = 0;
    let failCount = 0;
    let lastErr = "";

    for (const item of actionModal.terms) {
      try {
        const payload = {
          orgId,
          customerId,
          campaignId: actionModal.targetCampaignId,
          adGroupId: actionModal.scope === "AD_GROUP" ? actionModal.targetAdGroupId : undefined,
          text: item.searchTerm,
          matchType: actionModal.matchType,
          isNegative: actionModal.isNegative,
          scope: actionModal.scope,
          cpcBid: actionModal.cpcBid
        };

        const res = await fetch(`${BACKEND}/api/ads/search-terms/add-keyword`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        successCount++;
      } catch (e: any) {
        failCount++;
        lastErr = e.message;
      }
    }

    setActionModal(prev => ({ ...prev, submitting: false, open: false }));
    setSelectedTerms([]);

    if (successCount > 0) {
      showToast(`Successfully added ${successCount} search term(s) as ${actionModal.isNegative ? "Negative Keyword" : "Keyword"} ✓`);
      loadSearchTerms();
    }
    if (failCount > 0) {
      showToast(`Failed to add ${failCount} term(s): ${lastErr}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Search Terms Management</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              API v24
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze authentic user queries triggering your Search ads. Promote high-intent terms to Keywords or block irrelevant traffic with Negative Keywords.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action buttons when items selected */}
          {selectedTerms.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => openAddKeywordModal(selectedTerms, false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add as Keyword ({selectedTerms.length})
              </button>
              <button
                onClick={() => openAddKeywordModal(selectedTerms, true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" />
                Add as Negative ({selectedTerms.length})
              </button>
            </div>
          )}

          <button
            onClick={loadSearchTerms}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh Report"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        {/* Campaign Filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Campaign
          </label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.campaignType ? `(${c.campaignType})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Ad Group Filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Ad Group
          </label>
          <select
            value={selectedAdGroupId}
            onChange={(e) => setSelectedAdGroupId(e.target.value)}
            disabled={!selectedCampaignId || loadingAdGroups}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">All Ad Groups</option>
            {adGroups.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Preset */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {DATE_RANGES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Query Filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Search Term
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter search terms..."
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-2 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Querying Google Ads API v24 search terms...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">Error loading search terms</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button
              onClick={loadSearchTerms}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Search className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No search terms recorded</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Google Ads search terms appear when users execute searches that trigger impressions or clicks for your campaigns in the chosen date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={selectedTerms.length === filteredTerms.length ? "Deselect All" : "Select All"}
                    >
                      {selectedTerms.length === filteredTerms.length && filteredTerms.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Search Term</th>
                  <th className="p-4">Campaign</th>
                  <th className="p-4">Ad Group</th>
                  <th className="p-4">Triggering Keyword</th>
                  <th className="p-4">Match Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Impressions</th>
                  <th className="p-4 text-right">Clicks</th>
                  <th className="p-4 text-right">CTR</th>
                  <th className="p-4 text-right">Cost</th>
                  <th className="p-4 text-right">Avg CPC</th>
                  <th className="p-4 text-right">Conv.</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTerms.map((st, i) => {
                  const selected = isSelected(st);
                  return (
                    <tr
                      key={`${st.searchTerm}-${st.campaignId}-${i}`}
                      className={`hover:bg-slate-50/80 transition-all ${selected ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleSelectRow(st)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {selected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {st.searchTerm}
                      </td>
                      <td className="p-4 text-slate-600">{st.campaignName}</td>
                      <td className="p-4 text-slate-600">{st.adGroupName || "—"}</td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {st.keywordText || "—"}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                          {st.searchTermMatchType || st.keywordMatchType || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            st.status === "ADDED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : st.status === "EXCLUDED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-900">
                        {st.impressions.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-900">
                        {st.clicks.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-900">{st.ctr}</td>
                      <td className="p-4 text-right font-bold text-emerald-700">
                        ₹{st.cost}
                      </td>
                      <td className="p-4 text-right font-medium text-slate-600">
                        ₹{st.avgCpc}
                      </td>
                      <td className="p-4 text-right font-semibold text-purple-700">
                        {st.conversions}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openAddKeywordModal([st], false)}
                            disabled={!st.supportsKeywords}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              st.supportsKeywords
                                ? "Add as Positive Keyword"
                                : "Traditional keywords are not supported for this campaign type (PMax)"
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openAddKeywordModal([st], true)}
                            disabled={!st.supportsKeywords}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              st.supportsKeywords
                                ? "Add as Negative Keyword"
                                : "Traditional keywords are not supported for this campaign type (PMax)"
                            }
                          >
                            <Ban className="h-3.5 w-3.5" />
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

      {/* Add Keyword / Add Negative Keyword Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {actionModal.isNegative ? (
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Ban className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Plus className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {actionModal.isNegative ? "Add Negative Keyword" : "Add as Positive Keyword"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {actionModal.terms.length === 1
                      ? `"${actionModal.terms[0].searchTerm}"`
                      : `${actionModal.terms.length} search terms selected`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionModal(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              {/* Selected Terms List */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Target Search Term(s)
                </label>
                <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-1">
                  {actionModal.terms.map((t, idx) => (
                    <div key={idx} className="font-mono text-slate-800 text-[11px] flex items-center justify-between">
                      <span>• {t.searchTerm}</span>
                      <span className="text-slate-400 text-[10px]">{t.campaignName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Type */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Match Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["EXACT", "PHRASE", "BROAD"] as const).map(mt => (
                    <button
                      key={mt}
                      type="button"
                      onClick={() => setActionModal(prev => ({ ...prev, matchType: mt }))}
                      className={`p-2.5 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                        actionModal.matchType === mt
                          ? "bg-blue-50 border-blue-600 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {mt}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {actionModal.matchType === "EXACT" && "[exact match] - Triggers ads on searches with identical meaning."}
                  {actionModal.matchType === "PHRASE" && "\"phrase match\" - Triggers ads on searches including the phrase concept."}
                  {actionModal.matchType === "BROAD" && "broad match - Triggers ads on searches related to your keyword."}
                </p>
              </div>

              {/* Scope (Ad Group vs Campaign Level Negative) */}
              {actionModal.isNegative && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Exclusion Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionModal(prev => ({ ...prev, scope: "CAMPAIGN" }))}
                      className={`p-2.5 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                        actionModal.scope === "CAMPAIGN"
                          ? "bg-rose-50 border-rose-600 text-rose-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Campaign-Wide
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionModal(prev => ({ ...prev, scope: "AD_GROUP" }))}
                      className={`p-2.5 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                        actionModal.scope === "AD_GROUP"
                          ? "bg-rose-50 border-rose-600 text-rose-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Ad Group Only
                    </button>
                  </div>
                </div>
              )}

              {/* Target Campaign */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Target Campaign
                </label>
                <select
                  value={actionModal.targetCampaignId}
                  onChange={(e) => setActionModal(prev => ({ ...prev, targetCampaignId: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Select a Campaign</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Ad Group (if scope is AD_GROUP) */}
              {actionModal.scope === "AD_GROUP" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Target Ad Group
                  </label>
                  <select
                    value={actionModal.targetAdGroupId}
                    onChange={(e) => setActionModal(prev => ({ ...prev, targetAdGroupId: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select an Ad Group</option>
                    {adGroups.map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Max CPC Bid (for Positive Keywords) */}
              {!actionModal.isNegative && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Max CPC Bid (Optional, ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15.00"
                    value={actionModal.cpcBid || ""}
                    onChange={(e) => setActionModal(prev => ({ ...prev, cpcBid: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal(prev => ({ ...prev, open: false }))}
                disabled={actionModal.submitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteKeywordAction}
                disabled={actionModal.submitting}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white transition cursor-pointer disabled:opacity-50 ${
                  actionModal.isNegative
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {actionModal.submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {actionModal.isNegative ? "Add Negative Keyword" : "Add Keyword"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
