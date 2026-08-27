"use client";

import React, { useState, useEffect } from "react";
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
  Check
} from "lucide-react";
import { AccountSwitcher } from "@/components/AccountSwitcher";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || "demo-org-123";
  }
  return "demo-org-123";
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("primary");
  const [savingCalendar, setSavingCalendar] = useState(false);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    title: "AI Consultation & Strategy Meeting",
    description: "",
    dateStr: new Date().toISOString().split("T")[0],
    timeStr: "11:00",
    durationMins: 30
  });

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/google-calendar/accounts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0 && !selectedAccountId) {
          setSelectedAccountId(data.accounts[0].id);
          setSelectedCalendarId(data.accounts[0].selectedCalendarId || "primary");
        }
      }
    } catch (err) {
      console.error("Could not fetch calendar accounts:", err);
    }
  };

  const fetchCalendars = async (accId: string) => {
    if (!accId) return;
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

  const fetchAppointments = async (isBackground: boolean = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/appointments`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      if (!isBackground) {
        console.error("Could not fetch appointments:", err);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchAppointments(false);

    // Listen for OAuth completion message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_CALENDAR_CONNECTED") {
        fetchAccounts();
        fetchAppointments(false);
      }
    };
    window.addEventListener("message", handleMessage);

    // Auto-refresh interval (every 8s) to ensure instant display of AI booked meetings
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 8000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchCalendars(selectedAccountId);
    }
  }, [selectedAccountId]);

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

  const handleSaveCalendarSelection = async () => {
    if (!selectedAccountId || !selectedCalendarId) return;
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
          googleAccountId: selectedAccountId,
          calendarId: selectedCalendarId,
          calendarName: calObj?.summary || selectedCalendarId
        })
      });
      fetchAccounts();
    } catch (err) {
      console.error("Failed to save calendar selection:", err);
    } finally {
      setSavingCalendar(false);
    }
  };

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
          googleAccountId: selectedAccountId || undefined,
          calendarId: selectedCalendarId || undefined
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          title: "AI Consultation & Strategy Meeting",
          description: "",
          dateStr: new Date().toISOString().split("T")[0],
          timeStr: "11:00",
          durationMins: 30
        });
        fetchAppointments();
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment and remove the Google Calendar event?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": getOrgId() }
      });
      fetchAppointments();
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  const handleRetrySync = async (id: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/appointments/${id}/google-sync`, {
        method: "POST",
        headers: { "x-organization-id": getOrgId() }
      });
      fetchAppointments();
    } catch (err) {
      console.error("Error retrying sync:", err);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "RESCHEDULED" | "CANCELLED">("ALL");

  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch = 
      appt.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.customerPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || appt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const confirmedCount = appointments.filter(a => a.status === "CONFIRMED").length;
  const meetCount = appointments.filter(a => !!a.googleMeetUrl).length;

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Header Bar matching Templates & Bulk style */}
      <header className="px-6 md:px-8 py-4 bg-white border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                Appointments &amp; Meeting Scheduler
              </h1>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-emerald-600" /> Google Meet Sync
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage video consultations, calendar bookings, and automatic WhatsApp confirmations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchAppointments(false)}
            disabled={loading}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Appointments"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{appointments.length}</h3>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Meetings</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{confirmedCount}</h3>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Google Meets</p>
              <h3 className="text-2xl font-black text-teal-600 mt-0.5">{meetCount}</h3>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Video className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calendar Engine</p>
              <h3 className="text-sm font-black text-blue-600 mt-1 truncate max-w-[140px]">
                {accounts.length > 0 ? (accounts[0].googleEmail?.split('@')[0] || "Connected") : "Not Connected"}
              </h3>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Google Calendar Connection Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-7 shadow-xs">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            
            {/* Left Info Section */}
            <div className="flex items-start gap-4 max-w-lg">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                <Globe className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    Google Calendar Target Sync
                  </h3>
                  <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/90 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <Sparkles className="h-3 w-3 text-blue-600" /> Auto-Meeting Generator
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every new customer consultation booked via WhatsApp or manually will automatically create Google Calendar events with instant Google Meet video links.
                </p>
              </div>
            </div>

            {/* Right Controls Section */}
            <div className="w-full xl:w-auto">
              {accounts.length === 0 ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
                  <p className="text-xs text-slate-600 font-medium">No Google Calendar accounts linked yet.</p>
                  <button
                    type="button"
                    onClick={handleConnectGoogleCalendar}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer h-10 shrink-0"
                  >
                    <Plus className="h-4 w-4" /> Connect Google Account
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                  {/* Account Selector Field */}
                  <div className="md:col-span-5 space-y-1.5 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Google Account
                    </label>
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
                      selectedAccountId={selectedAccountId}
                      onSelectAccount={(accId) => setSelectedAccountId(accId)}
                      onAddNewAccount={handleConnectGoogleCalendar}
                    />
                  </div>

                  {/* Calendar Dropdown Field */}
                  <div className="md:col-span-4 space-y-1.5 min-w-[180px]">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Target Calendar</span>
                      {calendars.length > 0 && (
                        <span className="text-slate-400 lowercase font-mono">({calendars.length} found)</span>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={selectedCalendarId}
                        onChange={(e) => setSelectedCalendarId(e.target.value)}
                        className="w-full h-[44px] bg-white border border-slate-200/90 rounded-2xl px-3.5 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer truncate"
                      >
                        {calendars.length === 0 ? (
                          <option value="primary">Primary Calendar</option>
                        ) : (
                          calendars.map((cal) => (
                            <option key={cal.id} value={cal.id}>
                              {cal.summary || cal.id} {cal.primary ? "(Primary)" : ""}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="md:col-span-3 min-w-[140px]">
                    <button
                      type="button"
                      onClick={handleSaveCalendarSelection}
                      disabled={savingCalendar}
                      className="w-full h-[44px] px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {savingCalendar ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400 shrink-0" />
                          <span className="whitespace-nowrap">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span className="whitespace-nowrap font-bold">Save Selection</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            {(["ALL", "CONFIRMED", "RESCHEDULED", "CANCELLED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st === "ALL" ? "All Bookings" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Appointments List Grid */}
        <div className="space-y-4">
          {loading && appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/90 rounded-3xl space-y-3">
              <div className="h-9 w-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading appointments &amp; Google calendar syncs...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-500 shadow-2xs space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CalendarIcon className="h-7 w-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {searchQuery || statusFilter !== "ALL" ? "No matching appointments found" : "No appointments scheduled yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery || statusFilter !== "ALL" 
                  ? "Try clearing your search query or switching your status filter tab above."
                  : "Book a new consultation above, or your WhatsApp AI Agent will automatically book meetings when leads ask in chat."}
              </p>
              {(searchQuery || statusFilter !== "ALL") && (
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer pt-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAppointments.map((appt) => {
                const startD = new Date(appt.startTime);
                const formattedDate = startD.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });
                const formattedTime = startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div 
                    key={appt.id} 
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 space-y-4"
                  >
                    <div className="space-y-3.5">
                      {/* Top Bar Status & Actions */}
                      <div className="flex justify-between items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                          appt.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          appt.status === "RESCHEDULED" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {appt.status}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                            title="Cancel Appointment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Appointment Title & Lead Info */}
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                          {appt.title}
                        </h3>
                        
                        <div className="mt-2.5 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-[10px] font-bold">
                              {appt.customerName?.charAt(0) || "U"}
                            </div>
                            <span className="font-bold text-slate-900 truncate">{appt.customerName}</span>
                            {appt.customerPhone && (
                              <span className="text-[11px] text-slate-500 font-mono">({appt.customerPhone})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-600 pl-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800">{formattedDate}</span>
                            <span className="text-slate-400 font-medium">·</span>
                            <span className="font-bold text-emerald-700">{formattedTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Google Integration Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                          appt.googleCalendarEventId 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          <CalendarIcon className="h-3 w-3" />
                          <span>Calendar {appt.googleCalendarEventId ? "✓ Synced" : "Pending"}</span>
                        </span>

                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                          appt.googleMeetUrl 
                            ? "bg-teal-50 text-teal-700 border border-teal-200" 
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          <Video className="h-3 w-3" />
                          <span>Meet {appt.googleMeetUrl ? "✓ Generated" : "Creating..."}</span>
                        </span>
                      </div>

                      {/* Google Meet Room URL Box */}
                      {appt.googleMeetUrl && (
                        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Video className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                            <span className="text-[11px] font-mono font-medium text-slate-700 truncate select-all">
                              {appt.googleMeetUrl}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(appt.googleMeetUrl);
                              alert("Google Meet link copied to clipboard!");
                            }}
                            className="text-[10px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg border border-teal-200 shrink-0 cursor-pointer transition-all"
                            title="Copy Meeting Link"
                          >
                            Copy Link
                          </button>
                        </div>
                      )}

                      {appt.googleSyncStatus === "FAILED" && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl flex items-center justify-between">
                          <span className="font-medium">Calendar sync encountered an error</span>
                          <button
                            onClick={() => handleRetrySync(appt.id)}
                            className="underline text-[11px] font-bold cursor-pointer hover:text-red-900"
                          >
                            Retry Sync
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Primary Actions Button */}
                    <div className="pt-1">
                      {appt.googleMeetUrl ? (
                        <a
                          href={appt.googleMeetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <Video className="h-4 w-4" />
                          <span>Join Google Meet</span>
                          <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-80" />
                        </a>
                      ) : appt.googleEventHtmlLink ? (
                        <a
                          href={appt.googleEventHtmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 border border-slate-200"
                        >
                          <CalendarIcon className="h-4 w-4" />
                          <span>View Calendar Event</span>
                          <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-80" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAppointment} className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-7 max-w-md w-full space-y-4 shadow-xl animate-fadeIn text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Book New Consultation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">WhatsApp Phone</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dateStr}
                    onChange={(e) => setFormData({ ...formData, dateStr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.timeStr}
                    onChange={(e) => setFormData({ ...formData, timeStr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Duration</label>
                  <select
                    value={formData.durationMins}
                    onChange={(e) => setFormData({ ...formData, durationMins: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-xs"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Creating Google Meet..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
