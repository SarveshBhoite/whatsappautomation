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
  Building2, Check, Minus, BadgePercent, ShieldCheck, MessageSquare
} from "lucide-react";

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
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative z-10 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
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
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 z-[200] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
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
  showToast
}: {
  orgId: string;
  onAccountSelected: (id: string) => void;
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
      const ids: string[] = data.customerIds || [];
      log(ids.length > 0 ? "info" : "warn", `Found ${ids.length} accessible customer IDs: ${ids.join(", ") || "(none)"}`);
      setAccessibleCids(ids);
    } catch (e: any) {
      log("error", `Error: ${e.message}`);
      showToast("Failed to fetch accounts — see debug panel");
    } finally {
      setLoading(false);
    }
  }

  async function connectAndSelect(cid: string) {
    const cleanCid = cid.replace(/-/g, "");
    setConnecting(cleanCid);
    log("info", `Connecting account ${cleanCid}…`);
    try {
      const infoRes = await fetch(`${BACKEND_URL}/api/ads/customer-info?orgId=${orgId}&customerId=${cleanCid}`);
      let info: any = null;
      if (infoRes.ok) {
        info = await infoRes.json();
      }

      const res = await fetch(`${BACKEND_URL}/api/ads/connect-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: cleanCid,
          name: info?.descriptiveName || `Account ${cleanCid}`,
          currencyCode: info?.currencyCode,
          timeZone: info?.timeZone,
          isManager: info?.manager || false
        })
      });
      const resText = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${resText}`);

      showToast(`Account ${cleanCid} connected!`);
      onAccountSelected(cleanCid);
    } catch (e: any) {
      log("error", `Failed: ${e.message}`);
      showToast(`Failed to connect account: ${e.message}`);
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
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
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
type Tab = "overview" | "campaigns" | "ad-groups" | "ads" | "keywords" | "extensions" | "conversions" | "audiences" | "reports" | "settings";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview",     label: "Overview",     icon: LayoutGrid    },
  { id: "campaigns",    label: "Campaigns",    icon: Megaphone     },
  { id: "ad-groups",    label: "Ad Groups",    icon: Layers        },
  { id: "ads",          label: "Ads",          icon: FileText      },
  { id: "keywords",     label: "Keywords",     icon: Tag           },
  { id: "extensions",   label: "Extensions",   icon: Link2         },
  { id: "conversions",  label: "Conversions",  icon: Target        },
  { id: "audiences",    label: "Audiences",    icon: Users         },
  { id: "reports",      label: "Reports",      icon: BarChart2     },
  { id: "settings",     label: "Settings",     icon: Settings      },
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
}

function SettingsTab({
  orgId,
  accounts,
  selectedCustomerId,
  onSelectAccount,
  onAccountsRefresh,
  showToast
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
          <a
            href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads`}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all font-bold shadow-2xs"
          >
            Reconnect Google
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
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
                          ? "bg-slate-100 text-slate-400 border border-transparent cursor-not-allowed" 
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

  // Campaign Details states
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<any>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"info" | "ad-groups" | "ads" | "keywords" | "ai">("info");
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailName, setDetailName] = useState("");
  const [detailBudget, setDetailBudget] = useState(500);
  const [detailStatus, setDetailStatus] = useState("PAUSED");
  const [detailEndDate, setDetailEndDate] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleOAuthParams = useCallback((oauthStatus: string, tabParam: string) => {
    if (oauthStatus === "success" || tabParam === "settings") {
      setActiveTab("settings");
      if (oauthStatus === "success") {
        showToast("✅ Google account connected! Fetching your ad accounts…");
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

  const loadOverview = useCallback(async (cid: string) => {
    setOverviewLoading(true);
    try {
      const [ovRes, campRes] = await Promise.all([
        api(`/reports/overview?orgId=${orgId}&customerId=${cid}&dateRange=${dateRange}`),
        api(`/campaigns?orgId=${orgId}&customerId=${cid}`)
      ]);
      const ov = await ovRes.json();
      const camps = await campRes.json();
      setOverview(ov);
      if (Array.isArray(camps)) setCampaigns(camps);
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

  useEffect(() => {
    if (!isConnected || !selectedCustomerId) return;
    const cid = selectedCustomerId;
    if (activeTab === "overview") loadOverview(cid);
    if (activeTab === "campaigns") loadCampaigns(cid);
    if (activeTab === "ad-groups") loadAdGroups(cid);
    if (activeTab === "ads") loadAds(cid);
    if (activeTab === "keywords") loadKeywords(cid);
    if (activeTab === "extensions") loadExtensions(cid);
    if (activeTab === "conversions") loadConversions(cid);
    if (activeTab === "audiences") loadAudiences(cid);
    if (activeTab === "reports") loadReports(cid);
  }, [activeTab, selectedCustomerId, isConnected, dateRange, loadOverview, loadCampaigns, loadAdGroups, loadAds, loadKeywords, loadExtensions, loadConversions, loadAudiences, loadReports]);

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
    if (!selectedCampaignDetails || !detailName.trim()) { showToast("Name is required"); return; }
    setIsSavingDetails(true);
    try {
      const res = await api(`/campaigns/${selectedCampaignDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          name: detailName,
          status: detailStatus,
          endDate: detailEndDate || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      showToast("Campaign settings updated live ✓");
      setSelectedCampaignDetails({ ...selectedCampaignDetails, name: detailName, status: detailStatus, liveStatus: detailStatus, endDate: detailEndDate ? new Date(detailEndDate) : null });
      loadCampaigns(selectedCustomerId);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
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
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white font-bold">
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
              href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads`}
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
    return <AccountPickerScreen orgId={orgId} onAccountSelected={handleSelectAccount} showToast={showToast} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden">
      <Suspense fallback={null}>
        <SearchParamsHandler onOAuth={handleOAuthParams} />
      </Suspense>

      {/* ── Top Header Bar ── */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shrink-0 gap-3 flex-wrap shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white font-bold">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">Google Ads</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Search, Performance Max &amp; YouTube Ads</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <AccountSelector accounts={accounts} selected={selectedCustomerId} onSelect={handleSelectAccount} loading={accountsLoading} orgId={orgId} />

          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            {DATE_RANGES.map(d => <option key={d.value} value={d.value} className="bg-white text-slate-900">{d.label}</option>)}
          </select>

          <button
            onClick={() => { if (selectedCustomerId) { loadCampaigns(selectedCustomerId); loadOverview(selectedCustomerId); } }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            title="Refresh Campaigns"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {selectedCustomerId && (
            <button
              onClick={() => router.push(`/ads/campaigns/create?customerId=${selectedCustomerId}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Campaign
            </button>
          )}

          <a
            href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads`}
            title="Connect or switch Google account"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect Google
          </a>
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
            <Building2 className="h-12 w-12 text-slate-400 mx-auto" />
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

          {/* ══ CAMPAIGNS TAB ══ */}
          {activeTab === "campaigns" && (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                    onClick={() => router.push(`/ads/campaigns/create?customerId=${selectedCustomerId}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> New Campaign
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                {campsLoading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
                ) : filteredCamps.length === 0 ? (
                  <EmptyState icon={Megaphone} title="No campaigns" sub="Create your first campaign to start reaching customers." action="Create Campaign" onAction={() => router.push(`/ads/campaigns/create?customerId=${selectedCustomerId}`)} />
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
                                  setDetailName(c.name);
                                  setDetailBudget(c.budget);
                                  setDetailStatus(c.liveStatus || c.status);
                                  setDetailEndDate(c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "");
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
                <button onClick={() => loadAdGroups(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
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
                <button onClick={() => loadAds(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
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
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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
                <button onClick={() => loadExtensions(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
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
                <button onClick={() => loadConversions(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
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
                <button onClick={() => loadAudiences(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
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
                  <button onClick={() => loadReports(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
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

          {/* ══ SETTINGS TAB ══ */}
          {activeTab === "settings" && (
            <SettingsTab
              orgId={orgId}
              accounts={accounts}
              selectedCustomerId={selectedCustomerId}
              onSelectAccount={handleSelectAccount}
              onAccountsRefresh={() => api(`/accounts?orgId=${orgId}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setAccounts(d); })}
              showToast={showToast}
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
          title={`Campaign Settings: ${selectedCampaignDetails.name}`}
          onClose={() => setSelectedCampaignDetails(null)}
          wide
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <Input
                label="Campaign Name *"
                value={detailName}
                onChange={(e: any) => setDetailName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Daily Budget (₹) *"
                  type="number"
                  value={detailBudget}
                  onChange={(e: any) => setDetailBudget(Number(e.target.value))}
                />
                <Input
                  label="End Date (optional)"
                  type="date"
                  value={detailEndDate}
                  onChange={(e: any) => setDetailEndDate(e.target.value)}
                />
              </div>
              <Select
                label="Status"
                value={detailStatus}
                onChange={(e: any) => setDetailStatus(e.target.value)}
              >
                <option value="ENABLED">Enabled (Active)</option>
                <option value="PAUSED">Paused</option>
              </Select>
            </div>
            <button
              onClick={saveCampaignDetails}
              disabled={isSavingDetails}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-40 text-xs shadow-sm cursor-pointer"
            >
              {isSavingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Campaign Settings
            </button>
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl animate-fadeIn">
          {toast}
        </div>
      )}
    </div>
  );
}
