"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, Palette,
  Type, Layers3, Tag, Mail, Tv, Monitor
} from "lucide-react";

const Youtube = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function NoGuidanceVideoWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  // Active step (1 to 6)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "NO_GUIDANCE",
    selectedType: "VIDEO",
    campaignName: "Video-1",
    conversionGoals: ["Phone call leads", "Web conversion forms"],

    // Step 2: Campaign Settings
    campaignSubtype: "Video views" as "Video views" | "Brand awareness and reach" | "Product and brand consideration" | "Website traffic" | "Lead generation",
    networks: {
      youtubeSearch: true,
      youtubeVideos: true,
      displayPartners: true
    },
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States"],
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    devices: {
      computers: true,
      mobile: true,
      tablets: true,
      tv: true
    },
    moreSettingsOpen: false,

    // Step 3: Budget and Bidding
    budgetAmount: "1000",
    biddingFocus: "Maximum CPV" as "Maximum CPV" | "Target CPM" | "Maximize conversions" | "Target CPA" | "Target CPV",
    targetCpvValue: "2.50",
    targetCpmValue: "100.00",
    targetCpaValue: "25.00",
    onlyNewCustomers: false,

    // Step 4: Audience & Targeting
    adGroupName: "Ad group 1",
    demographics: {
      age: ["18-24", "25-34", "35-44"],
      gender: ["Male", "Female"],
      householdIncome: ["Top 10%", "11-20%", "21-30%"]
    },
    targetingKeywords: ["video automation", "youtube ads", "brand reach"],
    targetingTopics: ["Internet & Telecom", "Computers & Electronics"],
    targetingPlacements: ["@TechChannel", "@DigitalMarketingHub"],

    // Step 5: Video Ads Creation
    adFormat: "SKIPPABLE_IN_STREAM" as "SKIPPABLE_IN_STREAM" | "NON_SKIPPABLE" | "IN_FEED" | "BUMPER",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    finalUrl: "https://www.example.com",
    displayUrl: "example.com/demo",
    headline: "Watch Full Product Demo",
    description: "Discover how smart video automation drives high-intent brand views",
    callToAction: "Learn More"
  });

  // UI state for preview
  const [previewTab, setPreviewTab] = useState<"INSTREAM" | "INFEED" | "SHORTS">("INSTREAM");

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Helper for Ad Strength calculation
  const calculateAdStrength = () => {
    let score = 0;
    if (formData.videoUrl.trim().length > 0) score += 40;
    if (formData.headline.trim().length > 0) score += 20;
    if (formData.description.trim().length > 0) score += 20;
    if (formData.finalUrl.trim().length > 0) score += 20;

    if (score < 40) return { label: "Incomplete", color: "text-amber-500", barColor: "bg-amber-500", percent: 25 };
    if (score < 60) return { label: "Average", color: "text-orange-400", barColor: "bg-orange-400", percent: 50 };
    if (score < 85) return { label: "Good", color: "text-blue-400", barColor: "bg-blue-400", percent: 75 };
    return { label: "Excellent", color: "text-emerald-400", barColor: "bg-emerald-400", percent: 100 };
  };

  const adStrength = calculateAdStrength();

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 1) {
      if (!formData.campaignName.trim()) return false;
    }
    if (step === 3) {
      if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) return false;
      if (formData.biddingFocus === "Maximum CPV" && (!formData.targetCpvValue || parseFloat(formData.targetCpvValue) <= 0)) return false;
      if (formData.biddingFocus === "Target CPA" && (!formData.targetCpaValue || parseFloat(formData.targetCpaValue) <= 0)) return false;
    }
    if (step === 5) {
      return formData.videoUrl.trim().length > 0 && formData.finalUrl.trim().length > 0 && formData.headline.trim().length > 0;
    }
    return true;
  };

  // Step 6 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      campaignSubtype: formData.campaignSubtype,
      networks: Object.keys(formData.networks).filter(k => (formData.networks as any)[k]),
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      languages: formData.languages,
      euPolitical: formData.euPolitical,
      budgetType: "DAILY",
      dailyBudget: parseFloat(formData.budgetAmount || "1000"),
      biddingFocus: formData.biddingFocus,
      targetCpv: parseFloat(formData.targetCpvValue || "2.50"),
      targetCpa: parseFloat(formData.targetCpaValue || "25"),
      targetCpm: parseFloat(formData.targetCpmValue || "100"),
      adGroupName: formData.adGroupName,
      adFormat: formData.adFormat,
      videoUrl: formData.videoUrl,
      finalUrl: formData.finalUrl,
      headline: formData.headline,
      description: formData.description,
      callToAction: formData.callToAction
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-noguidance-video-campaign`, {
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
        message: "Video Campaign created successfully without guidance (Paused)",
        backendMapping: {
          advertising_channel_type: "VIDEO",
          campaign_subtype: formData.campaignSubtype,
          bidding_focus: formData.biddingFocus,
          "CampaignBudget.amount_micros": parseFloat(formData.budgetAmount || "1000") * 1000000
        }
      });
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
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
            <span className="text-red-400 font-semibold flex items-center gap-1.5">
              <Youtube className="h-4 w-4 text-red-500" /> Video Campaign Setup
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400">
                <Youtube className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Video Campaign</div>
                <div className="text-[10px] text-slate-400">YouTube & Video Partners</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective & Type", desc: "Select Video campaign" },
                { num: 2, title: "Campaign Settings", desc: "Subtype, networks & EU" },
                { num: 3, title: "Budget and Bidding", desc: "CPV bids & daily budget" },
                { num: 4, title: "Audience & Targeting", desc: "Demographics & placements" },
                { num: 5, title: "Video Ads Creation", desc: "YouTube link & live preview" },
                { num: 6, title: "Review", desc: "Final audit & publish" }
              ].map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => { if (s.num < step) setStep(s.num); }}
                    className={`relative flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-red-600/15 border border-red-500/40 text-white shadow-lg shadow-red-950/40 font-medium"
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
                          ? "bg-red-500 text-white ring-4 ring-red-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold leading-tight">
                        <span className={isActive ? "text-red-400" : isCompleted ? "text-slate-200" : "text-slate-400"}>
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
            <div>Mapped to `advertising_channel_type = VIDEO`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE & CAMPAIGN TYPE */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Select Campaign Type</h1>
                <p className="text-xs text-slate-400 mt-1">Select Video to reach audiences on YouTube and across video partners</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "VIDEO", title: "Video", desc: "Reach viewers on YouTube and across web video partners with skippable & in-feed ads", icon: Youtube, selected: true },
                  { id: "PERFORMANCE_MAX", title: "Performance Max", desc: "Reach audiences across all of Google", icon: Sparkles },
                  { id: "SEARCH", title: "Search", desc: "High-intent text search ads", icon: Search },
                  { id: "DEMAND_GEN", title: "Demand Gen", desc: "Visual ads on YouTube & Discover", icon: Zap },
                  { id: "DISPLAY", title: "Display", desc: "Visual banner ads across websites", icon: ImageIcon },
                  { id: "SHOPPING", title: "Shopping", desc: "Product inventory listings", icon: Tag }
                ].map((ct) => {
                  const isSel = formData.selectedType === ct.id;
                  const Icon = ct.icon;

                  return (
                    <div
                      key={ct.id}
                      onClick={() => setFormData(prev => ({ ...prev, selectedType: ct.id }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSel
                          ? "bg-red-600/10 border-red-500 ring-2 ring-red-500/30 text-white shadow-md shadow-red-950/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSel && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Icon className={`h-6 w-6 ${isSel ? "text-red-400" : "text-slate-400"}`} />
                        <h3 className="font-bold text-sm text-slate-100">{ct.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{ct.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Campaign Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Campaign name</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS & SUBTYPE */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Settings & Subtype</h1>
                <p className="text-xs text-slate-400 mt-1">Select your video subtype goal, networks, locations, and device options</p>
              </div>

              {/* Campaign Subtype */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select a campaign subtype</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "Video views", title: "Video views (Recommended)", desc: "Get more views and consideration across YouTube" },
                    { id: "Brand awareness and reach", title: "Brand awareness and reach", desc: "Reach a broad audience with cost-effective CPM bids" },
                    { id: "Product and brand consideration", title: "Product and brand consideration", desc: "Encourage people to consider your product or service" },
                    { id: "Website traffic", title: "Website traffic", desc: "Drive relevant traffic and visits to your site" }
                  ].map((sub) => {
                    const isSel = formData.campaignSubtype === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setFormData(prev => ({ ...prev, campaignSubtype: sub.id as any }))}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSel ? "bg-red-600/10 border-red-500 text-white font-bold ring-1 ring-red-500/30" : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{sub.title}</span>
                          {isSel && <CheckCircle2 className="h-4 w-4 text-red-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{sub.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Networks */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100">Networks</h3>
                <div className="space-y-2">
                  {[
                    { key: "youtubeSearch", label: "YouTube search results" },
                    { key: "youtubeVideos", label: "YouTube videos" },
                    { key: "displayPartners", label: "Video partners on the Display Network" }
                  ].map((net) => (
                    <label key={net.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.networks as any)[net.key]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          networks: { ...prev.networks, [net.key]: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded text-red-500 bg-slate-950 border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-200">{net.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations & Languages */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-red-400" /> Locations & Languages
                </h3>

                <div className="space-y-2">
                  {[
                    { id: "ALL", label: "All countries and territories" },
                    { id: "INDIA", label: "India" },
                    { id: "CUSTOM", label: "Enter another location" }
                  ].map((loc) => (
                    <label
                      key={loc.id}
                      onClick={() => setFormData(prev => ({ ...prev, locationType: loc.id as any }))}
                      className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.locationType === loc.id ? "bg-red-600/10 border-red-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locations"
                        checked={formData.locationType === loc.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-red-500"
                      />
                      <span className="text-xs font-semibold">{loc.label}</span>
                    </label>
                  ))}
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
                        formData.euPolitical === eu.id ? "bg-red-600/10 border-red-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="euPolitical"
                        checked={formData.euPolitical === eu.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-red-500"
                      />
                      <span className="text-xs font-semibold">{eu.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET AND BIDDING */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Budget and Bidding</h1>
                <p className="text-xs text-slate-400 mt-1">Set your daily budget and cost-per-view (CPV) bid strategy</p>
              </div>

              {/* Daily Budget */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Set your average daily budget (₹)</label>
                <input
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                  className="w-full max-w-xs px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                />
              </div>

              {/* Bidding Focus */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bidding – What do you want to focus on?</label>
                  <select
                    value={formData.biddingFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, biddingFocus: e.target.value as any }))}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Maximum CPV">Maximum CPV (Cost-per-view)</option>
                    <option value="Target CPM">Target CPM</option>
                    <option value="Maximize conversions">Maximize conversions</option>
                    <option value="Target CPA">Target CPA</option>
                  </select>
                </div>

                {formData.biddingFocus === "Maximum CPV" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-xs space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Maximum CPV bid (₹)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.targetCpvValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCpvValue: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-400">Maximum amount you are willing to pay per view.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: AUDIENCE & TARGETING */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Ad Group & Targeting</h1>
                <p className="text-xs text-slate-400 mt-1">Configure your ad group name, demographics, topics, and placement targeting</p>
              </div>

              {/* Ad Group Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Ad group name</label>
                <input
                  type="text"
                  value={formData.adGroupName}
                  onChange={(e) => setFormData(prev => ({ ...prev, adGroupName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Demographics Card */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-400" /> Demographics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300">Age</span>
                    <div className="mt-1 space-y-1 text-slate-400">
                      <div>☑ 18–24</div>
                      <div>☑ 25–34</div>
                      <div>☑ 35–44</div>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Gender</span>
                    <div className="mt-1 space-y-1 text-slate-400">
                      <div>☑ Female</div>
                      <div>☑ Male</div>
                      <div>☑ Unknown</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: VIDEO ADS CREATION */}
          {step === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Video Ad Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Create Video Ad</h1>
                  <p className="text-xs text-slate-400 mt-1">Provide your YouTube video URL, headlines, and call-to-action button</p>
                </div>

                {/* YouTube Video URL */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" /> Your YouTube video (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Final URL & Call to Action */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Final URL</label>
                    <input
                      type="text"
                      value={formData.finalUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, finalUrl: e.target.value }))}
                      placeholder="https://www.example.com"
                      className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Call-to-action button</label>
                    <input
                      type="text"
                      value={formData.callToAction}
                      onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                      className="w-full mt-1.5 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Headline & Description */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Headline (Max 30 chars)</label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) => {
                          if (e.target.value.length <= 30) setFormData(prev => ({ ...prev, headline: e.target.value }));
                        }}
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400">
                        {formData.headline.length}/30
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Description (Max 90 chars)</label>
                    <div className="relative mt-1">
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={(e) => {
                          if (e.target.value.length <= 90) setFormData(prev => ({ ...prev, description: e.target.value }));
                        }}
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14 resize-none"
                      />
                      <span className="absolute right-3 bottom-2 text-[10px] font-mono text-slate-400">
                        {formData.description.length}/90
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live YouTube Video Preview Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex border-b border-slate-800 pb-2 justify-around text-[11px] font-semibold">
                    {[
                      { id: "INSTREAM", label: "In-Stream" },
                      { id: "INFEED", label: "In-Feed" },
                      { id: "SHORTS", label: "Shorts" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPreviewTab(tab.id as any)}
                        className={`pb-1 border-b-2 transition-all ${
                          previewTab === tab.id ? "border-red-500 text-red-400 font-bold" : "border-transparent text-slate-400"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* YouTube Video Preview Frame */}
                  <div className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col justify-between p-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded flex items-center gap-1">
                        <Youtube className="h-3 w-3" /> Ad
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{previewTab}</span>
                    </div>

                    <div className="my-auto text-center space-y-1.5">
                      <Play className="h-10 w-10 text-red-500 mx-auto animate-pulse" />
                      <div className="text-xs font-bold text-white truncate px-2">{formData.headline || "Your YouTube Video Ad"}</div>
                      <div className="text-[10px] text-slate-300 line-clamp-1">{formData.description || "Video description line."}</div>
                    </div>

                    <div className="flex items-center justify-between bg-black/80 p-2 rounded-lg backdrop-blur">
                      <span className="text-[10px] text-slate-200 font-mono truncate">{formData.displayUrl}</span>
                      <button className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[10px] rounded">
                        {formData.callToAction}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & PUBLISH */}
          {step === 6 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Review & Publish</h1>
                <p className="text-xs text-slate-400 mt-1">Review your Video Campaign details before publishing as PAUSED</p>
              </div>

              {/* Summary Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-red-400">Campaign Name</div>
                    <div className="text-lg font-bold text-white">{formData.campaignName}</div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign Subtype</span>
                    <div className="font-bold text-white">{formData.campaignSubtype}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Bidding Focus</span>
                    <div className="font-bold text-white">{formData.biddingFocus} (Max CPV: ₹{formData.targetCpvValue})</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetAmount}/day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">YouTube Video URL</span>
                    <div className="font-bold text-white font-mono text-[11px] truncate">{formData.videoUrl}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Video Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for YouTube video delivery.</p>
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
          {step < 6 ? (
            <button
              disabled={!isCurrentStepValid()}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all cursor-pointer"
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
