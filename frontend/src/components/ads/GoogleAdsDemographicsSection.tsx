"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
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
  UserCheck,
  UserX,
  DollarSign,
  HeartHandshake,
  Layers,
  ChevronRight
} from "lucide-react";

export type DemographicDimensionType = "AGE_RANGE" | "GENDER" | "INCOME_RANGE" | "PARENTAL_STATUS";

export interface DemographicCriterionItem {
  resourceName: string;
  criterionId: string;
  dimension: DemographicDimensionType;
  typeValue: string;
  displayName: string;
  negative: boolean; // true = Excluded
  status?: string;
  isMutable: boolean;
}

export interface CampaignDemographicsData {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportNotes: {
    ageSupported: boolean;
    genderSupported: boolean;
    incomeSupported: boolean;
    parentalSupported: boolean;
    limitationMessage?: string;
    unsupportedDimensions?: string[];
  };
  dimensions: {
    ageRanges: {
      dimension: "AGE_RANGE";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
    genders: {
      dimension: "GENDER";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
    incomeRanges: {
      dimension: "INCOME_RANGE";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
    parentalStatuses: {
      dimension: "PARENTAL_STATUS";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
  };
}

interface CampaignItem {
  id: string;
  name: string;
  resourceName?: string;
  campaignType?: string;
  advertisingChannelType?: string;
}

interface GoogleAdsDemographicsSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignItem[];
}

export function GoogleAdsDemographicsSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsDemographicsSectionProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<CampaignDemographicsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active Tab: AGE_RANGE | GENDER | INCOME_RANGE | PARENTAL_STATUS
  const [activeTab, setActiveTab] = useState<DemographicDimensionType>("AGE_RANGE");

  // Exclusion Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalDimension, setModalDimension] = useState<DemographicDimensionType>("AGE_RANGE");
  const [modalTypeValue, setModalTypeValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Deletion Modal
  const [criterionToDelete, setCriterionToDelete] = useState<DemographicCriterionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Auto-select first campaign
  useEffect(() => {
    if (campaigns && campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(String(campaigns[0].id));
    }
  }, [campaigns, selectedCampaignId]);

  // Load demographics for selected campaign
  const fetchDemographics = useCallback(async () => {
    if (!selectedCampaignId || !customerId || !orgId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/demographics?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(
          customerId
        )}&campaignId=${encodeURIComponent(selectedCampaignId)}`
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load demographic targeting data");
      }

      setData(json.demographics);
    } catch (err: any) {
      console.error("[GoogleAdsDemographicsSection] fetch error:", err);
      setError(err.message || "Failed to load campaign demographics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignId, customerId, orgId]);

  useEffect(() => {
    fetchDemographics();
  }, [fetchDemographics]);

  // Toast auto-clear
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Add demographic exclusion
  const handleAddExclusion = async () => {
    if (!selectedCampaignId || !modalTypeValue || !customerId || !orgId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ads/demographics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId,
          campaignId: selectedCampaignId,
          dimension: modalDimension,
          typeValue: modalTypeValue,
          negative: true
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to exclude demographic");
      }

      setSuccessToast(`Demographic exclusion saved to Google Ads successfully.`);
      setIsAddModalOpen(false);
      setModalTypeValue("");
      await fetchDemographics();
    } catch (err: any) {
      console.error("[GoogleAdsDemographicsSection] add exclusion error:", err);
      setError(err.message || "Failed to add exclusion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove demographic exclusion criterion
  const handleRemoveCriterion = async () => {
    if (!criterionToDelete || !customerId || !orgId) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ads/demographics?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(
          customerId
        )}&resourceName=${encodeURIComponent(criterionToDelete.resourceName)}`,
        { method: "DELETE" }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to remove demographic criterion");
      }

      setSuccessToast(`Demographic exclusion removed from Google Ads.`);
      setCriterionToDelete(null);
      await fetchDemographics();
    } catch (err: any) {
      console.error("[GoogleAdsDemographicsSection] remove criterion error:", err);
      setError(err.message || "Failed to remove exclusion");
    } finally {
      setIsDeleting(false);
    }
  };

  const isDimensionSupported = (dim: DemographicDimensionType): boolean => {
    if (!data) return false;
    if (data.isPMax) return false;
    if (dim === "PARENTAL_STATUS") return false; // Google Ads API v24 Search campaign limitation
    return true;
  };

  // Get active criteria and available values for active dimension
  const getDimensionData = () => {
    if (!data) return { active: [], available: [] };
    switch (activeTab) {
      case "AGE_RANGE":
        return {
          active: data.dimensions.ageRanges.activeCriteria,
          available: data.dimensions.ageRanges.availableValues
        };
      case "GENDER":
        return {
          active: data.dimensions.genders.activeCriteria,
          available: data.dimensions.genders.availableValues
        };
      case "INCOME_RANGE":
        return {
          active: data.dimensions.incomeRanges.activeCriteria,
          available: data.dimensions.incomeRanges.availableValues
        };
      case "PARENTAL_STATUS":
        return {
          active: data.dimensions.parentalStatuses.activeCriteria,
          available: data.dimensions.parentalStatuses.availableValues
        };
    }
  };

  const { active, available } = getDimensionData();

  // Excluded type values in active dimension
  const excludedValues = new Set(active.map(a => a.typeValue));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* ── Header ── */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50/50 to-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Demographic Targeting</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                Google Ads v24
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target or exclude specific Age Ranges, Genders, and Household Income tiers at the campaign level.
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
            onClick={fetchDemographics}
            disabled={loading || !selectedCampaignId}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh Demographics"
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
                  {data.isPMax ? "Performance Max Demographic Limitation" : "Google Ads API v24 Campaign Rules"}
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">{data.supportNotes.limitationMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dimension Tabs ── */}
      <div className="px-5 pt-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        {[
          { id: "AGE_RANGE", label: "Age Ranges", icon: Users, supported: isDimensionSupported("AGE_RANGE") },
          { id: "GENDER", label: "Genders", icon: UserCheck, supported: isDimensionSupported("GENDER") },
          { id: "INCOME_RANGE", label: "Household Income", icon: DollarSign, supported: isDimensionSupported("INCOME_RANGE") },
          { id: "PARENTAL_STATUS", label: "Parental Status", icon: HeartHandshake, supported: isDimensionSupported("PARENTAL_STATUS") }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DemographicDimensionType)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-purple-600 text-purple-700 bg-purple-50/40 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
            {!tab.supported && (
              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-500 border border-slate-200">
                {data?.isPMax ? "PMax N/A" : "Ad Group Only"}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Dimension Content ── */}
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No demographic data available</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Select a campaign to inspect its demographic criteria</p>
          </div>
        ) : !isDimensionSupported(activeTab) ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
            <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
            <h3 className="text-xs font-bold text-slate-800">
              {activeTab === "PARENTAL_STATUS"
                ? "Parental Status is Not Supported at Campaign Level"
                : "Demographics Not Configurable for Performance Max"}
            </h3>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
              {activeTab === "PARENTAL_STATUS"
                ? "Google Ads API v24 restricts Parental Status criteria exclusively to the Ad Group level for Search campaigns. Campaign-level creation is rejected by Google Ads with OPERATION_NOT_PERMITTED_FOR_CONTEXT."
                : "Performance Max campaigns rely on audience signals configured within Asset Groups. Traditional manual campaign criteria cannot be added or mutated."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top action bar: Exclude button & explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  {activeTab === "AGE_RANGE" && "Age Range Criteria"}
                  {activeTab === "GENDER" && "Gender Criteria"}
                  {activeTab === "INCOME_RANGE" && "Household Income Tiers"}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  By default, all demographics are targeted. Add negative exclusions to prevent your ads from serving to selected groups.
                </p>
              </div>

              <button
                onClick={() => {
                  setModalDimension(activeTab);
                  // pick first un-excluded value
                  const firstUnexcluded = available.find(v => !excludedValues.has(v.type));
                  setModalTypeValue(firstUnexcluded ? firstUnexcluded.type : available[0]?.type || "");
                  setIsAddModalOpen(true);
                }}
                disabled={data.isPMax || available.every(v => excludedValues.has(v.type))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Exclude {activeTab === "AGE_RANGE" ? "Age Group" : activeTab === "GENDER" ? "Gender" : "Income Tier"}
              </button>
            </div>

            {/* Matrix of all available demographic tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {available.map(item => {
                const isExcluded = excludedValues.has(item.type);
                const activeCriterion = active.find(a => a.typeValue === item.type);

                return (
                  <div
                    key={item.type}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isExcluded
                        ? "bg-rose-50/50 border-rose-200 text-rose-950"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isExcluded
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isExcluded ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{item.label}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                              isExcluded
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isExcluded ? "EXCLUDED" : "TARGETED"}
                          </span>
                          {activeCriterion && (
                            <span className="text-[9px] text-slate-400 font-mono truncate">
                              ID: {activeCriterion.criterionId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0">
                      {isExcluded && activeCriterion ? (
                        <button
                          onClick={() => setCriterionToDelete(activeCriterion)}
                          disabled={data.isPMax}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                          title="Remove Exclusion (Allow Targeting)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setModalDimension(activeTab);
                            setModalTypeValue(item.type);
                            setIsAddModalOpen(true);
                          }}
                          disabled={data.isPMax}
                          className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all cursor-pointer"
                        >
                          Exclude
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Add Exclusion ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900">Add Campaign Demographic Exclusion</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Exclude this demographic segment so your ads will not show to users who fall within this group.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Dimension</label>
                <input
                  type="text"
                  readOnly
                  value={
                    modalDimension === "AGE_RANGE"
                      ? "Age Range"
                      : modalDimension === "GENDER"
                      ? "Gender"
                      : "Household Income"
                  }
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Segment to Exclude</label>
                <select
                  value={modalTypeValue}
                  onChange={e => setModalTypeValue(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  {available.map(item => (
                    <option key={item.type} value={item.type} disabled={excludedValues.has(item.type)}>
                      {item.label} {excludedValues.has(item.type) ? "(Already Excluded)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 space-y-1">
                <span className="font-bold">Google Ads API v24 Mutation:</span>
                <p className="font-mono text-[10px] text-purple-800">
                  campaignCriteria:mutate &#123; create: &#123; campaign, negative: true, {modalDimension.toLowerCase()}: &#123; type: &#34;{modalTypeValue}&#34; &#125; &#125; &#125;
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
                  onClick={handleAddExclusion}
                  disabled={isSubmitting || !modalTypeValue}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving to Google...
                    </>
                  ) : (
                    "Confirm Exclusion"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Exclusion ── */}
      {criterionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">Remove Exclusion Criterion</h3>
              </div>
              <button
                onClick={() => setCriterionToDelete(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove the exclusion for{" "}
                <strong className="text-slate-900">{criterionToDelete.displayName}</strong>?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Removing this exclusion will re-enable your campaign to show ads to users in this demographic group.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-600 break-all">
                {criterionToDelete.resourceName}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setCriterionToDelete(null)}
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
                    "Remove Exclusion"
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
