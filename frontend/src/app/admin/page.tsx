"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Plus, Shield, Check, X, Copy, RefreshCw, Layers, Users, Search,
  Edit3, Trash2, Power, CheckCircle2, AlertCircle, ArrowLeft, Key, Lock, Mail,
  ExternalLink, Sparkles, CreditCard, CalendarCheck, Clock
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface SubscriptionInfo {
  id: string;
  planName: string;
  billingCycle: string;
  paymentMode?: string;
  amountPaid: number;
  status: string;
  startDate: string;
  endDate: string;
  emiMonthsPaid?: number;
  emiTotalMonths?: number;
  emiMonthlyAmount?: number;
  nextEmiDueDate?: string | null;
}

interface Organization {
  id: string;
  name: string;
  enabledModules: string[];
  status: string;
  users: User[];
  subscriptions?: SubscriptionInfo[];
  waConfig?: { phoneNumberId: string; wabaId: string } | null;
  gmbConfig?: { locationId: string; accountId: string } | null;
  gmailConfig?: { emailAddress: string } | null;
  linkedInConfig?: { memberName: string; companyName: string } | null;
}

const MODULE_CATEGORIES = [
  {
    category: "Messaging & AI Automation",
    modules: [
      { key: "whatsapp", label: "WhatsApp Automation & Chats", desc: "Official WABA, broadcasts & inbox" },
      { key: "instagram", label: "Instagram Direct Messaging", desc: "DM automation & comment replies" },
      { key: "flows", label: "Interactive Flow Builder", desc: "No-code chatbot flow visualizer" },
      { key: "ai_agent", label: "AI Agent Studio", desc: "Autonomous AI knowledge base & support agent" },
    ]
  },
  {
    category: "Google Ecosystem & Reviews",
    modules: [
      { key: "gmb", label: "Google Business Profile", desc: "Location sync & local SEO post manager" },
      { key: "reviews", label: "Google Reviews & AI Reply", desc: "Review sentiment analysis & auto-replies" },
      { key: "gmail", label: "Gmail Auto-Reply Engine", desc: "Email thread tracking & smart responder" },
      { key: "youtube", label: "YouTube Video Comments", desc: "Channel comments sync & automated replies" },
    ]
  },
  {
    category: "Paid Advertising & Growth Suite",
    modules: [
      { key: "google_ads", label: "Google Ads Campaign Manager", desc: "Search, PMax, Display & Video ad wizards" },
      { key: "meta_ads", label: "Meta Ads Manager", desc: "Facebook & Instagram campaign launcher" },
      { key: "linkedin", label: "LinkedIn Scheduler", desc: "Company & member post publisher" },
      { key: "tools", label: "Growth Tools Suite", desc: "Marketing utility apps & SEO toolkits" },
    ]
  }
];

