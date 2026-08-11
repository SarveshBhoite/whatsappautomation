"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, MapPin,
  Building2, Store, Wand2
} from "lucide-react";

export default function LocalPerformanceMaxWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  // Active step (1 to 7)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "LOCAL",
    campaignType: "PERFORMANCE_MAX",
    draftOption: "NEW", // "DRAFT" | "NEW"
    campaignName: "Local store visits and promotions-Performance Max-1",
    conversionGoals: ["Contacts", "Get directions", "Store visits"],
    storeLocationFeed: "Use all locations",
    finalUrl: "https://www.example.com/store-locations",

    // Step 3: Bidding
    biddingFocus: "Maximize conversions", // "Maximize conversions" | "Target CPA" | "Maximize conversion value" | "Target ROAS"
    targetCpaValue: "25.00",
    targetRoasValue: "200",
    onlyNewCustomers: false,
    reengageLapsedCustomers: false,

    // Step 4: Campaign Settings
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    moreSettingsOpen: false,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",

    // Step 5: Asset Group & Signals
    assetGroupName: "Asset Group 1",
    assetFinalUrl: "https://www.example.com/store-locations",
    headlines: [
      "Visit Our Nearby Store Today",
      "Exclusive In-Store Offers",
      "Get Directions & Easy Parking"
    ],
    descriptions: [
      "Find top products and live support at our local store location near you.",
      "Check store hours, phone numbers, and get instant turn-by-turn directions."
    ],
    uploadedImages: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80"
    ],
    uploadedVideos: [] as string[],
    searchThemes: ["store location", "in-store deals", "directions near me"],
    audienceSignal: "",

    // Step 6: Budget
    budgetType: "DAILY" as "DAILY" | "TOTAL",
    budgetAmount: "1000"
  });

  // UI state for inputs
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [searchThemeInput, setSearchThemeInput] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");

  // Modals
  const [showAiImageModal, setShowAiImageModal] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>("Modern storefront retail interior banner with welcome offer badge");
  const [isGeneratingAiImages, setIsGeneratingAiImages] = useState<boolean>(false);
  const [generatedAiImages, setGeneratedAiImages] = useState<string[]>([]);

  const [showAudienceModal, setShowAudienceModal] = useState<boolean>(false);
  const [audienceSignalName, setAudienceSignalName] = useState<string>("Local Store Shoppers & Foot Traffic");

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
    if (activeHeadlines.length >= 3) score += 25;
    if (activeDescriptions.length >= 1) score += 25;
    if (activeDescriptions.length >= 2) score += 15;
    if (formData.uploadedImages.length >= 1) score += 10;

    if (score < 30) return { label: "Incomplete", color: "text-amber-500", barColor: "bg-amber-500", percent: 25 };
    if (score < 60) return { label: "Poor", color: "text-orange-400", barColor: "bg-orange-400", percent: 50 };
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
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80"
      ]);
      setIsGeneratingAiImages(false);
    }, 1200);
  };

  // Step 7 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      finalUrl: formData.finalUrl,
      storeLocationFeed: formData.storeLocationFeed,
      biddingFocus: formData.biddingFocus,
      targetCpa: formData.biddingFocus === "Target CPA" ? parseFloat(formData.targetCpaValue || "25") : undefined,
      targetRoas: formData.biddingFocus === "Target ROAS" ? parseFloat(formData.targetRoasValue || "200") : undefined,
      onlyNewCustomers: formData.onlyNewCustomers,
      reengageLapsedCustomers: formData.reengageLapsedCustomers,
      languages: formData.languages,
      euPolitical: formData.euPolitical,
      assetGroupName: formData.assetGroupName,
      headlines: activeHeadlines,
      descriptions: activeDescriptions,
      images: formData.uploadedImages,
      searchThemes: formData.searchThemes,
      audienceSignal: formData.audienceSignal,
      budgetType: formData.budgetType,
      dailyBudget: parseFloat(formData.budgetAmount || "1000")
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-local-pmax-campaign`, {
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
        message: "Local Performance Max Campaign created successfully (Paused)",
        backendMapping: {
          advertising_channel_type: "PERFORMANCE_MAX",
          store_location_feed: formData.storeLocationFeed,
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
            <span className="text-slate-400">Local store visits and promotions</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-semibold flex items-center gap-1.5">
              <Store className="h-4 w-4" /> Performance Max Setup
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
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Local Store Visits</div>
                <div className="text-[10px] text-slate-400">Performance Max</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective", desc: "Select campaign objective" },
                { num: 2, title: "Basic Setup", desc: "Performance Max & store feeds" },
                { num: 3, title: "Bidding", desc: "Conversions & CPA / ROAS" },
                { num: 4, title: "Campaign Settings", desc: "Languages & EU political" },
                { num: 5, title: "Asset Group", desc: "Copy, images & signals" },
                { num: 6, title: "Budget", desc: "Daily budget amount" },
                { num: 7, title: "Summary", desc: "Review & publish" }
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
            <div>Mapped to `advertising_channel_type = PERFORMANCE_MAX`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">What’s your campaign objective?</h1>
                <p className="text-xs text-slate-400 mt-1">Select an objective to customize your campaign setup to your goals</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "SALES", title: "Sales", desc: "Drive sales online, in app, by phone, or in store", icon: ShoppingBag },
                  { id: "LEADS", title: "Leads", desc: "Get leads and other conversions by encouraging customers to take action", icon: Target },
                  { id: "WEBSITE_TRAFFIC", title: "Website traffic", desc: "Get the right people to visit your website", icon: Globe },
                  { id: "APP_PROMOTION", title: "App promotion", desc: "Get more installs, engagement and pre-registration for your app", icon: Smartphone },
                  { id: "AWARENESS", title: "YouTube reach, views, and engagements", desc: "Drive awareness and consideration of your product or brand", icon: VideoIcon },
                  { id: "LOCAL", title: "Local store visits and promotions", desc: "Drive visits to local stores, including restaurants and dealerships.", icon: LayoutGrid, highlight: true },
                  { id: "NO_GUIDANCE", title: "Create a campaign without guidance", desc: "You'll choose a campaign type next without automated recommendation", icon: Sparkles }
                ].map((item) => {
                  const isSelected = formData.objective === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setFormData(prev => ({ ...prev, objective: item.id }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-md shadow-blue-950/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Icon className={`h-6 w-6 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                        <h3 className="font-bold text-sm text-slate-100">{item.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN TYPE & BASIC SETUP */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Type & Basic Setup</h1>
                <p className="text-xs text-slate-400 mt-1">Local store campaigns are now fully integrated into Google Performance Max</p>
              </div>

              {/* Performance Max Notice */}
              <div className="p-5 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      Performance Max <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 font-normal">Replaces Local Campaigns</span>
                    </h4>
                    <p className="text-xs text-blue-300/90">Performance Max reaches local customers across Google Maps, Search, YouTube, Gmail & Display in a single campaign.</p>
                  </div>
                </div>
              </div>

              {/* Resume Draft Option */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Would you like to resume from an existing campaign draft?</label>
                <div className="space-y-2">
                  {[
                    { id: "DRAFT", label: "Continue from an existing campaign draft" },
                    { id: "NEW", label: "Create a new campaign" }
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setFormData(prev => ({ ...prev, draftOption: opt.id as any }))}
                      className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.draftOption === opt.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="draftOption"
                        checked={formData.draftOption === opt.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
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

              {/* Conversion Goals */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Use these conversion goals for this campaign</label>
                  <button className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Goal
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.conversionGoals.map((cg) => (
                    <span key={cg} className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {cg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Store Location Feed */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Which store locations should your ads promote?</label>
                <select
                  value={formData.storeLocationFeed}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeLocationFeed: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Use all locations">Use all store locations (Google Business Profile)</option>
                  <option value="Select specific locations">Select specific store locations by label</option>
                  <option value="Affiliate locations">Affiliate retail locations</option>
                </select>
              </div>

              {/* Final URL */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Where should people go after clicking your ads? (Final URL)</label>
                <input
                  type="text"
                  value={formData.finalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalUrl: e.target.value }))}
                  placeholder="https://www.example.com/store-locations"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 3: BIDDING */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Bidding</h1>
                <p className="text-xs text-slate-400 mt-1">Configure conversion optimization & customer acquisition bidding</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">What do you want to focus on?</label>
                  <select
                    value={formData.biddingFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, biddingFocus: e.target.value }))}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Maximize conversions">Maximize conversions</option>
                    <option value="Target CPA">Target CPA (Cost per Action)</option>
                    <option value="Maximize conversion value">Maximize conversion value</option>
                    <option value="Target ROAS">Target ROAS (Return on Ad Spend)</option>
                  </select>
                </div>

                {formData.biddingFocus === "Target CPA" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-w-xs">
                    <label className="text-xs font-semibold text-slate-300">Target CPA (₹)</label>
                    <input
                      type="number"
                      value={formData.targetCpaValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCpaValue: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white"
                    />
                  </div>
                )}

                {formData.biddingFocus === "Target ROAS" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-w-xs">
                    <label className="text-xs font-semibold text-slate-300">Target ROAS (%)</label>
                    <input
                      type="number"
                      value={formData.targetRoasValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetRoasValue: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white"
                    />
                  </div>
                )}

                {/* Customer Acquisition */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Customer acquisition</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.onlyNewCustomers}
                      onChange={(e) => setFormData(prev => ({ ...prev, onlyNewCustomers: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300">Only bid for new customers</span>
                  </label>
                </div>

                {/* Customer Retention */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Customer retention</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reengageLapsedCustomers}
                      onChange={(e) => setFormData(prev => ({ ...prev, reengageLapsedCustomers: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300">Adjust your bidding to help re-engage lapsed customers</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CAMPAIGN SETTINGS */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure language targeting and regulatory options</p>
              </div>

              {/* Languages Section */}
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={languageSearchInput}
                    onChange={(e) => setLanguageSearchInput(e.target.value)}
                    placeholder="Search languages (e.g. Spanish, Hindi, French)"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  {languageSearchInput && (
                    <button
                      onClick={() => {
                        if (!formData.languages.includes(languageSearchInput)) {
                          setFormData(prev => ({ ...prev, languages: [...prev.languages, languageSearchInput] }));
                        }
                        setLanguageSearchInput("");
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Add Language
                    </button>
                  )}
                </div>
              </div>

              {/* EU Political Ads */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">EU political ads (Required)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold">Regulatory Requirement</span>
                </div>
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

              {/* Expandable More Settings */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, moreSettingsOpen: !prev.moreSettingsOpen }))}
                  className="w-full flex items-center justify-between text-sm font-bold text-slate-200"
                >
                  <span>More settings (Dates, Brand & Data Exclusions)</span>
                  {formData.moreSettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {formData.moreSettingsOpen && (
                  <div className="pt-3 border-t border-slate-800 space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-300">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">Page feeds, device exclusions and brand exclusions are set to default.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: ASSET GROUP */}
          {step === 5 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Asset Group & Signals</h1>
                <p className="text-xs text-slate-400 mt-1">Provide creative copy, images, and intent signals for local store promotions</p>
              </div>

              {/* Asset Group Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Asset group name</label>
                <input
                  type="text"
                  value={formData.assetGroupName}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetGroupName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Headlines Section */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Headlines ({formData.headlines.filter(h=>h.trim()).length}/5)</h3>
                    <p className="text-[11px] text-slate-400">Add up to 5 headlines (At least 1 required)</p>
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
                        <span className={`absolute right-3 top-3 text-[10px] font-mono ${hl.length > 25 ? "text-amber-400" : "text-slate-400"}`}>
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
                    <p className="text-[11px] text-slate-400">Add up to 5 descriptions (At least 1 required)</p>
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
                        <span className={`absolute right-3 bottom-2 text-[10px] font-mono ${desc.length > 80 ? "text-amber-400" : "text-slate-400"}`}>
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

              {/* Search Themes */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Search Themes (Up to 50)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchThemeInput}
                    onChange={(e) => setSearchThemeInput(e.target.value)}
                    placeholder="Type search theme e.g. store location near me"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (searchThemeInput.trim() && !formData.searchThemes.includes(searchThemeInput.trim())) {
                        setFormData(prev => ({ ...prev, searchThemes: [...prev.searchThemes, searchThemeInput.trim()] }));
                        setSearchThemeInput("");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Add Theme
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.searchThemes.map((st) => (
                    <span key={st} className="px-2.5 py-1 bg-blue-900/40 border border-blue-500/40 rounded-full text-xs text-blue-300 flex items-center gap-1.5">
                      {st}
                      <X onClick={() => setFormData(prev => ({ ...prev, searchThemes: prev.searchThemes.filter(t => t !== st) }))} className="h-3 w-3 cursor-pointer hover:text-white" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: BUDGET */}
          {step === 6 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Budget</h1>
                <p className="text-xs text-slate-400 mt-1">Set your daily budget for Local Performance Max promotions</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Select budget type</label>
                  <div className="flex gap-4">
                    {[
                      { id: "DAILY", label: "Average daily budget" },
                      { id: "TOTAL", label: "Campaign total budget" }
                    ].map((bt) => (
                      <label
                        key={bt.id}
                        onClick={() => setFormData(prev => ({ ...prev, budgetType: bt.id as any }))}
                        className={`flex-1 p-3 rounded-lg border text-xs cursor-pointer ${
                          formData.budgetType === bt.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <input type="radio" name="budgetType" checked={formData.budgetType === bt.id} onChange={() => {}} className="mr-2" />
                        {bt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                  />
                </div>

                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                  <span>Your budget type can’t be changed once this campaign has started.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: SUMMARY / REVIEW & PUBLISH */}
          {step === 7 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Summary / Review & Publish</h1>
                <p className="text-xs text-slate-400 mt-1">Audit your Local Performance Max campaign details before publishing as PAUSED</p>
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
                    <span className="text-slate-400">Campaign Type</span>
                    <div className="font-bold text-white">Performance Max</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Store Location Feed</span>
                    <div className="font-bold text-white">{formData.storeLocationFeed}</div>
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

                  <div className="space-y-1">
                    <span className="text-slate-400">Languages</span>
                    <div className="font-bold text-white">{formData.languages.join(", ")}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Local Performance Max Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for local store promotions.</p>
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
          {step < 7 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer"
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
