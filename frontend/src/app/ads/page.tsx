"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign,
  Target, Plus, Play, Pause, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap, BarChart2,
  Search, Trash2, Edit3, ChevronDown, Globe, Tag, Link2,
  Phone, Bell, LayoutGrid, List, Info, PlusCircle, ArrowUpRight,
  Activity, Calendar, Filter, Download, Bot, Settings, Users,
  Layers, FileText, TrendingDown, Award, Star, RotateCcw, 
  Building2, Check, Minus, BadgePercent, ShieldCheck, MessageSquare,
  Copy, ExternalLink, Sliders, LogOut, History, User
} from "lucide-react";
import { GoogleAdsProfileModal } from "@/components/ads/GoogleAdsProfileModal";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "";
};

const DATE_RANGES = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "Last 90 Days", value: "LAST_90_DAYS" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sc(status: string) {
  const m: Record<string, string> = {
    ENABLED: "text-emerald-700 bg-emerald-50 border-emerald-200",
    ACTIVE:  "text-emerald-700 bg-emerald-50 border-emerald-200",
    PAUSED:  "text-amber-700 bg-amber-50 border-amber-200",
    REMOVED: "text-rose-700 bg-rose-50 border-rose-200",
    OPEN:    "text-blue-700 bg-blue-50 border-blue-200",
  };
  return m[status] || "text-slate-600 bg-slate-100 border-slate-200";
}

function fmt(n: number | string, prefix = "") {
  const num = Number(n);
  if (isNaN(num) || num === undefined || num === null) return `${prefix}0`;
  return `${prefix}${num.toLocaleString()}`;
}

function api(path: string, opts?: RequestInit) {
  return fetch(`${BACKEND}/api/ads${path}`, opts);
}

// ─── Small UI components ──────────────────────────────────────────────────────
function Pill({ status }: { status: string }) {
  return <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${sc(status)}`}>{status}</span>;
}

function Stat({ label, value, sub, color = "text-slate-900" }: { label: string; value: any; sub?: string; color?: string }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-xs font-bold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 hover:border-blue-300 transition-all shadow-2xs group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub, action, onAction }: any) {
  return (
    <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <p className="text-slate-900 font-bold text-base">{title}</p>
      <p className="text-slate-500 text-xs max-w-xs">{sub}</p>
      {action && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: any) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative z-10 bg-white border border-slate-200 rounded-2xl shadow-md flex flex-col max-h-[90vh] ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
      <input
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${props.className || ""}`}
      />
    </div>
  );
}

