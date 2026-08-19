"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Plus, Shield, Check, X, Copy, RefreshCw, Layers, Users, Search,
  Edit3, Trash2, Power, CheckCircle2, AlertCircle, ArrowLeft, Key, Lock, Mail,
  ExternalLink, Sparkles
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  enabledModules: string[];
  status: string;
  users: User[];
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
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULE_KEYS);
  const [creating, setCreating] = useState(false);

  // Edit Org Modal State
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editModules, setEditModules] = useState<string[]>([]);
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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create client organization");
      }

      showToast(`✓ Organization "${newOrgName}" onboarded successfully!`);
      setNewOrgName("");
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminPassword("admin123");
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
  };

  const handleSaveEdit = async () => {
    if (!editingOrg) return;

    setSavingEdit(true);
    try {
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

      showToast(`✓ Saved configuration for "${editName}"`);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-950 border border-emerald-800 text-emerald-200 rounded-2xl shadow-2xl animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-primary/20 border border-amber-500/30 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/10">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Super Admin Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  MASTER CONSOLE
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage client organizations, configure allowed features & provision access
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/whatsapp")}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Workspace
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
          >
            <Plus className="h-4 w-4" /> Onboard New Client
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Client Organizations</p>
              <h3 className="text-2xl font-bold text-white mt-1">{organizations.length}</h3>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Deployments</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {organizations.filter(o => o.status === "ACTIVE").length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by client name, email, or Organization ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-primary text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "ACTIVE", "SUSPENDED"] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === status
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}

            <button
              onClick={fetchOrganizations}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading client organizations & permission states...</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="py-20 bg-slate-900/20 border border-slate-800/60 rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Building2 className="h-10 w-10 text-slate-600" />
            <h3 className="text-base font-bold text-slate-300">No organizations found</h3>
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
                  className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-6 hover:border-slate-700 transition-all shadow-xl shadow-black/20"
                >
                  {/* Top Bar of Org Card */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-bold text-white tracking-tight">{org.name}</h2>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            org.status === "ACTIVE"
                              ? "bg-emerald-950/80 border-emerald-800 text-emerald-400"
                              : "bg-red-950/80 border-red-800 text-red-400"
                          }`}>
                            {org.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                          <button
                            onClick={() => copyToClipboard(org.id, "Organization ID")}
                            className="hover:text-primary transition-colors flex items-center gap-1 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800"
                          >
                            <Copy className="h-3 w-3 text-slate-500" />
                            ID: {org.id}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => openEditModal(org)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-primary" />
                        <span>Manage Modules & Settings</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrg(org)}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-red-900 hover:bg-red-950/50 text-slate-500 hover:text-red-400 rounded-xl transition-colors"
                        title="Delete Organization"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Column 1: Client Admin & Credentials */}
                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" /> Client Admin Credentials
                      </p>
                      
                      {adminUser ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-500">Name:</span>
                            <span className="font-medium text-white">{adminUser.name || "Client Admin"}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-mono text-white flex items-center gap-1">
                              {adminUser.email}
                              <button onClick={() => copyToClipboard(adminUser.email, "Admin Email")}>
                                <Copy className="h-3 w-3 text-slate-500 hover:text-primary" />
                              </button>
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-500">Default Password:</span>
                            <span className="font-mono text-emerald-400">admin123</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No admin user assigned</p>
                      )}
                    </div>

                    {/* Column 2: Connected Platform Status */}
                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-amber-400" /> Integration Tokens
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          org.waConfig?.wabaId
                            ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                            : "bg-slate-900/60 border-slate-800 text-slate-500"
                        }`}>
                          <span>WhatsApp</span>
                          <span>{org.waConfig?.wabaId ? "✓" : "—"}</span>
                        </div>

                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          org.gmbConfig?.accountId
                            ? "bg-blue-950/40 border-blue-800/60 text-blue-300"
                            : "bg-slate-900/60 border-slate-800 text-slate-500"
                        }`}>
                          <span>GMB</span>
                          <span>{org.gmbConfig?.accountId ? "✓" : "—"}</span>
                        </div>

                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          org.gmailConfig?.emailAddress
                            ? "bg-purple-950/40 border-purple-800/60 text-purple-300"
                            : "bg-slate-900/60 border-slate-800 text-slate-500"
                        }`}>
                          <span>Gmail</span>
                          <span>{org.gmailConfig?.emailAddress ? "✓" : "—"}</span>
                        </div>

                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          org.linkedInConfig?.memberName
                            ? "bg-sky-950/40 border-sky-800/60 text-sky-300"
                            : "bg-slate-900/60 border-slate-800 text-slate-500"
                        }`}>
                          <span>LinkedIn</span>
                          <span>{org.linkedInConfig?.memberName ? "✓" : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Enabled Modules Count & Quick Preview */}
                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-cyan-400" /> Allowed Modules
                        </p>
                        <span className="text-xs font-bold text-primary">
                          {enabledCount} / {ALL_MODULE_KEYS.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
                        {org.enabledModules?.map(key => (
                          <span
                            key={key}
                            className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-[10px] font-semibold"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Onboard New Client Organization
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create client account and assign allowed platform features
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-6 text-sm">
              
              {/* Org Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Organization / Client Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Media Group"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Client Admin Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Client Admin Email (Login ID) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@skylinemedia.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Default Password <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin123"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>
              </div>

              {/* Module Selection by Category */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Assigned Platform Modules
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Select which sidebar tools this client organization is allowed to see and use
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedModules(ALL_MODULE_KEYS)}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModules([])}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {MODULE_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                                  ? "bg-primary/10 border-primary/40 text-white shadow-sm"
                                  : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
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
                                className="mt-0.5 rounded border-slate-700 text-primary focus:ring-0"
                              />
                              <div>
                                <p className="font-semibold text-slate-200">{m.label}</p>
                                <p className="text-[10px] text-slate-400">{m.desc}</p>
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
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" /> Manage Client Permissions & Modules
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update {editingOrg.name} permissions and access levels
                </p>
              </div>
              <button onClick={() => setEditingOrg(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              
              {/* Org Details & Status Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Account Deployment Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="ACTIVE">ACTIVE (Full Client Access)</option>
                    <option value="SUSPENDED">SUSPENDED (Block Login & Access)</option>
                  </select>
                </div>
              </div>

              {/* Categorized Module Toggles */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Module Access Matrix
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Changes will reflect immediately in the client&apos;s dashboard sidebar
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditModules(ALL_MODULE_KEYS)}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setEditModules([])}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {MODULE_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                                  ? "bg-primary/10 border-primary/40 text-white shadow-sm"
                                  : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
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
                                className="mt-0.5 rounded border-slate-700 text-primary focus:ring-0"
                              />
                              <div>
                                <p className="font-semibold text-slate-200">{m.label}</p>
                                <p className="text-[10px] text-slate-400">{m.desc}</p>
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
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all"
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
