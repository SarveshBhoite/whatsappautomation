"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Calendar,
  Plus,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader2,
  X,
  Info,
  ShieldAlert,
  ChevronDown
} from "lucide-react";

export type DayOfWeekEnum =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type MinuteOfHourEnum = "ZERO" | "FIFTEEN" | "THIRTY" | "FORTY_FIVE";

export interface AdScheduleItem {
  resourceName: string;
  criterionId: string;
  dayOfWeek: DayOfWeekEnum;
  startHour: number;
  startMinute: MinuteOfHourEnum;
  endHour: number;
  endMinute: MinuteOfHourEnum;
  startTimeFormatted: string;
  endTimeFormatted: string;
  status: string;
  bidModifier?: number;
  bidModifierPercent?: number;
  campaignId: string;
  campaignName: string;
  isMutable: boolean;
}

export interface CampaignAdSchedulesData {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportsAdSchedule: boolean;
  limitationMessage?: string;
  schedules: AdScheduleItem[];
  total: number;
}

interface CampaignItem {
  id: string;
  name: string;
  resourceName?: string;
  campaignType?: string;
  advertisingChannelType?: string;
}

interface GoogleAdsAdScheduleSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignItem[];
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DAYS_OF_WEEK: { label: string; value: DayOfWeekEnum; short: string }[] = [
  { label: "Monday", value: "MONDAY", short: "Mon" },
  { label: "Tuesday", value: "TUESDAY", short: "Tue" },
  { label: "Wednesday", value: "WEDNESDAY", short: "Wed" },
  { label: "Thursday", value: "THURSDAY", short: "Thu" },
  { label: "Friday", value: "FRIDAY", short: "Fri" },
  { label: "Saturday", value: "SATURDAY", short: "Sat" },
  { label: "Sunday", value: "SUNDAY", short: "Sun" },
];

const MINUTE_OPTIONS: { label: string; value: MinuteOfHourEnum }[] = [
  { label: "00", value: "ZERO" },
  { label: "15", value: "FIFTEEN" },
  { label: "30", value: "THIRTY" },
  { label: "45", value: "FORTY_FIVE" },
];

