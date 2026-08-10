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
import CreateCampaignModal from "@/components/meta-ads/CreateCampaignModal";
import EngagementCampaignFlow from "@/components/meta-ads/EngagementCampaignFlow";
import SalesCampaignFlow from "@/components/meta-ads/SalesCampaignFlow";
import TrafficCampaignFlow from "@/components/meta-ads/TrafficCampaignFlow";
import LeadsCampaignFlow from "@/components/meta-ads/LeadsCampaignFlow";
import AwarenessCampaignFlow from "@/components/meta-ads/AwarenessCampaignFlow";
import AppPromotionCampaignFlow from "@/components/meta-ads/AppPromotionCampaignFlow";

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

// ─── A/B Test Metric Comparison Options ───────────────────────────────────────
const abTestPerformanceComparisonOptions = [
  { value: "COST_PER_RESULT", label: "Cost per result" },
  { value: "CPC_LINK_CLICK", label: "CPC (cost per link click)" },
  { value: "COST_PER_1000_REACHED", label: "Cost per 1,000 Meta accounts reached" },
  { value: "COST_PER_PURCHASE", label: "Cost per purchase" },
  { value: "STANDARD_EVENTS", label: "Standard events" },
  { value: "COST_PER_3SEC_VIDEO_PLAY", label: "Cost per 3-second video play" },
  { value: "COST_PER_ACHIEVEMENT_UNLOCKED", label: "Cost per achievement unlocked" },
  { value: "COST_PER_AD_RECALL_LIFT", label: "Cost per ad recall lift" },
  { value: "COST_PER_ADD_PAYMENT_INFO", label: "Cost per add of payment info" },
  { value: "COST_PER_ADD_TO_CART", label: "Cost per add to cart" },
  { value: "COST_PER_ADD_TO_WISHLIST", label: "Cost per add to wishlist" },
  { value: "COST_PER_APP_ACTIVATION", label: "Cost per app activation" },
  { value: "COST_PER_APP_INSTALL", label: "Cost per app install" },
  { value: "COST_PER_CHECKOUT_INITIATED", label: "Cost per checkout initiated" },
  { value: "COST_PER_CONTENT_VIEW", label: "Cost per content view" },
  { value: "COST_PER_CREDIT_SPEND", label: "Cost per credit spend" },
  { value: "COST_PER_CUSTOM_EVENT", label: "Cost per custom event" },
  { value: "COST_PER_EVENT_RESPONSE", label: "Cost per event response" },
  { value: "COST_PER_LANDING_PAGE_VIEW", label: "Cost per landing page view" },
  { value: "COST_PER_LEAD", label: "Cost per lead" },
  { value: "COST_PER_LEVEL_ACHIEVED", label: "Cost per level achieved" },
  { value: "COST_PER_LIKE", label: "Cost per like" },
  { value: "COST_PER_MOBILE_APP_D2_RETENTION", label: "Cost per mobile app D2 retention" },
  { value: "COST_PER_MOBILE_APP_D7_RETENTION", label: "Cost per mobile app D7 retention" },
  { value: "COST_PER_NEW_MESSAGING_CONTACT", label: "Cost per new messaging contact" },
  { value: "COST_PER_OTHER_OFFLINE_CONVERSION", label: "Cost per other offline conversion" },
  { value: "COST_PER_POST_ENGAGEMENT", label: "Cost per post engagement" },
  { value: "COST_PER_RATING_SUBMITTED", label: "Cost per rating submitted" },
  { value: "COST_PER_REGISTRATION_COMPLETED", label: "Cost per registration completed" },
  { value: "COST_PER_SEARCH", label: "Cost per search" },
  { value: "COST_PER_TUTORIAL_COMPLETED", label: "Cost per tutorial completed" },
];

