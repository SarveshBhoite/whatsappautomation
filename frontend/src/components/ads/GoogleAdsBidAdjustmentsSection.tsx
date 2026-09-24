"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sliders,
  Target,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Edit2,
  Trash2,
  Loader2,
  X,
  Plus,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Users,
  Check,
  Percent,
  TrendingUp,
  Calendar,
  Layers,
  ShieldAlert
} from "lucide-react";

export interface BidAdjustmentItem {
  resourceName: string;
  criterionId: string;
  dimension: "DEVICE" | "LOCATION" | "AD_SCHEDULE" | "AUDIENCE" | string;
  targetName: string;
  targetDetails?: any;
  bidModifier: number; // e.g. 1.2 (+20%), 0.0 (-100% opt out)
  bidModifierPercent: number; // e.g. +20, -20, -100
  isMutable: boolean;
  status?: string;
}

export interface CampaignBidAdjustmentsData {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  biddingStrategyType: string;
  isPMax: boolean;
  isSmartBidding: boolean;
  supportNotes: {
    deviceSupported: boolean;
    locationSupported: boolean;
    scheduleSupported: boolean;
    audienceSupported: boolean;
    limitationMessage?: string;
  };
  adjustments: {
    devices: BidAdjustmentItem[];
    locations: BidAdjustmentItem[];
    schedules: BidAdjustmentItem[];
    audiences: BidAdjustmentItem[];
  };
}

interface CampaignItem {
  id: string;
  name: string;
  resourceName?: string;
  campaignType?: string;
  advertisingChannelType?: string;
}

interface GoogleAdsBidAdjustmentsSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignItem[];
}

export function GoogleAdsBidAdjustmentsSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsBidAdjustmentsSectionProps) {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // Selected Campaign
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  // Sub-dimension tab
  const [activeDimension, setActiveDimension] = useState<"device" | "location" | "schedule" | "audience">("device");

  // Data states
  const [data, setData] = useState<CampaignBidAdjustmentsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit Bid Adjustment Modal
  const [editingItem, setEditingItem] = useState<BidAdjustmentItem | null>(null);
  const [editPercent, setEditPercent] = useState<number>(0);
  const [isOptOut, setIsOptOut] = useState<boolean>(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Add Location Modal
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [newLocationGeoId, setNewLocationGeoId] = useState("1007788"); // default Pune
  const [newLocationPercent, setNewLocationPercent] = useState<number>(0);
  const [addingLocation, setAddingLocation] = useState(false);

  // Add Schedule Modal
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [schedDay, setSchedDay] = useState<any>("MONDAY");
  const [schedStartHour, setSchedStartHour] = useState<number>(9);
  const [schedEndHour, setSchedEndHour] = useState<number>(18);
  const [schedPercent, setSchedPercent] = useState<number>(0);
  const [addingSchedule, setAddingSchedule] = useState(false);

  // Remove confirmation modal
  const [itemToRemove, setItemToRemove] = useState<BidAdjustmentItem | null>(null);
  const [removingItem, setRemovingItem] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Pre-select first campaign
  useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  // ── Fetch Bid Adjustments ──────────────────────────────────────────────────
  const fetchAdjustments = useCallback(async () => {
    if (!cleanCid || !selectedCampaignId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `${BACKEND}/api/ads/bidding/bid-adjustments?customerId=${cleanCid}&campaignId=${selectedCampaignId}`,
        { headers: { "x-organization-id": orgId } }
      );
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setData(resJson.data);
      } else {
        setErrorMsg(resJson.error || "Failed to load campaign bid adjustments");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error loading bid adjustments");
    } finally {
      setLoading(false);
    }
  }, [cleanCid, selectedCampaignId, orgId, BACKEND]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  // ── Save Bid Adjustment Update ─────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      // Calculate multiplier or opt-out (-100% = 0.0)
      const modifierVal = isOptOut ? 0.0 : (100 + editPercent) / 100;

      const res = await fetch(`${BACKEND}/api/ads/bidding/bid-adjustments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          resourceName: editingItem.resourceName,
          bidModifier: modifierVal
        })
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast(
          isOptOut
            ? `Bid adjustment set to -100% (Opt-out) for ${editingItem.targetName} ✓`
            : `Bid adjustment updated to ${editPercent >= 0 ? `+${editPercent}%` : `${editPercent}%`} for ${editingItem.targetName} ✓`
        );
        setEditingItem(null);
        fetchAdjustments();
      } else {
        showToast(resJson.error || "Failed to update bid adjustment");
      }
    } catch (err: any) {
      showToast(err.message || "Error updating bid adjustment");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Add Location Adjustment ────────────────────────────────────────────────
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationGeoId.trim()) return;
    setAddingLocation(true);
    try {
      const modifierVal = (100 + newLocationPercent) / 100;
      const res = await fetch(`${BACKEND}/api/ads/bidding/bid-adjustments/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          campaignId: selectedCampaignId,
          geoTargetConstantId: newLocationGeoId.trim(),
          bidModifier: modifierVal
        })
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast(`Location target & bid adjustment created ✓`);
        setIsAddLocationModalOpen(false);
        setNewLocationPercent(0);
        fetchAdjustments();
      } else {
        showToast(resJson.error || "Failed to add location adjustment");
      }
    } catch (err: any) {
      showToast(err.message || "Error adding location adjustment");
    } finally {
      setAddingLocation(false);
    }
  };

  // ── Add Schedule Adjustment ────────────────────────────────────────────────
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSchedule(true);
    try {
      const modifierVal = (100 + schedPercent) / 100;
      const res = await fetch(`${BACKEND}/api/ads/bidding/bid-adjustments/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          campaignId: selectedCampaignId,
          dayOfWeek: schedDay,
          startHour: schedStartHour,
          startMinute: "ZERO",
          endHour: schedEndHour,
          endMinute: "ZERO",
          bidModifier: modifierVal
        })
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast(`Ad schedule & bid adjustment created ✓`);
        setIsAddScheduleModalOpen(false);
        setSchedPercent(0);
        fetchAdjustments();
      } else {
        showToast(resJson.error || "Failed to add schedule adjustment");
      }
    } catch (err: any) {
      showToast(err.message || "Error adding schedule adjustment");
    } finally {
      setAddingSchedule(false);
    }
  };

  // ── Remove Adjustment Criterion ───────────────────────────────────────────
  const handleRemoveItem = async () => {
    if (!itemToRemove) return;
    setRemovingItem(true);
    try {
      const res = await fetch(
        `${BACKEND}/api/ads/bidding/bid-adjustments?customerId=${cleanCid}&resourceName=${encodeURIComponent(itemToRemove.resourceName)}`,
        {
          method: "DELETE",
          headers: { "x-organization-id": orgId }
        }
      );
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast(`Removed adjustment criterion ✓`);
        setItemToRemove(null);
        fetchAdjustments();
      } else {
        showToast(resJson.error || "Failed to remove criterion");
      }
    } catch (err: any) {
      showToast(err.message || "Error removing criterion");
    } finally {
      setRemovingItem(false);
    }
  };

  // Current list based on active dimension
  const currentList =
    activeDimension === "device"
      ? data?.adjustments?.devices || []
      : activeDimension === "location"
      ? data?.adjustments?.locations || []
      : activeDimension === "schedule"
      ? data?.adjustments?.schedules || []
      : data?.adjustments?.audiences || [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[300] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <Info className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Campaign Bid Adjustments
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Google Ads API v24
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Control how bids scale up or down across devices, geographic locations, ad schedules, and audiences.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => fetchAdjustments()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              Refresh
            </button>

            {activeDimension === "location" && data && !data.isPMax && (
              <button
                onClick={() => setIsAddLocationModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Location Adjustment
              </button>
            )}

            {activeDimension === "schedule" && data && !data.isPMax && (
              <button
                onClick={() => setIsAddScheduleModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Schedule Adjustment
              </button>
            )}
          </div>
        </div>

        {/* Campaign Selector Bar */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Campaign:</span>
            <select
              value={selectedCampaignId}
              onChange={e => setSelectedCampaignId(e.target.value)}
              className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Strategy & Type Pill */}
          {data && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                Type: <strong className="text-slate-900">{data.campaignType}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                Bidding: <strong className="text-slate-900">{data.biddingStrategyType.replace(/_/g, " ")}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Restriction & Smart Bidding Alert */}
      {data?.supportNotes?.limitationMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 ${
            data.isPMax
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {data.isPMax ? (
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <p className="font-bold">{data.isPMax ? "Performance Max Restriction" : "Automated Smart Bidding Notice"}</p>
            <p className="text-[11px] leading-relaxed opacity-90">{data.supportNotes.limitationMessage}</p>
          </div>
        </div>
      )}

      {/* 3. Dimension Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "device", label: "Devices", icon: Monitor, count: data?.adjustments?.devices?.length || 0 },
          { id: "location", label: "Locations", icon: MapPin, count: data?.adjustments?.locations?.length || 0 },
          { id: "schedule", label: "Ad Schedule", icon: Clock, count: data?.adjustments?.schedules?.length || 0 },
          { id: "audience", label: "Audiences", icon: Users, count: data?.adjustments?.audiences?.length || 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveDimension(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDimension === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>
              {tab.label} ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* 4. Adjustments List Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {activeDimension === "device"
                ? "Device Bid Adjustments"
                : activeDimension === "location"
                ? "Location Bid Adjustments"
                : activeDimension === "schedule"
                ? "Ad Schedule Bid Adjustments"
                : "Audience Bid Adjustments"}
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {currentList.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Loading bid adjustments from Google Ads API v24...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
              <Sliders className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">No {activeDimension} bid adjustments found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {data?.isPMax
                  ? "Traditional bid adjustments cannot be configured for Performance Max campaigns."
                  : activeDimension === "location"
                  ? "Target specific regions or cities with increased/decreased bid modifiers."
                  : activeDimension === "schedule"
                  ? "Add hourly or day-of-week schedule bid modifiers."
                  : "No specific adjustments have been applied to this dimension."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Target Dimension</th>
                  <th className="px-4 py-3.5">Bid Adjustment</th>
                  <th className="px-4 py-3.5">API Multiplier</th>
                  <th className="px-4 py-3.5">Criterion ID</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentList.map(item => {
                  const isPositive = item.bidModifierPercent > 0;
                  const isNegative = item.bidModifierPercent < 0 && item.bidModifierPercent > -100;
                  const isOptOutItem = item.bidModifierPercent <= -100 || item.bidModifier === 0.0;
                  const isZero = item.bidModifierPercent === 0;

                  return (
                    <tr key={item.resourceName} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          {item.dimension === "DEVICE" ? (
                            item.targetDetails?.deviceType === "MOBILE" ? (
                              <Smartphone className="h-4 w-4 text-blue-600" />
                            ) : item.targetDetails?.deviceType === "TABLET" ? (
                              <Tablet className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Monitor className="h-4 w-4 text-slate-600" />
                            )
                          ) : item.dimension === "LOCATION" ? (
                            <MapPin className="h-4 w-4 text-rose-500" />
                          ) : item.dimension === "AD_SCHEDULE" ? (
                            <Clock className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Users className="h-4 w-4 text-indigo-500" />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{item.targetName}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
                              {item.resourceName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isOptOutItem
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isPositive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isNegative
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isOptOutItem
                            ? "-100% (Opt Out)"
                            : isPositive
                            ? `+${item.bidModifierPercent}%`
                            : isNegative
                            ? `${item.bidModifierPercent}%`
                            : "0% (Unadjusted)"}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-mono font-semibold text-slate-800">
                        {item.bidModifier.toFixed(2)}x
                      </td>

                      <td className="px-4 py-4 font-mono text-slate-500 text-[11px]">
                        {item.criterionId}
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                          {item.status || "ENABLED"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right space-x-2">
                        {item.isMutable ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsOptOut(item.bidModifier === 0.0 || item.bidModifierPercent <= -100);
                                setEditPercent(item.bidModifierPercent <= -100 ? 0 : item.bidModifierPercent);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                            >
                              Edit Adjustment
                            </button>

                            {item.dimension !== "DEVICE" && (
                              <button
                                onClick={() => setItemToRemove(item)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove criterion"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Read-only (PMax)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Bid Adjustment Modal ────────────────────────────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit Bid Adjustment</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{editingItem.targetName}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Opt-out toggle (-100%) */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Opt-out of this dimension</p>
                  <p className="text-[10px] text-slate-500">Sets modifier to -100% (stops bidding completely)</p>
                </div>
                <input
                  type="checkbox"
                  checked={isOptOut}
                  onChange={e => setIsOptOut(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                />
              </div>

              {!isOptOut && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Bid Adjustment Percentage</label>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        editPercent > 0
                          ? "text-emerald-700 bg-emerald-50"
                          : editPercent < 0
                          ? "text-amber-700 bg-amber-50"
                          : "text-slate-700 bg-slate-100"
                      }`}
                    >
                      {editPercent >= 0 ? `+${editPercent}%` : `${editPercent}%`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={-90}
                    max={900}
                    step={5}
                    value={editPercent}
                    onChange={e => setEditPercent(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>-90% (0.10x)</span>
                    <span>0% (1.00x)</span>
                    <span>+900% (10.00x)</span>
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Direct Numeric Input (%):</label>
                    <input
                      type="number"
                      min={-90}
                      max={900}
                      value={editPercent}
                      onChange={e => setEditPercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-0.5">
                <p>
                  <strong>Resulting Multiplier:</strong>{" "}
                  <span className="font-mono text-slate-900 font-bold">
                    {isOptOut ? "0.00x (-100%)" : `${((100 + editPercent) / 100).toFixed(2)}x`}
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Target: {editingItem.dimension} · Resource: {editingItem.resourceName}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save Adjustment Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Location Adjustment Modal ────────────────────────────────────── */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Location Adjustment</h3>
                  <p className="text-[11px] text-slate-500">Target a region or city with a custom bid modifier</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLocationModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Geo Constant ID *</label>
                <select
                  value={newLocationGeoId}
                  onChange={e => setNewLocationGeoId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="1007788">Pune, Maharashtra, India (1007788)</option>
                  <option value="9062078">Mumbai, Maharashtra, India (9062078)</option>
                  <option value="1007768">Bengaluru, Karnataka, India (1007768)</option>
                  <option value="1007785">Delhi, India (1007785)</option>
                  <option value="2356">India (Country 2356)</option>
                  <option value="2840">United States (Country 2840)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Bid Adjustment (%)</label>
                  <span className="text-xs font-bold text-emerald-700">
                    {newLocationPercent >= 0 ? `+${newLocationPercent}%` : `${newLocationPercent}%`}
                  </span>
                </div>
                <input
                  type="number"
                  min={-90}
                  max={900}
                  value={newLocationPercent}
                  onChange={e => setNewLocationPercent(Number(e.target.value))}
                  placeholder="e.g. 20 for +20%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLocation}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {addingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Add Location Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Schedule Adjustment Modal ────────────────────────────────────── */}
      {isAddScheduleModalOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Schedule Adjustment</h3>
                  <p className="text-[11px] text-slate-500">Scale bids based on days or working hours</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddScheduleModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week *</label>
                <select
                  value={schedDay}
                  onChange={e => setSchedDay(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Hour (0-23)</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={schedStartHour}
                    onChange={e => setSchedStartHour(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Hour (1-24)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={schedEndHour}
                    onChange={e => setSchedEndHour(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Bid Adjustment (%)</label>
                  <span className="text-xs font-bold text-emerald-700">
                    {schedPercent >= 0 ? `+${schedPercent}%` : `${schedPercent}%`}
                  </span>
                </div>
                <input
                  type="number"
                  min={-90}
                  max={900}
                  value={schedPercent}
                  onChange={e => setSchedPercent(Number(e.target.value))}
                  placeholder="e.g. 15 for +15%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSchedule}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {addingSchedule ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Add Schedule Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Remove Confirmation Modal ────────────────────────────────────────── */}
      {itemToRemove && (
        <div className="fixed inset-0 z-[260] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Remove Bid Adjustment Criterion?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this criterion from the campaign in Google Ads API v24?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 space-y-1">
              <p>
                <span className="font-bold">Target:</span> {itemToRemove.targetName}
              </p>
              <p>
                <span className="font-bold">Dimension:</span> {itemToRemove.dimension}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveItem}
                disabled={removingItem}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {removingItem ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
