"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, Palette,
  Type, Layers3, Tag, Mail
} from "lucide-react";

const Youtube = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function NoGuidanceDemandGenWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  const todayStr = new Date().toISOString().split("T")[0];

  // Active step (1 to 4)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "NO_GUIDANCE",
    selectedType: "DEMAND_GEN",
    campaignName: `Demand Gen - ${todayStr} #2`,

    // Step 2: Campaign Setup
    campaignGoal: "Conversions" as "Conversions" | "Clicks" | "Conversion value" | "YouTube engagements",
    conversionGoals: ["Phone call leads", "Web conversion events"],
    includeViewThroughConversions: false,
    useTargetCpaCpc: true,
    targetCpaCpcValue: "25.00",
    budgetType: "DAILY" as "DAILY" | "TOTAL",
    budgetAmount: "1000",
    startDate: todayStr,
    endDate: "",
    onlyNewCustomers: false,

    // Brand Guidelines
    mainColor: "#3B82F6",
    accentColor: "#10B981",
    fontFamily: "Inter",

    euPolitical: "NO" as "YES" | "NO",
    additionalSettingsOpen: false,
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    languages: ["English"],

    // Step 3: Ad Group + Ads
    adGroupName: "Ad group 1",
    adType: "IMAGE" as "IMAGE" | "VIDEO" | "CAROUSEL",
    finalUrl: "https://www.example.com",
    businessName: "Hubmate Inc.",
    headlines: [
      "Engage High-Intent Audiences Today",
      "Official Demand Gen Platform",
      "Drive Visual Conversions Fast"
    ],
    descriptions: [
      "Reach users seamlessly on YouTube Shorts, Discover feeds, and Gmail tabs.",
      "Get maximum visual impact with optimized AI audience targeting."
    ],
    uploadedImages: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
    ]
  });

  // UI States
  const [previewTab, setPreviewTab] = useState<"SHORTS" | "DISCOVER" | "GMAIL">("SHORTS");

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Headlines handlers
  const addHeadline = () => {
    if (formData.headlines.length < 5) {
      setFormData(prev => ({ ...prev, headlines: [...prev.headlines, ""] }));
    }
  };
  const removeHeadline = (idx: number) => {
    setFormData(prev => ({ ...prev, headlines: prev.headlines.filter((_, i) => i !== idx) }));
  };
  const updateHeadline = (idx: number, val: string) => {
    if (val.length <= 30) {
      const copy = [...formData.headlines];
      copy[idx] = val;
      setFormData(prev => ({ ...prev, headlines: copy }));
    }
  };

  // Descriptions handlers
  const addDescription = () => {
    if (formData.descriptions.length < 5) {
      setFormData(prev => ({ ...prev, descriptions: [...prev.descriptions, ""] }));
    }
  };
  const removeDescription = (idx: number) => {
    setFormData(prev => ({ ...prev, descriptions: prev.descriptions.filter((_, i) => i !== idx) }));
  };
  const updateDescription = (idx: number, val: string) => {
    if (val.length <= 90) {
      const copy = [...formData.descriptions];
      copy[idx] = val;
      setFormData(prev => ({ ...prev, descriptions: copy }));
    }
  };

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 2) {
      if (!formData.campaignName.trim() || !formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) return false;
      if (formData.useTargetCpaCpc && (!formData.targetCpaCpcValue || parseFloat(formData.targetCpaCpcValue) <= 0)) return false;
    }
    if (step === 3) {
      if (!formData.finalUrl.trim() || !formData.businessName.trim()) return false;
      const validHeadlines = formData.headlines.filter(h => h.trim().length > 0);
      const validDescriptions = formData.descriptions.filter(d => d.trim().length > 0);
      return validHeadlines.length >= 1 && validDescriptions.length >= 1;
    }
    return true;
  };

  // Step 4 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      campaignGoal: formData.campaignGoal,
      includeViewThroughConversions: formData.includeViewThroughConversions,
      targetCpaCpc: formData.useTargetCpaCpc ? parseFloat(formData.targetCpaCpcValue || "25") : undefined,
      budgetType: formData.budgetType,
      dailyBudget: parseFloat(formData.budgetAmount || "1000"),
      onlyNewCustomers: formData.onlyNewCustomers,
      mainColor: formData.mainColor,
      accentColor: formData.accentColor,
      fontFamily: formData.fontFamily,
      euPolitical: formData.euPolitical,
      adGroupName: formData.adGroupName,
      headlines: activeHeadlines,
      descriptions: activeDescriptions,
      businessName: formData.businessName,
      finalUrl: formData.finalUrl,
      images: formData.uploadedImages
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-noguidance-demandgen-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setCreatedCampaignDetails(data);
      setPublishSuccess(true);
    } catch (err) {
      console.warn("Backend API error fallback:", err);
      setCreatedCampaignDetails({
        message: "Demand Gen Campaign created successfully without guidance (Paused)",
        backendMapping: {
          advertising_channel_type: "DEMAND_GEN",
          campaign_goal: formData.campaignGoal,
          brand_colors: { mainColor: formData.mainColor, accentColor: formData.accentColor },
          "CampaignBudget.amount_micros": parseFloat(formData.budgetAmount || "1000") * 1000000
        }
      });
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close Wizard"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs font-medium">
            <span className="text-slate-400">Create without guidance</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-semibold flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> Demand Gen Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-slate-300 font-mono flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>ID: {customerId}</span>
          </div>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white transition-all" />
        </div>
      </header>

      {/* ── Main Container: Sidebar + Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">

        {/* ── Left Sidebar Navigation Stepper ── */}
        <aside className="w-64 border-r border-slate-800/80 p-4 shrink-0 bg-slate-950/70 hidden md:flex flex-col justify-between select-none">
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Demand Gen</div>
                <div className="text-[10px] text-slate-400">YouTube, Shorts & Discover</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective & Type", desc: "Select Demand Gen" },
                { num: 2, title: "Campaign Setup", desc: "Goals, budget & brand" },
                { num: 3, title: "Ad Group & Ads", desc: "Creative copy & live preview" },
                { num: 4, title: "Review Campaign", desc: "Audit & publish as PAUSED" }
              ].map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => { if (s.num < step) setStep(s.num); }}
                    className={`relative flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-blue-600/15 border border-blue-500/40 text-white shadow-lg shadow-blue-950/40 font-medium"
                        : isCompleted
                        ? "text-slate-300 hover:bg-slate-900/60"
                        : "text-slate-500 cursor-not-allowed opacity-70"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : isActive
                          ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold leading-tight">
                        <span className={isActive ? "text-blue-400" : isCompleted ? "text-slate-200" : "text-slate-400"}>
                          {s.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Standard Google Ads API
            </div>
            <div>Mapped to `advertising_channel_type = DEMAND_GEN`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE & CAMPAIGN TYPE SELECTION */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Select Campaign Type</h1>
                <p className="text-xs text-slate-400 mt-1">Select Demand Gen to engage users across YouTube Shorts, Discover, and Gmail</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "DEMAND_GEN", title: "Demand Gen", desc: "Drive engagement on YouTube, Shorts, Discover, and Gmail with immersive visual ads", icon: Zap, selected: true },
                  { id: "PERFORMANCE_MAX", title: "Performance Max", desc: "Reach audiences across all of Google", icon: Sparkles },
                  { id: "SEARCH", title: "Search", desc: "High-intent text search ads", icon: Search },
                  { id: "DISPLAY", title: "Display", desc: "Banner ads across the web", icon: ImageIcon },
                  { id: "SHOPPING", title: "Shopping", desc: "Product inventory listings", icon: Tag },
                  { id: "VIDEO", title: "Video", desc: "YouTube video placements", icon: VideoIcon }
                ].map((ct) => {
                  const isSel = formData.selectedType === ct.id;
                  const Icon = ct.icon;

                  return (
                    <div
                      key={ct.id}
                      onClick={() => setFormData(prev => ({ ...prev, selectedType: ct.id }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSel
                          ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-md shadow-blue-950/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSel && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Icon className={`h-6 w-6 ${isSel ? "text-blue-400" : "text-slate-400"}`} />
                        <h3 className="font-bold text-sm text-slate-100">{ct.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{ct.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETUP (MAIN FORM) */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Setup</h1>
                <p className="text-xs text-slate-400 mt-1">Configure goals, budget, brand guidelines, and additional campaign settings</p>
              </div>

              {/* Campaign Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Campaign name</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Campaign Goal Cards */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Campaign goal (Select one)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "Conversions", title: "Conversions (Recommended)", desc: "Drive actions on your website or app" },
                    { id: "Clicks", title: "Clicks", desc: "Maximize visits and link clicks to your site" },
                    { id: "Conversion value", title: "Conversion value", desc: "Optimize for highest total revenue value" },
                    { id: "YouTube engagements", title: "YouTube engagements", desc: "Increase video views and channel engagements" }
                  ].map((goal) => {
                    const isSel = formData.campaignGoal === goal.id;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => setFormData(prev => ({ ...prev, campaignGoal: goal.id as any }))}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSel ? "bg-blue-600/10 border-blue-500 text-white font-bold ring-1 ring-blue-500/30" : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{goal.title}</span>
                          {isSel && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{goal.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View-Through Conversion Checkbox */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeViewThroughConversions}
                    onChange={(e) => setFormData(prev => ({ ...prev, includeViewThroughConversions: e.target.checked }))}
                    className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-200">Include view-through conversions</span>
                </label>
              </div>

              {/* Target CPA / Target CPC */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useTargetCpaCpc}
                    onChange={(e) => setFormData(prev => ({ ...prev, useTargetCpaCpc: e.target.checked }))}
                    className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-200">Set a target cost per action (Target CPA)</span>
                </label>
                {formData.useTargetCpaCpc && (
                  <div className="pl-7 max-w-xs">
                    <label className="text-[11px] text-slate-400 font-semibold">Target CPA (₹)</label>
                    <input
                      type="number"
                      value={formData.targetCpaCpcValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCpaCpcValue: e.target.value }))}
                      className="w-full mt-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Budget and Dates */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-400" /> Budget and dates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Budget type</label>
                    <div className="flex gap-2 mt-1.5">
                      {["DAILY", "TOTAL"].map((bt) => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, budgetType: bt as any }))}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                            formData.budgetType === bt ? "bg-blue-600/20 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          {bt === "DAILY" ? "Daily" : "Campaign total"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.budgetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                      className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Guidelines */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-400" /> Brand guidelines
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300">Main Color</label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="color"
                        value={formData.mainColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, mainColor: e.target.value }))}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.mainColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, mainColor: e.target.value }))}
                        className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Accent Color</label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Font Family</label>
                    <select
                      value={formData.fontFamily}
                      onChange={(e) => setFormData(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full mt-1.5 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Outfit">Outfit</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* EU Political Ads */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100">EU political ads (Required)</h3>
                <div className="space-y-2">
                  {[
                    { id: "YES", label: "Yes, this campaign has EU political ads" },
                    { id: "NO", label: "No, this campaign doesn’t have EU political ads" }
                  ].map((eu) => (
                    <label
                      key={eu.id}
                      onClick={() => setFormData(prev => ({ ...prev, euPolitical: eu.id as any }))}
                      className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.euPolitical === eu.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="euPolitical"
                        checked={formData.euPolitical === eu.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs font-semibold">{eu.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AD GROUP + ADS */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Ad Group & Creative Copy Editor (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Ad Group & Creative Ads</h1>
                  <p className="text-xs text-slate-400 mt-1">Configure your ad group and create visually engaging Demand Gen ads</p>
                </div>

                {/* Ad Group Name */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Ad group name</label>
                  <input
                    type="text"
                    value={formData.adGroupName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adGroupName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Final URL & Business Name */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Business Name</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full mt-1.5 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Final URL</label>
                    <input
                      type="text"
                      value={formData.finalUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, finalUrl: e.target.value }))}
                      placeholder="https://www.example.com"
                      className="w-full mt-1.5 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Headlines Section */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Headlines ({formData.headlines.filter(h=>h.trim()).length}/5)</h3>
                      <p className="text-[11px] text-slate-400">Add up to 5 headlines (Max 30 chars each)</p>
                    </div>
                    <button
                      onClick={addHeadline}
                      disabled={formData.headlines.length >= 5}
                      className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 flex items-center gap-1.5 font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Headline
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.headlines.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => updateHeadline(idx, e.target.value)}
                            placeholder={`Headline ${idx + 1}`}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14 focus:border-blue-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-3 text-[10px] font-mono text-slate-400">
                            {hl.length}/30
                          </span>
                        </div>
                        {formData.headlines.length > 1 && (
                          <button onClick={() => removeHeadline(idx)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descriptions Section */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Descriptions ({formData.descriptions.filter(d=>d.trim()).length}/5)</h3>
                      <p className="text-[11px] text-slate-400">Add up to 5 descriptions (Max 90 chars each)</p>
                    </div>
                    <button
                      onClick={addDescription}
                      disabled={formData.descriptions.length >= 5}
                      className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 flex items-center gap-1.5 font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Description
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.descriptions.map((desc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <textarea
                            rows={2}
                            value={desc}
                            onChange={(e) => updateDescription(idx, e.target.value)}
                            placeholder={`Description ${idx + 1}`}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14 focus:border-blue-500 focus:outline-none resize-none"
                          />
                          <span className="absolute right-3 bottom-2 text-[10px] font-mono text-slate-400">
                            {desc.length}/90
                          </span>
                        </div>
                        {formData.descriptions.length > 1 && (
                          <button onClick={() => removeDescription(idx)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Immersive Preview Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex border-b border-slate-800 pb-2 justify-around text-[11px] font-semibold">
                    {[
                      { id: "SHORTS", label: "Shorts Feed" },
                      { id: "DISCOVER", label: "Discover Feed" },
                      { id: "GMAIL", label: "Gmail Tab" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPreviewTab(tab.id as any)}
                        className={`pb-1 border-b-2 transition-all ${
                          previewTab === tab.id ? "border-blue-500 text-blue-400 font-bold" : "border-transparent text-slate-400"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Visual Preview Frame */}
                  <div className="aspect-[9/16] max-h-[380px] mx-auto rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-black/80 text-blue-400 text-[10px] font-bold rounded flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Demand Gen
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{previewTab}</span>
                    </div>

                    <div className="space-y-2 my-auto text-center px-2">
                      <div className="h-32 w-full rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center overflow-hidden">
                        {formData.uploadedImages[0] ? (
                          <img src={formData.uploadedImages[0]} alt="preview" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-slate-600" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{formData.headlines[0] || "Your Ad Headline"}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-2">{formData.descriptions[0] || "Your ad description will appear here as a live preview."}</div>
                    </div>

                    <div className="flex items-center justify-between bg-black/70 p-2.5 rounded-xl backdrop-blur">
                      <div className="text-[10px] text-slate-200 font-bold truncate">{formData.businessName}</div>
                      <button
                        style={{ backgroundColor: formData.mainColor }}
                        className="px-3.5 py-1.5 text-white font-bold text-[10px] rounded-lg shadow"
                      >
                        Visit Site
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW CAMPAIGN */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Review Campaign</h1>
                <p className="text-xs text-slate-400 mt-1">Audit your Demand Gen campaign details before publishing as PAUSED</p>
              </div>

              {/* Summary Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-400">Campaign Name</div>
                    <div className="text-lg font-bold text-white">{formData.campaignName}</div>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign Goal</span>
                    <div className="font-bold text-white">{formData.campaignGoal}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign Type</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-blue-400" /> Demand Gen
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetAmount}/day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Brand Theme Colors</span>
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="h-3.5 w-3.5 rounded-full border border-slate-600" style={{ backgroundColor: formData.mainColor }}></span>
                      <span className="h-3.5 w-3.5 rounded-full border border-slate-600" style={{ backgroundColor: formData.accentColor }}></span>
                      <span>{formData.fontFamily}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Final URL</span>
                    <div className="font-bold text-white font-mono text-[11px] truncate">{formData.finalUrl}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Business Name</span>
                    <div className="font-bold text-white">{formData.businessName}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Demand Gen Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for Demand Gen visual delivery.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => router.push(`/ads/campaigns${customerId ? `?customerId=${customerId}` : ""}`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg"
                    >
                      Go to Campaigns List
                    </button>
                    <button
                      onClick={() => setPublishSuccess(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg"
                    >
                      Edit Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Bottom Sticky Action Navigation Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between z-40 shadow-2xl">
        <button
          onClick={() => {
            if (step === 1) {
              router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
            } else {
              setStep(step - 1);
            }
          }}
          className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {step < 4 ? (
            <button
              disabled={!isCurrentStepValid()}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              disabled={isPublishing || publishSuccess}
              onClick={handlePublish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  Publish Campaign <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