export function GoogleAdsAdScheduleSection({
  customerId,
  orgId,
  campaigns = []
}: GoogleAdsAdScheduleSectionProps) {
  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // Selected Campaign State
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [data, setData] = useState<CampaignAdSchedulesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter State
  const [dayFilter, setDayFilter] = useState<string>("ALL");

  // Create Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDay, setNewDay] = useState<DayOfWeekEnum>("MONDAY");
  const [newStartHour, setNewStartHour] = useState<number>(9);
  const [newStartMinute, setNewStartMinute] = useState<MinuteOfHourEnum>("ZERO");
  const [newEndHour, setNewEndHour] = useState<number>(18);
  const [newEndMinute, setNewEndMinute] = useState<MinuteOfHourEnum>("ZERO");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AdScheduleItem | null>(null);
  const [editDay, setEditDay] = useState<DayOfWeekEnum>("MONDAY");
  const [editStartHour, setEditStartHour] = useState<number>(9);
  const [editStartMinute, setEditStartMinute] = useState<MinuteOfHourEnum>("ZERO");
  const [editEndHour, setEditEndHour] = useState<number>(18);
  const [editEndMinute, setEditEndMinute] = useState<MinuteOfHourEnum>("ZERO");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<AdScheduleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize selected campaign
  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch Schedules from API v24
  const fetchSchedules = useCallback(async () => {
    if (!cleanCid || !selectedCampaignId) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `${BACKEND}/api/ads/ad-schedules?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cleanCid)}&campaignId=${encodeURIComponent(selectedCampaignId)}`
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      setData(json.data);
    } catch (err: any) {
      console.error("[GoogleAdsAdScheduleSection] fetch error:", err);
      setErrorMsg(err.message || "Failed to load campaign ad schedules.");
    } finally {
      setLoading(false);
    }
  }, [cleanCid, orgId, selectedCampaignId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Handle Add Schedule Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) return;

    setIsSubmittingAdd(true);
    setAddModalError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/ad-schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: cleanCid,
          campaignId: selectedCampaignId,
          dayOfWeek: newDay,
          startHour: newStartHour,
          startMinute: newStartMinute,
          endHour: newEndHour,
          endMinute: newEndMinute
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create ad schedule");
      }

      showToast(`Ad schedule for ${newDay} created successfully ✓`);
      setIsAddModalOpen(false);
      fetchSchedules();
    } catch (err: any) {
      setAddModalError(err.message || "Failed to create ad schedule.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Edit Schedule Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !selectedCampaignId) return;

    setIsSubmittingEdit(true);
    setEditModalError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/ad-schedules`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: cleanCid,
          resourceName: editingItem.resourceName,
          campaignId: selectedCampaignId,
          dayOfWeek: editDay,
          startHour: editStartHour,
          startMinute: editStartMinute,
          endHour: editEndHour,
          endMinute: editEndMinute
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update ad schedule");
      }

      showToast("Ad schedule updated successfully ✓");
      setEditingItem(null);
      fetchSchedules();
    } catch (err: any) {
      setEditModalError(err.message || "Failed to update ad schedule.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Schedule
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${BACKEND}/api/ads/ad-schedules`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: cleanCid,
          resourceName: deletingItem.resourceName
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to remove ad schedule");
      }

      showToast("Ad schedule removed successfully ✓");
      setDeletingItem(null);
      fetchSchedules();
    } catch (err: any) {
      showToast(`Error removing schedule: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Modal with selected schedule details
  const openEditModal = (item: AdScheduleItem) => {
    setEditingItem(item);
    setEditDay(item.dayOfWeek);
    setEditStartHour(item.startHour);
    setEditStartMinute(item.startMinute);
    setEditEndHour(item.endHour);
    setEditEndMinute(item.endMinute);
    setEditModalError(null);
  };

  // Filtered schedules
  const displayedSchedules = (data?.schedules || []).filter(s => {
    if (dayFilter !== "ALL" && s.dayOfWeek !== dayFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 animate-in fade-in">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Campaign Ad Schedule Management</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              API v24
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Specify the exact days of the week and hours of the day when your campaign ads are eligible to serve. If no schedule criteria are added, ads run 24/7.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {data?.supportsAdSchedule && (
            <button
              onClick={() => {
                setAddModalError(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Schedule
            </button>
          )}

          <button
            onClick={fetchSchedules}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh Ad Schedules"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Campaign Selector & Day Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Campaign
          </label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.campaignType ? `(${c.campaignType})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Filter Day of Week
          </label>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Days</option>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Status / Limitation
          </label>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
            {data?.supportsAdSchedule ? (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                Custom Schedules Supported
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                Continuous AI Serving
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PMax Limitation Notice */}
      {data && !data.supportsAdSchedule && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Campaign Ad Schedule Restricted</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              {data.limitationMessage || "This campaign type does not support manual ad schedules in Google Ads API v24."}
            </p>
          </div>
        </div>
      )}

      {/* Schedules Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-xs font-medium">Fetching Google Ads campaign ad schedules...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">Error loading schedules</p>
            <p className="text-xs text-slate-500 mt-1">{errorMsg}</p>
            <button
              onClick={fetchSchedules}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : displayedSchedules.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Clock className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No ad schedule criteria active</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {data?.supportsAdSchedule
                ? "This campaign currently runs 24 hours a day, 7 days a week. Add specific serving hours above to restrict delivery to business hours or high-converting time slots."
                : "Continuous serving active."}
            </p>
            {data?.supportsAdSchedule && (
              <button
                onClick={() => {
                  setAddModalError(null);
                  setIsAddModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add First Schedule
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Day of Week</th>
                  <th className="p-4">Start Time</th>
                  <th className="p-4">End Time</th>
                  <th className="p-4">Daily Window</th>
                  <th className="p-4">Serving Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedSchedules.map((s) => (
                  <tr key={s.resourceName} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-4 font-bold text-slate-900">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                        {s.dayOfWeek}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-900">
                      {s.startTimeFormatted}
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-900">
                      {s.endTimeFormatted}
                    </td>
                    <td className="p-4 text-slate-600">
                      {s.startTimeFormatted} – {s.endTimeFormatted}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          disabled={!s.isMutable}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30"
                          title="Edit Time Boundaries"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(s)}
                          disabled={!s.isMutable}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-30"
                          title="Delete Schedule"
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

      {/* Add Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Campaign Ad Schedule</h3>
                  <p className="text-xs text-slate-500">Define an active serving interval</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 py-4 text-xs">
              {addModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{addModalError}</span>
                </div>
              )}

              {/* Day of Week */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Day of Week</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value as DayOfWeekEnum)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Hour</label>
                  <select
                    value={newStartHour}
                    onChange={(e) => setNewStartHour(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00 ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Minute</label>
                  <select
                    value={newStartMinute}
                    onChange={(e) => setNewStartMinute(e.target.value as MinuteOfHourEnum)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {MINUTE_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        :{m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* End Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Hour</label>
                  <select
                    value={newEndHour}
                    onChange={(e) => setNewEndHour(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {Array.from({ length: 25 }).map((_, h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00 ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : h === 24 ? "Midnight (24:00)" : `${h - 12} PM`})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Minute</label>
                  <select
                    value={newEndMinute}
                    onChange={(e) => setNewEndMinute(e.target.value as MinuteOfHourEnum)}
                    disabled={newEndHour === 24}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    {MINUTE_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        :{m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[11px] text-slate-500 font-mono">
                  Serving Preview: <strong>{newDay}</strong> from{" "}
                  <strong>{String(newStartHour).padStart(2, "0")}:{newStartMinute === "ZERO" ? "00" : newStartMinute === "FIFTEEN" ? "15" : newStartMinute === "THIRTY" ? "30" : "45"}</strong> to{" "}
                  <strong>{String(newEndHour).padStart(2, "0")}:{newEndHour === 24 ? "00" : newEndMinute === "ZERO" ? "00" : newEndMinute === "FIFTEEN" ? "15" : newEndMinute === "THIRTY" ? "30" : "45"}</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Ad Schedule</h3>
                  <p className="text-xs text-slate-500">Update day of week or serving hours</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 py-4 text-xs">
              {editModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{editModalError}</span>
                </div>
              )}

              {/* Day of Week */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Day of Week</label>
                <select
                  value={editDay}
                  onChange={(e) => setEditDay(e.target.value as DayOfWeekEnum)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Hour</label>
                  <select
                    value={editStartHour}
                    onChange={(e) => setEditStartHour(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00 ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Minute</label>
                  <select
                    value={editStartMinute}
                    onChange={(e) => setEditStartMinute(e.target.value as MinuteOfHourEnum)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {MINUTE_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        :{m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* End Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Hour</label>
                  <select
                    value={editEndHour}
                    onChange={(e) => setEditEndHour(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {Array.from({ length: 25 }).map((_, h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00 ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : h === 24 ? "Midnight (24:00)" : `${h - 12} PM`})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Minute</label>
                  <select
                    value={editEndMinute}
                    onChange={(e) => setEditEndMinute(e.target.value as MinuteOfHourEnum)}
                    disabled={editEndHour === 24}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    {MINUTE_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        :{m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Ad Schedule</h3>
                <p className="text-xs text-slate-500">Confirm deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to remove the schedule for <strong>{deletingItem.dayOfWeek}</strong> ({deletingItem.startTimeFormatted} – {deletingItem.endTimeFormatted}) from Google Ads?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
