"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign,
  Target, Plus, Play, Pause, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap, BarChart2,
  Search, Trash2, Edit3, ChevronDown, Globe, Tag, Link2,
  Phone, Bell, LayoutGrid, List, Info, PlusCircle, ArrowUpRight,
  Activity, Calendar, Filter, Download, Bot, Settings, Users,
  Layers, FileText, TrendingDown, Award, Star, RotateCcw, 
  Building2, Check, Minus, BadgePercent
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
    PAUSED:  "text-amber-400 bg-amber-400/10 border-amber-400/30",
    REMOVED: "text-rose-400 bg-rose-400/10 border-rose-400/30",
    OPEN:    "text-sky-400 bg-sky-400/10 border-sky-400/30",
  };
  return m[status] || "text-slate-400 bg-slate-400/10 border-slate-400/30";
}

function fmt(n: number | string, prefix = "") { return `${prefix}${Number(n).toLocaleString()}`; }

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
// ACCOUNT SELECTOR
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-100 hover:border-slate-600 transition-all min-w-[180px]"
      >
        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="flex-1 text-left truncate">{current?.name || (selected ? `ID: ${selected}` : "Select Account")}</span>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-72 z-50 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
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
// CAMPAIGN CREATOR WIZARD
// ─────────────────────────────────────────────────────────────────────────────
function CampaignCreator({ orgId, customerId, onClose, onSuccess }: any) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [brief, setBrief] = useState({
    businessDescription: "", campaignTheme: "", targetLocation: "",
    dailyBudget: "", finalUrl: "", startDate: "", endDate: "",
    campaignType: "SEARCH", biddingStrategy: "MANUAL_CPC",
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
          networkDisplay: brief.networkDisplay
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
            <>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Campaign Type" value={brief.campaignType} onChange={(e: any) => setBrief(b => ({ ...b, campaignType: e.target.value }))}>
                  <option value="SEARCH">Search</option>
                  <option value="DISPLAY">Display</option>
                  <option value="PERFORMANCE_MAX">Performance Max</option>
                </Select>
                <Select label="Bidding Strategy" value={brief.biddingStrategy} onChange={(e: any) => setBrief(b => ({ ...b, biddingStrategy: e.target.value }))}>
                  <option value="MANUAL_CPC">Manual CPC</option>
                  <option value="MAXIMIZE_CLICKS">Maximize Clicks</option>
                  <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
                  <option value="MAXIMIZE_CONVERSION_VALUE">Maximize Conv. Value</option>
                  <option value="TARGET_CPA">Target CPA</option>
                  <option value="TARGET_ROAS">Target ROAS</option>
                </Select>
              </div>

              {brief.biddingStrategy === "TARGET_CPA" && (
                <Input label="Target CPA (₹)" type="number" placeholder="e.g. 500" value={brief.targetCpa} onChange={(e: any) => setBrief(b => ({ ...b, targetCpa: e.target.value }))} />
              )}
              {brief.biddingStrategy === "TARGET_ROAS" && (
                <Input label="Target ROAS (e.g. 3.0 = 300%)" type="number" step="0.1" placeholder="e.g. 3.0" value={brief.targetRoas} onChange={(e: any) => setBrief(b => ({ ...b, targetRoas: e.target.value }))} />
              )}

              <Textarea label="Business Description *" rows={3} value={brief.businessDescription} onChange={(e: any) => setBrief(b => ({ ...b, businessDescription: e.target.value }))} placeholder="e.g. Digital marketing agency in Pune specialising in local SEO and lead generation for SMEs." />
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

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-5 rounded-full transition-all ${brief.networkDisplay ? "bg-primary" : "bg-slate-700"}`} onClick={() => setBrief(b => ({ ...b, networkDisplay: !b.networkDisplay }))}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow mt-0.5 transition-all ${brief.networkDisplay ? "ml-5.5" : "ml-0.5"}`} style={{ marginLeft: brief.networkDisplay ? "22px" : "2px" }} />
                </div>
                <span className="text-sm text-slate-300">Also show on Display Network</span>
              </label>
            </>
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
                  { label: "Type", val: brief.campaignType },
                  { label: "Bidding", val: brief.biddingStrategy },
                  { label: "Daily Budget", val: `₹${brief.dailyBudget}` },
                  { label: "Landing URL", val: brief.finalUrl },
                  { label: "Headlines", val: `${editHeadlines.length} headlines` },
                  { label: "Descriptions", val: `${editDescs.length} descriptions` },
                  { label: "Keywords", val: `${editKeywords.length} keywords` },
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
// SETTINGS TAB COMPONENT (MCC & Multiple Account Selector Flow)
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

  // Fetch accessible accounts for this OAuth token
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

  // Handle setting up a manager account (MCC)
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

  // Handle connecting a single client account
  const handleConnectClient = async (cid: string) => {
    if (!cid) return;
    setIsConnectingClient(true);
    try {
      // First fetch info to determine if it is a manager or client
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
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-4">
        <h2 className="font-bold text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Active Account Settings
        </h2>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-emerald-300 font-semibold">Google Integration Active</p>
            {selectedCustomerId ? (
              <p className="text-xs text-emerald-400/70 mt-0.5">
                Current active account for workspace: <strong className="text-emerald-300 font-mono">{selectedCustomerId}</strong>
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Please connect or select an account below to view campaign data.</p>
            )}
          </div>
          <a href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads`} className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-slate-300 transition-all font-medium">
            Reconnect Google
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Available Accounts from your Google Profile */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> 1. Connect / Choose Accounts
            </h3>
            <button 
              onClick={fetchAccessible} 
              disabled={loadingAccessible}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              title="Refresh profile accounts"
            >
              <RefreshCw className={`h-4 w-4 ${loadingAccessible ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Below are all Google Ads accounts accessible via your linked Google email. Select which ones to connect to this CRM:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {loadingAccessible ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            ) : accessibleCids.length === 0 ? (
              <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30 text-center text-xs text-slate-500">
                No accounts found or Google OAuth not completed.
              </div>
            ) : (
              accessibleCids.map(cid => {
                const cleanCid = cid.replace(/-/g, "");
                const isAlreadyConnected = accounts.some(acc => acc.customerId === cleanCid);
                return (
                  <div key={cid} className="flex items-center justify-between p-3 rounded-xl border border-slate-700/40 bg-slate-900/30 hover:border-slate-600 transition-all">
                    <span className="text-xs font-mono text-slate-300 font-medium">{cid}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSetupManager(cid)}
                        disabled={isSettingUpManager || isAlreadyConnected}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-all"
                        title="Import all sub-accounts under this MCC Manager"
                      >
                        Import Sub-Accounts
                      </button>
                      <button
                        onClick={() => handleConnectClient(cid)}
                        disabled={isConnectingClient || isAlreadyConnected}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isAlreadyConnected 
                          ? "bg-slate-800 text-slate-500 border border-transparent cursor-not-allowed" 
                          : "bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary"
                        }`}
                      >
                        {isAlreadyConnected ? "Connected" : "Connect Account"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">Custom / Missing Account ID</h4>
            <div className="flex gap-2">
              <input
                value={customCid}
                onChange={e => setCustomCid(e.target.value)}
                placeholder="e.g. 123-456-7890"
                className="flex-1 bg-slate-900 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={() => { handleConnectClient(customCid); setCustomCid(""); }}
                className="px-3 py-2 bg-primary text-slate-950 font-bold rounded-xl text-xs hover:bg-secondary transition-all"
              >
                Connect Custom
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Connected accounts & selector */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> 2. Selected CRM Accounts
          </h3>
          <p className="text-xs text-slate-400">
            Choose which client account to act as your active Workspace for managing campaigns, budgets, and viewing AI analyses:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {accounts.length === 0 ? (
              <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30 text-center text-xs text-slate-500">
                No accounts currently connected to your organization. Use the panel on the left to add one.
              </div>
            ) : (
              accounts.map(acc => {
                const isActive = selectedCustomerId === acc.customerId;
                return (
                  <div 
                    key={acc.customerId} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive 
                        ? "border-primary bg-primary/5" 
                        : "border-slate-700/40 bg-slate-900/30 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        acc.isManager ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"
                      }`}>
                        {acc.isManager ? "M" : "C"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">{acc.name || `Account ${acc.customerId}`}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{acc.customerId} · {acc.currencyCode || "?"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {acc.isManager && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          Manager
                        </span>
                      )}
                      <button
                        onClick={() => onSelectAccount(acc.customerId)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? "bg-primary text-slate-950 font-bold" 
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
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

      {/* AI Features & API info card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-3">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" /> AI Features Included
          </h3>
          <div className="space-y-2">
            {[
              "AI Ad Copy Generation (Llama 3.3)",
              "Campaign Health Analysis",
              "Keyword Expansion",
              "Negative Keyword Suggestions"
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-3">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> API Environment Details
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { label: "API Version", val: "Google Ads API v17" },
              { label: "Developer Token", val: "Configured (Active)" },
              { label: "Access Tier", val: "Basic Access" }
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-slate-400">{r.label}</span>
                <span className="text-slate-200 font-medium">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function GoogleAdsPage() {
  const orgId = DEFAULT_ORG_ID;

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

  const [dailyData, setDailyData] = useState<any[]>([]);
  const [searchTerms, setSearchTerms] = useState<any[]>([]);
  const [adReport, setAdReport] = useState<any[]>([]);

  const [showCreator, setShowCreator] = useState(false);
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // Load connection state
  useEffect(() => {
    (async () => {
      setConfigLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/gmb/config?orgId=${orgId}`);
        const data = await res.json();
        setIsConnected(!!data.googleRefreshToken);
        if (data.googleAdsCustomerId) setSelectedCustomerId(data.googleAdsCustomerId.replace(/-/g, ""));
      } catch { } finally { setConfigLoading(false); }
    })();
  }, []);

  // Load accounts
  useEffect(() => {
    if (!isConnected) return;
    setAccountsLoading(true);
    api(`/accounts?orgId=${orgId}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAccounts(d); })
      .catch(() => {})
      .finally(() => setAccountsLoading(false));
  }, [isConnected]);

  // Load data when account changes or tab changes
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
  }, [activeTab, selectedCustomerId, isConnected, dateRange]);

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
  }, [dateRange]);

  const loadCampaigns = useCallback(async (cid: string) => {
    setCampsLoading(true);
    try {
      const res = await api(`/campaigns?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load campaigns"); } finally { setCampsLoading(false); }
  }, []);

  const loadAdGroups = useCallback(async (cid: string) => {
    setAdGroupsLoading(true);
    try {
      const res = await api(`/ad-groups?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAdGroups(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load ad groups"); } finally { setAdGroupsLoading(false); }
  }, []);

  const loadAds = useCallback(async (cid: string) => {
    setAdsLoading(true);
    try {
      const res = await api(`/ads?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load ads"); } finally { setAdsLoading(false); }
  }, []);

  const loadKeywords = useCallback(async (cid: string) => {
    setKwLoading(true);
    try {
      const res = await api(`/keywords?orgId=${orgId}&customerId=${cid}&includeNegatives=true`);
      const data = await res.json();
      setKeywords(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load keywords"); } finally { setKwLoading(false); }
  }, []);

  const loadExtensions = useCallback(async (cid: string) => {
    setExtLoading(true);
    try {
      const res = await api(`/extensions?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setExtensions(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load extensions"); } finally { setExtLoading(false); }
  }, []);

  const loadConversions = useCallback(async (cid: string) => {
    setConvLoading(true);
    try {
      const res = await api(`/conversions?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setConversions(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load conversions"); } finally { setConvLoading(false); }
  }, []);

  const loadAudiences = useCallback(async (cid: string) => {
    setAudLoading(true);
    try {
      const res = await api(`/audiences?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAudiences(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load audiences"); } finally { setAudLoading(false); }
  }, []);

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
  }, [dateRange]);

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

  // Totals for overview
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
      <div className="flex items-center justify-center h-full bg-slate-950">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 items-center justify-center p-8">
        <div className="max-w-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
            <Megaphone className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Connect Google Ads</h1>
            <p className="text-slate-400 leading-relaxed">Connect your Google account to manage campaigns, track performance, run AI-powered ads, and much more — all without leaving your CRM.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            {["Campaign Management", "Ad Group & Ad Control", "Keyword Research", "Performance Reports", "Conversion Tracking", "AI Ad Copy"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <a href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads`}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all shadow-lg mx-auto w-fit">
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
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm leading-none">Google Ads</h1>
            <p className="text-xs text-slate-500 mt-0.5">Complete Ads Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AccountSelector accounts={accounts} selected={selectedCustomerId} onSelect={handleSelectAccount} loading={accountsLoading} orgId={orgId} />

          <select value={dateRange} onChange={e => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary/60 transition-all">
            {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          <button onClick={() => { if (selectedCustomerId) { loadCampaigns(selectedCustomerId); loadOverview(selectedCustomerId); } }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700/50 transition-all">
            <RefreshCw className="h-4 w-4" />
          </button>

          {selectedCustomerId && (
            <button onClick={() => setShowCreator(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> New Campaign
            </button>
          )}
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-0 border-b border-slate-800 bg-slate-950/70 overflow-x-auto shrink-0 px-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {!selectedCustomerId && activeTab !== "settings" ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-medium">Select a Google Ads account</p>
            <p className="text-slate-500 text-sm">Use the account selector in the header to choose an account</p>
          </div>
        </div>
      ) : (

      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <>
            {overviewLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <MetricCard icon={Eye} label="Impressions" value={overview ? Number(overview.impressions).toLocaleString() : totalImpressions.toLocaleString()} color="bg-primary/15 text-primary" />
                  <MetricCard icon={MousePointerClick} label="Clicks" value={overview ? Number(overview.clicks).toLocaleString() : totalClicks.toLocaleString()} color="bg-secondary/15 text-secondary" />
                  <MetricCard icon={TrendingUp} label="CTR" value={overview?.ctr || avgCtr} color="bg-emerald-500/15 text-emerald-400" />
                  <MetricCard icon={DollarSign} label="Spend" value={`₹${overview?.cost || totalCost.toFixed(2)}`} color="bg-amber-500/15 text-amber-400" />
                  <MetricCard icon={Target} label="Conversions" value={overview ? Number(overview.conversions).toFixed(1) : totalConversions} color="bg-violet-500/15 text-violet-400" />
                  <MetricCard icon={Activity} label="Avg. CPC" value={`₹${overview?.avgCpc || "0.00"}`} color="bg-sky-500/15 text-sky-400" />
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Active Campaigns", val: enabledCamps, icon: Megaphone, color: "text-emerald-400" },
                    { label: "Total Campaigns", val: campaigns.length, icon: Layers, color: "text-primary" },
                    { label: "Cost/Conversion", val: `₹${overview?.costPerConversion || "0.00"}`, icon: BadgePercent, color: "text-amber-400" },
                    { label: "Conv. Value", val: `₹${overview?.allConversionsValue || "0.00"}`, icon: Award, color: "text-violet-400" }
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-slate-700/50 flex items-center justify-center ${s.color}`}><s.icon className="h-4.5 w-4.5" /></div>
                      <div>
                        <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent campaigns table */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" />Campaigns <span className="text-xs text-slate-500">({campaigns.length})</span></h2>
                    <button onClick={() => setActiveTab("campaigns")} className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight className="h-3 w-3" /></button>
                  </div>
                  {campaigns.slice(0, 5).map(c => (
                    <div key={c.id} className="px-5 py-3 flex items-center gap-4 border-b border-slate-700/20 last:border-0 hover:bg-slate-800/20 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-200 truncate text-sm">{c.name}</p>
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
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input value={campSearch} onChange={e => setCampSearch(e.target.value)} placeholder="Search campaigns..."
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all" />
              </div>
              <button onClick={() => loadCampaigns(selectedCustomerId)} className="p-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> New Campaign
              </button>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
              {campsLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
              ) : filteredCamps.length === 0 ? (
                <EmptyState icon={Megaphone} title="No campaigns" sub="Create your first AI-powered campaign to start reaching customers." action="Create Campaign" onAction={() => setShowCreator(true)} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        {["Campaign", "Status", "Type", "Budget/day", "Impressions", "Clicks", "CTR", "Spend", "Conv.", "Actions"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/20">
                      {filteredCamps.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-all group">
                          <td className="px-4 py-3 min-w-[180px]">
                            <p className="font-medium text-slate-200 text-sm truncate max-w-[200px]">{c.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{c.googleAdsCampaignId || "Not synced"}</p>
                          </td>
                          <td className="px-4 py-3"><Pill status={c.liveStatus || c.status} /></td>
                          <td className="px-4 py-3 text-xs text-slate-400">{c.campaignType || "SEARCH"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">₹{c.budget}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(c.impressions || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(c.clicks || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{c.ctr || "0%"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">₹{c.cost || "0.00"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(c.conversions || 0).toFixed(1)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => toggleCampaign(c)} disabled={toggling === c.id || !c.googleAdsCampaignId}
                                className={`p-1.5 rounded-lg transition-all ${(c.liveStatus || c.status) === "ENABLED" ? "text-amber-400 hover:bg-amber-400/10" : "text-emerald-400 hover:bg-emerald-400/10"}`}>
                                {toggling === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (c.liveStatus || c.status) === "ENABLED" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => analyzeCampaign(c)} title="AI Analysis" className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-400/10 transition-all">
                                <Bot className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteCampaign(c)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-all">
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
          <>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Ad Groups <span className="text-xs text-slate-500">({adGroups.length})</span></h2>
                <button onClick={() => loadAdGroups(selectedCustomerId)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><RefreshCw className="h-4 w-4" /></button>
              </div>
              {adGroupsLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
              ) : adGroups.length === 0 ? (
                <EmptyState icon={Layers} title="No ad groups" sub="Ad groups are automatically synced from your campaigns." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-700/50">{["Ad Group", "Status", "Type", "CPC Bid", "Impressions", "Clicks", "Spend", "Conv."].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-700/20">
                      {adGroups.map(ag => (
                        <tr key={ag.id} className="hover:bg-slate-800/30 transition-all">
                          <td className="px-4 py-3"><p className="font-medium text-slate-200 text-sm">{ag.name}</p><p className="text-xs text-slate-500">{ag.id}</p></td>
                          <td className="px-4 py-3"><Pill status={ag.status} /></td>
                          <td className="px-4 py-3 text-xs text-slate-400">{ag.type}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{ag.cpcBidMicros ? `₹${(Number(ag.cpcBidMicros) / 1_000_000).toFixed(2)}` : "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(ag.impressions || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(ag.clicks || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">₹{ag.cost || "0.00"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(ag.conversions || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ ADS TAB ══ */}
        {activeTab === "ads" && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Ads <span className="text-xs text-slate-500">({ads.length})</span></h2>
              <button onClick={() => loadAds(selectedCustomerId)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><RefreshCw className="h-4 w-4" /></button>
            </div>
            {adsLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
            ) : ads.length === 0 ? (
              <EmptyState icon={FileText} title="No ads found" sub="Ads are synced from your Google Ads account. Create a campaign to generate ads." />
            ) : (
              <div className="divide-y divide-slate-700/20">
                {ads.map(ad => (
                  <div key={ad.id} className="p-5 hover:bg-slate-800/20 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Pill status={ad.status} />
                          <span className="text-xs text-slate-500">{ad.adType?.replace(/_/g, " ")}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${ad.adStrength === "EXCELLENT" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : ad.adStrength === "GOOD" ? "text-sky-400 border-sky-400/30 bg-sky-400/10" : "text-slate-400 border-slate-600 bg-slate-700/30"}`}>
                            {ad.adStrength || "—"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">Group: {ad.adGroupName}</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {(ad.headlines || []).slice(0, 3).map((h: any, i: number) => (
                            <span key={i} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-lg">{h.text || h}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(ad.descriptions || []).slice(0, 2).map((d: any, i: number) => (
                            <span key={i} className="text-xs text-slate-400">{d.text || d}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4 text-center shrink-0">
                        <Stat label="Impr." value={Number(ad.impressions || 0).toLocaleString()} />
                        <Stat label="Clicks" value={Number(ad.clicks || 0).toLocaleString()} />
                        <Stat label="CTR" value={ad.ctr || "0%"} />
                        <Stat label="Spend" value={`₹${ad.cost || "0.00"}`} />
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
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input value={kwSearch} onChange={e => setKwSearch(e.target.value)} placeholder="Search keywords..."
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all" />
              </div>
              <button onClick={() => loadKeywords(selectedCustomerId)} className="p-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><RefreshCw className="h-4 w-4" /></button>
              <button onClick={() => setShowAddKeyword(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Keywords
              </button>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
              {kwLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
              ) : filteredKw.length === 0 ? (
                <EmptyState icon={Tag} title="No keywords" sub="Add keywords to your ad groups to control when your ads appear." action="Add Keywords" onAction={() => setShowAddKeyword(true)} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-700/50">{["Keyword", "Match", "Type", "Status", "QS", "CPC Bid", "Impressions", "Clicks", "Spend", "Conv.", ""].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-700/20">
                      {filteredKw.map(kw => (
                        <tr key={kw.id} className="hover:bg-slate-800/30 transition-all group">
                          <td className="px-4 py-3">
                            <p className={`text-sm font-medium ${kw.isNegative ? "text-rose-300 line-through" : "text-slate-200"}`}>{kw.text}</p>
                            <p className="text-xs text-slate-500">{kw.adGroupName}</p>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">{kw.matchType}</span></td>
                          <td className="px-4 py-3 text-xs text-slate-400">{kw.isNegative ? "❌ Negative" : "✅ Positive"}</td>
                          <td className="px-4 py-3"><Pill status={kw.status} /></td>
                          <td className="px-4 py-3 text-sm text-slate-300">{kw.qualityScore || "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{kw.cpcBidMicros ? `₹${(Number(kw.cpcBidMicros) / 1_000_000).toFixed(2)}` : "Auto"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(kw.impressions || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(kw.clicks || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">₹{kw.cost || "0.00"}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(kw.conversions || 0).toFixed(1)}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => deleteKeyword(kw)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-all">
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
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" />Extensions / Assets <span className="text-xs text-slate-500">({extensions.length})</span></h2>
              <button onClick={() => loadExtensions(selectedCustomerId)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><RefreshCw className="h-4 w-4" /></button>
            </div>
            {extLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
            ) : extensions.length === 0 ? (
              <EmptyState icon={Link2} title="No extensions" sub="Sitelinks, callouts, and call extensions help increase your ad's visibility and clicks." />
            ) : (
              <div className="divide-y divide-slate-700/20">
                {extensions.map((ext: any, i: number) => (
                  <div key={i} className="px-5 py-4 hover:bg-slate-800/20 transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ext.assetType === "SITELINK" ? "bg-sky-500/20 text-sky-400" : ext.assetType === "CALLOUT" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {ext.assetType === "SITELINK" ? <Link2 className="h-4 w-4" /> : ext.assetType === "CALLOUT" ? <Bell className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-200">{ext.assetName || "—"}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400">{ext.assetType}</span>
                          <Pill status={ext.status} />
                        </div>
                        {ext.sitelink && <p className="text-xs text-slate-400 mt-1">{ext.sitelink.description1} · {ext.sitelink.description2}</p>}
                        {ext.callout && <p className="text-xs text-slate-400 mt-1">{ext.callout}</p>}
                        {ext.call && <p className="text-xs text-slate-400 mt-1">{ext.call.countryCode} {ext.call.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ CONVERSIONS TAB ══ */}
        {activeTab === "conversions" && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Conversion Actions <span className="text-xs text-slate-500">({conversions.length})</span></h2>
              <button onClick={() => loadConversions(selectedCustomerId)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><RefreshCw className="h-4 w-4" /></button>
            </div>
            {convLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
            ) : conversions.length === 0 ? (
              <EmptyState icon={Target} title="No conversion actions" sub="Set up conversions to track purchases, leads, signups, and more." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-700/50">{["Name", "Category", "Status", "Type", "Counting", "Lookback", "Conversions", "Value"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {conversions.map(conv => (
                      <tr key={conv.id} className="hover:bg-slate-800/30 transition-all">
                        <td className="px-4 py-3"><p className="font-medium text-slate-200 text-sm">{conv.name}</p></td>
                        <td className="px-4 py-3 text-xs text-slate-400">{conv.category}</td>
                        <td className="px-4 py-3"><Pill status={conv.status} /></td>
                        <td className="px-4 py-3 text-xs text-slate-400">{conv.type}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{conv.countingType}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{conv.lookbackWindow} days</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{Number(conv.conversions || 0).toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">₹{Number(conv.conversionsValue || 0).toFixed(2)}</td>
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
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Audiences <span className="text-xs text-slate-500">({audiences.length})</span></h2>
              <button onClick={() => loadAudiences(selectedCustomerId)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><RefreshCw className="h-4 w-4" /></button>
            </div>
            {audLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
            ) : audiences.length === 0 ? (
              <EmptyState icon={Users} title="No audiences" sub="Audiences help you reach people who have visited your site or match specific interests." />
            ) : (
              <div className="divide-y divide-slate-700/20">
                {audiences.map((aud: any) => (
                  <div key={aud.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/20 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0"><Users className="h-4 w-4 text-violet-400" /></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200 text-sm">{aud.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{aud.type} · {aud.description || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-200">{aud.sizeForSearch ? Number(aud.sizeForSearch).toLocaleString() : "—"}</p>
                      <p className="text-xs text-slate-500">Search size</p>
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
          <div className="space-y-5">
            {/* Search Terms Report */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Search className="h-4 w-4 text-primary" />Search Terms Report <span className="text-xs text-slate-500">({searchTerms.length})</span></h2>
                <button onClick={() => loadReports(selectedCustomerId)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"><RefreshCw className="h-4 w-4" /></button>
              </div>
              {searchTerms.length === 0 ? (
                <EmptyState icon={Search} title="No search terms data" sub="Search term reports show what users searched to trigger your ads." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-700/50">{["Search Term", "Campaign", "Ad Group", "Status", "Impressions", "Clicks", "CTR", "Spend", "Conv."].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-700/20">
                      {searchTerms.map((st: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-all">
                          <td className="px-4 py-3 font-medium text-slate-200 text-sm">{st.searchTerm}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{st.campaignName}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{st.adGroupName}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{st.status}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(st.impressions || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(st.clicks || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{st.ctr}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">₹{st.cost}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(st.conversions || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Ad Performance Report */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-100 flex items-center gap-2"><BarChart2 className="h-4 w-4 text-primary" />Ad Performance Report <span className="text-xs text-slate-500">({adReport.length})</span></h2>
              </div>
              {adReport.length === 0 ? (
                <EmptyState icon={BarChart2} title="No ad performance data" sub="Ad performance data will appear here once your ads start running." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-700/50">{["Ad ID", "Type", "Campaign", "Ad Group", "Strength", "Status", "Impressions", "Clicks", "CTR", "Spend", "Conv."].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-700/20">
                      {adReport.map((ad: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-all">
                          <td className="px-4 py-3 text-xs text-slate-500 font-mono">{ad.adId}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{ad.adType?.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{ad.campaignName}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{ad.adGroupName}</td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${ad.adStrength === "EXCELLENT" ? "text-emerald-400 bg-emerald-400/10" : ad.adStrength === "GOOD" ? "text-sky-400 bg-sky-400/10" : "text-slate-400 bg-slate-700/30"}`}>{ad.adStrength || "—"}</span></td>
                          <td className="px-4 py-3"><Pill status={ad.status} /></td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(ad.impressions || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(ad.clicks || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{ad.ctr}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">₹{ad.cost}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{Number(ad.conversions || 0).toFixed(1)}</td>
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

      {/* Campaign Creator */}
      {showCreator && selectedCustomerId && (
        <CampaignCreator orgId={orgId} customerId={selectedCustomerId} onClose={() => setShowCreator(false)} onSuccess={() => { setShowCreator(false); loadCampaigns(selectedCustomerId); setActiveTab("campaigns"); }} />
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
            <Textarea label="Keywords (one per line)" rows={8} value={newKeywords} onChange={(e: any) => setNewKeywords(e.target.value)} placeholder={"local SEO agency\ndigital marketing pune\ngmb setup service"} />
            <div className="flex gap-3">
              <button onClick={() => setShowAddKeyword(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all text-sm">Cancel</button>
              <button onClick={addKeywords} disabled={addingKw || !newKeywords.trim() || !newKwAdGroupRes}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary disabled:opacity-40 transition-all text-sm">
                {addingKw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Keywords
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Analysis Modal */}
      {showAnalysis && (
        <Modal title="AI Campaign Analysis" onClose={() => setShowAnalysis(false)} wide>
          {analyzing ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                <Bot className="h-6 w-6 text-violet-400 animate-pulse" />
              </div>
              <p className="text-slate-300 font-medium">Analyzing your campaign...</p>
              <p className="text-slate-500 text-sm">AI is reviewing performance, keywords, and search terms</p>
            </div>
          ) : analysis ? (
            <div className="space-y-5">
              {/* Score */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-primary/20 flex items-center justify-center border border-violet-500/20">
                  <span className={`text-2xl font-black ${analysis.score >= 7 ? "text-emerald-400" : analysis.score >= 5 ? "text-amber-400" : "text-rose-400"}`}>{analysis.score}</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-100">Campaign Score: {analysis.score}/10</p>
                  <p className="text-sm text-slate-400">{analysis.assessment}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4" />Strengths</h4>
                  <ul className="space-y-1.5">
                    {(analysis.strengths || []).map((s: string, i: number) => <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5"><span className="text-emerald-400 mt-0.5">✓</span>{s}</li>)}
                  </ul>
                </div>
                {/* Issues */}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <h4 className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4" />Issues</h4>
                  <ul className="space-y-1.5">
                    {(analysis.issues || []).map((s: string, i: number) => <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5"><span className="text-rose-400 mt-0.5">!</span>{s}</li>)}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Recommendations</h4>
                <div className="space-y-2">
                  {(analysis.recommendations || []).map((r: any, i: number) => (
                    <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-200">{r.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.impact === "HIGH" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : r.impact === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"}`}>{r.impact}</span>
                      </div>
                      <p className="text-xs text-slate-400">{r.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Negative Keywords */}
              {analysis.negativeKeywords?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">Suggested Negative Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.negativeKeywords.map((kw: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl bg-slate-800 border border-slate-600/50 text-slate-100 text-sm shadow-2xl backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  );
}
