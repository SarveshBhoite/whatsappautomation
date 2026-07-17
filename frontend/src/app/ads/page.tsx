"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign,
  Target, Plus, Play, Pause, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap, BarChart2,
  ArrowUpRight, Store, Star
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  googleAdsCampaignId: string | null;
  name: string;
  budget: number;
  startDate: string;
  endDate: string | null;
  status: string;
  liveStatus: string;
  impressions: number;
  clicks: number;
  ctr: string;
  conversions: number;
  cost: string;
  headlines: string[];
  descriptions: string[];
  keywords: string[];
  createdAt: string;
}

interface AdsConfig {
  googleAdsCustomerId: string | null;
  googleRefreshToken: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(status: string) {
  if (status === "ENABLED") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
  if (status === "PAUSED") return "text-amber-400 bg-amber-400/10 border-amber-400/30";
  return "text-slate-400 bg-slate-400/10 border-slate-400/30";
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-5 flex flex-col gap-3 hover:border-slate-600/60 transition-all">
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GoogleAdsPage() {
  const orgId = DEFAULT_ORG_ID;

  // Connection state
  const [config, setConfig] = useState<AdsConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  // Creator panel state
  const [showCreator, setShowCreator] = useState(false);
  const [creatorStep, setCreatorStep] = useState<1 | 2 | 3>(1);

  // Step 1 – brief form
  const [brief, setBrief] = useState({
    businessDescription: "",
    campaignTheme: "",
    targetLocation: "",
    dailyBudget: "",
    finalUrl: "",
    startDate: "",
    endDate: ""
  });

  // Step 2 – AI generated copy
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{
    headlines: string[]; descriptions: string[]; keywords: string[];
  } | null>(null);
  const [editHeadlines, setEditHeadlines] = useState<string[]>([]);
  const [editDescs, setEditDescs] = useState<string[]>([]);
  const [editKeywords, setEditKeywords] = useState<string[]>([]);

  // Step 3 – launch
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<{ success: boolean; message: string } | null>(null);
  const [campaignName, setCampaignName] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ─── Load config ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadConfig() {
      setConfigLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/gmb/config?orgId=${orgId}`);
        const data = await res.json();
        setConfig({ googleAdsCustomerId: data.googleAdsCustomerId, googleRefreshToken: data.googleRefreshToken });
        setIsConnected(!!data.googleRefreshToken);
      } catch { /* silent */ } finally {
        setConfigLoading(false);
      }
    }
    loadConfig();
  }, []);

  // ─── Load campaigns when connected ───────────────────────────────────────
  useEffect(() => {
    if (isConnected) loadCampaigns();
  }, [isConnected]);

  async function loadCampaigns() {
    setCampsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/campaigns?orgId=${orgId}`);
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load campaigns"); } finally {
      setCampsLoading(false);
    }
  }