const ALL_MODULE_KEYS = MODULE_CATEGORIES.flatMap(c => c.modules.map(m => m.key));
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");

  // Onboard Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("admin123");
  const [newPaymentMode, setNewPaymentMode] = useState<"ONE_TIME" | "EMI">("ONE_TIME");
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULE_KEYS);
  const [creating, setCreating] = useState(false);

  // Edit Org Modal State
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editModules, setEditModules] = useState<string[]>([]);
  const [editPaymentMode, setEditPaymentMode] = useState<"ONE_TIME" | "EMI">("ONE_TIME");
  const [editEmiMonthsPaid, setEditEmiMonthsPaid] = useState<number>(2);
  const [editNextEmiDueDate, setEditNextEmiDueDate] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("user_role");
      if (role !== "super_admin") {
        router.push("/login");
      }
    }
  }, [router]);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations`);
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !newAdminEmail.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName.trim(),
          adminEmail: newAdminEmail.trim(),
          adminName: newAdminName.trim() || "Client Admin",
          adminPassword: newAdminPassword.trim() || "admin123",
          enabledModules: selectedModules,
          paymentMode: newPaymentMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create client organization");
      }

      showToast(`✓ Organization "${newOrgName}" onboarded with ${newPaymentMode === "EMI" ? "EMI Basis (₹3,000/mo)" : "1-Year Upfront (₹14,999)"}!`);
      setNewOrgName("");
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminPassword("admin123");
      setNewPaymentMode("ONE_TIME");
      setShowCreateModal(false);
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setEditName(org.name);
    setEditStatus(org.status || "ACTIVE");
    setEditModules(org.enabledModules || []);

    const sub = org.subscriptions?.[0];
    if (sub) {
      setEditPaymentMode((sub.paymentMode as any) || "ONE_TIME");
      setEditEmiMonthsPaid(sub.emiMonthsPaid ?? (sub.paymentMode === "EMI" ? 2 : 12));
      setEditNextEmiDueDate(sub.nextEmiDueDate ? sub.nextEmiDueDate.split("T")[0] : "");
    } else {
      setEditPaymentMode("ONE_TIME");
      setEditEmiMonthsPaid(12);
      setEditNextEmiDueDate("");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingOrg) return;

    setSavingEdit(true);
    try {
      // 1. Update organization name, status and modules
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${editingOrg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          status: editStatus,
          enabledModules: editModules,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update organization");
      }

      // 2. Update subscription / EMI parameters
      await fetch(`${BACKEND_URL}/api/admin/organizations/${editingOrg.id}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMode: editPaymentMode,
          emiMonthsPaid: Number(editEmiMonthsPaid),
          nextEmiDueDate: editNextEmiDueDate ? new Date(editNextEmiDueDate).toISOString() : null,
          status: editStatus === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
        }),
      });

      showToast(`✓ Saved configuration and subscription for "${editName}"`);
      setEditingOrg(null);
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteOrg = async (org: Organization) => {
    if (!confirm(`Are you sure you want to completely delete "${org.name}" and all associated platform data?`)) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${org.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete organization");
      showToast(`Deleted organization "${org.name}"`);
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label}: ${text}`);
  };

  // Filter organizations
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.users.some(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || org.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 space-y-8 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl shadow-xl animate-fadeIn font-bold text-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-600 shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold font-mono">
                  MASTER CONSOLE
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage client organizations, configure allowed features &amp; provision access
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/whatsapp")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Workspace
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Onboard New Client
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{organizations.length}</h3>
            </div>
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-600 shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Deployments</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {organizations.filter(o => o.status === "ACTIVE").length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shadow-2xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Models</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {organizations.filter(o => o.subscriptions?.[0]?.paymentMode === "ONE_TIME").length} Upfront
                </span>
                <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  {organizations.filter(o => o.subscriptions?.[0]?.paymentMode === "EMI").length} EMI
                </span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-600 shadow-2xs">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                ₹{organizations.reduce((acc, o) => acc + (o.subscriptions?.[0]?.amountPaid || 0), 0).toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600 shadow-2xs">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, email, or Organization ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "ACTIVE", "SUSPENDED"] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}

            <button
              onClick={fetchOrganizations}
              className="p-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-sky-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-sky-600" />
            <p className="text-sm font-medium">Loading client organizations &amp; permission states...</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="py-20 bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-xs">
            <Building2 className="h-10 w-10 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">No organizations found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Try adjusting your search criteria or onboard a new client organization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredOrgs.map((org) => {
              const adminUser = org.users.find(u => u.role === "admin") || org.users[0];
              const enabledCount = org.enabledModules?.length || 0;

              return (
                <div
                  key={org.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 hover:border-sky-300 transition-all shadow-sm hover:shadow-md"
                >
                  {/* Top Bar of Org Card */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-extrabold text-lg shadow-2xs">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{org.name}</h2>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            org.status === "ACTIVE"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}>
                            {org.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <button
                            onClick={() => copyToClipboard(org.id, "Organization ID")}
                            className="hover:text-sky-600 transition-colors flex items-center gap-1 font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-semibold cursor-pointer"
                          >
                            <Copy className="h-3 w-3 text-slate-400" />
                            ID: {org.id}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => openEditModal(org)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-sky-600" />
                        <span>Manage Modules &amp; Settings</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrg(org)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title="Delete Organization"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Column 1: Client Admin & Credentials */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-sky-600" /> Client Admin Credentials
                      </p>
                      
                      {adminUser ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="text-slate-500 font-medium">Name:</span>
                            <span className="font-bold text-slate-900">{adminUser.name || "Client Admin"}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="text-slate-500 font-medium">Email:</span>
                            <span className="font-mono text-slate-900 font-bold flex items-center gap-1">
                              {adminUser.email}
                              <button onClick={() => copyToClipboard(adminUser.email, "Admin Email")} className="cursor-pointer">
                                <Copy className="h-3 w-3 text-slate-400 hover:text-sky-600" />
                              </button>
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="text-slate-500 font-medium">Default Password:</span>
                            <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">admin123</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No admin user assigned</p>
                      )}
                    </div>

                    {/* Column 2: Connected Platform Status */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-amber-600" /> Integration Tokens
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded-xl border flex items-center justify-between font-bold ${
                          org.waConfig?.wabaId
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}>
                          <span>WhatsApp</span>
                          <span>{org.waConfig?.wabaId ? "✓" : "—"}</span>
                        </div>

                        <div className={`p-2 rounded-xl border flex items-center justify-between font-bold ${
                          org.gmbConfig?.accountId
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}>
                          <span>GMB</span>
                          <span>{org.gmbConfig?.accountId ? "✓" : "—"}</span>
                        </div>

                        <div className={`p-2 rounded-xl border flex items-center justify-between font-bold ${
                          org.gmailConfig?.emailAddress
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}>
                          <span>Gmail</span>
                          <span>{org.gmailConfig?.emailAddress ? "✓" : "—"}</span>
                        </div>

                        <div className={`p-2 rounded-xl border flex items-center justify-between font-bold ${
                          org.linkedInConfig?.memberName
                            ? "bg-sky-50 border-sky-200 text-sky-700"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}>
                          <span>LinkedIn</span>
                          <span>{org.linkedInConfig?.memberName ? "✓" : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Enabled Modules Count & Quick Preview */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-sky-600" /> Allowed Modules
                        </p>
                        <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {enabledCount} / {ALL_MODULE_KEYS.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
                        {org.enabledModules?.map(key => (
                          <span
                            key={key}
                            className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Subscription & EMI Contract Summary Banner */}
                  {org.subscriptions && org.subscriptions.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white border border-sky-200 text-brand-blue shadow-2xs">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span>{org.subscriptions[0].planName}</span>
                            <span className={`px-2 py-0.2 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                              org.subscriptions[0].paymentMode === "EMI"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300"
                            }`}>
                              {org.subscriptions[0].paymentMode === "EMI" ? "1-Year on EMI" : "1-Year Upfront Paid"}
                            </span>
                            <span className="text-slate-400 font-normal">|</span>
                            <span className="text-emerald-700 font-mono font-bold">
                              ₹{org.subscriptions[0].amountPaid.toLocaleString("en-IN")} paid
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-3">
                            <span>Contract: 12 Months</span>
                            {org.subscriptions[0].paymentMode === "EMI" ? (
                              <>
                                <span className="font-semibold text-amber-900">
                                  EMI Status: {org.subscriptions[0].emiMonthsPaid || 2} / 12 Months ({12 - (org.subscriptions[0].emiMonthsPaid || 2)} remaining @ ₹{org.subscriptions[0].emiMonthlyAmount || 3000}/mo)
                                </span>
                                {org.subscriptions[0].nextEmiDueDate && (
                                  <span className="text-slate-500 font-mono">
                                    Next EMI: {new Date(org.subscriptions[0].nextEmiDueDate).toLocaleDateString("en-IN")}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-emerald-700 font-semibold">
                                Full Year Complete • Valid till {new Date(org.subscriptions[0].endDate).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          org.subscriptions[0].status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}>
                          ● {org.subscriptions[0].status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: Onboard New Client Organization */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-600" /> Onboard New Client Organization
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Create client account and assign allowed platform features
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-6 text-xs font-bold text-slate-700">
              
              {/* Org Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Organization / Client Name <span className="text-sky-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Media Group"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Client Admin Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Client Admin Email (Login ID) <span className="text-sky-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@skylinemedia.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Default Password <span className="text-sky-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin123"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Annual Contract & Payment Model */}
              <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-900 text-xs font-bold flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-sky-600" />
                    Commercial Billing Agreement (1-Year Contract)
                  </label>
                  <span className="text-[10px] font-extrabold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200 uppercase">
                    Annual Term
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    newPaymentMode === "ONE_TIME"
                      ? "bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-300"
                      : "bg-white/60 border-slate-200 hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={newPaymentMode === "ONE_TIME"}
                      onChange={() => setNewPaymentMode("ONE_TIME")}
                      className="mt-0.5 text-emerald-600 focus:ring-0"
                    />
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">One-Time Upfront (₹14,999)</p>
                      <p className="text-[11px] text-slate-500">12 months prepaid • ₹17,699 incl. 18% GST</p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    newPaymentMode === "EMI"
                      ? "bg-white border-amber-300 shadow-xs ring-1 ring-amber-300"
                      : "bg-white/60 border-slate-200 hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={newPaymentMode === "EMI"}
                      onChange={() => setNewPaymentMode("EMI")}
                      className="mt-0.5 text-amber-600 focus:ring-0"
                    />
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Monthly EMI (₹3,000/mo)</p>
                      <p className="text-[11px] text-slate-500">First 2 months = ₹6,000 (₹7,080 w/ GST) • 10 EMIs remain</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Module Selection by Category */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Assigned Platform Modules
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Select which sidebar tools this client organization is allowed to see and use
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedModules(ALL_MODULE_KEYS)}
                      className="text-[11px] text-sky-600 hover:underline font-bold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModules([])}
                      className="text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {MODULE_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {cat.category}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.modules.map((m) => {
                          const isChecked = selectedModules.includes(m.key);
                          return (
                            <label
                              key={m.key}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-sky-50 border-sky-200 text-slate-900 shadow-2xs"
                                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedModules([...selectedModules, m.key]);
                                  } else {
                                    setSelectedModules(selectedModules.filter(k => k !== m.key));
                                  }
                                }}
                                className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-0"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{m.label}</p>
                                <p className="text-[10px] text-slate-500 font-normal">{m.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                >
                  {creating ? "Onboarding Client..." : "Complete Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: Manage Modules & Edit Organization */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-sky-600" /> Manage Client Permissions &amp; Modules
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Update {editingOrg.name} permissions and access levels
                </p>
              </div>
              <button onClick={() => setEditingOrg(null)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs font-bold text-slate-700">
              
              {/* Org Details & Status Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Account Deployment Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 text-xs cursor-pointer font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE (Full Client Access)</option>
                    <option value="SUSPENDED">SUSPENDED (Block Login &amp; Access)</option>
                  </select>
                </div>
              </div>

              {/* Subscription & EMI Agreement Editor */}
              <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 space-y-3.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-sky-600" />
                    Subscription Plan &amp; EMI Installment Lifecycle
                  </h4>
                  <span className="text-[10px] font-extrabold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200 uppercase">
                    12-Month Contract
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={editPaymentMode}
                      onChange={(e) => setEditPaymentMode(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="ONE_TIME">1-Year Upfront Paid (₹14,999)</option>
                      <option value="EMI">Monthly EMI Plan (₹3,000/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold mb-1">
                      Installments Cleared
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={editEmiMonthsPaid}
                        onChange={(e) => setEditEmiMonthsPaid(Number(e.target.value))}
                        disabled={editPaymentMode === "ONE_TIME"}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                      <span className="text-xs text-slate-500 font-bold whitespace-nowrap">/ 12 Mos</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold mb-1">
                      Next EMI Due Date
                    </label>
                    <input
                      type="date"
                      value={editNextEmiDueDate}
                      onChange={(e) => setEditNextEmiDueDate(e.target.value)}
                      disabled={editPaymentMode === "ONE_TIME" || editEmiMonthsPaid >= 12}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                    />
                  </div>
                </div>

                {editPaymentMode === "EMI" && (
                  <p className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
                    ● Initial 2 months compulsory upfront paid (₹6,000). Remaining:{" "}
                    <strong>{Math.max(0, 12 - editEmiMonthsPaid)} EMIs</strong> @ ₹3,000/mo.
                  </p>
                )}
              </div>

              {/* Categorized Module Toggles */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Module Access Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Changes will reflect immediately in the client&apos;s dashboard sidebar
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditModules(ALL_MODULE_KEYS)}
                      className="text-[11px] text-sky-600 hover:underline font-bold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEditModules([])}
                      className="text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {MODULE_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {cat.category}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.modules.map((m) => {
                          const isChecked = editModules.includes(m.key);
                          return (
                            <label
                              key={m.key}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-sky-50 border-sky-200 text-slate-900 shadow-2xs"
                                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditModules([...editModules, m.key]);
                                  } else {
                                    setEditModules(editModules.filter(k => k !== m.key));
                                  }
                                }}
                                className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-0"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{m.label}</p>
                                <p className="text-[10px] text-slate-500 font-normal">{m.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                >
                  {savingEdit ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
