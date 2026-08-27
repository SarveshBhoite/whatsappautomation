"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  User,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Globe,
  Settings,
  Sparkles,
  Search,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Filter,
  MoreVertical,
  SlidersHorizontal,
  X,
  Radio,
  CalendarDays,
  Flame,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  RotateCw,
  ArrowUpDown,
  ShieldCheck,
  Send,
  Eye
} from "lucide-react";
import { AccountSwitcher } from "@/components/AccountSwitcher";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || "demo-org-123";
  }
  return "demo-org-123";
};

interface AppointmentItem {
  id: string;
  organizationId: string;
  conversationId?: string | null;
  customerPhone?: string | null;
  customerName: string;
  customerEmail?: string | null;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | string;
  googleAccountId?: string | null;
  googleCalendarConfig?: {
    id: string;
    googleEmail: string;
    calendarName?: string;
    selectedCalendarId?: string;
  } | null;
  googleCalendarId?: string | null;
  googleCalendarEventId?: string | null;
  googleMeetUrl?: string | null;
  googleMeetConferenceId?: string | null;
  googleEventHtmlLink?: string | null;
  googleSyncStatus?: "PENDING" | "SYNCED" | "FAILED" | "AUTH_REQUIRED" | string;
  googleSyncError?: string | null;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SummaryCounts {
  total: number;
  today: number;
  upcoming: number;
  completed: number;
  missed: number;
  cancelled: number;
  meetReady: number;
  needsAttention: number;
}

export default function AppointmentsPage() {
  // Data States
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<SummaryCounts>({
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    missed: 0,
    cancelled: 0,
    meetReady: 0,
    needsAttention: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1
  });

  // Google Accounts & Calendar states
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("ALL");
  const [targetConfigAccountId, setTargetConfigAccountId] = useState<string>("");
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("primary");
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [meetStatusFilter, setMeetStatusFilter] = useState<string>("ALL");
  const [activeKpiFilter, setActiveKpiFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("startTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Detail Drawer
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Modals & Action States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{ id: string; dateStr: string; timeStr: string; durationMins: number; title: string }>({
    id: "",
    dateStr: "",
    timeStr: "",
    durationMins: 30,
    title: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for manual creation
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    title: "AI Strategy & Consultation Meeting",
    description: "",
    dateStr: new Date().toISOString().split("T")[0],
    timeStr: "11:00",
    durationMins: 30
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(p => ({ ...p, page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Google Accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/google-calendar/accounts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0 && !targetConfigAccountId) {
          setTargetConfigAccountId(data.accounts[0].id);
          setSelectedCalendarId(data.accounts[0].selectedCalendarId || "primary");
        }
      }
    } catch (err) {
      console.error("Could not fetch calendar accounts:", err);
    }
  };

  const fetchCalendars = async (accId: string) => {
    if (!accId || accId === "ALL") return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/google-calendar/calendars?googleAccountId=${accId}`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setCalendars(data.calendars || []);
      }
    } catch (err) {
      console.error("Could not fetch calendars:", err);
    }
  };

  // Fetch Appointments from Backend
  const fetchAppointments = async (isBackground: boolean = false) => {
    try {
      if (!isBackground) setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy,
        sortOrder
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedAccountId && selectedAccountId !== "ALL") params.append("googleAccountId", selectedAccountId);
      if (dateFilter && dateFilter !== "ALL") params.append("dateFilter", dateFilter);
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);
      if (meetStatusFilter && meetStatusFilter !== "ALL") params.append("googleMeetStatus", meetStatusFilter);

      const res = await fetch(`${BACKEND_URL}/api/appointments?${params.toString()}`, {
        headers: { "x-organization-id": getOrgId() }
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        if (data.counts) setCounts(data.counts);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      if (!isBackground) console.error("Could not fetch appointments:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Initial Load & Real-time Auto-refresh Interval
  useEffect(() => {
    fetchAccounts();
    fetchAppointments(false);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_CALENDAR_CONNECTED") {
        fetchAccounts();
        fetchAppointments(false);
      }
    };
    window.addEventListener("message", handleMessage);

    // Refresh every 8s silently to update live meeting rooms & sync status
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 8000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, [pagination.page, pagination.pageSize, debouncedSearch, selectedAccountId, dateFilter, statusFilter, meetStatusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (targetConfigAccountId && targetConfigAccountId !== "ALL") {
      fetchCalendars(targetConfigAccountId);
    }
  }, [targetConfigAccountId]);

  // Copy Meet URL helper
  const handleCopyLink = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Connect Google Calendar OAuth
  const handleConnectGoogleCalendar = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/google-calendar/auth-url`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank", "width=600,height=700");
        }
      }
    } catch (err) {
      console.error("Error generating OAuth URL:", err);
    }
  };

  // Save Selected Google Calendar
  const handleSaveCalendarSelection = async () => {
    if (!targetConfigAccountId || !selectedCalendarId) return;
    try {
      setSavingCalendar(true);
      const calObj = calendars.find(c => c.id === selectedCalendarId);
      await fetch(`${BACKEND_URL}/api/google-calendar/select-calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          googleAccountId: targetConfigAccountId,
          calendarId: selectedCalendarId,
          calendarName: calObj?.summary || selectedCalendarId
        })
      });
      fetchAccounts();
      setShowConfigDrawer(false);
    } catch (err) {
      console.error("Failed to save calendar selection:", err);
    } finally {
      setSavingCalendar(false);
    }
  };

  // Create Appointment Handlers
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.dateStr || !formData.timeStr) return;

    try {
      setSubmitting(true);
      const startTime = new Date(`${formData.dateStr}T${formData.timeStr}:00`);
      const endTime = new Date(startTime.getTime() + formData.durationMins * 60 * 1000);

      const res = await fetch(`${BACKEND_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          title: formData.title,
          description: formData.description,
          startTime,
          endTime,
          googleAccountId: targetConfigAccountId && targetConfigAccountId !== "ALL" ? targetConfigAccountId : undefined,
          calendarId: selectedCalendarId || undefined
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          title: "AI Strategy & Consultation Meeting",
          description: "",
          dateStr: new Date().toISOString().split("T")[0],
          timeStr: "11:00",
          durationMins: 30
        });
        fetchAppointments(false);
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Reschedule Appointment Handler
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData.id || !rescheduleData.dateStr || !rescheduleData.timeStr) return;

    try {
      setSubmitting(true);
      const startTime = new Date(`${rescheduleData.dateStr}T${rescheduleData.timeStr}:00`);
      const endTime = new Date(startTime.getTime() + rescheduleData.durationMins * 60 * 1000);

      const res = await fetch(`${BACKEND_URL}/api/appointments/${rescheduleData.id}/reschedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          startTime,
          endTime,
          title: rescheduleData.title
        })
      });

      if (res.ok) {
        setShowRescheduleModal(false);
        if (selectedAppointment && selectedAppointment.id === rescheduleData.id) {
          const updated = await res.json();
          setSelectedAppointment(updated.appointment);
        }
        fetchAppointments(false);
      }
    } catch (err) {
      console.error("Error rescheduling appointment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Appointment Handler
  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment and delete the Google Calendar event?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": getOrgId() }
      });
      if (selectedAppointment?.id === id) setSelectedAppointment(null);
      fetchAppointments(false);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  // Retry Google Sync Handler
  const handleRetrySync = async (id: string) => {
    try {
      setSyncingId(id);
      const res = await fetch(`${BACKEND_URL}/api/appointments/${id}/google-sync`, {
        method: "POST",
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (selectedAppointment?.id === id) setSelectedAppointment(data.appointment);
      }
      fetchAppointments(false);
    } catch (err) {
      console.error("Error retrying sync:", err);
    } finally {
      setSyncingId(null);
    }
  };

  // Helper for Row State computation (Live, Missed, Upcoming, Completed)
  const getDerivedState = (appt: AppointmentItem) => {
    const now = new Date();
    const start = new Date(appt.startTime);
    const end = new Date(appt.endTime);

    if (appt.status === "CANCELLED") {
      return { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", isLive: false, isMissed: false };
    }
    if (appt.status === "COMPLETED") {
      return { label: "Completed", color: "bg-slate-100 text-slate-700 border-slate-200", isLive: false, isMissed: false };
    }
    if (now >= start && now <= end) {
      return { label: "LIVE NOW", color: "bg-emerald-500 text-white border-emerald-600 animate-pulse font-black", isLive: true, isMissed: false };
    }
    if (now > end) {
      return { label: "Missed", color: "bg-amber-50 text-amber-800 border-amber-200", isLive: false, isMissed: true };
    }
    if (start > now) {
      const diffMins = Math.floor((start.getTime() - now.getTime()) / (1000 * 60));
      if (diffMins <= 15) {
        return { label: `Starts in ${diffMins}m`, color: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold", isLive: false, isMissed: false };
      }
      return { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", isLive: false, isMissed: false };
    }
    return { label: appt.status || "Scheduled", color: "bg-slate-100 text-slate-700 border-slate-200", isLive: false, isMissed: false };
  };

  // Helper for Google Meet status badge
  const getMeetStatusBadge = (appt: AppointmentItem) => {
    if (appt.googleMeetUrl && appt.googleSyncStatus === "SYNCED") {
      return {
        label: "Ready",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
        canJoin: true
      };
    }
    if (appt.googleSyncStatus === "PENDING") {
      return {
        label: "Creating...",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500 animate-spin",
        canJoin: false
      };
    }
    if (appt.googleSyncStatus === "AUTH_REQUIRED") {
      return {
        label: "Reconnect",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        dotColor: "bg-purple-500",
        canJoin: false
      };
    }
    if (appt.googleSyncStatus === "FAILED") {
      return {
        label: "Failed",
        badgeColor: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-500",
        canJoin: false
      };
    }
    return {
      label: "Not Created",
      badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
      dotColor: "bg-slate-400",
      canJoin: false
    };
  };

  // Find Next Immediate Upcoming / Live Meeting
  const nextMeeting = useMemo(() => {
    const now = new Date();
    const active = appointments.filter(a => {
      if (a.status === "CANCELLED" || a.status === "COMPLETED") return false;
      const end = new Date(a.endTime);
      return end >= now;
    });
    // Sort nearest start time
    active.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return active[0] || null;
  }, [appointments]);

  // Quick KPI Click Filter Action
  const handleKpiClick = (kpiKey: string) => {
    setActiveKpiFilter(kpiKey);
    setPagination(p => ({ ...p, page: 1 }));
    if (kpiKey === "TOTAL") {
      setDateFilter("ALL");
      setStatusFilter("ALL");
      setMeetStatusFilter("ALL");
    } else if (kpiKey === "TODAY") {
      setDateFilter("today");
      setStatusFilter("ALL");
      setMeetStatusFilter("ALL");
    } else if (kpiKey === "UPCOMING") {
      setDateFilter("ALL");
      setStatusFilter("UPCOMING");
      setMeetStatusFilter("ALL");
    } else if (kpiKey === "COMPLETED") {
      setDateFilter("ALL");
      setStatusFilter("COMPLETED");
      setMeetStatusFilter("ALL");
    } else if (kpiKey === "MISSED") {
      setDateFilter("ALL");
      setStatusFilter("MISSED");
      setMeetStatusFilter("ALL");
    } else if (kpiKey === "CANCELLED") {
      setDateFilter("ALL");
      setStatusFilter("CANCELLED");
      setMeetStatusFilter("ALL");
    } else if (kpiKey === "MEET_READY") {
      setDateFilter("ALL");
      setStatusFilter("ALL");
      setMeetStatusFilter("READY");
    } else if (kpiKey === "NEEDS_ATTENTION") {
      setDateFilter("ALL");
      setStatusFilter("ALL");
      setMeetStatusFilter("FAILED");
    }
  };

  return (
    <div className="flex-1 bg-slate-50/70 text-slate-900 flex flex-col font-sans overflow-hidden min-h-screen">
      {/* 1. ENTERPRISE PAGE HEADER */}
      <header className="px-6 py-4 bg-white border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                Appointments &amp; Meeting Scheduler
              </h1>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Sparkles className="h-2.5 w-2.5 text-emerald-600" /> Google Calendar &amp; Meet Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage video consultations, calendar bookings, and automatic WhatsApp confirmations
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowConfigDrawer(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden md:inline">Calendar Sync Target</span>
          </button>

          <button
            type="button"
            onClick={() => fetchAppointments(false)}
            disabled={loading}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Appointments"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7 space-y-5 max-w-[1600px] w-full mx-auto">
        {/* 2. SUMMARY KPI STATS SECTION (CLICKABLE PILLS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { key: "TOTAL", label: "Total", count: counts.total, color: "text-slate-900", border: "border-slate-200" },
            { key: "TODAY", label: "Today", count: counts.today, color: "text-blue-600", border: "border-blue-200" },
            { key: "UPCOMING", label: "Upcoming", count: counts.upcoming, color: "text-emerald-600", border: "border-emerald-200" },
            { key: "COMPLETED", label: "Completed", count: counts.completed, color: "text-slate-600", border: "border-slate-200" },
            { key: "MISSED", label: "Missed", count: counts.missed, color: "text-amber-600", border: "border-amber-200" },
            { key: "CANCELLED", label: "Cancelled", count: counts.cancelled, color: "text-red-600", border: "border-red-200" },
            { key: "MEET_READY", label: "Meet Ready", count: counts.meetReady, color: "text-teal-600", border: "border-teal-200" },
            { key: "NEEDS_ATTENTION", label: "Needs Attention", count: counts.needsAttention, color: "text-rose-600", border: "border-rose-200" }
          ].map(kpi => (
            <button
              key={kpi.key}
              type="button"
              onClick={() => handleKpiClick(kpi.key)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs ${
                activeKpiFilter === kpi.key
                  ? "bg-white ring-2 ring-emerald-500 shadow-xs border-emerald-500"
                  : "bg-white hover:bg-slate-50/80 " + kpi.border
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                {kpi.label}
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-xl font-black ${kpi.color}`}>
                  {kpi.count}
                </span>
                {kpi.key === "NEEDS_ATTENTION" && kpi.count > 0 && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 3. INTELLIGENT NEXT MEETING BANNER */}
        {nextMeeting && (
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 z-10">
              <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-300 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    {new Date() >= new Date(nextMeeting.startTime) && new Date() <= new Date(nextMeeting.endTime)
                      ? "● LIVE NOW"
                      : "UPCOMING NEXT"}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-bold text-slate-200">
                    {new Date(nextMeeting.startTime).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {new Date(nextMeeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {nextMeeting.title}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <User className="h-3 w-3 text-emerald-400" />
                  <span>{nextMeeting.customerName}</span>
                  {nextMeeting.customerPhone && (
                    <span className="text-[11px] text-slate-400 font-mono">({nextMeeting.customerPhone})</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 z-10 w-full md:w-auto shrink-0">
              {nextMeeting.googleMeetUrl ? (
                <a
                  href={nextMeeting.googleMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Join Google Meet</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRetrySync(nextMeeting.id)}
                  className="flex-1 md:flex-initial px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Generate Meet Link</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedAppointment(nextMeeting)}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        )}

        {/* 4. DATA TABLE TOOLBAR & FILTERS */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, email, subject, ID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Google Account Selector */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={selectedAccountId}
                  onChange={(e) => {
                    setSelectedAccountId(e.target.value);
                    setPagination(p => ({ ...p, page: 1 }));
                  }}
                  className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Google Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.googleEmail}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setActiveKpiFilter("CUSTOM");
                    setPagination(p => ({ ...p, page: 1 }));
                  }}
                  className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="next_7_days">Next 7 Days</option>
                  <option value="past">Past Meetings</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setActiveKpiFilter("CUSTOM");
                    setPagination(p => ({ ...p, page: 1 }));
                  }}
                  className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="LIVE">Live Now</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="MISSED">Missed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Google Meet Filter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Video className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={meetStatusFilter}
                  onChange={(e) => {
                    setMeetStatusFilter(e.target.value);
                    setActiveKpiFilter("CUSTOM");
                    setPagination(p => ({ ...p, page: 1 }));
                  }}
                  className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Meet Statuses</option>
                  <option value="READY">● Ready</option>
                  <option value="PENDING">⏳ Creating...</option>
                  <option value="FAILED">⚠ Failed</option>
                  <option value="AUTH_REQUIRED">🔐 Reconnect</option>
                  <option value="NOT_CREATED">— Not Created</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(debouncedSearch || dateFilter !== "ALL" || statusFilter !== "ALL" || meetStatusFilter !== "ALL" || selectedAccountId !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("ALL");
                    setStatusFilter("ALL");
                    setMeetStatusFilter("ALL");
                    setSelectedAccountId("ALL");
                    setActiveKpiFilter("TOTAL");
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-all cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5. PRODUCTION-GRADE DATA TABLE */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          {/* Table View (Desktop & Tablet) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={appointments.length > 0 && selectedRowIds.size === appointments.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRowIds(new Set(appointments.map(a => a.id)));
                        } else {
                          setSelectedRowIds(new Set());
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 cursor-pointer select-none" onClick={() => {
                    setSortBy("startTime");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}>
                    <div className="flex items-center gap-1.5">
                      <span>Date &amp; Time</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject / Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Google Account</th>
                  <th className="py-3 px-4">Google Meet</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading && appointments.length === 0 ? (
                  // Skeleton Loading Rows
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4 text-center"><div className="h-4 w-4 bg-slate-200 rounded mx-auto" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-200 rounded mb-1" /><div className="h-3 w-16 bg-slate-100 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-200 rounded mb-1" /><div className="h-3 w-24 bg-slate-100 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-40 bg-slate-200 rounded mb-1" /><div className="h-3 w-20 bg-slate-100 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 rounded-full" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-6 w-24 bg-slate-200 rounded-xl" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                      <td className="py-4 px-4 text-right"><div className="h-6 w-8 bg-slate-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-500">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                        <CalendarIcon className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No appointments match your filters</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Try modifying search keywords or resetting filters above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => {
                    const startD = new Date(appt.startTime);
                    const formattedDate = startD.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short"
                    });
                    const formattedTime = startD.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const derived = getDerivedState(appt);
                    const meetState = getMeetStatusBadge(appt);
                    const isSelected = selectedRowIds.has(appt.id);

                    return (
                      <tr
                        key={appt.id}
                        onClick={() => setSelectedAppointment(appt)}
                        className={`hover:bg-slate-50/90 transition-colors cursor-pointer group ${
                          isSelected ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSet = new Set(selectedRowIds);
                              if (e.target.checked) newSet.add(appt.id);
                              else newSet.delete(appt.id);
                              setSelectedRowIds(newSet);
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-mono font-bold pl-5">
                            {formattedTime} <span className="text-[10px] text-slate-400 font-sans font-normal">({appt.timezone || 'IST'})</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] flex items-center justify-center shrink-0 border border-emerald-200">
                              {appt.customerName ? appt.customerName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 truncate max-w-[150px]">{appt.customerName}</div>
                              <div className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                                {appt.customerPhone || appt.customerEmail || "No contact"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Subject / Service */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-[200px]" title={appt.title}>
                            {appt.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>30 min session</span>
                            {appt.googleCalendarEventId && (
                              <span className="text-emerald-600 font-semibold font-mono">· Cal Synced</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${derived.color}`}>
                            {derived.isLive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
                            {derived.label}
                          </span>
                        </td>

                        {/* Google Account */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-xs text-slate-700 font-semibold truncate max-w-[140px]" title={appt.googleCalendarConfig?.googleEmail || "Primary Account"}>
                            {appt.googleCalendarConfig?.googleEmail || accounts[0]?.googleEmail || "Connected Account"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {appt.googleCalendarConfig?.calendarName || "Primary Calendar"}
                          </div>
                        </td>

                        {/* Google Meet Link Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1.5 ${meetState.badgeColor}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${meetState.dotColor}`} />
                              <span>{meetState.label}</span>
                            </span>

                            {appt.googleMeetUrl && (
                              <div className="flex items-center gap-1">
                                <a
                                  href={appt.googleMeetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all font-bold text-[10px] flex items-center gap-1"
                                  title="Join Google Meet"
                                >
                                  <Video className="h-3 w-3" />
                                  <span>Join</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(appt.googleMeetUrl!, appt.id)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all text-[10px]"
                                  title="Copy Meeting Link"
                                >
                                  {copiedId === appt.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            )}

                            {appt.googleSyncStatus === "FAILED" && (
                              <button
                                type="button"
                                onClick={() => handleRetrySync(appt.id)}
                                disabled={syncingId === appt.id}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 font-bold text-[10px] flex items-center gap-1"
                              >
                                <RotateCw className={`h-3 w-3 ${syncingId === appt.id ? "animate-spin" : ""}`} />
                                <span>Retry</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Source */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                            {appt.conversationId ? "AI WhatsApp" : "CRM Manual"}
                          </span>
                        </td>

                        {/* Actions Menu */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedAppointment(appt)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const st = new Date(appt.startTime);
                                setRescheduleData({
                                  id: appt.id,
                                  dateStr: st.toISOString().split("T")[0],
                                  timeStr: st.toTimeString().slice(0, 5),
                                  durationMins: 30,
                                  title: appt.title
                                });
                                setShowRescheduleModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Reschedule"
                            >
                              <CalendarDays className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 6. SERVER-SIDE PAGINATION CONTROLS */}
          <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span>Showing {appointments.length > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} appointments</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPagination(p => ({ ...p, pageSize: parseInt(e.target.value, 10), page: 1 }));
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold cursor-pointer ml-2"
              >
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="px-3 py-1 bg-slate-100 rounded-xl font-bold text-slate-800 text-xs">
                Page {pagination.page} of {pagination.totalPages}
              </div>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 7. SLIDE-OVER APPOINTMENT DETAIL DRAWER */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setSelectedAppointment(null)} />
          
          <div className="relative w-full max-w-lg bg-white shadow-2xl z-10 flex flex-col h-full overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getDerivedState(selectedAppointment).color}`}>
                    {getDerivedState(selectedAppointment).label}
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {selectedAppointment.id.slice(0, 8)}</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                  {selectedAppointment.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body Details */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Meeting Room CTA Box */}
              {selectedAppointment.googleMeetUrl ? (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <Video className="h-4 w-4 text-emerald-600" />
                      <span>Google Meet Conference Active</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-md">
                      SYNCED
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2 font-mono text-emerald-800 text-[11px]">
                    <span className="truncate select-all">{selectedAppointment.googleMeetUrl}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(selectedAppointment.googleMeetUrl!, selectedAppointment.id)}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-800 font-bold shrink-0 text-[10px]"
                    >
                      {copiedId === selectedAppointment.id ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <a
                    href={selectedAppointment.googleMeetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs text-xs"
                  >
                    <Video className="h-4 w-4" />
                    <span>Join Google Meet Room</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-900">
                    <span className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-amber-600" /> Google Meet Not Generated</span>
                    <span className="text-[10px] uppercase font-bold text-amber-700">{selectedAppointment.googleSyncStatus || 'PENDING'}</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    {selectedAppointment.googleSyncError || "Meeting URL has not been generated or synchronized with Google Calendar yet."}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRetrySync(selectedAppointment.id)}
                    disabled={syncingId === selectedAppointment.id}
                    className="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${syncingId === selectedAppointment.id ? "animate-spin" : ""}`} />
                    <span>Generate &amp; Sync Google Meet</span>
                  </button>
                </div>
              )}

              {/* Customer Metadata Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Customer Name</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedAppointment.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Phone Number</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedAppointment.customerPhone || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Email Address</span>
                    <span className="font-mono text-slate-700 truncate block">{selectedAppointment.customerEmail || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Source Channel</span>
                    <span className="font-semibold text-emerald-700">{selectedAppointment.conversationId ? "AI WhatsApp Agent" : "Manual Dashboard"}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Metadata */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Schedule &amp; Calendar</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Date &amp; Start Time</span>
                    <span className="font-bold text-slate-900">
                      {new Date(selectedAppointment.startTime).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} at {new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">End Time &amp; Duration</span>
                    <span className="font-bold text-slate-900">
                      {new Date(selectedAppointment.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (30 mins)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Target Timezone</span>
                    <span className="font-mono text-slate-700">{selectedAppointment.timezone || "Asia/Kolkata"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Google Account</span>
                    <span className="font-mono text-slate-700 truncate block">{selectedAppointment.googleCalendarConfig?.googleEmail || "Default Org Account"}</span>
                  </div>
                </div>
              </div>

              {/* Description / Notes */}
              {selectedAppointment.description && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes &amp; Topic</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedAppointment.description}</p>
                </div>
              )}
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCancelAppointment(selectedAppointment.id)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Cancel Meeting</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const st = new Date(selectedAppointment.startTime);
                  setRescheduleData({
                    id: selectedAppointment.id,
                    dateStr: st.toISOString().split("T")[0],
                    timeStr: st.toTimeString().slice(0, 5),
                    durationMins: 30,
                    title: selectedAppointment.title
                  });
                  setShowRescheduleModal(true);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Reschedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. GOOGLE CALENDAR CONFIG TARGET MODAL / DRAWER */}
      {showConfigDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowConfigDrawer(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Google Calendar Sync Configuration</h3>
                  <p className="text-[11px] text-slate-500">Select target Google account and calendar for automated bookings</p>
                </div>
              </div>
              <button onClick={() => setShowConfigDrawer(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-600">No Google Calendar accounts linked yet.</p>
                <button
                  type="button"
                  onClick={handleConnectGoogleCalendar}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Connect Google Account
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Google Account</label>
                  <AccountSwitcher
                    title="Select Google Account"
                    theme="blue"
                    className="w-full"
                    accounts={accounts.map((acc) => ({
                      id: acc.id,
                      label: acc.googleEmail,
                      sublabel: `Calendar: ${acc.calendarName || 'Primary'}`,
                      isDefault: acc.isDefault,
                      isActive: acc.isActive,
                      type: "google"
                    }))}
                    selectedAccountId={targetConfigAccountId}
                    onSelectAccount={(accId) => setTargetConfigAccountId(accId)}
                    onAddNewAccount={handleConnectGoogleCalendar}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Calendar</label>
                  <select
                    value={selectedCalendarId}
                    onChange={(e) => setSelectedCalendarId(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-semibold text-slate-800"
                  >
                    {calendars.length === 0 ? (
                      <option value="primary">Primary Calendar</option>
                    ) : (
                      calendars.map(cal => (
                        <option key={cal.id} value={cal.id}>
                          {cal.summary || cal.id} {cal.primary ? "(Primary)" : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigDrawer(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCalendarSelection}
                    disabled={savingCalendar}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingCalendar ? "Saving..." : "Save Configuration"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. MANUAL APPOINTMENT CREATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Book New Appointment</h3>
                  <p className="text-[11px] text-slate-500">Auto-generates Google Calendar event and verified Meet link</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+91 93251 74465"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Appointment Subject / Topic</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. SEO &amp; Next.js Web App Consultation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateStr}
                    onChange={(e) => setFormData({ ...formData, dateStr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.timeStr}
                    onChange={(e) => setFormData({ ...formData, timeStr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration</label>
                  <select
                    value={formData.durationMins}
                    onChange={(e) => setFormData({ ...formData, durationMins: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-900"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating Meet &amp; Booking...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Confirm &amp; Generate Meet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowRescheduleModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Reschedule Appointment</h3>
                  <p className="text-[11px] text-slate-500">Updates the Google Calendar event automatically</p>
                </div>
              </div>
              <button onClick={() => setShowRescheduleModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleData.dateStr}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, dateStr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Time *</label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.timeStr}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, timeStr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