  // ─── Toggle campaign status ──────────────────────────────────────────────
  async function toggleStatus(campaign: Campaign) {
    const newStatus = campaign.liveStatus === "ENABLED" ? "PAUSED" : "ENABLED";
    setToggling(campaign.id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/campaign/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, campaignId: campaign.id, status: newStatus })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(`Campaign ${newStatus === "ENABLED" ? "enabled" : "paused"} ✓`);
      loadCampaigns();
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setToggling(null);
    }
  }

  // ─── Generate Ad Copy (Step 2) ───────────────────────────────────────────
  async function generateCopy() {
    setGenerating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/generate-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: brief.businessDescription,
          campaignTheme: brief.campaignTheme,
          targetLocation: brief.targetLocation,
          keywords: []
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setGenerated(data);
      setEditHeadlines(data.headlines);
      setEditDescs(data.descriptions);
      setEditKeywords(data.keywords);
      setCreatorStep(2);
    } catch (e: any) {
      showToast(`AI generation failed: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

  // ─── Launch Campaign (Step 3) ────────────────────────────────────────────
  async function launchCampaign() {
    if (!campaignName) { showToast("Please enter a campaign name"); return; }
    setLaunching(true);
    setLaunchResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/campaign/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          campaignName,
          budget: Number(brief.dailyBudget),
          startDate: brief.startDate || new Date().toISOString().split("T")[0],
          endDate: brief.endDate || undefined,
          finalUrl: brief.finalUrl,
          headlines: editHeadlines,
          descriptions: editDescs,
          keywords: editKeywords
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      setLaunchResult({ success: true, message: "Campaign launched successfully! It will be reviewed in Google Ads." });
      loadCampaigns();
    } catch (e: any) {
      setLaunchResult({ success: false, message: e.message });
    } finally {
      setLaunching(false);
    }
  }

  function resetCreator() {
    setShowCreator(false);
    setCreatorStep(1);
    setBrief({ businessDescription: "", campaignTheme: "", targetLocation: "", dailyBudget: "", finalUrl: "", startDate: "", endDate: "" });
    setGenerated(null);
    setEditHeadlines([]);
    setEditDescs([]);
    setEditKeywords([]);
    setCampaignName("");
    setLaunchResult(null);
  }

  // ─── Aggregate totals ────────────────────────────────────────────────────
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalCost = campaigns.reduce((s, c) => s + parseFloat(c.cost || "0"), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const avgCtr = campaigns.length > 0
    ? (campaigns.reduce((s, c) => s + parseFloat(c.ctr || "0"), 0) / campaigns.length).toFixed(2) + "%"
    : "0%";

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">


      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-none">Google Ads</h1>
              <p className="text-xs text-slate-400 mt-0.5">Campaign Manager & AI Planner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <button onClick={loadCampaigns} className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all">
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            {isConnected && (
              <button
                onClick={() => { resetCreator(); setShowCreator(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                New Campaign
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Connection Card ── */}
          {configLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : !isConnected ? (
            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-8 flex flex-col items-center gap-6 text-center max-w-lg mx-auto mt-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <Megaphone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Connect Google Ads</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Connect your Google account to manage campaigns, view live performance metrics, and launch AI-powered ads directly from your CRM.
                </p>
              </div>
              <a
                href={`${BACKEND_URL}/api/gmb/oauth/connect?orgId=${orgId}`}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Connect with Google
              </a>
              <p className="text-xs text-slate-500">
                You will be asked to grant permissions for Google Business Profile and Google Ads management.
              </p>
            </div>
          ) : (
            <>
              {/* Connection status banner */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-300">
                  Google account connected
                  {config?.googleAdsCustomerId && (
                    <span className="text-emerald-400/70 ml-2 font-mono text-xs">
                      (Customer ID: {config.googleAdsCustomerId})
                    </span>
                  )}
                </p>
                <a
                  href={`${BACKEND_URL}/api/gmb/oauth/connect?orgId=${orgId}`}
                  className="ml-auto text-xs text-slate-400 hover:text-slate-200 transition-all underline"
                >
                  Reconnect
                </a>
              </div>

              {/* ── Metrics Grid ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard icon={Eye} label="Total Impressions" value={totalImpressions.toLocaleString()} color="bg-primary/15 text-primary" />
                <MetricCard icon={MousePointerClick} label="Total Clicks" value={totalClicks.toLocaleString()} color="bg-secondary/15 text-secondary" />
                <MetricCard icon={TrendingUp} label="Avg. CTR" value={avgCtr} color="bg-emerald-500/15 text-emerald-400" />
                <MetricCard icon={DollarSign} label="Total Spend" value={`₹${totalCost.toFixed(2)}`} color="bg-amber-500/15 text-amber-400" />
                <MetricCard icon={Target} label="Conversions" value={totalConversions} color="bg-emerald-500/15 text-emerald-400" />
              </div>

              {/* ── Campaigns Table ── */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Active Campaigns
                    <span className="ml-1 text-xs text-slate-500 font-normal">({campaigns.length})</span>
                  </h2>
                </div>

                {campsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-3 text-center px-8">
                    <Megaphone className="h-10 w-10 text-slate-600" />
                    <p className="text-slate-400 font-medium">No campaigns yet</p>
                    <p className="text-slate-500 text-sm">Launch your first AI-powered campaign to start reaching customers on Google Search.</p>
                    <button
                      onClick={() => { resetCreator(); setShowCreator(true); }}
                      className="mt-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
                    >
                      Create First Campaign
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {campaigns.map(c => (
                      <div key={c.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-800/30 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-100 truncate">{c.name}</p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColor(c.liveStatus)}`}>
                              {c.liveStatus}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                            <span className="text-xs text-slate-400">Budget: <strong className="text-slate-300">₹{c.budget}/day</strong></span>
                            <span className="text-xs text-slate-400">Start: <strong className="text-slate-300">{new Date(c.startDate).toLocaleDateString()}</strong></span>
                            {c.endDate && <span className="text-xs text-slate-400">End: <strong className="text-slate-300">{new Date(c.endDate).toLocaleDateString()}</strong></span>}
                          </div>
                        </div>

                        {/* Live metrics */}
                        <div className="grid grid-cols-4 gap-3 text-center">
                          {[
                            { label: "Impressions", val: c.impressions?.toLocaleString() ?? "0" },
                            { label: "Clicks", val: c.clicks?.toLocaleString() ?? "0" },
                            { label: "CTR", val: c.ctr ?? "0%" },
                            { label: "Spend", val: `₹${c.cost}` }
                          ].map(m => (
                            <div key={m.label}>
                              <p className="text-sm font-bold text-slate-100">{m.val}</p>
                              <p className="text-xs text-slate-500">{m.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => toggleStatus(c)}
                          disabled={toggling === c.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            c.liveStatus === "ENABLED"
                              ? "border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                          }`}
                        >
                          {toggling === c.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : c.liveStatus === "ENABLED" ? (
                            <><Pause className="h-3.5 w-3.5" /> Pause</>
                          ) : (
                            <><Play className="h-3.5 w-3.5" /> Enable</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────────────────
          AI Campaign Creator Slide-Over Panel
      ──────────────────────────────────────────────────────────────────────── */}
      {showCreator && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={resetCreator} />

          {/* Panel */}
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700/50 flex flex-col h-full overflow-hidden shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-slate-950" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-100">AI Campaign Creator</h2>
                  <p className="text-xs text-slate-400">Step {creatorStep} of 3</p>
                </div>
              </div>
              <button onClick={resetCreator} className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="px-6 py-3 border-b border-slate-700/30 flex items-center gap-0 shrink-0">
              {[
                { n: 1, label: "Campaign Brief" },
                { n: 2, label: "Review Ad Copy" },
                { n: 3, label: "Launch" }
              ].map((step, i) => (
                <div key={step.n} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 flex-1 ${i > 0 ? "flex-col sm:flex-row" : ""}`}>
                    {i > 0 && <div className={`h-px flex-1 ${creatorStep > i ? "bg-primary" : "bg-slate-700"}`} />}
                    <div className={`flex items-center gap-1.5 whitespace-nowrap ${i > 0 ? "mt-1 sm:mt-0" : ""}`}>
                      <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        creatorStep >= step.n ? "bg-primary text-slate-950" : "bg-slate-700 text-slate-400"
                      }`}>{step.n}</div>
                      <span className={`text-xs hidden sm:inline ${creatorStep >= step.n ? "text-slate-200" : "text-slate-500"}`}>{step.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* ── Step 1: Brief ── */}
              {creatorStep === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Business Description *</label>
                    <textarea
                      rows={3}
                      value={brief.businessDescription}
                      onChange={e => setBrief(b => ({ ...b, businessDescription: e.target.value }))}
                      placeholder="e.g. We are a digital marketing agency in Pune specialising in GMB setup, SEO, and local lead generation for small businesses."
                      className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-primary/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Campaign Goal / Theme *</label>
                    <input
                      value={brief.campaignTheme}
                      onChange={e => setBrief(b => ({ ...b, campaignTheme: e.target.value }))}
                      placeholder="e.g. Get more local business owners to enquire about GMB setup"
                      className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Location</label>
                    <input
                      value={brief.targetLocation}
                      onChange={e => setBrief(b => ({ ...b, targetLocation: e.target.value }))}
                      placeholder="e.g. Pune, Maharashtra"
                      className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Budget (₹) *</label>
                      <input
                        type="number"
                        value={brief.dailyBudget}
                        onChange={e => setBrief(b => ({ ...b, dailyBudget: e.target.value }))}
                        placeholder="500"
                        className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Landing Page URL *</label>
                      <input
                        value={brief.finalUrl}
                        onChange={e => setBrief(b => ({ ...b, finalUrl: e.target.value }))}
                        placeholder="https://yourwebsite.com"
                        className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={brief.startDate}
                        onChange={e => setBrief(b => ({ ...b, startDate: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500/60 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">End Date (optional)</label>
                      <input
                        type="date"
                        value={brief.endDate}
                        onChange={e => setBrief(b => ({ ...b, endDate: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500/60 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 2: Review AI Copy ── */}
              {creatorStep === 2 && (
                <>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-primary">Llama-3.3 generated this copy. Edit any field before launching.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-400">Headlines (max 30 chars each)</label>
                      <span className="text-xs text-slate-500">{editHeadlines.length} headlines</span>
                    </div>
                    <div className="space-y-2">
                      {editHeadlines.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            maxLength={30}
                            value={h}
                            onChange={e => {
                              const next = [...editHeadlines];
                              next[i] = e.target.value;
                              setEditHeadlines(next);
                            }}
                            className="flex-1 bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary/60 transition-all"
                          />
                          <span className={`text-xs shrink-0 w-8 text-right ${h.length > 28 ? "text-rose-400" : "text-slate-500"}`}>{h.length}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-400">Descriptions (max 90 chars each)</label>
                    </div>
                    <div className="space-y-2">
                      {editDescs.map((d, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            maxLength={90}
                            value={d}
                            onChange={e => {
                              const next = [...editDescs];
                              next[i] = e.target.value;
                              setEditDescs(next);
                            }}
                            className="flex-1 bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-100 resize-none focus:outline-none focus:border-blue-500/60 transition-all"
                          />
                          <span className={`text-xs shrink-0 w-8 text-right mt-1 ${d.length > 85 ? "text-rose-400" : "text-slate-500"}`}>{d.length}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Target Keywords</label>
                    <div className="flex flex-wrap gap-2">
                      {editKeywords.map((kw, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/60 border border-slate-600/40">
                          <span className="text-xs text-slate-200">{kw}</span>
                          <button onClick={() => setEditKeywords(ks => ks.filter((_, j) => j !== i))} className="text-slate-500 hover:text-rose-400 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 3: Launch ── */}
              {creatorStep === 3 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Campaign Name *</label>
                    <input
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      placeholder="e.g. Pune Digital Marketing - June 2025"
                      className="w-full bg-slate-800 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/60 transition-all"
                    />
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-100">Campaign Summary</h3>
                    {[
                      { label: "Daily Budget", val: `₹${brief.dailyBudget}` },
                      { label: "Landing URL", val: brief.finalUrl },
                      { label: "Headlines", val: `${editHeadlines.length} generated` },
                      { label: "Descriptions", val: `${editDescs.length} generated` },
                      { label: "Keywords", val: `${editKeywords.length} targeting` },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-slate-400">{r.label}</span>
                        <span className="text-slate-200 font-medium">{r.val}</span>
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

            {/* Panel footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between shrink-0 bg-slate-900">
              <button
                onClick={() => creatorStep > 1 ? setCreatorStep(s => (s - 1) as 1 | 2 | 3) : resetCreator()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                {creatorStep === 1 ? "Cancel" : "Back"}
              </button>

              {creatorStep === 1 && (
                <button
                  onClick={generateCopy}
                  disabled={!brief.businessDescription || !brief.campaignTheme || !brief.dailyBudget || !brief.finalUrl || generating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate Ad Copy"}
                </button>
              )}

              {creatorStep === 2 && (
                <button
                  onClick={() => setCreatorStep(3)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20"
                >
                  Review & Launch <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {creatorStep === 3 && !launchResult?.success && (
                <button
                  onClick={launchCampaign}
                  disabled={launching || !campaignName}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-slate-950 text-sm font-bold hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                >
                  {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {launching ? "Launching..." : "Launch Campaign"}
                </button>
              )}

              {launchResult?.success && (
                <button
                  onClick={resetCreator}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-700 text-slate-100 text-sm font-semibold hover:bg-slate-600 transition-all"
                >
                  Done <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl bg-slate-800 border border-slate-600/50 text-slate-100 text-sm shadow-2xl backdrop-blur animate-fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
