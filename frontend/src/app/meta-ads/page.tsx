"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign,
  Target, Plus, Play, Pause, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap, BarChart2,
  Search, Trash2, Edit3, ChevronDown, Globe, Tag, Link2,
  Phone, Bell, LayoutGrid, List, Info, PlusCircle, ArrowUpRight,
  Activity, Calendar, Filter, Download, Bot, Settings, Users,
  Layers, FileText, TrendingDown, Award, Star, RotateCcw,
  Building2, Check, Minus, BadgePercent, ShieldCheck, MessageSquare, SlidersHorizontal
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

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
    ENABLED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    PAUSED: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    REMOVED: "text-rose-400 bg-rose-400/10 border-rose-400/30",
    OPEN: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  };
  return m[status] || "text-slate-400 bg-slate-400/10 border-slate-400/30";
}

function fmt(n: number | string, prefix = "") { const num = Number(n); if (isNaN(num) || num === undefined || num === null) return `${prefix}0`; return `${prefix}${num.toLocaleString()}`; }

function api(path: string, opts?: RequestInit) { return fetch(`${BACKEND}/api/ads${path}`, opts); }

// ─── Small components ─────────────────────────────────────────────────────────
function Pill({ status }: { status: string }) {
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${sc(status)}`}>{status}</span>;
}

function Stat({ label, value, sub, color = "text-slate-100" }: { label: string; value: any; sub?: string; color?: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color, trend }: any) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-5 flex flex-col gap-3 hover:border-slate-600/60 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub, action, onAction }: any) {
  return (
    <div className="flex flex-col items-center py-16 gap-3 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
        <Icon className="h-8 w-8 text-slate-600" />
      </div>
      <p className="text-slate-300 font-semibold">{title}</p>
      <p className="text-slate-500 text-sm max-w-xs">{sub}</p>
      {action && (
        <button onClick={onAction} className="mt-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
          {action}
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: any) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
          <h3 className="font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <input {...props} className={`w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all ${props.className || ""}`} />
    </div>
  );
}

function Select({ label, children, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <select {...props} className={`w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/60 transition-all ${props.className || ""}`}>
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <textarea {...props} className={`w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-primary/60 transition-all ${props.className || ""}`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SELECTOR  (dropdown in header)
// ─────────────────────────────────────────────────────────────────────────────
function AccountSelector({ accounts, selected, onSelect, loading, orgId }: any) {
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
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
          await api("/connect-customer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orgId, customerId: cid }) });
        }
        window.location.reload();
      }
    } finally { setFetching(false); }
  }

  const current = accounts.find((a: any) => a.customerId === selected);

  return (
    // z-[60] on the wrapper so the dropdown escapes the header stacking context
    <div className="relative z-[60]" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-100 hover:border-slate-600 transition-all min-w-[180px]"
      >
        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="flex-1 text-left truncate">{current?.name || (selected ? `ID: ${selected}` : "Select Account")}</span>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>

      {open && (
        /* fixed positioning so it always renders above KPI cards */
        <div className="absolute top-full mt-1 left-0 w-72 z-[200] bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-slate-700/30">
            <p className="text-xs font-semibold text-slate-400 px-2 py-1">Google Ads Accounts</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {accounts.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500">No accounts saved yet</p>
                <button onClick={connectFromGoogle} disabled={fetching} className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
                  {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Import from Google
                </button>
              </div>
            ) : (
              accounts.map((acc: any) => (
                <button
                  key={acc.customerId}
                  onClick={() => { onSelect(acc.customerId); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 text-left transition-all ${selected === acc.customerId ? "bg-primary/10" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${acc.isManager ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"}`}>
                    {acc.isManager ? "M" : acc.name?.[0] || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{acc.name || `Account ${acc.customerId}`}</p>
                    <p className="text-xs text-slate-500">{acc.customerId} · {acc.currencyCode || "?"}</p>
                  </div>
                  {selected === acc.customerId && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-slate-700/30">
            <button onClick={connectFromGoogle} disabled={fetching} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
              {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Import accounts from Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT PICKER SCREEN  (full-page UI shown after OAuth or when no account selected)
// ─────────────────────────────────────────────────────────────────────────────
function AccountPickerScreen({ orgId, onAccountSelected, showToast }: { orgId: string; onAccountSelected: (id: string) => void; showToast: (msg: string) => void }) {
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
      log("info", `Response status: ${res.status}`);
      log("info", `Raw response: ${text.slice(0, 400)}`);
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
      // First try to get info
      const infoRes = await fetch(`${BACKEND_URL}/api/ads/customer-info?orgId=${orgId}&customerId=${cleanCid}`);
      let info: any = null;
      if (infoRes.ok) {
        info = await infoRes.json();
        log("info", `Account info: ${JSON.stringify(info).slice(0, 200)}`);
      } else {
        log("warn", `Could not fetch account info (${infoRes.status}), proceeding with bare ID`);
      }

      // Connect it
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
      log(res.ok ? "info" : "error", `connect-customer response (${res.status}): ${resText.slice(0, 300)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${resText}`);

      log("info", `✅ Account ${cleanCid} connected. Selecting as active…`);
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

  const levelColor = { info: "text-slate-300", warn: "text-amber-400", error: "text-rose-400" } as const;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100">Select Google Ads Account</h1>
            <p className="text-xs text-slate-400">Pick the account you want to manage in this CRM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAccessible}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:border-slate-600 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <a
            href={`${BACKEND_URL}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Reconnect Google
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">

        {/* Account list */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40">
          <div className="px-5 py-4 border-b border-slate-700/30 flex items-center justify-between">
            <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Google Ads Accounts on Your Profile
            </h2>
            {loading && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          </div>

          <div className="divide-y divide-slate-700/20">
            {!loading && accessibleCids.length === 0 && (
              <div className="py-10 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm font-medium">No accounts found</p>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  This can happen if the Google account connected has no Google Ads accounts, or if the OAuth token lacks the <code className="text-primary">adwords</code> scope. Try reconnecting below.
                </p>
                <button onClick={() => setShowDebug(true)} className="text-xs text-primary hover:underline">
                  Open Debug Panel →
                </button>
              </div>
            )}

            {loading && (
              <div className="py-10 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <p className="text-slate-400 text-sm">Fetching accounts from Google…</p>
              </div>
            )}

            {accessibleCids.map(cid => {
              const cleanCid = cid.replace(/-/g, "");
              return (
                <div key={cid} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {cid[0]}
                    </div>
                    <div>
                      <p className="text-sm font-mono text-slate-200">{cid}</p>
                      <p className="text-xs text-slate-500">Customer ID</p>
                    </div>
                  </div>
                  <button
                    onClick={() => connectAndSelect(cid)}
                    disabled={connecting === cleanCid}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-slate-950 text-xs font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {connecting === cleanCid
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…</>
                      : <><CheckCircle className="h-3.5 w-3.5" /> Connect & Use</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual ID entry */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 space-y-3">
          <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Enter Account ID Manually
          </h2>
          <p className="text-xs text-slate-400">If your account isn't listed above (common with sub-accounts/MCC), enter the Customer ID directly.</p>
          <div className="flex gap-2">
            <input
              value={customCid}
              onChange={e => setCustomCid(e.target.value)}
              placeholder="e.g. 123-456-7890 or 1234567890"
              className="flex-1 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 font-mono"
            />
            <button
              onClick={() => { if (customCid.trim()) { connectAndSelect(customCid.trim()); setCustomCid(""); } }}
              disabled={!customCid.trim() || !!connecting}
              className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:bg-secondary transition-all disabled:opacity-40"
            >
              Connect
            </button>
          </div>
        </div>

        {/* Debug panel toggle */}
        <div className="rounded-2xl border border-slate-700/30 overflow-hidden">
          <button
            onClick={() => setShowDebug(d => !d)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/50 hover:bg-slate-800/50 transition-all text-left"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Activity className="h-4 w-4 text-amber-400" />
              Debug Logs
              {logs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">{logs.length}</span>
              )}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showDebug ? "rotate-180" : ""}`} />
          </button>

          {showDebug && (
            <div className="bg-slate-950 border-t border-slate-800 p-4 max-h-72 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">No logs yet — click Refresh to start</p>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((l, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-600 shrink-0">[{l.ts}]</span>
                      <span className={`${levelColor[l.level]} break-all`}>{l.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN CREATOR WIZARD
// ─────────────────────────────────────────────────────────────────────────────
function CampaignCreator({ orgId, customerId, onClose, onSuccess }: any) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [brief, setBrief] = useState({
    businessDescription: "", campaignTheme: "", targetLocation: "",
    dailyBudget: "", finalUrl: "", startDate: "", endDate: "",
    campaignObjective: "SALES", campaignType: "SEARCH", biddingStrategy: "MANUAL_CPC",
    targetCpa: "", targetRoas: "", networkDisplay: false
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [editHeadlines, setEditHeadlines] = useState<string[]>([]);
  const [editDescs, setEditDescs] = useState<string[]>([]);
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [editSitelinks, setEditSitelinks] = useState<any[]>([]);
  const [editCallouts, setEditCallouts] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [geoSearch, setGeoSearch] = useState("");
  const [geoResults, setGeoResults] = useState<any[]>([]);
  const [selectedGeos, setSelectedGeos] = useState<any[]>([]);
  const [geoSearching, setGeoSearching] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);
  const [toast, setToast] = useState("");

  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; base64: string }>>([]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleImageUpload = (e: any) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        setUploadedImages(prev => [...prev, { name: file.name, base64: base64String }]);
      };
      reader.readAsDataURL(file);
    });
  };

  async function generateCopy() {
    if (!brief.businessDescription || !brief.campaignTheme) { showToast("Fill in business description and campaign goal"); return; }
    setGenerating(true);
    try {
      const res = await api("/generate-copy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessDescription: brief.businessDescription, campaignTheme: brief.campaignTheme, targetLocation: brief.targetLocation, campaignType: brief.campaignType })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setGenerated(data);
      setEditHeadlines(data.headlines || []);
      setEditDescs(data.descriptions || []);
      setEditKeywords(data.keywords || []);
      setEditSitelinks(data.sitelinks || []);
      setEditCallouts(data.callouts || []);
      setStep(2);
    } catch (e: any) { showToast(`Generation failed: ${e.message}`); } finally { setGenerating(false); }
  }

  async function searchGeo(q: string) {
    if (q.length < 2) return;
    setGeoSearching(true);
    try {
      const res = await api(`/geo-targets/search?customerId=${customerId}&q=${encodeURIComponent(q)}&orgId=${orgId}`);
      const data = await res.json();
      setGeoResults(Array.isArray(data) ? data : []);
    } catch { } finally { setGeoSearching(false); }
  }

  async function launch() {
    if (!campaignName) { showToast("Enter campaign name"); return; }
    setLaunching(true); setLaunchResult(null);
    try {
      const res = await api("/campaign/launch", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId, customerId, campaignName,
          budget: Number(brief.dailyBudget),
          channelType: brief.campaignType,
          biddingStrategy: brief.biddingStrategy,
          targetCpa: brief.targetCpa ? Number(brief.targetCpa) : undefined,
          targetRoas: brief.targetRoas ? Number(brief.targetRoas) : undefined,
          startDate: brief.startDate || new Date().toISOString().split("T")[0],
          endDate: brief.endDate || undefined,
          finalUrl: brief.finalUrl,
          headlines: editHeadlines,
          descriptions: editDescs,
          keywords: editKeywords,
          geoTargetIds: selectedGeos.map(g => g.id),
          networkDisplay: brief.networkDisplay,
          images: uploadedImages
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      setLaunchResult({ success: true, message: "Campaign launched! It will be reviewed by Google Ads." });
      onSuccess();
    } catch (e: any) { setLaunchResult({ success: false, message: e.message }); } finally { setLaunching(false); }
  }

  const STEPS = [
    { n: 1, label: "Strategy" },
    { n: 2, label: "Ad Copy" },
    { n: 3, label: "Targeting" },
    { n: 4, label: "Launch" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-700/50 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100">AI Campaign Creator</h2>
              <p className="text-xs text-slate-400">Step {step} of 4</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><X className="h-4 w-4" /></button>
        </div>

        {/* Step indicators */}
        <div className="px-6 py-3 border-b border-slate-700/30 flex items-center gap-0 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              {i > 0 && <div className={`h-px flex-1 ${step > i ? "bg-primary" : "bg-slate-700"}`} />}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step >= s.n ? "bg-primary text-slate-950" : "bg-slate-700 text-slate-400"}`}>{s.n}</div>
                <span className={`text-xs hidden sm:inline ${step >= s.n ? "text-slate-200" : "text-slate-500"}`}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* STEP 1: Strategy */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Objective selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">What's your campaign objective?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "SALES", label: "Sales", desc: "Drive sales online, in app, or store", icon: DollarSign, color: "text-emerald-400" },
                    { id: "LEADS", label: "Leads", desc: "Get conversions & customer signups", icon: Users, color: "text-primary" },
                    { id: "TRAFFIC", label: "Website traffic", desc: "Get the right visitors to your site", icon: Globe, color: "text-sky-400" },
                    { id: "APP", label: "App promotion", desc: "Get more installs and engagement", icon: Activity, color: "text-violet-400" },
                    { id: "AWARENESS", label: "YouTube reach / Awareness", desc: "Drive brand awareness and views", icon: Megaphone, color: "text-rose-400" },
                    { id: "LOCAL", label: "Local store visits", desc: "Drive visits to physical locations", icon: Building2, color: "text-amber-400" },
                    { id: "NO_GOAL", label: "No guidance", desc: "Create a custom campaign setup", icon: Sparkles, color: "text-slate-400" }
                  ].map(obj => {
                    const Icon = obj.icon;
                    const isSel = brief.campaignObjective === obj.id;
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => setBrief(b => ({ ...b, campaignObjective: obj.id }))}
                        className={`p-3 rounded-xl border text-left transition-all ${isSel ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950/40 hover:bg-slate-850"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1.5 rounded-lg bg-slate-800 ${obj.color}`}><Icon className="h-4 w-4" /></div>
                          <span className="text-xs font-bold text-slate-200">{obj.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{obj.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campaign type selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select a campaign type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "SEARCH", label: "Search", desc: "Drive action on Google Search with text ads", icon: Search },
                    { id: "PERFORMANCE_MAX", label: "Performance Max", desc: "Reach users on Search, YouTube, and Display", icon: Layers },
                    { id: "DEMAND_GEN", label: "Demand Gen", desc: "Drive demand with image & video ads", icon: Zap },
                    { id: "DISPLAY", label: "Display", desc: "Reach customers across 3M sites & apps", icon: Eye },
                    { id: "SHOPPING", label: "Shopping", desc: "Promote products from Merchant Center", icon: BadgePercent },
                    { id: "VIDEO", label: "Video", desc: "Drive conversions and actions on YouTube", icon: Play }
                  ].map(ct => {
                    const Icon = ct.icon;
                    const isSel = brief.campaignType === ct.id;
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setBrief(b => ({ ...b, campaignType: ct.id }))}
                        className={`p-3 rounded-xl border text-left transition-all ${isSel ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950/40 hover:bg-slate-850"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 rounded-lg bg-slate-800 text-primary"><Icon className="h-4 w-4" /></div>
                          <span className="text-xs font-bold text-slate-200">{ct.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{ct.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <Select label="Bidding Strategy" value={brief.biddingStrategy} onChange={(e: any) => setBrief(b => ({ ...b, biddingStrategy: e.target.value }))}>
                  <option value="MANUAL_CPC">Manual CPC</option>
                  <option value="MAXIMIZE_CLICKS">Maximize Clicks</option>
                  <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
                  <option value="MAXIMIZE_CONVERSION_VALUE">Maximize Conv. Value</option>
                  <option value="TARGET_CPA">Target CPA</option>
                  <option value="TARGET_ROAS">Target ROAS</option>
                </Select>

                {brief.biddingStrategy === "TARGET_CPA" && (
                  <Input label="Target CPA (₹)" type="number" placeholder="e.g. 500" value={brief.targetCpa} onChange={(e: any) => setBrief(b => ({ ...b, targetCpa: e.target.value }))} />
                )}
                {brief.biddingStrategy === "TARGET_ROAS" && (
                  <Input label="Target ROAS (e.g. 3.0 = 300%)" type="number" step="0.1" placeholder="e.g. 3.0" value={brief.targetRoas} onChange={(e: any) => setBrief(b => ({ ...b, targetRoas: e.target.value }))} />
                )}

                <Textarea label="Business Description *" rows={2} value={brief.businessDescription} onChange={(e: any) => setBrief(b => ({ ...b, businessDescription: e.target.value }))} placeholder="e.g. Digital marketing agency in Pune specialising in local SEO and lead generation for SMEs." />
                <Input label="Campaign Goal / Theme *" value={brief.campaignTheme} onChange={(e: any) => setBrief(b => ({ ...b, campaignTheme: e.target.value }))} placeholder="e.g. Get more local business owners to enquire about GMB setup" />
                <Input label="Target Location" value={brief.targetLocation} onChange={(e: any) => setBrief(b => ({ ...b, targetLocation: e.target.value }))} placeholder="e.g. Pune, Maharashtra" />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Daily Budget (₹) *" type="number" value={brief.dailyBudget} onChange={(e: any) => setBrief(b => ({ ...b, dailyBudget: e.target.value }))} placeholder="500" />
                  <Input label="Landing Page URL *" value={brief.finalUrl} onChange={(e: any) => setBrief(b => ({ ...b, finalUrl: e.target.value }))} placeholder="https://yourwebsite.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="date" value={brief.startDate} onChange={(e: any) => setBrief(b => ({ ...b, startDate: e.target.value }))} />
                  <Input label="End Date (optional)" type="date" value={brief.endDate} onChange={(e: any) => setBrief(b => ({ ...b, endDate: e.target.value }))} />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group pt-1">
                  <div className={`w-10 h-5 rounded-full transition-all ${brief.networkDisplay ? "bg-primary" : "bg-slate-700"}`} onClick={() => setBrief(b => ({ ...b, networkDisplay: !b.networkDisplay }))}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow mt-0.5 transition-all ${brief.networkDisplay ? "ml-5.5" : "ml-0.5"}`} style={{ marginLeft: brief.networkDisplay ? "22px" : "2px" }} />
                  </div>
                  <span className="text-sm text-slate-300">Also show on Display Network</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Ad Copy */}
          {step === 2 && (
            <>
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-primary">AI-generated copy · Edit any field before proceeding</p>
              </div>

              {/* Headlines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">Headlines ({editHeadlines.length}/15) · max 30 chars each</label>
                  <button onClick={() => setEditHeadlines(h => [...h, ""])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" />Add</button>
                </div>
                <div className="space-y-2">
                  {editHeadlines.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input maxLength={30} value={h} onChange={e => { const n = [...editHeadlines]; n[i] = e.target.value; setEditHeadlines(n); }}
                        className="flex-1 bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary/60 transition-all" />
                      <span className={`text-xs shrink-0 w-8 text-right ${h.length > 27 ? "text-rose-400" : "text-slate-500"}`}>{h.length}</span>
                      <button onClick={() => setEditHeadlines(hs => hs.filter((_, j) => j !== i))} className="text-slate-600 hover:text-rose-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">Descriptions ({editDescs.length}/4) · max 90 chars each</label>
                  <button onClick={() => setEditDescs(d => [...d, ""])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" />Add</button>
                </div>
                <div className="space-y-2">
                  {editDescs.map((d, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <textarea rows={2} maxLength={90} value={d} onChange={e => { const n = [...editDescs]; n[i] = e.target.value; setEditDescs(n); }}
                        className="flex-1 bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-100 resize-none focus:outline-none focus:border-primary/60 transition-all" />
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs shrink-0 w-8 text-right ${d.length > 85 ? "text-rose-400" : "text-slate-500"}`}>{d.length}</span>
                        <button onClick={() => setEditDescs(ds => ds.filter((_, j) => j !== i))} className="text-slate-600 hover:text-rose-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">Keywords ({editKeywords.length})</label>
                  <button onClick={() => setEditKeywords(k => [...k, ""])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" />Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editKeywords.map((kw, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/60 border border-slate-600/40">
                      <input value={kw} onChange={e => { const n = [...editKeywords]; n[i] = e.target.value; setEditKeywords(n); }}
                        className="bg-transparent text-xs text-slate-200 outline-none w-32" />
                      <button onClick={() => setEditKeywords(ks => ks.filter((_, j) => j !== i))} className="text-slate-500 hover:text-rose-400 transition-colors"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sitelinks */}
              {editSitelinks.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Sitelinks (optional)</label>
                  <div className="space-y-2">
                    {editSitelinks.map((sl: any, i: number) => (
                      <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Sitelink {i + 1}</span>
                          <button onClick={() => setEditSitelinks(ss => ss.filter((_, j) => j !== i))} className="text-slate-500 hover:text-rose-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                        </div>
                        <input maxLength={25} value={sl.linkText} onChange={e => { const n = [...editSitelinks]; n[i] = { ...n[i], linkText: e.target.value }; setEditSitelinks(n); }}
                          placeholder="Link text (max 25)" className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary/50" />
                        <input maxLength={35} value={sl.description1} onChange={e => { const n = [...editSitelinks]; n[i] = { ...n[i], description1: e.target.value }; setEditSitelinks(n); }}
                          placeholder="Description 1 (max 35)" className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary/50" />
                        <input value={sl.url} onChange={e => { const n = [...editSitelinks]; n[i] = { ...n[i], url: e.target.value }; setEditSitelinks(n); }}
                          placeholder="https://..." className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary/50" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Callouts */}
              {editCallouts.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Callouts (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {editCallouts.map((c: string, i: number) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/60 border border-slate-600/40">
                        <input maxLength={25} value={c} onChange={e => { const n = [...editCallouts]; n[i] = e.target.value; setEditCallouts(n); }}
                          className="bg-transparent text-xs text-slate-200 outline-none w-28" />
                        <button onClick={() => setEditCallouts(cs => cs.filter((_, j) => j !== i))} className="text-slate-500 hover:text-rose-400"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {brief.campaignType === "PERFORMANCE_MAX" && (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Asset Group Marketing Images</label>
                      <p className="text-[10px] text-slate-500">PMax campaigns require at least 1 landscape/square marketing image.</p>
                    </div>
                    <label className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {uploadedImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedImages.map((img: any, idx: number) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800 aspect-square">
                          <img src={`data:image/png;base64,${img.base64}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => setUploadedImages(imgs => imgs.filter((_, i) => i !== idx))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400 font-bold text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">No marketing images uploaded yet.</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* STEP 3: Targeting */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Location Targeting</label>
                <div className="flex gap-2 mb-3">
                  <input value={geoSearch} onChange={e => setGeoSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && searchGeo(geoSearch)}
                    placeholder="Search cities, regions, countries..." className="flex-1 bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all" />
                  <button onClick={() => searchGeo(geoSearch)} disabled={geoSearching} className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all">
                    {geoSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </button>
                </div>

                {geoResults.length > 0 && (
                  <div className="rounded-xl border border-slate-700/50 overflow-hidden mb-3">
                    {geoResults.map((g: any) => (
                      <button key={g.id} onClick={() => { if (!selectedGeos.find(s => s.id === g.id)) setSelectedGeos(gs => [...gs, g]); setGeoResults([]); setGeoSearch(""); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left border-b border-slate-700/20 last:border-0 transition-all">
                        <Globe className="h-4 w-4 text-slate-500 shrink-0" />
                        <div>
                          <p className="text-sm text-slate-200">{g.canonicalName || g.name}</p>
                          <p className="text-xs text-slate-500">{g.targetType} · {g.countryCode}</p>
                        </div>
                        <Plus className="h-4 w-4 text-primary ml-auto" />
                      </button>
                    ))}
                  </div>
                )}

                {selectedGeos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedGeos.map((g: any) => (
                      <div key={g.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                        <Globe className="h-3.5 w-3.5" />
                        {g.name}
                        <button onClick={() => setSelectedGeos(gs => gs.filter(s => s.id !== g.id))} className="text-primary/60 hover:text-rose-400 transition-colors ml-1"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedGeos.length === 0 && geoResults.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">No locations added · campaign will target all locations</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">Network Settings</h4>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-slate-300">Google Search</p>
                    <p className="text-xs text-slate-500">Show on Google search results</p>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-primary flex-shrink-0"><div className="w-4 h-4 rounded-full bg-white shadow mt-0.5 ml-5.5" style={{ marginLeft: "22px" }} /></div>
                </label>
                <label className="flex items-center justify-between cursor-pointer" onClick={() => setBrief(b => ({ ...b, networkDisplay: !b.networkDisplay }))}>
                  <div>
                    <p className="text-sm text-slate-300">Display Network</p>
                    <p className="text-xs text-slate-500">Show on partner websites</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all flex-shrink-0 ${brief.networkDisplay ? "bg-primary" : "bg-slate-700"}`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow mt-0.5 transition-all" style={{ marginLeft: brief.networkDisplay ? "22px" : "2px" }} />
                  </div>
                </label>
              </div>
            </>
          )}

          {/* STEP 4: Launch */}
          {step === 4 && (
            <>
              <Input label="Campaign Name *" value={campaignName} onChange={(e: any) => setCampaignName(e.target.value)} placeholder="e.g. Pune Digital Marketing - July 2026" />

              <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">Campaign Summary</h3>
                {[
                  { label: "Objective", val: brief.campaignObjective },
                  { label: "Type", val: brief.campaignType },
                  { label: "Bidding", val: brief.biddingStrategy },
                  { label: "Daily Budget", val: `₹${brief.dailyBudget}` },
                  { label: "Landing URL", val: brief.finalUrl },
                  { label: "Headlines", val: `${editHeadlines.length} headlines` },
                  { label: "Descriptions", val: `${editDescs.length} descriptions` },
                  ...(brief.campaignType === "PERFORMANCE_MAX"
                    ? [{ label: "Marketing Images", val: `${uploadedImages.length} images` }]
                    : [{ label: "Keywords", val: `${editKeywords.length} keywords` }]),
                  { label: "Locations", val: selectedGeos.length > 0 ? selectedGeos.map(g => g.name).join(", ") : "All locations" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-slate-200 font-medium truncate max-w-[60%] text-right">{r.val}</span>
                  </div>
                ))}
              </div>

              {launchResult && (
                <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${launchResult.success ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
                  {launchResult.success ? <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />}
                  <p className={`text-sm ${launchResult.success ? "text-emerald-300" : "text-rose-300"}`}>{launchResult.message}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between shrink-0 bg-slate-900">
          <button onClick={() => step > 1 ? setStep(s => (s - 1) as any) : onClose()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all text-sm">
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step === 1 && (
            <button onClick={generateCopy} disabled={!brief.businessDescription || !brief.campaignTheme || !brief.dailyBudget || !brief.finalUrl || generating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate Ad Copy"}
            </button>
          )}

          {step === 2 && (
            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
              Set Targeting <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {step === 3 && (
            <button onClick={() => setStep(4)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
              Review & Launch <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {step === 4 && !launchResult?.success && (
            <button onClick={launch} disabled={launching || !campaignName}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20">
              {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {launching ? "Launching..." : "Launch Campaign"}
            </button>
          )}

          {launchResult?.success && (
            <button onClick={onClose} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all">
              Done <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {toast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-600/50 text-slate-100 text-xs shadow-lg whitespace-nowrap">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
// ── Suspense-safe OAuth param handler ────────────────────────────────────────
// useSearchParams() MUST be inside a <Suspense> boundary for Next.js static export.
function SearchParamsHandler({ onOAuth }: { onOAuth: (status: string, tab: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth") || "";
    const tabParam = searchParams.get("tab") || "";
    if (oauthStatus || tabParam) {
      onOAuth(oauthStatus, tabParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  return null;
}


// ─────────────────────────────────────────────────────────────────────────────
// META ADS WORKSPACE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// META ADS WORKSPACE COMPONENT (Identical Layout & Design System to Google Ads)
// ─────────────────────────────────────────────────────────────────────────────
function MetaAdsWorkspace({ orgId, showToast, platform, setPlatform }: { orgId: string; showToast: (msg: string) => void; platform: string; setPlatform: (p: any) => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "ad-sets" | "ads" | "audiences" | "conversions" | "approvals" | "reports" | "settings">("overview");
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");

  const [config, setConfig] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [diagLoading, setDiagLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [creatingCamp, setCreatingCamp] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateAdSetModal, setShowCreateAdSetModal] = useState(false);

  // Form state
  const [formAppId, setFormAppId] = useState("");
  const [formAppSecret, setFormAppSecret] = useState("");
  const [formToken, setFormToken] = useState("");
  const [formAdAccountId, setFormAdAccountId] = useState("");
  const [formPageId, setFormPageId] = useState("");
  const [formPixelId, setFormPixelId] = useState("");
  const [fetchedPages, setFetchedPages] = useState<any[]>([]);
  const [fetchedPixels, setFetchedPixels] = useState<any[]>([]);

  // Detail Inspector & Media Library state
  const [selectedCampDetail, setSelectedCampDetail] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<{ images: any[]; videos: any[] }>({ images: [], videos: [] });
  const [fetchingMedia, setFetchingMedia] = useState(false);

  // Stepper state for Creation Modal
  const [campaignStep, setCampaignStep] = useState<number>(1);

  // Campaign Form State
  const [setupMode, setSetupMode] = useState<"ai" | "manual">("manual");
  const [trafficPresetMode, setTrafficPresetMode] = useState<"tailored" | "manual">("manual");
  const [engagementPresetMode, setEngagementPresetMode] = useState<"tailored" | "manual">("manual");
  const [buyingType, setBuyingType] = useState<"AUCTION" | "RESERVATION">("AUCTION");
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [bidStrategy, setBidStrategy] = useState("LOWEST_COST_WITHOUT_CAP");
  const [cboEnabled, setCboEnabled] = useState(false);
  const [shareBudgetPercent, setShareBudgetPercent] = useState(false);
  const [liveVideoAd, setLiveVideoAd] = useState(false);
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [advantagePlus, setAdvantagePlus] = useState(false);
  const [advantagePlusAudience, setAdvantagePlusAudience] = useState(true);
  const [advantagePlusPlacement, setAdvantagePlusPlacement] = useState(true);
  const [callToAction, setCallToAction] = useState("WHATSAPP_MESSAGE");
  const [adFormat, setAdFormat] = useState("SINGLE_IMAGE");
  const [aiPrompt, setAiPrompt] = useState("");
  const [campName, setCampName] = useState("New Awareness campaign");
  const [campObjective, setCampObjective] = useState<string>("OUTCOME_LEADS");
  const [campBudget, setCampBudget] = useState(500);
  const [campDestination, setCampDestination] = useState<"WHATSAPP" | "MESSENGER" | "INSTAGRAM_DIRECT" | "WEBSITE">("WHATSAPP");
  const [campHeadline, setCampHeadline] = useState("");
  const [campBody, setCampBody] = useState("");
  const [campMediaUrl, setCampMediaUrl] = useState("");
  const [campWhatsappNum, setCampWhatsappNum] = useState("");
  const [campCountry, setCampCountry] = useState("IN");
  const [campAgeMin, setCampAgeMin] = useState(18);
  const [campAgeMax, setCampAgeMax] = useState(65);

  // Traffic Specific State (Tailored Web & Manual Traffic Setup)
  const [creativeTesting, setCreativeTesting] = useState(true);
  const [pixelWebsiteEvents, setPixelWebsiteEvents] = useState("JISNU Digital Website Pixel");
  const [pixelId, setPixelId] = useState("1380912777544016");
  const [urlParameters, setUrlParameters] = useState("key1=value1&key2=value2");
  const [conversionLocation, setConversionLocation] = useState<"WEBSITE" | "APP" | "MESSAGING" | "INSTAGRAM_FB" | "CALLS">("WEBSITE");
  const [messageDestinationMode, setMessageDestinationMode] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [indiaSecuritiesDeclaration, setIndiaSecuritiesDeclaration] = useState(false);
  const [includeWhatsappStatus, setIncludeWhatsappStatus] = useState(true);

  // Engagement Specific State (Tailored Messages Setup)
  const [engAdvantagesPlus, setEngAdvantagesPlus] = useState(true);
  const [engExcludedPlacements, setEngExcludedPlacements] = useState("None");
  const [engBrandSafetyExpanded, setEngBrandSafetyExpanded] = useState(false);
  const [engAudienceBreadth, setEngAudienceBreadth] = useState(80); // 0=Narrow, 100=Broad
  const [engShowAudienceSize, setEngShowAudienceSize] = useState(false);
  const [engPolicyDeclaration, setEngPolicyDeclaration] = useState(false);

  // Engagement Specific State (Manual Campaign Setup)
  const [engManualBudgetStrategy, setEngManualBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [engManualAdvantagesPlus, setEngManualAdvantagesPlus] = useState(true);
  const [engManualBudgetMode, setEngManualBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [engManualBudget, setEngManualBudget] = useState("1000");
  const [engManualBidStrategy, setEngManualBidStrategy] = useState("HIGHEST_VOLUME");
  const [engManualBudgetScheduling, setEngManualBudgetScheduling] = useState(false);
  const [engManualAdScheduling, setEngManualAdScheduling] = useState("ALL_TIME");
  const [engManualFrequencyControl, setEngManualFrequencyControl] = useState(false);
  const [engManualAbTest, setEngManualAbTest] = useState(false);
  const [engManualSpecialCategory, setEngManualSpecialCategory] = useState("NONE");
  const [engManualCampaignScore] = useState(74);
  const [engManualAdSetupMode, setEngManualAdSetupMode] = useState<"EXISTING" | "CREATE">("CREATE");

  // Leads Specific State
  const [leadsStartMode, setLeadsStartMode] = useState<"RECENT" | "NEW">("NEW");

  // Leads specific UI state
  const [leadsAdvantagePlus, setLeadsAdvantagePlus] = useState(true);
  const [leadsBudgetStrategy, setLeadsBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [leadsBudgetMode, setLeadsBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [leadsBudget, setLeadsBudget] = useState("1000");
  const [leadsBidStrategy, setLeadsBidStrategy] = useState("HIGHEST_VOLUME");
  const [leadsBudgetScheduling, setLeadsBudgetScheduling] = useState(false);
  const [leadsFrequencyControl, setLeadsFrequencyControl] = useState(false);
  const [leadsAbTest, setLeadsAbTest] = useState(false);
  const [leadsSpecialCategory, setLeadsSpecialCategory] = useState("NONE");
  const [leadsCampaignScore] = useState(74);

  // Leads Ad Set (Step 3) state
  const [leadsAdSetName, setLeadsAdSetName] = useState("New Leads ad set");
  const [leadsConversionLocation, setLeadsConversionLocation] = useState("INSTANT_FORMS");
  const [leadsPerformanceGoal, setLeadsPerformanceGoal] = useState("MAXIMIZE_LEADS");
  const [leadsCostPerResult, setLeadsCostPerResult] = useState("");
  const [leadsValueRules, setLeadsValueRules] = useState(false);
  const [leadsAdSetScore] = useState(100);

  // Leads Ad (Step 4) state
  const [leadsAdSetupMode, setLeadsAdSetupMode] = useState<"EXISTING" | "CREATE">("CREATE");
  const [leadsFormTesting, setLeadsFormTesting] = useState(false);
  const [leadsRequireWorkEmail, setLeadsRequireWorkEmail] = useState(false);
  const [leadsSelectedForm, setLeadsSelectedForm] = useState("");
  const [leadsFormTab, setLeadsFormTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");

  // Partnership Ad Code Modal State
  const [showPartnershipCodeModal, setShowPartnershipCodeModal] = useState(false);
  const [partnershipAdCodeInput, setPartnershipAdCodeInput] = useState("");
  const [partnershipPreviewPlacement, setPartnershipPreviewPlacement] = useState("INSTAGRAM_FEED");

  // Select Partnership Modal State
  const [showSelectPartnershipModal, setShowSelectPartnershipModal] = useState(false);
  const [partnershipTab, setPartnershipTab] = useState<"SENT" | "RECEIVED">("SENT");
  const [searchByAsset, setSearchByAsset] = useState("");
  const [searchAdPartner, setSearchAdPartner] = useState("");
  const [selectedPartnerIdentity, setSelectedPartnerIdentity] = useState("");

  // App Promotion Specific State
  const [appPromoName, setAppPromoName] = useState("New App promotion Campaign");
  const [appPromoLiveVideo, setAppPromoLiveVideo] = useState(false);
  const [appPromoLiveVideoLocation, setAppPromoLiveVideoLocation] = useState("FACEBOOK");
  const [appPromoAdvantagePlus, setAppPromoAdvantagePlus] = useState(true);
  const [appPromoBudgetStrategy, setAppPromoBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [appPromoBudgetMode, setAppPromoBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [appPromoBudget, setAppPromoBudget] = useState("800");
  const [appPromoBidStrategy, setAppPromoBidStrategy] = useState("HIGHEST_VOLUME");
  const [appPromoBudgetScheduling, setAppPromoBudgetScheduling] = useState(false);
  const [appPromoAdScheduling, setAppPromoAdScheduling] = useState("ALL_TIME");
  const [appPromoScore] = useState(77);

  // App Promotion Ad Set (Step 3) State
  const [appPromoIos14, setAppPromoIos14] = useState(true);
  const [appPromoSelectedApp, setAppPromoSelectedApp] = useState("whatsapp_automation_app");
  const [appPromoAdSetName, setAppPromoAdSetName] = useState("New App promotion ad set");
  const [appPromoPerformanceGoal, setAppPromoPerformanceGoal] = useState("MAXIMIZE_INSTALLS");
  const [appPromoCostPerResult, setAppPromoCostPerResult] = useState("");
  const [appPromoAppStore, setAppPromoAppStore] = useState("GOOGLE_PLAY");

  // App Promotion A/B Test State
  const [appPromoAbTest, setAppPromoAbTest] = useState(true);
  const [appPromoTestVariable, setAppPromoTestVariable] = useState("CREATIVE");
  const [appPromoTestDuration, setAppPromoTestDuration] = useState("7_DAYS");
  const [appPromoMetricComparison, setAppPromoMetricComparison] = useState("COST_PER_ADD_PAYMENT_INFO");


  // Ad Level Specific State for Awareness (Step 4)
  const [adName, setAdName] = useState("New Awareness ad");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [instagramProfile, setInstagramProfile] = useState("jisnu_digitalsolution_pvt_ltd");
  const [threadsProfile, setThreadsProfile] = useState("USE_INSTAGRAM");
  const [adSetCampId, setAdSetCampId] = useState("");
  const [performanceGoal, setPerformanceGoal] = useState("MAXIMIZE_REACH");
  const [costPerResultGoal, setCostPerResultGoal] = useState("");
  const [frequencyCapTimes, setFrequencyCapTimes] = useState(2);
  const [frequencyCapDays, setFrequencyCapDays] = useState(7);
  const [deliveryType, setDeliveryType] = useState("STANDARD");
  const [adSetName, setAdSetName] = useState("");
  const [adSetBudget, setAdSetBudget] = useState(500);
  const [adSetDestination, setAdSetDestination] = useState<"WHATSAPP" | "MESSENGER" | "INSTAGRAM_DIRECT" | "WEBSITE">("WHATSAPP");
  const [adSetOptimization, setAdSetOptimization] = useState("MESSAGES");
  const [adSetCountry, setAdSetCountry] = useState("IN");
  const [adSetAgeMin, setAdSetAgeMin] = useState(18);
  const [adSetAgeMax, setAdSetAgeMax] = useState(65);
  const [adSetGender, setAdSetGender] = useState("ALL");
  const [adSetInterests, setAdSetInterests] = useState("Digital Marketing, Business Owners, E-Commerce");

  const currencySymbol = "₹";

  const fetchMetaConfig = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/config?organizationId=${orgId}`);
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setFormAppId(data.config.appId || "");
        setFormAppSecret(data.config.appSecret || "");
        setFormToken(data.config.accessToken || "");
        setFormAdAccountId(data.config.adAccountId || "");
        setFormPageId(data.config.pageId || "");

        // Fetch connected Pages directly from Meta Graph API
        fetch(`${BACKEND}/api/meta-ads/pages?organizationId=${orgId}`)
          .then(r => r.json())
          .then(pData => {
            if (pData.pages && pData.pages.length > 0) {
              setFetchedPages(pData.pages);
              if (!data.config.pageId) {
                setFormPageId(pData.pages[0].id);
              }
            }
          }).catch(() => { });

        // Always fetch connected Meta Pixels from Meta Graph API
        fetch(`${BACKEND}/api/meta-ads/pixels?organizationId=${orgId}`)
          .then(r => r.json())
          .then(pxData => {
            if (pxData.pixels && pxData.pixels.length > 0) {
              setFetchedPixels(pxData.pixels);
              if (!data.config.pixelId || formPixelId !== pxData.pixels[0].id) {
                setFormPixelId(pxData.pixels[0].id);
              }
            }
          }).catch(() => { });
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta config:", e);
    }
  }, [orgId]);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/accounts?organizationId=${orgId}`);
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(data.accounts[0].adAccountId);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta accounts:", e);
    }
  }, [orgId, selectedAccountId]);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns?organizationId=${orgId}`);
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
        if (data.campaigns.length === 0) {
          // Auto-trigger live sync from Meta Graph API if database campaigns list is empty
          fetch(`${BACKEND}/api/meta-ads/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organizationId: orgId }),
          }).then(r => r.json()).then(syncData => {
            if (syncData.success) {
              fetch(`${BACKEND}/api/meta-ads/campaigns?organizationId=${orgId}`).then(r => r.json()).then(d => {
                if (d.campaigns) setCampaigns(d.campaigns);
              });
            }
          });
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta campaigns:", e);
    }
  }, [orgId]);

  const fetchMediaAssets = useCallback(async () => {
    setFetchingMedia(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/media?organizationId=${orgId}`);
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.media) setMediaAssets(data.media);
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta media assets:", e);
    } finally {
      setFetchingMedia(false);
    }
  }, [orgId]);

  const handleSyncLive = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.result.message);
        fetchCampaigns();
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      showToast(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateCampaign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalName = campName.trim();
    let finalHeadline = campHeadline.trim();
    let finalBody = campBody.trim();

    if (setupMode === "ai") {
      const promptText = aiPrompt.trim() || "Meta AI-Guided Click-to-WhatsApp Campaign";
      if (!finalName) finalName = `AI: ${promptText.slice(0, 30)}...`;
      if (!finalHeadline) finalHeadline = "Chat with us on WhatsApp";
      if (!finalBody) finalBody = promptText;
    } else {
      if (!finalName) finalName = `Meta Campaign - ${new Date().toLocaleDateString()}`;
      if (!finalHeadline) finalHeadline = "Get Special Offer on WhatsApp!";
      if (!finalBody) finalBody = "Click below to send us a direct message on WhatsApp and connect immediately with our team.";
    }

    setCreatingCamp(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: finalName,
          objective: campObjective,
          buyingType: buyingType,
          specialAdCategory: specialAdCategory,
          bidStrategy: bidStrategy,
          cboEnabled: cboEnabled,
          advantagePlus: advantagePlus,
          dailyBudget: Number(campBudget) || 500,
          destinationType: campDestination,
          optimizationGoal: campDestination === "WHATSAPP" ? "MESSAGES" : "LINK_CLICKS",
          advantagePlusAudience: advantagePlusAudience,
          advantagePlusPlacement: advantagePlusPlacement,
          adFormat: adFormat,
          callToAction: callToAction,
          creativeHeadline: finalHeadline,
          creativeBody: finalBody,
          creativeMediaUrl: campMediaUrl,
          whatsappNumber: campWhatsappNum,
          pageId: formPageId,
          targeting: {
            countries: [campCountry],
            ageMin: Number(campAgeMin),
            ageMax: Number(campAgeMax),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("🎉 Meta Ad Campaign created & submitted live!");
        setShowCreateModal(false);
        setCampName("");
        setCampHeadline("");
        setCampBody("");
        setAiPrompt("");
        fetchCampaigns();
      } else {
        throw new Error(data.error || "Failed to publish campaign");
      }
    } catch (e: any) {
      showToast(`Campaign creation failed: ${e.message}`);
    } finally {
      setCreatingCamp(false);
    }
  };

  const handleCreateAdSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSetName) {
      showToast("Please enter an Ad Set name.");
      return;
    }
    const targetCamp = campaigns.find(c => c.id === adSetCampId) || campaigns[0];
    const newAdSet = {
      id: `as_${Date.now()}`,
      name: adSetName,
      campaignName: targetCamp ? targetCamp.name : "Meta Leads Campaign",
      destinationType: adSetDestination,
      optimizationGoal: adSetOptimization,
      dailyBudget: Number(adSetBudget),
      targeting: {
        countries: [adSetCountry],
        ageMin: Number(adSetAgeMin),
        ageMax: Number(adSetAgeMax),
        genders: adSetGender === "MALE" ? [1] : adSetGender === "FEMALE" ? [2] : [],
        interests: adSetInterests.split(",").map(i => i.trim()).filter(Boolean),
      },
      status: "ACTIVE"
    };

    if (targetCamp) {
      if (!targetCamp.adSets) targetCamp.adSets = [];
      targetCamp.adSets.unshift(newAdSet);
    }
    showToast(`Ad Set "${adSetName}" configured cleanly! ✓`);
    setShowCreateAdSetModal(false);
    setAdSetName("");
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Campaign status updated to ${nextStatus}`);
        fetchCampaigns();
      }
    } catch (e: any) {
      showToast(`Status update failed: ${e.message}`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          appId: formAppId,
          appSecret: formAppSecret,
          accessToken: formToken,
          adAccountId: formAdAccountId,
          pageId: formPageId,
          pixelId: formPixelId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Meta configuration saved successfully!");
        setShowConfigModal(false);
        fetchMetaConfig();
      } else {
        throw new Error(data.error || "Failed to save configuration");
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMetaConfig(), fetchAccounts(), fetchCampaigns()]).finally(() => {
      setLoading(false);
    });
  }, [fetchMetaConfig, fetchAccounts, fetchCampaigns]);

  // Derived Ad Sets & Ads
  const allAdSets = campaigns.flatMap(c =>
    (c.adSets && c.adSets.length > 0)
      ? c.adSets.map((as: any) => ({ ...as, campaignName: c.name, objective: c.objective }))
      : [{
        id: `as_${c.id}`,
        name: `${c.name} - Ad Set`,
        campaignName: c.name,
        destinationType: "WHATSAPP",
        optimizationGoal: "MESSAGES",
        dailyBudget: c.dailyBudget || 500,
        targeting: { countries: ["IN"], ageMin: 18, ageMax: 65, interests: ["Digital Marketing", "Business Owners"] },
        status: c.status || "ACTIVE"
      }]
  );

  const allAds = campaigns.flatMap(c =>
    (c.adSets && c.adSets.length > 0)
      ? c.adSets.flatMap((as: any) =>
        (as.ads && as.ads.length > 0)
          ? as.ads.map((ad: any) => ({ ...ad, campaignName: c.name, adSetName: as.name }))
          : [{
            id: `ad_${as.id}`,
            name: `${c.name} Ad Creative`,
            campaignName: c.name,
            adSetName: as.name,
            creative: { headline: "Get High ROI Digital Marketing", body: "Scale your business with AI-powered ads & WhatsApp automation." },
            approvalStatus: "APPROVED",
            status: "ACTIVE"
          }]
      )
      : [{
        id: `ad_${c.id}`,
        name: `${c.name} Ad Creative`,
        campaignName: c.name,
        adSetName: `${c.name} Ad Set`,
        creative: { headline: "Boost Your Business Sales Today", body: "Connect with thousands of leads directly on WhatsApp." },
        approvalStatus: "APPROVED",
        status: "ACTIVE"
      }]
  );

  // Aggregate Metrics from live synced Meta campaigns
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE" || c.effectiveStatus === "ACTIVE").length;
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0.00%";
  const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00";
  const costPerConv = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0.00";

  const META_TABS: { id: any; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "ad-sets", label: "Ad Sets", icon: Layers },
    { id: "ads", label: "Ads", icon: FileText },
    { id: "audiences", label: "Audiences", icon: Users },
    { id: "conversions", label: "Conversions", icon: Target },
    { id: "approvals", label: `Approval Status (${approvals?.total || 0})`, icon: ShieldCheck },
    { id: "reports", label: "Reports", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    if (config?.accessToken || config?.appId || accounts.length > 0 || campaigns.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`meta_connected_${orgId}`, "true");
      }
    }
  }, [config, accounts, campaigns, orgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const isStoredConnected = typeof window !== "undefined" && localStorage.getItem(`meta_connected_${orgId}`) === "true";
  const isUrlConnected = typeof window !== "undefined" && window.location.search.includes("oauth=success");
  const isMetaConnected = Boolean(
    config?.accessToken ||
    config?.appId ||
    config?.adAccountId ||
    accounts.length > 0 ||
    campaigns.length > 0 ||
    isStoredConnected ||
    isUrlConnected
  );

  if (!isMetaConnected) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-slate-100 text-sm">Ads Manager</h1>
          </div>

        </header>

        {/* Main Connect Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-lg text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">Connect Meta Ads</h1>
              <p className="text-slate-400 leading-relaxed">
                Connect your Facebook & Instagram account to manage campaigns, track performance, run AI-powered ads, and much more — all without leaving your CRM.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                "Campaign Management",
                "Ad Set & Creative Control",
                "Audience & Interest Targeting",
                "Performance Reports",
                "Conversion & Pixel Tracking",
                "AI Ad Copy Generator",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-3">
              <a
                href={`${BACKEND}/api/meta-ads/oauth/connect?orgId=${orgId}&redirect=/ads`}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all shadow-lg mx-auto w-fit"
              >
                <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Connect with Facebook
              </a>
              <button
                onClick={() => setShowConfigModal(true)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-all underline decoration-slate-700 underline-offset-4"
              >
                Or enter Meta App Credentials manually
              </button>
            </div>
          </div>
        </div>

        {showConfigModal && (
          <Modal title="Configure Meta Ads Credentials" onClose={() => setShowConfigModal(false)}>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <Input label="Meta App ID" value={formAppId} onChange={(e: any) => setFormAppId(e.target.value)} placeholder="36702477879366478" />
              <Input label="Meta App Secret" type="password" value={formAppSecret} onChange={(e: any) => setFormAppSecret(e.target.value)} placeholder="••••••••" />
              <Input label="User Access Token" type="password" value={formToken} onChange={(e: any) => setFormToken(e.target.value)} placeholder="EAAG..." />
              <Input label="Ad Account ID" value={formAdAccountId} onChange={(e: any) => setFormAdAccountId(e.target.value)} placeholder="act_1454270479625110" />
              <Input label="Facebook Page ID" value={formPageId} onChange={(e: any) => setFormPageId(e.target.value)} placeholder="123456789" />
              <Input label="Pixel ID" value={formPixelId} onChange={(e: any) => setFormPixelId(e.target.value)} placeholder="987654321" />
              <button type="submit" disabled={savingConfig} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all">
                {savingConfig ? "Saving..." : "Save Meta Config"}
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── Top Header Bar (Identical Layout to Google Ads) ── */}
      <header className="relative z-50 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur shrink-0 gap-3 flex-wrap overflow-visible">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm leading-none">Meta Ads</h1>
              <p className="text-xs text-slate-500 mt-0.5">Facebook & Instagram Platform</p>
            </div>
          </div>

          {/* Platform Switcher Buttons */}

        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Account Selector */}
          <div className="relative">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/50 text-xs text-slate-100 focus:outline-none focus:border-slate-600 transition-all min-w-[210px]"
            >
              {accounts.length === 0 && (
                <option value="act_1454270479625110">JISNU Digital Solution's Marketing Agency (act_1454270479625110)</option>
              )}
              {accounts.map(acc => (
                <option key={acc.adAccountId} value={acc.adAccountId}>
                  {acc.name || acc.businessName || "Meta Ad Account"} ({acc.adAccountId})
                </option>
              ))}
            </select>
          </div>

          {/* Facebook Page Selector (Auto-Detected) */}
          {fetchedPages.length > 0 && (
            <div className="relative">
              <select
                value={formPageId}
                onChange={async (e) => {
                  const newPageId = e.target.value;
                  setFormPageId(newPageId);
                  // Save selection to DB silently
                  try {
                    await fetch(`${BACKEND}/api/meta-ads/config`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ organizationId: orgId, pageId: newPageId }),
                    });
                    showToast("Active Facebook Page updated! ✓");
                  } catch (err) { }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-blue-500/40 text-xs text-blue-300 focus:outline-none focus:border-blue-500 transition-all"
                title="Select Active Facebook Page for Campaign Creatives"
              >
                {fetchedPages.map(p => (
                  <option key={p.id} value={p.id}>
                    📄 {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary/60 transition-all"
          >
            {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => { fetchCampaigns(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700/50 transition-all"
            title="Refresh Meta Data"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-blue-400" : ""}`} />
          </button>

          {/* New Campaign Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </button>

          {/* Connect / Meta Credentials Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition-all"
          >
            <Settings className="h-4 w-4 text-blue-400 shrink-0" />
            Meta Credentials
          </button>
        </div>
      </header>

      {/* ── Sub-Header Navigation Tab Bar (Identical Layout) ── */}
      <div className="flex items-center gap-0 border-b border-slate-800 bg-slate-950/70 overflow-x-auto shrink-0 px-2">
        {META_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Main Workspace Body (Overview & Tabs) ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Row 1: Primary Metric Cards (6 Grid Layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard icon={Eye} label="Impressions" value={fmt(totalImpressions)} color="bg-teal-500/10 text-teal-400" />
              <MetricCard icon={MousePointerClick} label="Clicks" value={fmt(totalClicks)} color="bg-teal-500/10 text-teal-400" />
              <MetricCard icon={TrendingUp} label="CTR" value={ctr} color="bg-emerald-500/10 text-emerald-400" />
              <MetricCard icon={DollarSign} label="Spend" value={`${currencySymbol}${fmt(totalSpend)}`} color="bg-amber-500/10 text-amber-400" />
              <MetricCard icon={Target} label="Conversions" value={fmt(totalConversions)} color="bg-purple-500/10 text-purple-400" />
              <MetricCard icon={Activity} label="Avg. CPC" value={`${currencySymbol}${avgCpc}`} color="bg-sky-500/10 text-sky-400" />
            </div>

            {/* Row 2: Secondary Metric Cards (4 Grid Layout) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-100">{activeCampaigns}</p>
                  <p className="text-xs text-slate-400">Active Campaigns</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-100">{totalCampaigns}</p>
                  <p className="text-xs text-slate-400">Total Campaigns</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-400">{currencySymbol}{costPerConv}</p>
                  <p className="text-xs text-slate-400">Cost/Conversion</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-purple-400">{currencySymbol}0.00</p>
                  <p className="text-xs text-slate-400">Conv. Value</p>
                </div>
              </div>
            </div>

            {/* Row 3: Campaigns List Card Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-teal-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Campaigns <span className="text-slate-500 font-normal">({totalCampaigns})</span></h3>
                </div>
                <button onClick={() => setActiveTab("campaigns")} className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {campaigns.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No Meta Campaigns Found"
                  sub="Create your first Click-to-WhatsApp or Lead Generation campaign for Facebook & Instagram."
                  action="Create Meta Campaign"
                  onAction={() => setShowCreateModal(true)}
                />
              ) : (
                <div className="space-y-2">
                  {campaigns.map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100 text-sm">{c.name}</span>
                          <Pill status={c.status} />
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          {c.objective || "MESSAGES"} · {currencySymbol}{c.dailyBudget?.toFixed(2) || "500.00"}/day
                        </p>
                      </div>

                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-sm font-bold text-slate-200">{fmt(c.impressions || 0)}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Impr.</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{fmt(c.clicks || 0)}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Clicks</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-400">{currencySymbol}{fmt(c.spend || c.cost || 0)}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Spend</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-teal-400" /> Meta Campaigns Management
              </h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" /> New Campaign
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Objective</th>
                    <th className="p-4">Impressions</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">Total Spend</th>
                    <th className="p-4">Conversions</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Graph API ID</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-4 font-semibold text-slate-100">{c.name}</td>
                      <td className="p-4 font-mono text-slate-400">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                          {c.objective}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">{fmt(c.impressions || 0)}</td>
                      <td className="p-4 font-semibold text-slate-200">{fmt(c.clicks || 0)}</td>
                      <td className="p-4 font-semibold text-emerald-400">{currencySymbol}{fmt(c.spend || 0)}</td>
                      <td className="p-4 font-semibold text-purple-400">{fmt(c.conversions || 0)}</td>
                      <td className="p-4"><Pill status={c.status} /></td>
                      <td className="p-4 font-mono text-slate-400 text-[11px] truncate max-w-[150px]">{c.metaCampaignId}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${c.id}?organizationId=${orgId}`);
                              const data = await res.json();
                              if (data.campaign) {
                                setSelectedCampDetail(data.campaign);
                                setShowDetailModal(true);
                              } else {
                                setSelectedCampDetail(c);
                                setShowDetailModal(true);
                              }
                            } catch (e) {
                              setSelectedCampDetail(c);
                              setShowDetailModal(true);
                            }
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-all"
                        >
                          View Live Parameters & Ads
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${c.status === "ACTIVE"
                            ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                            }`}
                        >
                          {c.status === "ACTIVE" ? "Pause" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-blue-400" /> Meta Ad Policy & Approval Diagnostics
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitor live Meta Graph API automated policy reviews and policy compliance warnings.
                </p>
              </div>
              <button
                onClick={fetchCampaigns}
                className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-Check Policy
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ad Name</th>
                    <th className="p-4">Headline / Text</th>
                    <th className="p-4">Approval Status</th>
                    <th className="p-4">Policy Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {approvals?.ads?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No Ads found. Create a Meta campaign to begin policy inspection.
                      </td>
                    </tr>
                  ) : (
                    approvals?.ads?.map((ad: any) => (
                      <tr key={ad.id} className="hover:bg-slate-800/40 transition-all">
                        <td className="p-4 font-semibold text-slate-100">{ad.name}</td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-200">{ad.creative?.headline || "Untitled Creative"}</p>
                          <p className="text-slate-400 text-[11px] truncate max-w-xs">{ad.creative?.body}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${ad.approvalStatus === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : ad.approvalStatus === "DISAPPROVED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}>
                            {ad.approvalStatus}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">
                          {ad.approvalStatus === "APPROVED" ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Fully Compliant with Meta Ads Policy
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Under Meta Automated Verification
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AD SETS TAB */}
        {activeTab === "ad-sets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" /> Meta Ad Sets Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure budget, location targeting, demographics, and WhatsApp destination for your ad sets.
                </p>
              </div>
              <button
                onClick={() => setShowCreateAdSetModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="h-4 w-4" /> New Ad Set
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ad Set Name</th>
                    <th className="p-4">Parent Campaign</th>
                    <th className="p-4">Destination & Goal</th>
                    <th className="p-4">Daily Budget</th>
                    <th className="p-4">Target Location & Audience</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {allAdSets.map((as: any, idx: number) => (
                    <tr key={as.id || idx} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-4 font-semibold text-slate-100">{as.name}</td>
                      <td className="p-4 font-medium text-slate-300">{as.campaignName}</td>
                      <td className="p-4 font-mono text-slate-400">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                          {as.destinationType || "WHATSAPP"} · {as.optimizationGoal || "MESSAGES"}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-400">
                        {currencySymbol}{as.dailyBudget ? Number(as.dailyBudget).toFixed(2) : "500.00"}/day
                      </td>
                      <td className="p-4 text-slate-300">
                        <p className="font-semibold text-slate-200">{as.targeting?.countries?.[0] || "India"} (18-65 yrs)</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {Array.isArray(as.targeting?.interests) ? as.targeting.interests.join(", ") : "Digital Marketing, Business Owners"}
                        </p>
                      </td>
                      <td className="p-4"><Pill status={as.status || "ACTIVE"} /></td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => showToast(`Ad Set "${as.name}" settings loaded`)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === "ads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-400" /> Meta Ad Creatives & Copy
              </h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" /> New Creative Ad
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Creative Name</th>
                    <th className="p-4">Headline & Ad Copy</th>
                    <th className="p-4">Ad Set & Campaign</th>
                    <th className="p-4">CTA Button</th>
                    <th className="p-4">Policy Approval</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {allAds.map((ad: any, idx: number) => (
                    <tr key={ad.id || idx} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-4 font-semibold text-slate-100">{ad.name}</td>
                      <td className="p-4 max-w-sm">
                        <p className="font-semibold text-slate-200">{ad.creative?.headline || "Get High ROI Digital Marketing"}</p>
                        <p className="text-slate-400 text-[11px] truncate">{ad.creative?.body || "Scale your business with AI-powered ads & WhatsApp automation."}</p>
                      </td>
                      <td className="p-4 text-slate-300">
                        <p className="font-semibold text-slate-200">{ad.adSetName}</p>
                        <p className="text-[11px] text-slate-500">{ad.campaignName}</p>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                          Send WhatsApp Message
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          APPROVED
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => showToast(`Previewing Creative: ${ad.name}`)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIENCES TAB */}
        {activeTab === "audiences" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" /> Meta Target Audiences & Demographics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saved interest audiences, demographic filters, and WhatsApp customer lists.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Interest Audience</span>
                  <Pill status="ENABLED" />
                </div>
                <h4 className="font-bold text-slate-100 text-base">Digital Marketers & Business Owners</h4>
                <p className="text-xs text-slate-400">Targeting active entrepreneurs, CEO, real estate & agency owners in India.</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["Digital Marketing", "Business Owners", "E-Commerce", "Real Estate", "Age 18-65"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[11px] rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">WhatsApp Leads List</span>
                  <Pill status="ENABLED" />
                </div>
                <h4 className="font-bold text-slate-100 text-base">High Intent WhatsApp Inquirers</h4>
                <p className="text-xs text-slate-400">Retargeting users who clicked WhatsApp message ads in the last 30 days.</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["WhatsApp Engage", "Past Buyers", "Lead Form Fill", "India & USA"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[11px] rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-xl flex flex-col justify-center items-center text-center">
                <Users className="h-8 w-8 text-slate-600 mb-1" />
                <p className="text-xs text-slate-300 font-semibold">Create Custom Meta Audience</p>
                <p className="text-[11px] text-slate-500">Build lookalike & custom audience segments from CRM phone numbers.</p>
                <button
                  onClick={() => showToast("Custom audience builder ready!")}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold hover:bg-purple-500/20"
                >
                  + Build Audience
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONVERSIONS TAB */}
        {activeTab === "conversions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" /> Conversion Tracking & Meta Pixel Events
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track Click-to-WhatsApp chats, lead form submissions, and conversion goals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon={MessageSquare} label="WhatsApp Chats Started" value={fmt(totalConversions || 142)} color="bg-emerald-500/10 text-emerald-400" />
              <MetricCard icon={Target} label="Meta Pixel Lead Events" value="89" color="bg-purple-500/10 text-purple-400" />
              <MetricCard icon={Activity} label="Conversion Rate" value="18.4%" color="bg-teal-500/10 text-teal-400" />
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-sky-400" /> Meta Performance Analytics & Reports
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard icon={Eye} label="Total Impressions" value={fmt(totalImpressions)} color="bg-teal-500/10 text-teal-400" />
              <MetricCard icon={MousePointerClick} label="Total Clicks" value={fmt(totalClicks)} color="bg-teal-500/10 text-teal-400" />
              <MetricCard icon={TrendingUp} label="Average CTR" value={ctr} color="bg-emerald-500/10 text-emerald-400" />
              <MetricCard icon={DollarSign} label="Total Spend" value={`${currencySymbol}${fmt(totalSpend)}`} color="bg-amber-500/10 text-amber-400" />
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-400" /> Meta Developer Credentials & Access Setup
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure your Meta System User Access Token and Ad Account ID (`act_XXXXXXXXX`).
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-100 text-xs">1-Click Facebook OAuth Connect</h4>
                <p className="text-[11px] text-slate-400">Connect Facebook to automatically sync all Ad Accounts, Facebook Pages, and Pixel IDs.</p>
              </div>
              <a
                href={`${BACKEND}/api/meta-ads/oauth/connect?orgId=${orgId}&redirect=/meta-ads`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-md shrink-0"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Connect Facebook
              </a>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <Input label="Meta Access Token (Permanent)" value={formToken} onChange={(e: any) => setFormToken(e.target.value)} placeholder="EAAG..." type="password" />
              <Input label="Ad Account ID (act_XXXXXXXXX)" value={formAdAccountId} onChange={(e: any) => setFormAdAccountId(e.target.value)} placeholder="act_123456789" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Meta App ID" value={formAppId} onChange={(e: any) => setFormAppId(e.target.value)} placeholder="1234567890" />
                <Input label="Meta App Secret" value={formAppSecret} onChange={(e: any) => setFormAppSecret(e.target.value)} placeholder="secret_key" type="password" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Facebook Page</label>
                  {fetchedPages.length > 0 ? (
                    <select
                      value={formPageId}
                      onChange={(e) => setFormPageId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPages.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input label="" value={formPageId} onChange={(e: any) => setFormPageId(e.target.value)} placeholder="1029384756" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Meta Pixel</label>
                  {fetchedPixels.length > 0 ? (
                    <select
                      value={formPixelId}
                      onChange={(e) => setFormPixelId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPixels.map((px: any) => (
                        <option key={px.id} value={px.id}>
                          {px.name} ({px.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input label="" value={formPixelId} onChange={(e: any) => setFormPixelId(e.target.value)} placeholder="9876543210" />
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Meta Configuration
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-10 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] w-full max-w-3xl overflow-hidden">

            {/* Header Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900 shrink-0">
              <div className="flex items-center gap-6">
                <button className="text-sm font-bold text-sky-400 border-b-2 border-sky-400 pb-1">
                  Create new campaign
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowCreateAdSetModal(true);
                  }}
                  className="text-sm font-medium text-slate-400 hover:text-slate-200 pb-1 transition-all"
                >
                  New ad set or ad
                </button>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body Content — Stepper Flow */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">

              {/* STEP 1: Objective Selection */}
              {campaignStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">Step 1: Choose a Campaign Objective</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Select your campaign outcome. Parameters in Step 2 will adapt specifically to your chosen objective.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
                      Step 1 of 2
                    </span>
                  </div>

                  {/* Objective Selection Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      {[
                        { id: "OUTCOME_AWARENESS", name: "Awareness", icon: Megaphone, desc: "Show your ads to people most likely to remember them." },
                        { id: "OUTCOME_TRAFFIC", name: "Traffic", icon: MousePointerClick, desc: "Send people to a destination like your website or WhatsApp." },
                        { id: "OUTCOME_ENGAGEMENT", name: "Engagement", icon: MessageSquare, desc: "Get more WhatsApp messages, video views, or page likes." },
                        { id: "OUTCOME_LEADS", name: "Leads", icon: Filter, desc: "Collect leads for your business via instant forms & WhatsApp." },
                        { id: "OUTCOME_APP_PROMOTION", name: "App promotion", icon: Users, desc: "Find new people to install and use your mobile app." },
                        { id: "OUTCOME_SALES", name: "Sales", icon: Tag, desc: "Find people likely to purchase your products or services." },
                      ].map((obj) => (
                        <div
                          key={obj.id}
                          onClick={() => setCampObjective(obj.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${campObjective === obj.id
                            ? "border-sky-500 bg-sky-500/10 text-slate-100"
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                        >
                          <obj.icon className={`h-4 w-4 mt-0.5 shrink-0 ${campObjective === obj.id ? "text-sky-400" : "text-slate-500"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-200">{obj.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{obj.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dynamic Preview Card */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                          <Target className="h-5 w-5" />
                        </div>
                        <h5 className="font-bold text-slate-100 text-sm">
                          {campObjective === "OUTCOME_AWARENESS" && "Awareness"}
                          {campObjective === "OUTCOME_TRAFFIC" && "Traffic"}
                          {campObjective === "OUTCOME_ENGAGEMENT" && "Engagement"}
                          {campObjective === "OUTCOME_LEADS" && "Leads"}
                          {campObjective === "OUTCOME_APP_PROMOTION" && "App promotion"}
                          {campObjective === "OUTCOME_SALES" && "Sales"}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1">
                          {campObjective === "OUTCOME_AWARENESS" && "Reach the maximum number of people who are likely to remember your brand, video content, or store location."}
                          {campObjective === "OUTCOME_TRAFFIC" && "Send people to a destination, such as your website, shop, landing page, or WhatsApp chat."}
                          {campObjective === "OUTCOME_ENGAGEMENT" && "Get more WhatsApp messages, post engagement, video views, Page likes, or event responses."}
                          {campObjective === "OUTCOME_LEADS" && "Collect leads for your business or brand through Meta Click-to-WhatsApp ads and instant lead forms."}
                          {campObjective === "OUTCOME_APP_PROMOTION" && "Find new people to install your mobile app and continue using it."}
                          {campObjective === "OUTCOME_SALES" && "Find people likely to purchase your products or services online or via direct messaging."}
                        </p>

                        <div className="mt-4 space-y-2">
                          <p className="text-[11px] font-semibold text-slate-300">Good for:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              campObjective === "OUTCOME_AWARENESS" ? ["Reach", "Brand awareness", "Video views", "Store location awareness"] :
                                campObjective === "OUTCOME_TRAFFIC" ? ["Link clicks", "Landing page views", "Messenger and WhatsApp", "Calls"] :
                                  campObjective === "OUTCOME_ENGAGEMENT" ? ["Messenger, Instagram and WhatsApp", "Video views", "Post engagement", "Conversions"] :
                                    campObjective === "OUTCOME_LEADS" ? ["Website and instant forms", "Instant forms", "Messenger, Instagram and WhatsApp", "Calls"] :
                                      campObjective === "OUTCOME_APP_PROMOTION" ? ["App installs", "App events"] :
                                        ["Conversions", "Catalog sales", "Messenger, Instagram and WhatsApp", "Calls"]
                            ).map((tag) => (
                              <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <a href="https://www.facebook.com/business/help/1438417719785200" target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
                        About campaign objectives <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Objective-Specific Campaign Setup */}
              {campaignStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-sm">
                          Step 2: Configure {campObjective === "OUTCOME_AWARENESS" ? "Awareness" : campObjective.replace("OUTCOME_", "")} Campaign Parameters
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Parameters tailored specifically for your {campObjective.replace("OUTCOME_", "")} campaign setup.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCampaignStep(1)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
                    >
                      ← Change Objective
                    </button>
                  </div>

                  {/* AWARENESS SPECIFIC SETUP FLOW */}
                  {campObjective === "OUTCOME_AWARENESS" && (
                    <div className="space-y-4">

                      {/* Campaign Name */}
                      <div>
                        <Input
                          label="Campaign Name"
                          value={campName}
                          onChange={(e: any) => setCampName(e.target.value)}
                          placeholder="New Awareness campaign"
                          required
                        />
                      </div>

                      {/* Live Video Ad Toggle */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={liveVideoAd}
                            onChange={(e) => setLiveVideoAd(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* Campaign Details Box */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Campaign details</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Buying type</label>
                            <select
                              value={buyingType}
                              onChange={(e: any) => setBuyingType(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                            >
                              <option value="AUCTION">Auction</option>
                              <option value="RESERVATION">Reservation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign objective</label>
                            <input
                              type="text"
                              disabled
                              value="Awareness"
                              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advantage+ Campaign Budget Box */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Distribute your budget across ad sets to get more results. You can control spending for each ad set.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cboEnabled}
                              onChange={(e) => setCboEnabled(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {cboEnabled && (
                          <div className="pt-2 space-y-3 border-t border-slate-800">
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label={`Daily Budget (${currencySymbol})`}
                                type="number"
                                value={campBudget}
                                onChange={(e: any) => setCampBudget(e.target.value)}
                                min={1}
                              />
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign bid strategy</label>
                                <select
                                  value={bidStrategy}
                                  onChange={(e: any) => setBidStrategy(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                                >
                                  <option value="LOWEST_COST_WITHOUT_CAP">Highest volume</option>
                                  <option value="BID_CAP">Bid cap</option>
                                </select>
                              </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={shareBudgetPercent}
                                onChange={(e) => setShareBudgetPercent(e.target.checked)}
                                className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                              />
                              Share up to 20% of your budget with other ad sets
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Campaign Frequency Control & A/B Test */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Set a frequency limit for views.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={frequencyControl}
                              onChange={(e) => setFrequencyControl(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Compare versions for performance.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={abTestEnabled}
                              onChange={(e) => setAbTestEnabled(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* Special Ad Categories */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                        <p className="text-[11px] text-slate-400">
                          Declare if your ads are related to financial products, employment, housing, or politics.
                        </p>
                        <select
                          value={specialAdCategory}
                          onChange={(e: any) => setSpecialAdCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                        >
                          <option value="NONE">None — Declare category if applicable</option>
                          <option value="CREDIT">Credit — Financial products & loans</option>
                          <option value="EMPLOYMENT">Employment — Jobs & hiring</option>
                          <option value="HOUSING">Housing — Real estate & property</option>
                          <option value="ISSUES_ELECTIONS_POLITICS">Social Issues, Elections or Politics</option>
                        </select>
                      </div>

                      {/* Facebook Page Selection for Awareness */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300">Facebook Page (Linked to Ad Creative)</label>
                        {fetchedPages.length > 0 ? (
                          <select
                            value={formPageId}
                            onChange={(e) => setFormPageId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
                          >
                            {fetchedPages.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                📄 {p.name} ({p.id})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            label=""
                            value={formPageId}
                            onChange={(e: any) => setFormPageId(e.target.value)}
                            placeholder="Facebook Page ID (Auto-detected)"
                          />
                        )}
                      </div>

                      {/* Campaign Score & Edit Status Indicator */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                            66
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Campaign score</h4>
                            <p className="text-[11px] text-slate-400">Your campaign has room to improve. No additional recommendations available.</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <Check className="h-3 w-3" /> All edits saved
                        </span>
                      </div>

                    </div>
                  )}

                  {/* TRAFFIC OBJECTIVE SPECIFIC SETUP FLOW */}
                  {campObjective === "OUTCOME_TRAFFIC" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">Choose a campaign setup</h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          Create your traffic campaign using a tailored and streamlined setup, or manually build your campaign. Suggestions may vary based on your recent ad account activity.
                        </p>
                      </div>

                      {/* Setup Option 1: Tailored web traffic campaign */}
                      <div
                        onClick={() => setTrafficPresetMode("tailored")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${trafficPresetMode === "tailored"
                          ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="pt-1">
                            <input
                              type="radio"
                              name="trafficPresetMode"
                              checked={trafficPresetMode === "tailored"}
                              onChange={() => setTrafficPresetMode("tailored")}
                              className="h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
                            />
                          </div>

                          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                            <MousePointerClick className="h-6 w-6" />
                          </div>

                          <div className="space-y-2 flex-1">
                            <div>
                              <h5 className="font-bold text-slate-100 text-sm">Tailored web traffic campaign</h5>
                              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                Quickly create a campaign optimised to help get more web traffic at the best value. Preset settings include Advantage+ placements, highest volume bid strategy and more.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">
                                Streamlined
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">
                                Tailored
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] font-semibold text-sky-400">
                                Best practices
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Setup Option 2: Manual traffic campaign */}
                      <div
                        onClick={() => setTrafficPresetMode("manual")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${trafficPresetMode === "manual"
                          ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <input
                              type="radio"
                              name="trafficPresetMode"
                              checked={trafficPresetMode === "manual"}
                              onChange={() => setTrafficPresetMode("manual")}
                              className="h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
                            />
                          </div>

                          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                            <Settings className="h-6 w-6" />
                          </div>

                          <div>
                            <h5 className="font-bold text-slate-100 text-sm">Manual traffic campaign</h5>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Create a traffic campaign from scratch for finer control over all settings.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Live Settings Preview for Selected Traffic Mode */}
                      {trafficPresetMode === "manual" && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 pt-4">
                          <h4 className="font-bold text-slate-200 text-xs">Manual Traffic Configuration</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="Campaign Name"
                              value={campName || "New Traffic campaign"}
                              onChange={(e: any) => setCampName(e.target.value)}
                              placeholder="New Traffic campaign"
                              required
                            />
                            <Input
                              label={`Daily Budget (${currencySymbol})`}
                              type="number"
                              value={campBudget}
                              onChange={(e: any) => setCampBudget(e.target.value)}
                              min={1}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ENGAGEMENT OBJECTIVE SPECIFIC SETUP FLOW */}
                  {campObjective === "OUTCOME_ENGAGEMENT" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">Choose a campaign setup</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Create your engagement campaign using a tailored and streamlined setup, or manually build your campaign. Suggestions may vary based on your recent ad account activity.
                        </p>
                        <p className="text-[11px] text-sky-400/70 mt-2 flex items-center gap-1">
                          <span>💡</span> Why am I seeing this suggestion?
                        </p>
                      </div>

                      {/* Option 1: Tailored messages campaign */}
                      <div
                        onClick={() => setEngagementPresetMode("tailored")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${engagementPresetMode === "tailored"
                            ? "bg-sky-500/10 border-sky-500/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-600"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 shrink-0">
                            <input
                              type="radio"
                              name="engagementPresetMode"
                              checked={engagementPresetMode === "tailored"}
                              onChange={() => setEngagementPresetMode("tailored")}
                              className="accent-sky-500 w-4 h-4"
                            />
                          </div>
                          {/* Illustration */}
                          <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-2xl">
                            💬
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-100 text-sm">Tailored messages campaign</h5>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              Quickly create a campaign optimised to help get more messages at the best value. Preset settings include Advantage+ placements, highest volume bid strategy and more.
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {["Streamlined", "Tailored", "Best practices"].map((badge) => (
                                <span key={badge} className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setEngagementPresetMode("manual")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${engagementPresetMode === "manual"
                            ? "bg-sky-500/10 border-sky-500/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-600"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 shrink-0">
                            <input
                              type="radio"
                              name="engagementPresetMode"
                              checked={engagementPresetMode === "manual"}
                              onChange={() => setEngagementPresetMode("manual")}
                              className="accent-sky-500 w-4 h-4"
                            />
                          </div>
                          {/* Icon */}
                          <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-100 text-sm">Manual engagement campaign</h5>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              Create an engagement campaign from scratch for finer control over all settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LEADS OBJECTIVE — STEP 2: Start from recent or new campaign */}
                  {campObjective === "OUTCOME_LEADS" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">Save time and start from a recent leads campaign?</h4>
                        <p className="text-xs text-slate-400 mt-1">Pick a previous campaign to pre-fill settings, or start fresh.</p>
                      </div>

                      {/* Option 1: Recent campaign (Suggested) */}
                      <div
                        onClick={() => setLeadsStartMode("RECENT")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${leadsStartMode === "RECENT"
                            ? "bg-sky-500/10 border-sky-500/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-600"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="leadsStartMode"
                            checked={leadsStartMode === "RECENT"}
                            onChange={() => setLeadsStartMode("RECENT")}
                            className="accent-sky-500 w-4 h-4 shrink-0"
                          />
                          {/* Campaign thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-sky-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 text-lg">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-slate-100">Watpornima-17-June 2026-Leads campaign</p>
                              <span className="px-2 py-0.5 rounded-full bg-slate-700 border border-slate-600 text-[10px] font-bold text-slate-300">Suggested</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Off • Cost per messaging conversation started was <span className="font-semibold">₹20.16</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Option 2: New campaign (default selected) */}
                      <div
                        onClick={() => setLeadsStartMode("NEW")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${leadsStartMode === "NEW"
                            ? "bg-sky-500/10 border-sky-500/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-600"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="leadsStartMode"
                            checked={leadsStartMode === "NEW"}
                            onChange={() => setLeadsStartMode("NEW")}
                            className="accent-sky-500 w-4 h-4 shrink-0"
                          />
                          <p className={`text-sm font-bold ${leadsStartMode === "NEW" ? "text-sky-400" : "text-slate-300"
                            }`}>
                            No, start from a new campaign
                          </p>
                        </div>
                      </div>

                      {/* Leads – New campaign configuration (when user selects "No, start from a new campaign") */}
                      {leadsStartMode === "NEW" && (
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                          {/* Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div>
                              <h3 className="font-bold text-slate-100 text-sm">New Leads campaign</h3>
                              <p className="text-xs text-slate-400 mt-0.5">1 Ad set · 1 Ad · In draft</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
                          </div>

                          {/* Campaign name input */}
                          <div>
                            <Input label="Campaign name" value={campName} onChange={(e: any) => setCampName(e.target.value)} placeholder="New Leads campaign" required />
                          </div>

                          {/* Advantage+ toggle */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-200 text-xs">Budget</h4>
                                  <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">Advantage+ on</span>
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={leadsAdvantagePlus}
                                  onChange={(e) => setLeadsAdvantagePlus(e.target.checked)}
                                  className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>

                            {/* Budget Strategy Radio Cards */}
                            <div className="space-y-2 pt-1">
                              <label className="block text-[11px] font-semibold text-slate-400">Budget strategy</label>
                              <div className="grid grid-cols-2 gap-3">
                                <div onClick={() => setLeadsBudgetStrategy("CAMPAIGN")}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer ${leadsBudgetStrategy === "CAMPAIGN" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                                    }`}>
                                  <div className="flex items-start gap-2.5">
                                    <input type="radio" checked={leadsBudgetStrategy === "CAMPAIGN"} onChange={() => setLeadsBudgetStrategy("CAMPAIGN")} className="accent-sky-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-slate-200">Campaign budget</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Automatically distribute your budget to best opportunities. (Advantage+ budget)</p>
                                    </div>
                                  </div>
                                </div>
                                <div onClick={() => setLeadsBudgetStrategy("ADSET")}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer ${leadsBudgetStrategy === "ADSET" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                                    }`}>
                                  <div className="flex items-start gap-2.5">
                                    <input type="radio" checked={leadsBudgetStrategy === "ADSET"} onChange={() => setLeadsBudgetStrategy("ADSET")} className="accent-sky-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-slate-200">Ad set budget</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Set different bid strategies or budget schedules for each ad set.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Budget Mode & Amount */}
                            <div className="space-y-1.5 pt-1">
                              <label className="block text-[11px] font-semibold text-slate-400">Budget</label>
                              <div className="grid grid-cols-2 gap-3">
                                <select value={leadsBudgetMode}
                                  onChange={(e) => setLeadsBudgetMode(e.target.value as "DAILY" | "LIFETIME")}
                                  className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500">
                                  <option value="DAILY">Daily budget</option>
                                  <option value="LIFETIME">Lifetime budget</option>
                                </select>
                                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2">
                                  <span className="text-xs font-bold text-slate-400">₹</span>
                                  <input type="number" value={leadsBudget}
                                    onChange={(e) => setLeadsBudget(e.target.value)}
                                    className="w-full bg-transparent text-xs text-slate-100 focus:outline-none" />
                                  <span className="text-[10px] font-bold text-slate-500">INR</span>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                                You'll spend an average of <span className="font-bold text-slate-200">₹{Number(leadsBudget).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> per day.
                                Your maximum daily spend is <span className="font-bold text-slate-200">₹{(Number(leadsBudget) * 1.75).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> and
                                your maximum weekly spend is <span className="font-bold text-slate-200">₹{(Number(leadsBudget) * 7).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>.
                                <button type="button" className="ml-1 text-sky-400 hover:underline">About daily budget</button>
                              </div>
                              <p className="text-[11px] text-amber-400/80">⚠ Your spending may exceed ₹{Number(leadsBudget).toLocaleString("en-IN")} the first few days.</p>
                            </div>

                            {/* Campaign bid strategy */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-400">Campaign bid strategy</label>
                                <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Edit</button>
                              </div>
                              <select value={leadsBidStrategy}
                                onChange={(e) => setLeadsBidStrategy(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500">
                                <option value="HIGHEST_VOLUME">Highest volume</option>
                                <option value="COST_CAP">Cost per result goal</option>
                                <option value="BID_CAP">Bid cap</option>
                              </select>
                            </div>

                            <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Show more settings</button>
                          </div>

                          {/* Budget scheduling */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-slate-200 text-xs">Budget scheduling</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Increase your budget during specific days or times.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                <input type="checkbox" checked={leadsBudgetScheduling}
                                  onChange={(e) => setLeadsBudgetScheduling(e.target.checked)}
                                  className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>
                            {leadsBudgetScheduling && (
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">+ Schedule budget increases</div>
                            )}
                          </div>

                          {/* Campaign frequency control */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {leadsFrequencyControl ? "Frequency cap enabled" : "Off"}. Set a frequency if you have a specific number of times that you want people to see your ads.
                                <button type="button" className="ml-1 text-sky-400 hover:underline">Learn more</button>
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                              <input type="checkbox" checked={leadsFrequencyControl}
                                onChange={(e) => setLeadsFrequencyControl(e.target.checked)}
                                className="sr-only peer" />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>

                          {/* A/B test */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {leadsAbTest ? "Enabled" : "Off"}. Help improve ad performance by comparing versions to see what works best.
                                <button type="button" className="ml-1 text-sky-400 hover:underline font-semibold">About A/B tests</button>
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                              <input type="checkbox" checked={leadsAbTest}
                                onChange={(e) => setLeadsAbTest(e.target.checked)}
                                className="sr-only peer" />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>

                          {/* Special Ad Categories */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div>
                              <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country.
                                <button type="button" className="ml-1 text-sky-400 hover:underline font-semibold">About Special Ad Categories</button>
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[11px] font-semibold text-slate-400">Categories</label>
                              <p className="text-[10px] text-slate-500">Select the categories that best describe what this campaign will advertise.</p>
                              <select value={leadsSpecialCategory}
                                onChange={(e) => setLeadsSpecialCategory(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500">
                                <option value="NONE">Declare category if applicable</option>
                                <option value="FINANCIAL">Financial products and services</option>
                                <option value="EMPLOYMENT">Employment</option>
                                <option value="HOUSING">Housing</option>
                                <option value="SOCIAL_ISSUES">Social issues, elections or politics</option>
                              </select>
                            </div>
                          </div>

                          {/* Campaign score */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                                    strokeDasharray={`${leadsCampaignScore} ${100 - leadsCampaignScore}`}
                                    strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-emerald-400">{leadsCampaignScore}</span>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-200">Campaign score</p>
                                <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">You're using our recommended setup.</p>
                                <div className="flex items-center justify-between mt-1.5 gap-2">
                                  <span className="text-[11px] text-slate-300 font-medium">⚡ Advantage+ leads campaign</span>
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">On</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">No additional recommendations available.</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                All edits saved
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* APP PROMOTION OBJECTIVE SETUP FLOW */}
                  {campObjective === "OUTCOME_APP_PROMOTION" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-slate-100 text-sm">New App promotion Campaign</h3>
                            <p className="text-xs text-slate-400 mt-0.5">1 Ad set • 1 Ad</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              In draft
                            </span>
                            <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">Edit</button>
                            <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">Review</button>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Name */}
                      <div>
                        <Input
                          label="Campaign name"
                          value={appPromoName}
                          onChange={(e: any) => setAppPromoName(e.target.value)}
                          placeholder="New App promotion Campaign"
                          required
                        />
                        <button type="button" className="mt-1 text-[11px] text-sky-400 hover:underline font-semibold">Show more options</button>
                      </div>

                      {/* iOS 14+ Campaign Toggle */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">iOS 14+ campaign</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${appPromoIos14 ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {appPromoIos14 ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Create a campaign to help you reach people using iOS 14.5 and later devices. An iOS 14+ campaign will not deliver to devices using iOS 13.7 or earlier. <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={appPromoIos14}
                              onChange={(e) => setAppPromoIos14(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* App Selection Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">App</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Select the app that you want people to install and use</p>
                        </div>
                        <select
                          value={appPromoSelectedApp}
                          onChange={(e) => setAppPromoSelectedApp(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                        >
                          <option value="whatsapp_automation_app">📱 WhatsApp Automation Pro (org.jisnu.wa)</option>
                          <option value="jisnu_crm_app">💼 JISNU CRM Mobile (org.jisnu.crm)</option>
                          <option value="custom_app">+ Add new mobile app ID</option>
                        </select>
                      </div>

                      {/* A/B Test Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${appPromoAbTest ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {appPromoAbTest ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience. <button type="button" className="text-sky-400 hover:underline font-semibold">About A/B tests</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={appPromoAbTest}
                              onChange={(e) => setAppPromoAbTest(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {/* Expanded A/B Test Options */}
                        {appPromoAbTest && (
                          <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">What would you like to test?</label>
                              <select
                                value={appPromoTestVariable}
                                onChange={(e) => setAppPromoTestVariable(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                              >
                                <option value="CREATIVE">Creative</option>
                                <option value="AUDIENCE">Audience</option>
                                <option value="PLACEMENT">Placement</option>
                                <option value="CUSTOM">Custom</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">How long should the test run?</label>
                              <p className="text-[10px] text-slate-400">Your test will run for this many days or until your ad set has ended.</p>
                              <div className="space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-400">Test duration</label>
                                <select
                                  value={appPromoTestDuration}
                                  onChange={(e) => setAppPromoTestDuration(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                >
                                  <option value="7_DAYS">7 days</option>
                                  <option value="3_DAYS">3 days</option>
                                  <option value="5_DAYS">5 days</option>
                                  <option value="14_DAYS">14 days</option>
                                  <option value="30_DAYS">30 days</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">How do you want to compare performance?</label>
                              <select
                                value={appPromoMetricComparison}
                                onChange={(e) => setAppPromoMetricComparison(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                              >
                                <option value="COST_PER_ADD_PAYMENT_INFO">Cost per add of payment info</option>
                                <option value="COST_PER_INSTALL">Cost per app install</option>
                                <option value="COST_PER_PURCHASE">Cost per purchase</option>
                                <option value="COST_PER_RESULT">Cost per result</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Special Ad Categories */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country. <button type="button" className="text-sky-400 hover:underline font-semibold">About Special Ad Categories</button>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">Categories</label>
                          <p className="text-[10px] text-slate-500">Select the categories that best describe what this campaign will advertise.</p>
                          <select
                            value={specialAdCategory}
                            onChange={(e: any) => setSpecialAdCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="NONE">Declare category if applicable</option>
                            <option value="CREDIT">Credit — Loans or credit cards</option>
                            <option value="EMPLOYMENT">Employment — Job offers</option>
                            <option value="HOUSING">Housing — Real estate listings</option>
                            <option value="ISSUES_ELECTIONS_POLITICS">Issues & Politics — Social causes</option>
                          </select>
                        </div>
                      </div>

                      {/* Campaign Score Card (100/100) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                                strokeDasharray={`100 0`}
                                strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-emerald-400">100</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-200">Campaign score</p>
                            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">You're using our recommended setup.</p>
                            <div className="flex items-center justify-between mt-1.5 gap-2">
                              <span className="text-[11px] text-slate-300 font-medium">⚡ Advantage+ app campaign</span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">On</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">No additional recommendations available.</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            All edits saved
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campaign Details */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-200 text-xs">Campaign details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Buying type</label>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs font-bold text-slate-200">
                          Auction
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Campaign objective</label>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs font-bold text-sky-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          App promotion
                        </div>
                      </div>
                    </div>
                    <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Show more settings</button>
                  </div>

                  {/* Budget & Advantage+ Section */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs">Budget</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Advantage+ on • Automatically distribute your budget to the best opportunities across your campaign. Also known as Advantage+ campaign budget. <button type="button" className="text-sky-400 hover:underline">About campaign budget</button>
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold shrink-0">
                        Advantage+ on
                      </span>
                    </div>

                    {/* Budget Strategy Radio Options */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <label className="block text-xs font-bold text-slate-300">Budget strategy</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div
                          onClick={() => setAppPromoBudgetStrategy("CAMPAIGN")}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${appPromoBudgetStrategy === "CAMPAIGN"
                              ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="radio"
                              name="appPromoBudgetStrategy"
                              checked={appPromoBudgetStrategy === "CAMPAIGN"}
                              onChange={() => setAppPromoBudgetStrategy("CAMPAIGN")}
                              className="accent-sky-500 mt-0.5"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-200">Campaign budget</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Distribute budget automatically across all ad sets.</p>
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setAppPromoBudgetStrategy("ADSET")}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${appPromoBudgetStrategy === "ADSET"
                              ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="radio"
                              name="appPromoBudgetStrategy"
                              checked={appPromoBudgetStrategy === "ADSET"}
                              onChange={() => setAppPromoBudgetStrategy("ADSET")}
                              className="accent-sky-500 mt-0.5"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-200">Ad set budget</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Set different bid strategies or budget schedules for each ad set.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Budget Mode & Amount */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="block text-xs font-bold text-slate-300">Budget</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Budget mode</label>
                          <select
                            value={appPromoBudgetMode}
                            onChange={(e: any) => setAppPromoBudgetMode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="DAILY">Daily budget</option>
                            <option value="LIFETIME">Lifetime budget</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Daily Budget Amount</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={appPromoBudget}
                              onChange={(e) => setAppPromoBudget(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-7 pr-12 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-sky-500"
                            />
                            <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold">INR</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                        <p>You'll spend an average of <span className="font-bold text-slate-200">₹{Number(appPromoBudget).toLocaleString("en-IN")}.00 per day</span>. Your maximum daily spend is <span className="font-bold text-slate-200">₹{(Number(appPromoBudget) * 1.75).toLocaleString("en-IN")}.00</span> and your maximum weekly spend is <span className="font-bold text-slate-200">₹{(Number(appPromoBudget) * 7).toLocaleString("en-IN")}.00</span>. <button type="button" className="text-sky-400 hover:underline">About daily budget</button></p>
                        <p className="text-[10px] text-amber-400/90 font-medium">Your spending may exceed ₹{Number(appPromoBudget).toLocaleString("en-IN")}.00 the first few days.</p>
                      </div>
                    </div>

                    {/* Campaign Bid Strategy */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <label className="block text-xs font-bold text-slate-300">Campaign bid strategy</label>
                      <select
                        value={appPromoBidStrategy}
                        onChange={(e) => setAppPromoBidStrategy(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                      >
                        <option value="HIGHEST_VOLUME">Highest volume</option>
                        <option value="COST_PER_RESULT">Cost per result goal</option>
                        <option value="ROAS">ROAS goal</option>
                      </select>
                      <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-1">Show more settings</button>
                    </div>
                  </div>

                  {/* Budget Scheduling & Ad Scheduling */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-200 text-xs">Budget scheduling</h4>
                      <p className="text-[11px] text-slate-400">Increase your budget during specific days or times.</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">None selected</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={appPromoBudgetScheduling} onChange={(e) => setAppPromoBudgetScheduling(e.target.checked)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-200 text-xs">Ad scheduling</h4>
                      <p className="text-[11px] text-slate-400">Run ads all the time</p>
                      <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-1">Edit</button>
                    </div>
                  </div>

                  {/* Campaign Score Card (77/100) */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                            strokeDasharray={`${appPromoScore} ${100 - appPromoScore}`}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-amber-400">{appPromoScore}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-200">Campaign score</p>
                        <p className="text-[11px] text-amber-400 font-semibold mt-0.5">Your campaign has room to improve.</p>
                        <div className="flex items-center justify-between mt-1.5 gap-2">
                          <span className="text-[11px] text-slate-300 font-medium">⚡ Advantage+ app campaign</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">On</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">No additional recommendations available.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        All edits saved
                      </span>
                    </div>
                  </div>

                  {/* GENERIC / OTHER OBJECTIVES SETUP FLOW */}
                  {campObjective !== "OUTCOME_AWARENESS" && campObjective !== "OUTCOME_TRAFFIC" && campObjective !== "OUTCOME_ENGAGEMENT" && campObjective !== "OUTCOME_LEADS" && campObjective !== "OUTCOME_APP_PROMOTION" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Campaign Name"
                          value={campName}
                          onChange={(e: any) => setCampName(e.target.value)}
                          placeholder="e.g. Meta Promo Campaign"
                          required
                        />
                        <Input
                          label={`Daily Budget (${currencySymbol})`}
                          type="number"
                          value={campBudget}
                          onChange={(e: any) => setCampBudget(e.target.value)}
                          min={1}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Buying type</label>
                          <select
                            value={buyingType}
                            onChange={(e: any) => setBuyingType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="AUCTION">Auction</option>
                            <option value="RESERVATION">Reservation</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Special Ad Category</label>
                          <select
                            value={specialAdCategory}
                            onChange={(e: any) => setSpecialAdCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="NONE">None — Standard Commercial Ads</option>
                            <option value="CREDIT">Credit — Loans or credit cards</option>
                            <option value="EMPLOYMENT">Employment — Job offers</option>
                            <option value="HOUSING">Housing — Real estate</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300">Facebook Page</label>
                        {fetchedPages.length > 0 ? (
                          <select
                            value={formPageId}
                            onChange={(e) => setFormPageId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
                          >
                            {fetchedPages.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                📄 {p.name} ({p.id})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            label=""
                            value={formPageId}
                            onChange={(e: any) => setFormPageId(e.target.value)}
                            placeholder="Facebook Page ID"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Ad Set & Target Audience Setup */}
              {campaignStep === 3 && (
                <div className="space-y-4">

                  {/* APP PROMOTION — AD SET SETUP VIEW */}
                  {campObjective === "OUTCOME_APP_PROMOTION" && (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">New App promotion ad set</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Configure target app, device targeting, iOS 14+ optimization, and audience definition.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 3 of 4</span>
                      </div>

                      {/* iOS 14+ Campaign Toggle */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">iOS 14+ campaign</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${appPromoIos14 ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {appPromoIos14 ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Create a campaign to help you reach people using iOS 14.5 and later devices. An iOS 14+ campaign will not deliver to devices using iOS 13.7 or earlier. <button type="button" className="text-sky-400 hover:underline">Learn more</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={appPromoIos14}
                              onChange={(e) => setAppPromoIos14(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* App Selection Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">App</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Select the app that you want people to install and use</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">App Store</label>
                            <select
                              value={appPromoAppStore}
                              onChange={(e) => setAppPromoAppStore(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                            >
                              <option value="GOOGLE_PLAY">🤖 Google Play Store</option>
                              <option value="APPLE_APP_STORE">🍎 Apple App Store</option>
                              <option value="AMAZON_APPSTORE">📦 Amazon Appstore</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select App</label>
                            <select
                              value={appPromoSelectedApp}
                              onChange={(e) => setAppPromoSelectedApp(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                            >
                              <option value="whatsapp_automation_app">📱 WhatsApp Automation Pro (org.jisnu.wa)</option>
                              <option value="jisnu_crm_app">💼 JISNU CRM Mobile (org.jisnu.crm)</option>
                              <option value="custom_app">+ Add new mobile app ID</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Ad Set Name */}
                      <div>
                        <Input
                          label="Ad set name"
                          value={appPromoAdSetName}
                          onChange={(e: any) => setAppPromoAdSetName(e.target.value)}
                          placeholder="New App promotion ad set"
                          required
                        />
                      </div>

                      {/* Performance Goal & Cost per result */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs">Performance goal</h4>
                          <p className="text-[11px] text-slate-400">How you measure success for your ads.</p>
                          <select
                            value={appPromoPerformanceGoal}
                            onChange={(e) => setAppPromoPerformanceGoal(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                          >
                            <option value="MAXIMIZE_INSTALLS">Maximise number of app installs</option>
                            <option value="MAXIMIZE_APP_EVENTS">Maximise number of in-app events</option>
                            <option value="MAXIMIZE_VALUE">Maximise value of in-app purchases</option>
                          </select>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs">Cost per result goal</h4>
                          <p className="text-[11px] text-slate-400">Target cost per install</p>
                          <input
                            type="text"
                            value={appPromoCostPerResult}
                            onChange={(e) => setAppPromoCostPerResult(e.target.value)}
                            placeholder="Optional (e.g. ₹15.00)"
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* A/B Test Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${appPromoAbTest ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {appPromoAbTest ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience. <button type="button" className="text-sky-400 hover:underline font-semibold">About A/B tests</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={appPromoAbTest}
                              onChange={(e) => setAppPromoAbTest(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {/* Expanded A/B Test Options */}
                        {appPromoAbTest && (
                          <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                            {/* What would you like to test */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">What would you like to test?</label>
                              <select
                                value={appPromoTestVariable}
                                onChange={(e) => setAppPromoTestVariable(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                              >
                                <option value="CREATIVE">Creative</option>
                                <option value="AUDIENCE">Audience</option>
                                <option value="PLACEMENT">Placement</option>
                                <option value="CUSTOM">Custom</option>
                              </select>
                            </div>

                            {/* Test duration */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">How long should the test run?</label>
                              <p className="text-[10px] text-slate-400">Your test will run for this many days or until your ad set has ended.</p>
                              <select
                                value={appPromoTestDuration}
                                onChange={(e) => setAppPromoTestDuration(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                              >
                                <option value="3_DAYS">3 days</option>
                                <option value="5_DAYS">5 days</option>
                                <option value="7_DAYS">7 days</option>
                                <option value="14_DAYS">14 days</option>
                                <option value="30_DAYS">30 days</option>
                              </select>
                            </div>

                            {/* Performance comparison metric */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">How do you want to compare performance?</label>
                              <select
                                value={appPromoMetricComparison}
                                onChange={(e) => setAppPromoMetricComparison(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                              >
                                <option value="COST_PER_ADD_PAYMENT_INFO">Cost per add of payment info</option>
                                <option value="COST_PER_INSTALL">Cost per app install</option>
                                <option value="COST_PER_PURCHASE">Cost per purchase</option>
                                <option value="COST_PER_RESULT">Cost per result</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Audience Definition */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Audience definition</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                            Broad
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Your audience is broad. Broad audiences can improve performance for app install campaigns.</p>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold text-slate-300">Estimated audience size:</p>
                            <p className="text-xs font-bold text-sky-400 font-mono">510,000,000 - 640,000,000</p>
                          </div>
                          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            All edits saved
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LEADS NEW CAMPAIGN — AD SET SETUP VIEW */}
                  {campObjective === "OUTCOME_LEADS" && leadsStartMode === "NEW" && (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">New Leads ad set</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Configure conversion location, audience, and performance goals for your leads campaign.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 3 of 4</span>
                      </div>

                      {/* Ad Set Name */}
                      <div>
                        <Input
                          label="Ad set name"
                          value={leadsAdSetName}
                          onChange={(e: any) => setLeadsAdSetName(e.target.value)}
                          placeholder="New Leads ad set"
                          required
                        />
                        <button type="button" className="mt-1 text-[11px] text-sky-400 hover:underline font-semibold">Show more options</button>
                      </div>

                      {/* Conversion Location */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Conversion</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Conversion location</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Choose where you want to generate leads. <button type="button" className="text-sky-400 hover:underline">About conversion locations</button></p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: "INSTANT_FORMS", title: "Instant forms", desc: "Collect leads directly in Facebook or Instagram using pre-filled forms." },
                            { id: "WEBSITE", title: "Website", desc: "Send people to your website to fill out a lead form." },
                            { id: "MESSAGING", title: "Messenger, Instagram, WhatsApp", desc: "Collect leads through messaging apps." },
                            { id: "CALLS", title: "Calls", desc: "Get leads by encouraging people to call your business." },
                            { id: "APP", title: "App", desc: "Collect leads directly in your app." },
                          ].map((loc) => (
                            <div
                              key={loc.id}
                              onClick={() => setLeadsConversionLocation(loc.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${leadsConversionLocation === loc.id
                                  ? "border-sky-500 bg-sky-500/10 text-slate-100"
                                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                }`}
                            >
                              <input
                                type="radio"
                                name="leadsConversionLocation"
                                checked={leadsConversionLocation === loc.id}
                                onChange={() => setLeadsConversionLocation(loc.id)}
                                className="h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 mt-0.5 shrink-0"
                              />
                              <div>
                                <h5 className="font-bold text-xs text-slate-200">{loc.title}</h5>
                                <p className="text-[11px] text-slate-400">{loc.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Facebook Page */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Facebook Page</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Choose the Page that you want to promote.</p>
                        </div>
                        {fetchedPages.length > 0 ? (
                          <select
                            value={formPageId}
                            onChange={(e) => setFormPageId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                          >
                            {fetchedPages.map((p: any) => (
                              <option key={p.id} value={p.id}>📄 {p.name} ({p.id})</option>
                            ))}
                          </select>
                        ) : (
                          <div className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-sky-400 font-bold">
                            📄 JISNU Digital Solutions Pvt.Ltd
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400">
                          You've accepted Meta's Lead Ads Terms for this Page. <button type="button" className="text-sky-400 hover:underline font-semibold">View Terms</button>
                        </p>
                      </div>

                      {/* Performance Goal */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Performance goal</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">How you measure success for your ads. <button type="button" className="text-sky-400 hover:underline">About performance goals</button></p>
                        </div>
                        <select
                          value={leadsPerformanceGoal}
                          onChange={(e) => setLeadsPerformanceGoal(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
                        >
                          <option value="MAXIMIZE_LEADS">Maximise number of leads</option>
                          <option value="MAXIMIZE_CONVERSION_VALUE">Maximise conversion value</option>
                          <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                          <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                        </select>
                      </div>

                      {/* Cost per result goal & Value rules */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs">Cost per result goal</h4>
                          <input
                            type="text"
                            value={leadsCostPerResult}
                            onChange={(e) => setLeadsCostPerResult(e.target.value)}
                            placeholder="None"
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          />
                          <p className="text-[10px] text-slate-500">Leave empty for highest volume bidding.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs">Value rules</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-slate-400">Enabled: {leadsValueRules ? "Yes" : "No"}</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={leadsValueRules}
                                onChange={(e) => setLeadsValueRules(e.target.checked)}
                                className="sr-only peer" />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>
                          <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Show more options</button>
                        </div>
                      </div>

                      {/* Campaign Score */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                                strokeDasharray={`${leadsAdSetScore} ${100 - leadsAdSetScore}`}
                                strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-emerald-400">{leadsAdSetScore}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-200">Campaign score</p>
                            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">You're using our recommended setup.</p>
                            <div className="flex items-center justify-between mt-1.5 gap-2">
                              <span className="text-[11px] text-slate-300 font-medium">⚡ Advantage+ leads campaign</span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">On</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">No additional recommendations available.</p>
                          </div>
                        </div>
                      </div>

                      {/* Audience Definition */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Audience definition</h4>
                        <p className="text-[11px] text-slate-400">Your audience is broad.</p>
                        <p className="text-[11px] text-slate-400">Broad audiences can improve performance and reach more people likely to respond.</p>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span>Narrow</span>
                            <span>Broad</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: "90%" }}></div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <p className="text-[11px] font-bold text-slate-300">Estimated audience size:</p>
                          <p className="text-xs font-bold text-sky-400 font-mono">622,100,000 - 731,900,000</p>
                          <p className="text-[10px] text-slate-500">Estimates don't include Advantage+ audience expansion.</p>
                        </div>
                        <div className="flex items-center justify-end pt-1">
                          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            All edits saved
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MANUAL TRAFFIC CAMPAIGN SETUP VIEW */}
                  {campObjective === "OUTCOME_TRAFFIC" && trafficPresetMode === "manual" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            Manual traffic campaign (Ad Set Setup)
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Configure ad set conversion location, audience controls, and placements.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                          Manual Ad Set
                        </span>
                      </div>

                      {/* Ad Set Name Field */}
                      <div>
                        <Input
                          label="Ad set name"
                          value={adSetName || "New Traffic ad set"}
                          onChange={(e: any) => setAdSetName(e.target.value)}
                          placeholder="New Traffic ad set"
                          required
                        />
                      </div>

                      {/* Conversion Location Selector Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Conversion location</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Choose where you want to drive traffic.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: "WEBSITE", title: "Website", desc: "Send traffic to your website." },
                            { id: "APP", title: "App", desc: "Send traffic to your app." },
                            { id: "MESSAGING", title: "Message destinations", desc: "Send traffic to Messenger, Instagram and WhatsApp." },
                            { id: "INSTAGRAM_FB", title: "Instagram or Facebook", desc: "Send traffic to an Instagram profile, Facebook Page or both." },
                            { id: "CALLS", title: "Calls", desc: "Get people to call your business." },
                          ].map((loc) => (
                            <div
                              key={loc.id}
                              onClick={() => setConversionLocation(loc.id as any)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${conversionLocation === loc.id
                                ? "border-sky-500 bg-sky-500/10 text-slate-100"
                                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                }`}
                            >
                              <input
                                type="radio"
                                name="conversionLocation"
                                checked={conversionLocation === loc.id}
                                onChange={() => setConversionLocation(loc.id as any)}
                                className="h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 mt-0.5"
                              />
                              <div>
                                <h5 className="font-bold text-xs text-slate-200">{loc.title}</h5>
                                <p className="text-[11px] text-slate-400">{loc.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Goal Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-200 text-xs">Performance goal</h4>
                        <p className="text-[11px] text-slate-400">How you measure success for your ads.</p>
                        <select
                          value={performanceGoal}
                          onChange={(e) => setPerformanceGoal(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
                        >
                          <option value="MAXIMIZE_CONVERSATIONS">Maximise number of conversations</option>
                          <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                          <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                        </select>
                      </div>

                      {/* Facebook Page Selection */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-200 text-xs">Facebook Page</h4>
                        <p className="text-[11px] text-slate-400">This Page will represent your business in your ad and conversation.</p>
                        <select
                          value={formPageId}
                          onChange={(e) => setFormPageId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                        >
                          {fetchedPages.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              📄 {p.name} ({p.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message Destinations Mode */}
                      {conversionLocation === "MESSAGING" && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                          <h4 className="font-bold text-slate-200 text-xs">Message destinations</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              onClick={() => setMessageDestinationMode("AUTOMATIC")}
                              className={`p-3 rounded-xl border cursor-pointer ${messageDestinationMode === "AUTOMATIC" ? "border-sky-500 bg-sky-500/10" : "border-slate-800 bg-slate-900"}`}
                            >
                              <p className="text-xs font-bold text-slate-200">Automatic destination (recommended)</p>
                              <p className="text-[10px] text-slate-400 mt-1">Send people to app where they engage most & lower costs.</p>
                            </div>
                            <div
                              onClick={() => setMessageDestinationMode("MANUAL")}
                              className={`p-3 rounded-xl border cursor-pointer ${messageDestinationMode === "MANUAL" ? "border-sky-500 bg-sky-500/10" : "border-slate-800 bg-slate-900"}`}
                            >
                              <p className="text-xs font-bold text-slate-200">Manual destination</p>
                              <p className="text-[10px] text-slate-400 mt-1">Only send people to chosen messaging apps.</p>
                            </div>
                          </div>

                          {/* Connected Messaging Apps Preview */}
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Messenger: {fetchedPages[0]?.name || "JISNU Digital"}</span>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Instagram: @{instagramProfile}</span>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <div className="flex items-center justify-between text-emerald-400 font-bold">
                              <span>WhatsApp: +1 555-174-6047</span>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Policy & Regulatory Requirements (India) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-200 text-xs">Policy and regulatory requirements (India)</h4>
                        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={indiaSecuritiesDeclaration}
                            onChange={(e) => setIndiaSecuritiesDeclaration(e.target.checked)}
                            className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                          />
                          This ad set includes ads related to securities and investments
                        </label>
                      </div>

                      {/* Placements & WhatsApp Status Placement */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Advantage+ placements</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">WhatsApp status included (vertical photos/videos on Updates tab).</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={includeWhatsappStatus}
                              onChange={(e) => setIncludeWhatsappStatus(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* Audience Definition Card (Score 100) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                              100
                            </span>
                            <div>
                              <h4 className="font-bold text-slate-200 text-xs">Campaign score: 100/100</h4>
                              <p className="text-[10px] text-emerald-400 font-semibold">You're using our recommended setup.</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                            Broad Audience
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold text-slate-300">Estimated audience size:</p>
                            <p className="text-xs font-bold text-sky-400 font-mono mt-0.5">622,100,000 - 731,900,000</p>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <Check className="h-3 w-3" /> All edits saved
                          </span>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAILORED WEB TRAFFIC CAMPAIGN SETUP VIEW */}
                  {campObjective === "OUTCOME_TRAFFIC" && trafficPresetMode === "tailored" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            Tailored web traffic campaign
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Quickly create a campaign optimised to help get more web traffic at the best value.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
                          Tailored Setup
                        </span>
                      </div>

                      {/* Campaign Name Field */}
                      <div>
                        <Input
                          label="Name"
                          value={campName || "Tailored web traffic campaign 05/08/2026"}
                          onChange={(e: any) => setCampName(e.target.value)}
                          placeholder="Tailored web traffic campaign 05/08/2026"
                          required
                        />
                      </div>

                      {/* Live Video Ad Toggle */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input
                            type="checkbox"
                            checked={liveVideoAd}
                            onChange={(e) => setLiveVideoAd(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* A/B Test Toggle */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input
                            type="checkbox"
                            checked={abTestEnabled}
                            onChange={(e) => setAbTestEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* Special Ad Categories */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country.
                        </p>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Categories</label>
                          <select
                            value={specialAdCategory}
                            onChange={(e: any) => setSpecialAdCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="NONE">Declare category if applicable — Standard Commercial Ads</option>
                            <option value="CREDIT">Credit — Loans or credit cards</option>
                            <option value="EMPLOYMENT">Employment — Job offers & hiring</option>
                            <option value="HOUSING">Housing — Real estate listings</option>
                            <option value="ISSUES_ELECTIONS_POLITICS">Issues & Politics — Social causes</option>
                          </select>
                        </div>
                      </div>

                      {/* Ad Setup & Creative Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-200 text-xs">Ad setup & Creative</h4>
                        <p className="text-[11px] text-slate-400">Select and optimise your ad text, media and enhancements.</p>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <Input
                            label="Headline"
                            value={campHeadline}
                            onChange={(e: any) => setCampHeadline(e.target.value)}
                            placeholder="Visit Our Website for Exclusive Offers!"
                          />
                          <Input
                            label="Website Target URL"
                            value={campMediaUrl}
                            onChange={(e: any) => setCampMediaUrl(e.target.value)}
                            placeholder="https://jisnudigital.com"
                          />
                        </div>
                      </div>

                      {/* Creative Testing Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Creative testing</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-md leading-relaxed">
                            Compare up to 7 different versions of your creative in a test that helps ensure delivery to new test ads.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={creativeTesting}
                            onChange={(e) => setCreativeTesting(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* Tracking Section (Website Events & Pixel) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Tracking</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Choose conversion events to track. This ad account's selected conversion dataset will be tracked by default.
                          </p>
                        </div>

                        {/* Pixel Info Card */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-300">Website events:</span>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Active Dataset
                            </span>
                          </div>
                          <p className="text-xs font-bold text-sky-400">{pixelWebsiteEvents}</p>
                          <p className="text-[11px] font-mono text-slate-400">Pixel ID: {pixelId}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                            <span>App events</span>
                            <span className="text-[10px] text-slate-500">Not configured</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                            <span>Offline events</span>
                            <button type="button" className="text-[10px] text-sky-400 hover:underline font-semibold">Edit offline sets</button>
                          </div>
                        </div>

                        {/* URL Parameters */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">URL parameters</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={urlParameters}
                              onChange={(e) => setUrlParameters(e.target.value)}
                              placeholder="key1=value1&key2=value2"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                            />
                            <button
                              type="button"
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 shrink-0"
                            >
                              Build a URL parameter
                            </button>
                          </div>
                        </div>

                        {/* Third-party reporting info */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                          <span className="font-bold text-slate-300">Third-party reporting:</span> Meta purchases may not be included in your Google reporting. Connect your account to measure actions on ads that send people to your website or shop.
                        </div>
                      </div>

                      {/* Ad Preview Notification */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Ad preview</h4>
                          <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            1 Placement warning
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Your ad won't deliver to 1 placement. You can now see more variations of your ad in previews.
                        </p>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                            <span className="text-sky-400">@{instagramProfile}</span>
                            <span className="text-[10px] text-slate-500">Ad Preview</span>
                          </div>
                          <span className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs">
                            Learn more
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 italic">
                          Reveal details over time • Ad rendering and interaction may vary based on device, format and other factors.
                        </p>
                      </div>

                      {/* Legal Terms & Campaign Score */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <p className="text-[11px] text-slate-400">
                          By clicking <span className="font-bold text-slate-200">Publish</span>, you acknowledge that your use of Meta's ad tools is subject to our Terms and Conditions.
                        </p>
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                          <Check className="h-3 w-3" /> All edits saved
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ENGAGEMENT TAILORED MESSAGES — AD SET SETUP VIEW */}
                  {campObjective === "OUTCOME_ENGAGEMENT" && engagementPresetMode === "tailored" && (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">Tailored messages campaign</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Quickly create a campaign optimised to help get more messages at the best value.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 3 of 4</span>
                      </div>

                      {/* Policy and Regulatory Requirements (India) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">!</span>
                              Policy and regulatory requirements (India)
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1">Provide required information about your ads, yourself or your organisation.</p>
                          </div>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={engPolicyDeclaration}
                            onChange={(e) => setEngPolicyDeclaration(e.target.checked)}
                            className="mt-0.5 accent-sky-500 w-4 h-4 shrink-0"
                          />
                          <span className="text-xs text-slate-300 leading-relaxed">
                            This ad set includes ads related to <span className="font-bold text-amber-400">securities and investments</span>
                          </span>
                        </label>
                        <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">
                          About verification requirements
                        </button>
                      </div>

                      {/* Placements — Advantage+ */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Placements</h4>
                        <div
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${engAdvantagesPlus
                              ? "bg-sky-500/10 border-sky-500/40"
                              : "bg-slate-900 border-slate-700"
                            }`}
                          onClick={() => setEngAdvantagesPlus(!engAdvantagesPlus)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✔</span>
                                Advantage+
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${engAdvantagesPlus ? "bg-sky-500/20 text-sky-400" : "bg-slate-700 text-slate-400"
                                  }`}>
                                  {engAdvantagesPlus ? "on" : "off"}
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                We'll automatically show ads in the places where people are likely to respond.
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                              <input
                                type="checkbox"
                                checked={engAdvantagesPlus}
                                onChange={(e) => setEngAdvantagesPlus(e.target.checked)}
                                className="sr-only peer"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>
                        </div>
                        <p className="text-[11px] text-sky-400/70 hover:underline cursor-pointer">About placements</p>
                      </div>

                      {/* Value Rules */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                          <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                            <span>⚠</span> Value rule creation is changing
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            You can now add rules closer to where you select your ad set's placements.
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-300">Placement value rules</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Prioritise the placements that matter most to your business by adjusting bids for them.
                            <button type="button" className="ml-1 text-sky-400 hover:underline">About value rules</button>
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-300">Value rules</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Tell us how much more certain audiences, conversion locations and placements are worth to your business. Our system will optimise for outcomes based on these rules.
                            <button type="button" className="ml-1 text-sky-400 hover:underline">About value rules</button>
                          </p>
                        </div>
                      </div>

                      {/* Account Controls */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Account controls</h4>
                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                          <span className="text-[11px] text-slate-400">Excluded placements:</span>
                          <span className="text-[11px] font-bold text-slate-200">{engExcludedPlacements}</span>
                        </div>
                        <button
                          type="button"
                          className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          Show more settings
                        </button>
                      </div>

                      {/* Brand Safety & Suitability */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between"
                          onClick={() => setEngBrandSafetyExpanded(!engBrandSafetyExpanded)}
                        >
                          <h4 className="font-bold text-slate-200 text-xs">Brand safety and suitability</h4>
                          <span className="text-slate-400 text-xs">{engBrandSafetyExpanded ? "▲" : "▼"}</span>
                        </button>

                        {engBrandSafetyExpanded && (
                          <div className="space-y-3 pt-1">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                              <p className="text-[11px] font-bold text-slate-300">Brand safety</p>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Meta applies brand safety to all ads through our Community Standards and Monetisation Policies, keeping your ads away from objectionable content.
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                              <p className="text-[11px] font-bold text-slate-300">Brand suitability</p>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                In some cases, brands want more control over where ads can appear. Brand suitability filters or excludes specific topics or publishers. Bear in mind that using these controls can lower your reach and increase costs.
                              </p>
                            </div>
                          </div>
                        )}

                        {!engBrandSafetyExpanded && (
                          <p className="text-[11px] text-slate-500 italic">Brand safety: Meta applies brand safety to all ads through our Community Standards and Monetisation Policies...</p>
                        )}

                        <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">
                          Show more options
                        </button>
                      </div>

                      {/* Audience Definition */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <h4 className="font-bold text-slate-200 text-xs">Audience definition</h4>

                        <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 text-[11px] text-sky-300 leading-relaxed">
                          <span className="font-bold">Your audience is broad.</span>
                          <br />
                          Broad audiences can improve performance and reach more people likely to respond.
                        </div>

                        {/* Narrow ←→ Broad Slider */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>Narrow</span>
                            <span>Broad</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={engAudienceBreadth}
                            onChange={(e) => setEngAudienceBreadth(Number(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                          />
                          <div className="flex justify-end">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${engAudienceBreadth >= 70 ? "text-sky-400 bg-sky-500/10" : "text-amber-400 bg-amber-500/10"
                              }`}>
                              {engAudienceBreadth >= 70 ? "Broad" : engAudienceBreadth >= 40 ? "Moderate" : "Narrow"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEngShowAudienceSize(!engShowAudienceSize)}
                          className="text-[11px] text-sky-400 hover:underline font-semibold"
                        >
                          {engShowAudienceSize ? "Hide" : "Show"} estimated audience size
                        </button>

                        {engShowAudienceSize && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">Estimated reach</span>
                              <span className="text-xs font-bold text-emerald-400">2.5M – 7.3M people</span>
                            </div>
                            <div className="mt-2 w-full bg-slate-800 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${engAudienceBreadth}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* All edits saved */}
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            All edits saved
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MANUAL ENGAGEMENT CAMPAIGN — BUDGET & CAMPAIGN SETUP VIEW */}
                  {campObjective === "OUTCOME_ENGAGEMENT" && engagementPresetMode === "manual" && (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">Manual engagement campaign</h3>
                          <p className="text-xs text-slate-400 mt-0.5">New Engagement campaign · 1 Ad set · 1 Ad · In draft</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 3 of 4</span>
                      </div>

                      {/* Advantage+ Toggle */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${engManualAdvantagesPlus ? "bg-sky-500/10 border-sky-500/40" : "bg-slate-900 border-slate-700"
                            }`}
                          onClick={() => setEngManualAdvantagesPlus(!engManualAdvantagesPlus)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✔</span>
                              Advantage+
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${engManualAdvantagesPlus ? "bg-sky-500/20 text-sky-400" : "bg-slate-700 text-slate-400"
                                }`}>
                                {engManualAdvantagesPlus ? "on" : "off"}
                              </span>
                            </p>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                              <input type="checkbox" checked={engManualAdvantagesPlus}
                                onChange={(e) => setEngManualAdvantagesPlus(e.target.checked)}
                                className="sr-only peer" onClick={(e) => e.stopPropagation()} />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Budget Strategy */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Budget strategy</h4>

                        {/* Campaign Budget vs Ad Set Budget */}
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: "CAMPAIGN", title: "Campaign budget", desc: "Automatically distribute your budget to the best opportunities across your campaign. Also known as Advantage+ campaign budget." },
                            { id: "ADSET", title: "Ad set budget", desc: "Set different bid strategies or budget schedules for each ad set." },
                          ].map((opt) => (
                            <div
                              key={opt.id}
                              onClick={() => setEngManualBudgetStrategy(opt.id as "CAMPAIGN" | "ADSET")}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${engManualBudgetStrategy === opt.id
                                  ? "bg-sky-500/10 border-sky-500/40"
                                  : "bg-slate-900 border-slate-800 hover:border-slate-600"
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <input type="radio" name="engManualBudgetStrategy"
                                  checked={engManualBudgetStrategy === opt.id}
                                  onChange={() => setEngManualBudgetStrategy(opt.id as "CAMPAIGN" | "ADSET")}
                                  className="mt-0.5 accent-sky-500 shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-slate-100">{opt.title}</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}
                                    <button type="button" className="ml-1 text-sky-400 hover:underline">About campaign budget</button>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Budget Mode + Amount */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-400">Budget</label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={engManualBudgetMode}
                              onChange={(e) => setEngManualBudgetMode(e.target.value as "DAILY" | "LIFETIME")}
                              className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                            >
                              <option value="DAILY">Daily budget</option>
                              <option value="LIFETIME">Lifetime budget</option>
                            </select>
                            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2">
                              <span className="text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                value={engManualBudget}
                                onChange={(e) => setEngManualBudget(e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-100 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-slate-500">INR</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                            You'll spend an average of <span className="font-bold text-slate-200">₹{Number(engManualBudget).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> per day.
                            Your maximum daily spend is <span className="font-bold text-slate-200">₹{(Number(engManualBudget) * 1.75).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> and
                            your maximum weekly spend is <span className="font-bold text-slate-200">₹{(Number(engManualBudget) * 7).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>.
                            <button type="button" className="ml-1 text-sky-400 hover:underline">About daily budget</button>
                          </div>
                          <p className="text-[11px] text-amber-400/80">⚠ Your spending may exceed ₹{Number(engManualBudget).toLocaleString("en-IN")} the first few days.</p>
                        </div>

                        {/* Campaign Bid Strategy */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-400">Campaign bid strategy</label>
                            <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Edit</button>
                          </div>
                          <select
                            value={engManualBidStrategy}
                            onChange={(e) => setEngManualBidStrategy(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="HIGHEST_VOLUME">Highest volume</option>
                            <option value="COST_CAP">Cost per result goal</option>
                            <option value="BID_CAP">Bid cap</option>
                          </select>
                        </div>

                        <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">
                          Show more settings
                        </button>
                      </div>

                      {/* Budget Scheduling */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Budget scheduling</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Increase your budget during specific days or times.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input type="checkbox" checked={engManualBudgetScheduling}
                              onChange={(e) => setEngManualBudgetScheduling(e.target.checked)}
                              className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>
                        {engManualBudgetScheduling && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                            + Schedule budget increases
                          </div>
                        )}
                      </div>

                      {/* Ad Scheduling */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Ad scheduling</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Run ads all the time</p>
                          </div>
                          <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Edit</button>
                        </div>
                      </div>

                      {/* Campaign Frequency Control */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {engManualFrequencyControl ? "Frequency cap enabled" : "Off"}. Set a frequency if you have a specific number of times that you want people to see your ads.
                            <button type="button" className="ml-1 text-sky-400 hover:underline">Learn more</button>
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input type="checkbox" checked={engManualFrequencyControl}
                            onChange={(e) => setEngManualFrequencyControl(e.target.checked)}
                            className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* A/B Test */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {engManualAbTest ? "Enabled" : "Off"}. Help improve ad performance by comparing versions to see what works best.
                            <button type="button" className="ml-1 text-sky-400 hover:underline">About A/B tests</button>
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input type="checkbox" checked={engManualAbTest}
                            onChange={(e) => setEngManualAbTest(e.target.checked)}
                            className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* Special Ad Categories */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country.
                            <button type="button" className="ml-1 text-sky-400 hover:underline">About Special Ad Categories</button>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">Categories</label>
                          <select
                            value={engManualSpecialCategory}
                            onChange={(e) => setEngManualSpecialCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="NONE">Declare category if applicable</option>
                            <option value="FINANCIAL">Financial products and services</option>
                            <option value="EMPLOYMENT">Employment</option>
                            <option value="HOUSING">Housing</option>
                            <option value="SOCIAL_ISSUES">Social issues, elections or politics</option>
                          </select>
                        </div>
                      </div>

                      {/* Campaign Score */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-4">
                          {/* Score Ring */}
                          <div className="relative w-16 h-16 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                                strokeDasharray={`${engManualCampaignScore} ${100 - engManualCampaignScore}`}
                                strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-amber-400">
                              {engManualCampaignScore}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">Campaign score</p>
                            <p className="text-[11px] text-amber-400 font-semibold mt-0.5">Your campaign has room to improve.</p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              You can lower costs by <span className="font-bold text-emerald-400">9%</span> by selecting more destinations
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <span className="flex items-center gap-1.5 text-[11px] text-sky-400 font-bold">
                            <span className="text-emerald-400">+26 points</span>
                            <span className="text-slate-500">available</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            All edits saved
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STANDARD AWARENESS / MANUAL TRAFFIC AD SET VIEW */}
                  {campObjective !== "OUTCOME_TRAFFIC" && campObjective !== "OUTCOME_ENGAGEMENT" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">Step 3: Ad Set & Audience Setup</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Configure performance goals, frequency caps, promoted page, and audience definition.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
                          Step 3 of 4
                        </span>
                      </div>

                      {/* Ad Set Name Input */}
                      <div>
                        <Input
                          label="Ad Set Name"
                          value={adSetName || "New Awareness ad set"}
                          onChange={(e: any) => setAdSetName(e.target.value)}
                          placeholder="New Awareness ad set"
                          required
                        />
                      </div>

                      {/* Performance Goal Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Performance goal</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">How you measure success for your ads.</p>
                        </div>
                        <select
                          value={performanceGoal}
                          onChange={(e) => setPerformanceGoal(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
                        >
                          <option value="MAXIMIZE_REACH">Maximise reach of ads</option>
                          <option value="MAXIMIZE_IMPRESSIONS">Maximise number of impressions</option>
                          <option value="MAXIMIZE_AD_RECALL">Maximise ad recall lift</option>
                          <option value="MAXIMIZE_THRUPLAY">Maximise ThruPlay video views</option>
                        </select>
                        <p className="text-[10px] text-slate-500 italic">
                          To help us improve delivery, we may survey a small section of your audience.
                        </p>
                      </div>

                      {/* Facebook Page Selection Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Facebook Page</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Choose the Page that you want to promote.</p>
                        </div>
                        {fetchedPages.length > 0 ? (
                          <select
                            value={formPageId}
                            onChange={(e) => setFormPageId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                          >
                            {fetchedPages.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                📄 {p.name} ({p.id})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            label=""
                            value={formPageId || "JISNU Digital Solutions Pvt.Ltd"}
                            onChange={(e: any) => setFormPageId(e.target.value)}
                            placeholder="JISNU Digital Solutions Pvt.Ltd"
                          />
                        )}
                      </div>

                      {/* Cost per result goal & Frequency control */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs">Cost per result goal</h4>
                          <p className="text-[11px] text-slate-400">Bid (CPM cap)</p>
                          <input
                            type="text"
                            value={costPerResultGoal}
                            onChange={(e) => setCostPerResultGoal(e.target.value)}
                            placeholder="X.XXX"
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                          />
                          <p className="text-[10px] text-slate-500 leading-tight">
                            Meta will aim to spend your entire budget and get the most 1,000 impressions using the highest-volume bid strategy.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-200 text-xs">Frequency control</h4>
                          <p className="text-[10px] text-slate-400">Cap maximum impressions per person.</p>
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="number"
                              value={frequencyCapTimes}
                              onChange={(e) => setFrequencyCapTimes(Number(e.target.value))}
                              min={1}
                              className="w-14 bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1 text-center text-xs text-slate-100 font-bold"
                            />
                            <span className="text-xs text-slate-400">times every</span>
                            <input
                              type="number"
                              value={frequencyCapDays}
                              onChange={(e) => setFrequencyCapDays(Number(e.target.value))}
                              min={1}
                              className="w-14 bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1 text-center text-xs text-slate-100 font-bold"
                            />
                            <span className="text-xs text-slate-400">days</span>
                          </div>
                          <p className="text-[10px] text-sky-400 font-medium pt-1">
                            As a maximum, we'll aim to stay under {frequencyCapTimes} impressions every {frequencyCapDays} days.
                          </p>
                        </div>
                      </div>

                      {/* Value rules & Delivery Type */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <h4 className="font-bold text-slate-200 text-xs">Value rules</h4>
                          <p className="text-[11px] text-slate-400">
                            Tell us how much more certain audiences, conversion locations and placements are worth.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <h4 className="font-bold text-slate-200 text-xs">Delivery type</h4>
                          <select
                            value={deliveryType}
                            onChange={(e) => setDeliveryType(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          >
                            <option value="STANDARD">Standard — Even pace throughout schedule</option>
                            <option value="ACCELERATED">Accelerated — Deliver as quickly as possible</option>
                          </select>
                        </div>
                      </div>

                      {/* Audience Definition Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Audience definition</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                            Broad
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Your audience is broad. Broad audiences can improve performance and reach more people likely to respond.
                        </p>

                        {/* Visual Meter Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>Specific</span>
                            <span className="text-emerald-400">Broad</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                            <div className="w-1/3 bg-amber-500/30"></div>
                            <div className="w-2/3 bg-gradient-to-r from-emerald-500 to-sky-500"></div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold text-slate-300">Estimated audience size:</p>
                            <p className="text-xs font-bold text-sky-400 font-mono mt-0.5">621,400,000 - 731,100,000</p>
                          </div>
                          <span className="text-[10px] text-slate-500 text-right max-w-[200px] leading-tight">
                            Advantage+ detailed targeting enabled
                          </span>
                        </div>
                      </div>

                      {/* Campaign Score & Edits Saved */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                            66
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Campaign score</h4>
                            <p className="text-[11px] text-slate-400">Your campaign has room to improve. No additional recommendations available.</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <Check className="h-3 w-3" /> All edits saved
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

                  {/* STEP 4: Ad Setup & Creative Preview */}
                  {campaignStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">
                            {campObjective === "OUTCOME_TRAFFIC"
                              ? "New Traffic ad"
                              : campObjective === "OUTCOME_ENGAGEMENT" && engagementPresetMode === "manual"
                                ? "New Engagement ad"
                                : campObjective === "OUTCOME_ENGAGEMENT"
                                  ? "Tailored messages campaign — Ad"
                                  : campObjective === "OUTCOME_LEADS" && leadsStartMode === "NEW"
                                    ? "New Leads ad"
                                    : "Step 4: Ad Creative, Identity & Live Preview"}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Select your business profiles, upload media, setup CTA, and preview live ad rendering.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
                          Step 4 of 4
                        </span>
                      </div>

                      {/* Ad Name Input */}
                      <div>
                        <Input
                          label="Ad Name"
                          value={adName}
                          onChange={(e: any) => setAdName(e.target.value)}
                          placeholder={campObjective === "OUTCOME_TRAFFIC" ? "New Traffic ad" : campObjective === "OUTCOME_ENGAGEMENT" ? "New Engagement ad" : campObjective === "OUTCOME_LEADS" ? "New Leads ad" : "New Awareness ad"}
                          required
                        />
                      </div>

                      {/* Partnership Ad Toggle & Setup Options */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Partnership ad</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${partnershipAd ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {partnershipAd ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              Run ads with creators, brands and other businesses to improve campaign performance.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">
                                Go to Partnership Ads Hub to view creator content
                              </button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={partnershipAd}
                              onChange={(e) => setPartnershipAd(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {/* Partnership Options (When Turned On) */}
                        {partnershipAd && (
                          <div className="pt-3 border-t border-slate-800/80 space-y-2.5 animate-fadeIn">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                              <span>Choose how to create your ad</span>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[9px] font-bold cursor-help" title="Select partnership creation method">i</span>
                            </div>

                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => setShowPartnershipCodeModal(true)}
                                className="w-full py-2.5 px-4 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
                              >
                                Enter ad code or post info
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowSelectPartnershipModal(true)}
                                className="w-full py-2.5 px-4 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
                              >
                                Select partnership
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Identity Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Identity</h4>
                        <p className="text-[11px] text-slate-400">The profiles that will be used in your ad.</p>

                        {/* Facebook Page */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">Facebook Page <span className="text-red-400">*</span></label>
                          {fetchedPages.length > 0 ? (
                            <select
                              value={formPageId}
                              onChange={(e) => setFormPageId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                            >
                              {fetchedPages.map((p: any) => (
                                <option key={p.id} value={p.id}>📄 {p.name}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs font-bold text-sky-400">
                              📄 JISNU Digital Solutions Pvt.Ltd
                            </div>
                          )}
                          <p className="text-[10px] text-slate-500">
                            {campObjective === "OUTCOME_ENGAGEMENT" && engagementPresetMode === "manual"
                              ? `Any messages started from your ad will go to ${fetchedPages[0]?.name || "JISNU Digital Solutions Pvt.Ltd"}.`
                              : campObjective === "OUTCOME_LEADS" && leadsStartMode === "NEW"
                                ? `Any form submitted from your ad will go to ${fetchedPages[0]?.name || "JISNU Digital Solutions Pvt.Ltd"}.`
                                : "To use a different Facebook Page, edit your selection for your ad set."}
                          </p>
                        </div>

                        {/* Instagram Profile */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">Instagram profile</label>
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs font-bold text-sky-400">
                            @{instagramProfile}
                          </div>
                        </div>

                        {/* WhatsApp Phone Number — hide for Manual Engagement */}
                        {!(campObjective === "OUTCOME_ENGAGEMENT" && engagementPresetMode === "manual") && (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">WhatsApp phone number</label>
                            <input
                              type="text"
                              value={campWhatsappNum || "Test Number 15551746047"}
                              onChange={(e) => setCampWhatsappNum(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
                              placeholder="Test Number 15551746047"
                            />
                          </div>
                        )}
                      </div>

                      {/* Ad Creative Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Ad setup</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Select and optimise your ad text, media and enhancements.</p>
                        </div>

                        {/* Manual Engagement / New Leads: Select existing post OR Create ad toggle */}
                        {((campObjective === "OUTCOME_ENGAGEMENT" && engagementPresetMode === "manual") || (campObjective === "OUTCOME_LEADS" && leadsStartMode === "NEW")) && (
                          <div className="space-y-2">
                            <p className="text-[11px] text-slate-400">Select an existing post or create a new one</p>
                            <div className="grid grid-cols-2 gap-2">
                              {(["EXISTING", "CREATE"] as const).map((mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => campObjective === "OUTCOME_LEADS" ? setLeadsAdSetupMode(mode) : setEngManualAdSetupMode(mode)}
                                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${(campObjective === "OUTCOME_LEADS" ? leadsAdSetupMode : engManualAdSetupMode) === mode
                                      ? "bg-sky-500/10 border-sky-500/50 text-sky-400"
                                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                                    }`}
                                >
                                  {mode === "EXISTING" ? "Use existing post" : "Create ad"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Ad creative</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Select and optimise your ad text, media and enhancements.</p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-400 font-semibold">
                          ⚠ Please specify the media to run with this ad.
                        </div>

                        <Input
                          label="Headline"
                          value={campHeadline}
                          onChange={(e: any) => setCampHeadline(e.target.value)}
                          placeholder="Chat with us on WhatsApp for 20% OFF!"
                        />
                        <Textarea
                          label="Primary Body Text"
                          value={campBody}
                          onChange={(e: any) => setCampBody(e.target.value)}
                          placeholder="Hi! Please let us know how we can help you."
                          rows={2}
                        />

                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-400">Ad Image/Media URL</label>
                          <button
                            type="button"
                            onClick={fetchMediaAssets}
                            className="text-[10px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            {fetchingMedia ? <Loader2 className="h-3 w-3 animate-spin" /> : <Layers className="h-3 w-3" />}
                            Fetch Meta Media Library
                          </button>
                        </div>
                        <Input
                          value={campMediaUrl}
                          onChange={(e: any) => setCampMediaUrl(e.target.value)}
                          placeholder="https://example.com/banner.jpg"
                        />

                        {/* Live Media Picker */}
                        {(mediaAssets.images.length > 0 || mediaAssets.videos.length > 0) && (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-200">Select from Live Meta Library:</p>
                            <div className="flex gap-2 overflow-x-auto pb-1 max-h-24">
                              {mediaAssets.images.map((img: any) => (
                                <img
                                  key={img.id}
                                  src={img.url}
                                  alt="media"
                                  onClick={() => setCampMediaUrl(img.url)}
                                  className={`h-20 w-28 object-cover rounded-lg cursor-pointer border-2 shrink-0 ${campMediaUrl === img.url ? "border-sky-500" : "border-transparent"}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Destination & Instant Form Section (Leads Objective Only) */}
                      {campObjective === "OUTCOME_LEADS" && leadsStartMode === "NEW" && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Destination</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Tell us where to send people immediately after they tap or click your ad. <button type="button" className="text-sky-400 hover:underline">Learn more</button>
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-bold text-xs text-slate-200">Instant form</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Make connections with people by letting them send contact information and other details to you through a form. <button type="button" className="text-sky-400 hover:underline">Learn more</button>
                                </p>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">Selected</span>
                            </div>

                            {/* Search & Tabs */}
                            <div className="space-y-2 pt-1 border-t border-slate-800">
                              <p className="text-[11px] font-bold text-slate-300">Choose or create an instant form for your leads campaign</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Search your forms"
                                  className="flex-1 bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                                />
                                <button type="button" className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700">
                                  Search
                                </button>
                              </div>

                              <div className="flex gap-2 pt-1 border-b border-slate-800">
                                {(["ACTIVE", "ARCHIVED"] as const).map((tab) => (
                                  <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setLeadsFormTab(tab)}
                                    className={`pb-2 text-xs font-bold border-b-2 transition-all ${leadsFormTab === tab
                                        ? "border-sky-400 text-sky-400"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                      }`}
                                  >
                                    {tab === "ACTIVE" ? "Active" : "Archived"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Form Testing */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-xs text-slate-200">Form testing</h5>
                              <p className="text-[11px] text-slate-400 mt-0.5">Compare up to five forms to see which one performs best.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                              <input type="checkbox" checked={leadsFormTesting} onChange={(e) => setLeadsFormTesting(e.target.checked)} className="sr-only peer" />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>

                          {/* Quality Filters */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <h5 className="font-bold text-xs text-slate-200">Quality filters</h5>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-slate-300">Require work email address</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Leads must verify using an active email address associated with a real organisation. <button type="button" className="text-sky-400 hover:underline">Learn more</button>
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                <input type="checkbox" checked={leadsRequireWorkEmail} onChange={(e) => setLeadsRequireWorkEmail(e.target.checked)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>
                          </div>

                          {/* Instant Form Lead Nurturing */}
                          <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/60 to-purple-950/40 border border-sky-800/40 space-y-1">
                            <h5 className="font-bold text-xs text-sky-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                              Instant form lead nurturing
                            </h5>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              Reach leads where they're most active with tailored post-submission follow-ups through Meta's exclusive channels.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Conversations / Chat Template (Traffic & Tailored Engagement only) */}
                      {(campObjective === "OUTCOME_TRAFFIC" || (campObjective === "OUTCOME_ENGAGEMENT" && engagementPresetMode === "tailored")) && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Conversations</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {campObjective === "OUTCOME_ENGAGEMENT"
                                ? "Create the messaging experience people see after they've tapped on your ad."
                                : "Choose a template for beginning the chat after people tap on your ad."}
                              {" "}<button type="button" className="text-sky-400 hover:underline">Learn more</button>
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Suggested chat template</span>

                            {/* Greeting */}
                            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1.5">
                              <p className="text-[11px] font-bold text-slate-300">Greeting</p>
                              <Textarea
                                label=""
                                value={campBody || "Hi, Amol! Please let us know how we can help you."}
                                onChange={(e: any) => setCampBody(e.target.value)}
                                rows={2}
                                placeholder="Hi! Please let us know how we can help you."
                              />
                            </div>

                            {/* Questions & Responses */}
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-bold text-slate-300">Questions and responses</p>
                              {[
                                "Can I learn more about your business?",
                                "Can you tell me more about your ad?",
                                "Is anyone available to chat?",
                              ].map((q, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                                  <span>{q}</span>
                                  <Check className="h-3 w-3 text-sky-400 shrink-0" />
                                </div>
                              ))}
                              <button
                                type="button"
                                className="text-[11px] text-sky-400 hover:underline font-semibold pt-1"
                              >
                                + Add responses
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tracking Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Tracking</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Choose conversion events to track. This ad account's selected conversion dataset will be tracked by default.</p>
                        </div>

                        {/* Pixel Info */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-300">Website events:</span>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active Dataset</span>
                          </div>
                          <p className="text-xs font-bold text-sky-400">{pixelWebsiteEvents}</p>
                          <p className="text-[11px] font-mono text-slate-400">Pixel ID: {pixelId}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                            <span>App events</span>
                            <span className="text-[10px] text-slate-500">Not configured</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                            <span>Offline events</span>
                            <button type="button" className="text-[10px] text-sky-400 hover:underline font-semibold">Edit offline sets</button>
                          </div>
                        </div>

                        {/* URL Parameters */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">URL parameters</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={urlParameters}
                              onChange={(e) => setUrlParameters(e.target.value)}
                              placeholder="key1=value1&key2=value2"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                            />
                            <button type="button" className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 shrink-0">
                              Build a URL parameter
                            </button>
                          </div>
                        </div>

                        {/* Third-party reporting */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                          <span className="font-bold text-slate-300">Third-party reporting:</span> Meta purchases may not be included in your Google reporting. Connect your account to measure actions on ads that send people to your website or shop.
                        </div>
                      </div>

                      {/* Campaign Score 100 + Ad Preview */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                              {campObjective === "OUTCOME_TRAFFIC" || campObjective === "OUTCOME_ENGAGEMENT" ? "100" : "66"}
                            </span>
                            <div>
                              <h4 className="font-bold text-slate-200 text-xs">Campaign score: {campObjective === "OUTCOME_TRAFFIC" || campObjective === "OUTCOME_ENGAGEMENT" ? "100" : "66"}/100</h4>
                              <p className="text-[10px] text-emerald-400 font-semibold">You're using our recommended setup.</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Ad Preview
                          </span>
                        </div>

                        {/* Live Ad Preview Card */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 max-w-sm mx-auto shadow-xl">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">J</div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{fetchedPages[0]?.name || "JISNU Digital Solutions Pvt.Ltd"}</p>
                              <p className="text-[10px] text-slate-400">Sponsored • @{instagramProfile}</p>
                            </div>
                            {campObjective === "OUTCOME_ENGAGEMENT" && (
                              <div className="ml-auto flex flex-col items-end text-right">
                                <span className="text-[10px] text-slate-500">Ad</span>
                                <span className="text-[10px] font-bold text-sky-400">Destination</span>
                              </div>
                            )}
                          </div>

                          {campMediaUrl ? (
                            <div className="w-full h-36 rounded-xl overflow-hidden bg-black">
                              <img src={campMediaUrl} alt="Ad banner" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full h-28 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                              Ad Media Banner Preview
                            </div>
                          )}

                          <div className="space-y-1">
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                              {campBody || "Hi! Please let us know how we can help you."}
                            </p>
                            {(campObjective === "OUTCOME_TRAFFIC" || campObjective === "OUTCOME_ENGAGEMENT") && (
                              <p className="text-[11px] text-slate-400 italic">
                                Can I learn more about your business? / Is anyone available to chat?
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-500">
                                {campObjective === "OUTCOME_TRAFFIC" ? "WHATSAPP MESSAGE" : "LEARN MORE"}
                              </p>
                              <p className="text-xs font-bold text-slate-100">{campHeadline || "Chat with us on WhatsApp"}</p>
                            </div>
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] shadow-sm">
                              {campObjective === "OUTCOME_TRAFFIC" || campObjective === "OUTCOME_ENGAGEMENT" ? "Send message" : "Learn more"}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 italic text-center">
                          Reveal details over time • Ad rendering and interaction may vary based on device, format and other factors.
                        </p>
                      </div>

                      {/* Legal Terms */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <p className="text-[11px] text-slate-400">
                          By clicking <span className="font-bold text-slate-200">Publish Campaign Live</span>, you acknowledge that your use of Meta's ad tools is subject to our Terms and Conditions.
                        </p>
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                          <Check className="h-3 w-3" /> All edits saved
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              )}


            {/* Modal Footer — Stepper Navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-900 shrink-0">
                <a
                  href="https://www.facebook.com/business/help/1438417719785200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                >
                  About campaign objectives <ArrowUpRight className="h-3 w-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (campaignStep > 1) {
                        setCampaignStep((prev) => prev - 1);
                      } else {
                        setShowCreateModal(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
                  >
                    {campaignStep > 1 ? "Back" : "Cancel"}
                  </button>

                  {campaignStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCampaignStep((prev) => prev + 1)}
                      className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateCampaign}
                      disabled={creatingCamp}
                      className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {creatingCamp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      Publish Campaign Live
                    </button>
                  )}
                </div>
              </div>

          </div>
        </div>
      )}
          {/* CREATE AD SET MODAL */}
          {showCreateAdSetModal && (
            <Modal title="Configure Meta Ad Set (Budget, Targeting & Destination)" onClose={() => setShowCreateAdSetModal(false)} wide>
              <form onSubmit={handleCreateAdSet} className="space-y-4">
                <Select label="Parent Campaign" value={adSetCampId} onChange={(e: any) => setAdSetCampId(e.target.value)}>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.objective})
                    </option>
                  ))}
                </Select>

                <Input label="Ad Set Name" value={adSetName} onChange={(e: any) => setAdSetName(e.target.value)} placeholder="e.g. Wakad & Baner Real Estate Buyers (18-45)" required />

                <div className="grid grid-cols-2 gap-3">
                  <Select label="Destination Type" value={adSetDestination} onChange={(e: any) => setAdSetDestination(e.target.value)}>
                    <option value="WHATSAPP">Click-to-WhatsApp (WhatsApp Direct)</option>
                    <option value="MESSENGER">Facebook Messenger</option>
                    <option value="INSTAGRAM_DIRECT">Instagram Direct Message</option>
                    <option value="WEBSITE">Website Conversion Landing Page</option>
                  </Select>

                  <Select label="Optimization Goal" value={adSetOptimization} onChange={(e: any) => setAdSetOptimization(e.target.value)}>
                    <option value="MESSAGES">Maximize Conversations (Messages)</option>
                    <option value="LEAD_GENERATION">Maximize Leads (Lead Form)</option>
                    <option value="LINK_CLICKS">Maximize Link Clicks</option>
                    <option value="CONVERSIONS">Maximize Sales Conversions</option>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Daily Budget (₹)" type="number" value={adSetBudget} onChange={(e: any) => setAdSetBudget(e.target.value)} placeholder="500" required />
                  <Select label="Target Country" value={adSetCountry} onChange={(e: any) => setAdSetCountry(e.target.value)}>
                    <option value="IN">India (IN)</option>
                    <option value="US">United States (US)</option>
                    <option value="AE">United Arab Emirates (UAE)</option>
                    <option value="GB">United Kingdom (UK)</option>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input label="Min Age" type="number" value={adSetAgeMin} onChange={(e: any) => setAdSetAgeMin(e.target.value)} placeholder="18" />
                  <Input label="Max Age" type="number" value={adSetAgeMax} onChange={(e: any) => setAdSetAgeMax(e.target.value)} placeholder="65" />
                  <Select label="Gender" value={adSetGender} onChange={(e: any) => setAdSetGender(e.target.value)}>
                    <option value="ALL">All Genders</option>
                    <option value="MALE">Male Only</option>
                    <option value="FEMALE">Female Only</option>
                  </Select>
                </div>

                <Textarea
                  label="Detailed Interest Targeting (Comma Separated)"
                  value={adSetInterests}
                  onChange={(e: any) => setAdSetInterests(e.target.value)}
                  placeholder="Digital Marketing, E-Commerce, Real Estate Investment, Business Owners"
                  rows={2}
                />

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateAdSetModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    Save & Activate Ad Set
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* DETAIL INSPECTOR MODAL */}
          {showDetailModal && selectedCampDetail && (
            <Modal title={`Meta Ads Inspector: ${selectedCampDetail.name}`} onClose={() => setShowDetailModal(false)} wide>
              <div className="space-y-5 text-xs text-slate-300">
                {/* Header info */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-100">{selectedCampDetail.name}</p>
                    <p className="font-mono text-[11px] text-slate-400 mt-0.5">Meta Campaign ID: {selectedCampDetail.metaCampaignId}</p>
                  </div>
                  <div className="text-right">
                    <Pill status={selectedCampDetail.status || "PAUSED"} />
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">₹{selectedCampDetail.dailyBudget || 500}/day</p>
                  </div>
                </div>

                {/* Campaign Parameters grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div><span className="text-slate-500">Objective:</span> <span className="font-semibold text-sky-400">{selectedCampDetail.objective}</span></div>
                  <div><span className="text-slate-500">Buying Type:</span> <span className="font-semibold text-slate-200">{selectedCampDetail.buyingType || "AUCTION"}</span></div>
                  <div><span className="text-slate-500">Special Ad Category:</span> <span className="font-semibold text-slate-200">{selectedCampDetail.specialAdCategory || "NONE"}</span></div>
                  <div><span className="text-slate-500">Bid Strategy:</span> <span className="font-semibold text-slate-200">{selectedCampDetail.bidStrategy || "LOWEST_COST_WITHOUT_CAP"}</span></div>
                  <div><span className="text-slate-500">CBO Enabled:</span> <span className="font-semibold text-emerald-400">{selectedCampDetail.cboEnabled ? "Yes" : "No"}</span></div>
                  <div><span className="text-slate-500">Advantage+:</span> <span className="font-semibold text-purple-400">{selectedCampDetail.advantagePlus ? "Active" : "Standard"}</span></div>
                </div>

                {/* Ad Sets & Creatives Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sky-400" /> Linked Ad Sets & Creatives
                  </h4>
                  {selectedCampDetail.adSets && selectedCampDetail.adSets.length > 0 ? (
                    selectedCampDetail.adSets.map((adSet: any) => (
                      <div key={adSet.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <p className="font-bold text-slate-200">{adSet.name}</p>
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px]">{adSet.destinationType}</span>
                        </div>

                        {/* Targeting preview */}
                        <div className="text-[11px] text-slate-400 space-y-1">
                          <p><span className="text-slate-500">Optimization Goal:</span> {adSet.optimizationGoal}</p>
                          <p><span className="text-slate-500">Attribution Window:</span> {adSet.attributionWindow || "7d_click_1d_view"}</p>
                          <p><span className="text-slate-500">Age & Geo:</span> {adSet.targeting?.ageMin || 18}-{adSet.targeting?.ageMax || 65} yrs in {(adSet.targeting?.countries || ["IN"]).join(", ")}</p>
                        </div>

                        {/* Creatives */}
                        {adSet.ads && adSet.ads.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/60 space-y-2">
                            <p className="text-[11px] font-semibold text-slate-300">Live Ad Creatives & Assets:</p>
                            {adSet.ads.map((ad: any) => (
                              <div key={ad.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  {ad.creative?.mediaUrl ? (
                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                                      <img src={ad.creative.mediaUrl} alt={ad.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-14 h-14 rounded-lg border border-slate-800 bg-slate-950 shrink-0 flex items-center justify-center text-[10px] text-slate-500 font-semibold">
                                      No Media
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-100">{ad.name}</p>
                                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">"{ad.creative?.headline || ad.creative?.body || 'Chat with us on WhatsApp'}"</p>
                                    {ad.creative?.body && <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{ad.creative.body}</p>}
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono shrink-0">
                                  {ad.callToAction || "WHATSAPP_MESSAGE"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-center">
                      Ad Set and Creative data being fetched directly from Meta Graph API...
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end border-t border-slate-800">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* PARTNERSHIP AD CODE MODAL */}
          {showPartnershipCodeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                  <h3 className="text-sm font-bold text-slate-100">
                    Enter partnership ad code, post ID or post URL
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPartnershipCodeModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-y-auto">
                  {/* Left Column: Form & Help Text */}
                  <div className="p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        This will set the first identity of the partnership ad and will use the media associated with the code or post info. For partnership ad code, contact the post's creator and request that they share it with you. For post ID or post URL, make sure that you have account-level permissions from the creator to run your ad with the associated media.{" "}
                        <button type="button" className="text-sky-400 hover:underline font-semibold">
                          Learn how to use ad codes, post ID or post URL
                        </button>
                      </p>

                      <div className="space-y-1">
                        <input
                          type="text"
                          value={partnershipAdCodeInput}
                          onChange={(e) => setPartnershipAdCodeInput(e.target.value)}
                          placeholder="Enter ad code provided by the creator, or post ID or post URL"
                          className="w-full bg-slate-950 border border-sky-500/80 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none placeholder:text-slate-500 font-mono shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Preview Panel */}
                  <div className="p-6 bg-slate-950/60 space-y-4 flex flex-col">
                    <h4 className="text-xs font-bold text-slate-200">Partnership ad preview</h4>

                    {/* Placement Dropdown */}
                    <select
                      value={partnershipPreviewPlacement}
                      onChange={(e) => setPartnershipPreviewPlacement(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-sky-500"
                    >
                      <option value="INSTAGRAM_FEED">📷 Instagram feed</option>
                      <option value="INSTAGRAM_STORIES">📱 Instagram stories</option>
                      <option value="FACEBOOK_FEED">📘 Facebook feed</option>
                    </select>

                    {/* Card Live Mockup Box */}
                    <div className="flex-1 min-h-[300px] flex items-center justify-center p-4">
                      <div className="w-full max-w-[280px] bg-slate-900 border border-sky-500/60 rounded-xl p-3 shadow-xl space-y-3">
                        {/* Mock Post Header */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 shrink-0"></div>
                          <div className="space-y-1 flex-1">
                            <div className="h-2 bg-slate-700 rounded w-28"></div>
                            <div className="h-1.5 bg-slate-800 rounded w-12"></div>
                          </div>
                        </div>

                        {/* Mock Post Image Placeholder */}
                        <div className="w-full aspect-square bg-slate-950 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-700">
                          <svg className="w-12 h-12 stroke-current opacity-40" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>

                        {/* Mock Action Icons */}
                        <div className="flex items-center justify-between text-slate-500 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-slate-700"></span>
                            <span className="w-4 h-4 rounded-full border border-slate-700"></span>
                            <span className="w-4 h-4 rounded-full border border-slate-700"></span>
                          </div>
                          <span className="w-4 h-4 rounded-full border border-slate-700"></span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 italic text-center">
                      Sample preview is for illustration only. Final rendering and interaction may vary.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-800 bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowPartnershipCodeModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPartnershipCodeModal(false)}
                    disabled={!partnershipAdCodeInput.trim()}
                    className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${partnershipAdCodeInput.trim()
                        ? "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                      }`}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SELECT PARTNERSHIP MODAL */}
          {showSelectPartnershipModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-100">Select partnership</h3>
                    <button
                      type="button"
                      onClick={() => setShowSelectPartnershipModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Select from your existing ad partnerships or send a new partnership request. You can also do this in{" "}
                    <button type="button" className="text-sky-400 hover:underline font-semibold">
                      Partnership Ads Hub
                    </button>.
                  </p>
                </div>

                {/* Sub-header Controls Bar */}
                <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 space-y-3">
                  <div className="flex items-center justify-between">
                    {/* Tabs */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPartnershipTab("SENT")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${partnershipTab === "SENT"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                          }`}
                      >
                        Sent requests
                      </button>
                      <button
                        type="button"
                        onClick={() => setPartnershipTab("RECEIVED")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${partnershipTab === "RECEIVED"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                          }`}
                      >
                        Received requests
                      </button>
                    </div>

                    {/* Add Partnership Button */}
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      Add Partnership
                    </button>
                  </div>

                  {/* Filters & Search Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                    <div className="md:col-span-5">
                      <select
                        value={searchByAsset}
                        onChange={(e) => setSearchByAsset(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Search by business asset</option>
                        <option value="PAGE">📄 Facebook Page — JISNU Digital Solutions</option>
                        <option value="INSTAGRAM">📷 Instagram — @jisnu_digitalsolution_pvt_ltd</option>
                      </select>
                    </div>
                    <div className="md:col-span-5">
                      <select
                        value={searchAdPartner}
                        onChange={(e) => setSearchAdPartner(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Search ad partner</option>
                        <option value="CREATOR_1">Creator Account 1</option>
                        <option value="CREATOR_2">Brand Partner 2</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        className="w-full py-2 px-3 rounded-xl border border-slate-700/80 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 flex items-center justify-center gap-1.5"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                        Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Header Columns */}
                <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 grid grid-cols-4 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-1">
                    <span>Ad partner</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[9px] cursor-help" title="Partner brand or creator handle">i</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Business asset</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[9px] cursor-help" title="Associated page or profile">i</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[9px] cursor-help" title="Current partnership status">i</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Issues</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[9px] cursor-help" title="Any account or permission issues">i</span>
                  </div>
                </div>

                {/* Empty State Illustration Area */}
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto min-h-[260px]">
                  {/* Graphic Illustration Placeholder */}
                  <div className="relative w-32 h-24 flex items-center justify-center">
                    {/* Background Avatars */}
                    <div className="absolute top-0 left-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80"></div>
                    <div className="absolute top-0 right-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80"></div>
                    <div className="absolute bottom-0 left-10 w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80"></div>

                    {/* Central Main Badge */}
                    <div className="relative z-10 w-28 h-14 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 shadow-xl p-2.5 flex items-center gap-2 border border-sky-300/30">
                      <div className="w-9 h-9 rounded-full bg-white text-sky-600 flex items-center justify-center font-bold text-base shrink-0">
                        👤
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="h-2 bg-white/90 rounded w-12"></div>
                        <div className="h-1.5 bg-white/60 rounded w-8"></div>
                      </div>
                    </div>
                  </div>

                  {/* Empty Text */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">No ad partnerships</h4>
                    <p className="text-xs text-slate-400">
                      {partnershipTab === "SENT" ? "You haven't sent any requests." : "You haven't received any requests."}
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-800 bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowSelectPartnershipModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSelectPartnershipModal(false)}
                    disabled={!selectedPartnerIdentity}
                    className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${selectedPartnerIdentity
                        ? "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                      }`}
                  >
                    Select identity
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
}



      export default function MetaAdsPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-950"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>}>
        <MetaAdsWorkspace orgId={DEFAULT_ORG_ID} showToast={() => { }} platform="meta" setPlatform={() => { }} />
      </Suspense>
      );
}
