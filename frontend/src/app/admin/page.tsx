"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Plus, Shield, Check, X, Copy, RefreshCw, Layers, Users, Search,
  Edit3, Trash2, Power, CheckCircle2, AlertCircle, ArrowLeft, Key, Lock, Mail,
  ExternalLink, Sparkles, Phone, Calendar, Clock, CreditCard, Send, MessageSquare,
  Bell, Filter, ArrowUpDown, Activity, AlertTriangle, TrendingUp, History, Eye,
  Globe, MapPin, Briefcase, Megaphone
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone?: string | null;
}

interface SubscriptionInfo {
  id: string;
  planCode: string;
  planName: string;
  amountPaid: number;
  durationMonths: number;
  status: string;
  startDate: string;
  endDate: string;
  extraChannels?: number;
}

interface SentNotificationItem {
  id: string;
  organizationId: string;
  organization?: { id: string; name: string };
  title?: string;
  message: string;
  priority: string;
  sender: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  pendingBusinessName?: string | null;
  businessCategory?: string | null;
  businessAddress?: string | null;
  businessWebsite?: string | null;
  aboutBusiness?: string | null;
  gstin?: string | null;
  enabledModules: string[];
  status: string;
  suspensionReason?: string | null;
  users: User[];
  subscriptions?: SubscriptionInfo[];
  paymentTransactions?: any[];
  notifications?: SentNotificationItem[];
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "UPCOMING_SOON" | "COMPLETED" | "RENEWED">("ALL");

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
  const [editSuspensionReason, setEditSuspensionReason] = useState("");
  const [editModules, setEditModules] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // Sorting and Search state
  const [sortBy, setSortBy] = useState<"name" | "status" | "date" | "revenue">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Direct Message Modal State (Super Admin to Client)
  const [messagingOrg, setMessagingOrg] = useState<Organization | null>(null);
  const [msgTitle, setMsgTitle] = useState("Notice from Super Admin");
  const [msgContent, setMsgContent] = useState("");
  const [msgPriority, setMsgPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Activity Feed Search & Filter
  const [activitySearch, setActivitySearch] = useState("");

  // View Client Details Modal State
  const [viewingClient, setViewingClient] = useState<Organization | null>(null);

  // Sent Messages Audit History Modal State (Super Admin)
  const [showSentHistoryModal, setShowSentHistoryModal] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<SentNotificationItem[]>([]);
  const [loadingSentHistory, setLoadingSentHistory] = useState(false);
  const [sentHistorySearch, setSentHistorySearch] = useState("");

  // Broadcast to All Clients Modal State
  const [showBroadcastAllModal, setShowBroadcastAllModal] = useState(false);
  const [bcastTitle, setBcastTitle] = useState("Important Announcement for All Clients");
  const [bcastContent, setBcastContent] = useState("");
  const [bcastPriority, setBcastPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [bcastTargetStatus, setBcastTargetStatus] = useState<"ALL" | "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED">("ALL");
  const [broadcastingAll, setBroadcastingAll] = useState(false);

  // Client Message Detail Modal State (When clicking bell icon on an organization)
  const [viewingOrgMessages, setViewingOrgMessages] = useState<Organization | null>(null);

  // Auto-Refresh Toggle State (Top Navigation Bar)
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  const fetchOrganizations = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations`);
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data);
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || "Failed to load clients");
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const fetchSentNotifications = async (isBackground = false) => {
    if (!isBackground) setLoadingSentHistory(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notifications/sent-history`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notifications)) {
          setSentNotifications(data.notifications);
        }
      }
    } catch (err) {
      if (!isBackground) console.error("Failed to load sent notifications history:", err);
    } finally {
      if (!isBackground) setLoadingSentHistory(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchSentNotifications();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    // Auto-polling interval: runs every 20 seconds when autoRefresh is checked
    const pollInterval = setInterval(() => {
      fetchOrganizations(true);
      fetchSentNotifications(true);
    }, 20000);

    return () => clearInterval(pollInterval);
  }, [autoRefresh]);

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
    setEditSuspensionReason(org.suspensionReason || "");
    setEditModules(org.enabledModules || []);
  };

  const handleSaveEdit = async () => {
    if (!editingOrg) return;

    if (editStatus === "SUSPENDED" && !editSuspensionReason.trim()) {
      alert("Please provide a suspension reason to explain why this client account is being suspended.");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${editingOrg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          status: editStatus,
          suspensionReason: editStatus === "SUSPENDED" ? editSuspensionReason.trim() : null,
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

  const handleOpenMessageModal = (org: Organization) => {
    setMessagingOrg(org);
    setMsgTitle("Important Update from Platform Admin");
    setMsgContent("");
    setMsgPriority("normal");
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messagingOrg || !msgContent.trim()) {
      alert("Please enter a message to send.");
      return;
    }

    setSendingMsg(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${messagingOrg.id}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: msgTitle.trim(),
          message: msgContent.trim(),
          priority: msgPriority,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message to client");
      }

      showToast(`✓ Message delivered directly to ${messagingOrg.name}!`);
      setMessagingOrg(null);
      setMsgContent("");
      fetchSentNotifications();
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleBroadcastAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bcastContent.trim()) {
      alert("Please enter a message to broadcast to all clients.");
      return;
    }

    setBroadcastingAll(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notifications/broadcast-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bcastTitle.trim(),
          message: bcastContent.trim(),
          priority: bcastPriority,
          targetStatus: bcastTargetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to broadcast message to clients");
      }

      showToast(`✓ Broadcast delivered to all ${data.recipientCount} client organizations!`);
      setShowBroadcastAllModal(false);
      setBcastContent("");
      fetchSentNotifications();
    } catch (err: any) {
      alert(err.message || "Failed to broadcast message");
    } finally {
      setBroadcastingAll(false);
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

  const handleApproveOrg = async (org: Organization) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${org.id}/approve`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to approve organization");
      }

      showToast(`✓ Approved & Activated "${org.name}"!`);
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveBusinessName = async (org: Organization) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${org.id}/approve-name`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to approve business name");
      }

      showToast(`✓ Business name "${org.pendingBusinessName}" approved!`);
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectBusinessName = async (org: Organization) => {
    if (!confirm(`Reject business name change request "${org.pendingBusinessName}"?`)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${org.id}/reject-name`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reject business name");
      }

      showToast(`Rejected business name change request`);
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label}: ${text}`);
  };

  // Filter & Sort organizations
  const filteredOrgs = organizations
    .filter(org => {
      const q = searchQuery.toLowerCase().trim();
      // Point 2: Phone number search normalization (matches +91, dashes, spaces, or raw digits)
      const qDigits = q.replace(/\D/g, "");

      const matchesSearch =
        !q ||
        org.name.toLowerCase().includes(q) ||
        org.id.toLowerCase().includes(q) ||
        (org.businessCategory && org.businessCategory.toLowerCase().includes(q)) ||
        (org.gstin && org.gstin.toLowerCase().includes(q)) ||
        (org.suspensionReason && org.suspensionReason.toLowerCase().includes(q)) ||
        org.users.some(u => {
          const userPhone = u.phone || "";
          const userPhoneDigits = userPhone.replace(/\D/g, "");
          return (
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            (userPhone && userPhone.toLowerCase().includes(q)) ||
            (qDigits.length >= 3 && userPhoneDigits.includes(qDigits))
          );
        }) ||
        (org.paymentTransactions || []).some(tx => {
          const txPhone = tx.customerPhone || "";
          const txPhoneDigits = txPhone.replace(/\D/g, "");
          return (
            (txPhone && txPhone.toLowerCase().includes(q)) ||
            (qDigits.length >= 3 && txPhoneDigits.includes(qDigits)) ||
            (tx.customerName && tx.customerName.toLowerCase().includes(q)) ||
            (tx.customerEmail && tx.customerEmail.toLowerCase().includes(q))
          );
        });

      const nowTime = Date.now();
      const subs = org.subscriptions || [];
      const activeSub = subs.find(s => {
        const start = new Date(s.startDate).getTime();
        const end = new Date(s.endDate).getTime();
        return (s.status === "ACTIVE" || !s.status) && start <= nowTime && end >= nowTime;
      }) || subs[0];

      const daysUntilExpiry = activeSub?.endDate ? Math.ceil((new Date(activeSub.endDate).getTime() - nowTime) / (1000 * 60 * 60 * 24)) : null;
      const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 14;
      const isPlanCompleted = activeSub?.endDate ? new Date(activeSub.endDate).getTime() < nowTime : false;
      const isPlanRenewed = subs.length > 1;

      let matchesStatus = false;
      if (statusFilter === "ALL") {
        matchesStatus = true;
      } else if (statusFilter === "UPCOMING_SOON") {
        matchesStatus = isExpiringSoon;
      } else if (statusFilter === "COMPLETED") {
        matchesStatus = isPlanCompleted;
      } else if (statusFilter === "RENEWED") {
        matchesStatus = isPlanRenewed;
      } else {
        matchesStatus = org.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "status") {
        comparison = (a.status || "").localeCompare(b.status || "");
      } else if (sortBy === "revenue") {
        const revA = a.subscriptions?.[0]?.amountPaid || 0;
        const revB = b.subscriptions?.[0]?.amountPaid || 0;
        comparison = revA - revB;
      } else {
        // "date" - sort by subscription date or id
        const dateA = a.subscriptions?.[0]?.startDate ? new Date(a.subscriptions[0].startDate).getTime() : 0;
        const dateB = b.subscriptions?.[0]?.startDate ? new Date(b.subscriptions[0].startDate).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === "asc" ? comparison : -comparison;
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
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-600 shadow-sm shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Super Admin Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-extrabold font-mono">
                  MASTER CONSOLE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage client organizations, configure allowed features &amp; provision access
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Top Refresh Control with Auto-Refresh Checkbox */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => {
                fetchOrganizations();
                fetchSentNotifications();
                showToast("✓ Admin data refreshed!");
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors cursor-pointer"
              title="Click to refresh live client list, subscriptions & notifications"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-600" : "text-slate-500"}`} />
              <span>Refresh</span>
            </button>

            <span className="text-slate-200">|</span>

            <label
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer select-none"
              title="Automatically refresh admin data every 20 seconds"
            >
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => {
                  setAutoRefresh(e.target.checked);
                  showToast(e.target.checked ? "Auto-refresh enabled (20s)" : "Auto-refresh paused");
                }}
                className="w-3.5 h-3.5 rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                Auto
                {autoRefresh && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </span>
            </label>
          </div>

          <button
            onClick={() => router.push("/whatsapp")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => {
              fetchSentNotifications();
              setShowSentHistoryModal(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            title="Audit all messages sent to clients and check read receipts"
          >
            <History className="h-4 w-4 text-indigo-600" />
            <span>Sent ({sentNotifications.length})</span>
          </button>

          <button
            onClick={() => setShowBroadcastAllModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            title="Send an announcement or alert notification to all client accounts at once"
          >
            <Megaphone className="h-4 w-4" />
            <span>Broadcast</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New Client</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Metric & Lifecycle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{organizations.length}</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Onboarded Workspaces</p>
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
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Running in production</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shadow-2xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-2xl p-5 flex items-center justify-between shadow-xs bg-gradient-to-br from-amber-50/50 to-white">
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-black text-amber-800 mt-1">
                {organizations.filter(o => o.status === "PENDING_APPROVAL").length}
              </h3>
              <p className="text-[10px] text-amber-600 font-medium">Turnaround: 6 to 12 hours</p>
            </div>
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-xl text-amber-800 shadow-2xs">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-orange-200 rounded-2xl p-5 flex items-center justify-between shadow-xs bg-gradient-to-br from-orange-50/40 to-white">
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Expiring / Queued</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-orange-800">
                  {organizations.filter(o => {
                    const subs = o.subscriptions || [];
                    const activeSub = subs[0];
                    if (!activeSub?.endDate) return false;
                    const diffDays = Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 14;
                  }).length}
                </span>
                <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  +{organizations.filter(o => (o.subscriptions || []).length > 1).length} Upgraded
                </span>
              </div>
              <p className="text-[10px] text-orange-600 font-medium mt-0.5">Expiring ≤14d or Renewed</p>
            </div>
            <div className="p-3 bg-orange-100 border border-orange-300 rounded-xl text-orange-800 shadow-2xs">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Dedicated Pending Approvals Section (Top Priority Spotlight) */}
        {organizations.filter(o => o.status === "PENDING_APPROVAL").length > 0 && (
          <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 p-6 shadow-md shadow-amber-500/10 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                  <AlertCircle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-amber-950 tracking-tight">
                      Pending Super Admin Approvals ({organizations.filter(o => o.status === "PENDING_APPROVAL").length})
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-300">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    Newly registered organizations and plan subscriptions awaiting your authorization.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto">
                Turnaround SLA: 6 to 12 Hours
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {organizations.filter(o => o.status === "PENDING_APPROVAL").map((org) => {
                const adminUser = org.users?.find((u: any) => u.role === "admin" || u.role === "client_admin") || org.users?.[0];
                const txn = org.paymentTransactions?.[0];
                return (
                  <div
                    key={org.id}
                    className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{org.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Admin: <strong className="text-slate-800">{adminUser?.name || "Client Admin"}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {adminUser?.email || "No email specified"}
                          </p>
                          {(adminUser?.phone || txn?.customerPhone) && (
                            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                              📞 {adminUser?.phone || txn?.customerPhone}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md shrink-0">
                          Pending
                        </span>
                      </div>

                      {org.subscriptions?.[0] && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            Plan: <strong className="text-brand-blue">{org.subscriptions[0].planName}</strong>
                          </span>
                          <span className="font-black text-emerald-700">
                            ₹{org.subscriptions[0].amountPaid?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleApproveOrg(org)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve &amp; Activate</span>
                      </button>
                      <button
                        onClick={() => openEditModal(org)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        title="Edit organization configuration"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dedicated Pending Business Name Changes Approval Section */}
        {organizations.filter(o => Boolean(o.pendingBusinessName && o.pendingBusinessName !== o.name)).length > 0 && (
          <div className="rounded-3xl border-2 border-sky-300 bg-gradient-to-r from-sky-50 via-white to-blue-50/60 p-6 shadow-md shadow-sky-500/10 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-blue text-white shadow-md shadow-brand-blue/30">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Business Name Change Requests ({organizations.filter(o => Boolean(o.pendingBusinessName && o.pendingBusinessName !== o.name)).length})
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-sky-100 text-brand-blue border border-sky-200">
                      Approval Needed
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Clients requesting to rename their commercial business entity.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {organizations.filter(o => Boolean(o.pendingBusinessName && o.pendingBusinessName !== o.name)).map((org) => {
                const adminUser = org.users?.find((u: any) => u.role === "admin" || u.role === "client_admin") || org.users?.[0];
                return (
                  <div
                    key={org.id}
                    className="p-4 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Current Name</span>
                        <span className="font-mono text-[10px] text-slate-400">ID: {org.id.slice(0, 8)}...</span>
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm line-through decoration-rose-400">{org.name}</h4>

                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-[10px] font-bold text-amber-800 uppercase">Requested New Name:</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">
                          &quot;{org.pendingBusinessName}&quot;
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1 space-y-0.5">
                        <p>Operator: <strong className="text-slate-800">{adminUser?.name || "Client Admin"}</strong></p>
                        <p className="font-mono">{adminUser?.email || "No email"}</p>
                        {adminUser?.phone && <p className="text-emerald-700 font-semibold">📞 {adminUser.phone}</p>}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApproveBusinessName(org)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve Name</span>
                      </button>
                      <button
                        onClick={() => handleRejectBusinessName(org)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
                        title="Reject name request"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Client Activity & Plan Lifecycle Monitoring Feed ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Client Plan Activity &amp; Lifecycle Feed
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Tracker
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Monitor plan expirations, active subscriptions, and client account status
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              {/* Activity Client Search Input */}
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search activity by client..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900 text-[11px] rounded-xl pl-8 pr-6 py-2 outline-none transition-colors font-medium shadow-2xs"
                />
                {activitySearch && (
                  <button
                    onClick={() => setActivitySearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-0.5">Filter:</span>
                <button
                  onClick={() => setStatusFilter("UPCOMING_SOON")}
                  className={`flex-1 sm:flex-initial text-center px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    statusFilter === "UPCOMING_SOON" ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  Expiring Soon
                </button>
                <button
                  onClick={() => setStatusFilter("COMPLETED")}
                  className={`flex-1 sm:flex-initial text-center px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    statusFilter === "COMPLETED" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`flex-1 sm:flex-initial text-center px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    statusFilter === "ACTIVE" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Active
                </button>
              </div>
            </div>
          </div>

          {/* Activity Cards List */}
          {(() => {
            const nowTime = Date.now();
            const actQuery = activitySearch.toLowerCase().trim();
            // Build activity items from organizations and active subscriptions
            let activityItems: any[] = [];

            organizations.forEach(org => {
              const adminUser = org.users?.find((u: any) => u.role === "admin" || u.role === "client_admin") || org.users?.[0];
              const subs = org.subscriptions || [];
              const activeSub = subs[0];

              if (activeSub?.endDate) {
                const endTimestamp = new Date(activeSub.endDate).getTime();
                const daysDiff = Math.ceil((endTimestamp - nowTime) / (1000 * 60 * 60 * 24));

                // 1. Plan Expired / Completed
                if (endTimestamp < nowTime) {
                  activityItems.push({
                    type: "completed",
                    badge: "PLAN EXPIRED",
                    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
                    iconClass: "text-rose-600 bg-rose-50 border-rose-200",
                    icon: AlertTriangle,
                    org,
                    title: `${org.name} plan completed`,
                    description: `Annual subscription expired on ${new Date(activeSub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`,
                    timestamp: endTimestamp,
                  });
                }
                // 2. Expiring Soon (within 14 days)
                else if (daysDiff <= 14 && daysDiff >= 0) {
                  activityItems.push({
                    type: "upcoming_soon",
                    badge: `EXPIRES IN ${daysDiff} DAYS`,
                    badgeClass: "bg-orange-100 text-orange-800 border-orange-300 font-black",
                    iconClass: "text-orange-600 bg-orange-50 border-orange-200",
                    icon: Clock,
                    org,
                    title: `${org.name} plan expiring soon`,
                    description: `Active annual plan finishes in ${daysDiff} day${daysDiff === 1 ? "" : "s"} on ${new Date(activeSub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`,
                    timestamp: endTimestamp,
                  });
                }
              }

              // 3. Pending Name Change Activity
              if (org.pendingBusinessName && org.pendingBusinessName !== org.name) {
                activityItems.push({
                  type: "name_change",
                  badge: "NAME CHANGE PENDING",
                  badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
                  iconClass: "text-sky-600 bg-sky-50 border-sky-200",
                  icon: Edit3,
                  org,
                  title: `${org.name} requested rename`,
                  description: `Requested new commercial business name: "${org.pendingBusinessName}".`,
                  timestamp: nowTime,
                });
              }
            });

            // Filter by activity search query if user inputs text
            if (actQuery) {
              activityItems = activityItems.filter(item =>
                item.org.name.toLowerCase().includes(actQuery) ||
                item.org.id.toLowerCase().includes(actQuery) ||
                item.title.toLowerCase().includes(actQuery) ||
                item.description.toLowerCase().includes(actQuery) ||
                (item.org.users?.[0]?.email && item.org.users[0].email.toLowerCase().includes(actQuery)) ||
                (item.org.users?.[0]?.name && item.org.users[0].name.toLowerCase().includes(actQuery))
              );
            }

            if (activityItems.length === 0) {
              return (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  {actQuery ? `No activity matching "${activitySearch}"` : "All active client subscriptions are healthy. No expirations or pending actions."}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activityItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const adminUser = item.org.users?.find((u: any) => u.role === "admin" || u.role === "client_admin") || item.org.users?.[0];

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${item.badgeClass}`}>
                            {item.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {item.org.id.slice(0, 8)}...
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${item.iconClass}`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-1 leading-snug font-medium">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 font-medium pl-1 flex flex-wrap items-center gap-x-2">
                          <span>Operator: <strong className="text-slate-800">{adminUser?.name || "Client Admin"}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">{adminUser?.email || "No email"}</span>
                        </div>
                      </div>

                      {/* Dual Action Buttons: Send Message + View Details */}
                      <div className="pt-2.5 border-t border-slate-200/60 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setMessagingOrg(item.org);
                            if (item.type === "upcoming_soon") {
                              setMsgTitle(`Plan Expiration Notice: ${item.org.name}`);
                              setMsgContent(`Hello ${adminUser?.name || "Client"},\n\nYour subscription plan completes soon. Please log in to your Profile to review renewal options and continue uninterrupted service.\n\nBest regards,\nPlatform Management`);
                              setMsgPriority("high");
                            } else if (item.type === "completed") {
                              setMsgTitle(`Subscription Expired: ${item.org.name}`);
                              setMsgContent(`Hello ${adminUser?.name || "Client"},\n\nYour plan subscription has completed and expired. Please upgrade or renew your plan immediately to restore full feature access.\n\nThank you,\nPlatform Management`);
                              setMsgPriority("urgent");
                            } else if (item.type === "renewed") {
                              setMsgTitle(`Subscription Confirmation: ${item.org.name}`);
                              setMsgContent(`Hello ${adminUser?.name || "Client"},\n\nYour plan update and renewal has been verified and scheduled successfully.\n\nThank you for choosing us!`);
                              setMsgPriority("normal");
                            } else {
                              setMsgTitle(`Notification regarding ${item.org.name}`);
                              setMsgContent("");
                              setMsgPriority("normal");
                            }
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Send direct broadcast or announcement message to this client profile"
                        >
                          <Send className="w-3 h-3 text-sky-600" />
                          <span>Send Message</span>
                        </button>

                        <button
                          onClick={() => setViewingClient(item.org)}
                          className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Display complete client details, operator info, GSTIN, and active subscriptions"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Filters, Search & Sorting Controls */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by client name, email, phone, category, GSTIN, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors font-medium shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown & Order Toggle & Refresh */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex-1 sm:flex-initial">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500 font-bold uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 cursor-pointer w-full"
                >
                  <option value="date">Date Joined</option>
                  <option value="name">Company Name (A-Z)</option>
                  <option value="status">Status</option>
                  <option value="revenue">Paid Revenue</option>
                </select>
              </div>

              <button
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
                title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
              >
                <span>{sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}</span>
              </button>

              <button
                onClick={() => fetchOrganizations()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                title="Refresh Organizations & Live Status"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-600" : "text-slate-500"}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Status & Plan Lifecycle Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter By:
            </span>
            {(
              [
                { key: "ALL", label: "All Accounts", color: "bg-slate-900" },
                { key: "PENDING_APPROVAL", label: "Pending Approval", color: "bg-amber-600" },
                { key: "ACTIVE", label: "Active", color: "bg-emerald-600" },
                { key: "UPCOMING_SOON", label: "Expiring Soon (≤14d)", color: "bg-orange-600" },
                { key: "COMPLETED", label: "Plan Expired / Completed", color: "bg-rose-700" },
                { key: "RENEWED", label: "Queued Renewal / Upgraded", color: "bg-purple-600" },
                { key: "SUSPENDED", label: "Suspended", color: "bg-rose-600" },
              ] as const
            ).map(tab => {
              const count = tab.key === "ALL"
                ? organizations.length
                : tab.key === "UPCOMING_SOON"
                ? organizations.filter(o => {
                    const subs = o.subscriptions || [];
                    const activeSub = subs[0];
                    if (!activeSub?.endDate) return false;
                    const diffDays = Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 14;
                  }).length
                : tab.key === "COMPLETED"
                ? organizations.filter(o => {
                    const subs = o.subscriptions || [];
                    const activeSub = subs[0];
                    return activeSub?.endDate ? new Date(activeSub.endDate).getTime() < Date.now() : false;
                  }).length
                : tab.key === "RENEWED"
                ? organizations.filter(o => {
                    const subs = o.subscriptions || [];
                    return subs.length > 1;
                  }).length
                : organizations.filter(o => o.status === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === tab.key
                      ? `${tab.color} text-white shadow-xs`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      statusFilter === tab.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="ml-auto text-[11px] text-slate-400 font-medium">
              Showing <strong>{filteredOrgs.length}</strong> of {organizations.length} accounts
            </div>
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
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-2xs ${
                        org.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 border border-amber-300 text-amber-800"
                          : "bg-sky-50 border border-sky-200 text-sky-700"
                      }`}>
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{org.name}</h2>
                          {org.pendingBusinessName && org.pendingBusinessName !== org.name && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Rename Request: &quot;{org.pendingBusinessName}&quot;
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            org.status === "ACTIVE"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : org.status === "PENDING_APPROVAL"
                              ? "bg-amber-50 border-amber-300 text-amber-800 font-extrabold"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}>
                            {org.status === "PENDING_APPROVAL" ? "PENDING APPROVAL (6-12h)" : org.status}
                          </span>
                          {org.status === "SUSPENDED" && org.suspensionReason && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1" title={org.suspensionReason}>
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Reason: {org.suspensionReason}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <button
                            onClick={() => copyToClipboard(org.id, "Organization ID")}
                            className="hover:text-sky-600 transition-colors flex items-center gap-1 font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-semibold cursor-pointer"
                          >
                            <Copy className="h-3 w-3 text-slate-400" />
                            ID: {org.id}
                          </button>
                          {org.subscriptions?.[0] && (
                            <span className="text-slate-600 font-semibold">
                              Plan: <strong className="text-brand-blue">{org.subscriptions[0].planName}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Bell icon for Client Messages with unread badge */}
                      {(() => {
                        const clientMsgs = (org.notifications || []).filter(
                          (n) => n.priority === "client_message" || (n.sender && n.sender.toLowerCase().startsWith("client"))
                        );
                        const unreadCount = clientMsgs.filter((n) => !n.isRead).length;

                        return (
                          <button
                            onClick={() => setViewingOrgMessages(org)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              unreadCount > 0
                                ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/30 animate-pulse"
                                : clientMsgs.length > 0
                                ? "bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
                            }`}
                            title={
                              unreadCount > 0
                                ? `🔔 ${unreadCount} new unread client message(s)! Click to view.`
                                : clientMsgs.length > 0
                                ? `View ${clientMsgs.length} messages received from this client`
                                : "View client messages inbox"
                            }
                          >
                            <Bell className={`h-3.5 w-3.5 ${unreadCount > 0 ? "text-white" : "text-amber-600"}`} />
                            <span className="inline">{unreadCount > 0 ? `${unreadCount} Msg` : "Messages"}</span>
                            {unreadCount > 0 && (
                              <span className="h-2 w-2 rounded-full bg-white animate-ping ml-0.5" />
                            )}
                          </button>
                        );
                      })()}

                      {org.status === "PENDING_APPROVAL" && (
                        <button
                          onClick={() => handleApproveOrg(org)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer ring-2 ring-emerald-500/20"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approve &amp; Activate</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenMessageModal(org)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                        title="Send direct broadcast or announcement to this client profile"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-sky-600" />
                        <span>Send Message</span>
                      </button>

                      <button
                        onClick={() => openEditModal(org)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-sky-600" />
                        <span>Modules</span>
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
                    
                    {/* Column 1: Client Admin & Contact Details */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-sky-600" /> Account Contact Details
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
                          {/* Phone Number Display */}
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> Phone:
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              {adminUser.phone || org.paymentTransactions?.[0]?.customerPhone || "Not specified"}
                            </span>
                          </div>
                          {org.businessCategory && (
                            <div className="flex justify-between items-center text-slate-600">
                              <span className="text-slate-500 font-medium">Category:</span>
                              <span className="text-slate-900 font-semibold truncate max-w-[140px] text-right" title={org.businessCategory}>
                                {org.businessCategory}
                              </span>
                            </div>
                          )}
                          {org.gstin && (
                            <div className="flex justify-between items-center text-slate-600">
                              <span className="text-slate-500 font-medium">GSTIN:</span>
                              <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {org.gstin}
                              </span>
                            </div>
                          )}
                          {org.aboutBusiness && (
                            <div className="pt-1 border-t border-slate-200/60">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">About:</span>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-tight italic">
                                &quot;{org.aboutBusiness}&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No admin user assigned</p>
                      )}
                    </div>

                    {/* Column 2: Subscription Plan Validity */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> Plan &amp; Validity
                        </p>
                        {org.subscriptions && org.subscriptions.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {org.subscriptions[0].durationMonths} Mo
                          </span>
                        )}
                      </div>

                      {org.subscriptions && org.subscriptions.length > 0 ? (
                        (() => {
                          const now = Date.now();
                          const subs = org.subscriptions || [];
                          // Find active subscription
                          const activeSub = subs.find(s => {
                            const start = new Date(s.startDate).getTime();
                            const end = new Date(s.endDate).getTime();
                            return (s.status === "ACTIVE" || !s.status) && start <= now && end >= now;
                          }) || subs[0];

                          return (
                            <div className="space-y-2.5 text-xs">
                              {/* Current Plan */}
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-slate-900 text-xs">{activeSub.planName}</span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Active Plan
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                                  <span>Active Since:</span>
                                  <span className="font-medium text-slate-700">
                                    {activeSub.startDate ? new Date(activeSub.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}{" "}
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {activeSub.startDate ? new Date(activeSub.startDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                  <span>Expires At:</span>
                                  <span className="font-bold text-slate-800">
                                    {activeSub.endDate ? new Date(activeSub.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}{" "}
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {activeSub.endDate ? new Date(activeSub.endDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <p className="text-xs text-slate-400 italic">No subscription record</p>
                      )}
                    </div>

                    {/* Column 3: Enabled Modules Count & Quick Preview */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      {(() => {
                        // Filter against recognized CRM modules so legacy or duplicate keys don't cause 15/12
                        const validModules = (org.enabledModules || []).filter((m) => ALL_MODULE_KEYS.includes(m));
                        const count = validModules.length;

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5 text-sky-600" /> Allowed Modules
                              </p>
                              <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                                {count} / {ALL_MODULE_KEYS.length}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                              {validModules.map((key) => (
                                <span
                                  key={key}
                                  className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold"
                                >
                                  {key}
                                </span>
                              ))}
                            </div>
                          </>
                        );
                      })()}

                      {/* Connected platform icons */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Integrations:</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${org.waConfig?.wabaId ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-200/60 text-slate-400"}`}>
                            WA {org.waConfig?.wabaId ? "✓" : "—"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${org.gmbConfig?.accountId ? "bg-blue-100 text-blue-800 font-bold" : "bg-slate-200/60 text-slate-400"}`}>
                            GMB {org.gmbConfig?.accountId ? "✓" : "—"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${org.gmailConfig?.emailAddress ? "bg-purple-100 text-purple-800 font-bold" : "bg-slate-200/60 text-slate-400"}`}>
                            Gmail {org.gmailConfig?.emailAddress ? "✓" : "—"}
                          </span>
                        </div>
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
                    <option value="PENDING_APPROVAL">PENDING APPROVAL (Waiting Verification)</option>
                    <option value="SUSPENDED">SUSPENDED (Block Login &amp; Access)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Input Box: Reason for Suspension */}
              {editStatus === "SUSPENDED" && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <label className="text-xs font-bold uppercase tracking-wider">
                      Reason for Account Suspension <span className="text-rose-600">*</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-rose-700 font-medium">
                    This reason will be recorded on the client profile and displayed to the user when they view their account or attempt login.
                  </p>
                  <textarea
                    rows={3}
                    required
                    value={editSuspensionReason}
                    onChange={(e) => setEditSuspensionReason(e.target.value)}
                    placeholder="E.g., Payment dispute pending, violation of Acceptable Use Policy, unverified KYC documents..."
                    className="w-full bg-white border border-rose-300 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 placeholder-slate-400 font-medium"
                  />
                </div>
              )}

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

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: Direct Message / Notification from Super Admin to Client */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {messagingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 border border-sky-200 text-sky-600 rounded-2xl">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Send Direct Message to Client
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Deliver immediate broadcast or alert to <strong>{messagingOrg.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessagingOrg(null)}
                className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">
                  Notification Title / Subject
                </label>
                <input
                  type="text"
                  required
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  placeholder="e.g. System Maintenance Notice, KYC Verification Required, Special Promotion"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Target Client
                  </label>
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px] truncate">
                    {messagingOrg.name} ({messagingOrg.id.slice(0, 8)}...)
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={msgPriority}
                    onChange={(e) => setMsgPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 text-xs cursor-pointer font-semibold"
                  >
                    <option value="normal">Normal Announcement</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">
                  Message Content <span className="text-sky-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Type your message to this client... This will immediately appear on their profile bell icon with timestamp."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-sky-500 placeholder-slate-400 font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  The client will instantly see an unread badge on their profile Notification Bell with exact date &amp; time of delivery.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMessagingOrg(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingMsg ? "Delivering..." : "Send to Client"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 4: Complete Client Details Viewer Modal */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0F52BA] text-white font-black text-lg flex items-center justify-center shadow-md shadow-brand-blue/20">
                  {viewingClient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {viewingClient.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      viewingClient.status === "ACTIVE"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : viewingClient.status === "PENDING_APPROVAL"
                        ? "bg-amber-50 border-amber-300 text-amber-800"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}>
                      {viewingClient.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Organization ID: {viewingClient.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingClient(null)}
                className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Operator Contact Details */}
            {(() => {
              const adminUser = viewingClient.users?.find((u: any) => u.role === "admin" || u.role === "client_admin") || viewingClient.users?.[0];
              const phone = adminUser?.phone || viewingClient.paymentTransactions?.[0]?.customerPhone;

              return (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-600" /> Registered Operator &amp; Contact
                      </span>
                      <span className="font-mono text-slate-400">Role: {adminUser?.role || "operator"}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
                        <p className="font-bold text-slate-900 text-xs mt-0.5">{adminUser?.name || "Client Admin"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Email</span>
                        <p className="font-mono font-bold text-slate-900 text-xs mt-0.5 truncate" title={adminUser?.email}>
                          {adminUser?.email || "No email"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</span>
                        <p className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                          {phone ? `📞 ${phone}` : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Business Profile */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-brand-blue" /> Commercial Business Information
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Business Category</span>
                        <p className="font-semibold text-slate-800 text-xs mt-0.5">
                          {viewingClient.businessCategory || "General Commercial Services"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">GSTIN / Tax ID</span>
                        <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                          {viewingClient.gstin ? (
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{viewingClient.gstin}</span>
                          ) : (
                            <span className="text-slate-400 font-normal italic">Unregistered</span>
                          )}
                        </p>
                      </div>

                      {viewingClient.businessAddress && (
                        <div className="sm:col-span-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> Physical Address
                          </span>
                          <p className="font-medium text-slate-700 text-xs mt-0.5 leading-relaxed">
                            {viewingClient.businessAddress}
                          </p>
                        </div>
                      )}

                      {viewingClient.businessWebsite && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" /> Official Website
                          </span>
                          <a
                            href={viewingClient.businessWebsite.startsWith("http") ? viewingClient.businessWebsite : `https://${viewingClient.businessWebsite}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-brand-blue hover:underline text-xs mt-0.5 block truncate"
                          >
                            {viewingClient.businessWebsite}
                          </a>
                        </div>
                      )}

                      {viewingClient.aboutBusiness && (
                        <div className="sm:col-span-2 pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">About / Summary</span>
                          <p className="text-xs text-slate-600 mt-0.5 italic leading-relaxed">
                            &quot;{viewingClient.aboutBusiness}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active and Queued Subscriptions */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Subscription History &amp; Schedules
                    </div>

                    {viewingClient.subscriptions && viewingClient.subscriptions.length > 0 ? (
                      <div className="space-y-2">
                        {viewingClient.subscriptions.map((sub, sIdx) => {
                          const isCurrent = sIdx === 0;
                          return (
                            <div
                              key={sub.id || sIdx}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                isCurrent
                                  ? "bg-white border-emerald-200 shadow-2xs"
                                  : "bg-purple-50/50 border-purple-200"
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 text-xs">{sub.planName}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                    isCurrent ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                                  }`}>
                                    {isCurrent ? "Active Plan" : "Queued Renewal"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3">
                                  <span>Start: <strong className="text-slate-700">{new Date(sub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                                  <span>Expires: <strong className="text-slate-700">{new Date(sub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="font-black text-slate-900 text-xs">
                                  ₹{sub.amountPaid?.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-medium">
                                  {sub.durationMonths} Months Duration
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs italic">No active or past subscription found.</p>
                    )}
                  </div>

                  {/* Suspension Reason if Suspended */}
                  {viewingClient.status === "SUSPENDED" && viewingClient.suspensionReason && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                        Account Suspension Reason
                      </span>
                      <p className="text-xs font-bold text-rose-900">
                        &quot;{viewingClient.suspensionReason}&quot;
                      </p>
                    </div>
                  )}

                  {/* Footer Action Buttons inside Detail Modal */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const target = viewingClient;
                        setViewingClient(null);
                        handleOpenMessageModal(target);
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Direct Message</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const target = viewingClient;
                          setViewingClient(null);
                          openEditModal(target);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Manage Modules
                      </button>
                      <button
                        onClick={() => setViewingClient(null)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 5: Sent Messages Audit & Read Receipts History Modal */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {showSentHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Sent Messages &amp; Client Read Receipts
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Audit Log ({sentNotifications.length})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Track all admin announcements delivered to clients with delivery and read receipt status
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchSentNotifications()}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Refresh sent messages history"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingSentHistory ? "animate-spin text-indigo-600" : ""}`} />
                </button>
                <button
                  onClick={() => setShowSentHistoryModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter / Search within Sent Messages */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter sent messages by client name, subject, or message content..."
                  value={sentHistorySearch}
                  onChange={(e) => setSentHistorySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900 text-xs rounded-xl pl-8 pr-6 py-2 outline-none font-medium transition-colors"
                />
                {sentHistorySearch && (
                  <button
                    onClick={() => setSentHistorySearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-semibold shrink-0">
                Read: <strong className="text-emerald-700">{sentNotifications.filter(n => n.isRead).length}</strong> / Unread: <strong className="text-amber-700">{sentNotifications.filter(n => !n.isRead).length}</strong>
              </div>
            </div>

            {/* Sent Messages List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {loadingSentHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-xs font-semibold">Loading sent messages log...</span>
                </div>
              ) : sentNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1.5">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="font-bold text-slate-700">No sent messages yet</p>
                  <p className="text-[11px] text-slate-400">
                    Use the &quot;Send Message&quot; button on any client organization or activity card to send your first message.
                  </p>
                </div>
              ) : (
                (() => {
                  const q = sentHistorySearch.toLowerCase().trim();
                  const list = sentNotifications.filter(n =>
                    !q ||
                    n.message.toLowerCase().includes(q) ||
                    (n.title && n.title.toLowerCase().includes(q)) ||
                    (n.organization?.name && n.organization.name.toLowerCase().includes(q)) ||
                    n.organizationId.toLowerCase().includes(q)
                  );

                  if (list.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No sent messages match your search &quot;{sentHistorySearch}&quot;.
                      </div>
                    );
                  }

                  return list.map((item) => {
                    const sentDate = new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const sentTime = new Date(item.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const readDate = item.readAt ? new Date(item.readAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) : null;
                    const readTime = item.readAt ? new Date(item.readAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : null;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                          item.isRead
                            ? "bg-white border-slate-200/90 shadow-2xs"
                            : "bg-amber-50/40 border-amber-200/90 shadow-2xs"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                              {item.organization?.name || "Client Organization"}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              (ID: {item.organizationId.slice(0, 8)}...)
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                              item.priority === "urgent"
                                ? "bg-rose-100 text-rose-800"
                                : item.priority === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}>
                              {item.priority}
                            </span>
                          </div>

                          {/* Read vs Unread Status Tag */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {item.isRead ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Read by Client</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Delivered (Unread)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message Subject & Body */}
                        <div className="space-y-1 pl-3 border-l-2 border-indigo-200">
                          <h4 className="text-xs font-black text-slate-900">
                            {item.title || "Super Admin Notice"}
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {item.message}
                          </p>
                        </div>

                        {/* Timestamp Footer: Sent time vs Read time */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                          <div className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Sent on: <strong>{sentDate} at {sentTime}</strong></span>
                          </div>

                          {(() => {
                            const isFromClient = item.priority === "client_message" || (item.sender && item.sender.toLowerCase().startsWith("client"));

                            if (item.isRead) {
                              return (
                                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>{isFromClient ? "Reviewed by Admin" : `Read on: ${readDate || sentDate} at ${readTime || sentTime}`}</span>
                                </div>
                              );
                            }

                            if (isFromClient) {
                              return (
                                <span className="text-amber-700 font-semibold italic flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                  Received from client (Awaiting Admin Review)
                                </span>
                              );
                            }

                            return (
                              <span className="text-amber-700 font-semibold italic">
                                Waiting for client to view on Profile
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSentHistoryModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Broadcast Notification to All Clients */}
      {showBroadcastAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-100 text-violet-700 rounded-xl">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Broadcast Notification to All Clients
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Send an instant announcement or update directly to client dashboards & profile bells
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastAllModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Target Audience & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={bcastTargetStatus}
                    onChange={(e) => setBcastTargetStatus(e.target.value as "ALL" | "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED")}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="ALL">All Clients ({organizations.length})</option>
                    <option value="ACTIVE">
                      Active Only ({organizations.filter((o) => o.status === "ACTIVE").length})
                    </option>
                    <option value="SUSPENDED">
                      Suspended Only ({organizations.filter((o) => o.status === "SUSPENDED").length})
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={bcastPriority}
                    onChange={(e) => setBcastPriority(e.target.value as "normal" | "high" | "urgent")}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="normal">Normal (Information / Update)</option>
                    <option value="high">High (Important Notice)</option>
                    <option value="urgent">Urgent (Action Required / Downtime)</option>
                  </select>
                </div>
              </div>

              {/* Title / Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notification Title / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled System Maintenance / New Feature Release"
                  value={bcastTitle}
                  onChange={(e) => setBcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Broadcast Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your message here. All target client organizations will receive this instantly in their notification center..."
                  value={bcastContent}
                  onChange={(e) => setBcastContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Target recipient preview banner */}
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-2.5 text-xs text-violet-800">
                <Bell className="w-4 h-4 text-violet-600 shrink-0" />
                <span>
                  This notification will be delivered to{" "}
                  <strong className="font-bold underline">
                    {bcastTargetStatus === "ALL"
                      ? `${organizations.length} organizations`
                      : bcastTargetStatus === "ACTIVE"
                      ? `${organizations.filter((o) => o.status === "ACTIVE").length} active organizations`
                      : `${organizations.filter((o) => o.status === "SUSPENDED").length} suspended organizations`}
                  </strong>
                  . Clients will see a notification badge on their profile and dashboard.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowBroadcastAllModal(false)}
                disabled={broadcastingAll}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcastAll}
                disabled={broadcastingAll || !bcastContent.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {broadcastingAll ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send to All Clients</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Client Messages & Inquiries for specific organization */}
      {viewingOrgMessages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Client Inquiries &amp; Messages
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                      {viewingOrgMessages.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Messages and replies sent by this client from their account profile
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingOrgMessages(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp-Style Conversation History for this specific client */}
            <div className="overflow-y-auto space-y-3 flex-1 p-3 bg-slate-100/70 rounded-2xl border border-slate-200/80 min-h-[340px] max-h-[460px]">
              {(() => {
                // Get all messages between this company and admin
                const thread = (viewingOrgMessages.notifications || []).slice().sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                if (thread.length === 0) {
                  return (
                    <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700">No message history with {viewingOrgMessages.name} yet</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Type a message below to start a direct WhatsApp-style conversation with this client.
                      </p>
                    </div>
                  );
                }

                return thread.map((item) => {
                  const isClient = item.priority === "client_message" || (item.sender && item.sender.toLowerCase().startsWith("client"));
                  const sentDate = new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  });
                  const sentTime = new Date(item.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col ${isClient ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-2xs space-y-1 relative ${
                          isClient
                            ? "bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs"
                            : "bg-emerald-600 text-white rounded-tr-xs"
                        }`}
                      >
                        {/* Header tag */}
                        <div className="flex items-center justify-between gap-3 text-[10px] pb-1 border-b border-black/5">
                          <span className={`font-black ${isClient ? "text-slate-700" : "text-emerald-100"}`}>
                            {isClient ? (item.sender || viewingOrgMessages.name) : "Super Admin"}
                          </span>
                          {isClient && !item.isRead && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-extrabold uppercase text-[8px] animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Title if present */}
                        {item.title && item.title !== "Message to Super Admin" && item.title !== "Important Update from Platform Admin" && (
                          <div className={`text-[11px] font-bold ${isClient ? "text-slate-800" : "text-emerald-100"}`}>
                            {item.title}
                          </div>
                        )}

                        {/* Message body */}
                        <p className={`text-xs whitespace-pre-wrap leading-relaxed font-normal ${isClient ? "text-slate-800" : "text-white"}`}>
                          {item.message}
                        </p>

                        {/* Footer timestamp & status */}
                        <div className={`flex items-center justify-end gap-1.5 text-[9px] pt-0.5 ${isClient ? "text-slate-400" : "text-emerald-200"}`}>
                          <span>{sentDate}, {sentTime}</span>
                          {!isClient && (
                            item.isRead ? (
                              <span className="font-bold text-white flex items-center gap-0.5">
                                <Check className="w-3 h-3 text-sky-200" /> Read
                              </span>
                            ) : (
                              <span>✓ Sent</span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Quick mark-as-read if unread client message */}
                      {isClient && !item.isRead && (
                        <button
                          onClick={async () => {
                            try {
                              await fetch(`${BACKEND_URL}/api/admin/notifications/${item.id}/read`, {
                                method: "POST",
                              });
                              setOrganizations((prev) =>
                                prev.map((o) =>
                                  o.id === viewingOrgMessages.id
                                    ? {
                                        ...o,
                                        notifications: (o.notifications || []).map((n) =>
                                          n.id === item.id ? { ...n, isRead: true } : n
                                        ),
                                      }
                                    : o
                                )
                              );
                              setViewingOrgMessages((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      notifications: (prev.notifications || []).map((n) =>
                                        n.id === item.id ? { ...n, isRead: true } : n
                                      ),
                                    }
                                  : null
                              );
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="text-[10px] text-sky-600 hover:text-sky-800 hover:underline font-bold mt-1 ml-2 cursor-pointer"
                        >
                          ✓ Mark as read
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Instant In-Thread Reply Form (WhatsApp Style) */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const content = msgContent.trim();
                if (!content || !viewingOrgMessages) return;

                setSendingMsg(true);
                try {
                  const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${viewingOrgMessages.id}/notifications`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: "Admin Reply",
                      message: content,
                      priority: "normal",
                    }),
                  });

                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to send message");
                  }

                  // Create new local notification item in state
                  const newMsgItem: SentNotificationItem = {
                    id: data.notification?.id || Math.random().toString(),
                    organizationId: viewingOrgMessages.id,
                    title: "Admin Reply",
                    message: content,
                    priority: "normal",
                    sender: "Super Admin",
                    isRead: false,
                    createdAt: new Date().toISOString(),
                  };

                  setViewingOrgMessages((prev) =>
                    prev
                      ? {
                          ...prev,
                          notifications: [...(prev.notifications || []), newMsgItem],
                        }
                      : null
                  );

                  setOrganizations((prev) =>
                    prev.map((o) =>
                      o.id === viewingOrgMessages.id
                        ? {
                            ...o,
                            notifications: [...(o.notifications || []), newMsgItem],
                          }
                        : o
                    )
                  );

                  setMsgContent("");
                  showToast(`✓ Message sent to ${viewingOrgMessages.name}`);
                  fetchSentNotifications(true);
                } catch (err: any) {
                  alert(err.message || "Failed to send message");
                } finally {
                  setSendingMsg(false);
                }
              }}
              className="pt-2 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Type a reply to ${viewingOrgMessages.name}...`}
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none transition-all font-medium"
              />

              <button
                type="submit"
                disabled={sendingMsg || !msgContent.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {sendingMsg ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewingOrgMessages(null);
                  setMsgContent("");
                }}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