// ─── ScrollableSelect Component ────────────────────────────────────────────────
function ScrollableSelect({
  value,
  onChange,
  options,
  className = "",
  maxHeight = "max-h-48"
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  maxHeight?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-sky-500 transition-all ${className}`}
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ml-1 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-y-auto ${maxHeight} py-1 animate-fadeIn divide-y divide-slate-800/40`}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${opt.value === value
                ? "bg-sky-500/15 text-sky-400 font-bold"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MetaDatePicker Component ──────────────────────────────────────────────────
function MetaDatePicker({
  value,
  onChange,
  placeholder = "Select date"
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (inputRef.current) {
      if (typeof (inputRef.current as any).showPicker === "function") {
        (inputRef.current as any).showPicker();
      } else {
        inputRef.current.focus();
        inputRef.current.click();
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="relative flex items-center bg-slate-950 border border-slate-700/60 hover:border-sky-500/80 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold cursor-pointer transition-all shadow-sm group"
    >
      <Calendar className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0 group-hover:scale-110 transition-transform" />
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer [color-scheme:dark]"
      />
    </div>
  );
}

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
  const [fetchedIgAccounts, setFetchedIgAccounts] = useState<any[]>([]);
  const [fetchedWaNumbers, setFetchedWaNumbers] = useState<any[]>([]);
  const [launching, setLaunching] = useState(false);
  const [activeCampaignFlow, setActiveCampaignFlow] = useState<string | null>(null);

  // Detail Inspector & Media Library state
  const [selectedCampDetail, setSelectedCampDetail] = useState<any>(null);
  const [liveMetaDetail, setLiveMetaDetail] = useState<any>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [detailModalTab, setDetailModalTab] = useState<"metrics" | "config" | "adsets" | "creatives" | "raw">("metrics");
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
  const [campHeadline, setCampHeadline] = useState("Chat with us");
  const [campBody, setCampBody] = useState("Helping businesses grow digitally with smart strategies and powerful branding. 📈 Meta Ads Google Ads Social Media Management Creative Design, Let’s turn your vision into digital success!");
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

  // Manual Traffic Campaign State
  const [trafficSubStep, setTrafficSubStep] = useState<"CHOICE" | "CONFIG">("CHOICE");
  const [trafficLiveVideo, setTrafficLiveVideo] = useState(true);
  const [trafficLiveVideoLocation, setTrafficLiveVideoLocation] = useState("FACEBOOK");
  const [trafficBudgetStrategy, setTrafficBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("ADSET");
  const [trafficShareBudget, setTrafficShareBudget] = useState(true);
  const [trafficBidStrategy, setTrafficBidStrategy] = useState("HIGHEST_VOLUME");
  const [trafficAbTest, setTrafficAbTest] = useState(true);
  const [trafficTestVariable, setTrafficTestVariable] = useState("CREATIVE");
  const [trafficTestDuration, setTrafficTestDuration] = useState("7_DAYS");
  const [trafficMetricComparison, setTrafficMetricComparison] = useState("COST_PER_POST_ENGAGEMENT");
  const [trafficSpecialCategory, setTrafficSpecialCategory] = useState("NONE");
  const [trafficShowMoreNameOptions, setTrafficShowMoreNameOptions] = useState(false);
  const [trafficShowMoreDetailsOptions, setTrafficShowMoreDetailsOptions] = useState(false);

  // Traffic Ad Set (Step 3) State
  const [trafficAdSetName, setTrafficAdSetName] = useState("New Traffic ad set");
  const [trafficAdSetConversionLocation, setTrafficAdSetConversionLocation] = useState("WEBSITE");
  const [trafficPerformanceGoal, setTrafficPerformanceGoal] = useState("MAXIMIZE_LINK_CLICKS");
  const [trafficCostPerResult, setTrafficCostPerResult] = useState("");
  const [awarenessCostPerResult, setAwarenessCostPerResult] = useState("");

  // Step 3 Budget & Schedule State
  const [step3BudgetMode, setStep3BudgetMode] = useState<"LIFETIME" | "DAILY">("LIFETIME");
  const [step3BudgetAmount, setStep3BudgetAmount] = useState("14000.00");
  const [step3LiveVideoOption, setStep3LiveVideoOption] = useState<"UPCOMING" | "CURRENT">("UPCOMING");
  const [step3StartDate, setStep3StartDate] = useState("2026-08-07");
  const [step3StartTime, setStep3StartTime] = useState("11:37");
  const [step3EndDate, setStep3EndDate] = useState("2026-08-07");
  const [step3EndTime, setStep3EndTime] = useState("15:37");
  const [step3ShowMoreOptions, setStep3ShowMoreOptions] = useState(false);
  const [step3BudgetScheduling, setStep3BudgetScheduling] = useState(false);
  const [step3AdScheduling, setStep3AdScheduling] = useState(false);

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
  const [leadsSubStep, setLeadsSubStep] = useState<"CHOICE" | "CONFIG">("CHOICE");

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
  const [appPromoLiveVideo, setAppPromoLiveVideo] = useState(true);
  const [appPromoLiveVideoLocation, setAppPromoLiveVideoLocation] = useState("FACEBOOK");
  const [appPromoShowMoreSettings, setAppPromoShowMoreSettings] = useState(false);
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
  const [appPromoAppNameSearch, setAppPromoAppNameSearch] = useState("");
  const [appPromoAppCountry, setAppPromoAppCountry] = useState("IN");
  const [appPromoAttributionModel, setAppPromoAttributionModel] = useState("STANDARD");
  const [appPromoValueRulesEnabled, setAppPromoValueRulesEnabled] = useState(false);
  const [appPromoSecuritiesDeclaration, setAppPromoSecuritiesDeclaration] = useState(false);
  const [appPromoPlacementsAdvantage, setAppPromoPlacementsAdvantage] = useState(true);
  const [appPromoShowEstimatedAudienceSize, setAppPromoShowEstimatedAudienceSize] = useState(true);
  const [appPromoStep3ShowMoreSettings, setAppPromoStep3ShowMoreSettings] = useState(false);
  const [appPromoStep3ShowBrandSuitability, setAppPromoStep3ShowBrandSuitability] = useState(false);

  // App Promotion A/B Test State
  const [appPromoAbTest, setAppPromoAbTest] = useState(true);
  const [appPromoTestVariable, setAppPromoTestVariable] = useState("CREATIVE");
  const [appPromoTestDuration, setAppPromoTestDuration] = useState("7_DAYS");
  const [appPromoMetricComparison, setAppPromoMetricComparison] = useState("COST_PER_ADD_PAYMENT_INFO");

  // App Promotion Ad (Step 4) State
  const [appPromoMainDestination, setAppPromoMainDestination] = useState("APP");
  const [appPromoDeferredDeepLink, setAppPromoDeferredDeepLink] = useState("");
  const [appPromoCustomStoreListingId, setAppPromoCustomStoreListingId] = useState("");
  const [appPromoMediaAiCreated, setAppPromoMediaAiCreated] = useState(false);
  const [appPromoTestimonialText, setAppPromoTestimonialText] = useState("");
  const [appPromoTrackWebsiteEvents, setAppPromoTrackWebsiteEvents] = useState(true);
  const [appPromoTrackAppEvents, setAppPromoTrackAppEvents] = useState(true);
  const [appPromoTrackOfflineEvents, setAppPromoTrackOfflineEvents] = useState(false);
  const [appPromoLanguagesEnabled, setAppPromoLanguagesEnabled] = useState(false);


  // Ad Level Specific State for Awareness (Step 4) & Partnership Ads
  const [adName, setAdName] = useState("New Awareness ad");
  const [partnershipAd, setPartnershipAd] = useState(true);
  const [partnershipAdCode, setPartnershipAdCode] = useState("");
  const [partnershipCodeApplied, setPartnershipCodeApplied] = useState(false);

  // Select Partner Content Post Modal State
  const [showSelectPartnerContentModal, setShowSelectPartnerContentModal] = useState(false);
  const [partnerContentTab, setPartnerContentTab] = useState<"ALL" | "SUGGESTED">("ALL");
  const [selectedPartnerPostId, setSelectedPartnerPostId] = useState<string>("post_1");
  const [partnerPostSearch, setPartnerPostSearch] = useState("");
  const [partnerPostTypeFilter, setPartnerPostTypeFilter] = useState("ALL");
  const [partnerPostIdentityFilter, setPartnerPostIdentityFilter] = useState("ALL");
  // Offline Events & Events Manager Modal State
  const [showEditOfflineSetsModal, setShowEditOfflineSetsModal] = useState(false);
  const [showEventsManagerModal, setShowEventsManagerModal] = useState(false);
  const [offlineEventSetName, setOfflineEventSetName] = useState("JISNU Digital Website Pixel");
  const [offlineDatasetId, setOfflineDatasetId] = useState("1380912777544016");
  // Sales Campaign (Step 2) State
  const [salesLiveVideo, setSalesLiveVideo] = useState(true);
  const [salesLiveVideoLocation, setSalesLiveVideoLocation] = useState("FACEBOOK");
  const [salesAdvantageCatalogue, setSalesAdvantageCatalogue] = useState(false);
  const [salesAdvantagePlus, setSalesAdvantagePlus] = useState(true);
  const [salesBudgetStrategy, setSalesBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [salesBudgetMode, setSalesBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [salesBudget, setSalesBudget] = useState("800");
  const [salesBidStrategy, setSalesBidStrategy] = useState("HIGHEST_VOLUME");
  const [salesBudgetScheduling, setSalesBudgetScheduling] = useState(false);
  const [salesAdScheduling, setSalesAdScheduling] = useState("RUN_ALL_TIME");
  const [salesAbTest, setSalesAbTest] = useState(true);
  const [salesTestVariable, setSalesTestVariable] = useState("CREATIVE");
  const [salesTestDuration, setSalesTestDuration] = useState("7_DAYS");
  const [salesMetricComparison, setSalesMetricComparison] = useState("COST_PER_ADD_PAYMENT_INFO");
  const [salesEngagedAudienceDefined, setSalesEngagedAudienceDefined] = useState(false);
  const [salesExistingCustomersDefined, setSalesExistingCustomersDefined] = useState(false);
  const [salesSpecialCategory, setSalesSpecialCategory] = useState("NONE");
  const [salesCampaignScore] = useState(100);

  // Sales Ad Set (Step 3) State
  const [salesAdSetName, setSalesAdSetName] = useState("New Sales ad set");
  const [salesLifecycleStrategy, setSalesLifecycleStrategy] = useState("ALL_AUDIENCES");
  const [salesConversionLocation, setSalesConversionLocation] = useState("WEBSITE");
  const [salesPerformanceGoal, setSalesPerformanceGoal] = useState("MAXIMIZE_CONVERSIONS");
  const [salesPixelName] = useState("JISNU Digital Website Pixel");
  const [salesConversionEvent, setSalesConversionEvent] = useState("");
  const [salesCostPerResult, setSalesCostPerResult] = useState("");
  const [salesAttributionModel, setSalesAttributionModel] = useState("STANDARD");
  const [salesDeliveryType, setSalesDeliveryType] = useState("STANDARD");
  const [salesSecuritiesDeclaration, setSalesSecuritiesDeclaration] = useState(false);
  const [salesPlacementsAdvantage, setSalesPlacementsAdvantage] = useState(true);
  const [salesShowEstimatedAudienceSize, setSalesShowEstimatedAudienceSize] = useState(true);
  const [salesStep3ShowMoreSettings, setSalesStep3ShowMoreSettings] = useState(false);
  const [salesStep3ShowBrandSuitability, setSalesStep3ShowBrandSuitability] = useState(false);
  const [salesShowSetupConversionEventModal, setSalesShowSetupConversionEventModal] = useState(false);

  // Sales Ad Level (Step 4) State
  const [salesAdName, setSalesAdName] = useState("New Sales ad");
  const [salesAdSetupMode, setSalesAdSetupMode] = useState("USE_EXISTING");
  const [salesAdSource, setSalesAdSource] = useState("META_CATALOG");
  const [salesHighlightPromotions, setSalesHighlightPromotions] = useState(true);
  const [salesPromoCodesOption, setSalesPromoCodesOption] = useState("AUTO");
  const [salesUrlParameters, setSalesUrlParameters] = useState("key1=value1&key2=value2");
  const [salesAdDescription, setSalesAdDescription] = useState("");
  const [multiAdvertiserAds, setMultiAdvertiserAds] = useState(true);
  const [salesShowPromoCodesModal, setSalesShowPromoCodesModal] = useState(false);
  const [salesShowUrlParametersModal, setSalesShowUrlParametersModal] = useState(false);

  // Awareness Campaign (Step 2) State
  const [awarenessLiveVideo, setAwarenessLiveVideo] = useState(true);
  const [awarenessLiveVideoLocation, setAwarenessLiveVideoLocation] = useState("FACEBOOK");
  const [awarenessAdvantageBudget, setAwarenessAdvantageBudget] = useState(true);
  const [awarenessBudgetMode, setAwarenessBudgetMode] = useState("LIFETIME");
  const [awarenessBudgetAmount, setAwarenessBudgetAmount] = useState("33473.90");
  const [awarenessBidStrategy, setAwarenessBidStrategy] = useState("HIGHEST_VOLUME");
  const [awarenessScheduleBudgetIncreases, setAwarenessScheduleBudgetIncreases] = useState(false);
  const [awarenessAdScheduling] = useState("RUN_ALL_TIME");
  const [awarenessFrequencyControl, setAwarenessFrequencyControl] = useState(true);
  const [awarenessFrequencyMode, setAwarenessFrequencyMode] = useState("CAP");
  const [awarenessFrequencyCapCount, setAwarenessFrequencyCapCount] = useState(2);
  const [awarenessFrequencyCapDays, setAwarenessFrequencyCapDays] = useState(7);
  const [awarenessAbTest, setAwarenessAbTest] = useState(true);
  const [awarenessTestVariable, setAwarenessTestVariable] = useState("CREATIVE");
  const [awarenessTestDuration, setAwarenessTestDuration] = useState("7_DAYS");
  const [awarenessMetricComparison, setAwarenessMetricComparison] = useState("COST_PER_ADD_PAYMENT_INFO");

  // Awareness Ad Set (Step 3) State
  const [awarenessAdSetName, setAwarenessAdSetName] = useState("New Awareness ad set");
  const [awarenessPerformanceGoal, setAwarenessPerformanceGoal] = useState("IMPRESSIONS");
  const [awarenessBidCap, setAwarenessBidCap] = useState("");
  const [awarenessDeliveryType, setAwarenessDeliveryType] = useState("STANDARD");
  const [awarenessAdSetBudgetMode, setAwarenessAdSetBudgetMode] = useState("DAILY");
  const [awarenessAdSetBudgetAmount, setAwarenessAdSetBudgetAmount] = useState("200.00");
  const [awarenessStartDate, setAwarenessStartDate] = useState("2026-08-08");
  const [awarenessStartTime, setAwarenessStartTime] = useState("15:38");
  const [awarenessSetEndDate, setAwarenessSetEndDate] = useState(false);
  const [awarenessEndDate, setAwarenessEndDate] = useState("");
  const [awarenessBudgetScheduling, setAwarenessBudgetScheduling] = useState(false);
  const [awarenessLocations, setAwarenessLocations] = useState([
    { type: "pin", name: "411057" },
    { type: "pin", name: "Wakad Chowk + 10 km" },
    { type: "city", name: "Nashik, Maharashtra" }
  ]);
  const [awarenessMinAge, setAwarenessMinAge] = useState(25);
  const [awarenessExcludeAudience, setAwarenessExcludeAudience] = useState("");
  const [awarenessLanguages, setAwarenessLanguages] = useState("");
  const [awarenessIncludeCustomAudience, setAwarenessIncludeCustomAudience] = useState("");
  const [awarenessAgeMin, setAwarenessAgeMin] = useState(50);
  const [awarenessAgeMax, setAwarenessAgeMax] = useState("65+");
  const [awarenessGender, setAwarenessGender] = useState("ALL");
  const [awarenessDetailedTargeting, setAwarenessDetailedTargeting] = useState("");
  const [awarenessSecuritiesDeclaration, setAwarenessSecuritiesDeclaration] = useState(false);
  const [awarenessPlacementType, setAwarenessPlacementType] = useState("MANUAL");
  const [awarenessPlacementsFb, setAwarenessPlacementsFb] = useState(true);
  const [awarenessPlacementsIg, setAwarenessPlacementsIg] = useState(true);
  const [awarenessPlacementsAn, setAwarenessPlacementsAn] = useState(true);
  const [awarenessPlacementsMsg, setAwarenessPlacementsMsg] = useState(false);
  const [awarenessPlacementsWa, setAwarenessPlacementsWa] = useState(false);
  const [awarenessPlacementsThreads, setAwarenessPlacementsThreads] = useState(false);
  const [awarenessPlacementsFeeds, setAwarenessPlacementsFeeds] = useState(true);
  const [awarenessPlacementsStories, setAwarenessPlacementsStories] = useState(false);
  const [awarenessPlacementsInstream, setAwarenessPlacementsInstream] = useState(true);
  const [awarenessPlacementsSearch, setAwarenessPlacementsSearch] = useState(true);
  const [awarenessPlacementsApps, setAwarenessPlacementsApps] = useState(false);
  const [awarenessStep3ShowMoreSettings, setAwarenessStep3ShowMoreSettings] = useState(false);
  const [awarenessStep3ShowMoreOptions1, setAwarenessStep3ShowMoreOptions1] = useState(false);
  const [awarenessShowMoreOptions, setAwarenessShowMoreOptions] = useState(false);
  const [awarenessAudienceNoticeDismissed, setAwarenessAudienceNoticeDismissed] = useState(false);
  const [awarenessPlacementsAdvantage, setAwarenessPlacementsAdvantage] = useState(true);
  const [awarenessShowEstimatedAudienceSize, setAwarenessShowEstimatedAudienceSize] = useState(true);
  const [isEditingAudienceControls, setIsEditingAudienceControls] = useState(false);
  const [audienceLocations, setAudienceLocations] = useState<string[]>(["India"]);
  const [audienceMinAge, setAudienceMinAge] = useState(18);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [languageSearchInput, setLanguageSearchInput] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Conversations / Chat Template State (Step 4)
  const [chatTemplateGreeting, setChatTemplateGreeting] = useState("Hi! Please let us know how we can help you.");
  const [chatTemplateQuestion1, setChatTemplateQuestion1] = useState("Can I learn more about your business?");
  const [chatTemplateQuestion2, setChatTemplateQuestion2] = useState("Can you tell me more about your ad?");
  const [chatTemplateQuestion3, setChatTemplateQuestion3] = useState("Is anyone available to chat?");
  const [showChatTemplateModal, setShowChatTemplateModal] = useState(false);

  // Step 4 Destination State
  const [step4DestinationType, setStep4DestinationType] = useState<"MESSAGING" | "INSTANT_EXPERIENCE" | "WEBSITE" | "CALL">("MESSAGING");
  const [step4WhatsappNumber, setStep4WhatsappNumber] = useState("+91 77099 36965");
  const [step4AdsDataSharing, setStep4AdsDataSharing] = useState(false);

  // Manual Engagement Campaign Wizard State
  const [manualEngStep, setManualEngStep] = useState<1 | 2 | 3>(1);
  const [engName, setEngName] = useState("New Engagement campaign");
  const [engBuyingType, setEngBuyingType] = useState("AUCTION");
  const [engSpecialCategory, setEngSpecialCategory] = useState("NONE");
  const [engBudgetStrategy, setEngBudgetStrategy] = useState("CAMPAIGN");
  const [engBudgetMode, setEngBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [engBudgetAmount, setEngBudgetAmount] = useState("1000");
  const [engBidStrategy, setEngBidStrategy] = useState("HIGHEST_VOLUME");
  const [engShowMoreSettings, setEngShowMoreSettings] = useState(false);
  const [engBudgetScheduling, setEngBudgetScheduling] = useState(false);
  const [engFrequencyControl, setEngFrequencyControl] = useState(false);
  const [engFrequencyMode, setEngFrequencyMode] = useState<"TARGET" | "CAP">("CAP");
  const [engFrequencyCapCount, setEngFrequencyCapCount] = useState(2);
  const [engFrequencyCapDays, setEngFrequencyCapDays] = useState(7);
  const [engAbTest, setEngAbTest] = useState(false);

  // Engagement Ad Set State
  const [engAdSetName, setEngAdSetName] = useState("New Engagement ad set");
  const [engConversionLocation, setEngConversionLocation] = useState("MESSAGING_APPS");
  const [engEngagementType, setEngEngagementType] = useState("VIDEO_VIEWS");
  const [engPerformanceGoal, setEngPerformanceGoal] = useState("MAXIMIZE_THRUPLAY_VIEWS");
  const [engLocations, setEngLocations] = useState<string[]>(["India"]);
  const [engMinAge, setEngMinAge] = useState(18);
  const [engDetailedTargeting, setEngDetailedTargeting] = useState("");

  // Engagement Ad State
  const [engAdName, setEngAdName] = useState("New Engagement ad");
  const [engFacebookPageId, setEngFacebookPageId] = useState("");
  const [engInstagramAccountId, setEngInstagramAccountId] = useState("jisnu_digitalsolution_pvt_ltd");
  const [engThreadsProfile, setEngThreadsProfile] = useState("USE_INSTAGRAM");
  const [engWhatsappNumber, setEngWhatsappNumber] = useState("+91 77099 36965");
  const [engDestinationType, setEngDestinationType] = useState("MESSAGING_APPS");
  const [engCreativeMediaUrl, setEngCreativeMediaUrl] = useState("");
  const [engPrimaryText, setEngPrimaryText] = useState("");
  const [engHeadline, setEngHeadline] = useState("");
  const [engDescription, setEngDescription] = useState("");
  const [engCallToAction, setEngCallToAction] = useState("WHATSAPP_MESSAGE");
  const [engUrlParameters, setEngUrlParameters] = useState("key1=value1&key2=value2");

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
        if (data.config.adAccountId) {
          setSelectedAccountId(data.config.adAccountId);
        }
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

        // Fetch connected Instagram Accounts
        fetch(`${BACKEND}/api/meta-ads/instagram-accounts?organizationId=${orgId}`)
          .then(r => r.json())
          .then(igData => {
            if (igData.instagramAccounts && igData.instagramAccounts.length > 0) {
              setFetchedIgAccounts(igData.instagramAccounts);
              setEngInstagramAccountId(igData.instagramAccounts[0].id);
            }
          }).catch(() => { });

        // Fetch connected WhatsApp Numbers
        fetch(`${BACKEND}/api/meta-ads/whatsapp-numbers?organizationId=${orgId}`)
          .then(r => r.json())
          .then(waData => {
            if (waData.whatsappNumbers && waData.whatsappNumbers.length > 0) {
              setFetchedWaNumbers(waData.whatsappNumbers);
              setEngWhatsappNumber(waData.whatsappNumbers[0].displayPhoneNumber);
            }
          }).catch(() => { });
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta config:", e);
    }
  }, [orgId, formPixelId]);

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

  const handleSyncLive = async (targetAdAccountId?: string) => {
    setSyncing(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, adAccountId: targetAdAccountId || selectedAccountId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.result?.message || "Live Meta campaigns synced cleanly! ✓");
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

  const handleSelectAccount = async (newAccountId: string) => {
    setSelectedAccountId(newAccountId);
    setFormAdAccountId(newAccountId);
    try {
      await fetch(`${BACKEND}/api/meta-ads/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, adAccountId: newAccountId }),
      });
      const selectedAcc = accounts.find(a => a.adAccountId === newAccountId);
      const accName = selectedAcc?.name || selectedAcc?.businessName || newAccountId;
      showToast(`Connected Ad Account set to: ${accName} ✓`);
      handleSyncLive(newAccountId);
    } catch (e: any) {
      console.warn("Failed to persist selected ad account:", e);
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
          dailyBudget: Number(campBudget) || Number(step3BudgetAmount) || 500,
          destinationType: campDestination,
          optimizationGoal: campObjective === "OUTCOME_AWARENESS" ? (awarenessPerformanceGoal || "REACH") : campObjective === "OUTCOME_TRAFFIC" ? (trafficPerformanceGoal || "LINK_CLICKS") : campDestination === "WHATSAPP" ? "MESSAGES" : "LINK_CLICKS",
          costPerResult: campObjective === "OUTCOME_AWARENESS" ? awarenessCostPerResult : campObjective === "OUTCOME_TRAFFIC" ? trafficCostPerResult : "",
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
    // Initial fast fetch from local DB / cache
    fetchMetaConfig();
    fetchAccounts();
    fetchCampaigns();
    setLoading(false);
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
          {/* Connected Single Ad Account Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Select Account:</span>
              <select
                value={selectedAccountId || ""}
                onChange={(e) => handleSelectAccount(e.target.value)}
                className="bg-transparent font-bold text-slate-100 text-xs focus:outline-none cursor-pointer border-none py-0.5 pr-1 max-w-[320px] truncate"
                title="Select Active Connected Meta Ad Account"
              >
                {accounts.length === 0 ? (
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    No Ad Accounts Found (Click Meta Credentials)
                  </option>
                ) : (
                  accounts.map(acc => (
                    <option key={acc.adAccountId} value={acc.adAccountId} className="bg-slate-900 text-slate-100">
                      {acc.name || acc.businessName || "Meta Ad Account"} ({acc.adAccountId})
                    </option>
                  ))
                )}
              </select>
            </div>
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
            onClick={() => { handleSyncLive(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700/50 transition-all"
            title="Refresh & Sync Live Meta Data"
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
                            setFetchingDetail(true);
                            setDetailModalTab("metrics");
                            try {
                              const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${c.id}?organizationId=${orgId}`);
                              const data = await res.json();
                              setSelectedCampDetail(data.campaign || c);
                              setLiveMetaDetail(data.liveMeta || null);
                              setShowDetailModal(true);
                            } catch (e) {
                              setSelectedCampDetail(c);
                              setLiveMetaDetail(null);
                              setShowDetailModal(true);
                            } finally {
                              setFetchingDetail(false);
                            }
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-all flex items-center gap-1 inline-flex"
                        >
                          {fetchingDetail ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
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

      {/* CREATE CAMPAIGN MODAL & WORKSPACE FLOWS */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onContinue={(objective) => {
            setShowCreateModal(false);
            setCampObjective(objective);
            setActiveCampaignFlow(objective);
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_ENGAGEMENT" && (
        <EngagementCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_SALES" && (
        <SalesCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          fetchedPixels={fetchedPixels}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_TRAFFIC" && (
        <TrafficCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_LEADS" && (
        <LeadsCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_AWARENESS" && (
        <AwarenessCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_APP_PROMOTION" && (
        <AppPromotionCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {/* CREATE CAMPAIGN MODAL (LEGACY FALLBACK) */}
      {false && showCreateModal && (
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800/80 shadow-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                          Step 2 of 4
                        </span>
                        <h3 className="font-bold text-slate-100 text-sm tracking-tight">
                          Configure {campObjective === "OUTCOME_AWARENESS" ? "Awareness" : campObjective.replace("OUTCOME_", "")} Campaign Parameters
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Parameters tailored specifically for your {campObjective.replace("OUTCOME_", "")} campaign setup.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCampaignStep(1)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 border border-slate-700/60 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
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
                              <option value="RESERVED">Reservation</option>
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
                      {/* SUB-STEP 1: Campaign Setup Choice Screen */}
                      {trafficSubStep === "CHOICE" && (
                        <div className="space-y-4 animate-fadeIn">
                          {/* Top Navigation Header */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setCampaignStep(1)}
                                  className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mb-1"
                                >
                                  ← Change Objective
                                </button>
                                <h3 className="font-bold text-slate-100 text-sm">Step 2: Configure TRAFFIC Campaign Parameters</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Parameters tailored specifically for your TRAFFIC campaign setup.</p>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
                            </div>
                          </div>

                          {/* Choose a campaign setup */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-slate-100 text-sm">Choose a campaign setup</h4>
                              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                Create your traffic campaign using a tailored and streamlined setup, or manually build your campaign. Suggestions may vary based on your recent ad account activity.
                              </p>
                            </div>

                            {/* Option 1: Tailored web traffic campaign */}
                            <div
                              onClick={() => {
                                setTrafficPresetMode("tailored");
                                setTrafficSubStep("CONFIG");
                              }}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer ${trafficPresetMode === "tailored"
                                ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30"
                                : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                                }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="pt-1">
                                  <input
                                    type="radio"
                                    name="trafficPresetModeChoice"
                                    checked={trafficPresetMode === "tailored"}
                                    onChange={() => {
                                      setTrafficPresetMode("tailored");
                                      setTrafficSubStep("CONFIG");
                                    }}
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

                            {/* Option 2: Manual traffic campaign */}
                            <div
                              onClick={() => {
                                setTrafficPresetMode("manual");
                                setTrafficSubStep("CONFIG");
                              }}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer ${trafficPresetMode === "manual"
                                ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30"
                                : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <input
                                      type="radio"
                                      name="trafficPresetModeChoice"
                                      checked={trafficPresetMode === "manual"}
                                      onChange={() => {
                                        setTrafficPresetMode("manual");
                                        setTrafficSubStep("CONFIG");
                                      }}
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
                                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 hover:bg-sky-500/20">
                                  Configure →
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB-STEP 2: Dedicated Manual Traffic Campaign Configuration Screen */}
                      {trafficSubStep === "CONFIG" && (
                        <div className="space-y-4 animate-fadeIn">
                          {/* Back Button & Header */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <button
                                type="button"
                                onClick={() => setTrafficSubStep("CHOICE")}
                                className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mb-1"
                              >
                                ← Change campaign setup
                              </button>
                              <h3 className="font-bold text-slate-100 text-sm">New Traffic campaign</h3>
                              <p className="text-xs text-slate-400 mt-0.5">1 Ad set • 1 Ad • Manual setup mode</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                In draft
                              </span>
                              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
                            </div>
                          </div>

                          {/* Card 1: Campaign name */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                              <h4 className="font-bold text-slate-100 text-xs">Campaign name</h4>
                            </div>
                            <input
                              type="text"
                              value={campName}
                              onChange={(e) => setCampName(e.target.value)}
                              placeholder="New Traffic campaign"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                            />
                            <div>
                              <button
                                type="button"
                                onClick={() => setTrafficShowMoreNameOptions(!trafficShowMoreNameOptions)}
                                className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
                              >
                                {trafficShowMoreNameOptions ? "Hide details" : "Show more options ▾"}
                              </button>
                            </div>
                          </div>

                          {/* Card 2: Live video ad */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${trafficLiveVideo ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}`}>
                                    {trafficLiveVideo ? "On" : "Off"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                  Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                <input
                                  type="checkbox"
                                  checked={trafficLiveVideo}
                                  onChange={(e) => setTrafficLiveVideo(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>

                            {trafficLiveVideo && (
                              <div className="pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                                <div>
                                  <h5 className="font-bold text-slate-200 text-xs">Live video location</h5>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Choose where you'll be running your live video.</p>
                                </div>
                                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-2.5">
                                  <input
                                    type="radio"
                                    checked={trafficLiveVideoLocation === "FACEBOOK"}
                                    onChange={() => setTrafficLiveVideoLocation("FACEBOOK")}
                                    className="accent-sky-500"
                                  />
                                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    f
                                  </div>
                                  <span className="text-xs font-bold text-slate-100">Facebook</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card 3: Campaign details */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                              <h4 className="font-bold text-slate-100 text-xs">Campaign details</h4>
                            </div>

                            <div className="space-y-2.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400">Buying type</label>
                                <p className="text-xs font-bold text-slate-200 mt-0.5">Auction</p>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <label className="block text-[11px] font-semibold text-slate-400">Campaign objective</label>
                                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                                </div>
                                <p className="text-xs font-bold text-slate-200 mt-0.5">Traffic</p>
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() => setTrafficShowMoreDetailsOptions(!trafficShowMoreDetailsOptions)}
                                  className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
                                >
                                  {trafficShowMoreDetailsOptions ? "Hide details" : "Show more options ▾"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Card 4: Budget */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                              <h4 className="font-bold text-slate-100 text-xs">Budget</h4>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                                <h5 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                                  Budget strategy
                                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                                </h5>
                                <span className="text-slate-400 text-xs">^</span>
                              </div>

                              <div className="space-y-2">
                                <div
                                  onClick={() => setTrafficBudgetStrategy("CAMPAIGN")}
                                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${trafficBudgetStrategy === "CAMPAIGN"
                                    ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    name="trafficBudgetStrategy"
                                    checked={trafficBudgetStrategy === "CAMPAIGN"}
                                    onChange={() => setTrafficBudgetStrategy("CAMPAIGN")}
                                    className="mt-0.5 h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 shrink-0"
                                  />
                                  <div>
                                    <p className="text-xs font-bold text-slate-100">Campaign budget</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                      Automatically distribute your budget to the best opportunities across your campaign. Also known as Advantage+ campaign budget. <button type="button" className="text-sky-400 hover:underline font-semibold">About campaign budget</button>
                                    </p>
                                  </div>
                                </div>

                                <div
                                  onClick={() => setTrafficBudgetStrategy("ADSET")}
                                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${trafficBudgetStrategy === "ADSET"
                                    ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    name="trafficBudgetStrategy"
                                    checked={trafficBudgetStrategy === "ADSET"}
                                    onChange={() => setTrafficBudgetStrategy("ADSET")}
                                    className="mt-0.5 h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 shrink-0"
                                  />
                                  <div>
                                    <p className="text-xs font-bold text-slate-100">Ad set budget</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                      Set different bid strategies or budget schedules for each ad set.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2">
                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={trafficShareBudget}
                                    onChange={(e) => setTrafficShareBudget(e.target.checked)}
                                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                                  />
                                  <span>Share up to 20% of your budget with other ad sets</span>
                                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">ℹ</span>
                                </label>
                              </div>

                              <div className="pt-2 border-t border-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-bold text-slate-200 text-xs">Campaign bid strategy</h5>
                                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                                </div>
                                <p className="text-xs font-bold text-slate-300 mt-0.5">Highest volume</p>
                              </div>
                            </div>
                          </div>

                          {/* Card 5: A/B test */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                                <h4 className="font-bold text-slate-100 text-xs">A/B test</h4>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${trafficAbTest ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}`}>
                                  {trafficAbTest ? "On" : "Off"}
                                </span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                <input
                                  type="checkbox"
                                  checked={trafficAbTest}
                                  onChange={(e) => setTrafficAbTest(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience. <button type="button" className="text-sky-400 hover:underline font-semibold">About A/B tests</button>
                            </p>

                            {trafficAbTest && (
                              <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                                <div className="space-y-1">
                                  <label className="block text-xs font-bold text-slate-200">What would you like to test?</label>
                                  <select
                                    value={trafficTestVariable}
                                    onChange={(e) => setTrafficTestVariable(e.target.value)}
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
                                  <select
                                    value={trafficTestDuration}
                                    onChange={(e) => setTrafficTestDuration(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                  >
                                    <option value="7_DAYS">7 days</option>
                                    <option value="3_DAYS">3 days</option>
                                    <option value="5_DAYS">5 days</option>
                                    <option value="14_DAYS">14 days</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <label className="block text-xs font-bold text-slate-200">How do you want to compare performance?</label>
                                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                                  </div>
                                  <ScrollableSelect
                                    value={trafficMetricComparison}
                                    onChange={(val) => setTrafficMetricComparison(val)}
                                    options={[
                                      { value: "COST_PER_POST_ENGAGEMENT", label: "Cost per post engagement" },
                                      { value: "COST_PER_LINK_CLICK", label: "Cost per link click" },
                                      { value: "COST_PER_RESULT", label: "Cost per result" },
                                      { value: "COST_PER_LANDING_PAGE_VIEW", label: "Cost per landing page view" },
                                      { value: "COST_PER_REACH", label: "Cost per 1,000 people reached" },
                                      { value: "COST_PER_THRUPLAY", label: "Cost per ThruPlay" },
                                      { value: "COST_PER_CONVERSATION_STARTED", label: "Cost per messaging conversation started" },
                                      { value: "COST_PER_LEAD", label: "Cost per lead" },
                                      { value: "COST_PER_PURCHASE", label: "Cost per purchase" },
                                      { value: "CPM", label: "Cost per 1,000 impressions (CPM)" },
                                    ]}
                                    className="text-sky-400 font-bold"
                                    maxHeight="max-h-52"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card 6: Special Ad Categories */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                              <h4 className="font-bold text-slate-100 text-xs">Special Ad Categories</h4>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country. <button type="button" className="text-sky-400 hover:underline font-semibold">About Special Ad Categories</button>
                            </p>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-semibold text-slate-400">Categories</label>
                              <p className="text-[10px] text-slate-500">Select the categories that best describe what this campaign will advertise.</p>
                              <select
                                value={trafficSpecialCategory}
                                onChange={(e) => setTrafficSpecialCategory(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
                              >
                                <option value="NONE">Declare category if applicable</option>
                                <option value="CREDIT">Financial products and services</option>
                                <option value="EMPLOYMENT">Employment</option>
                                <option value="HOUSING">Housing</option>
                                <option value="ISSUES_ELECTIONS_POLITICS">Social issues, elections or politics</option>
                              </select>
                            </div>
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

                      {/* Manual Engagement Campaign 3-Step Creation Wizard */}
                      {engagementPresetMode === "manual" && (
                        <div className="pt-4 border-t border-slate-800 space-y-5 animate-fadeIn">
                          {/* Step Navigation Bar */}
                          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                            <button
                              type="button"
                              onClick={() => setManualEngStep(1)}
                              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all ${manualEngStep === 1 ? "bg-sky-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              1. Campaign Level
                            </button>
                            <button
                              type="button"
                              onClick={() => setManualEngStep(2)}
                              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all ${manualEngStep === 2 ? "bg-sky-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              2. Ad Set Level
                            </button>
                            <button
                              type="button"
                              onClick={() => setManualEngStep(3)}
                              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all ${manualEngStep === 3 ? "bg-sky-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}
                            >
                              3. Ad Level
                            </button>
                          </div>

                          {/* ── STEP 1: CAMPAIGN LEVEL ── */}
                          {manualEngStep === 1 && (
                            <div className="space-y-4">
                              {/* Top Banner Card */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-100 text-sm">New Engagement campaign</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">1 Ad set · 1 Ad · In draft</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">In draft</span>
                                  <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">Edit</button>
                                  <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">Review</button>
                                </div>
                              </div>

                              {/* Campaign Name */}
                              <div>
                                <Input label="Campaign name" value={engName} onChange={(e: any) => setEngName(e.target.value)} placeholder="New Engagement campaign" required />
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
                                  <select value={engSpecialCategory} onChange={(e) => setEngSpecialCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500">
                                    <option value="NONE">Declare category if applicable</option>
                                    <option value="CREDIT">Financial products and services (Credit)</option>
                                    <option value="EMPLOYMENT">Employment</option>
                                    <option value="HOUSING">Housing</option>
                                    <option value="ISSUES_ELECTIONS_POLITICS">Social issues, elections or politics</option>
                                  </select>
                                </div>
                              </div>

                              {/* Buying Type */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                <h4 className="font-bold text-slate-200 text-xs">Buying type</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div onClick={() => setEngBuyingType("AUCTION")} className={`p-3 rounded-xl border cursor-pointer ${engBuyingType === "AUCTION" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}>
                                    <p className="text-xs font-bold text-slate-200">Auction</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Flexible bidding across Meta feeds & placements.</p>
                                  </div>
                                  <div onClick={() => setEngBuyingType("RESERVATION")} className={`p-3 rounded-xl border cursor-pointer ${engBuyingType === "RESERVATION" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}>
                                    <p className="text-xs font-bold text-slate-200">Reservation</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Reserved reach and frequency booking.</p>
                                  </div>
                                </div>
                              </div>

                              {/* Budget & Strategy Card */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                                      <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">Advantage+ on</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Automatically distribute your budget to the best opportunities across your campaign. <button type="button" className="text-sky-400 hover:underline">About campaign budget</button></p>
                                  </div>
                                </div>

                                {/* Budget strategy selection */}
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-slate-400">Budget strategy</label>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div onClick={() => setEngBudgetStrategy("CAMPAIGN")} className={`p-3 rounded-xl border cursor-pointer ${engBudgetStrategy === "CAMPAIGN" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}>
                                      <p className="text-xs font-bold text-slate-200">Campaign budget</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">Automatically distribute budget to best opportunities.</p>
                                    </div>
                                    <div onClick={() => setEngBudgetStrategy("ADSET")} className={`p-3 rounded-xl border cursor-pointer ${engBudgetStrategy === "ADSET" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}>
                                      <p className="text-xs font-bold text-slate-200">Ad set budget</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">Set different bid strategies or budget schedules for each ad set.</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Budget Mode & Currency Amount */}
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-semibold text-slate-400">Budget</label>
                                  <div className="grid grid-cols-2 gap-3">
                                    <select value={engBudgetMode} onChange={(e) => setEngBudgetMode(e.target.value as any)} className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500">
                                      <option value="DAILY">Daily budget</option>
                                      <option value="LIFETIME">Lifetime budget</option>
                                    </select>
                                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2">
                                      <span className="text-xs font-bold text-slate-400">₹</span>
                                      <input type="number" value={engBudgetAmount} onChange={(e) => setEngBudgetAmount(e.target.value)} className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none" />
                                      <span className="text-[10px] font-bold text-slate-500">INR</span>
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                                    You'll spend an average of <span className="font-bold text-slate-200">₹{Number(engBudgetAmount || 1000).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> per day. Your maximum daily spend is <span className="font-bold text-slate-200">₹{(Number(engBudgetAmount || 1000) * 1.75).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> and your maximum weekly spend is <span className="font-bold text-slate-200">₹{(Number(engBudgetAmount || 1000) * 7).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>. <button type="button" className="text-sky-400 hover:underline">About daily budget</button>
                                  </div>
                                  <p className="text-[11px] text-amber-400/80">⚠ Your spending may exceed ₹{Number(engBudgetAmount || 1000).toLocaleString("en-IN")} the first few days.</p>
                                </div>

                                {/* Campaign bid strategy */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-semibold text-slate-400">Campaign bid strategy</label>
                                    <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Edit</button>
                                  </div>
                                  <select value={engBidStrategy} onChange={(e) => setEngBidStrategy(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                    <option value="HIGHEST_VOLUME">Highest volume (Get the most results for your budget)</option>
                                    <option value="COST_CAP">Cost per result goal (Aim for a certain cost per result while maximising volume)</option>
                                    <option value="BID_CAP">Bid cap (Set the highest that you want to bid in any auction)</option>
                                  </select>
                                </div>

                                <button type="button" onClick={() => setEngShowMoreSettings(!engShowMoreSettings)} className="text-[11px] text-sky-400 hover:underline font-semibold">
                                  {engShowMoreSettings ? "Hide settings" : "Show more settings"}
                                </button>

                                {/* Expanded Show More Settings */}
                                {engShowMoreSettings && (
                                  <div className="pt-3 border-t border-slate-800 space-y-4 animate-fadeIn">
                                    {/* Budget scheduling */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h5 className="font-bold text-slate-200 text-xs">Budget scheduling</h5>
                                          <p className="text-[11px] text-slate-400">Increase your budget during specific days or times.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" checked={engBudgetScheduling} onChange={(e) => setEngBudgetScheduling(e.target.checked)} className="sr-only peer" />
                                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                                        </label>
                                      </div>
                                    </div>

                                    {/* Ad scheduling */}
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-slate-200 text-xs">Ad scheduling</h5>
                                        <button type="button" className="text-[11px] text-sky-400 hover:underline">Edit</button>
                                      </div>
                                      <p className="text-xs font-medium text-slate-300">Run ads all the time</p>
                                    </div>

                                    {/* Campaign frequency control */}
                                    <div className="space-y-2.5 pt-2 border-t border-slate-800">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h5 className="font-bold text-slate-200 text-xs">Campaign frequency control</h5>
                                          <p className="text-[11px] text-slate-400">Set a frequency if you have a specific number of times that you want people to see your ads. <button type="button" className="text-sky-400 hover:underline">Learn more</button></p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" checked={engFrequencyControl} onChange={(e) => setEngFrequencyControl(e.target.checked)} className="sr-only peer" />
                                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                                        </label>
                                      </div>

                                      {engFrequencyControl && (
                                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-fadeIn">
                                          <h6 className="font-bold text-slate-200 text-xs">Frequency control</h6>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div onClick={() => setEngFrequencyMode("TARGET")} className={`p-3 rounded-xl border cursor-pointer ${engFrequencyMode === "TARGET" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-950 border-slate-800"}`}>
                                              <p className="text-xs font-bold text-slate-200">Target</p>
                                              <p className="text-[10px] text-slate-400 mt-0.5">The average number of times that you want people to see your ads</p>
                                            </div>
                                            <div onClick={() => setEngFrequencyMode("CAP")} className={`p-3 rounded-xl border cursor-pointer ${engFrequencyMode === "CAP" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-950 border-slate-800"}`}>
                                              <p className="text-xs font-bold text-slate-200">Cap</p>
                                              <p className="text-[10px] text-slate-400 mt-0.5">The maximum number of times that you want people to see your ads</p>
                                            </div>
                                          </div>

                                          {engFrequencyMode === "CAP" && (
                                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                              <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                                                <input type="number" value={engFrequencyCapCount} onChange={(e) => setEngFrequencyCapCount(Number(e.target.value))} min={1} className="w-16 bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1 text-xs font-bold text-sky-400 text-center focus:outline-none" />
                                                <span>times every</span>
                                                <input type="number" value={engFrequencyCapDays} onChange={(e) => setEngFrequencyCapDays(Number(e.target.value))} min={1} className="w-16 bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1 text-xs font-bold text-sky-400 text-center focus:outline-none" />
                                                <span>days</span>
                                              </div>
                                              <p className="text-[11px] text-slate-400">As a maximum, we'll aim to stay under {engFrequencyCapCount} impressions every {engFrequencyCapDays} days.</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* A/B Test */}
                                    <div className="space-y-2.5 pt-2 border-t border-slate-800">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h5 className="font-bold text-slate-200 text-xs">A/B test</h5>
                                          <p className="text-[11px] text-slate-400">Help improve ad performance by comparing versions to see what works best. <button type="button" className="text-sky-400 hover:underline">About A/B tests</button></p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" checked={engAbTest} onChange={(e) => setEngAbTest(e.target.checked)} className="sr-only peer" />
                                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Campaign Score Widget */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-16 h-16 shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="74 26" strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-emerald-400">74</span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-200">Campaign score</p>
                                    <p className="text-[11px] text-amber-400 font-semibold mt-0.5">Your campaign has room to improve.</p>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">You can lower costs by 9% by selecting more destinations (<span className="text-emerald-400 font-bold">+ 26 points</span>)</p>
                                  </div>
                                </div>
                              </div>

                              {/* Next Step Button */}
                              <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setManualEngStep(2)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-sky-500/20">
                                  Proceed to Step 2: Ad Set Level →
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ── STEP 2: AD SET LEVEL ── */}
                          {manualEngStep === 2 && (
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-100 text-sm">{engAdSetName || "New Engagement ad set"}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">Hierarchy: {engName || "New Engagement campaign"} → Ad Set</p>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">In draft</span>
                              </div>

                              <div>
                                <Input label="Ad set name" value={engAdSetName} onChange={(e: any) => setEngAdSetName(e.target.value)} placeholder="New Engagement ad set" required />
                              </div>

                              {/* Conversion Location Dropdown */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-200 text-xs">Conversion location</h4>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Choose where you want to drive engagement.</p>
                                </div>
                                <select value={engConversionLocation} onChange={(e) => setEngConversionLocation(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                  <option value="MESSAGING_APPS">Messaging apps (Messenger, WhatsApp or Instagram)</option>
                                  <option value="ON_AD">On your ad (Video views, Post engagement, Event responses)</option>
                                  <option value="CALLS">Calls (Get people to call your business)</option>
                                  <option value="WEBSITE">Website (Get people to engage with your website)</option>
                                  <option value="APP">App (Get people to engage with your app)</option>
                                  <option value="INSTAGRAM_FACEBOOK">Instagram or Facebook (Engage with profile or Page)</option>
                                </select>

                                {/* Engagement Type selector when "On your ad" is selected */}
                                {engConversionLocation === "ON_AD" && (
                                  <div className="pt-2 border-t border-slate-800 space-y-2 animate-fadeIn">
                                    <label className="block text-[11px] font-semibold text-slate-400">Engagement type</label>
                                    <select value={engEngagementType} onChange={(e) => setEngEngagementType(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                      <option value="VIDEO_VIEWS">Video views</option>
                                      <option value="POST_ENGAGEMENT">Post engagement</option>
                                      <option value="EVENT_RESPONSES">Event responses</option>
                                      <option value="REMINDERS_SET">Reminders set</option>
                                    </select>
                                  </div>
                                )}

                                {/* Performance Goal dropdown */}
                                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                                  <label className="block text-[11px] font-semibold text-slate-400">Performance goal</label>
                                  <select value={engPerformanceGoal} onChange={(e) => setEngPerformanceGoal(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                    {engEngagementType === "VIDEO_VIEWS" ? (
                                      <>
                                        <option value="MAXIMIZE_THRUPLAY_VIEWS">Maximise ThruPlay views (Watch entire video &lt;15s or &gt;15s)</option>
                                        <option value="MAXIMIZE_2SEC_CONTINUOUS_VIEWS">Maximise 2-second continuous video plays</option>
                                      </>
                                    ) : (
                                      <>
                                        <option value="MAXIMIZE_CONVERSATIONS">Maximise number of conversations</option>
                                        <option value="MAXIMIZE_REPLIES">Maximise replies</option>
                                      </>
                                    )}
                                  </select>
                                </div>
                              </div>

                              {/* Advantage+ Audience & Targeting Controls */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-200 text-xs">Audience</h4>
                                      <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">Advantage+ on</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Set up your audience using controls and suggestions.</p>
                                  </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-slate-800">
                                  <div className="space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-400">Locations (Inclusion)</label>
                                    <input type="text" value={engLocations.join(", ")} onChange={(e) => setEngLocations(e.target.value.split(","))} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none" placeholder="India" />
                                    <p className="text-[10px] text-amber-400/80">To run ads in India, declare if your ads are related to securities and investments.</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-400">Minimum age</label>
                                      <input type="number" value={engMinAge} onChange={(e) => setEngMinAge(Number(e.target.value))} min={18} max={65} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none" />
                                      <p className="text-[10px] text-slate-500">Unknown age on WhatsApp: Excluded</p>
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-400">Languages</label>
                                      <input type="text" value="All languages" disabled className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed" />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-400">Detailed targeting (Demographics, Interests, Behaviors)</label>
                                    <input type="text" value={engDetailedTargeting} onChange={(e) => setEngDetailedTargeting(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none" placeholder="Search interests, demographics or Household Income in India..." />
                                  </div>
                                </div>
                              </div>

                              {/* Placements */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-200 text-xs">Placements</h4>
                                      <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">Advantage+ on</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">We'll automatically show ads in the places where people are likely to respond. Includes **WhatsApp Status** placement.</p>
                                  </div>
                                </div>
                              </div>

                              {/* Navigation Buttons */}
                              <div className="flex items-center justify-between pt-2">
                                <button type="button" onClick={() => setManualEngStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
                                  ← Back to Step 1
                                </button>
                                <button type="button" onClick={() => setManualEngStep(3)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-sky-500/20">
                                  Proceed to Step 3: Ad Level →
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ── STEP 3: AD LEVEL ── */}
                          {manualEngStep === 3 && (
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-100 text-sm">{engAdName || "New Engagement ad"}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">Hierarchy: {engName || "New Engagement campaign"} → {engAdSetName} → Ad</p>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">In draft</span>
                              </div>

                              <div>
                                <Input label="Ad name" value={engAdName} onChange={(e: any) => setEngAdName(e.target.value)} placeholder="New Engagement ad" required />
                              </div>

                              {/* Connected Identity Profiles */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-200 text-xs">Identity & Connected Accounts</h4>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Profiles fetched dynamically from your connected Meta Ad Account.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facebook Page *</label>
                                    <select value={engFacebookPageId} onChange={(e) => setEngFacebookPageId(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                      {fetchedPages.length > 0 ? (
                                        fetchedPages.map((p: any) => (
                                          <option key={p.id} value={p.id}>📄 {p.name}</option>
                                        ))
                                      ) : (
                                        <option value="">JISNU Digital Solutions Pvt.Ltd</option>
                                      )}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instagram Account</label>
                                    <select value={engInstagramAccountId} onChange={(e) => setEngInstagramAccountId(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                      {fetchedIgAccounts.length > 0 ? (
                                        fetchedIgAccounts.map((ig: any) => (
                                          <option key={ig.id} value={ig.id}>📸 @{ig.username}</option>
                                        ))
                                      ) : (
                                        <option value="jisnu_digitalsolution_pvt_ltd">📸 @jisnu_digitalsolution_pvt_ltd</option>
                                      )}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Threads Profile</label>
                                    <select value={engThreadsProfile} onChange={(e) => setEngThreadsProfile(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                      <option value="USE_INSTAGRAM">Use Instagram account</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">WhatsApp Phone Number</label>
                                    <select value={engWhatsappNumber} onChange={(e) => setEngWhatsappNumber(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                      {fetchedWaNumbers.length > 0 ? (
                                        fetchedWaNumbers.map((w: any, idx: number) => (
                                          <option key={idx} value={w.displayPhoneNumber}>💬 {w.verifiedName || w.displayPhoneNumber} ({w.displayPhoneNumber})</option>
                                        ))
                                      ) : (
                                        <option value="+91 77099 36965">💬 Jisnu Digital Solutions (+91 77099 36965)</option>
                                      )}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Destination & Multi-Advertiser */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-200 text-xs">Destination</h4>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Tell us where to send people immediately after they tap or click your ad.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div onClick={() => setEngDestinationType("MESSAGING_APPS")} className={`p-3 rounded-xl border cursor-pointer text-center ${engDestinationType === "MESSAGING_APPS" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}>
                                    <p className="text-xs font-bold text-slate-200">Messaging apps</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">WhatsApp / IG / Messenger</p>
                                  </div>
                                  <div onClick={() => setEngDestinationType("INSTANT_EXPERIENCE")} className={`p-3 rounded-xl border cursor-pointer text-center ${engDestinationType === "INSTANT_EXPERIENCE" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}>
                                    <p className="text-xs font-bold text-slate-200">Instant Experience</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Fast-loading mobile format</p>
                                  </div>
                                  <div onClick={() => setEngDestinationType("WEBSITE")} className={`p-3 rounded-xl border cursor-pointer text-center ${engDestinationType === "WEBSITE" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}>
                                    <p className="text-xs font-bold text-slate-200">Website</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Send to landing page</p>
                                  </div>
                                </div>
                              </div>

                              {/* Media & Copy Setup */}
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                                <h4 className="font-bold text-slate-200 text-xs">Ad creative & copy</h4>

                                {engEngagementType === "VIDEO_VIEWS" && (
                                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-semibold flex items-center gap-2">
                                    <span>🎬</span> A video is required for Video Views. Upload or select a video to publish.
                                  </div>
                                )}

                                <div>
                                  <Input label="Media URL (Image or Video)" value={engCreativeMediaUrl} onChange={(e: any) => setEngCreativeMediaUrl(e.target.value)} placeholder="https://example.com/video.mp4" required />
                                </div>

                                <div>
                                  <Input label="Primary Text (Main Caption)" value={engPrimaryText} onChange={(e: any) => setEngPrimaryText(e.target.value)} placeholder="Transform your business with high-converting Meta ads..." required />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <Input label="Headline" value={engHeadline} onChange={(e: any) => setEngHeadline(e.target.value)} placeholder="Chat with us on WhatsApp" required />
                                  <Input label="Description (Optional)" value={engDescription} onChange={(e: any) => setEngDescription(e.target.value)} placeholder="Get instant quotes and answers" />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Call to Action (CTA)</label>
                                  <select value={engCallToAction} onChange={(e) => setEngCallToAction(e.target.value)} className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500">
                                    <option value="WHATSAPP_MESSAGE">Send WhatsApp Message</option>
                                    <option value="SEND_MESSAGE">Send Message</option>
                                    <option value="LEARN_MORE">Learn More</option>
                                    <option value="WATCH_MORE">Watch More</option>
                                  </select>
                                </div>

                                <div>
                                  <Input label="URL Parameters (UTM String)" value={engUrlParameters} onChange={(e: any) => setEngUrlParameters(e.target.value)} placeholder="key1=value1&key2=value2" />
                                </div>
                              </div>

                              {/* Navigation & Final Launch Button */}
                              <div className="flex items-center justify-between pt-2">
                                <button type="button" onClick={() => setManualEngStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
                                  ← Back to Step 2
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setCreatingCamp(true);
                                    try {
                                      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          organizationId: orgId,
                                          name: engName,
                                          objective: "OUTCOME_ENGAGEMENT",
                                          buyingType: engBuyingType,
                                          specialAdCategory: engSpecialCategory,
                                          cboEnabled: true,
                                          bidStrategy: engBidStrategy,
                                          dailyBudget: Number(engBudgetAmount),
                                          adSetName: engAdSetName,
                                          conversionLocation: engConversionLocation,
                                          engagementType: engEngagementType,
                                          performanceGoal: engPerformanceGoal,
                                          adName: engAdName,
                                          facebookPageId: engFacebookPageId,
                                          instagramAccountId: engInstagramAccountId,
                                          whatsappNumber: engWhatsappNumber,
                                          creativeHeadline: engHeadline || "Chat with us",
                                          creativeBody: engPrimaryText || "Transform your business with high-converting Meta ads",
                                          creativeDescription: engDescription,
                                          creativeMediaUrl: engCreativeMediaUrl || "https://example.com/video.mp4",
                                          callToAction: engCallToAction,
                                          utmParameters: engUrlParameters,
                                        }),
                                      });
                                      const data = await res.json();
                                      if (!res.ok) throw new Error(data.error || "Failed to create campaign");
                                      showToast("Engagement Campaign created & published live to Meta! 🚀");
                                      setShowCreateModal(false);
                                      handleSyncLive();
                                    } catch (err: any) {
                                      showToast(`Launch failed: ${err.message}`);
                                    } finally {
                                      setLaunching(false);
                                    }
                                  }}
                                  disabled={launching}
                                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                                >
                                  {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Live Engagement Campaign 🚀"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* LEADS OBJECTIVE — STEP 2: Start from recent or new campaign */}
                  {campObjective === "OUTCOME_LEADS" && (
                    <div className="space-y-4">
                      {/* CHOICE SCREEN */}
                      {leadsSubStep === "CHOICE" && (
                        <div className="space-y-4 animate-fadeIn">
                          <div>
                            <h4 className="font-bold text-slate-100 text-sm">Save time and start from a recent leads campaign?</h4>
                            <p className="text-xs text-slate-400 mt-1">Pick a previous campaign to pre-fill settings, or start fresh.</p>
                          </div>

                          {/* Option 1: Recent campaign (Suggested) */}
                          <div
                            onClick={() => {
                              setLeadsStartMode("RECENT");
                              setLeadsSubStep("CONFIG");
                            }}
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
                                onChange={() => {
                                  setLeadsStartMode("RECENT");
                                  setLeadsSubStep("CONFIG");
                                }}
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

                          {/* Option 2: New campaign */}
                          <div
                            onClick={() => {
                              setLeadsStartMode("NEW");
                              setLeadsSubStep("CONFIG");
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${leadsStartMode === "NEW"
                              ? "bg-sky-500/10 border-sky-500/50"
                              : "bg-slate-950 border-slate-800 hover:border-slate-600"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <input
                                  type="radio"
                                  name="leadsStartMode"
                                  checked={leadsStartMode === "NEW"}
                                  onChange={() => {
                                    setLeadsStartMode("NEW");
                                    setLeadsSubStep("CONFIG");
                                  }}
                                  className="accent-sky-500 w-4 h-4 shrink-0"
                                />
                                <p className={`text-sm font-bold ${leadsStartMode === "NEW" ? "text-sky-400" : "text-slate-300"
                                  }`}>
                                  No, start from a new campaign
                                </p>
                              </div>
                              <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 hover:bg-sky-500/20">
                                Continue →
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CONFIGURATION SCREEN FOR NEW LEADS CAMPAIGN */}
                      {leadsSubStep === "CONFIG" && (
                        <div className="space-y-4 animate-fadeIn">
                          {/* Top Navigation Header */}
                          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <div>
                              <button
                                type="button"
                                onClick={() => setLeadsSubStep("CHOICE")}
                                className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mb-1"
                              >
                                ← Change selection
                              </button>
                              <h3 className="font-bold text-slate-100 text-sm">New Leads campaign</h3>
                              <p className="text-xs text-slate-400 mt-0.5">1 Ad set · 1 Ad · In draft</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
                          </div>

                          {/* Campaign name input */}
                          <div>
                            <Input label="Campaign name" value={campName} onChange={(e: any) => setCampName(e.target.value)} placeholder="New Leads campaign" required />
                          </div>

                          {/* Advantage+ toggle & Budget card */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-200 text-xs">Budget</h4>
                                  <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                                    {leadsAdvantagePlus ? "Advantage+ on" : "Advantage+ off"}
                                  </span>
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                    className="w-full bg-transparent text-xs text-slate-100 focus:outline-none font-bold" />
                                  <span className="text-[10px] font-bold text-slate-500">INR</span>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                                You'll spend an average of <span className="font-bold text-slate-200">₹{Number(leadsBudget || 1000).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> per day.
                                Your maximum daily spend is <span className="font-bold text-slate-200">₹{(Number(leadsBudget || 1000) * 1.75).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> and
                                your maximum weekly spend is <span className="font-bold text-slate-200">₹{(Number(leadsBudget || 1000) * 7).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>.
                                <button type="button" className="ml-1 text-sky-400 hover:underline">About daily budget</button>
                              </div>
                              <p className="text-[11px] text-amber-400/80">⚠ Your spending may exceed ₹{Number(leadsBudget || 1000).toLocaleString("en-IN")} the first few days.</p>
                            </div>

                            {/* Campaign bid strategy */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-400">Campaign bid strategy</label>
                                <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Edit</button>
                              </div>
                              <select value={leadsBidStrategy}
                                onChange={(e) => setLeadsBidStrategy(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-semibold">
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

                  {/* AWARENESS OBJECTIVE — STEP 2 CAMPAIGN PARAMETERS VIEW */}
                  {campObjective === "OUTCOME_AWARENESS" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-slate-100 text-sm">New Awareness campaign</h3>
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

                      {/* Live Video Ad Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${awarenessLiveVideo ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}`}>
                                {awarenessLiveVideo ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={awarenessLiveVideo}
                              onChange={(e) => setAwarenessLiveVideo(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {awarenessLiveVideo && (
                          <div className="pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                            <div>
                              <h5 className="font-bold text-slate-200 text-xs">Live video location</h5>
                              <p className="text-[11px] text-slate-400 mt-0.5">Choose where you'll be running your live video.</p>
                            </div>
                            <select
                              value={awarenessLiveVideoLocation}
                              onChange={(e) => setAwarenessLiveVideoLocation(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-500"
                            >
                              <option value="FACEBOOK">Facebook</option>
                              <option value="INSTAGRAM">Instagram</option>
                              <option value="AUDIENCE_NETWORK">Audience Network</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Advantage+ Campaign Budget Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${awarenessAdvantageBudget ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {awarenessAdvantageBudget ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Distribute your budget across ad sets to get more results. You can control spending for each ad set.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">About Advantage+ campaign budget</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={awarenessAdvantageBudget}
                              onChange={(e) => setAwarenessAdvantageBudget(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {awarenessAdvantageBudget && (
                          <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                            {/* Budget Mode + Amount */}
                            <div className="space-y-2">
                              <h5 className="font-bold text-slate-200 text-xs">Budget</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Budget mode</label>
                                  <select
                                    value={awarenessBudgetMode}
                                    onChange={(e) => setAwarenessBudgetMode(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                  >
                                    <option value="LIFETIME">Lifetime budget</option>
                                    <option value="DAILY">Daily budget</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Amount</label>
                                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 focus-within:border-sky-500">
                                    <span className="text-xs font-bold text-slate-400">₹</span>
                                    <input
                                      type="text"
                                      value={awarenessBudgetAmount}
                                      onChange={(e) => setAwarenessBudgetAmount(e.target.value)}
                                      className="w-full bg-transparent text-xs font-mono font-bold text-slate-100 focus:outline-none"
                                    />
                                    <span className="text-[11px] font-bold text-slate-400">INR</span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                You'll spend no more than <span className="font-bold text-slate-200">₹{Number(awarenessBudgetAmount || 33473.90).toLocaleString("en-IN")}</span> during the lifetime of your campaign.{" "}
                                <button type="button" className="text-sky-400 hover:underline font-semibold">About lifetime budget</button>
                              </p>
                            </div>

                            {/* Campaign Bid Strategy */}
                            <div className="pt-2 border-t border-slate-800 space-y-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-bold text-slate-200 text-xs">Campaign bid strategy</h5>
                                  <p className="text-xs font-bold text-sky-400 mt-0.5">Highest volume</p>
                                </div>
                                <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">Edit</button>
                              </div>
                            </div>

                            {/* Budget scheduling */}
                            <div className="pt-2 border-t border-slate-800 space-y-2">
                              <h5 className="font-bold text-slate-200 text-xs">Budget scheduling</h5>
                              <p className="text-[11px] text-slate-400">Increase your budget during specific days or times.</p>
                              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={awarenessScheduleBudgetIncreases}
                                  onChange={(e) => setAwarenessScheduleBudgetIncreases(e.target.checked)}
                                  className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                                />
                                Schedule budget increases
                              </label>
                            </div>

                            {/* Ad scheduling */}
                            <div className="pt-2 border-t border-slate-800 space-y-1">
                              <h5 className="font-bold text-slate-200 text-xs">Ad scheduling</h5>
                              <p className="text-xs font-semibold text-slate-300">Run ads all the time</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Campaign Frequency Control Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${awarenessFrequencyControl ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {awarenessFrequencyControl ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Set a target frequency for lifetime budget. Set a frequency if you have a specific number of times that you want people to see your ads throughout your campaign.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={awarenessFrequencyControl}
                              onChange={(e) => setAwarenessFrequencyControl(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {awarenessFrequencyControl && (
                          <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                            <h5 className="font-bold text-slate-200 text-xs">Frequency control</h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div
                                onClick={() => setAwarenessFrequencyMode("TARGET")}
                                className={`p-3 rounded-xl border cursor-pointer ${awarenessFrequencyMode === "TARGET" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}
                              >
                                <p className="text-xs font-bold text-slate-200">Target</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">The average number of times that you want people to see your ads</p>
                              </div>

                              <div
                                onClick={() => setAwarenessFrequencyMode("CAP")}
                                className={`p-3 rounded-xl border cursor-pointer ${awarenessFrequencyMode === "CAP" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800"}`}
                              >
                                <p className="text-xs font-bold text-slate-200">Cap</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">The maximum number of times that you want people to see your ads</p>
                              </div>
                            </div>

                            {/* Cap inputs */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                                <input
                                  type="number"
                                  value={awarenessFrequencyCapCount}
                                  onChange={(e) => setAwarenessFrequencyCapCount(Number(e.target.value))}
                                  min={1}
                                  className="w-16 bg-slate-950 border border-slate-700/60 rounded-lg px-2 py-1 text-xs font-bold text-sky-400 text-center focus:outline-none"
                                />
                                <span>times every</span>
                                <input
                                  type="number"
                                  value={awarenessFrequencyCapDays}
                                  onChange={(e) => setAwarenessFrequencyCapDays(Number(e.target.value))}
                                  min={1}
                                  className="w-16 bg-slate-950 border border-slate-700/60 rounded-lg px-2 py-1 text-xs font-bold text-sky-400 text-center focus:outline-none"
                                />
                                <span>days</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                As a maximum, we'll aim to stay under {awarenessFrequencyCapCount} impressions every {awarenessFrequencyCapDays} days.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* A/B Test Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${awarenessAbTest ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {awarenessAbTest ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">About A/B tests</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={awarenessAbTest}
                              onChange={(e) => setAwarenessAbTest(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {awarenessAbTest && (
                          <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">What would you like to test?</label>
                              <select
                                value={awarenessTestVariable}
                                onChange={(e) => setAwarenessTestVariable(e.target.value)}
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
                                  value={awarenessTestDuration}
                                  onChange={(e) => setAwarenessTestDuration(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                >
                                  <option value="7_DAYS">7 days</option>
                                  <option value="3_DAYS">3 days</option>
                                  <option value="5_DAYS">5 days</option>
                                  <option value="14_DAYS">14 days</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">How do you want to compare performance?</label>
                              <select
                                value={awarenessMetricComparison}
                                onChange={(e) => setAwarenessMetricComparison(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500 max-h-48"
                              >
                                {abTestPerformanceComparisonOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
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

                      {/* Live Video Ad Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${appPromoLiveVideo ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}`}>
                                {appPromoLiveVideo ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={appPromoLiveVideo}
                              onChange={(e) => setAppPromoLiveVideo(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {appPromoLiveVideo && (
                          <div className="pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                            <div>
                              <h5 className="font-bold text-slate-200 text-xs">Live video location</h5>
                              <p className="text-[11px] text-slate-400 mt-0.5">Choose where you'll be running your live video.</p>
                            </div>
                            <select
                              value={appPromoLiveVideoLocation}
                              onChange={(e) => setAppPromoLiveVideoLocation(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-500"
                            >
                              <option value="FACEBOOK">Facebook</option>
                              <option value="INSTAGRAM">Instagram</option>
                              <option value="AUDIENCE_NETWORK">Audience Network</option>
                              <option value="FACEBOOK_INSTAGRAM">Facebook & Instagram</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Campaign details Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Campaign details</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Buying type</label>
                            <select
                              value={buyingType}
                              onChange={(e: any) => setBuyingType(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-sky-500"
                            >
                              <option value="AUCTION">Auction</option>
                              <option value="RESERVED">Reservation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Campaign objective</label>
                            <div className="p-2 border border-slate-700/60 rounded-xl bg-slate-900 text-xs font-bold text-sky-400 flex items-center gap-1.5 h-[34px]">
                              <Users className="w-3.5 h-3.5" />
                              App promotion
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppPromoShowMoreSettings(!appPromoShowMoreSettings)}
                          className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          {appPromoShowMoreSettings ? "Hide details" : "Show more settings"}
                        </button>

                        {appPromoShowMoreSettings && (
                          <div className="pt-3 border-t border-slate-800 space-y-3 text-xs text-slate-300 animate-fadeIn">
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                              <p className="font-semibold text-slate-200">Campaign spend limit</p>
                              <p className="text-[11px] text-slate-400">None set. Set a maximum spend limit for this campaign.</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                              <p className="font-semibold text-slate-200">Ad volume limit</p>
                              <p className="text-[11px] text-slate-400">Standard Meta Page limits apply (max 250 ads).</p>
                            </div>
                          </div>
                        )}
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

                      {/* Budget & Advantage+ Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Budget</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Advantage+ on • Automatically distribute your budget to the best opportunities across your campaign. Also known as Advantage+ campaign budget. <button type="button" className="text-sky-400 hover:underline font-semibold">About campaign budget</button>
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
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
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
                            <p>You'll spend an average of <span className="font-bold text-slate-200">₹{Number(appPromoBudget).toLocaleString("en-IN")}.00 per day</span>. Your maximum daily spend is <span className="font-bold text-slate-200">₹{(Number(appPromoBudget) * 1.75).toLocaleString("en-IN")}.00</span> and your maximum weekly spend is <span className="font-bold text-slate-200">₹{(Number(appPromoBudget) * 7).toLocaleString("en-IN")}.00</span>.</p>
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
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500 max-h-48"
                              >
                                {abTestPerformanceComparisonOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
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

                      {/* Campaign Score Card */}
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

                  {/* SALES OBJECTIVE STEP 2 SETUP FLOW */}
                  {campObjective === "OUTCOME_SALES" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-slate-100 text-sm">New Sales campaign</h3>
                            <p className="text-xs text-slate-400 mt-0.5">1 Ad set • 1 Ad</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              In draft
                            </span>
                            <button
                              type="button"
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live Video Ad Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${salesLiveVideo ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {salesLiveVideo ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={salesLiveVideo}
                              onChange={(e) => setSalesLiveVideo(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {salesLiveVideo && (
                          <div className="pt-2 space-y-1 animate-fadeIn">
                            <label className="block text-[11px] font-semibold text-slate-400">Live video location</label>
                            <p className="text-[10px] text-slate-500">Choose where you'll be running your live video.</p>
                            <select
                              value={salesLiveVideoLocation}
                              onChange={(e) => setSalesLiveVideoLocation(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-500"
                            >
                              <option value="FACEBOOK">Facebook</option>
                              <option value="INSTAGRAM">Instagram</option>
                              <option value="AUDIENCE_NETWORK">Audience Network</option>
                              <option value="FACEBOOK_INSTAGRAM">Facebook & Instagram</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Campaign Details Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Campaign details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Buying type</label>
                            <select
                              value={buyingType}
                              onChange={(e: any) => setBuyingType(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                              <option value="AUCTION">Auction</option>
                              <option value="RESERVED">Reservation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Campaign objective</label>
                            <input
                              type="text"
                              disabled
                              value="Sales"
                              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advantage+ Catalogue Ads Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Advantage+ catalogue ads</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${salesAdvantageCatalogue ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {salesAdvantageCatalogue ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Use your product catalogue to dynamically personalize ads for shoppers based on interest and browsing history.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={salesAdvantageCatalogue}
                              onChange={(e) => setSalesAdvantageCatalogue(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* Budget & Bidding Strategy Card (Below Advantage+ Catalogue Ads) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-100 text-xs">Budget</h4>
                              <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                                {salesAdvantagePlus ? "Advantage+ on" : "Advantage+ off"}
                              </span>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={salesAdvantagePlus}
                              onChange={(e) => setSalesAdvantagePlus(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {/* Budget Strategy Radio Cards */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-400">Budget strategy</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div
                              onClick={() => setSalesBudgetStrategy("CAMPAIGN")}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${salesBudgetStrategy === "CAMPAIGN"
                                ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                                : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  checked={salesBudgetStrategy === "CAMPAIGN"}
                                  onChange={() => setSalesBudgetStrategy("CAMPAIGN")}
                                  className="accent-sky-500 mt-0.5"
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-200">Campaign budget</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                                    Automatically distribute your budget to the best opportunities across your campaign. Also known as Advantage+ campaign budget.{" "}
                                    <button type="button" className="text-sky-400 hover:underline">
                                      About campaign budget
                                    </button>
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              onClick={() => setSalesBudgetStrategy("ADSET")}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${salesBudgetStrategy === "ADSET"
                                ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                                : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  checked={salesBudgetStrategy === "ADSET"}
                                  onChange={() => setSalesBudgetStrategy("ADSET")}
                                  className="accent-sky-500 mt-0.5"
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-200">Ad set budget</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                                    Set different bid strategies or budget schedules for each ad set.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Budget Amount & Calculations */}
                        <div className="space-y-2 pt-1 border-t border-slate-800/60">
                          <label className="block text-[11px] font-semibold text-slate-400">Budget</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1">Budget mode</label>
                              <select
                                value={salesBudgetMode}
                                onChange={(e) => setSalesBudgetMode(e.target.value as "DAILY" | "LIFETIME")}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                              >
                                <option value="DAILY">Daily budget</option>
                                <option value="LIFETIME">Lifetime budget</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1">Amount</label>
                              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2">
                                <span className="text-xs font-bold text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={salesBudget}
                                  onChange={(e) => setSalesBudget(e.target.value)}
                                  className="w-full bg-transparent text-xs text-slate-100 font-bold focus:outline-none"
                                />
                                <span className="text-[10px] font-bold text-slate-500">INR</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                            You'll spend an average of{" "}
                            <span className="font-bold text-slate-200">
                              ₹{Number(salesBudget || 800).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>{" "}
                            per day. Your maximum daily spend is{" "}
                            <span className="font-bold text-slate-200">
                              ₹{(Number(salesBudget || 800) * 1.75).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>{" "}
                            and your maximum weekly spend is{" "}
                            <span className="font-bold text-slate-200">
                              ₹{(Number(salesBudget || 800) * 7).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            .{" "}
                            <button type="button" className="text-sky-400 hover:underline">
                              About daily budget
                            </button>
                          </div>

                          <p className="text-[11px] text-amber-400/80">
                            ⚠ Your spending may exceed ₹{Number(salesBudget || 800).toLocaleString("en-IN", { minimumFractionDigits: 2 })} the first few days.
                          </p>
                        </div>

                        {/* Campaign Bid Strategy */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-400">Campaign bid strategy</label>
                            <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">
                              Edit
                            </button>
                          </div>
                          <select
                            value={salesBidStrategy}
                            onChange={(e) => setSalesBidStrategy(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                          >
                            <option value="HIGHEST_VOLUME">Highest volume</option>
                            <option value="COST_CAP">Cost per result goal</option>
                            <option value="BID_CAP">Bid cap</option>
                          </select>
                          <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-0.5">
                            Show more settings
                          </button>
                        </div>

                        {/* Budget Scheduling & Ad Scheduling Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 text-xs">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">Budget scheduling</span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {salesBudgetScheduling ? "Scheduled" : "None selected"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">Increase budget during specific days/times.</p>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">Ad scheduling</span>
                              <span className="text-[10px] text-emerald-400 font-bold">Run ads all the time</span>
                            </div>
                            <p className="text-[11px] text-slate-400">Ads run on continuous delivery schedule.</p>
                          </div>
                        </div>
                      </div>

                      {/* A/B Test Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${salesAbTest ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {salesAbTest ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">About A/B tests</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={salesAbTest}
                              onChange={(e) => setSalesAbTest(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {/* Expanded A/B Test Options */}
                        {salesAbTest && (
                          <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">What would you like to test?</label>
                              <select
                                value={salesTestVariable}
                                onChange={(e) => setSalesTestVariable(e.target.value)}
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
                              <p className="text-[11px] text-slate-400">Your test will run for this many days or until your ad set has ended.</p>
                              <select
                                value={salesTestDuration}
                                onChange={(e) => setSalesTestDuration(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                              >
                                <option value="7_DAYS">7 days</option>
                                <option value="3_DAYS">3 days</option>
                                <option value="14_DAYS">14 days</option>
                                <option value="30_DAYS">30 days</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">How do you want to compare performance?</label>
                              <select
                                value={salesMetricComparison}
                                onChange={(e) => setSalesMetricComparison(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500 max-h-48"
                              >
                                {abTestPerformanceComparisonOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Audience Segment Reporting Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Audience segment reporting</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Define your ad account's audience segments in Advertiser settings to receive reporting breakdowns between your new audience, engaged audience and existing customers.{" "}
                            <button type="button" className="text-sky-400 hover:underline font-semibold">About audience segment reporting</button>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-200">Engaged audience</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {salesEngagedAudienceDefined ? "Defined" : "Not defined"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSalesEngagedAudienceDefined(!salesEngagedAudienceDefined)}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-sky-400 transition-colors"
                            >
                              {salesEngagedAudienceDefined ? "Edit segment" : "Define segment"}
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-200">Existing customers</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {salesExistingCustomersDefined ? "Defined" : "Not defined"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSalesExistingCustomersDefined(!salesExistingCustomersDefined)}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-sky-400 transition-colors"
                            >
                              {salesExistingCustomersDefined ? "Edit segment" : "Define segment"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Special Ad Categories */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country.{" "}
                            <button type="button" className="text-sky-400 hover:underline font-semibold">About Special Ad Categories</button>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">Categories</label>
                          <p className="text-[10px] text-slate-500">Select the categories that best describe what this campaign will advertise.</p>
                          <select
                            value={salesSpecialCategory}
                            onChange={(e) => setSalesSpecialCategory(e.target.value)}
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

                      {/* Campaign Score Card */}
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
                              <span className="text-[11px] text-slate-300 font-medium">⚡ Advantage+ sales campaign</span>
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

                  {/* GENERIC / OTHER OBJECTIVES SETUP FLOW */}
                  {campObjective !== "OUTCOME_AWARENESS" && campObjective !== "OUTCOME_TRAFFIC" && campObjective !== "OUTCOME_ENGAGEMENT" && campObjective !== "OUTCOME_LEADS" && campObjective !== "OUTCOME_APP_PROMOTION" && campObjective !== "OUTCOME_SALES" && (
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

                  {/* AWARENESS OBJECTIVE — AD SET SETUP VIEW (STEP 3) */}
                  {campObjective === "OUTCOME_AWARENESS" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800/80 shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                                Step 3 of 4
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                                <span className="text-slate-400">{campName || "New Campaign"}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-slate-100 font-bold">Ad Set & Target Audience Setup</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Configure performance goal, placements, budget & audience targeting.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              In Draft
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 1. Ad set name */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">✓</div>
                          <label className="block text-xs font-bold text-slate-200">Ad set name</label>
                        </div>
                        <Input
                          label=""
                          value={awarenessAdSetName}
                          onChange={(e: any) => setAwarenessAdSetName(e.target.value)}
                          placeholder="New Awareness ad set"
                          required
                        />
                        <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-1">Show more options ▾</button>
                      </div>

                      {/* 2. Conversion (Performance Goal, Page & Bidding) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Conversion</h4>
                        </div>

                        {/* Performance Goal */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-200">Performance goal</label>
                          <p className="text-[11px] text-slate-400">
                            How you measure success for your ads. <button type="button" className="text-sky-400 hover:underline font-semibold">About performance goals</button>
                          </p>
                          <select
                            value={awarenessPerformanceGoal}
                            onChange={(e) => setAwarenessPerformanceGoal(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500 shadow-inner"
                          >
                            <option value="IMPRESSIONS">Maximise number of impressions</option>
                            <option value="REACH">Maximise reach of ads</option>
                            <option value="AD_RECALL_LIFT">Maximise ad recall lift</option>
                            <option value="THRUPLAY">Maximise ThruPlay views</option>
                            <option value="CONTINUOUS_2SEC_VIDEO_PLAY">Maximise 2-second continuous video plays</option>
                          </select>
                          <p className="text-[11px] text-slate-400 pt-0.5">To help us improve delivery, we may survey a small section of your audience.</p>
                        </div>

                        {/* Facebook Page */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-slate-200 text-xs">Facebook Page</h5>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-help">ℹ</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Choose the Page that you want to promote.</p>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <select
                                value={formPageId}
                                onChange={(e) => setFormPageId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                              >
                                {fetchedPages.length > 0 ? (
                                  fetchedPages.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))
                                ) : (
                                  <option value="jisnu_page">JISNU Digital Solutions Pvt.Ltd</option>
                                )}
                              </select>
                              <div className="absolute left-3 top-2.5 w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-[9px] font-black pointer-events-none">⚛</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormPageId("new_page")}
                              className="w-10 h-[38px] rounded-xl bg-slate-900 border border-slate-700/60 hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-lg shrink-0"
                              title="Add Page"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Bid Cap - Optional */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-800/60">
                          <label className="block text-xs font-bold text-slate-200">Bid cap · Optional</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={awarenessBidCap}
                              onChange={(e) => setAwarenessBidCap(e.target.value)}
                              placeholder="₹ X.XX"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-3 pr-12 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                            />
                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">INR</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Meta will aim to spend your entire budget and get the most 1,000 impressions using the highest-volume bid strategy.</p>
                        </div>

                        {/* Value Rules */}
                        <div className="space-y-2 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-slate-200 text-xs">Value rules</h5>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Tell us how much more certain audiences, conversion locations and placements are worth to your business. Our system will optimise for outcomes based on these rules. <button type="button" className="text-sky-400 hover:underline font-semibold">About value rules</button>
                          </p>
                          <button type="button" className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                            <span>⚙</span> Create a rule set
                          </button>
                        </div>

                        {/* Hide options toggle & Delivery type */}
                        <div className="pt-3 border-t border-slate-800/60 space-y-2">
                          <button
                            type="button"
                            onClick={() => setAwarenessStep3ShowMoreOptions1(!awarenessStep3ShowMoreOptions1)}
                            className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            {awarenessStep3ShowMoreOptions1 ? "Hide options ▴" : "Show options ▾"}
                          </button>
                          {awarenessStep3ShowMoreOptions1 && (
                            <div className="pt-2 space-y-1 animate-fadeIn">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-200">Delivery type</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                              </div>
                              <p className="text-xs text-slate-300 font-semibold">Standard</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Budget & schedule */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Budget & schedule</h4>
                        </div>

                        {/* Budget */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">Budget</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={awarenessAdSetBudgetMode}
                              onChange={(e) => setAwarenessAdSetBudgetMode(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                            >
                              <option value="DAILY">Daily budget</option>
                              <option value="LIFETIME">Lifetime budget</option>
                            </select>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                              <input
                                type="text"
                                value={awarenessAdSetBudgetAmount}
                                onChange={(e) => setAwarenessAdSetBudgetAmount(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-7 pr-12 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                              />
                              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">INR</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            You'll spend an average of ₹200.00 per day. Your maximum daily spend is ₹250.00 and your maximum weekly spend is ₹1,400.00. <button type="button" className="text-sky-400 hover:underline font-semibold">About daily budget</button>
                          </p>
                          <p className="text-[11px] text-slate-400">Your spending may exceed ₹200.00 the first few days.</p>
                        </div>

                        {/* Schedule */}
                        <div className="space-y-2 pt-3 border-t border-slate-800/60">
                          <h5 className="font-bold text-slate-200 text-xs">Schedule</h5>
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">Start date</label>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="date"
                                value={awarenessStartDate}
                                onChange={(e) => setAwarenessStartDate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                              />
                              <div className="relative">
                                <input
                                  type="text"
                                  value={awarenessStartTime}
                                  onChange={(e) => setAwarenessStartTime(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                                />
                                <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-500">GMT+5:30</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-1">
                            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={awarenessSetEndDate}
                                onChange={(e) => setAwarenessSetEndDate(e.target.checked)}
                                className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-sky-500"
                              />
                              Set an end date
                            </label>
                          </div>
                        </div>

                        {/* Budget Scheduling */}
                        <div className="pt-3 border-t border-slate-800/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-200">Budget scheduling</span>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400">Increase your budget during specific days or times.</p>
                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={awarenessBudgetScheduling}
                                onChange={(e) => setAwarenessBudgetScheduling(e.target.checked)}
                                className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-sky-500"
                              />
                              Schedule budget increases
                            </label>
                            <button type="button" className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                              View ▾
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4. Audience controls */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                              Audience controls
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </h4>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Set criteria for where ads for this campaign can be delivered. <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                        </p>

                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400">
                            No advertising settings set
                          </span>
                          <div>
                            <button type="button" className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mt-1">
                              Use a saved audience ▾
                            </button>
                          </div>
                        </div>

                        <hr className="border-slate-800/80 my-2" />

                        {/* * Locations */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">* Locations</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-300">
                            <p className="text-[11px] text-slate-400 font-medium">Included location:</p>
                            <ul className="list-disc pl-5 text-xs text-slate-200 font-semibold space-y-0.5">
                              <li>India</li>
                            </ul>
                          </div>

                          {/* Warning Alert Banner (Securities & Investments in India) */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border-l-4 border-l-amber-500 border-slate-800 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-amber-400 text-xs shrink-0 mt-0.5">⚠️</span>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                To run ads in India, you need to declare if your ads are related to securities and investments.
                              </p>
                            </div>
                            <div className="pl-6">
                              <button
                                type="button"
                                className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all shadow-sm"
                              >
                                Review requirements
                              </button>
                            </div>
                          </div>
                        </div>

                        <hr className="border-slate-800/80 my-2" />

                        {/* Show more options ▾ */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setAwarenessShowMoreOptions(!awarenessShowMoreOptions)}
                            className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            {awarenessShowMoreOptions ? "Show fewer options ▴" : "Show more options ▾"}
                          </button>
                        </div>

                        {/* Minimum age */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">Minimum age</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>

                          <ul className="list-disc pl-5 text-xs text-slate-300 font-medium space-y-0.5">
                            <li>18</li>
                            <li>Unknown age on WhatsApp: Included</li>
                          </ul>

                          {/* Audience has been updated Alert Box */}
                          {!awarenessAudienceNoticeDismissed && (
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 relative animate-fadeIn">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                                  <h5 className="font-bold text-slate-100 text-xs">Audience has been updated</h5>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setAwarenessAudienceNoticeDismissed(true)}
                                  className="text-slate-400 hover:text-slate-200 text-xs font-bold p-0.5"
                                >
                                  ✕
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                                To reach more people on the WhatsApp status placement, the audience for this ad set includes people on WhatsApp whose age is unknown.{" "}
                                <button type="button" className="text-sky-400 hover:underline font-semibold">About reaching new audiences</button>
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Exclude these custom audiences */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">Exclude these custom audiences</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                              type="text"
                              value={awarenessExcludeAudience}
                              onChange={(e) => setAwarenessExcludeAudience(e.target.value)}
                              placeholder="Search existing audiences"
                              className="w-full bg-slate-950 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">Languages</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Only enter a language if you need to limit your audience to people who use a language that isn't common to your selected locations.
                          </p>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                              type="text"
                              value={awarenessLanguages}
                              onChange={(e) => setAwarenessLanguages(e.target.value)}
                              placeholder="Search languages"
                              className="w-full bg-slate-950 border-2 border-sky-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none shadow-lg shadow-sky-500/10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 5. Advantage+ audience */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Advantage+ audience +</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          We'll automatically show ads to people most likely to respond. We'll show ads to people matching your suggestion, and other audiences when it's likely to improve performance. <button type="button" className="text-sky-400 hover:underline font-semibold">About audiences</button>
                        </p>

                        {/* Include custom audiences */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Include these custom audiences</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <button type="button" className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-sky-400">
                              Create new ▾
                            </button>
                          </div>
                          <input
                            type="text"
                            value={awarenessIncludeCustomAudience}
                            onChange={(e) => setAwarenessIncludeCustomAudience(e.target.value)}
                            placeholder="Search existing audiences"
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        {/* Age & Gender */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Age</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={awarenessAgeMin}
                                onChange={(e) => setAwarenessAgeMin(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                              >
                                <option value={18}>18</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                              </select>
                              <span className="text-slate-500 text-xs font-bold">-</span>
                              <select
                                value={awarenessAgeMax}
                                onChange={(e) => setAwarenessAgeMax(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                              >
                                <option value="65+">65+</option>
                                <option value="60">60</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Gender</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                              {["ALL", "MEN", "WOMEN"].map((g) => (
                                <label key={g} className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                                  <input
                                    type="radio"
                                    name="awarenessGender"
                                    checked={awarenessGender === g}
                                    onChange={() => setAwarenessGender(g)}
                                    className="accent-sky-500"
                                  />
                                  {g === "ALL" ? "All" : g === "MEN" ? "Men" : "Women"}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Detailed targeting */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Detailed targeting</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">Browse</button>
                          </div>
                          <p className="text-[11px] text-slate-400">Include people who match</p>
                          <input
                            type="text"
                            value={awarenessDetailedTargeting}
                            onChange={(e) => setAwarenessDetailedTargeting(e.target.value)}
                            placeholder="Add demographics, interests or behaviours"
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        {/* Household income info banner */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative">
                          <button type="button" className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs font-bold">✕</button>
                          <div className="flex items-center gap-2">
                            <span className="text-sky-400 text-xs font-bold">💡 Reach people by household income in India</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Add these new detailed targeting options to reach more specific audiences in India. Search for household income or browse <span className="font-semibold text-slate-300">Demographics &gt; Household income &gt; India</span>. They use high-quality data sources to show your ads to people based on their income.
                          </p>
                          <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-0.5 block">About reaching audiences by household income</button>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button type="button" className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200">
                            Save audience
                          </button>
                          <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">
                            Switch to original audience options
                          </button>
                        </div>
                      </div>

                      {/* 6. Policy and regulatory requirements (India) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Policy and regulatory requirements (India)</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Provide required information about your ads, yourself or your organisation.</p>
                        <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={awarenessSecuritiesDeclaration}
                            onChange={(e) => setAwarenessSecuritiesDeclaration(e.target.checked)}
                            className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500 mt-0.5"
                          />
                          <span className="leading-relaxed">
                            This ad set includes ads related to securities and investments. <button type="button" className="text-sky-400 hover:underline font-semibold">About verification requirements</button>
                          </span>
                        </label>
                      </div>

                      {/* 7. Placements */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Placements</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Choose where your ad appears across Meta technologies. <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                        </p>

                        {/* Value rule creation info */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <p className="text-[11px] text-slate-300 font-medium">💡 Value rule creation is changing. You can now add rules closer to where you select your ad set's placements.</p>
                          <button type="button" className="text-slate-500 hover:text-slate-300 text-xs font-bold ml-2">✕</button>
                        </div>

                        {/* Placement value rules */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200">Placement value rules</span>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Prioritise the placements that matter most to your business by adjusting bids for them. <button type="button" className="text-sky-400 hover:underline font-semibold">About value rules</button></p>
                          <button type="button" className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-sky-400">
                            Create a rule set
                          </button>
                        </div>

                        {/* Account controls */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200">Account controls</span>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Excluded placements: None</p>
                        </div>

                        {/* Placement radio options */}
                        <div className="space-y-3 pt-2">
                          <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${awarenessPlacementType === "ADVANTAGE" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}>
                            <input
                              type="radio"
                              name="awarenessPlacementType"
                              checked={awarenessPlacementType === "ADVANTAGE"}
                              onChange={() => setAwarenessPlacementType("ADVANTAGE")}
                              className="mt-0.5 accent-sky-500 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-200">Advantage+ placements (recommended) +</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                Use Advantage+ placements to maximise your budget and help show your ads to more people. Facebook's delivery system will allocate your ad set's budget across multiple placements based on where they're likely to perform best.
                              </p>
                            </div>
                          </label>

                          <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${awarenessPlacementType === "MANUAL" ? "bg-sky-500/10 border-sky-500/50" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}>
                            <input
                              type="radio"
                              name="awarenessPlacementType"
                              checked={awarenessPlacementType === "MANUAL"}
                              onChange={() => setAwarenessPlacementType("MANUAL")}
                              className="mt-0.5 accent-sky-500 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-200">Manual placements</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                Manually choose the places to show your ad. The more placements you select, the more opportunities you'll have to reach your target audience and achieve your business goals.
                              </p>
                            </div>
                          </label>

                          {/* Better results opportunity card */}
                          <div className="p-4 rounded-xl bg-slate-900 border-l-4 border-l-emerald-500 border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-400">⚡ You could get better results with Advantage+ placements</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">+27 points</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Including more placements often helps you find a wider audience. The more places your ad is displayed, the more chances your target audience has to see it. <button type="button" className="text-sky-400 hover:underline font-semibold">About Advantage+ placements</button>
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button type="button" className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/30">
                                Apply now
                              </button>
                              <button type="button" className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold hover:bg-slate-700">
                                Show analysis
                              </button>
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                            <input type="checkbox" className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-sky-500" />
                            Run an A/B test to see the results of using Advantage+ placements
                          </label>

                          {/* Devices & Platforms */}
                          <div className="pt-3 space-y-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">Devices</label>
                              <p className="text-[11px] text-slate-400">All devices</p>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-200">Platforms</label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: "Facebook", state: awarenessPlacementsFb, set: setAwarenessPlacementsFb },
                                  { label: "Instagram", state: awarenessPlacementsIg, set: setAwarenessPlacementsIg },
                                  { label: "Audience Network", state: awarenessPlacementsAn, set: setAwarenessPlacementsAn },
                                  { label: "Messenger", state: awarenessPlacementsMsg, set: setAwarenessPlacementsMsg },
                                  { label: "WhatsApp", state: awarenessPlacementsWa, set: setAwarenessPlacementsWa },
                                  { label: "Threads", state: awarenessPlacementsThreads, set: setAwarenessPlacementsThreads },
                                ].map((plat) => (
                                  <label key={plat.label} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={plat.state}
                                      onChange={(e) => plat.set(e.target.checked)}
                                      className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-sky-500"
                                    />
                                    {plat.label}
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1 pt-1">
                              <div className="flex items-center gap-1.5">
                                <label className="block text-xs font-bold text-slate-200">Asset customisation</label>
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] text-slate-400">10/16 placements that support asset customisation</p>
                                <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">Select all</button>
                              </div>
                            </div>

                            {/* Placements Tree & Visual Mobile Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              {/* Left Tree */}
                              <div className="space-y-2 text-xs text-slate-300">
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input type="checkbox" checked={awarenessPlacementsFeeds} onChange={(e) => setAwarenessPlacementsFeeds(e.target.checked)} className="accent-sky-500" />
                                    Feeds ℹ
                                  </label>
                                  <span>▾</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input type="checkbox" checked={awarenessPlacementsStories} onChange={(e) => setAwarenessPlacementsStories(e.target.checked)} className="accent-sky-500" />
                                    Stories, Status, Reels ℹ
                                  </label>
                                  <span>▾</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input type="checkbox" checked={awarenessPlacementsInstream} onChange={(e) => setAwarenessPlacementsInstream(e.target.checked)} className="accent-sky-500" />
                                    In-stream ads for reels ℹ
                                  </label>
                                  <span>▾</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input type="checkbox" checked={awarenessPlacementsSearch} onChange={(e) => setAwarenessPlacementsSearch(e.target.checked)} className="accent-sky-500" />
                                    Search results ℹ
                                  </label>
                                  <span>▾</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input type="checkbox" checked={awarenessPlacementsApps} onChange={(e) => setAwarenessPlacementsApps(e.target.checked)} className="accent-sky-500" />
                                    Apps and sites ℹ
                                  </label>
                                  <span>▾</span>
                                </div>
                              </div>

                              {/* Right Placement Mobile Mockup Preview */}
                              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-36 h-44 rounded-xl bg-slate-950 border border-slate-800 p-2 flex flex-col items-center shadow-md">
                                  <div className="w-full flex items-center gap-1.5 pb-1 border-b border-slate-800">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/30"></div>
                                    <div className="w-16 h-1 bg-slate-700 rounded"></div>
                                  </div>
                                  <div className="w-full h-24 bg-slate-900 rounded-lg mt-1.5 flex items-center justify-center text-xl">
                                    🍔
                                  </div>
                                  <div className="w-full space-y-1 mt-1.5">
                                    <div className="w-full h-1 bg-slate-700 rounded"></div>
                                    <div className="w-3/4 h-1 bg-slate-800 rounded"></div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-200">Feeds</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">We recommend <span className="font-semibold text-slate-300">square (1:1)</span> images and <span className="font-semibold text-slate-300">vertical (4:5)</span> videos.</p>
                                </div>
                              </div>
                            </div>

                            <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-1">Show more options ▾</button>
                          </div>
                        </div>
                      </div>

                      {/* 8. Brand safety and suitability */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Brand safety and suitability</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <span className="font-semibold text-slate-300">Brand safety:</span> Meta applies brand safety to all ads through our <button type="button" className="text-sky-400 hover:underline">Community Standards</button> and <button type="button" className="text-sky-400 hover:underline">Monetisation Policies</button>, keeping your ads away from objectionable content.
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <span className="font-semibold text-slate-300">Brand suitability:</span> In some cases, brands want more control over where ads can appear. Brand suitability filters or excludes specific topics or publishers. Bear in mind that using these controls can lower your reach and increase costs.
                        </p>

                        <button
                          type="button"
                          onClick={() => setAwarenessStep3ShowMoreSettings(!awarenessStep3ShowMoreSettings)}
                          className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          {awarenessStep3ShowMoreSettings ? "Hide options ▴" : "Show options ▾"}
                        </button>

                        {awarenessStep3ShowMoreSettings && (
                          <div className="pt-2 border-t border-slate-800/60 space-y-3 text-xs text-slate-300 animate-fadeIn">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-200">Inventory filters</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">We apply the default inventory filter unless you change it. Content that's excessively controversial or offensive is always excluded, regardless of what filter you choose.</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-200">In-content ads</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">Expanded (ad set)</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-200">Audience Network ads</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">None selected</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-200">Publisher block lists</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">None selected</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-200">Content type exclusions</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">None selected</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-200">Topic exclusions</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">None selected</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Campaign Score Card */}
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
                              <span className="text-[11px] text-slate-300 font-medium">⚡ Advantage+ awareness campaign</span>
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

                  {/* AWARENESS OBJECTIVE — AD SET SETUP VIEW (STEP 3) */}
                  {campObjective === "OUTCOME_AWARENESS" && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Top Banner Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <button
                              type="button"
                              onClick={() => setCampaignStep(2)}
                              className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mb-1"
                            >
                              ← Change Objective
                            </button>
                            <h3 className="font-bold text-slate-100 text-sm">Step 3: Configure AWARENESS Campaign Parameters</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Parameters tailored specifically for your AWARENESS campaign setup.</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 3 of 4</span>
                        </div>
                      </div>

                      {/* Ad Set Name */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <label className="block text-xs font-bold text-slate-200">Ad set name</label>
                        <input
                          type="text"
                          value={awarenessAdSetName}
                          onChange={(e) => setAwarenessAdSetName(e.target.value)}
                          placeholder="New Awareness ad set"
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      {/* Performance Goal Card */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Performance goal</h4>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Performance goal</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <ScrollableSelect
                              value={awarenessPerformanceGoal}
                              onChange={(val) => setAwarenessPerformanceGoal(val)}
                              options={[
                                { value: "MAXIMIZE_REACH", label: "Maximize reach of ads" },
                                { value: "MAXIMIZE_IMPRESSIONS", label: "Maximize number of impressions" },
                                { value: "MAXIMIZE_AD_RECALL_LIFT", label: "Maximize ad recall lift" },
                                { value: "MAXIMIZE_LINK_CLICKS", label: "Maximize number of link clicks" },
                                { value: "MAXIMIZE_DAILY_UNIQUE_REACH", label: "Maximize daily unique reach" },
                              ]}
                              className="text-slate-100 font-semibold"
                              maxHeight="max-h-52"
                            />
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Cost per result goal</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="text"
                                value={awarenessCostPerResult}
                                onChange={(e) => setAwarenessCostPerResult(e.target.value)}
                                placeholder="Optional"
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-7 pr-12 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                              />
                              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">INR</span>
                            </div>
                            <p className="text-[10px] text-slate-500">Meta will aim for this cost per result while spending your budget.</p>
                          </div>
                        </div>
                      </div>

                      {/* Budget & Schedule Card */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                            <div>
                              <h4 className="font-bold text-slate-100 text-sm">Budget & schedule</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">Suggested budget and schedule have been applied to optimise your ad for live videos.</p>
                            </div>
                          </div>
                        </div>

                        {/* Budget Subsection */}
                        <div className="space-y-3">
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider text-slate-400">Budget</h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-300 mb-1">Budget mode</label>
                              <select
                                value={step3BudgetMode}
                                onChange={(e: any) => setStep3BudgetMode(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                              >
                                <option value="LIFETIME">Lifetime budget</option>
                                <option value="DAILY">Daily budget</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-300 mb-1">Budget Amount</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                                <input
                                  type="text"
                                  value={step3BudgetAmount}
                                  onChange={(e) => setStep3BudgetAmount(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-7 pr-12 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                                />
                                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">INR</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                            <p>
                              Ad set budget sharing is on, but you have only one ad set. You'll spend no more than{" "}
                              <span className="font-bold text-sky-400">₹{Number(step3BudgetAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> during the {step3BudgetMode === "LIFETIME" ? "lifetime" : "day"} of your ad set.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">About {step3BudgetMode === "LIFETIME" ? "lifetime" : "daily"} budget</button>
                            </p>
                          </div>
                        </div>

                        {/* Schedule Subsection */}
                        <div className="space-y-4 pt-2 border-t border-slate-800">
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider text-slate-400">Schedule</h5>

                          {/* Info Banner for Live Video Ad Delivery */}
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                            <div className="flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                              <div>
                                <h6 className="font-bold text-slate-100 text-xs">For better ad delivery, create your ad before going live</h6>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                  Select upcoming live video to create your ad in advance. Creating an ad at least 3 hours before going live allows time for review and reduces delivery delays.{" "}
                                  <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Live Video Mode Selection */}
                          <div className="space-y-2.5">
                            {/* Option 1: Current live video */}
                            <label
                              onClick={() => setStep3LiveVideoOption("CURRENT")}
                              className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${step3LiveVideoOption === "CURRENT"
                                ? "bg-sky-500/10 border-sky-500/50"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  name="awarenessStep3LiveVideoOption"
                                  checked={step3LiveVideoOption === "CURRENT"}
                                  onChange={() => setStep3LiveVideoOption("CURRENT")}
                                  className="accent-sky-500 mt-0.5"
                                />
                                <div>
                                  <h6 className="font-bold text-slate-100 text-xs">Current live video</h6>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Send people to a live video happening now</p>
                                  <p className="text-[10px] text-slate-500 mt-1">Choose an existing post that features your live video for your ad under Ad setup.</p>
                                </div>
                              </div>
                            </label>

                            {/* Option 2: Upcoming live video */}
                            <label
                              onClick={() => setStep3LiveVideoOption("UPCOMING")}
                              className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${step3LiveVideoOption === "UPCOMING"
                                ? "bg-sky-500/10 border-sky-500/50"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  name="awarenessStep3LiveVideoOption"
                                  checked={step3LiveVideoOption === "UPCOMING"}
                                  onChange={() => setStep3LiveVideoOption("UPCOMING")}
                                  className="accent-sky-500 mt-0.5"
                                />
                                <div>
                                  <h6 className="font-bold text-slate-100 text-xs">Upcoming live video</h6>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Schedule an ad before going live</p>
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Date and Time Inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* Start Date & Time */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <label className="block text-xs font-bold text-slate-200">Start date</label>
                              <p className="text-[10px] text-slate-400">Select a date and a time</p>

                              <div className="space-y-2 pt-1">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date picker</label>
                                  <input
                                    type="date"
                                    value={step3StartDate}
                                    onChange={(e) => setStep3StartDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Time input</label>
                                    <input
                                      type="time"
                                      value={step3StartTime}
                                      onChange={(e) => setStep3StartTime(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 self-end pb-2">GMT+5:30</span>
                                </div>
                              </div>
                            </div>

                            {/* End Date & Time */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <label className="block text-xs font-bold text-slate-200">End date</label>
                              <p className="text-[10px] text-slate-400">Select a date and a time</p>

                              <div className="space-y-2 pt-1">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date picker</label>
                                  <input
                                    type="date"
                                    value={step3EndDate}
                                    onChange={(e) => setStep3EndDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Time input</label>
                                    <input
                                      type="time"
                                      value={step3EndTime}
                                      onChange={(e) => setStep3EndTime(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 self-end pb-2">GMT+5:30</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Show Options / Hide Options */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setStep3ShowMoreOptions(!step3ShowMoreOptions)}
                              className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
                            >
                              {step3ShowMoreOptions ? "Hide options" : "Show options"}
                            </button>

                            {step3ShowMoreOptions && (
                              <div className="mt-3 space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 animate-fadeIn">
                                {/* Budget scheduling */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h6 className="font-bold text-slate-200 text-xs">Budget scheduling</h6>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Increase your budget during specific days or times.</p>
                                  </div>
                                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={step3BudgetScheduling}
                                      onChange={(e) => setStep3BudgetScheduling(e.target.checked)}
                                      className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-sky-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-200">Schedule budget increases</span>
                                  </label>
                                </div>

                                {/* Ad scheduling */}
                                <div className="flex items-start justify-between pt-3 border-t border-slate-800">
                                  <div>
                                    <h6 className="font-bold text-slate-200 text-xs">Ad scheduling</h6>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Run ads on a specific schedule throughout the week.</p>
                                  </div>
                                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={step3AdScheduling}
                                      onChange={(e) => setStep3AdScheduling(e.target.checked)}
                                      className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-sky-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-200">Run ads on a schedule</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TRAFFIC OBJECTIVE — AD SET SETUP VIEW (STEP 3) */}
                  {campObjective === "OUTCOME_TRAFFIC" && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Top Header Breadcrumb Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <span>New Traffic campaign</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-200 font-bold">New Traffic ad set</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Configure conversion location, performance goals, placements, and target audience.</p>
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

                      {/* 1. Ad set name */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">✓</div>
                          <label className="block text-xs font-bold text-slate-200">Ad set name</label>
                        </div>
                        <Input
                          label=""
                          value={adSetName || "New Traffic ad set"}
                          onChange={(e: any) => setAdSetName(e.target.value)}
                          placeholder="New Traffic ad set"
                          required
                        />
                        <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-1">Show more options ▾</button>
                      </div>

                      {/* 2. Conversion (Conversion Location, Performance Goal, Facebook Page) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Conversion</h4>
                        </div>

                        {/* Conversion Location */}
                        <div className="space-y-2">
                          <h5 className="font-bold text-slate-200 text-xs">Conversion location</h5>
                          <p className="text-[11px] text-slate-400">Choose where you want to drive traffic.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {[
                              { id: "WEBSITE", title: "Website", desc: "Send traffic to your website." },
                              { id: "APP", title: "App", desc: "Send traffic to your app." },
                              { id: "MESSAGING", title: "Message destinations", desc: "Send traffic to Messenger, Instagram and WhatsApp." },
                              { id: "INSTAGRAM_FB", title: "Instagram or Facebook", desc: "Send traffic to profile or page." },
                              { id: "CALLS", title: "Calls", desc: "Get people to call your business." },
                            ].map((loc) => (
                              <div
                                key={loc.id}
                                onClick={() => setConversionLocation(loc.id as any)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${conversionLocation === loc.id
                                  ? "border-sky-500 bg-sky-500/10 text-slate-100"
                                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="conversionLocationTraffic"
                                  checked={conversionLocation === loc.id}
                                  onChange={() => setConversionLocation(loc.id as any)}
                                  className="h-3.5 w-3.5 text-sky-500 bg-slate-900 border-slate-700 mt-0.5"
                                />
                                <div>
                                  <h6 className="font-bold text-xs text-slate-200">{loc.title}</h6>
                                  <p className="text-[10px] text-slate-400">{loc.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Performance Goal */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-800/60">
                          <label className="block text-xs font-bold text-slate-200">Performance goal</label>
                          <p className="text-[11px] text-slate-400">How you measure success for your ads.</p>
                          <select
                            value={performanceGoal}
                            onChange={(e) => setPerformanceGoal(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
                          >
                            <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                            <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                            <option value="MAXIMIZE_CONVERSATIONS">Maximise number of conversations</option>
                            <option value="MAXIMIZE_DAILY_UNIQUE_REACH">Maximise daily unique reach</option>
                            <option value="MAXIMIZE_IMPRESSIONS">Maximise number of impressions</option>
                          </select>
                        </div>

                        {/* Facebook Page Selection */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-slate-200 text-xs">Facebook Page</h5>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Choose the Page that will represent your business.</p>
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
                      </div>

                      {/* 3. Budget & schedule */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                            <div>
                              <h4 className="font-bold text-slate-100 text-sm">Budget & schedule</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">Suggested budget and schedule have been applied to optimise your ad for live videos.</p>
                            </div>
                          </div>
                        </div>

                        {/* Budget Subsection */}
                        <div className="space-y-3">
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider text-slate-400">Budget</h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-300 mb-1">Budget mode</label>
                              <select
                                value={step3BudgetMode}
                                onChange={(e: any) => setStep3BudgetMode(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                              >
                                <option value="LIFETIME">Lifetime budget</option>
                                <option value="DAILY">Daily budget</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-300 mb-1">Budget Amount</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                                <input
                                  type="text"
                                  value={step3BudgetAmount}
                                  onChange={(e) => setStep3BudgetAmount(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-7 pr-12 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                                />
                                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">INR</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                            <p>
                              Ad set budget sharing is on, but you have only one ad set. You'll spend no more than{" "}
                              <span className="font-bold text-sky-400">₹{Number(step3BudgetAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> during the {step3BudgetMode === "LIFETIME" ? "lifetime" : "day"} of your ad set.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">About {step3BudgetMode === "LIFETIME" ? "lifetime" : "daily"} budget</button>
                            </p>
                          </div>
                        </div>

                        {/* Schedule Subsection */}
                        <div className="space-y-4 pt-2 border-t border-slate-800">
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider text-slate-400">Schedule</h5>

                          {/* Info Banner for Live Video Ad Delivery */}
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                            <div className="flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                              <div>
                                <h6 className="font-bold text-slate-100 text-xs">For better ad delivery, create your ad before going live</h6>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                  Select upcoming live video to create your ad in advance. Creating an ad at least 3 hours before going live allows time for review and reduces delivery delays.{" "}
                                  <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Live Video Mode Selection */}
                          <div className="space-y-2.5">
                            {/* Option 1: Current live video */}
                            <label
                              onClick={() => setStep3LiveVideoOption("CURRENT")}
                              className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${step3LiveVideoOption === "CURRENT"
                                ? "bg-sky-500/10 border-sky-500/50"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  name="step3LiveVideoOption"
                                  checked={step3LiveVideoOption === "CURRENT"}
                                  onChange={() => setStep3LiveVideoOption("CURRENT")}
                                  className="accent-sky-500 mt-0.5"
                                />
                                <div>
                                  <h6 className="font-bold text-slate-100 text-xs">Current live video</h6>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Send people to a live video happening now</p>
                                  <p className="text-[10px] text-slate-500 mt-1">Choose an existing post that features your live video for your ad under Ad setup.</p>
                                </div>
                              </div>
                            </label>

                            {/* Option 2: Upcoming live video */}
                            <label
                              onClick={() => setStep3LiveVideoOption("UPCOMING")}
                              className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${step3LiveVideoOption === "UPCOMING"
                                ? "bg-sky-500/10 border-sky-500/50"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  name="step3LiveVideoOption"
                                  checked={step3LiveVideoOption === "UPCOMING"}
                                  onChange={() => setStep3LiveVideoOption("UPCOMING")}
                                  className="accent-sky-500 mt-0.5"
                                />
                                <div>
                                  <h6 className="font-bold text-slate-100 text-xs">Upcoming live video</h6>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Schedule an ad before going live</p>
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Date and Time Inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* Start Date & Time */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 space-y-3 shadow-inner">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                                  Start date
                                </label>
                                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                  GMT+5:30
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">Select start date & launch time</p>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-semibold text-slate-400">Date</label>
                                  <MetaDatePicker
                                    value={step3StartDate}
                                    onChange={(val) => setStep3StartDate(val)}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-semibold text-slate-400">Time</label>
                                  <div className="relative">
                                    <input
                                      type="time"
                                      value={step3StartTime}
                                      onChange={(e) => setStep3StartTime(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500 transition-all cursor-pointer [color-scheme:dark]"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* End Date & Time */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 space-y-3 shadow-inner">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                  End date
                                </label>
                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                  Optional
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">Select ending date & campaign pause time</p>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-semibold text-slate-400">Date</label>
                                  <MetaDatePicker
                                    value={step3EndDate}
                                    onChange={(val) => setStep3EndDate(val)}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-semibold text-slate-400">Time</label>
                                  <div className="relative">
                                    <input
                                      type="time"
                                      value={step3EndTime}
                                      onChange={(e) => setStep3EndTime(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500 transition-all cursor-pointer [color-scheme:dark]"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Show Options / Hide Options */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setStep3ShowMoreOptions(!step3ShowMoreOptions)}
                              className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
                            >
                              {step3ShowMoreOptions ? "Hide options" : "Show options"}
                            </button>

                            {step3ShowMoreOptions && (
                              <div className="mt-3 space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 animate-fadeIn">
                                {/* Budget scheduling */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h6 className="font-bold text-slate-200 text-xs">Budget scheduling</h6>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Increase your budget during specific days or times.</p>
                                  </div>
                                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={step3BudgetScheduling}
                                      onChange={(e) => setStep3BudgetScheduling(e.target.checked)}
                                      className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-sky-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-200">Schedule budget increases</span>
                                  </label>
                                </div>

                                {/* Ad scheduling */}
                                <div className="flex items-start justify-between pt-3 border-t border-slate-800">
                                  <div>
                                    <h6 className="font-bold text-slate-200 text-xs">Ad scheduling</h6>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Run ads on a specific schedule throughout the week.</p>
                                  </div>
                                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={step3AdScheduling}
                                      onChange={(e) => setStep3AdScheduling(e.target.checked)}
                                      className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-sky-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-200">Run ads on a schedule</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 4. Audience controls */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                              Audience controls
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditingAudienceControls(!isEditingAudienceControls)}
                            className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-sky-400 transition-all"
                          >
                            {isEditingAudienceControls ? "Done" : "Edit"}
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Set criteria for where ads for this campaign can be delivered. <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                        </p>

                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400">
                            No advertising settings set
                          </span>
                          <div>
                            <button type="button" className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mt-1">
                              Use a saved audience ▾
                            </button>
                          </div>
                        </div>

                        <hr className="border-slate-800/80 my-2" />

                        {/* * Locations */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">* Locations</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>

                          {isEditingAudienceControls ? (
                            <div className="space-y-2">
                              <p className="text-[11px] text-slate-400 font-medium">Included locations:</p>
                              <div className="flex flex-wrap gap-2">
                                {(audienceLocations || ["India"]).map((loc: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold animate-fadeIn">
                                    📍 {loc}
                                    <button
                                      type="button"
                                      onClick={() => setAudienceLocations(audienceLocations.filter((_: any, i: number) => i !== idx))}
                                      className="hover:text-red-400 font-bold ml-1"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>

                              <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={locationSearchInput}
                                  onChange={(e) => {
                                    setLocationSearchInput(e.target.value);
                                    setShowLocationDropdown(true);
                                  }}
                                  onFocus={() => setShowLocationDropdown(true)}
                                  placeholder="Search city or country (e.g. Mumbai, Delhi, United States)"
                                  onKeyDown={(e: any) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                      e.preventDefault();
                                      const val = e.currentTarget.value.trim();
                                      if (!audienceLocations.includes(val)) {
                                        setAudienceLocations([...audienceLocations, val]);
                                      }
                                      setLocationSearchInput("");
                                      setShowLocationDropdown(false);
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                                />

                                {/* Search Locations Dropdown */}
                                {showLocationDropdown && (
                                  <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto py-1 divide-y divide-slate-800/60">
                                    {[
                                      "Mumbai, Maharashtra, India",
                                      "Delhi, India",
                                      "Bengaluru, Karnataka, India",
                                      "Pune, Maharashtra, India",
                                      "Hyderabad, Telangana, India",
                                      "Chennai, Tamil Nadu, India",
                                      "Kolkata, West Bengal, India",
                                      "Ahmedabad, Gujarat, India",
                                      "London, United Kingdom",
                                      "New York, United States",
                                      "Dubai, United Arab Emirates",
                                      "Singapore"
                                    ]
                                      .filter((item) => item.toLowerCase().includes((locationSearchInput || "").toLowerCase()))
                                      .map((locName) => (
                                        <button
                                          key={locName}
                                          type="button"
                                          onClick={() => {
                                            if (!audienceLocations.includes(locName)) {
                                              setAudienceLocations([...audienceLocations, locName]);
                                            }
                                            setLocationSearchInput("");
                                            setShowLocationDropdown(false);
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 flex items-center justify-between"
                                        >
                                          <span>📍 {locName}</span>
                                          <Plus className="w-3.5 h-3.5 text-sky-400" />
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500">Type a city or select from recommendations</p>
                            </div>
                          ) : (
                            <div className="space-y-1 text-xs text-slate-300">
                              <p className="text-[11px] text-slate-400 font-medium">Included locations:</p>
                              <ul className="list-disc pl-5 text-xs text-slate-200 font-semibold space-y-0.5">
                                {(audienceLocations || ["India"]).map((loc: string, idx: number) => (
                                  <li key={idx}>{loc}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Warning Alert Banner */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border-l-4 border-l-amber-500 border-slate-800 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-amber-400 text-xs shrink-0 mt-0.5">⚠️</span>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                To run ads in India, you need to declare if your ads are related to securities and investments.
                              </p>
                            </div>
                            <div className="pl-6">
                              <button
                                type="button"
                                className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all shadow-sm"
                              >
                                Review requirements
                              </button>
                            </div>
                          </div>
                        </div>

                        <hr className="border-slate-800/80 my-2" />

                        {/* Show more options ▾ */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setAwarenessShowMoreOptions(!awarenessShowMoreOptions)}
                            className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            {awarenessShowMoreOptions ? "Show fewer options ▴" : "Show more options ▾"}
                          </button>
                        </div>

                        {/* Minimum age */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">Minimum age</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>

                          {isEditingAudienceControls ? (
                            <div className="flex items-center gap-3">
                              <select
                                value={audienceMinAge || 18}
                                onChange={(e) => setAudienceMinAge(Number(e.target.value))}
                                className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                              >
                                {[18, 19, 20, 21, 22, 23, 24, 25].map((age) => (
                                  <option key={age} value={age}>{age}</option>
                                ))}
                              </select>
                              <span className="text-xs text-slate-400">Years old minimum</span>
                            </div>
                          ) : (
                            <ul className="list-disc pl-5 text-xs text-slate-300 font-medium space-y-0.5">
                              <li>{audienceMinAge || 18}</li>
                              <li>Unknown age on WhatsApp: Included</li>
                            </ul>
                          )}
                        </div>

                        {/* Exclude these custom audiences */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">Exclude these custom audiences</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          {isEditingAudienceControls ? (
                            <div className="relative">
                              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                value={awarenessExcludeAudience}
                                onChange={(e) => setAwarenessExcludeAudience(e.target.value)}
                                placeholder="Search existing audiences to exclude"
                                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 font-medium">
                              {awarenessExcludeAudience || "No custom audiences excluded"}
                            </p>
                          )}
                        </div>

                        {/* Languages */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-slate-200">Languages</label>
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Only enter a language if you need to limit your audience to people who use a specific language.
                          </p>

                          {isEditingAudienceControls ? (
                            <div className="space-y-2">
                              {selectedLanguages.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedLanguages.map((lang, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
                                      🌐 {lang}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedLanguages(selectedLanguages.filter((_, i) => i !== idx))}
                                        className="hover:text-red-400 font-bold ml-1"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={languageSearchInput}
                                  onChange={(e) => {
                                    setLanguageSearchInput(e.target.value);
                                    setShowLanguageDropdown(true);
                                  }}
                                  onFocus={() => setShowLanguageDropdown(true)}
                                  placeholder="Search languages (e.g. English, Hindi, Marathi, Gujarati)"
                                  onKeyDown={(e: any) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                      e.preventDefault();
                                      const val = e.currentTarget.value.trim();
                                      if (!selectedLanguages.includes(val)) {
                                        setSelectedLanguages([...selectedLanguages, val]);
                                      }
                                      setLanguageSearchInput("");
                                      setShowLanguageDropdown(false);
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
                                />

                                {/* Search Languages Dropdown */}
                                {showLanguageDropdown && (
                                  <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto py-1 divide-y divide-slate-800/60">
                                    {[
                                      "English (UK)",
                                      "English (US)",
                                      "Hindi",
                                      "Marathi",
                                      "Gujarati",
                                      "Bengali",
                                      "Tamil",
                                      "Telugu",
                                      "Kannada",
                                      "Malayalam",
                                      "Spanish",
                                      "French",
                                      "German"
                                    ]
                                      .filter((item) => item.toLowerCase().includes((languageSearchInput || "").toLowerCase()))
                                      .map((langName) => (
                                        <button
                                          key={langName}
                                          type="button"
                                          onClick={() => {
                                            if (!selectedLanguages.includes(langName)) {
                                              setSelectedLanguages([...selectedLanguages, langName]);
                                            }
                                            setLanguageSearchInput("");
                                            setShowLanguageDropdown(false);
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 flex items-center justify-between"
                                        >
                                          <span>🌐 {langName}</span>
                                          <Plus className="w-3.5 h-3.5 text-sky-400" />
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs font-semibold text-slate-200">
                              {selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "All languages"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 5. Advantage+ audience */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                            <h4 className="font-bold text-slate-100 text-sm">Advantage+ audience +</h4>
                          </div>
                          <button type="button" className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-sky-400 transition-all">
                            Audience suggestions
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          We'll automatically show ads to people most likely to respond. We'll show ads to people matching your suggestion, and other audiences when it's likely to improve performance. <button type="button" className="text-sky-400 hover:underline font-semibold">About audiences</button>
                        </p>

                        {/* Custom Audiences Search */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Custom audiences suggestion</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <button type="button" className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-semibold text-sky-400">
                              Create new ▾
                            </button>
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                              type="text"
                              value={awarenessIncludeCustomAudience}
                              onChange={(e) => setAwarenessIncludeCustomAudience(e.target.value)}
                              placeholder="Search existing custom audiences"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>

                        {/* Editable Age Range & Gender controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {/* Age Controls */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Age Range</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ScrollableSelect
                                value={String(awarenessAgeMin)}
                                onChange={(val) => setAwarenessAgeMin(Number(val))}
                                options={Array.from({ length: 48 }, (_, i) => 18 + i).map((age) => ({
                                  value: String(age),
                                  label: String(age),
                                }))}
                                maxHeight="max-h-40"
                                className="text-slate-100 font-bold"
                              />
                              <span className="text-slate-500 text-xs font-bold">-</span>
                              <ScrollableSelect
                                value={String(awarenessAgeMax)}
                                onChange={(val) => setAwarenessAgeMax(val)}
                                options={[
                                  ...Array.from({ length: 48 }, (_, i) => 18 + i).map((age) => ({
                                    value: String(age),
                                    label: String(age),
                                  })),
                                  { value: "65+", label: "65+" },
                                ]}
                                maxHeight="max-h-40"
                                className="text-slate-100 font-bold"
                              />
                            </div>
                          </div>

                          {/* Gender Controls */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Gender</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <div className="flex items-center gap-3 pt-1.5">
                              {[
                                { id: "ALL", label: "All genders" },
                                { id: "MEN", label: "Men" },
                                { id: "WOMEN", label: "Women" },
                              ].map((g) => (
                                <label key={g.id} className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                                  <input
                                    type="radio"
                                    name="trafficGenderSetting"
                                    checked={awarenessGender === g.id}
                                    onChange={() => setAwarenessGender(g.id)}
                                    className="accent-sky-500"
                                  />
                                  {g.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Targeting Search Input */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <label className="block text-xs font-bold text-slate-200">Detailed targeting</label>
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">ℹ</span>
                            </div>
                            <button type="button" className="text-xs text-sky-400 hover:underline font-semibold">Browse</button>
                          </div>
                          <p className="text-[11px] text-slate-400">Include people who match demographics, interests or behaviours</p>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                              type="text"
                              value={awarenessDetailedTargeting}
                              onChange={(e) => setAwarenessDetailedTargeting(e.target.value)}
                              placeholder="Add demographics, interests or behaviours (e.g. Technology, Online Shopping)"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>

                        {/* Household income info banner */}
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative">
                          <div className="flex items-center gap-2">
                            <span className="text-sky-400 text-xs font-bold">💡 Reach people by household income in India</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Add detailed targeting options to reach specific audiences in India by income range.
                          </p>
                        </div>
                      </div>

                      {/* 6. Policy and regulatory requirements (India) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Policy and regulatory requirements (India)</h4>
                        </div>
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

                      {/* 7. Placements */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Placements</h4>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Advantage+ placements (recommended)</p>
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

                      {/* 8. Brand safety and suitability */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                          <h4 className="font-bold text-slate-100 text-sm">Brand safety and suitability</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Meta applies standard brand safety filters across Facebook and Instagram placements.
                        </p>
                      </div>

                      {/* Campaign Score & Audience Definition Card */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
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
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <Check className="h-3 w-3" /> All edits saved
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP PROMOTION — AD SET SETUP VIEW */}
                  {campObjective === "OUTCOME_APP_PROMOTION" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <span>New App promotion Campaign</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-200 font-bold">New App promotion Ad set</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">1 Ad • Configure app store, performance goals, placements & audience definition.</p>
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

                      {/* App Store & Mobile App Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">App store / Mobile app store</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Select the app store and app you want people to install and use</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                            App promotion
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">App store</label>
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
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">App Store country (Optional)</label>
                            <select
                              value={appPromoAppCountry}
                              onChange={(e) => setAppPromoAppCountry(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                            >
                              <option value="IN">🇮🇳 India (IN)</option>
                              <option value="US">🇺🇸 United States (US)</option>
                              <option value="GB">🇬🇧 United Kingdom (GB)</option>
                              <option value="CA">🇨🇦 Canada (CA)</option>
                              <option value="AU">🇦🇺 Australia (AU)</option>
                            </select>
                            <p className="text-[10px] text-slate-500 mt-1">Find your app by selecting a country where it's available.</p>
                          </div>
                        </div>

                        {/* Search for an app */}
                        <div className="space-y-1 pt-1 border-t border-slate-800">
                          <label className="block text-[11px] font-semibold text-slate-300">App / Search for an app</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              value={appPromoAppNameSearch}
                              onChange={(e) => setAppPromoAppNameSearch(e.target.value)}
                              placeholder="Enter app name, app ID or exact app store URL"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Performance Goal & Attribution */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Performance goal</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Choose how Meta optimizes delivery for your app promotion ad set.</p>
                        </div>

                        <select
                          value={appPromoPerformanceGoal}
                          onChange={(e) => setAppPromoPerformanceGoal(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                        >
                          <option value="MAXIMIZE_INSTALLS">Maximise number of app installs</option>
                          <option value="MAXIMIZE_APP_EVENTS">Maximise number of in-app events</option>
                          <option value="MAXIMIZE_VALUE">Maximise value of conversions</option>
                        </select>

                        {/* Banner Tip */}
                        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            In-app ad impression and in-app purchase now available
                          </div>
                          <p className="text-[11px] text-slate-300">
                            To reach people who may drive higher in-app ad value, choose <span className="font-semibold text-sky-300">Maximise value of conversions</span>.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cost per result goal</label>
                            <input
                              type="text"
                              value={appPromoCostPerResult}
                              onChange={(e) => setAppPromoCostPerResult(e.target.value)}
                              placeholder="None"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Attribution model</label>
                            <select
                              value={appPromoAttributionModel}
                              onChange={(e) => setAppPromoAttributionModel(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                            >
                              <option value="STANDARD">Standard (7-day click or 1-day view)</option>
                              <option value="1_DAY_CLICK">1-day click</option>
                              <option value="7_DAY_CLICK">7-day click</option>
                              <option value="1_DAY_VIEW">1-day view</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-300">Value rules:</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${appPromoValueRulesEnabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                              Enabled: {appPromoValueRulesEnabled ? "Yes" : "No"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAppPromoStep3ShowMoreSettings(!appPromoStep3ShowMoreSettings)}
                            className="text-[11px] text-sky-400 hover:underline font-semibold"
                          >
                            {appPromoStep3ShowMoreSettings ? "Hide details" : "Show more settings"}
                          </button>
                        </div>
                      </div>

                      {/* Policy and Regulatory Requirements (India) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Policy and regulatory requirements (India)</h4>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                            Mandatory Declaration
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Provide required information about your ads, yourself or your organisation.
                        </p>
                        <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appPromoSecuritiesDeclaration}
                            onChange={(e) => setAppPromoSecuritiesDeclaration(e.target.checked)}
                            className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500 mt-0.5"
                          />
                          <div>
                            <p className="font-medium text-slate-200">This ad set includes ads related to securities and investments</p>
                            <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold mt-0.5">About verification requirements ↗</button>
                          </div>
                        </label>
                      </div>

                      {/* Placements Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Placements</h4>
                              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                                Advantage+ on
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              We'll automatically show ads in the places where people are likely to respond. <button type="button" className="text-sky-400 hover:underline">About placements</button>
                            </p>
                          </div>
                        </div>

                        {/* Value Rule Banner */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <p className="text-xs font-bold text-slate-200">💡 Value rule creation is changing</p>
                          <p className="text-[11px] text-slate-400">
                            You can now add rules closer to where you select your ad set's placements.
                          </p>
                        </div>

                        {/* Placement Value Rules & Explanations */}
                        <div className="space-y-2 pt-1 border-t border-slate-800 text-[11px]">
                          <div>
                            <p className="font-bold text-slate-200">Placement value rules</p>
                            <p className="text-slate-400 mt-0.5">
                              Prioritise the placements that matter most to your business by adjusting bids for them. <button type="button" className="text-sky-400 hover:underline">About value rules</button>
                            </p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">Value rules</p>
                            <p className="text-slate-400 mt-0.5">
                              Tell us how much more certain audiences, conversion locations and placements are worth to your business. Our system will optimise for outcomes based on these rules. <button type="button" className="text-sky-400 hover:underline">About value rules</button>
                            </p>
                          </div>
                          <div className="pt-1 flex items-center justify-between text-slate-400">
                            <span>Account controls: <strong className="text-slate-200">Excluded placements: None</strong></span>
                            <button type="button" className="text-sky-400 hover:underline font-semibold">Show more settings</button>
                          </div>
                        </div>
                      </div>

                      {/* Brand Safety and Suitability */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-200 text-xs">Brand safety and suitability</h4>
                        <div className="space-y-2 text-[11px] text-slate-400">
                          <p>
                            <strong className="text-slate-200">Brand safety:</strong> Meta applies brand safety to all ads through our Community Standards and Monetisation Policies, keeping your ads away from objectionable content.
                          </p>
                          <p>
                            <strong className="text-slate-200">Brand suitability:</strong> In some cases, brands want more control over where ads can appear. Brand suitability filters or excludes specific topics or publishers. Bear in mind that using these controls can lower your reach and increase costs.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppPromoStep3ShowBrandSuitability(!appPromoStep3ShowBrandSuitability)}
                          className="text-[11px] text-sky-400 hover:underline font-semibold"
                        >
                          {appPromoStep3ShowBrandSuitability ? "Hide options" : "Show more options"}
                        </button>
                      </div>

                      {/* Verifying Your Changes Alert */}
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <h5 className="font-bold text-amber-300">Verifying your changes</h5>
                          <p className="text-amber-200/80 text-[11px] mt-0.5 leading-relaxed">
                            Ad sets using lifetime as the budget type must have an end date. Enter an end date that's more than 24 hours after the start time. (#1487094)
                          </p>
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
                        <p className="text-[11px] text-slate-300 font-semibold">Your audience is broad.</p>
                        <p className="text-[11px] text-slate-400">Broad audiences can improve performance and reach more people likely to respond.</p>

                        {/* Narrow -> Broad Visual Slider */}
                        <div className="relative pt-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>Narrow</span>
                            <span className="text-emerald-400 font-bold">Broad</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-400 h-2 rounded-full" style={{ width: "90%" }}></div>
                          </div>
                        </div>

                        {/* Estimated Audience Size Toggle & Value */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={appPromoShowEstimatedAudienceSize}
                              onChange={(e) => setAppPromoShowEstimatedAudienceSize(e.target.checked)}
                              className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-sky-500"
                            />
                            Show estimated audience size
                          </label>
                        </div>

                        {appPromoShowEstimatedAudienceSize && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-0.5 animate-fadeIn">
                            <p className="text-slate-400">Estimated audience size:</p>
                            <p className="text-xs font-bold text-sky-400 font-mono">510,000,000 - 640,000,000</p>
                          </div>
                        )}
                      </div>

                      {/* Campaign Score Card (100 / 100) */}
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

                  {/* SALES OBJECTIVE — AD SET SETUP VIEW (STEP 3) */}
                  {campObjective === "OUTCOME_SALES" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <span>New Sales campaign</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-200 font-bold">New Sales ad set</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">1 Ad • Configure conversion location, pixel datasets, performance goals & audience definition.</p>
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

                      {/* Ad Set Name Input */}
                      <div>
                        <Input
                          label="Ad set name"
                          value={salesAdSetName}
                          onChange={(e: any) => setSalesAdSetName(e.target.value)}
                          placeholder="New Sales ad set"
                          required
                        />
                      </div>

                      {/* Customer Life Cycle Strategy Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Customer life cycle strategy</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Prioritise conversions from people that create most value for your business.
                          </p>
                        </div>
                        <select
                          value={salesLifecycleStrategy}
                          onChange={(e) => setSalesLifecycleStrategy(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                        >
                          <option value="ALL_AUDIENCES">Get conversions from all audiences</option>
                          <option value="HIGH_VALUE">Target high-value customers (Prioritise repeat purchases)</option>
                        </select>
                      </div>

                      {/* Conversion Location & Dataset Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Conversion</h4>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">Conversion location</label>
                          <select
                            value={salesConversionLocation}
                            onChange={(e) => setSalesConversionLocation(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                          >
                            <option value="WEBSITE">Website</option>
                            <option value="APP">App</option>
                            <option value="WEBSITE_AND_APP">Website and App</option>
                            <option value="MESSAGING_APPS">Messaging apps (WhatsApp, Messenger)</option>
                            <option value="CALLS">Calls</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-semibold text-slate-400">Performance goal</label>
                            <button type="button" className="text-[10px] text-sky-400 hover:underline font-semibold">About performance goals</button>
                          </div>
                          <p className="text-[10px] text-slate-500">How you measure success for your ads.</p>
                          <select
                            value={salesPerformanceGoal}
                            onChange={(e) => setSalesPerformanceGoal(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                          >
                            <option value="MAXIMIZE_CONVERSIONS">Maximise number of conversions</option>
                            <option value="MAXIMIZE_VALUE">Maximise value of conversions</option>
                            <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                            <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                          </select>
                        </div>

                        {/* Dataset & Pixel */}
                        <div className="space-y-1 pt-1">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            * Dataset
                          </label>
                          <p className="text-[10px] text-slate-500">Track actions that people take on your website.</p>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-400">Pixel</label>
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-100">{salesPixelName}</span>
                              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ID: {pixelId || "1380912777544016"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Conversion Event Field */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-semibold text-slate-300">
                              * Conversion event
                            </label>
                            <button type="button" className="text-[10px] text-sky-400 hover:underline font-semibold">About conversion events</button>
                          </div>
                          <p className="text-[10px] text-slate-500">The action that you want people to take when they see your ads.</p>
                          <select
                            value={salesConversionEvent}
                            onChange={(e) => setSalesConversionEvent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                          >
                            <option value="">Select an event or search by name</option>
                            <option value="PURCHASE">Purchase</option>
                            <option value="INITIATE_CHECKOUT">Initiate Checkout</option>
                            <option value="ADD_TO_CART">Add To Cart</option>
                            <option value="LEAD">Lead</option>
                            <option value="SUBSCRIBE">Subscribe</option>
                          </select>

                          {/* Set up conversion event alert box */}
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1 mt-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-amber-300">Set up conversion event</h5>
                              <button
                                type="button"
                                onClick={() => setSalesShowSetupConversionEventModal(true)}
                                className="text-[10px] text-amber-400 hover:underline font-bold"
                              >
                                Set up now
                              </button>
                            </div>
                            <p className="text-[11px] text-amber-200/80 leading-relaxed">
                              The dataset that you've selected doesn't have any conversion events set up. Set up a conversion event to help you get better results.{" "}
                              <button type="button" className="text-amber-400 hover:underline font-semibold">
                                Learn how to set up a conversion event
                              </button>
                            </p>
                          </div>
                        </div>

                        {/* Cost per result goal */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-400">Cost per result goal</label>
                          <input
                            type="text"
                            value={salesCostPerResult}
                            onChange={(e) => setSalesCostPerResult(e.target.value)}
                            placeholder="None"
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        {/* Value rules & Attribution model */}
                        <div className="pt-2 border-t border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400">Value rules</span>
                            <span className="text-[11px] text-slate-400 font-medium">Enabled: No</span>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">Attribution model</label>
                            <select
                              value={salesAttributionModel}
                              onChange={(e) => setSalesAttributionModel(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                            >
                              <option value="STANDARD">Standard (7-day click or 1-day view)</option>
                              <option value="1_DAY_CLICK">1-day click</option>
                              <option value="7_DAY_CLICK">7-day click</option>
                            </select>
                          </div>
                        </div>

                        {/* Show more settings */}
                        <button
                          type="button"
                          onClick={() => setSalesStep3ShowMoreSettings(!salesStep3ShowMoreSettings)}
                          className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          {salesStep3ShowMoreSettings ? "Hide settings" : "Show more settings"}
                        </button>

                        {salesStep3ShowMoreSettings && (
                          <div className="pt-2 border-t border-slate-800 space-y-2 animate-fadeIn">
                            <label className="block text-[11px] font-semibold text-slate-400">Delivery type</label>
                            <select
                              value={salesDeliveryType}
                              onChange={(e) => setSalesDeliveryType(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                            >
                              <option value="STANDARD">Standard</option>
                              <option value="ACCELERATED">Accelerated</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Policy and Regulatory Requirements (India) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Policy and regulatory requirements (India)</h4>
                          <button type="button" className="text-[10px] text-sky-400 hover:underline font-semibold">About verification requirements</button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Provide required information about your ads, yourself or your organisation.
                        </p>
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={salesSecuritiesDeclaration}
                            onChange={(e) => setSalesSecuritiesDeclaration(e.target.checked)}
                            className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                          />
                          This ad set includes ads related to securities and investments
                        </label>
                      </div>

                      {/* Placements Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 text-xs">Placements</h4>
                              <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                                Advantage+ on
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              We'll automatically show ads in the places where people are likely to respond. <button type="button" className="text-sky-400 hover:underline font-semibold">About placements</button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={salesPlacementsAdvantage}
                              onChange={(e) => setSalesPlacementsAdvantage(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {/* Banners & Value Rules Info */}
                        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1 text-xs text-sky-300">
                          <p className="font-bold">Value rule creation is changing</p>
                          <p className="text-[11px] leading-relaxed">You can now add rules closer to where you select your ad set's placements.</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                          <p className="font-bold text-slate-200">Placement value rules</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Prioritise the placements that matter most to your business by adjusting bids for them. <button type="button" className="text-sky-400 hover:underline font-semibold">About value rules</button>
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                          <p className="font-bold text-slate-200">Value rules</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Tell us how much more certain audiences, conversion locations and placements are worth to your business. Our system will optimise for outcomes based on these rules. <button type="button" className="text-sky-400 hover:underline font-semibold">About value rules</button>
                          </p>
                        </div>

                        {/* Account Controls */}
                        <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                          <h5 className="font-bold text-slate-200">Account controls</h5>
                          <p className="text-[11px] text-slate-400">Excluded placements: None</p>
                          <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold pt-1">Show more settings</button>
                        </div>
                      </div>

                      {/* Brand Safety and Suitability Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Brand safety and suitability</h4>
                          <button
                            type="button"
                            onClick={() => setSalesStep3ShowBrandSuitability(!salesStep3ShowBrandSuitability)}
                            className="text-[11px] text-sky-400 hover:underline font-semibold"
                          >
                            {salesStep3ShowBrandSuitability ? "Hide options" : "Show more options"}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <span className="font-semibold text-slate-300">Brand safety:</span> Meta applies brand safety to all ads through our Community Standards and Monetisation Policies, keeping your ads away from objectionable content.
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <span className="font-semibold text-slate-300">Brand suitability:</span> In some cases, brands want more control over where ads can appear. Brand suitability filters or excludes specific topics or publishers. Bear in mind that using these controls can lower your reach and increase costs.
                        </p>
                      </div>

                      {/* Audience Definition Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-200 text-xs">Audience definition</h4>
                            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                              Your audience is broad.
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Broad audiences can improve performance and reach more people likely to respond.
                          </p>
                        </div>

                        {/* Audience Gauge Bar */}
                        <div className="py-2 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Specific</span>
                            <span className="text-sky-400">Broad</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                            <div className="w-1/3 bg-amber-500/40"></div>
                            <div className="w-1/3 bg-emerald-500/40"></div>
                            <div className="w-1/3 bg-sky-500"></div>
                          </div>
                        </div>

                        {/* Estimated Audience Size Toggle & Value */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={salesShowEstimatedAudienceSize}
                              onChange={(e) => setSalesShowEstimatedAudienceSize(e.target.checked)}
                              className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-sky-500"
                            />
                            Show estimated audience size
                          </label>
                        </div>

                        {salesShowEstimatedAudienceSize && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-0.5 animate-fadeIn">
                            <p className="text-slate-400">Estimated audience size:</p>
                            <p className="text-xs font-bold text-sky-400 font-mono">510,000,000 - 640,000,000</p>
                          </div>
                        )}
                      </div>

                      {/* Campaign Score Card (100 / 100) */}
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
                              <span className="text-[11px] text-slate-300 font-medium">⚡ Advantage+ sales campaign</span>
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

                  {/* LEADS NEW CAMPAIGN — AD SET SETUP VIEW */}
                  {campObjective === "OUTCOME_LEADS" && leadsStartMode === "NEW" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <span>New Leads campaign</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-200 font-bold">New Leads ad set</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Configure conversion location, instant form setup, Page terms, and performance goals.</p>
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
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Choose where you want to generate leads.{" "}
                            <button type="button" className="text-sky-400 hover:underline">
                              About conversion locations
                            </button>
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-400">Conversion location</label>
                          <div className="relative">
                            <select
                              value={leadsConversionLocation}
                              onChange={(e) => setLeadsConversionLocation(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500 cursor-pointer appearance-none pr-8"
                            >
                              <optgroup label="Multiple — Send people where they're most likely to convert">
                                <option value="WEBSITE_AND_INSTANT_FORMS">Website and instant forms</option>
                                <option value="WEBSITE_AND_CALLS">Website and calls</option>
                                <option value="INSTANT_FORMS_AND_MESSENGER">Instant forms and Messenger</option>
                              </optgroup>
                              <optgroup label="Single — Send people to one location where you want them to convert">
                                <option value="INSTANT_FORMS">Instant forms (Recommended)</option>
                                <option value="WEBSITE">Website</option>
                                <option value="MESSENGER">Messenger</option>
                                <option value="INSTAGRAM">Instagram</option>
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="CALLS">Calls</option>
                                <option value="APP">App</option>
                              </optgroup>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {leadsConversionLocation.startsWith("WEBSITE_AND_INSTANT_FORMS")
                              ? "Send people to your website or instant forms where they're most likely to convert."
                              : leadsConversionLocation.startsWith("WEBSITE_AND_CALLS")
                                ? "Send people to your website or encourage calls based on user intent."
                                : leadsConversionLocation.startsWith("INSTANT_FORMS_AND_MESSENGER")
                                  ? "Collect leads via instant forms and engage via Messenger."
                                  : "Send people to one primary location where you want them to convert."}
                          </p>
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
                            <Check className="h-3 w-3" />
                            All edits saved
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

                  {/* SALES OBJECTIVE — AD CREATIVE & PUBLISHING VIEW (STEP 4) */}
                  {campObjective === "OUTCOME_SALES" && (
                    <div className="space-y-4">
                      {/* Top Header Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <span>New Sales campaign</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span>New Sales ad set</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-200 font-bold">New Sales ad</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Configure partnership identity, ad setup, creative media, promotions & tracking.</p>
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

                      {/* Ad Name Input */}
                      <div>
                        <Input
                          label="Ad name"
                          value={salesAdName}
                          onChange={(e: any) => setSalesAdName(e.target.value)}
                          placeholder="New Sales ad"
                          required
                        />
                      </div>

                      {/* Partnership Ad Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-100 text-xs">Partnership ad</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${partnershipAd ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {partnershipAd ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
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

                        {/* Options rendered when Partnership ad is On */}
                        {partnershipAd && (
                          <div className="pt-3 border-t border-slate-800 space-y-2.5 animate-fadeIn">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                              <span>Choose how to create your ad</span>
                              <span
                                className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-help"
                                title="Select whether to use a partner ad code or choose an existing creator partnership"
                              >
                                ℹ
                              </span>
                            </div>

                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => setShowPartnershipCodeModal(true)}
                                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 text-xs font-semibold text-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                Enter ad code or post info
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowSelectPartnershipModal(true)}
                                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 text-xs font-semibold text-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                Select partnership
                              </button>
                            </div>

                            {/* Active selections indicator */}
                            {(partnershipCodeApplied || selectedPartnerIdentity) && (
                              <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 flex items-center justify-between mt-2">
                                <div>
                                  {partnershipCodeApplied && (
                                    <p className="font-semibold">✓ Ad code applied: <span className="font-mono text-slate-200">{partnershipAdCode || "PARTNER-CODE-994"}</span></p>
                                  )}
                                  {selectedPartnerIdentity && (
                                    <p className="font-semibold">✓ Selected partner identity: <span className="font-bold text-slate-200">@{selectedPartnerIdentity}</span></p>
                                  )}
                                </div>
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">Verified</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Ad Setup Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Ad setup</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Select an existing post or create a new one</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ad setup mode</label>
                            <select
                              value={salesAdSetupMode}
                              onChange={(e) => setSalesAdSetupMode(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                            >
                              <option value="USE_EXISTING">Use existing post</option>
                              <option value="CREATE_NEW">Create new ad</option>
                              <option value="USE_MOCK_CATALOG">Use mock catalog</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ad sources</label>
                            <select
                              value={salesAdSource}
                              onChange={(e) => setSalesAdSource(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                            >
                              <option value="META_CATALOG">Meta Product Catalog</option>
                              <option value="INSTAGRAM_POSTS">Instagram Creator Posts</option>
                              <option value="MANUAL_UPLOAD">Manual Creative Upload</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Ad Creative Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Ad creative</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              Select and optimise your ad text, media and enhancements. Select a post to publish a partnership ad. To see more available posts, select the other identity.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSelectPartnerContentModal(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 shrink-0 flex items-center gap-1.5 transition-all mt-0.5"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            Select post
                          </button>
                        </div>

                        <Input
                          label="Headline"
                          value={campHeadline}
                          onChange={(e: any) => setCampHeadline(e.target.value)}
                          placeholder="Exclusive Sales — Up to 50% OFF!"
                        />
                        <Textarea
                          label="Primary Body Text"
                          value={campBody}
                          onChange={(e: any) => setCampBody(e.target.value)}
                          placeholder="Shop our best-selling products today. Fast shipping and instant WhatsApp customer support."
                          rows={2}
                        />

                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-400">Ad Media Banner URL</label>
                          <button
                            type="button"
                            onClick={fetchMediaAssets}
                            className="text-[10px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            {fetchingMedia ? <Loader2 className="h-3 w-3 animate-spin" /> : <Layers className="h-3 w-3" />}
                            Fetch Meta Library
                          </button>
                        </div>
                        <Input
                          value={campMediaUrl}
                          onChange={(e: any) => setCampMediaUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600"
                        />

                        {/* AI Media Transparency Checkbox */}
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={appPromoMediaAiCreated}
                              onChange={(e) => setAppPromoMediaAiCreated(e.target.checked)}
                              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                            />
                            <span className="font-bold text-slate-200">Ad includes media created or edited with AI</span>
                          </label>
                          <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                            Ticking this box may add an AI info label to your ad. <button type="button" className="text-sky-400 hover:underline font-semibold">About AI transparency</button>
                          </p>
                        </div>

                        {/* Testimonial Section */}
                        <div className="pt-2 border-t border-slate-800 space-y-1.5">
                          <h5 className="font-bold text-slate-200 text-xs">Testimonial</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Add text from your partner. Provide information about your brand or product to complement the content. <button type="button" className="text-sky-400 hover:underline font-semibold">About testimonials</button>
                          </p>
                          <Textarea
                            label=""
                            value={appPromoTestimonialText}
                            onChange={(e: any) => setAppPromoTestimonialText(e.target.value)}
                            placeholder="Add text from your partner..."
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Highlight Your Promotions Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Highlight your promotions</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Highlight your promotions before and after people tap on your ad to increase conversions and capture email leads.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200">Promo codes</span>
                            <button
                              type="button"
                              onClick={() => setSalesShowPromoCodesModal(true)}
                              className="text-[11px] text-sky-400 font-semibold hover:underline"
                            >
                              Manage promo codes
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Choose between automatically sourcing or manually adding promo codes.
                          </p>
                        </div>
                      </div>

                      {/* Tracking Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs">Tracking</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Choose conversion events to track. This ad account's selected conversion dataset will be tracked by default.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Website events block */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="salesTrackWebsiteEvents"
                                checked={appPromoTrackWebsiteEvents}
                                onChange={(e) => setAppPromoTrackWebsiteEvents(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950 cursor-pointer"
                              />
                              <label htmlFor="salesTrackWebsiteEvents" className="text-xs font-bold text-slate-100 cursor-pointer">
                                Website events
                              </label>
                            </div>
                            {appPromoTrackWebsiteEvents && (
                              <div className="pl-6 space-y-0.5 animate-fadeIn">
                                <p className="text-xs font-semibold text-slate-200">JISNU Digital Website Pixel</p>
                                <p className="text-[11px] font-mono text-slate-400">Pixel ID: {pixelId || "1380912777544016"}</p>
                              </div>
                            )}
                          </div>

                          {/* App events block */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="salesTrackAppEvents"
                                checked={appPromoTrackAppEvents}
                                onChange={(e) => setAppPromoTrackAppEvents(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950 cursor-pointer"
                              />
                              <label htmlFor="salesTrackAppEvents" className="text-xs font-bold text-slate-100 cursor-pointer">
                                App events
                              </label>
                            </div>
                          </div>

                          {/* Offline events block */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="salesTrackOfflineEvents"
                                checked={appPromoTrackOfflineEvents}
                                onChange={(e) => setAppPromoTrackOfflineEvents(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950 cursor-pointer"
                              />
                              <label htmlFor="salesTrackOfflineEvents" className="text-xs font-bold text-slate-100 cursor-pointer">
                                Offline events
                              </label>
                            </div>

                            <div className="pl-6 space-y-2 text-xs text-slate-300">
                              <button
                                type="button"
                                onClick={() => setShowEditOfflineSetsModal(true)}
                                className="text-sky-400 hover:underline font-semibold text-[11px]"
                              >
                                Edit tracked offline event sets
                              </button>
                            </div>
                          </div>

                          {/* URL Parameters Field */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-100">URL parameters</label>
                              <button
                                type="button"
                                onClick={() => setSalesShowUrlParametersModal(true)}
                                className="text-[11px] text-sky-400 font-semibold hover:underline"
                              >
                                Build a URL parameter
                              </button>
                            </div>
                            <input
                              type="text"
                              value={salesUrlParameters}
                              onChange={(e) => setSalesUrlParameters(e.target.value)}
                              placeholder="key1=value1&key2=value2"
                              className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                            />
                          </div>
                        </div>

                        {/* Third-party reporting */}
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                          <h5 className="font-bold text-slate-200">Third-party reporting</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Meta purchases may not be included in your Google reporting. Connect your account to measure actions on ads that send people to your website or shop.{" "}
                            <button type="button" className="text-sky-400 hover:underline font-semibold">
                              Learn more
                            </button>
                          </p>
                        </div>
                      </div>

                      {/* Live Mobile Sales Ad Preview Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Ad preview</h4>
                          <span className="text-[10px] text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            Sales Creative Preview
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 max-w-sm mx-auto shadow-xl">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-slate-950 font-bold flex items-center justify-center text-xs">S</div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{fetchedPages[0]?.name || "JISNU Digital Solutions"}</p>
                              <p className="text-[10px] text-slate-400">Sponsored • Sales</p>
                            </div>
                          </div>

                          {campMediaUrl ? (
                            <div className="w-full h-36 rounded-xl overflow-hidden bg-black">
                              <img src={campMediaUrl} alt="Sales banner" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-600">
                              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-[10px] font-semibold mt-1">No media attached</span>
                            </div>
                          )}

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-100">{campHeadline || "Exclusive Sales — Up to 50% OFF!"}</p>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{campBody || "Shop our best-selling products today. Fast shipping and instant WhatsApp support."}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono font-semibold">jisnudigital.com</span>
                            <button type="button" className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20">
                              Shop Now
                            </button>
                          </div>
                        </div>
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
                  {/* APP PROMOTION — AD LEVEL SETUP VIEW (STEP 4) */}
                  {campObjective === "OUTCOME_APP_PROMOTION" && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Top Header Breadcrumb Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <span>New App promotion Campaign</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span>New App promotion Ad set</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-200 font-bold">New App promotion Ad</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Configure partnership ad settings, destination deep links, AI creative labels, and tracking.</p>
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

                      {/* Ad Name Input */}
                      <div>
                        <Input
                          label="Ad Name"
                          value={adName}
                          onChange={(e: any) => setAdName(e.target.value)}
                          placeholder="New App promotion ad"
                          required
                        />
                      </div>

                      {/* Partnership Ad Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-100 text-xs">Partnership ad</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${partnershipAd ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}>
                                {partnershipAd ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
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

                        {/* Options rendered when Partnership ad is On */}
                        {partnershipAd && (
                          <div className="pt-3 border-t border-slate-800 space-y-2.5 animate-fadeIn">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                              <span>Choose how to create your ad</span>
                              <span
                                className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-help"
                                title="Select whether to use a partner ad code or choose an existing creator partnership"
                              >
                                ℹ
                              </span>
                            </div>

                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => setShowPartnershipCodeModal(true)}
                                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 text-xs font-semibold text-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                Enter ad code or post info
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowSelectPartnershipModal(true)}
                                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 text-xs font-semibold text-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                Select partnership
                              </button>
                            </div>

                            {/* Active selections indicator */}
                            {(partnershipCodeApplied || selectedPartnerIdentity) && (
                              <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 flex items-center justify-between mt-2">
                                <div>
                                  {partnershipCodeApplied && (
                                    <p className="font-semibold">✓ Ad code applied: <span className="font-mono text-slate-200">{partnershipAdCode || "PARTNER-CODE-994"}</span></p>
                                  )}
                                  {selectedPartnerIdentity && (
                                    <p className="font-semibold">✓ Selected partner identity: <span className="font-bold text-slate-200">@{selectedPartnerIdentity}</span></p>
                                  )}
                                </div>
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">Verified</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Ad Setup & Destination Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">Destination</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Tell us where to send people immediately after they tap or click your ad.{" "}
                            <button type="button" className="text-sky-400 hover:underline font-semibold">
                              Learn more
                            </button>
                          </p>
                        </div>

                        {/* Main Destination Selection Card */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-400">Main destination</label>
                          <div className="relative">
                            <select
                              value={appPromoMainDestination}
                              onChange={(e) => setAppPromoMainDestination(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500 cursor-pointer appearance-none pr-8"
                            >
                              <option value="APP">App — Send people to your app</option>
                              <option value="INSTANT_EXPERIENCE">Instant Experience — Send people to a fast-loading, mobile-optimised experience</option>
                              <option value="PLAYABLE_SOURCE">Playable source — Send people to play an interactive demo of your app</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                          </div>

                          {/* Dynamic Destination Info Cards */}
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">
                                {appPromoMainDestination === "APP"
                                  ? "App"
                                  : appPromoMainDestination === "INSTANT_EXPERIENCE"
                                    ? "Instant Experience"
                                    : "Playable source"}
                              </span>
                              {appPromoMainDestination === "APP" && (
                                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                                  Default destination
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {appPromoMainDestination === "APP"
                                ? "Send people to your app."
                                : appPromoMainDestination === "INSTANT_EXPERIENCE"
                                  ? "Send people to a fast-loading, mobile-optimised experience."
                                  : "Send people to play an interactive demo of your app."}
                            </p>
                          </div>
                        </div>

                        {/* Deferred Deep Link & Custom Store Listing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">
                              Deferred deep link <span className="text-slate-500 font-normal">∙ Optional</span>
                            </label>
                            <input
                              type="text"
                              value={appPromoDeferredDeepLink}
                              onChange={(e) => setAppPromoDeferredDeepLink(e.target.value)}
                              placeholder="Enter the deferred deep link URL"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">
                              Custom store listing <span className="text-slate-500 font-normal">∙ Optional</span>
                            </label>
                            <input
                              type="text"
                              value={appPromoCustomStoreListingId}
                              onChange={(e) => setAppPromoCustomStoreListingId(e.target.value)}
                              placeholder="Enter custom store listing ID"
                              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ad Creative Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">Ad creative</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              Select and optimise your ad text, media and enhancements. Select a post to publish a partnership ad. To see more available posts, select the other identity.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSelectPartnerContentModal(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 shrink-0 flex items-center gap-1.5 transition-all mt-0.5"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            Select post
                          </button>
                        </div>

                        <Input
                          label="Headline"
                          value={campHeadline}
                          onChange={(e: any) => setCampHeadline(e.target.value)}
                          placeholder="Download WhatsApp Automation App Today!"
                        />
                        <Textarea
                          label="Primary Body Text"
                          value={campBody}
                          onChange={(e: any) => setCampBody(e.target.value)}
                          placeholder="Boost your business messaging efficiency by 10x with automated replies and bulk broadcasts."
                          rows={2}
                        />

                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-400">Ad Media Banner URL</label>
                          <button
                            type="button"
                            onClick={fetchMediaAssets}
                            className="text-[10px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            {fetchingMedia ? <Loader2 className="h-3 w-3 animate-spin" /> : <Layers className="h-3 w-3" />}
                            Fetch Meta Library
                          </button>
                        </div>
                        <Input
                          value={campMediaUrl}
                          onChange={(e: any) => setCampMediaUrl(e.target.value)}
                          placeholder="https://example.com/app-banner.jpg"
                        />

                        {/* AI Media Checkbox */}
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={appPromoMediaAiCreated}
                              onChange={(e) => setAppPromoMediaAiCreated(e.target.checked)}
                              className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-700 text-sky-500"
                            />
                            <span className="font-semibold text-slate-200">Ad includes media created or edited with AI</span>
                          </label>
                          <p className="text-[10px] text-slate-500 pl-5 leading-relaxed">
                            Ticking this box may add an AI info label to your ad. <button type="button" className="text-sky-400 hover:underline">About AI transparency</button>
                          </p>
                        </div>

                        {/* Testimonial Section */}
                        <div className="pt-2 border-t border-slate-800 space-y-1.5">
                          <h5 className="font-bold text-slate-200 text-xs">Testimonial</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Add text from your partner. Provide information about your brand or product to complement the content. <button type="button" className="text-sky-400 hover:underline">About testimonials</button>
                          </p>
                          <Textarea
                            label=""
                            value={appPromoTestimonialText}
                            onChange={(e: any) => setAppPromoTestimonialText(e.target.value)}
                            placeholder="Add text from your partner..."
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Languages Card (Below Ad Creative) */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-100 text-xs">Languages</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${appPromoLanguagesEnabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                                {appPromoLanguagesEnabled ? "On" : "Off"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Add your own translations or automatically translate your ad to reach people in more languages.{" "}
                              <button type="button" className="text-sky-400 hover:underline font-semibold">
                                Learn more
                              </button>
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                            <input
                              type="checkbox"
                              checked={appPromoLanguagesEnabled}
                              onChange={(e) => setAppPromoLanguagesEnabled(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                          </label>
                        </div>

                        {appPromoLanguagesEnabled && (
                          <div className="pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                            <p className="text-xs font-semibold text-slate-200">Translation settings & language options</p>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                              <p className="text-[11px] text-slate-400">
                                Automatic translations will translate your primary text and headlines into viewer preferred languages.
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[11px] font-bold text-sky-400">Default language: English</span>
                                <button type="button" className="text-[11px] text-sky-400 hover:underline font-semibold">+ Add language</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tracking Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs">Tracking</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Choose conversion events to track. This ad account's selected conversion dataset will be tracked by default.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Website events block */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="trackWebsiteEvents"
                                checked={appPromoTrackWebsiteEvents}
                                onChange={(e) => setAppPromoTrackWebsiteEvents(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950 cursor-pointer"
                              />
                              <label htmlFor="trackWebsiteEvents" className="text-xs font-bold text-slate-100 cursor-pointer">
                                Website events
                              </label>
                            </div>
                            {appPromoTrackWebsiteEvents && (
                              <div className="pl-6 space-y-0.5 animate-fadeIn">
                                <p className="text-xs font-semibold text-slate-200">JISNU Digital Website Pixel</p>
                                <p className="text-[11px] font-mono text-slate-400">Pixel ID: {pixelId || "1380912777544016"}</p>
                              </div>
                            )}
                          </div>

                          {/* App events block */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="trackAppEvents"
                                checked={appPromoTrackAppEvents}
                                onChange={(e) => setAppPromoTrackAppEvents(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950 cursor-pointer"
                              />
                              <label htmlFor="trackAppEvents" className="text-xs font-bold text-slate-100 cursor-pointer">
                                App events
                              </label>
                            </div>
                          </div>

                          {/* Offline events block */}
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="trackOfflineEvents"
                                checked={appPromoTrackOfflineEvents}
                                onChange={(e) => setAppPromoTrackOfflineEvents(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950 cursor-pointer"
                              />
                              <label htmlFor="trackOfflineEvents" className="text-xs font-bold text-slate-100 cursor-pointer">
                                Offline events
                              </label>
                            </div>

                            <div className="pl-6 space-y-2 text-xs text-slate-300">
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                We'll use the following offline event set for tracking and data upload:
                              </p>
                              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                                <p className="font-semibold text-slate-100">{offlineEventSetName}</p>
                                <p className="text-[11px] font-mono text-slate-400">Dataset ID: {offlineDatasetId}</p>
                              </div>

                              <div className="flex items-center gap-4 pt-1 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => setShowEditOfflineSetsModal(true)}
                                  className="text-sky-400 hover:underline font-semibold"
                                >
                                  Edit tracked offline event sets
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowEventsManagerModal(true)}
                                  className="text-sky-400 hover:underline font-semibold"
                                >
                                  Manage Events Manager data sets
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Third-party reporting */}
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                          <h5 className="font-bold text-slate-200">Third-party reporting</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Meta purchases may not be included in your Google reporting. Connect your account to measure actions on ads that send people to your website or shop.{" "}
                            <button type="button" className="text-sky-400 hover:underline font-semibold">
                              Learn more
                            </button>
                          </p>
                        </div>
                      </div>

                      {/* Ad Preview Card */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200 text-xs">Ad preview</h4>
                          <span className="text-[10px] text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            Mobile App Preview
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 max-w-sm mx-auto shadow-xl">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">A</div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{fetchedPages[0]?.name || "WhatsApp Automation App"}</p>
                              <p className="text-[10px] text-slate-400">Sponsored • Mobile App Store</p>
                            </div>
                          </div>

                          {campMediaUrl ? (
                            <div className="w-full h-36 rounded-xl overflow-hidden bg-black">
                              <img src={campMediaUrl} alt="Ad banner" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full h-28 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                              App Promotion Image/Banner Preview
                            </div>
                          )}

                          <div className="space-y-1">
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                              {campBody || "Boost your business messaging efficiency by 10x with automated replies."}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-500">Google Play Store</p>
                              <p className="text-xs font-bold text-slate-100">{campHeadline || "Install WhatsApp Automation App"}</p>
                            </div>
                            <span className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-[11px] shadow-sm">
                              Install Now
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Legal Terms & Status Bar */}
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

                  {campObjective !== "OUTCOME_APP_PROMOTION" && (
                    <>
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
                                    : campObjective === "OUTCOME_SALES"
                                      ? "New Sales ad"
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

                      {/* Ad Setup Section (Step 4) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs">Ad setup</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Select an existing post or create a new one
                          </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "CREATE", label: "Create ad" },
                            { id: "EXISTING", label: "Use existing post" }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                if (campObjective === "OUTCOME_LEADS") setLeadsAdSetupMode(mode.id as any);
                                else setEngManualAdSetupMode(mode.id as any);
                              }}
                              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${(campObjective === "OUTCOME_LEADS" ? leadsAdSetupMode : engManualAdSetupMode) === mode.id || mode.id === "CREATE"
                                ? "bg-sky-500/10 border-sky-500/50 text-sky-400"
                                : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                                }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>

                        {/* Format Section */}
                        <div className="pt-3 border-t border-slate-800 space-y-2.5">
                          <div>
                            <h5 className="font-bold text-slate-200 text-xs">Format</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">Choose an ad creative layout.</p>
                          </div>

                          <div className="space-y-2">
                            {[
                              { id: "SINGLE_IMAGE", title: "Single image or video", desc: "One image or video, or a slide show with multiple images" },
                              { id: "CAROUSEL", title: "Carousel", desc: "2 or more scrollable images or videos" }
                            ].map((fmt) => (
                              <div
                                key={fmt.id}
                                onClick={() => setAdFormat(fmt.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${adFormat === fmt.id
                                  ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="adFormat"
                                  checked={adFormat === fmt.id}
                                  onChange={() => setAdFormat(fmt.id)}
                                  className="mt-0.5 h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 shrink-0"
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-100">{fmt.title}</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{fmt.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Multi-advertiser ads Section */}
                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-xs text-slate-100">Multi-advertiser ads</h5>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                              <input
                                type="checkbox"
                                checked={multiAdvertiserAds}
                                onChange={(e) => setMultiAdvertiserAds(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Your ad can appear with others in the same ad unit to help promote discoverability. Your ad creative may be resized or cropped. <button type="button" className="text-sky-400 hover:underline font-semibold">About multi-advertiser ads</button>
                          </p>
                        </div>
                      </div>

                      {/* Ad Creative Card (Step 4) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs">Ad creative</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Select and optimise your ad text, media and enhancements.
                          </p>
                        </div>

                        {/* Media */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-200">
                              * Media
                            </label>
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
                            placeholder="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600"
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

                        {/* AI Media Transparency Checkbox */}
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={appPromoMediaAiCreated}
                              onChange={(e) => setAppPromoMediaAiCreated(e.target.checked)}
                              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                            />
                            <span className="font-bold text-slate-200">Ad includes media created or edited with AI</span>
                          </label>
                          <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                            Ticking this box may add an AI info label to your ad. <button type="button" className="text-sky-400 hover:underline font-semibold">About AI transparency</button>
                          </p>
                        </div>

                        {/* Primary text */}
                        <div className="space-y-1 pt-1 border-t border-slate-800">
                          <label className="block text-xs font-bold text-slate-200">Primary text</label>
                          <Textarea
                            label=""
                            value={campBody}
                            onChange={(e: any) => setCampBody(e.target.value)}
                            placeholder="Helping businesses grow digitally with smart strategies and powerful branding. 📈 Meta Ads Google Ads Social Media Management Creative Design, Let’s turn your vision into digital success!"
                            rows={3}
                          />
                        </div>

                        {/* Add a destination Card */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                          <div>
                            <h5 className="font-bold text-xs text-slate-100">Add a destination</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              If you add a destination, you can send people immediately after they've tapped or clicked your ad to a website, a full-screen experience or a call. If you don't, they'll be sent to your Facebook Page or Instagram profile.
                            </p>
                          </div>

                          {/* Headline */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-200">Headline</label>
                            <Input
                              label=""
                              value={campHeadline}
                              onChange={(e: any) => setCampHeadline(e.target.value)}
                              placeholder="Chat with us"
                            />
                          </div>

                          {/* Description */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-200">Description</label>
                            <Input
                              label=""
                              value={salesAdDescription}
                              onChange={(e: any) => setSalesAdDescription(e.target.value)}
                              placeholder="Optional description text..."
                            />
                          </div>

                          {/* Call to action */}
                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <div>
                              <label className="block text-xs font-bold text-slate-200">Call to action</label>
                              <p className="text-[11px] text-slate-400">Select an item</p>
                            </div>
                            <select
                              value={callToAction}
                              onChange={(e) => setCallToAction(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-sky-400 font-bold focus:outline-none focus:border-sky-500"
                            >
                              <option value="WHATSAPP_MESSAGE">Send WhatsApp message</option>
                              <option value="LEARN_MORE">Learn More</option>
                              <option value="CONTACT_US">Contact Us</option>
                              <option value="SHOP_NOW">Shop Now</option>
                              <option value="BOOK_NOW">Book Now</option>
                              <option value="GET_OFFER">Get Offer</option>
                              <option value="SIGN_UP">Sign Up</option>
                            </select>

                            {/* Connected WhatsApp Notice Box */}
                            {callToAction === "WHATSAPP_MESSAGE" && (
                              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] text-slate-300 leading-relaxed animate-fadeIn">
                                <p>
                                  When people click the button on an ad, they'll be able to send a message to the WhatsApp number connected to your Page.
                                </p>
                                <p className="font-semibold text-emerald-400">
                                  Connected WhatsApp number: <span className="font-mono text-slate-100">+91 7709936965</span>. <button type="button" className="text-sky-400 hover:underline font-bold">Edit in Page settings.</button>
                                </p>
                                <p className="text-slate-400">
                                  WhatsApp information, including names and phone numbers, is subject to the data use restrictions in the Meta Advertising Policies. Your business and ads must also comply with the WhatsApp Commerce Policy. Links to WhatsApp on your website may be modified when people view your site in Facebook or Instagram.
                                </p>
                                <p className="text-slate-400">
                                  Your ads that click to WhatsApp show "Active on WhatsApp" when you're using the WhatsApp Business app. This lets people viewing your ads know they can expect a quick reply. You can turn this off in your WhatsApp privacy settings.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
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

                      {/* Destination Card (Step 4) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs">Destination</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Tell us where to send people immediately after they tap or click your ad. <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                          </p>
                        </div>

                        {/* Destination Type Radio Group */}
                        <div className="space-y-2">
                          {[
                            {
                              id: "INSTANT_EXPERIENCE",
                              title: "Instant Experience",
                              desc: "Send people to a fast-loading, mobile-optimised experience."
                            },
                            {
                              id: "WEBSITE",
                              title: "Website",
                              desc: "Send people to your website."
                            },
                            {
                              id: "CALL",
                              title: "Call",
                              desc: "Let people call you directly."
                            },
                            {
                              id: "MESSAGING",
                              title: "Messaging apps",
                              desc: "Send people to Messenger, Instagram and WhatsApp."
                            }
                          ].map((dest) => (
                            <div
                              key={dest.id}
                              onClick={() => setStep4DestinationType(dest.id as any)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${step4DestinationType === dest.id
                                ? "bg-sky-500/10 border-sky-500/50 text-slate-100"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                }`}
                            >
                              <input
                                type="radio"
                                name="step4DestinationType"
                                checked={step4DestinationType === dest.id}
                                onChange={() => setStep4DestinationType(dest.id as any)}
                                className="mt-0.5 h-4 w-4 text-sky-500 bg-slate-900 border-slate-700 shrink-0"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-100">{dest.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{dest.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* When Messaging Apps is selected */}
                        {step4DestinationType === "MESSAGING" && (
                          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
                            {/* Messenger */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">Messenger</label>
                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700/60 text-xs font-bold text-sky-400 flex items-center gap-2">
                                <span>💬</span> {fetchedPages[0]?.name || "JISNU Digital Solutions Pvt.Ltd"}
                              </div>
                            </div>

                            {/* Instagram */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-200">Instagram</label>
                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700/60 text-xs font-bold text-sky-400 flex items-center gap-2">
                                <span>📸</span> @{instagramProfile || "jisnu_digitalsolution_pvt_ltd"}
                              </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-slate-200">WhatsApp</label>
                              <div className="space-y-1">
                                <select
                                  value={step4WhatsappNumber}
                                  onChange={(e) => setStep4WhatsappNumber(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
                                >
                                  <option value="+91 77099 36965">+91 77099 36965</option>
                                  <option value="CONNECT_NEW">+ Connect new WhatsApp number</option>
                                </select>
                                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                                  You can connect a maximum of 50 WhatsApp numbers per Facebook Page.
                                  Edit WhatsApp numbers in Business Manager and number connections in Page settings.
                                </p>
                              </div>
                            </div>

                            {/* Ads data sharing */}
                            <div className="pt-3 border-t border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-bold text-xs text-slate-200">Ads data sharing</h5>
                                  <p className="text-[11px] text-slate-400">{step4AdsDataSharing ? "On" : "Off"}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                  <input
                                    type="checkbox"
                                    checked={step4AdsDataSharing}
                                    onChange={(e) => setStep4AdsDataSharing(e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                                </label>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-2 leading-relaxed">
                                <p>
                                  WhatsApp information, including names and phone numbers, is subject to the data use restrictions in the Meta Advertising Policies. Your business and ads must also comply with the WhatsApp Commerce Policy. Links to WhatsApp on your website may be modified when people view your site in Facebook or Instagram.
                                </p>
                                <p>
                                  Your ads that click to WhatsApp show "Active on WhatsApp" when you're using the WhatsApp Business app. This lets people viewing your ads know they can expect a quick reply. You can turn this off in your WhatsApp privacy settings.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Conversations / Chat Template Card (Step 4) */}
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-100 text-xs">Conversations</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            Choose a template for beginning the chat after people tap on your ad. <button type="button" className="text-sky-400 hover:underline font-semibold">Learn more</button>
                          </p>
                        </div>

                        {/* Recommendation Opportunity Banner */}
                        <div className="p-4 rounded-xl bg-slate-900 border-l-4 border-l-purple-500 border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                              ⚡ You could get 7% more messages by adding recommended settings
                            </span>
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                              +7%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Make it easier for people to start chats with AI-generated questions and more. You can edit as needed.
                          </p>
                        </div>

                        {/* Recommended Chat Template Box */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">Recommended chat template</span>
                              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                                🤖 AI
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowChatTemplateModal(true)}
                              className="text-xs text-sky-400 hover:underline font-semibold"
                            >
                              Edit template
                            </button>
                          </div>

                          {/* Greeting */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">Greeting</label>
                            <input
                              type="text"
                              value={chatTemplateGreeting}
                              onChange={(e) => setChatTemplateGreeting(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                            />
                          </div>

                          {/* Questions and responses */}
                          <div className="space-y-2 pt-1 border-t border-slate-800">
                            <label className="block text-[11px] font-semibold text-slate-400">Questions and responses</label>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-bold shrink-0">1.</span>
                                <input
                                  type="text"
                                  value={chatTemplateQuestion1}
                                  onChange={(e) => setChatTemplateQuestion1(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-bold shrink-0">2.</span>
                                <input
                                  type="text"
                                  value={chatTemplateQuestion2}
                                  onChange={(e) => setChatTemplateQuestion2(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-bold shrink-0">3.</span>
                                <input
                                  type="text"
                                  value={chatTemplateQuestion3}
                                  onChange={(e) => setChatTemplateQuestion3(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

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
                    </>
                  )}
                </div>
              )}

            </div>


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
                    if (campaignStep === 2 && campObjective === "OUTCOME_TRAFFIC" && trafficSubStep === "CONFIG") {
                      setTrafficSubStep("CHOICE");
                    } else if (campaignStep === 2 && campObjective === "OUTCOME_LEADS" && leadsSubStep === "CONFIG") {
                      setLeadsSubStep("CHOICE");
                    } else if (campaignStep > 1) {
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
                    onClick={() => {
                      if (campaignStep === 2 && campObjective === "OUTCOME_TRAFFIC" && trafficSubStep === "CHOICE") {
                        setTrafficSubStep("CONFIG");
                      } else if (campaignStep === 2 && campObjective === "OUTCOME_LEADS" && leadsSubStep === "CHOICE") {
                        setLeadsSubStep("CONFIG");
                      } else {
                        setCampaignStep((prev) => prev + 1);
                      }
                    }}
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
                    {creatingCamp
                      ? "PUBLISHING 1 OF 1..."
                      : campObjective === "OUTCOME_APP_PROMOTION"
                        ? "Publish (PUBLISHING 1 OF 1)"
                        : "Publish Campaign Live"}
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

      {/* SETUP CONVERSION EVENT MODAL */}
      {salesShowSetupConversionEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Set up conversion event</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure web purchase, checkout, or lead events for your pixel dataset.</p>
              </div>
              <button
                type="button"
                onClick={() => setSalesShowSetupConversionEventModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Standard Event</label>
                <select
                  value={salesConversionEvent}
                  onChange={(e) => setSalesConversionEvent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="PURCHASE">Purchase (Completed payment on website)</option>
                  <option value="INITIATE_CHECKOUT">Initiate Checkout (Click checkout button)</option>
                  <option value="ADD_TO_CART">Add to Cart (Added product to cart)</option>
                  <option value="LEAD">Lead (Form submission or query)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 leading-relaxed">
                ℹ Adding standard event code to your website allows Meta's AI to optimize ad delivery directly to users with high purchase intent.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSalesShowSetupConversionEventModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!salesConversionEvent) setSalesConversionEvent("PURCHASE");
                  setSalesShowSetupConversionEventModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                Save Conversion Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE PROMO CODES MODAL */}
      {salesShowPromoCodesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm">Manage promo codes</h3>
              <button
                type="button"
                onClick={() => setSalesShowPromoCodesModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setSalesPromoCodesOption("AUTO")}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${salesPromoCodesOption === "AUTO" ? "bg-sky-500/10 border-sky-500/40" : "bg-slate-950 border-slate-800"}`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="promoOption"
                    checked={salesPromoCodesOption === "AUTO"}
                    onChange={() => setSalesPromoCodesOption("AUTO")}
                    className="mt-0.5 accent-sky-500 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Automatically source promo codes</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Meta will detect active website promotion codes automatically.</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSalesPromoCodesOption("MANUAL")}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${salesPromoCodesOption === "MANUAL" ? "bg-sky-500/10 border-sky-500/40" : "bg-slate-950 border-slate-800"}`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="promoOption"
                    checked={salesPromoCodesOption === "MANUAL"}
                    onChange={() => setSalesPromoCodesOption("MANUAL")}
                    className="mt-0.5 accent-sky-500 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Manually add promo codes</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Enter custom coupon code (e.g. SAVE20, WELCOME10).</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSalesShowPromoCodesModal(false)}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUILD URL PARAMETERS MODAL */}
      {salesShowUrlParametersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Build a URL parameter</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add tracking parameters to measure traffic source and campaign effectiveness.</p>
              </div>
              <button
                type="button"
                onClick={() => setSalesShowUrlParametersModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Campaign Source (utm_source)</label>
                <input
                  type="text"
                  defaultValue="facebook_ad"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Campaign Medium (utm_medium)</label>
                <input
                  type="text"
                  defaultValue="cpc_sales"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Campaign Name (utm_campaign)</label>
                <input
                  type="text"
                  defaultValue="summer_sales_2026"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSalesShowUrlParametersModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSalesUrlParameters("utm_source=facebook_ad&utm_medium=cpc_sales&utm_campaign=summer_sales_2026");
                  setSalesShowUrlParametersModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENTER AD CODE OR POST INFO MODAL */}
      {showPartnershipCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <h3 className="font-bold text-slate-100 text-sm">Enter partnership ad code, post ID or post URL</h3>
              <button
                type="button"
                onClick={() => setShowPartnershipCodeModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Split Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
              {/* Left Column: Form & Help Text */}
              <div className="md:col-span-5 p-6 space-y-4 border-r border-slate-800 bg-slate-950/40">
                <p className="text-xs text-slate-300 leading-relaxed">
                  This will set the first identity of the partnership ad and will use the media associated with the code or post info. For partnership ad code, contact the post's creator and request that they share it with you. For post ID or post URL, make sure that you have account-level permissions from the creator to run your ad with the associated media.{" "}
                  <button type="button" className="text-sky-400 hover:underline font-semibold">
                    Learn how to use ad codes, post ID or post URL
                  </button>
                </p>

                <div className="space-y-1.5 pt-2">
                  <input
                    type="text"
                    value={partnershipAdCode}
                    onChange={(e) => setPartnershipAdCode(e.target.value)}
                    placeholder="Enter ad code provided by the creator, or post ID or post URL"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono shadow-inner"
                  />
                </div>

                {partnershipAdCode && (
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 animate-fadeIn">
                    ✓ Validating code format: <span className="font-mono font-bold text-slate-200">{partnershipAdCode}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Partnership Ad Live Preview */}
              <div className="md:col-span-7 p-6 bg-slate-900/60 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200 text-xs">Partnership ad preview</h4>
                  </div>

                  {/* Placement Selector */}
                  <select
                    value={partnershipPreviewPlacement}
                    onChange={(e) => setPartnershipPreviewPlacement(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="INSTAGRAM_FEED">📷 Instagram feed</option>
                    <option value="INSTAGRAM_REELS">📱 Instagram stories / Reels</option>
                    <option value="FACEBOOK_FEED">📄 Facebook feed</option>
                  </select>

                  {/* Previews Grid */}
                  <div className="pt-2">
                    <div className="flex items-center justify-end mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                        Dynamic identity
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Card 1: Co-branded Partnership Mockup */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/60 space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <div className="flex -space-x-1.5 shrink-0">
                              <div className="w-5 h-5 rounded-full bg-sky-500/30 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-sky-300">C</div>
                              <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-emerald-300">B</div>
                            </div>
                            <span className="font-bold text-slate-200 truncate text-[10px]">
                              creator and brand
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-semibold shrink-0">Ad</span>
                        </div>

                        {/* Image Placeholder */}
                        <div className="w-full h-32 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                          {campMediaUrl ? (
                            <img src={campMediaUrl} alt="Ad media" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-600">
                              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between text-slate-400 text-xs pt-0.5">
                          <div className="flex items-center gap-2">
                            <span>♡</span>
                            <span>💬</span>
                            <span>✈</span>
                          </div>
                          <span>🔖</span>
                        </div>
                      </div>

                      {/* Card 2: Single / Dynamic Identity Mockup */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/60 space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-[8px] font-bold text-slate-300">C</div>
                            <span className="font-bold text-slate-200 truncate text-[10px]">
                              {selectedPartnerIdentity || "creator_name"}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-semibold shrink-0">Ad</span>
                        </div>

                        {/* Image Placeholder */}
                        <div className="w-full h-32 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                          {campMediaUrl ? (
                            <img src={campMediaUrl} alt="Ad media" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-600">
                              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between text-slate-400 text-xs pt-0.5">
                          <div className="flex items-center gap-2">
                            <span>♡</span>
                            <span>💬</span>
                            <span>✈</span>
                          </div>
                          <span>🔖</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-800 bg-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setShowPartnershipCodeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPartnershipCodeApplied(true);
                  setShowPartnershipCodeModal(false);
                }}
                className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
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

      {/* SELECT PARTNER CONTENT POST MODAL */}
      {showSelectPartnerContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <h3 className="font-bold text-slate-100 text-sm">Select partner content post</h3>
              <button
                type="button"
                onClick={() => setShowSelectPartnerContentModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Sub-header Tabs */}
            <div className="px-6 pt-3 pb-0 border-b border-slate-800 bg-slate-950/40 flex gap-4">
              {(["ALL", "SUGGESTED"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPartnerContentTab(tab)}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${partnerContentTab === tab
                    ? "border-sky-400 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                >
                  {tab === "ALL" ? "All" : "Suggested"}
                </button>
              ))}
            </div>

            {/* Filter Controls Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2 flex-wrap">
              <select
                value={partnerPostTypeFilter}
                onChange={(e) => setPartnerPostTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="ALL">Select item</option>
                <option value="REELS">Reels • Video</option>
                <option value="FEED">Feed • Photo</option>
              </select>

              <select
                value={partnerPostIdentityFilter}
                onChange={(e) => setPartnerPostIdentityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="ALL">Select identity</option>
                <option value="jisnu_digitalsolution_pvt_ltd">jisnu_digitalsolution_pvt_ltd</option>
                <option value="jvm_institute.pvt.ltd">jvm_institute.pvt.ltd</option>
              </select>

              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={partnerPostSearch}
                  onChange={(e) => setPartnerPostSearch(e.target.value)}
                  placeholder="Post, image or video IDs, or other keywords"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="button"
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 flex items-center gap-1.5 shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                All filters
              </button>
            </div>

            {/* Partner Posts Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 px-3 py-2 border-b border-slate-800">
                <span className="col-span-5">Partner content post</span>
                <span className="col-span-2">Permissions ℹ</span>
                <span className="col-span-1">Issues ℹ</span>
                <span className="col-span-2">Type</span>
                <span className="col-span-2 text-right">Published</span>
              </div>

              {/* Posts Rows */}
              {[
                {
                  id: "post_1",
                  profile: "jisnu_digitalsolution_pvt_ltd",
                  caption: "🚀 Is Your Business Not Growing Online? Best Digital Marketing ...",
                  likes: 51,
                  comments: 0,
                  shares: 0,
                  permission: "AUTHORIZED",
                  issues: "—",
                  type: "Reels • Video",
                  published: "4 Aug 2026",
                  imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80",
                },
                {
                  id: "post_2",
                  profile: "jisnu_digitalsolution_pvt_ltd",
                  caption: "JISNU Digital Solutions Pvt. Ltd. द्वारे राबविण्यात आलेल्या Kakde & K...",
                  likes: 5,
                  comments: 0,
                  shares: 0,
                  permission: "UNAUTHORIZED",
                  issues: "—",
                  type: "Feed • Photo",
                  published: "23 Jul 2026",
                  imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80",
                },
                {
                  id: "post_3",
                  profile: "jvm_institute.pvt.ltd",
                  caption: "Best Data Engineering Classes In Pune. Build Your Future in Dat...",
                  likes: 33,
                  comments: 1,
                  shares: 0,
                  permission: "UNAUTHORIZED",
                  issues: "—",
                  type: "Reels • Video",
                  published: "22 Jul 2026",
                  imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80",
                },
                {
                  id: "post_4",
                  profile: "jisnu_digitalsolution_pvt_ltd",
                  caption: "Best Digital Marketing Agency In Pune. Real Campaigns. Real Re...",
                  likes: 42,
                  comments: 3,
                  shares: 1,
                  permission: "UNAUTHORIZED",
                  issues: "—",
                  type: "Feed • Photo",
                  published: "17 Jul 2026",
                  imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
                },
              ]
                .filter((p) => partnerPostIdentityFilter === "ALL" || p.profile === partnerPostIdentityFilter)
                .filter((p) => partnerPostSearch === "" || p.caption.toLowerCase().includes(partnerPostSearch.toLowerCase()) || p.profile.toLowerCase().includes(partnerPostSearch.toLowerCase()))
                .map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPartnerPostId(post.id)}
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedPartnerPostId === post.id
                      ? "border-sky-500 bg-sky-500/10 text-slate-100 shadow-md"
                      : "border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:border-slate-700"
                      }`}
                  >
                    {/* Column 1: Post thumbnail + Profile & Caption */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                        <img src={post.imageUrl} alt="post thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">📷</span>
                          <span className="font-bold text-xs text-slate-100 truncate">{post.profile}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">{post.caption}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pt-0.5">
                          <span>♡ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                          <span>➔ {post.shares}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Permissions */}
                    <div className="col-span-2 text-xs font-semibold">
                      {post.permission === "AUTHORIZED" ? (
                        <span className="text-emerald-400 font-bold">—</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span> Unauthorised
                        </span>
                      )}
                    </div>

                    {/* Column 3: Issues */}
                    <div className="col-span-1 text-xs text-slate-400">{post.issues}</div>

                    {/* Column 4: Type */}
                    <div className="col-span-2 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <span>📷</span> {post.type}
                    </div>

                    {/* Column 5: Published */}
                    <div className="col-span-2 text-right text-xs font-mono text-slate-400">{post.published}</div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-4">
              <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                If any of the above content is branded content, our{" "}
                <button type="button" className="text-sky-400 hover:underline font-semibold">Branded Content Policies</button>{" "}
                require that it be disclosed using the paid partnership tool.{" "}
                <button type="button" className="text-sky-400 hover:underline font-semibold">Go to Partnership Ads Hub to view creator content</button>
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSelectPartnerContentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCampHeadline("🚀 Is Your Business Not Growing Online?");
                    setCampBody("Best Digital Marketing Agency In Pune. Real Campaigns. Real Results.");
                    setCampMediaUrl("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80");
                    setShowSelectPartnerContentModal(false);
                  }}
                  className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRACKED OFFLINE EVENT SETS MODAL */}
      {showEditOfflineSetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Edit tracked offline event sets</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select which offline event sets to use for tracking sales and conversions.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditOfflineSetsModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Offline Event Set</label>
              <select
                value={offlineEventSetName}
                onChange={(e) => setOfflineEventSetName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="JISNU Digital Website Pixel">JISNU Digital Website Pixel (Dataset ID: 1380912777544016)</option>
                <option value="Offline Store Conversions Set">Offline Store Conversions Set (Dataset ID: 8892011475)</option>
                <option value="CRM Leads Event Set">CRM Leads Event Set (Dataset ID: 9940127501)</option>
              </select>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 leading-relaxed">
                ℹ Meta will automatically match offline conversions (in-store purchases, CRM leads) with users who viewed or clicked your ad.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditOfflineSetsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowEditOfflineSetsModal(false)}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                Save Event Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE EVENTS MANAGER DATA SETS MODAL */}
      {showEventsManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Manage Events Manager data sets</h3>
                <p className="text-xs text-slate-400 mt-0.5">Meta Events Manager Dataset Configuration.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEventsManagerModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">Dataset Name</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
                </div>
                <p className="font-mono text-slate-400 text-[11px]">JISNU Digital Website Pixel (ID: 1380912777544016)</p>
                <div className="text-[11px] text-slate-400 pt-1 space-y-1">
                  <p>• Web Events: PageView, Lead, AddToCart, Purchase</p>
                  <p>• Offline Events: InStorePurchase, PhoneOrder</p>
                  <p>• App Events: AppInstall, AppLaunch, InAppPurchase</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEventsManagerModal(false)}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CHAT TEMPLATE MODAL */}
      {showChatTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  Edit chat template
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold">🤖 AI Recommended</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize the greeting and automated questions people see after tapping your ad.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChatTemplateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">Greeting</label>
                <input
                  type="text"
                  value={chatTemplateGreeting}
                  onChange={(e) => setChatTemplateGreeting(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-200">Questions and responses</label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">Question 1</span>
                    <input
                      type="text"
                      value={chatTemplateQuestion1}
                      onChange={(e) => setChatTemplateQuestion1(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">Question 2</span>
                    <input
                      type="text"
                      value={chatTemplateQuestion2}
                      onChange={(e) => setChatTemplateQuestion2(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">Question 3</span>
                    <input
                      type="text"
                      value={chatTemplateQuestion3}
                      onChange={(e) => setChatTemplateQuestion3(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 leading-relaxed">
                ⚡ Recommended template settings can increase message response rates by up to 7%.
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setChatTemplateGreeting("Hi! Please let us know how we can help you.");
                  setChatTemplateQuestion1("Can I learn more about your business?");
                  setChatTemplateQuestion2("Can you tell me more about your ad?");
                  setChatTemplateQuestion3("Is anyone available to chat?");
                }}
                className="text-xs text-sky-400 hover:underline font-semibold"
              >
                Reset AI defaults
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowChatTemplateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowChatTemplateModal(false)}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── COMPLETE META CAMPAIGN DETAILS & DEEP INSPECTOR MODAL ── */}
      {showDetailModal && selectedCampDetail && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative z-10 w-full max-w-5xl max-h-[92vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-100 text-base">{selectedCampDetail.name}</h2>
                    <Pill status={selectedCampDetail.status || "ACTIVE"} />
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
                      {selectedCampDetail.objective || "OUTCOME_LEADS"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>Meta ID: {selectedCampDetail.metaCampaignId || selectedCampDetail.id}</span>
                    <span>•</span>
                    <span>Budget: ₹{selectedCampDetail.dailyBudget?.toFixed(2) || "500.00"}/day</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setFetchingDetail(true);
                    try {
                      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${selectedCampDetail.id}?organizationId=${orgId}`);
                      const data = await res.json();
                      if (data.campaign) setSelectedCampDetail(data.campaign);
                      if (data.liveMeta) setLiveMetaDetail(data.liveMeta);
                      showToast("Refreshed live Graph API details! ✓");
                    } catch (e) { } finally { setFetchingDetail(false); }
                  }}
                  disabled={fetchingDetail}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${fetchingDetail ? "animate-spin text-blue-400" : ""}`} />
                  Refresh Live Data
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Sub-Header Tabs */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/60 overflow-x-auto shrink-0">
              {[
                { id: "metrics", label: "Live Performance & Insights", icon: TrendingUp },
                { id: "config", label: "Campaign & Bidding Config", icon: Settings },
                { id: "adsets", label: `Ad Sets & Targeting (${liveMetaDetail?.adsets?.data?.length || selectedCampDetail.adSets?.length || 1})`, icon: Target },
                { id: "creatives", label: "Ads & Media Creatives", icon: FileText },
                { id: "raw", label: "Raw Graph API JSON", icon: Activity },
              ].map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailModalTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${detailModalTab === tab.id
                    ? "border-sky-400 text-sky-400 bg-sky-400/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-slate-950/40">
              {/* TAB 1: Live Performance & Insights */}
              {detailModalTab === "metrics" && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {(() => {
                      const ins = liveMetaDetail?.insights?.data?.[0] || {};
                      const impr = ins.impressions ? Number(ins.impressions) : (selectedCampDetail.impressions || 0);
                      const clk = ins.clicks ? Number(ins.clicks) : (selectedCampDetail.clicks || 0);
                      const spd = ins.spend ? Number(ins.spend) : (selectedCampDetail.spend || 0);
                      const rch = ins.reach ? Number(ins.reach) : (selectedCampDetail.reach || 0);
                      const freq = ins.frequency ? Number(ins.frequency).toFixed(2) : "1.15";
                      const ctrVal = ins.ctr ? `${Number(ins.ctr).toFixed(2)}%` : (impr > 0 ? `${((clk / impr) * 100).toFixed(2)}%` : "0.00%");
                      const cpcVal = ins.cpc ? Number(ins.cpc).toFixed(2) : (clk > 0 ? (spd / clk).toFixed(2) : "0.00");
                      const cpmVal = ins.cpm ? Number(ins.cpm).toFixed(2) : (impr > 0 ? ((spd / impr) * 1000).toFixed(2) : "0.00");
                      const convs = selectedCampDetail.conversions || 0;

                      return (
                        <>
                          <Stat label="Impressions" value={fmt(impr)} sub="Total views" color="text-teal-400" />
                          <Stat label="Clicks" value={fmt(clk)} sub="Link clicks" color="text-sky-400" />
                          <Stat label="Spend" value={`₹${fmt(spd)}`} sub="Amount spent" color="text-amber-400" />
                          <Stat label="Reach" value={fmt(rch)} sub="Unique accounts" color="text-indigo-400" />
                          <Stat label="Frequency" value={freq} sub="Views per user" color="text-purple-400" />
                          <Stat label="CTR" value={ctrVal} sub="Click rate" color="text-emerald-400" />
                          <Stat label="Avg CPC" value={`₹${cpcVal}`} sub="Cost per click" color="text-sky-400" />
                          <Stat label="CPM" value={`₹${cpmVal}`} sub="Cost per 1K impr." color="text-amber-400" />
                          <Stat label="Conversions" value={fmt(convs)} sub="Leads/Chats" color="text-purple-400" />
                          <Stat label="Cost / Conv." value={`₹${convs > 0 ? (spd / convs).toFixed(2) : "0.00"}`} sub="Per result" color="text-teal-400" />
                        </>
                      );
                    })()}
                  </div>

                  {/* Actions & Conversion Breakdown Table */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                    <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                      <Activity className="h-4 w-4 text-sky-400" />
                      Live Action & Conversion Breakdown (Meta Graph API)
                    </h4>
                    {Array.isArray(liveMetaDetail?.insights?.data?.[0]?.actions) && liveMetaDetail.insights.data[0].actions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {liveMetaDetail.insights.data[0].actions.map((act: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]" title={act.action_type}>
                              {act.action_type}
                            </span>
                            <span className="font-bold text-slate-100">{act.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-lg border border-slate-800/60">
                        No custom action breakdown data returned yet for this date range.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Campaign & Bidding Config */}
              {detailModalTab === "config" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
                    <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Megaphone className="h-4 w-4 text-sky-400" /> Core Campaign Parameters
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Campaign Name:</span>
                        <span className="font-semibold text-slate-100">{liveMetaDetail?.name || selectedCampDetail.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Objective:</span>
                        <span className="font-mono text-sky-400">{liveMetaDetail?.objective || selectedCampDetail.objective || "OUTCOME_LEADS"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Buying Type:</span>
                        <span className="font-semibold text-slate-200">{liveMetaDetail?.buying_type || selectedCampDetail.buyingType || "AUCTION"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Special Ad Category:</span>
                        <span className="font-semibold text-slate-200">{liveMetaDetail?.special_ad_categories?.[0] || selectedCampDetail.specialAdCategory || "NONE"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Status:</span>
                        <Pill status={liveMetaDetail?.status || selectedCampDetail.status || "ACTIVE"} />
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Effective Status:</span>
                        <span className="font-mono text-emerald-400">{liveMetaDetail?.effective_status || selectedCampDetail.effectiveStatus || "ACTIVE"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
                    <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                      <DollarSign className="h-4 w-4 text-emerald-400" /> Budget, Bidding & Timestamps
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Daily Budget:</span>
                        <span className="font-bold text-emerald-400">₹{liveMetaDetail?.daily_budget ? (Number(liveMetaDetail.daily_budget) / 100).toFixed(2) : (selectedCampDetail.dailyBudget?.toFixed(2) || "500.00")}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Lifetime Budget:</span>
                        <span className="font-semibold text-slate-200">{liveMetaDetail?.lifetime_budget ? `₹${(Number(liveMetaDetail.lifetime_budget) / 100).toFixed(2)}` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Bid Strategy:</span>
                        <span className="font-mono text-amber-400">{liveMetaDetail?.bid_strategy || selectedCampDetail.bidStrategy || "LOWEST_COST_WITHOUT_CAP"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Created Time:</span>
                        <span className="font-mono text-slate-300">
                          {liveMetaDetail?.created_time || selectedCampDetail?.createdAt
                            ? new Date(liveMetaDetail?.created_time || selectedCampDetail.createdAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Updated Time:</span>
                        <span className="font-mono text-slate-300">
                          {liveMetaDetail?.updated_time || selectedCampDetail?.updatedAt
                            ? new Date(liveMetaDetail?.updated_time || selectedCampDetail.updatedAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Ad Sets & Targeting Breakdown */}
              {detailModalTab === "adsets" && (
                <div className="space-y-4">
                  {(() => {
                    const adsetsList = liveMetaDetail?.adsets?.data || selectedCampDetail.adSets || [];
                    if (adsetsList.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-500 bg-slate-900/60 rounded-xl border border-slate-800">
                          No Ad Sets attached to this campaign.
                        </div>
                      );
                    }
                    return adsetsList.map((as: any, idx: number) => {
                      const tgt = as.targeting || {};
                      return (
                        <div key={as.id || idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-md">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-slate-100 text-sm">{as.name}</h4>
                                <p className="text-[11px] text-slate-400 font-mono">AdSet ID: {as.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Pill status={as.status || "ACTIVE"} />
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                ₹{as.daily_budget ? (Number(as.daily_budget) / 100).toFixed(2) : (as.dailyBudget?.toFixed(2) || "500.00")}/day
                              </span>
                            </div>
                          </div>

                          {/* AdSet Configuration & Targeting Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                              <p className="font-bold text-sky-400 text-xs flex items-center gap-1">
                                <Settings className="h-3.5 w-3.5" /> AdSet Delivery Settings
                              </p>
                              <div className="space-y-1 text-slate-300">
                                <p><span className="text-slate-500">Destination:</span> <span className="font-semibold text-slate-200">{as.destination_type || as.destinationType || "WHATSAPP"}</span></p>
                                <p><span className="text-slate-500">Optimization Goal:</span> <span className="font-semibold text-slate-200">{as.optimization_goal || as.optimizationGoal || "MESSAGES"}</span></p>
                                <p><span className="text-slate-500">Billing Event:</span> <span className="font-semibold text-slate-200">{as.billing_event || "IMPRESSIONS"}</span></p>
                                <p><span className="text-slate-500">Bid Strategy:</span> <span className="font-semibold text-amber-400">{as.bid_strategy || "LOWEST_COST_WITHOUT_CAP"}</span></p>
                              </div>
                            </div>

                            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                              <p className="font-bold text-teal-400 text-xs flex items-center gap-1">
                                <Target className="h-3.5 w-3.5" /> Targeting & Audience Rules
                              </p>
                              <div className="space-y-1 text-slate-300">
                                <p><span className="text-slate-500">Countries:</span> <span className="font-semibold text-slate-200">{tgt.geo_locations?.countries?.join(", ") || tgt.countries?.join(", ") || "India (IN)"}</span></p>
                                <p><span className="text-slate-500">Age Range:</span> <span className="font-semibold text-slate-200">{tgt.age_min || tgt.ageMin || 18} - {tgt.age_max || tgt.ageMax || 65}+</span></p>
                                <p><span className="text-slate-500">Genders:</span> <span className="font-semibold text-slate-200">{tgt.genders ? JSON.stringify(tgt.genders) : "All (Male & Female)"}</span></p>
                                <p><span className="text-slate-500">Interests / Behaviors:</span> <span className="font-semibold text-slate-200">{tgt.interests ? JSON.stringify(tgt.interests) : "Digital Marketing, Business Owners, E-Commerce"}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* TAB 4: Ads & Media Creatives */}
              {detailModalTab === "creatives" && (
                <div className="space-y-4">
                  {(() => {
                    const rawAdSets = liveMetaDetail?.adsets?.data || selectedCampDetail.adSets || [];
                    const allMetaAds = rawAdSets.flatMap((as: any) => as.ads?.data || as.ads || []);
                    if (allMetaAds.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-500 bg-slate-900/60 rounded-xl border border-slate-800">
                          No Ad Creatives attached to this campaign.
                        </div>
                      );
                    }
                    return allMetaAds.map((ad: any, idx: number) => {
                      const cr = ad.creative || {};
                      return (
                        <div key={ad.id || idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-md flex flex-col md:flex-row gap-6">
                          {/* Media Preview Box */}
                          <div className="w-full md:w-64 h-48 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {cr.image_url || cr.mediaUrl ? (
                              <img src={cr.image_url || cr.mediaUrl} alt={ad.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center p-4">
                                <Globe className="h-8 w-8 text-slate-600 mx-auto mb-1" />
                                <p className="text-[11px] text-slate-500">Standard Image Creative</p>
                              </div>
                            )}
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-sky-400">
                              {cr.call_to_action_type || ad.callToAction || "WHATSAPP_MESSAGE"}
                            </span>
                          </div>

                          {/* Ad Details */}
                          <div className="flex-1 space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div>
                                <h4 className="font-bold text-slate-100 text-sm">{ad.name}</h4>
                                <p className="text-[11px] text-slate-400 font-mono">Ad ID: {ad.id}</p>
                              </div>
                              <Pill status={ad.effective_status || ad.status || "ACTIVE"} />
                            </div>

                            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                              <p className="font-bold text-slate-200 text-xs">{cr.title || cr.headline || ad.name}</p>
                              <p className="text-slate-400 leading-relaxed text-[11px]">{cr.body || "No creative body text specified."}</p>
                            </div>

                            {/* Policy & Review Feedback Diagnostic */}
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle className="h-4 w-4 shrink-0" />
                              <span>Meta Policy Diagnostic: {ad.ad_review_feedback ? JSON.stringify(ad.ad_review_feedback) : "Passed all automated Meta Ad policy checks cleanly."}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* TAB 5: Raw Graph API JSON */}
              {detailModalTab === "raw" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Live Meta Graph API v26.0 Full Object Payload</span>
                    <span className="text-[11px] text-sky-400 font-mono font-bold">100% Comprehensive</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px]">
                    {JSON.stringify(liveMetaDetail || selectedCampDetail, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end shrink-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/20"
              >
                Done
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