function Select({ label, children, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
      <select
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer ${props.className || ""}`}
      >
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
      <textarea
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 resize-none focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${props.className || ""}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SELECTOR DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function AccountSelector({ accounts, selected, onSelect, loading, orgId }: any) {
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function connectFromGoogle() {
    setFetching(true);
    try {
      const res = await api(`/accessible-customers?orgId=${orgId}`);
      const data = await res.json();
      if (data.customerIds?.length) {
        for (const cid of data.customerIds) {
          await api("/connect-customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgId, customerId: cid })
          });
        }
        window.location.reload();
      }
    } finally {
      setFetching(false);
    }
  }

  const current = accounts.find((a: any) => a.customerId === selected);

  return (
    <div className="relative z-[60]" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all min-w-[200px] cursor-pointer shadow-2xs"
      >
        <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
        <span className="flex-1 text-left truncate">{current?.name || (selected ? `ID: ${selected}` : "Select Account")}</span>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 z-[200] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Google Ads Accounts</p>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
            {accounts.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500">No accounts saved yet</p>
                <button
                  onClick={connectFromGoogle}
                  disabled={fetching}
                  className="mt-2 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Import from Google
                </button>
              </div>
            ) : (
              accounts.map((acc: any) => (
                <button
                  key={acc.customerId}
                  onClick={() => { onSelect(acc.customerId); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-all cursor-pointer ${
                    selected === acc.customerId ? "bg-blue-50/70" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    acc.isManager ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {acc.isManager ? "M" : acc.name?.[0] || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{acc.name || `Account ${acc.customerId}`}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{acc.customerId} · {acc.currencyCode || "INR"}</p>
                  </div>
                  {selected === acc.customerId && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-slate-100 bg-slate-50">
            <button
              onClick={connectFromGoogle}
              disabled={fetching}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
            >
              {fetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Import accounts from Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT PICKER SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function AccountPickerScreen({
  orgId,
  onAccountSelected,
  onDisconnect,
  showToast
}: {
  orgId: string;
  onAccountSelected: (id: string) => void;
  onDisconnect?: () => void;
  showToast: (msg: string) => void;
}) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const [accessibleCids, setAccessibleCids] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [customCid, setCustomCid] = useState("");
  const [logs, setLogs] = useState<{ ts: string; level: "info" | "error" | "warn"; msg: string }[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  function log(level: "info" | "error" | "warn", msg: string) {
    setLogs(prev => [{ ts: new Date().toLocaleTimeString(), level, msg }, ...prev.slice(0, 49)]);
  }

  async function fetchAccessible() {
    setLoading(true);
    log("info", `Fetching accessible customers from ${BACKEND_URL}/api/ads/accessible-customers…`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/accessible-customers?orgId=${orgId}`);
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      const data = JSON.parse(text);
      setAccessibleCids(data.customerIds || []);
      log("info", `Found ${data.customerIds?.length || 0} accessible accounts`);
    } catch (e: any) {
      log("error", `fetchAccessible failed: ${e.message}`);
      showToast("Could not fetch accounts from Google profile");
    } finally {
      setLoading(false);
    }
  }

  async function connectAndSelect(cid: string) {
    const cleanCid = cid.replace(/-/g, "").trim();
    setConnecting(cleanCid);
    log("info", `Connecting customer ${cleanCid}…`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/connect-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, customerId: cleanCid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect account");
      log("info", `Customer ${cleanCid} connected successfully! Selecting…`);
      showToast(`Connected account ${cleanCid} ✓`);
      onAccountSelected(cleanCid);
    } catch (e: any) {
      log("error", `connectAndSelect failed: ${e.message}`);
      showToast(`Error: ${e.message}`);
    } finally {
      setConnecting(null);
    }
  }

  useEffect(() => { fetchAccessible(); }, []);

  const levelColor = { info: "text-blue-600", error: "text-rose-600 font-bold", warn: "text-amber-600" };

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
            <Globe className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Select a Google Ads Account</h1>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Choose which Google Ads account to manage in this workspace. You can switch accounts at any time.
          </p>
          {onDisconnect && (
            <div className="pt-1">
              <button
                onClick={onDisconnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5" /> Disconnect Google
              </button>
            </div>
          )}
        </div>

        {/* Account list card */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700">Accounts Found on your Google Profile</span>
            <button
              onClick={fetchAccessible}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {!loading && accessibleCids.length === 0 && (
              <div className="py-10 text-center space-y-3 px-6">
                <AlertCircle className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="text-slate-700 text-xs font-bold">No accounts found</p>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                  This can happen if the Google account connected has no Google Ads accounts. Try connecting manually below.
                </p>
              </div>
            )}

            {loading && (
              <div className="py-10 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <p className="text-slate-600 text-xs font-medium">Fetching accounts from Google…</p>
              </div>
            )}

            {accessibleCids.map(cid => {
              const cleanCid = cid.replace(/-/g, "");
              return (
                <div key={cid} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {cid[0]}
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-900">{cid}</p>
                      <p className="text-[10px] text-slate-500">Customer ID</p>
                    </div>
                  </div>
                  <button
                    onClick={() => connectAndSelect(cid)}
                    disabled={connecting === cleanCid}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {connecting === cleanCid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    Connect &amp; Use
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual ID entry */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
          <h2 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600" />
            Enter Account ID Manually
          </h2>
          <p className="text-[11px] text-slate-500">If your account isn't listed above, enter the Customer ID directly.</p>
          <div className="flex gap-2">
            <input
              value={customCid}
              onChange={e => setCustomCid(e.target.value)}
              placeholder="e.g. 123-456-7890 or 1234567890"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={() => { if (customCid.trim()) { connectAndSelect(customCid.trim()); setCustomCid(""); } }}
              disabled={!customCid.trim() || !!connecting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "overview" | "recommendations" | "campaigns" | "ad-groups" | "ads" | "keywords" | "extensions" | "conversions" | "audiences" | "reports" | "history" | "settings";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview",         label: "Overview",         icon: LayoutGrid    },
  { id: "recommendations",  label: "Recommendations",  icon: Sparkles      },
  { id: "campaigns",        label: "Campaigns",        icon: Megaphone     },
  { id: "ad-groups",        label: "Ad Groups",        icon: Layers        },
  { id: "ads",              label: "Ads",              icon: FileText      },
  { id: "keywords",         label: "Keywords",         icon: Tag           },
  { id: "extensions",       label: "Extensions",       icon: Link2         },
  { id: "conversions",      label: "Conversions",      icon: Target        },
  { id: "audiences",        label: "Audiences",        icon: Users         },
  { id: "reports",          label: "Reports",          icon: BarChart2     },
  { id: "history",          label: "Change History",   icon: History       },
  { id: "settings",         label: "Settings",         icon: Settings      },
];

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS TAB COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface SettingsTabProps {
  orgId: string;
  accounts: any[];
  selectedCustomerId: string;
  onSelectAccount: (id: string) => void;
  onAccountsRefresh: () => void;
  showToast: (msg: string) => void;
  onOpenProfile?: () => void;
  onDisconnect?: () => void;
  isDisconnecting?: boolean;
}

function SettingsTab({
  orgId,
  accounts,
  selectedCustomerId,
  onSelectAccount,
  onAccountsRefresh,
  showToast,
  onOpenProfile,
  onDisconnect,
  isDisconnecting
}: SettingsTabProps) {
  const [accessibleCids, setAccessibleCids] = useState<string[]>([]);
  const [loadingAccessible, setLoadingAccessible] = useState(false);
  const [customCid, setCustomCid] = useState("");
  const [isSettingUpManager, setIsSettingUpManager] = useState(false);
  const [isConnectingClient, setIsConnectingClient] = useState(false);

  const fetchAccessible = async () => {
    setLoadingAccessible(true);
    try {
      const res = await api(`/accessible-customers?orgId=${orgId}`);
      if (!res.ok) throw new Error("Failed to load accessible customers");
      const data = await res.json();
      setAccessibleCids(data.customerIds || []);
    } catch (e: any) {
      showToast(e.message || "Failed to fetch accessible accounts");
    } finally {
      setLoadingAccessible(false);
    }
  };

  useEffect(() => {
    fetchAccessible();
  }, []);

  const handleSetupManager = async (managerId: string) => {
    if (!managerId) return;
    setIsSettingUpManager(true);
    try {
      const res = await api("/setup-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, managerCustomerId: managerId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to setup manager account");
      }
      const result = await res.json();
      showToast(`MCC Setup complete! Imported ${result.subAccountsFound} sub-accounts.`);
      onAccountsRefresh();
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setIsSettingUpManager(false);
    }
  };

  const handleConnectClient = async (cid: string) => {
    if (!cid) return;
    setIsConnectingClient(true);
    try {
      const infoRes = await api(`/customer-info?orgId=${orgId}&customerId=${cid}`);
      let info: any = null;
      if (infoRes.ok) {
        info = await infoRes.json();
      }
      
      const res = await api("/connect-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: cid,
          name: info?.descriptiveName || `Account ${cid}`,
          currencyCode: info?.currencyCode,
          timeZone: info?.timeZone,
          isManager: info?.manager || false
        })
      });
      if (!res.ok) throw new Error("Failed to connect account");
      showToast("Account connected successfully!");
      onAccountsRefresh();
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setIsConnectingClient(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Active Account Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-600" /> Active Account Settings
        </h2>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-emerald-900 font-bold">Google Integration Active</p>
            {selectedCustomerId ? (
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Current active account for workspace: <strong className="font-mono">{selectedCustomerId}</strong>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-0.5">Please connect or select an account below to view campaign data.</p>
            )}
          </div>
          {selectedCustomerId && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              Google Ads Profile
            </button>
          )}
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              disabled={isDisconnecting}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition-all font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              {isDisconnecting ? "Disconnecting..." : "Disconnect Google"}
            </button>
          )}
          <a
            href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads&source=google_ads`}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all font-bold shadow-2xs"
          >
            Switch Account
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Available Accounts from your Google Profile */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" /> 1. Connect / Choose Accounts
            </h3>
            <button 
              onClick={fetchAccessible} 
              disabled={loadingAccessible}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title="Refresh profile accounts"
            >
              <RefreshCw className={`h-4 w-4 ${loadingAccessible ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Below are all Google Ads accounts accessible via your linked Google email. Select which ones to connect to this CRM:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {loadingAccessible ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              </div>
            ) : accessibleCids.length === 0 ? (
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                No accounts found or Google OAuth not completed.
              </div>
            ) : (
              accessibleCids.map(cid => {
                const cleanCid = cid.replace(/-/g, "");
                const isAlreadyConnected = accounts.some(acc => acc.customerId === cleanCid);
                return (
                  <div key={cid} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-2xs transition-all">
                    <span className="text-xs font-mono text-slate-900 font-bold">{cid}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSetupManager(cid)}
                        disabled={isSettingUpManager || isAlreadyConnected}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all cursor-pointer"
                        title="Import all sub-accounts under this MCC Manager"
                      >
                        Import Sub-Accounts
                      </button>
                      <button
                        onClick={() => handleConnectClient(cid)}
                        disabled={isConnectingClient || isAlreadyConnected}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isAlreadyConnected 
                          ? "bg-slate-100 text-slate-500 border border-transparent cursor-not-allowed" 
                          : "bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 cursor-pointer"
                        }`}
                      >
                        {isAlreadyConnected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Custom / Missing Account ID</h4>
            <div className="flex gap-2">
              <input
                value={customCid}
                onChange={e => setCustomCid(e.target.value)}
                placeholder="e.g. 123-456-7890"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                onClick={() => { handleConnectClient(customCid); setCustomCid(""); }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
              >
                Connect Custom
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Connected accounts & selector */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" /> 2. Selected CRM Accounts
          </h3>
          <p className="text-[11px] text-slate-500">
            Choose which client account to act as your active Workspace for managing campaigns, budgets, and viewing AI analyses:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {accounts.length === 0 ? (
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                No accounts currently connected to your organization. Use the panel on the left to add one.
              </div>
            ) : (
              accounts.map(acc => {
                const isActive = selectedCustomerId === acc.customerId;
                return (
                  <div 
                    key={acc.customerId} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isActive 
                        ? "border-blue-500 bg-blue-50/60 shadow-2xs" 
                        : "border-slate-200 bg-slate-50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        acc.isManager ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {acc.isManager ? "M" : "C"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{acc.name || `Account ${acc.customerId}`}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{acc.customerId} · {acc.currencyCode || "INR"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {acc.isManager && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                          Manager
                        </span>
                      )}
                      <button
                        onClick={() => onSelectAccount(acc.customerId)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? "bg-blue-600 text-white shadow-2xs" 
                            : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {isActive ? "Active" : "Use Account"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SearchParamsHandler({ onOAuth }: { onOAuth: (status: string, tab: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth") || "";
    const tabParam = searchParams.get("tab") || "";
    if (oauthStatus || tabParam) {
      onOAuth(oauthStatus, tabParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, onOAuth]);
  return null;
}

export default function GoogleAdsPage() {
  const [orgId, setOrgId] = useState<string>(getOrgId());
  const router = useRouter();

  useEffect(() => {
    setOrgId(getOrgId());
  }, []);

  const [isConnected, setIsConnected] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);

  const [adGroups, setAdGroups] = useState<any[]>([]);
  const [adGroupsLoading, setAdGroupsLoading] = useState(false);

  const [ads, setAds] = useState<any[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);

  const [keywords, setKeywords] = useState<any[]>([]);
  const [kwLoading, setKwLoading] = useState(false);

  const [extensions, setExtensions] = useState<any[]>([]);
  const [extLoading, setExtLoading] = useState(false);

  const [conversions, setConversions] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(false);

  const [audiences, setAudiences] = useState<any[]>([]);
  const [audLoading, setAudLoading] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Native Google Ads Recommendations State
  const [nativeRecommendations, setNativeRecommendations] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [applyingRecId, setApplyingRecId] = useState<string | null>(null);
  const [dismissingRecId, setDismissingRecId] = useState<string | null>(null);
  const [recFilter, setRecFilter] = useState<string>("ALL");
  const [selectedRecDetails, setSelectedRecDetails] = useState<any>(null);
  const [confirmApplyRec, setConfirmApplyRec] = useState<any>(null);
  const [confirmDismissRec, setConfirmDismissRec] = useState<any>(null);

  // Change History State (READ-ONLY)
  const [changeHistory, setChangeHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("ALL");
  const [historyUserFilter, setHistoryUserFilter] = useState<string>("");
  const [historyDateFilter, setHistoryDateFilter] = useState<string>("LAST_30_DAYS");
  const [selectedChangeDetail, setSelectedChangeDetail] = useState<any | null>(null);

  const [searchTerms, setSearchTerms] = useState<any[]>([]);
  const [adReport, setAdReport] = useState<any[]>([]);

  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [kwSearch, setKwSearch] = useState("");
  const [campSearch, setCampSearch] = useState("");

  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [newKwAdGroupRes, setNewKwAdGroupRes] = useState("");
  const [newKwAdGroupId, setNewKwAdGroupId] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newKwMatchType, setNewKwMatchType] = useState("BROAD");
  const [addingKw, setAddingKw] = useState(false);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Account Readiness & Health State
  const [accountReadiness, setAccountReadiness] = useState<{
    overallStatus: "READY" | "WARNING" | "BLOCKED" | "UNKNOWN";
    summary?: { readyCount: number; warningCount: number; blockedCount: number };
    checks?: { key: string; status: string; classification: string; message: string }[];
    blockedReason?: string;
  } | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);

  // Campaign Details states
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<any>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"info" | "assets" | "targeting" | "all" | "ad-groups" | "ads" | "keywords" | "ai">("info");
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailName, setDetailName] = useState("");
  const [detailBudget, setDetailBudget] = useState(500);
  const [detailStatus, setDetailStatus] = useState("PAUSED");
  const [detailEndDate, setDetailEndDate] = useState("");
  const [detailFinalUrl, setDetailFinalUrl] = useState("");
  const [detailBiddingStrategy, setDetailBiddingStrategy] = useState("");
  const [newHeadlineInput, setNewHeadlineInput] = useState("");
  const [newDescInput, setNewDescInput] = useState("");
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [newLocationInput, setNewLocationInput] = useState("");
  const [newLanguageInput, setNewLanguageInput] = useState("");
  const [editingParamField, setEditingParamField] = useState<string | null>(null);
  const [tempParamValue, setTempParamValue] = useState<any>("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleOAuthParams = useCallback((oauthStatus: string, tabParam: string) => {
    if (oauthStatus === "success" || tabParam === "settings") {
      setActiveTab("settings");
      if (oauthStatus === "success") {
        showToast("✅ Google account connected! Fetching your ad accounts…");
        // Re-fetch config & accounts after reconnect so old data appears immediately
        (async () => {
          try {
            const res = await fetch(`${BACKEND}/api/gmb/config?orgId=${getOrgId()}`);
            const data = await res.json();
            const connected = !!data.googleRefreshToken;
            setIsConnected(connected);
            if (data.googleAdsCustomerId) {
              const cid = data.googleAdsCustomerId.replace(/-/g, "");
              setSelectedCustomerId(cid);
            }
            if (connected) {
              // Re-fetch accounts list (re-activated on backend)
              const accRes = await api(`/accounts?orgId=${getOrgId()}`);
              const accData = await accRes.json();
              if (Array.isArray(accData)) setAccounts(accData);
            }
          } catch (e) {
            console.warn("Failed to re-fetch config after OAuth:", e);
          }
        })();
      }
    }
    if (oauthStatus === "error") {
      showToast("❌ Google OAuth failed. Please try connecting again.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setConfigLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/gmb/config?orgId=${orgId}`);
        const data = await res.json();
        const activeCfg = data?.config || data || {};
        setIsConnected(!!(activeCfg.googleRefreshToken || data?.googleRefreshToken));
        const adsCid = activeCfg.googleAdsCustomerId || data?.googleAdsCustomerId;
        if (adsCid) setSelectedCustomerId(adsCid.replace(/-/g, ""));
      } catch { } finally { setConfigLoading(false); }
    })();
  }, [orgId]);

  useEffect(() => {
    if (!isConnected) return;
    setAccountsLoading(true);
    api(`/accounts?orgId=${orgId}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAccounts(d); })
      .catch(() => {})
      .finally(() => setAccountsLoading(false));
  }, [isConnected, orgId]);

  const loadReadiness = useCallback(async (cid: string) => {
    if (!cid) return;
    setReadinessLoading(true);
    try {
      const res = await api(`/account-readiness?orgId=${orgId}&customerId=${cid}`);
      if (res.ok) {
        const rawData = await res.json();
        const data = rawData.readiness || rawData;
        const checksList = Array.isArray(data.checks) ? data.checks : [];
        const blockedCheck = checksList.find((c: any) => c.status === "BLOCKED");
        setAccountReadiness({
          overallStatus: data.overallStatus || "UNKNOWN",
          summary: data.summary,
          checks: checksList,
          blockedReason: blockedCheck ? `${blockedCheck.key}: ${blockedCheck.message}` : undefined
        });
      }
    } catch (e: any) {
      console.warn("Readiness check error:", e.message);
    } finally {
      setReadinessLoading(false);
    }
  }, [orgId]);

  const loadOverview = useCallback(async (cid: string) => {
    setOverviewLoading(true);
    loadReadiness(cid);
    try {
      const [ovRes, campRes] = await Promise.allSettled([
        api(`/reports/overview?orgId=${orgId}&customerId=${cid}&dateRange=${dateRange}`),
        api(`/campaigns?orgId=${orgId}&customerId=${cid}`)
      ]);
      
      let campsData: any[] = [];
      if (campRes.status === "fulfilled" && campRes.value.ok) {
        const camps = await campRes.value.json();
        if (Array.isArray(camps)) {
          campsData = camps;
          setCampaigns(camps);
        }
      }

      if (ovRes.status === "fulfilled" && ovRes.value.ok) {
        const ov = await ovRes.value.json();
        if (ov && !ov.error) {
          setOverview(ov);
        }
      }
    } catch (e: any) { console.warn("Overview load:", e.message); } finally { setOverviewLoading(false); }
  }, [orgId, dateRange]);

  const loadCampaigns = useCallback(async (cid: string) => {
    setCampsLoading(true);
    try {
      const res = await api(`/campaigns?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load campaigns"); } finally { setCampsLoading(false); }
  }, [orgId]);

  const loadAdGroups = useCallback(async (cid: string) => {
    setAdGroupsLoading(true);
    try {
      const res = await api(`/ad-groups?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAdGroups(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load ad groups"); } finally { setAdGroupsLoading(false); }
  }, [orgId]);

  const loadAds = useCallback(async (cid: string) => {
    setAdsLoading(true);
    try {
      const res = await api(`/ads?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load ads"); } finally { setAdsLoading(false); }
  }, [orgId]);

  const loadKeywords = useCallback(async (cid: string) => {
    setKwLoading(true);
    try {
      const res = await api(`/keywords?orgId=${orgId}&customerId=${cid}&includeNegatives=true`);
      const data = await res.json();
      setKeywords(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load keywords"); } finally { setKwLoading(false); }
  }, [orgId]);

  const loadExtensions = useCallback(async (cid: string) => {
    setExtLoading(true);
    try {
      const res = await api(`/extensions?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setExtensions(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load extensions"); } finally { setExtLoading(false); }
  }, [orgId]);

  const loadConversions = useCallback(async (cid: string) => {
    setConvLoading(true);
    try {
      const res = await api(`/conversions?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setConversions(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load conversions"); } finally { setConvLoading(false); }
  }, [orgId]);

  const loadAudiences = useCallback(async (cid: string) => {
    setAudLoading(true);
    try {
      const res = await api(`/audiences?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAudiences(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load audiences"); } finally { setAudLoading(false); }
  }, [orgId]);

  const loadRecommendations = useCallback(async (cid: string) => {
    setRecsLoading(true);
    try {
      const res = await api(`/recommendations?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.recommendations)) {
        setNativeRecommendations(data.recommendations);
      } else {
        setNativeRecommendations([]);
      }
    } catch {
      showToast("Failed to load Google Ads recommendations");
      setNativeRecommendations([]);
    } finally {
      setRecsLoading(false);
    }
  }, [orgId]);

  const handleApplyRecommendation = async (rec: any) => {
    if (!rec?.resourceName || !selectedCustomerId) return;
    setApplyingRecId(rec.id);
    try {
      const res = await api("/recommendations/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: selectedCustomerId,
          resourceName: rec.resourceName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply recommendation");
      showToast("Google Ads recommendation applied successfully ✓");
      setConfirmApplyRec(null);
      setSelectedRecDetails(null);
      loadRecommendations(selectedCustomerId);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to apply recommendation"}`);
    } finally {
      setApplyingRecId(null);
    }
  };

  const handleDismissRecommendation = async (rec: any) => {
    if (!rec?.resourceName || !selectedCustomerId) return;
    setDismissingRecId(rec.id);
    try {
      const res = await api("/recommendations/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: selectedCustomerId,
          resourceName: rec.resourceName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dismiss recommendation");
      showToast("Recommendation dismissed from Google Ads ✓");
      setConfirmDismissRec(null);
      setSelectedRecDetails(null);
      loadRecommendations(selectedCustomerId);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to dismiss recommendation"}`);
    } finally {
      setDismissingRecId(null);
    }
  };

  const loadReports = useCallback(async (cid: string) => {
    try {
      const [stRes, adRep] = await Promise.all([
        api(`/reports/search-terms?orgId=${orgId}&customerId=${cid}&dateRange=${dateRange}`),
        api(`/reports/ads?orgId=${orgId}&customerId=${cid}&dateRange=${dateRange}`)
      ]);
      const st = await stRes.json();
      const ar = await adRep.json();
      if (Array.isArray(st)) setSearchTerms(st);
      if (Array.isArray(ar)) setAdReport(ar);
    } catch { showToast("Failed to load reports"); }
  }, [orgId, dateRange]);

  const loadChangeHistory = useCallback(async (cid: string) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({
        orgId,
        customerId: cid,
        dateRange: historyDateFilter,
        limit: "50",
      });
      if (historyTypeFilter !== "ALL") {
        params.append("changeResourceType", historyTypeFilter);
      }
      if (historyUserFilter.trim()) {
        params.append("userEmail", historyUserFilter.trim());
      }
      const res = await api(`/change-history?${params.toString()}`);
      const data = await res.json();
      const list = Array.isArray(data.changeHistory) ? data.changeHistory : (Array.isArray(data.changes) ? data.changes : []);
      if (res.ok) {
        setChangeHistory(list);
      } else {
        setChangeHistory([]);
      }
    } catch {
      showToast("Failed to load Google Ads change history");
      setChangeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [orgId, historyDateFilter, historyTypeFilter, historyUserFilter]);

  useEffect(() => {
    if (!isConnected || !selectedCustomerId) return;
    const cid = selectedCustomerId;
    if (activeTab === "overview") loadOverview(cid);
    if (activeTab === "recommendations") loadRecommendations(cid);
    if (activeTab === "campaigns") loadCampaigns(cid);
    if (activeTab === "ad-groups") loadAdGroups(cid);
    if (activeTab === "ads") loadAds(cid);
    if (activeTab === "keywords") loadKeywords(cid);
    if (activeTab === "extensions") loadExtensions(cid);
    if (activeTab === "conversions") loadConversions(cid);
    if (activeTab === "audiences") loadAudiences(cid);
    if (activeTab === "reports") loadReports(cid);
    if (activeTab === "history") loadChangeHistory(cid);
  }, [activeTab, selectedCustomerId, isConnected, dateRange, loadOverview, loadRecommendations, loadCampaigns, loadAdGroups, loadAds, loadKeywords, loadExtensions, loadConversions, loadAudiences, loadReports, loadChangeHistory]);

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectGoogleAds = async () => {
    if (!confirm("Are you sure you want to disconnect Google Ads and log out? You will need to reconnect to view your campaigns.")) return;
    setIsDisconnecting(true);
    try {
      const res = await api("/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect Google Ads");
      setIsConnected(false);
      setSelectedCustomerId("");
      setAccounts([]);
      setCampaigns([]);
      setAdGroups([]);
      setAds([]);
      setKeywords([]);
      setExtensions([]);
      setConversions([]);
      setAudiences([]);
      setOverview(null);
      showToast("Successfully disconnected Google Ads.");
    } catch (e: any) {
      showToast(`Error: ${e.message || "Failed to disconnect"}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSelectAccount = async (cid: string) => {
    setSelectedCustomerId(cid);
    try {
      await api("/select-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, customerId: cid })
      });
    } catch (e) {
      console.error("Failed to select account on backend:", e);
    }
  };

  async function toggleCampaign(c: any) {
    const newStatus = c.liveStatus === "ENABLED" || c.status === "ENABLED" ? "PAUSED" : "ENABLED";
    setToggling(c.id);
    try {
      const res = await api("/campaign/status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, campaignId: c.id, customerId: selectedCustomerId, status: newStatus })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(`Campaign ${newStatus === "ENABLED" ? "enabled" : "paused"} ✓`);
      loadCampaigns(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); } finally { setToggling(null); }
  }

  async function deleteCampaign(c: any) {
    if (!confirm(`Remove campaign "${c.name}"? This will remove it from Google Ads.`)) return;
    try {
      const res = await api(`/campaigns/${c.id}?orgId=${orgId}&customerId=${selectedCustomerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Campaign removed");
      loadCampaigns(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); }
  }

  async function deleteKeyword(kw: any) {
    try {
      const res = await api(`/keywords/${kw.id}?orgId=${orgId}&customerId=${selectedCustomerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Keyword removed");
      loadKeywords(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); }
  }

  async function addKeywords() {
    if (!newKeywords.trim() || !newKwAdGroupRes) { showToast("Enter keywords and select an ad group"); return; }
    setAddingKw(true);
    try {
      const kwList = newKeywords.split("\n").filter(k => k.trim()).map(text => ({ text: text.trim(), matchType: newKwMatchType }));
      const res = await api("/keywords", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, customerId: selectedCustomerId, adGroupId: newKwAdGroupId, adGroupResourceName: newKwAdGroupRes, keywords: kwList })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(`${kwList.length} keywords added ✓`);
      setShowAddKeyword(false); setNewKeywords(""); loadKeywords(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); } finally { setAddingKw(false); }
  }

  async function analyzeCampaign(c: any) {
    setAnalyzing(true); setAnalysis(null); setShowAnalysis(true);
    try {
      const [kwRes, stRes] = await Promise.all([
        api(`/keywords?orgId=${orgId}&customerId=${selectedCustomerId}&adGroupId=${c.googleAdsCampaignId}`),
        api(`/reports/search-terms?orgId=${orgId}&customerId=${selectedCustomerId}&dateRange=${dateRange}`)
      ]);
      const kws = await kwRes.json();
      const sts = await stRes.json();

      const res = await api("/analyze-campaign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignData: c, keywords: kws.slice(0, 20), searchTerms: sts.slice(0, 20) })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setAnalysis(data);
    } catch (e: any) { showToast(`Analysis failed: ${e.message}`); setShowAnalysis(false); } finally { setAnalyzing(false); }
  }

  async function saveCampaignDetails() {
    if (!selectedCampaignDetails || !detailName.trim()) { showToast("Campaign name is required"); return; }
    setIsSavingDetails(true);
    try {
      const res = await api(`/campaigns/${selectedCampaignDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: selectedCustomerId,
          name: detailName.trim(),
          budget: Number(detailBudget) || undefined,
          status: detailStatus,
          endDate: detailEndDate || undefined,
          finalUrl: detailFinalUrl || undefined,
          biddingStrategy: detailBiddingStrategy || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      showToast("Campaign settings updated live ✓");
      setSelectedCampaignDetails((prev: any) => ({
        ...prev,
        name: detailName.trim(),
        budget: Number(detailBudget) || prev.budget,
        status: detailStatus,
        liveStatus: detailStatus,
        endDate: detailEndDate ? new Date(detailEndDate) : null,
        finalUrl: detailFinalUrl,
        biddingStrategy: detailBiddingStrategy
      }));
      loadCampaigns(selectedCustomerId);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function saveSingleField(fieldKey: string, newValue: any) {
    if (!selectedCampaignDetails) return;
    setIsSavingDetails(true);
    try {
      const payload: any = {
        orgId,
        customerId: selectedCustomerId,
        [fieldKey]: newValue
      };
      const res = await api(`/campaigns/${selectedCampaignDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Field update failed");
      showToast(`Updated ${fieldKey} successfully ✓`);
      setSelectedCampaignDetails((prev: any) => ({
        ...prev,
        [fieldKey]: newValue
      }));
      setEditingParamField(null);
      loadCampaigns(selectedCustomerId);
    } catch (e: any) {
      showToast(`Error updating ${fieldKey}: ${e.message}`);
    } finally {
      setIsSavingDetails(false);
    }
  }

  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalCost = campaigns.reduce((s, c) => s + parseFloat(c.cost || "0"), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const avgCtr = campaigns.length > 0 ? (campaigns.reduce((s, c) => s + parseFloat(c.ctr || "0"), 0) / campaigns.length).toFixed(2) + "%" : "0%";
  const enabledCamps = campaigns.filter(c => (c.liveStatus || c.status) === "ENABLED").length;

  const filteredKw = keywords.filter(kw => kw.text?.toLowerCase().includes(kwSearch.toLowerCase()));
  const filteredCamps = campaigns.filter(c => c.name?.toLowerCase().includes(campSearch.toLowerCase()));

  if (configLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Header Skeleton */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-200 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-9 w-36 bg-slate-200 rounded-xl" />
        </div>

        {/* Content Body Skeleton */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-7 w-28 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-100 rounded-xl" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 border border-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-slate-900 font-bold">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Google Ads Manager</h1>
              <p className="text-[11px] text-slate-500">Google Search, PMax &amp; YouTube Platform</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-lg text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Megaphone className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Connect Google Ads</h1>
              <p className="text-slate-600 text-xs leading-relaxed">
                Connect your Google account to manage search campaigns, track keywords, monitor conversions, and run AI-powered optimization — all without leaving your CRM.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {["Campaign Management", "Ad Group & Ad Control", "Keyword Research", "Performance Reports", "Conversion Tracking", "AI Recommendations"].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <a
              href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads&source=google_ads`}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all shadow-sm mx-auto w-fit"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect with Google
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && !selectedCustomerId) {
    return (
      <AccountPickerScreen
        orgId={orgId}
        onAccountSelected={handleSelectAccount}
        onDisconnect={handleDisconnectGoogleAds}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden">
      <Suspense fallback={null}>
        <SearchParamsHandler onOAuth={handleOAuthParams} />
      </Suspense>

      {/* ── Top Header Bar ── */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shrink-0 gap-3 flex-wrap shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-slate-900 font-bold">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">Google Ads</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Campaigns, Performance, Keywords &amp; Optimization</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isConnected && (
            <AccountSelector
              accounts={accounts}
              selected={selectedCustomerId}
              onSelect={handleSelectAccount}
              loading={accountsLoading}
              orgId={orgId}
            />
          )}

          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
          >
            {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          <button
            onClick={() => selectedCustomerId && activeTab === "overview" ? loadOverview(selectedCustomerId) : selectedCustomerId && loadCampaigns(selectedCustomerId)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Unified Google Ads Profile & Account Status Button */}
          {selectedCustomerId && (
            <button
              onClick={() => router.push(`/ads/profile?customerId=${selectedCustomerId}`)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
              title="View Google Ads Profile, Health Status & Business Settings"
            >
              <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Google Ads Profile</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  accountReadiness?.overallStatus === "READY"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : accountReadiness?.overallStatus === "BLOCKED"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : accountReadiness?.overallStatus === "WARNING"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-slate-200 text-slate-600 border border-slate-300"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    accountReadiness?.overallStatus === "READY"
                      ? "bg-emerald-600 animate-pulse"
                      : accountReadiness?.overallStatus === "BLOCKED"
                      ? "bg-rose-600"
                      : accountReadiness?.overallStatus === "WARNING"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                {readinessLoading
                  ? "Checking..."
                  : accountReadiness?.overallStatus === "READY"
                  ? "Active"
                  : accountReadiness?.overallStatus === "BLOCKED"
                  ? "Action Required"
                  : accountReadiness?.overallStatus === "WARNING"
                  ? "Attention"
                  : "Health"}
              </span>
            </button>
          )}

          {selectedCustomerId && (
            <button
              onClick={() => {
                if (accountReadiness?.overallStatus === "BLOCKED") {
                  showToast(`Cannot create campaigns: ${accountReadiness.blockedReason || "Account has a confirmed blocker."}`);
                  return;
                }
                router.push(`/ads/campaigns/create/manual?customerId=${selectedCustomerId}`);
              }}
              disabled={accountReadiness?.overallStatus === "BLOCKED"}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                accountReadiness?.overallStatus === "BLOCKED"
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              title={accountReadiness?.overallStatus === "BLOCKED" ? `Campaign creation blocked: ${accountReadiness.blockedReason}` : "Create a new campaign"}
            >
              <Plus className="h-4 w-4" /> New Campaign
            </button>
          )}

          {isConnected ? (
            <button
              onClick={handleDisconnectGoogleAds}
              disabled={isDisconnecting}
              title="Disconnect Google Ads and log out"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <LogOut className="h-4 w-4 shrink-0" />
              )}
              <span>{isDisconnecting ? "Disconnecting..." : "Disconnect"}</span>
            </button>
          ) : (
            <a
              href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads&source=google_ads`}
              title="Connect Google account"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Connect Google</span>
            </a>
          )}
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white overflow-x-auto shrink-0 px-4">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === t.id ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {!selectedCustomerId && activeTab !== "settings" ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 text-slate-500 mx-auto" />
            <p className="text-slate-900 font-bold text-sm">Select a Google Ads account</p>
            <p className="text-slate-500 text-xs">Use the account selector in the header to choose an active account.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ══ OVERVIEW TAB ══ */}
          {activeTab === "overview" && (
            <>
              {overviewLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <MetricCard icon={Eye} label="Impressions" value={overview ? Number(overview.impressions).toLocaleString() : totalImpressions.toLocaleString()} color="bg-blue-50 text-blue-700" />
                    <MetricCard icon={MousePointerClick} label="Clicks" value={overview ? Number(overview.clicks).toLocaleString() : totalClicks.toLocaleString()} color="bg-blue-50 text-blue-700" />
                    <MetricCard icon={TrendingUp} label="CTR" value={overview?.ctr || avgCtr} color="bg-emerald-50 text-emerald-700" />
                    <MetricCard icon={DollarSign} label="Spend" value={`₹${overview?.cost || totalCost.toFixed(2)}`} color="bg-amber-50 text-amber-700" />
                    <MetricCard icon={Target} label="Conversions" value={overview ? Number(overview.conversions).toFixed(1) : totalConversions} color="bg-purple-50 text-purple-700" />
                    <MetricCard icon={Activity} label="Avg. CPC" value={`₹${overview?.avgCpc || "0.00"}`} color="bg-indigo-50 text-indigo-700" />
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Active Campaigns", val: enabledCamps, icon: Megaphone, color: "text-emerald-700 bg-emerald-50" },
                      { label: "Total Campaigns", val: campaigns.length, icon: Layers, color: "text-blue-700 bg-blue-50" },
                      { label: "Cost/Conversion", val: `₹${overview?.costPerConversion || "0.00"}`, icon: BadgePercent, color: "text-amber-700 bg-amber-50" },
                      { label: "Conv. Value", val: `₹${overview?.allConversionsValue || "0.00"}`, icon: Award, color: "text-purple-700 bg-purple-50" }
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">{s.val}</p>
                          <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent campaigns table */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-blue-600" />Campaigns <span className="text-slate-500 font-normal">({campaigns.length})</span></h2>
                      <button onClick={() => setActiveTab("campaigns")} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">View all <ChevronRight className="h-3.5 w-3.5" /></button>
                    </div>
                    {campaigns.slice(0, 5).map(c => (
                      <div key={c.id} className="px-5 py-3.5 flex items-center gap-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCampaignDetails(c);
                                setActiveDetailsTab("info");
                                setDetailName(c.name);
                                setDetailBudget(c.budget);
                                setDetailStatus(c.liveStatus || c.status);
                                setDetailEndDate(c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "");
                              }}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left text-sm truncate max-w-[200px] block focus:outline-none cursor-pointer"
                            >
                              {c.name}
                            </button>
                            <Pill status={c.liveStatus || c.status} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{c.campaignType || "SEARCH"} · ₹{c.budget}/day</p>
                        </div>
                        <div className="flex gap-6 text-center">
                          <Stat label="Impr." value={Number(c.impressions || 0).toLocaleString()} />
                          <Stat label="Clicks" value={Number(c.clicks || 0).toLocaleString()} />
                          <Stat label="Spend" value={`₹${c.cost || "0.00"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ RECOMMENDATIONS TAB ══ */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {/* Header and Control Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Google Ads &amp; CRM Recommendations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official live optimization suggestions from Google Ads API alongside Jisnu AI intelligence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setRecFilter("ALL")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                      }`}
                    >
                      All ({nativeRecommendations.length})
                    </button>
                    <button
                      onClick={() => setRecFilter("APPLIABLE")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recFilter === "APPLIABLE" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                      }`}
                    >
                      Actionable ({nativeRecommendations.filter(r => r.isAppliable).length})
                    </button>
                    <button
                      onClick={() => setRecFilter("VIEW_ONLY")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recFilter === "VIEW_ONLY" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                      }`}
                    >
                      View Only ({nativeRecommendations.filter(r => !r.isAppliable).length})
                    </button>
                  </div>

                  <button
                    onClick={() => loadRecommendations(selectedCustomerId)}
                    disabled={recsLoading}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                    title="Refresh Google Ads Recommendations"
                  >
                    <RefreshCw className={`h-4 w-4 ${recsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Two Separate Clear Sections */}
              <div className="space-y-6">
                {/* 1. Official Google Ads Recommendations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        Google Ads Recommendations
                      </h3>
                      <p className="text-[11px] text-slate-500">Official recommendations retrieved directly from your Google Ads account via Google Ads API</p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Google Ads API v24
                    </span>
                  </div>

                  {recsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs gap-3">
                      <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-500">Retrieving official recommendations from Google Ads...</p>
                    </div>
                  ) : nativeRecommendations.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2 shadow-2xs">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">No Pending Google Ads Recommendations</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Your Google Ads account is fully optimized according to Google Ads guidelines, or there are no new automated suggestions for this customer account at this time.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nativeRecommendations
                        .filter(r => {
                          if (recFilter === "APPLIABLE") return r.isAppliable;
                          if (recFilter === "VIEW_ONLY") return !r.isAppliable;
                          return true;
                        })
                        .map(rec => (
                          <div
                            key={rec.id || rec.resourceName}
                            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4 hover:border-blue-300 transition-all shadow-2xs group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono border border-slate-200 uppercase">
                                    {rec.type.replace(/_/g, " ")}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {rec.type.split("_").map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                                  </h4>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  rec.isAppliable 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                  {rec.isAppliable ? "Actionable in API" : "Manual / View Only"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {rec.campaignName ? (
                                  <>Applicable to campaign: <strong className="text-slate-800">{rec.campaignName}</strong></>
                                ) : (
                                  <>Account-wide Google Ads optimization opportunity.</>
                                )}
                              </p>

                              {/* Impact Stats if available */}
                              {rec.impact?.hasImpact && (
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px]">
                                  <div>
                                    <p className="text-slate-500 font-semibold">Clicks</p>
                                    <p className={`font-bold ${rec.impact.deltaClicks >= 0 ? "text-emerald-600" : "text-slate-700"}`}>
                                      {rec.impact.deltaClicks > 0 ? `+${rec.impact.deltaClicks}` : rec.impact.deltaClicks}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 font-semibold">Est. Cost</p>
                                    <p className="font-bold text-slate-800">₹{rec.impact.potentialCost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 font-semibold">Conversions</p>
                                    <p className={`font-bold ${rec.impact.deltaConversions >= 0 ? "text-purple-600" : "text-slate-700"}`}>
                                      {rec.impact.deltaConversions > 0 ? `+${rec.impact.deltaConversions.toFixed(1)}` : rec.impact.deltaConversions.toFixed(1)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => setSelectedRecDetails(rec)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                View Details
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setConfirmDismissRec(rec)}
                                  disabled={dismissingRecId === rec.id}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {dismissingRecId === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Dismiss"}
                                </button>

                                {rec.isAppliable ? (
                                  <button
                                    onClick={() => setConfirmApplyRec(rec)}
                                    disabled={applyingRecId === rec.id}
                                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    {applyingRecId === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    Apply
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setSelectedRecDetails(rec)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                                  >
                                    Review in Google
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* 2. Jisnu AI Recommendations */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        Jisnu AI Recommendations
                      </h3>
                      <p className="text-[11px] text-slate-500">AI-generated recommendations and performance audits based on CRM business context and live campaign search terms</p>
                    </div>
                    {campaigns.length > 0 && (
                      <button
                        onClick={() => analyzeCampaign(campaigns[0])}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Run AI Audit
                      </button>
                    )}
                  </div>

                  {analysis ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-4 pb-3 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center font-black text-xl text-purple-700">
                          {analysis.score}/10
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Campaign Health Assessment</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{analysis.assessment}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(analysis.recommendations || []).map((r: any, i: number) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900">{r.title}</p>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                r.impact === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>{r.impact}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{r.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-2 shadow-2xs">
                      <p className="text-xs font-bold text-slate-800">No active AI campaign audit cached</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Click &quot;Run AI Audit&quot; or select any campaign from the Campaigns tab to analyze search terms, negative keywords, and budget efficiency.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ CAMPAIGNS TAB ══ */}
          {activeTab === "campaigns" && (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    value={campSearch}
                    onChange={e => setCampSearch(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadCampaigns(selectedCustomerId)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/ads/campaigns/create/manual?customerId=${selectedCustomerId}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> New Campaign
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                {campsLoading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
                ) : filteredCamps.length === 0 ? (
                  <EmptyState icon={Megaphone} title="No campaigns" sub="Create your first campaign to start reaching customers." action="Create Campaign" onAction={() => router.push(`/ads/campaigns/create/manual?customerId=${selectedCustomerId}`)} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                          {["Campaign", "Status", "Type", "Budget/day", "Impressions", "Clicks", "CTR", "Spend", "Conv.", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredCamps.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="p-4 min-w-[180px]">
                              <button
                                onClick={() => {
                                  setSelectedCampaignDetails(c);
                                  setActiveDetailsTab("info");
                                  setDetailName(c.name || "");
                                  setDetailBudget(c.budget || 500);
                                  setDetailStatus(c.liveStatus || c.status || "PAUSED");
                                  setDetailEndDate(c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "");
                                  setDetailFinalUrl(c.finalUrl || "");
                                  setDetailBiddingStrategy(c.biddingStrategy || "Maximize conversions");
                                  setEditingParamField(null);
                                }}
                                className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left text-xs truncate max-w-[200px] block focus:outline-none cursor-pointer"
                              >
                                {c.name}
                              </button>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.googleAdsCampaignId || "Not synced"}</p>
                            </td>
                            <td className="p-4"><Pill status={c.liveStatus || c.status} /></td>
                            <td className="p-4 font-mono text-slate-600">{c.campaignType || "SEARCH"}</td>
                            <td className="p-4 font-semibold text-slate-900">₹{c.budget}</td>
                            <td className="p-4 font-semibold text-slate-900">{Number(c.impressions || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{Number(c.clicks || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{c.ctr || "0%"}</td>
                            <td className="p-4 font-bold text-emerald-700">₹{c.cost || "0.00"}</td>
                            <td className="p-4 font-semibold text-purple-700">{Number(c.conversions || 0).toFixed(1)}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedCampaignDetails(c);
                                    setActiveDetailsTab("info");
                                    setDetailName(c.name || "");
                                    setDetailBudget(c.budget || 500);
                                    setDetailStatus(c.liveStatus || c.status || "PAUSED");
                                    setDetailEndDate(c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "");
                                    setDetailFinalUrl(c.finalUrl || "");
                                    setDetailBiddingStrategy(c.biddingStrategy || "Maximize conversions");
                                    setEditingParamField(null);
                                  }}
                                  title="View Details & Settings"
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => toggleCampaign(c)}
                                  disabled={toggling === c.id || !c.googleAdsCampaignId}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    (c.liveStatus || c.status) === "ENABLED"
                                      ? "text-amber-700 hover:bg-amber-50"
                                      : "text-emerald-700 hover:bg-emerald-50"
                                  }`}
                                >
                                  {toggling === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (c.liveStatus || c.status) === "ENABLED" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                </button>
                                <button onClick={() => analyzeCampaign(c)} title="AI Analysis" className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-all cursor-pointer">
                                  <Bot className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => deleteCampaign(c)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
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
            </>
          )}

          {/* ══ AD GROUPS TAB ══ */}
          {activeTab === "ad-groups" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-blue-600" />Ad Groups <span className="text-slate-500 font-normal">({adGroups.length})</span></h2>
                <button onClick={() => loadAdGroups(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
              </div>
              {adGroupsLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
              ) : adGroups.length === 0 ? (
                <EmptyState icon={Layers} title="No ad groups" sub="Ad groups are automatically synced from your campaigns." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">{["Ad Group", "Status", "Type", "CPC Bid", "Impressions", "Clicks", "Spend", "Conv."].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {adGroups.map(ag => (
                        <tr key={ag.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="p-4"><p className="font-bold text-slate-900">{ag.name}</p><p className="text-[11px] text-slate-500 font-mono">{ag.id}</p></td>
                          <td className="p-4"><Pill status={ag.status} /></td>
                          <td className="p-4 text-slate-600 font-mono">{ag.type}</td>
                          <td className="p-4 font-semibold text-slate-900">{ag.cpcBidMicros ? `₹${(Number(ag.cpcBidMicros) / 1_000_000).toFixed(2)}` : "—"}</td>
                          <td className="p-4 font-semibold text-slate-900">{Number(ag.impressions || 0).toLocaleString()}</td>
                          <td className="p-4 font-semibold text-slate-900">{Number(ag.clicks || 0).toLocaleString()}</td>
                          <td className="p-4 font-bold text-emerald-700">₹{ag.cost || "0.00"}</td>
                          <td className="p-4 font-semibold text-purple-700">{Number(ag.conversions || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ ADS TAB ══ */}
          {activeTab === "ads" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" />Ads <span className="text-slate-500 font-normal">({ads.length})</span></h2>
                <button onClick={() => loadAds(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
              </div>
              {adsLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
              ) : ads.length === 0 ? (
                <EmptyState icon={FileText} title="No ads found" sub="Ads are synced from your Google Ads account. Create a campaign to generate ads." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {ads.map(ad => (
                    <div key={ad.id} className="p-5 hover:bg-slate-50/80 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Pill status={ad.status} />
                            <span className="text-xs font-mono text-slate-500">{ad.adType?.replace(/_/g, " ")}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${ad.adStrength === "EXCELLENT" ? "text-emerald-700 border-emerald-200 bg-emerald-50" : ad.adStrength === "GOOD" ? "text-blue-700 border-blue-200 bg-blue-50" : "text-slate-600 border-slate-200 bg-slate-100"}`}>
                              {ad.adStrength || "—"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-1">Group: <strong className="text-slate-700">{ad.adGroupName}</strong></p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {(ad.headlines || []).slice(0, 3).map((h: any, i: number) => (
                              <span key={i} className="text-xs bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200">{h.text || h}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(ad.descriptions || []).slice(0, 2).map((d: any, i: number) => (
                              <span key={i} className="text-xs text-slate-600">{d.text || d}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ KEYWORDS TAB ══ */}
          {activeTab === "keywords" && (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    value={kwSearch}
                    onChange={e => setKwSearch(e.target.value)}
                    placeholder="Search keywords..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadKeywords(selectedCustomerId)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowAddKeyword(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Keywords
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                {kwLoading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
                ) : filteredKw.length === 0 ? (
                  <EmptyState icon={Tag} title="No keywords found" sub="Add keywords to trigger your ads on Google searches." action="Add Keywords" onAction={() => setShowAddKeyword(true)} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                          {["Keyword", "Match Type", "Category", "Status", "Ad Group", "Actions"].map(h => (
                            <th key={h} className="p-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredKw.map(kw => (
                          <tr key={kw.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-4 font-bold text-slate-900">{kw.text}</td>
                            <td className="p-4"><span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">{kw.matchType}</span></td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kw.isNegative ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                {kw.isNegative ? "Negative" : "Positive"}
                              </span>
                            </td>
                            <td className="p-4"><Pill status={kw.status} /></td>
                            <td className="p-4 text-slate-600">{kw.adGroupName}</td>
                            <td className="p-4">
                              <button onClick={() => deleteKeyword(kw)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ EXTENSIONS TAB ══ */}
          {activeTab === "extensions" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Link2 className="h-4 w-4 text-blue-600" />Ad Assets &amp; Extensions <span className="text-slate-500 font-normal">({extensions.length})</span></h2>
                <button onClick={() => loadExtensions(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
              </div>
              {extLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
              ) : extensions.length === 0 ? (
                <EmptyState icon={Link2} title="No extensions" sub="Extensions add extra information to your ads like sitelinks and callouts." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {extensions.map(ext => (
                    <div key={ext.id} className="p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{ext.text || ext.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{ext.type} · {ext.url || "No link"}</p>
                      </div>
                      <Pill status={ext.status || "ENABLED"} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ CONVERSIONS TAB ══ */}
          {activeTab === "conversions" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Target className="h-4 w-4 text-emerald-600" />Conversion Goals <span className="text-slate-500 font-normal">({conversions.length})</span></h2>
                <button onClick={() => loadConversions(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
              </div>
              {convLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
              ) : conversions.length === 0 ? (
                <EmptyState icon={Target} title="No conversion goals" sub="Set up conversion tracking to measure the actions that matter to your business." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">{["Name", "Category", "Status", "Type", "Counting", "Lookback", "Conversions", "Conv. Value"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {conversions.map(conv => (
                        <tr key={conv.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="p-4 font-bold text-slate-900">{conv.name}</td>
                          <td className="p-4 text-slate-600">{conv.category}</td>
                          <td className="p-4"><Pill status={conv.status} /></td>
                          <td className="p-4 font-mono text-slate-500">{conv.type}</td>
                          <td className="p-4 text-slate-600">{conv.countingType}</td>
                          <td className="p-4 text-slate-600">{conv.lookbackWindow} days</td>
                          <td className="p-4 font-bold text-purple-700">{Number(conv.conversions || 0).toFixed(1)}</td>
                          <td className="p-4 font-bold text-emerald-700">₹{Number(conv.conversionsValue || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ AUDIENCES TAB ══ */}
          {activeTab === "audiences" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Users className="h-4 w-4 text-purple-600" />Audiences <span className="text-slate-500 font-normal">({audiences.length})</span></h2>
                <button onClick={() => loadAudiences(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
              </div>
              {audLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
              ) : audiences.length === 0 ? (
                <EmptyState icon={Users} title="No audiences" sub="Audiences help you reach people who have visited your site or match specific interests." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {audiences.map((aud: any) => (
                    <div key={aud.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/80 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 font-bold"><Users className="h-5 w-5" /></div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-xs">{aud.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{aud.type} · {aud.description || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">{aud.sizeForSearch ? Number(aud.sizeForSearch).toLocaleString() : "—"}</p>
                        <p className="text-[10px] text-slate-500">Search size</p>
                      </div>
                      <Pill status={aud.membershipStatus || "OPEN"} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ REPORTS TAB ══ */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Search Terms Report */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Search className="h-4 w-4 text-blue-600" />Search Terms Report <span className="text-slate-500 font-normal">({searchTerms.length})</span></h2>
                  <button onClick={() => loadReports(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
                </div>
                {searchTerms.length === 0 ? (
                  <EmptyState icon={Search} title="No search terms data" sub="Search term reports show what users searched to trigger your ads." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">{["Search Term", "Campaign", "Ad Group", "Status", "Impressions", "Clicks", "CTR", "Spend", "Conv."].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {searchTerms.map((st: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-4 font-bold text-slate-900">{st.searchTerm}</td>
                            <td className="p-4 text-slate-600">{st.campaignName}</td>
                            <td className="p-4 text-slate-600">{st.adGroupName}</td>
                            <td className="p-4 font-mono">{st.status}</td>
                            <td className="p-4 font-semibold text-slate-900">{Number(st.impressions || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{Number(st.clicks || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{st.ctr}</td>
                            <td className="p-4 font-bold text-emerald-700">₹{st.cost}</td>
                            <td className="p-4 font-semibold text-purple-700">{Number(st.conversions || 0).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Ad Performance Report */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><BarChart2 className="h-4 w-4 text-blue-600" />Ad Performance Report <span className="text-slate-500 font-normal">({adReport.length})</span></h2>
                </div>
                {adReport.length === 0 ? (
                  <EmptyState icon={BarChart2} title="No ad performance data" sub="Ad performance data will appear here once your ads start running." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">{["Ad ID", "Type", "Campaign", "Ad Group", "Strength", "Status", "Impressions", "Clicks", "CTR", "Spend", "Conv."].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {adReport.map((ad: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-4 text-slate-500 font-mono">{ad.adId}</td>
                            <td className="p-4 font-mono text-slate-600">{ad.adType?.replace(/_/g, " ")}</td>
                            <td className="p-4 text-slate-600">{ad.campaignName}</td>
                            <td className="p-4 text-slate-600">{ad.adGroupName}</td>
                            <td className="p-4"><span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${ad.adStrength === "EXCELLENT" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : ad.adStrength === "GOOD" ? "text-blue-700 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-100 border-slate-200"}`}>{ad.adStrength || "—"}</span></td>
                            <td className="p-4"><Pill status={ad.status} /></td>
                            <td className="p-4 font-semibold text-slate-900">{Number(ad.impressions || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{Number(ad.clicks || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{ad.ctr}</td>
                            <td className="p-4 font-bold text-emerald-700">₹{ad.cost}</td>
                            <td className="p-4 font-semibold text-purple-700">{Number(ad.conversions || 0).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ CHANGE HISTORY TAB (READ-ONLY) ══ */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Header and Filter Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900">Change History (Audit Log)</h2>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      Read-Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Track configuration and performance modifications across campaigns, ad groups, budgets, and ads directly from Google Ads change events.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => selectedCustomerId && loadChangeHistory(selectedCustomerId)}
                    disabled={historyLoading}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    title="Refresh Change History"
                  >
                    <RefreshCw className={`h-4 w-4 ${historyLoading ? "animate-spin text-indigo-600" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Date Range
                  </label>
                  <select
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="TODAY">Today</option>
                    <option value="LAST_7_DAYS">Last 7 Days</option>
                    <option value="LAST_30_DAYS">Last 30 Days (Default)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Resource Type
                  </label>
                  <select
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Resource Types</option>
                    <option value="CAMPAIGN">Campaign</option>
                    <option value="CAMPAIGN_BUDGET">Campaign Budget</option>
                    <option value="AD_GROUP">Ad Group</option>
                    <option value="AD_GROUP_AD">Ad Group Ad</option>
                    <option value="AD_GROUP_CRITERION">Ad Group Criterion (Keyword/Target)</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    User Email (Filter)
                  </label>
                  <input
                    type="text"
                    placeholder="Search by user email..."
                    value={historyUserFilter}
                    onChange={(e) => setHistoryUserFilter(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Table / List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-xs font-medium">Fetching Google Ads change events...</p>
                  </div>
                ) : changeHistory.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <History className="h-8 w-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No change history events found</p>
                    <p className="text-xs text-slate-400">
                      No changes were logged for this customer account within the selected date range and filters.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                          <th className="p-4">Date & Time</th>
                          <th className="p-4">User</th>
                          <th className="p-4">Resource Type</th>
                          <th className="p-4">Operation</th>
                          <th className="p-4">Campaign</th>
                          <th className="p-4">Ad Group</th>
                          <th className="p-4">Client / Source</th>
                          <th className="p-4 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {changeHistory.map((item: any, i: number) => {
                          const op = item.resourceChangeOperation || item.operation || "CHANGED";
                          const resType = item.changeResourceType || item.resourceType || "UNKNOWN";
                          const campName = item.campaignName || item.campaign?.name || "—";
                          const agName = item.adGroupName || item.adGroup?.name || "—";

                          const opColor =
                            op === "CREATE"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : op === "UPDATE"
                              ? "text-blue-700 bg-blue-50 border-blue-200"
                              : op === "REMOVE"
                              ? "text-rose-700 bg-rose-50 border-rose-200"
                              : "text-slate-600 bg-slate-50 border-slate-200";

                          return (
                            <tr key={item.resourceName || item.id || i} className="hover:bg-slate-50/80 transition-all">
                              <td className="p-4 font-mono text-slate-600 whitespace-nowrap">
                                {item.changeDateTime ? new Date(item.changeDateTime).toLocaleString() : "—"}
                              </td>
                              <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">{item.userEmail || "Google System / Automated"}</span>
                                </div>
                              </td>
                              <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono">
                                  {resType.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${opColor}`}>
                                  {op}
                                </span>
                              </td>
                              <td className="p-4 text-slate-700 font-medium">
                                {campName}
                              </td>
                              <td className="p-4 text-slate-600 font-medium">
                                {agName}
                              </td>
                              <td className="p-4 text-slate-500 font-mono text-[11px]">
                                {item.clientType?.replace(/_/g, " ") || "GOOGLE_ADS_WEB_CLIENT"}
                              </td>
                              <td className="p-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedChangeDetail(item)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SETTINGS TAB ══ */}
          {activeTab === "settings" && (
            <SettingsTab
              orgId={orgId}
              accounts={accounts}
              selectedCustomerId={selectedCustomerId}
              onSelectAccount={handleSelectAccount}
              onAccountsRefresh={() => api(`/accounts?orgId=${orgId}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setAccounts(d); })}
              showToast={showToast}
              onOpenProfile={() => router.push(`/ads/profile?customerId=${selectedCustomerId}`)}
              onDisconnect={handleDisconnectGoogleAds}
              isDisconnecting={isDisconnecting}
            />
          )}
        </div>
      )}

      {/* Add Keywords Modal */}
      {showAddKeyword && (
        <Modal title="Add Keywords" onClose={() => setShowAddKeyword(false)}>
          <div className="space-y-4">
            <Select label="Ad Group" value={newKwAdGroupRes} onChange={(e: any) => {
              const ag = adGroups.find(a => `customers/${selectedCustomerId}/adGroups/${a.id}` === e.target.value);
              setNewKwAdGroupRes(e.target.value);
              setNewKwAdGroupId(ag?.id || "");
            }}>
              <option value="">Select Ad Group</option>
              {adGroups.map(ag => <option key={ag.id} value={`customers/${selectedCustomerId}/adGroups/${ag.id}`}>{ag.name}</option>)}
            </Select>
            <Select label="Match Type" value={newKwMatchType} onChange={(e: any) => setNewKwMatchType(e.target.value)}>
              <option value="BROAD">Broad Match</option>
              <option value="PHRASE">Phrase Match</option>
              <option value="EXACT">Exact Match</option>
            </Select>
            <Textarea label="Keywords (one per line)" rows={6} value={newKeywords} onChange={(e: any) => setNewKeywords(e.target.value)} placeholder={"local SEO agency\ndigital marketing pune\ngmb setup service"} />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowAddKeyword(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={addKeywords} disabled={addingKw || !newKeywords.trim() || !newKwAdGroupRes}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-40 transition-all text-xs cursor-pointer shadow-sm">
                {addingKw ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Keywords
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Campaign Details Workspace Modal */}
      {selectedCampaignDetails && (
        <Modal
          title={`Campaign: ${selectedCampaignDetails.name}`}
          onClose={() => setSelectedCampaignDetails(null)}
          wide
        >
          <div className="space-y-5">
            {/* Modal Tabs: General Settings, Copy & Creative Assets, Targeting & Channels, All Parameters */}
            <div className="flex border-b border-slate-200 gap-1 pb-1">
              {[
                { id: "info", label: "Settings & Budget", icon: Settings },
                { id: "assets", label: "Copy & Assets", icon: FileText },
                { id: "targeting", label: "Targeting & Goals", icon: Target },
                { id: "all", label: "All Parameters", icon: Layers }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailsTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeDetailsTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: General Settings & Budget Edit */}
            {activeDetailsTab === "info" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Campaign Name *</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Editable
                      </span>
                    </div>
                    <Input
                      value={detailName}
                      onChange={(e: any) => setDetailName(e.target.value)}
                      placeholder="e.g. Summer Promotion - Search"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Daily Budget (₹) *</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Editable
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={detailBudget}
                      onChange={(e: any) => setDetailBudget(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">End Date (optional)</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Editable
                      </span>
                    </div>
                    <Input
                      type="date"
                      value={detailEndDate}
                      onChange={(e: any) => setDetailEndDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Status</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Editable
                      </span>
                    </div>
                    <Select
                      value={detailStatus}
                      onChange={(e: any) => setDetailStatus(e.target.value)}
                    >
                      <option value="ENABLED">Enabled (Active)</option>
                      <option value="PAUSED">Paused</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Bidding Strategy</label>
                    <Select
                      value={detailBiddingStrategy}
                      onChange={(e: any) => setDetailBiddingStrategy(e.target.value)}
                    >
                      <option value="Maximize conversions">Maximize Conversions</option>
                      <option value="Maximize clicks">Maximize Clicks</option>
                      <option value="Target CPA">Target CPA</option>
                      <option value="Target ROAS">Target ROAS</option>
                      <option value="Manual CPC">Manual CPC</option>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Final Landing Page URL</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Editable
                      </span>
                    </div>
                    <Input
                      value={detailFinalUrl}
                      onChange={(e: any) => setDetailFinalUrl(e.target.value)}
                      placeholder="https://example.com/promo"
                    />
                  </div>
                </div>

                {/* Campaign Quick Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Google Ads ID</p>
                    <p className="text-xs font-bold font-mono text-slate-900 truncate mt-0.5">{selectedCampaignDetails.googleAdsCampaignId || "Draft / Local"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Campaign Type</p>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{selectedCampaignDetails.campaignType || selectedCampaignDetails.advertisingChannelType || "SEARCH"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Start Date</p>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {selectedCampaignDetails.startDate ? new Date(selectedCampaignDetails.startDate).toISOString().split("T")[0] : "Today"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Database Record ID</p>
                    <p className="text-xs font-bold text-slate-700 truncate mt-0.5 font-mono" title={selectedCampaignDetails.id}>
                      {selectedCampaignDetails.id ? `${selectedCampaignDetails.id.slice(0, 10)}...` : "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={saveCampaignDetails}
                  disabled={isSavingDetails}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-40 text-xs shadow-sm cursor-pointer mt-3"
                >
                  {isSavingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save All Campaign Changes Live
                </button>
              </div>
            )}

            {/* TAB 2: Copy & Creative Assets */}
            {activeDetailsTab === "assets" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Final URL */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-600" /> Landing Page (Final URL):
                    </p>
                    <button
                      onClick={() => {
                        setEditingParamField(editingParamField === "finalUrl" ? null : "finalUrl");
                        setTempParamValue(selectedCampaignDetails.finalUrl || "");
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer bg-white px-2 py-0.5 rounded border border-blue-200"
                    >
                      <Edit3 className="h-3 w-3" /> Edit URL
                    </button>
                  </div>

                  {editingParamField === "finalUrl" ? (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="url"
                        value={tempParamValue}
                        onChange={(e) => setTempParamValue(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                      <button
                        onClick={() => saveSingleField("finalUrl", tempParamValue)}
                        disabled={isSavingDetails}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                      >
                        {isSavingDetails ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingParamField(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    selectedCampaignDetails.finalUrl ? (
                      <a href={selectedCampaignDetails.finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-mono break-all flex items-center gap-1">
                        {selectedCampaignDetails.finalUrl} <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    ) : (
                      <p className="text-slate-500 italic">No landing page URL configured.</p>
                    )
                  )}
                </div>

                {/* Headlines */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      Headlines ({Array.isArray(selectedCampaignDetails.headlines) ? selectedCampaignDetails.headlines.length : 0})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Max 30 chars each</span>
                  </div>

                  {/* Add Headline inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={30}
                      value={newHeadlineInput}
                      onChange={(e) => setNewHeadlineInput(e.target.value)}
                      placeholder="Add new headline (e.g. Best Service in Pune)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (!newHeadlineInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.headlines) ? [...selectedCampaignDetails.headlines] : [];
                        const updated = [...current, newHeadlineInput.trim()];
                        saveSingleField("headlines", updated);
                        setNewHeadlineInput("");
                      }}
                      disabled={!newHeadlineInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {Array.isArray(selectedCampaignDetails.headlines) && selectedCampaignDetails.headlines.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCampaignDetails.headlines.map((h: any, i: number) => {
                        const text = typeof h === "string" ? h : h.text || "";
                        const isEditingThis = editingParamField === `headline_${i}`;
                        return (
                          <div key={i} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between gap-2">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1 flex-1">
                                <input
                                  type="text"
                                  maxLength={30}
                                  value={tempParamValue}
                                  onChange={(e) => setTempParamValue(e.target.value)}
                                  className="flex-1 bg-white border border-blue-400 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const next = [...selectedCampaignDetails.headlines];
                                    next[i] = typeof h === "string" ? tempParamValue : { ...h, text: tempParamValue };
                                    saveSingleField("headlines", next);
                                  }}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="Save headline"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingParamField(null)}
                                  className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="truncate flex-1">{text}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] text-slate-500 font-mono">{text.length}/30</span>
                                  <button
                                    onClick={() => {
                                      setEditingParamField(`headline_${i}`);
                                      setTempParamValue(text);
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                    title="Edit headline"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const next = selectedCampaignDetails.headlines.filter((_: any, idx: number) => idx !== i);
                                      saveSingleField("headlines", next);
                                    }}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete headline"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">No custom headlines stored in database.</p>
                  )}
                </div>

                {/* Descriptions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                      Descriptions ({Array.isArray(selectedCampaignDetails.descriptions) ? selectedCampaignDetails.descriptions.length : 0})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Max 90 chars each</span>
                  </div>

                  {/* Add Description inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={90}
                      value={newDescInput}
                      onChange={(e) => setNewDescInput(e.target.value)}
                      placeholder="Add new description..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (!newDescInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.descriptions) ? [...selectedCampaignDetails.descriptions] : [];
                        const updated = [...current, newDescInput.trim()];
                        saveSingleField("descriptions", updated);
                        setNewDescInput("");
                      }}
                      disabled={!newDescInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {Array.isArray(selectedCampaignDetails.descriptions) && selectedCampaignDetails.descriptions.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedCampaignDetails.descriptions.map((d: any, i: number) => {
                        const text = typeof d === "string" ? d : d.text || "";
                        const isEditingThis = editingParamField === `desc_${i}`;
                        return (
                          <div key={i} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start justify-between gap-2">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1 flex-1">
                                <textarea
                                  maxLength={90}
                                  rows={2}
                                  value={tempParamValue}
                                  onChange={(e) => setTempParamValue(e.target.value)}
                                  className="flex-1 bg-white border border-purple-400 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none resize-none"
                                />
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => {
                                      const next = [...selectedCampaignDetails.descriptions];
                                      next[i] = typeof d === "string" ? tempParamValue : { ...d, text: tempParamValue };
                                      saveSingleField("descriptions", next);
                                    }}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                    title="Save description"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingParamField(null)}
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="flex-1">{text}</p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] text-slate-500 font-mono">{text.length}/90</span>
                                  <button
                                    onClick={() => {
                                      setEditingParamField(`desc_${i}`);
                                      setTempParamValue(text);
                                    }}
                                    className="p-1 text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                                    title="Edit description"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const next = selectedCampaignDetails.descriptions.filter((_: any, idx: number) => idx !== i);
                                      saveSingleField("descriptions", next);
                                    }}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete description"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">No descriptions stored in database.</p>
                  )}
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-emerald-600" />
                      Keywords ({Array.isArray(selectedCampaignDetails.keywords) ? selectedCampaignDetails.keywords.length : 0})
                    </h4>
                  </div>

                  {/* Add Keyword inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      placeholder="Add keyword (e.g. digital marketing pune)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        if (!newKeywordInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.keywords) ? [...selectedCampaignDetails.keywords] : [];
                        const updated = [...current, newKeywordInput.trim()];
                        saveSingleField("keywords", updated);
                        setNewKeywordInput("");
                      }}
                      disabled={!newKeywordInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {Array.isArray(selectedCampaignDetails.keywords) && selectedCampaignDetails.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampaignDetails.keywords.map((k: any, i: number) => {
                        const kwText = typeof k === "string" ? k : k.text || String(k);
                        return (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium rounded-md group">
                            <span>{kwText}</span>
                            <button
                              onClick={() => {
                                const next = selectedCampaignDetails.keywords.filter((_: any, idx: number) => idx !== i);
                                saveSingleField("keywords", next);
                              }}
                              className="text-emerald-500 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                              title="Remove keyword"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">No keywords saved yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Targeting & Goals */}
            {activeDetailsTab === "targeting" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Location Targeting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-600" /> Target Locations
                    </h4>
                    <span className="text-[10px] text-slate-500">Geographic Targeting</span>
                  </div>

                  {/* Add Location inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLocationInput}
                      onChange={(e) => setNewLocationInput(e.target.value)}
                      placeholder="Add target location (e.g. Pune, Mumbai, Maharashtra, India)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (!newLocationInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.geoTargets) ? [...selectedCampaignDetails.geoTargets] : [];
                        const updated = [...current, newLocationInput.trim()];
                        saveSingleField("geoTargets", updated);
                        setNewLocationInput("");
                      }}
                      disabled={!newLocationInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    {selectedCampaignDetails.geoTargets && Array.isArray(selectedCampaignDetails.geoTargets) && selectedCampaignDetails.geoTargets.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCampaignDetails.geoTargets.map((loc: any, i: number) => {
                          const locName = typeof loc === "string" ? loc : loc.name || loc.canonicalName || JSON.stringify(loc);
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-md font-medium text-[11px]">
                              <span>{locName}</span>
                              <button
                                onClick={() => {
                                  const next = selectedCampaignDetails.geoTargets.filter((_: any, idx: number) => idx !== i);
                                  saveSingleField("geoTargets", next);
                                }}
                                className="text-blue-500 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                                title="Remove location"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    ) : selectedCampaignDetails.geoTargets && typeof selectedCampaignDetails.geoTargets === "object" ? (
                      <div className="space-y-1 text-[11px] text-slate-700">
                        {Object.entries(selectedCampaignDetails.geoTargets).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 border-b border-slate-200 last:border-0">
                            <span className="font-bold text-slate-600 capitalize">{k}:</span>
                            <span>{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Default (All Locations / India)</p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Languages
                    </h4>
                  </div>

                  {/* Add Language inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguageInput}
                      onChange={(e) => setNewLanguageInput(e.target.value)}
                      placeholder="Add language (e.g. English, Hindi, Marathi)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        if (!newLanguageInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.languages) ? [...selectedCampaignDetails.languages] : [selectedCampaignDetails.language || "English"];
                        const updated = [...current, newLanguageInput.trim()];
                        saveSingleField("languages", updated);
                        setNewLanguageInput("");
                      }}
                      disabled={!newLanguageInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    {Array.isArray(selectedCampaignDetails.languages) && selectedCampaignDetails.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCampaignDetails.languages.map((lang: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md font-medium text-[11px]">
                            <span>{lang}</span>
                            <button
                              onClick={() => {
                                const next = selectedCampaignDetails.languages.filter((_: any, idx: number) => idx !== i);
                                saveSingleField("languages", next);
                              }}
                              className="text-amber-600 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                              title="Remove language"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md font-medium text-[11px]">
                        {selectedCampaignDetails.language || "English"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audience Signal & Schedule */}
                {selectedCampaignDetails.audienceSignal && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-purple-600" /> Audience Signal & Insights
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                      {typeof selectedCampaignDetails.audienceSignal === "object" ? (
                        Object.entries(selectedCampaignDetails.audienceSignal).map(([k, v]) => (
                          <div key={k} className="flex items-start justify-between py-1 border-b border-slate-200 last:border-0">
                            <span className="font-bold text-slate-600 capitalize text-[11px]">{k.replace(/([A-Z])/g, " $1")}:</span>
                            <span className="font-medium text-slate-900 text-right text-[11px]">
                              {Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px]">{String(selectedCampaignDetails.audienceSignal)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Clean Structured Human-Readable Parameters UI (Replaces Raw JSON) */}
            {activeDetailsTab === "all" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-blue-600" />
                      All Campaign Parameters & System Configuration
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Every parameter is displayed in structured form. Click any edit pen icon to update live.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    Live Record
                  </span>
                </div>

                {/* Section 1: Campaign Identity & Account */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-blue-600" /> Identity & IDs
                    </span>
                  </div>
                  <div className="p-3 space-y-2.5 divide-y divide-slate-100 text-xs">
                    {/* Campaign Name */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Name</p>
                        {editingParamField === "name" ? (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="text"
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(e.target.value)}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none"
                            />
                            <button
                              onClick={() => saveSingleField("name", tempParamValue)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="font-bold text-slate-900 mt-0.5">{selectedCampaignDetails.name || "—"}</p>
                        )}
                      </div>
                      {editingParamField !== "name" && (
                        <button
                          onClick={() => {
                            setEditingParamField("name");
                            setTempParamValue(selectedCampaignDetails.name || "");
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Campaign Name"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Google Ads Campaign ID */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Google Ads ID</p>
                        <p className="font-mono text-slate-800 mt-0.5">{selectedCampaignDetails.googleAdsCampaignId || "Draft (Not synced to Google yet)"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">System</span>
                    </div>

                    {/* Customer Account ID */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Google Ads Customer Account</p>
                        <p className="font-mono text-slate-800 mt-0.5">{selectedCampaignDetails.customerId || selectedCustomerId || "—"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Customer</span>
                    </div>

                    {/* Campaign Type */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Channel Type</p>
                        <p className="font-bold text-purple-700 mt-0.5">{selectedCampaignDetails.campaignType || selectedCampaignDetails.advertisingChannelType || "SEARCH"}</p>
                      </div>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">Channel</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Budget, Bidding & Status */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Budget, Status & Strategy
                    </span>
                  </div>
                  <div className="p-3 space-y-2.5 divide-y divide-slate-100 text-xs">
                    {/* Daily Budget */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Daily Budget</p>
                        {editingParamField === "budget" ? (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="number"
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(Number(e.target.value))}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none w-28"
                            />
                            <button
                              onClick={() => saveSingleField("budget", Number(tempParamValue))}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="font-bold text-emerald-700 text-sm mt-0.5">₹{selectedCampaignDetails.budget || 0} / day</p>
                        )}
                      </div>
                      {editingParamField !== "budget" && (
                        <button
                          onClick={() => {
                            setEditingParamField("budget");
                            setTempParamValue(selectedCampaignDetails.budget || 500);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Daily Budget"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Campaign Status */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Status</p>
                        {editingParamField === "status" ? (
                          <div className="flex gap-1.5 mt-1">
                            <select
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(e.target.value)}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none"
                            >
                              <option value="ENABLED">ENABLED (Active)</option>
                              <option value="PAUSED">PAUSED</option>
                            </select>
                            <button
                              onClick={() => saveSingleField("status", tempParamValue)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <Pill status={selectedCampaignDetails.liveStatus || selectedCampaignDetails.status || "PAUSED"} />
                          </div>
                        )}
                      </div>
                      {editingParamField !== "status" && (
                        <button
                          onClick={() => {
                            setEditingParamField("status");
                            setTempParamValue(selectedCampaignDetails.liveStatus || selectedCampaignDetails.status || "PAUSED");
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Status"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bidding Strategy */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Bidding Strategy</p>
                        {editingParamField === "biddingStrategy" ? (
                          <div className="flex gap-1.5 mt-1">
                            <select
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(e.target.value)}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none"
                            >
                              <option value="Maximize conversions">Maximize conversions</option>
                              <option value="Maximize clicks">Maximize clicks</option>
                              <option value="Target CPA">Target CPA</option>
                              <option value="Target ROAS">Target ROAS</option>
                              <option value="Manual CPC">Manual CPC</option>
                            </select>
                            <button
                              onClick={() => saveSingleField("biddingStrategy", tempParamValue)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="font-semibold text-slate-800 mt-0.5">{selectedCampaignDetails.biddingStrategy || "Maximize conversions"}</p>
                        )}
                      </div>
                      {editingParamField !== "biddingStrategy" && (
                        <button
                          onClick={() => {
                            setEditingParamField("biddingStrategy");
                            setTempParamValue(selectedCampaignDetails.biddingStrategy || "Maximize conversions");
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Bidding Strategy"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Schedule / End Date */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">End Date</p>
                        {editingParamField === "endDate" ? (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="date"
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(e.target.value)}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none"
                            />
                            <button
                              onClick={() => saveSingleField("endDate", tempParamValue ? new Date(tempParamValue) : null)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {selectedCampaignDetails.endDate ? new Date(selectedCampaignDetails.endDate).toISOString().split("T")[0] : "No End Date (Continuous)"}
                          </p>
                        )}
                      </div>
                      {editingParamField !== "endDate" && (
                        <button
                          onClick={() => {
                            setEditingParamField("endDate");
                            setTempParamValue(selectedCampaignDetails.endDate ? new Date(selectedCampaignDetails.endDate).toISOString().split("T")[0] : "");
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit End Date"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Ad Copy & Creative Assets */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-purple-600" /> Ad Copy, Landing Page & Keywords
                    </span>
                  </div>
                  <div className="p-3 space-y-3 divide-y divide-slate-100 text-xs">
                    {/* Final URL */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex-1 pr-2">
                        <p className="text-slate-500 text-[11px] font-semibold">Landing Page URL</p>
                        <p className="font-mono text-blue-600 break-all mt-0.5">{selectedCampaignDetails.finalUrl || "Not configured"}</p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("assets")}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit in Assets
                      </button>
                    </div>

                    {/* Headlines Count & Preview */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Headlines ({Array.isArray(selectedCampaignDetails.headlines) ? selectedCampaignDetails.headlines.length : 0})</p>
                        <p className="text-slate-700 mt-0.5 text-[11px]">
                          {Array.isArray(selectedCampaignDetails.headlines) && selectedCampaignDetails.headlines.length > 0
                            ? selectedCampaignDetails.headlines.slice(0, 2).map((h: any) => typeof h === "string" ? h : h.text).join(" · ") + (selectedCampaignDetails.headlines.length > 2 ? ` (+${selectedCampaignDetails.headlines.length - 2} more)` : "")
                            : "No headlines"}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("assets")}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Headlines
                      </button>
                    </div>

                    {/* Descriptions Count & Preview */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Descriptions ({Array.isArray(selectedCampaignDetails.descriptions) ? selectedCampaignDetails.descriptions.length : 0})</p>
                        <p className="text-slate-700 mt-0.5 text-[11px]">
                          {Array.isArray(selectedCampaignDetails.descriptions) && selectedCampaignDetails.descriptions.length > 0
                            ? selectedCampaignDetails.descriptions.slice(0, 1).map((d: any) => typeof d === "string" ? d : d.text).join("") + (selectedCampaignDetails.descriptions.length > 1 ? ` (+${selectedCampaignDetails.descriptions.length - 1} more)` : "")
                            : "No descriptions"}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("assets")}
                        className="px-2.5 py-1 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1 border border-purple-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Descriptions
                      </button>
                    </div>

                    {/* Keywords Count & Preview */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Keywords ({Array.isArray(selectedCampaignDetails.keywords) ? selectedCampaignDetails.keywords.length : 0})</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(selectedCampaignDetails.keywords) && selectedCampaignDetails.keywords.length > 0 ? (
                            selectedCampaignDetails.keywords.slice(0, 4).map((k: any, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-medium border border-emerald-200">
                                {typeof k === "string" ? k : k.text || String(k)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No keywords</span>
                          )}
                          {Array.isArray(selectedCampaignDetails.keywords) && selectedCampaignDetails.keywords.length > 4 && (
                            <span className="text-[10px] text-slate-500">+{selectedCampaignDetails.keywords.length - 4} more</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("assets")}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 border border-emerald-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Keywords
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 4: Targeting & Geo */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-blue-600" /> Geographic & Language Targeting
                    </span>
                  </div>
                  <div className="p-3 space-y-2.5 divide-y divide-slate-100 text-xs">
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Target Locations</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(selectedCampaignDetails.geoTargets) && selectedCampaignDetails.geoTargets.length > 0 ? (
                            selectedCampaignDetails.geoTargets.map((g: any, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-medium border border-blue-200">
                                {typeof g === "string" ? g : g.name || JSON.stringify(g)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 text-[11px]">Default / India</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("targeting")}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Targeting
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Languages</p>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {Array.isArray(selectedCampaignDetails.languages) && selectedCampaignDetails.languages.length > 0
                            ? selectedCampaignDetails.languages.join(", ")
                            : selectedCampaignDetails.language || "English"}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("targeting")}
                        className="px-2.5 py-1 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-1 border border-amber-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Languages
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 5: Performance Metrics Overview */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart2 className="h-3.5 w-3.5 text-blue-600" /> Performance Metrics & Timestamps
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Impressions</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{Number(selectedCampaignDetails.impressions || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Clicks</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{Number(selectedCampaignDetails.clicks || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Click-Through Rate</p>
                      <p className="text-sm font-bold text-blue-700 mt-0.5">{selectedCampaignDetails.ctr || "0%"}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Total Spend</p>
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">₹{selectedCampaignDetails.cost || "0.00"}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Conversions</p>
                      <p className="text-sm font-bold text-purple-700 mt-0.5">{Number(selectedCampaignDetails.conversions || 0).toFixed(1)}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Last Updated</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {selectedCampaignDetails.updatedAt ? new Date(selectedCampaignDetails.updatedAt).toLocaleString() : "Recently"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* AI Analysis Modal */}
      {showAnalysis && (
        <Modal title="AI Campaign Analysis" onClose={() => setShowAnalysis(false)} wide>
          {analyzing ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <p className="text-slate-900 font-bold text-sm">Analyzing your campaign...</p>
              <p className="text-slate-500 text-xs">AI is reviewing performance, keywords, and search terms</p>
            </div>
          ) : analysis ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <span className={`text-2xl font-black ${analysis.score >= 7 ? "text-emerald-700" : analysis.score >= 5 ? "text-amber-700" : "text-rose-700"}`}>{analysis.score}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Campaign Score: {analysis.score}/10</p>
                  <p className="text-xs text-slate-600">{analysis.assessment}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />Strengths</h4>
                  <ul className="space-y-1.5">
                    {(analysis.strengths || []).map((s: string, i: number) => <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5"><span className="text-emerald-600 font-bold">✓</span>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <h4 className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />Issues</h4>
                  <ul className="space-y-1.5">
                    {(analysis.issues || []).map((s: string, i: number) => <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5"><span className="text-rose-600 font-bold">!</span>{s}</li>)}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-blue-600" />AI Recommendations</h4>
                <div className="space-y-2">
                  {(analysis.recommendations || []).map((r: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-900">{r.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.impact === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200" : r.impact === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{r.impact}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{r.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* Native Google Ads Recommendation Details Modal */}
      {selectedRecDetails && (
        <Modal
          title={`Google Ads Recommendation: ${selectedRecDetails.type.replace(/_/g, " ")}`}
          onClose={() => setSelectedRecDetails(null)}
          wide
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{selectedRecDetails.type.replace(/_/g, " ")}</p>
                <p className="text-[11px] font-mono text-slate-500 truncate max-w-md">{selectedRecDetails.resourceName}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                selectedRecDetails.isAppliable 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {selectedRecDetails.isAppliable ? "Actionable via Google Ads API" : "Manual / View Only"}
              </span>
            </div>

            {/* Target Resource Association */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Associated Campaign</span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedRecDetails.campaignName || "Account-Wide / Not Campaign-Specific"}
                </p>
                {selectedRecDetails.campaignStatus && (
                  <p className="text-[10px] text-slate-500 font-mono">Status: {selectedRecDetails.campaignStatus}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Associated Ad Group</span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedRecDetails.adGroupName || "None / Campaign Level"}
                </p>
                {selectedRecDetails.adGroupStatus && (
                  <p className="text-[10px] text-slate-500 font-mono">Status: {selectedRecDetails.adGroupStatus}</p>
                )}
              </div>
            </div>

            {/* Impact Breakdown */}
            {selectedRecDetails.impact?.hasImpact ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Estimated Impact from Google Ads
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Weekly Clicks</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedRecDetails.impact.potentialClicks.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {selectedRecDetails.impact.deltaClicks >= 0 ? `+${selectedRecDetails.impact.deltaClicks}` : selectedRecDetails.impact.deltaClicks}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Weekly Cost</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      ₹{selectedRecDetails.impact.potentialCost.toFixed(2)}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-600">
                      (Base: ₹{selectedRecDetails.impact.baseCost.toFixed(2)})
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Weekly Conversions</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedRecDetails.impact.potentialConversions.toFixed(1)}
                    </p>
                    <span className="text-[10px] font-bold text-purple-600">
                      {selectedRecDetails.impact.deltaConversions >= 0 ? `+${selectedRecDetails.impact.deltaConversions.toFixed(1)}` : selectedRecDetails.impact.deltaConversions.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Google Ads has not provided numeric traffic/cost impact estimates for this specific recommendation type.
              </div>
            )}

            {/* Recommendation Specific Configuration & Parameters */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Google Ads API Technical Details</h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
                {Object.entries(selectedRecDetails.details || {})
                  .filter(([k]) => !["resourceName", "type", "impact", "dismissed"].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between py-1 border-b border-slate-200 last:border-0">
                      <span className="text-slate-600 capitalize text-[11px]">{k.replace(/([A-Z])/g, " $1")}:</span>
                      <span className="font-semibold text-slate-900 text-right text-[11px]">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmDismissRec(selectedRecDetails)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Dismiss Recommendation
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecDetails(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>

                {selectedRecDetails.isAppliable ? (
                  <button
                    onClick={() => {
                      const recToApply = selectedRecDetails;
                      setSelectedRecDetails(null);
                      setConfirmApplyRec(recToApply);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                  >
                    Apply to Google Ads
                  </button>
                ) : (
                  <a
                    href={`https://ads.google.com/aw/recommendations?ocid=${selectedCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    Open in Google Ads <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Apply Recommendation */}
      {confirmApplyRec && (
        <Modal
          title="Confirm Apply Google Ads Recommendation"
          onClose={() => setConfirmApplyRec(null)}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Explicit Confirmation Required</p>
                <p className="text-[11px] leading-relaxed">
                  Are you sure you want to apply <strong>{confirmApplyRec.type.replace(/_/g, " ")}</strong> to your live Google Ads account ({selectedCustomerId})?
                </p>
                {confirmApplyRec.campaignName && (
                  <p className="text-[11px]">
                    Target Campaign: <strong className="font-semibold">{confirmApplyRec.campaignName}</strong>
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              This action executes Google Ads API <code>RecommendationService:applyRecommendations</code>. The changes will immediately take effect on your live Google Ads campaign or budget.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmApplyRec(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyRecommendation(confirmApplyRec)}
                disabled={applyingRecId === confirmApplyRec.id}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {applyingRecId === confirmApplyRec.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Applying to Google...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Confirm &amp; Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Dismiss Recommendation */}
      {confirmDismissRec && (
        <Modal
          title="Dismiss Recommendation"
          onClose={() => setConfirmDismissRec(null)}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to dismiss <strong>{confirmDismissRec.type.replace(/_/g, " ")}</strong>?
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dismissing will mark this recommendation as dismissed on your Google Ads account via <code>RecommendationService:dismissRecommendations</code>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDismissRec(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDismissRecommendation(confirmDismissRec)}
                disabled={dismissingRecId === confirmDismissRec.id}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {dismissingRecId === confirmDismissRec.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Dismissing...
                  </>
                ) : (
                  "Confirm Dismiss"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Event Detail Modal (READ-ONLY) */}
      {selectedChangeDetail && (
        <Modal
          title="Change Event Details"
          onClose={() => setSelectedChangeDetail(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {(selectedChangeDetail.changeResourceType || selectedChangeDetail.resourceType || "RESOURCE")?.replace(/_/g, " ")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                  (selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation) === "CREATE"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : (selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation) === "UPDATE"
                    ? "text-blue-700 bg-blue-50 border-blue-200"
                    : (selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation) === "REMOVE"
                    ? "text-rose-700 bg-rose-50 border-rose-200"
                    : "text-slate-600 bg-slate-50 border-slate-200"
                }`}>
                  {selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation || "CHANGED"}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {selectedChangeDetail.changeDateTime ? new Date(selectedChangeDetail.changeDateTime).toLocaleString() : "—"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">User Email</span>
                <span className="font-semibold text-slate-800 break-all">{selectedChangeDetail.userEmail || "Google System / Automated"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Client Type / Source</span>
                <span className="font-semibold text-slate-800">{selectedChangeDetail.clientType?.replace(/_/g, " ") || "GOOGLE_ADS_WEB_CLIENT"}</span>
              </div>
              {(selectedChangeDetail.campaignName || selectedChangeDetail.campaign?.name) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Campaign</span>
                  <span className="font-semibold text-slate-800">{selectedChangeDetail.campaignName || selectedChangeDetail.campaign?.name}</span>
                </div>
              )}
              {(selectedChangeDetail.adGroupName || selectedChangeDetail.adGroup?.name) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Ad Group</span>
                  <span className="font-semibold text-slate-800">{selectedChangeDetail.adGroupName || selectedChangeDetail.adGroup?.name}</span>
                </div>
              )}
            </div>

            {selectedChangeDetail.changedFields && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Changed Field Mask</span>
                <code className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 block break-all">
                  {typeof selectedChangeDetail.changedFields === "string"
                    ? selectedChangeDetail.changedFields
                    : JSON.stringify(selectedChangeDetail.changedFields)}
                </code>
              </div>
            )}

            {(selectedChangeDetail.oldResource || selectedChangeDetail.newResource) && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Snapshot Comparison (Previous vs New)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                    <span className="text-rose-700 font-bold block mb-1.5 flex items-center gap-1">
                      <Minus className="h-3.5 w-3.5" /> Previous Value / State
                    </span>
                    {selectedChangeDetail.oldResource ? (
                      <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all bg-white/80 p-2.5 rounded-lg border border-rose-200 max-h-48 overflow-y-auto">
                        {JSON.stringify(selectedChangeDetail.oldResource, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Not provided by Google Ads API</p>
                    )}
                  </div>
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <span className="text-emerald-700 font-bold block mb-1.5 flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" /> New Value / State
                    </span>
                    {selectedChangeDetail.newResource ? (
                      <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all bg-white/80 p-2.5 rounded-lg border border-emerald-200 max-h-48 overflow-y-auto">
                        {JSON.stringify(selectedChangeDetail.newResource, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Not provided by Google Ads API</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedChangeDetail.changeResourceName && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Target Resource</span>
                <span className="text-[11px] font-mono text-slate-600 break-all block">{selectedChangeDetail.changeResourceName}</span>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedChangeDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-md animate-fadeIn">
          {toast}
        </div>
      )}
    </div>
  );
}
