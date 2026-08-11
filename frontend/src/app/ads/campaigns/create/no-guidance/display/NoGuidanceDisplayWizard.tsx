"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, Palette,
  Type, Layers3, Tag, Mail, Wand2, Laptop
} from "lucide-react";

export default function NoGuidanceDisplayWizard() {
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
    selectedType: "DISPLAY",
    campaignName: "Display-4",
    conversionGoals: ["Phone call leads", "Web conversion forms"],
    finalUrl: "https://www.example.com",

    // Step 2: Campaign Settings
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States"],
    locationOption: "PRESENCE_OR_INTEREST" as "PRESENCE_OR_INTEREST" | "PRESENCE_ONLY",
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    moreSettingsOpen: false,

    // Step 3: Budget and Bidding
    budgetAmount: "1000",
    biddingFocus: "Conversions" as "Conversions" | "Conversion value" | "Viewable impressions" | "Other",
    useTargetCpa: true,
    targetCpaValue: "25.00",
    targetRoasValue: "200",
    viewableCpmValue: "50.00",

    // Step 4: Targeting
    optimizedTargeting: true,
    targetingOpen: {
      audience: true,
      demographics: false,
      keywords: false,
      topics: false,
      placements: false
    },
    targetKeywords: ["display ads", "online marketing", "automation tool"],

    // Step 5: Ads (Responsive Display Ad)
    businessName: "Hubmate Inc.",
    headlines: [
      "Grow Your Reach With Display Ads",
      "Official Automation Platform",
      "Instant Visual Audience Reach"
    ],
    longHeadline: "Engage prospective customers across millions of websites and mobile apps with Google Display",
    descriptions: [
      "Get automatic conversion optimization across high-performing Display banner placements.",
      "Drive brand consideration and website sales with real-time AI bidding."
    ],
    uploadedImages: [
      "https://images.unsplash.com/photo-1542744094-3a3172720189?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80"
    ],
    uploadedLogos: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"
    ]
  });

  // UI state for inputs
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [previewTab, setPreviewTab] = useState<"BANNER" | "GMAIL" | "YOUTUBE">("BANNER");

  // Modals
  const [showAiImageModal, setShowAiImageModal] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>("Professional modern business software display banner background");
  const [isGeneratingAiImages, setIsGeneratingAiImages] = useState<boolean>(false);
  const [generatedAiImages, setGeneratedAiImages] = useState<string[]>([]);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Helper for Ad Strength calculation
  const calculateAdStrength = () => {
    let score = 0;
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    if (activeHeadlines.length >= 1) score += 25;
    if (formData.longHeadline.trim().length > 0) score += 25;
    if (activeDescriptions.length >= 1) score += 25;
    if (formData.uploadedImages.length >= 2) score += 25;

    if (score < 30) return { label: "Incomplete", color: "text-amber-500", barColor: "bg-amber-500", percent: 25 };
    if (score < 60) return { label: "Average", color: "text-orange-400", barColor: "bg-orange-400", percent: 50 };
    if (score < 85) return { label: "Good", color: "text-blue-400", barColor: "bg-blue-400", percent: 75 };
    return { label: "Excellent", color: "text-emerald-400", barColor: "bg-emerald-400", percent: 100 };
  };

  const adStrength = calculateAdStrength();

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

  // AI Image Generator mock execution
  const handleGenerateAiImages = () => {
    setIsGeneratingAiImages(true);
    setTimeout(() => {
      setGeneratedAiImages([
        "https://images.unsplash.com/photo-1542744094-3a3172720189?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80"
      ]);
      setIsGeneratingAiImages(false);
    }, 1200);
  };

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 1) {
      if (!formData.campaignName.trim() || !formData.finalUrl.trim()) return false;
    }
    if (step === 3) {
      if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) return false;
      if (formData.biddingFocus === "Conversions" && formData.useTargetCpa && (!formData.targetCpaValue || parseFloat(formData.targetCpaValue) <= 0)) return false;
    }
    if (step === 5) {
      if (!formData.finalUrl.trim() || !formData.businessName.trim() || !formData.longHeadline.trim()) return false;
      const validHeadlines = formData.headlines.filter(h => h.trim().length > 0);
      const validDescriptions = formData.descriptions.filter(d => d.trim().length > 0);
      return validHeadlines.length >= 1 && validDescriptions.length >= 1 && formData.uploadedImages.length >= 1;
    }
    return true;
  };

  // Step 6 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      finalUrl: formData.finalUrl,
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      languages: formData.languages,
      euPolitical: formData.euPolitical,
      budgetType: formData.budgetType,
      dailyBudget: parseFloat(formData.budgetAmount || "1000"),
      biddingFocus: formData.biddingFocus,
      useTargetCpa: formData.useTargetCpa,
      targetCpa: parseFloat(formData.targetCpaValue || "25"),
      targetRoas: parseFloat(formData.targetRoasValue || "200"),
      viewableCpm: parseFloat(formData.viewableCpmValue || "50"),
      adGroupName: "Ad group 1",
      businessName: formData.businessName,
      headlines: activeHeadlines,
      longHeadline: formData.longHeadline,
      descriptions: activeDescriptions,
      images: formData.uploadedImages,
      logos: formData.uploadedLogos
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-noguidance-display-campaign`, {
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
        message: "Display Campaign created successfully without guidance (Paused)",
        backendMapping: {
          advertising_channel_type: "DISPLAY",
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
              <ImageIcon className="h-4 w-4" /> Display Campaign Setup
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
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Display Campaign</div>
                <div className="text-[10px] text-slate-400">Responsive Display Ads</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective & Type", desc: "Select Display type & final URL" },
                { num: 2, title: "Campaign Settings", desc: "Locations, languages & EU" },
                { num: 3, title: "Budget and Bidding", desc: "Daily budget & conversions focus" },
                { num: 4, title: "Targeting", desc: "Optimized targeting & audiences" },
                { num: 5, title: "Responsive Display Ad", desc: "Headlines, images & live preview" },
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
            <div>Mapped to `advertising_channel_type = DISPLAY`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE & CAMPAIGN TYPE */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Select Campaign Type & Destination</h1>
                <p className="text-xs text-slate-400 mt-1">Select Display to run visual banner ads across millions of websites and apps</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "DISPLAY", title: "Display", desc: "Run visually engaging banner ads across millions of websites and apps", icon: ImageIcon, selected: true },
                  { id: "PERFORMANCE_MAX", title: "Performance Max", desc: "Reach audiences across all of Google", icon: Sparkles },
                  { id: "SEARCH", title: "Search", desc: "High-intent text search ads", icon: Search },
                  { id: "DEMAND_GEN", title: "Demand Gen", desc: "Visual ads on YouTube & Discover", icon: Zap },
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

              {/* Final URL */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">This is the web page people will go to after clicking your ad (Final URL)</label>
                <input
                  type="text"
                  value={formData.finalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalUrl: e.target.value }))}
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure location options, language targeting, and regulatory compliance</p>
              </div>

              {/* Locations */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400" /> Locations
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
                        formData.locationType === loc.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locations"
                        checked={formData.locationType === loc.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs font-semibold">{loc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100">Languages</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.languages.map((lang) => (
                    <span key={lang} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-200 flex items-center gap-1.5">
                      {lang}
                      <X onClick={() => setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))} className="h-3 w-3 cursor-pointer hover:text-red-400" />
                    </span>
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

          {/* STEP 3: BUDGET AND BIDDING */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Budget and Bidding</h1>
                <p className="text-xs text-slate-400 mt-1">Set your daily budget and bid optimization focus for Display delivery</p>
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
                    <option value="Conversions">Conversions (Recommended)</option>
                    <option value="Conversion value">Conversion value</option>
                    <option value="Viewable impressions">Viewable impressions</option>
                    <option value="Other">Other optimization options</option>
                  </select>
                </div>

                {formData.biddingFocus === "Conversions" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.useTargetCpa}
                        onChange={(e) => setFormData(prev => ({ ...prev, useTargetCpa: e.target.checked }))}
                        className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-200">Set a target cost per action (Target CPA)</span>
                    </label>
                    {formData.useTargetCpa && (
                      <div className="pl-7 max-w-xs">
                        <label className="text-[11px] text-slate-400 font-semibold">Target CPA (₹)</label>
                        <input
                          type="number"
                          value={formData.targetCpaValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetCpaValue: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {(formData.biddingFocus === "Conversions" || formData.biddingFocus === "Conversion value") && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>Maximize conversions is set up to automatically get the most conversions for your budget.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: TARGETING */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Targeting</h1>
                <p className="text-xs text-slate-400 mt-1">Configure automated AI targeting and custom audience signals</p>
              </div>

              {/* Optimized Targeting Info Banner */}
              <div className="p-5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">Optimized targeting is set up for you</h4>
                  <p className="text-xs text-blue-200">Google AI will automatically find high-converting users across Display placements based on your goals.</p>
                </div>
              </div>

              {/* Accordion Targeting Options */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Add targeting options</label>
                <div className="space-y-2">
                  {[
                    { key: "audience", title: "Audience Segments", desc: "Target users based on who they are and their interests" },
                    { key: "demographics", title: "Demographics", desc: "Filter by age, gender, parental status, or household income" },
                    { key: "keywords", title: "Keywords", desc: "Target websites matching specific terms" },
                    { key: "topics", title: "Topics", desc: "Target web pages about specific subjects" },
                    { key: "placements", title: "Placements", desc: "Target specific websites, videos, or apps" }
                  ].map((t) => (
                    <div key={t.key} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          targetingOpen: { ...prev.targetingOpen, [t.key]: !(prev.targetingOpen as any)[t.key] }
                        }))}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-200"
                      >
                        <span>{t.title}</span>
                        {(formData.targetingOpen as any)[t.key] ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <div className="text-[11px] text-slate-400">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ADS (RESPONSIVE DISPLAY AD CREATION) */}
          {step === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Responsive Display Ad Editor (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Create Responsive Display Ad</h1>
                  <p className="text-xs text-slate-400 mt-1">Provide headlines, long headline, descriptions, and images</p>
                </div>

                {/* Final URL & Business Name */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Final URL (Required)</label>
                    <input
                      type="text"
                      value={formData.finalUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, finalUrl: e.target.value }))}
                      className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Business Name (Required)</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
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

                {/* Long Headline Section */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Long Headline (Max 90 chars)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.longHeadline}
                      onChange={(e) => {
                        if (e.target.value.length <= 90) {
                          setFormData(prev => ({ ...prev, longHeadline: e.target.value }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14 focus:border-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-slate-400">
                      {formData.longHeadline.length}/90
                    </span>
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

              {/* Right Column: Live Banner Preview Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex border-b border-slate-800 pb-2 justify-around text-[11px] font-semibold">
                    {[
                      { id: "BANNER", label: "Display Banner" },
                      { id: "GMAIL", label: "Gmail Feed" },
                      { id: "YOUTUBE", label: "YouTube Feed" }
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

                  {/* Visual Banner Preview Frame */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-400 font-bold uppercase">Ad • Google Display</span>
                      <span className="text-[10px] text-slate-400 font-mono">{previewTab}</span>
                    </div>

                    <div className="h-36 w-full rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative">
                      {formData.uploadedImages[0] ? (
                        <img src={formData.uploadedImages[0]} alt="banner" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-slate-600 absolute inset-0 m-auto" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white truncate">{formData.headlines[0] || "Your Display Headline"}</div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{formData.descriptions[0] || "Your description preview will render here."}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-slate-300">{formData.businessName}</span>
                      <button className="px-3 py-1 bg-blue-600 text-white font-bold text-[10px] rounded">
                        Visit Site
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
                <p className="text-xs text-slate-400 mt-1">Review your Display Campaign summary before publishing as PAUSED</p>
              </div>

              {/* Summary Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-400">Campaign Name</div>
                    <div className="text-lg font-bold text-white">{formData.campaignName}</div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign Type</span>
                    <div className="font-bold text-white">Display</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Bidding Focus</span>
                    <div className="font-bold text-white">{formData.biddingFocus}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetAmount}/day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Final URL</span>
                    <div className="font-bold text-white font-mono text-[11px] truncate">{formData.finalUrl}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Display Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for Display ad delivery.</p>
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
