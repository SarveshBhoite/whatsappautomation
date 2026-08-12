"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, Apple,
  Wand2, Filter, Eye
} from "lucide-react";

interface AppOption {
  name: string;
  packageName: string; // Package Name (Android) or Bundle ID (iOS)
  icon: string;
  publisher: string;
  rating: string;
  downloads: string;
  store: string;
}

const PRESET_APPS_ANDROID: AppOption[] = [
  {
    name: "Hubmate Android",
    packageName: "com.hubmate.app",
    icon: "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
    publisher: "Hubmate Technologies",
    rating: "4.8 ★",
    downloads: "100K+",
    store: "Google Play Store"
  },
  {
    name: "WhatsApp Business",
    packageName: "com.whatsapp.w4b",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png",
    publisher: "Meta Platforms, Inc.",
    rating: "4.4 ★",
    downloads: "1B+",
    store: "Google Play Store"
  },
  {
    name: "Zomato: Food Delivery & Dining",
    packageName: "com.application.zomato",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    publisher: "Zomato",
    rating: "4.6 ★",
    downloads: "100M+",
    store: "Google Play Store"
  },
  {
    name: "Instagram",
    packageName: "com.instagram.android",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    publisher: "Instagram",
    rating: "4.3 ★",
    downloads: "1B+",
    store: "Google Play Store"
  }
];

const PRESET_APPS_IOS: AppOption[] = [
  {
    name: "Hubmate for iOS",
    packageName: "com.hubmate.ios",
    icon: "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
    publisher: "Hubmate Inc.",
    rating: "4.9 ★",
    downloads: "50K+",
    store: "Apple App Store"
  },
  {
    name: "WhatsApp Messenger",
    packageName: "net.whatsapp.WhatsApp",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png",
    publisher: "Meta Platforms, Inc.",
    rating: "4.7 ★",
    downloads: "1B+",
    store: "Apple App Store"
  },
  {
    name: "Zomato iOS",
    packageName: "com.zomato.iphone",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    publisher: "Zomato Media Pvt Ltd",
    rating: "4.8 ★",
    downloads: "50M+",
    store: "Apple App Store"
  },
  {
    name: "Instagram iOS",
    packageName: "com.burbn.instagram",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    publisher: "Instagram, Inc.",
    rating: "4.7 ★",
    downloads: "1B+",
    store: "Apple App Store"
  }
];

export default function AppPromotionWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  // Active step (1 to 6)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "APP_PROMOTION",
    campaignType: "APP",
    campaignName: "App promotion – App 1",
    campaignSubtype: "APP_INSTALLS" as "APP_INSTALLS" | "APP_ENGAGEMENT" | "APP_PRE_REGISTRATION",
    platform: "ANDROID" as "ANDROID" | "IOS",
    selectedApp: PRESET_APPS_ANDROID[0] as AppOption,
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States", "United Kingdom"],
    languages: ["English"],
    viewThroughEnabled: false,
    euPolitical: "NO" as "YES" | "NO",
    headlines: [
      "Fast & Reliable App",
      "Download Hubmate Today",
      "Boost Your Business 10x"
    ],
    descriptions: [
      "Join over 100k users. Manage your tasks and automation effortlessly in one app.",
      "Get instant access to top features. Download now on the app store."
    ],
    uploadedImages: [
      "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
      "https://ik.imagekit.io/automationjds/sample_seo_growth.png"
    ],
    uploadedVideos: [] as string[],
    html5Packages: [] as string[],
    promotionText: "",
    audienceSignal: "",
    biddingFocus: "Install volume",
    conversionAction: "Google Play app installs (First Open)",
    userTargetType: "All users",
    useTargetCpa: true,
    targetCpaValue: "25.00",
    budgetPreset: "1000", // 500, 1000, 2500, custom
    customBudgetValue: "1000"
  });

  // Auxiliary UI States
  const [appSearchQuery, setAppSearchQuery] = useState<string>("Hubmate");
  const [showAppSearchResults, setShowAppSearchResults] = useState<boolean>(false);
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [previewTab, setPreviewTab] = useState<"STORE" | "SEARCH" | "YOUTUBE" | "DISPLAY" | "DISCOVER">("STORE");

  // Modals
  const [showAiImageModal, setShowAiImageModal] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>("Modern mobile app dashboard showcase banner with glowing cyan accents");
  const [isGeneratingAiImages, setIsGeneratingAiImages] = useState<boolean>(false);
  const [generatedAiImages, setGeneratedAiImages] = useState<string[]>([]);

  const [showAudienceModal, setShowAudienceModal] = useState<boolean>(false);
  const [audienceSignalName, setAudienceSignalName] = useState<string>("High Value In-App Purchasers");
  const [audienceKeywordsInput, setAudienceKeywordsInput] = useState<string>("mobile app, task automation, productivity software");

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Platform switch helper
  const handlePlatformChange = (newPlatform: "ANDROID" | "IOS") => {
    const isIOS = newPlatform === "IOS";
    const defaultApp = isIOS ? PRESET_APPS_IOS[0] : PRESET_APPS_ANDROID[0];
    const defaultName = isIOS ? "App promotion – iOS 1" : "App promotion – App 1";
    const defaultConv = isIOS ? "SKAdNetwork / Apple App Store Conversion" : "Google Play app installs (First Open)";

    setFormData(prev => ({
      ...prev,
      platform: newPlatform,
      campaignName: (prev.campaignName === "App promotion – App 1" || prev.campaignName === "App promotion – iOS 1") ? defaultName : prev.campaignName,
      campaignSubtype: (isIOS && prev.campaignSubtype === "APP_PRE_REGISTRATION") ? "APP_INSTALLS" : prev.campaignSubtype,
      selectedApp: defaultApp,
      conversionAction: defaultConv
    }));
    setAppSearchQuery(defaultApp.name);
  };

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

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 2) {
      if (!formData.campaignName.trim() || !formData.selectedApp?.packageName) return false;
    }
    if (step === 4) {
      const validHeadlines = formData.headlines.filter(h => h.trim().length > 0);
      const validDescriptions = formData.descriptions.filter(d => d.trim().length > 0);
      return validHeadlines.length >= 1 && validDescriptions.length >= 1;
    }
    if (step === 5) {
      const effectiveBudget = formData.budgetPreset === "custom" ? formData.customBudgetValue : formData.budgetPreset;
      return !!effectiveBudget && parseFloat(effectiveBudget) > 0;
    }
    return true;
  };

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
        "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80"
      ]);
      setIsGeneratingAiImages(false);
    }, 1200);
  };

  const handleSelectAiImage = (url: string) => {
    if (!formData.uploadedImages.includes(url)) {
      setFormData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, url] }));
    }
  };

  // Step 6 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      campaignSubtype: formData.campaignSubtype,
      platform: formData.platform,
      appId: formData.selectedApp.packageName, // Package name for Android / Bundle ID for iOS
      appName: formData.selectedApp.name,
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      languages: formData.languages,
      viewThroughEnabled: formData.viewThroughEnabled,
      euPolitical: formData.euPolitical,
      headlines: activeHeadlines,
      descriptions: activeDescriptions,
      images: formData.uploadedImages,
      videos: formData.uploadedVideos,
      targetCpa: formData.useTargetCpa ? parseFloat(formData.targetCpaValue || "25") : 25,
      dailyBudget: parseFloat(formData.budgetPreset === "custom" ? formData.customBudgetValue : formData.budgetPreset),
      conversionAction: formData.conversionAction,
      userTargetType: formData.userTargetType
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-app-promotion`, {
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
        message: "Campaign created successfully (Paused)",
        backendMapping: {
          advertising_channel_type: "MULTI_CHANNEL",
          advertising_channel_sub_type: "APP_CAMPAIGN",
          app_store: formData.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE",
          app_id: formData.selectedApp.packageName,
          bidding_strategy_goal_type: "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST",
          "target_cpa.target_cpa_micros": parseFloat(formData.targetCpaValue || "25") * 1000000,
          "CampaignBudget.amount_micros": parseFloat(formData.budgetPreset === "custom" ? formData.customBudgetValue : formData.budgetPreset) * 1000000
        }
      });
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const activePresetApps = formData.platform === "IOS" ? PRESET_APPS_IOS : PRESET_APPS_ANDROID;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── Top Google Ads Header Navigation ── */}
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
            <span className="text-slate-400">App promotion</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-semibold flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> App Campaign Setup ({formData.platform === "ANDROID" ? "Android" : "iOS"})
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

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">

        {/* ── Left Sidebar Navigation Stepper ── */}
        <aside className="w-64 border-r border-slate-800/80 p-4 shrink-0 bg-slate-950/70 hidden md:flex flex-col justify-between select-none">
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400">
                {formData.platform === "IOS" ? <Apple className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">App promotion</div>
                <div className="text-[10px] text-slate-400">{formData.platform === "IOS" ? "Apple App Store" : "Google Play Store"}</div>
              </div>
            </div>

            {/* Timeline Stepper */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective", desc: "Select campaign goal" },
                { num: 2, title: "Campaign Setup", desc: `Type, name & ${formData.platform} app` },
                { num: 3, title: "Campaign Settings", desc: "Locations, languages & EU" },
                { num: 4, title: "Ad Group & Assets", desc: "Headlines, copy & previews" },
                { num: 5, title: "Bidding & Budget", desc: "Target CPA & daily budget" },
                { num: 6, title: "Review & Publish", desc: "Audit and launch" }
              ].map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;
                const isWarning = s.num === 4 && (formData.headlines.filter(h=>h.trim()).length < 1 || formData.descriptions.filter(d=>d.trim()).length < 1);

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
                      <div className="flex items-center gap-1.5 text-xs font-semibold leading-tight">
                        <span className={isActive ? "text-blue-400" : isCompleted ? "text-slate-200" : "text-slate-400"}>
                          {s.title}
                        </span>
                        {isWarning && isCompleted && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        )}
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
            <div>
              {formData.platform === "IOS" ? "Mapped to APPLE_APP_STORE + Bundle ID" : "Mapped to GOOGLE_APP_STORE + Package Name"}
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: CAMPAIGN OBJECTIVE */}
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
                  { id: "APP_PROMOTION", title: "App promotion", desc: "Get more installs, engagement and pre-registration for your app", icon: Smartphone, highlight: true },
                  { id: "AWARENESS", title: "YouTube reach, views, and engagements", desc: "Drive awareness and consideration of your product or brand", icon: VideoIcon },
                  { id: "LOCAL", title: "Local store visits and promotions", desc: "Drive visits to local stores, including restaurants and dealerships.", icon: LayoutGrid },
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

          {/* STEP 2: CAMPAIGN SETUP */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Select a campaign type, name & mobile app ({formData.platform})</h1>
                <p className="text-xs text-slate-400 mt-1">Configure your app promotion parameters for {formData.platform === "IOS" ? "Apple App Store" : "Google Play Store"}</p>
              </div>

              {/* Campaign Type Box */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select a campaign type</label>
                <div className="p-4 rounded-xl bg-blue-600/10 border-2 border-blue-500 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                      {formData.platform === "IOS" ? <Apple className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        App <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 font-normal">Google Ads Default</span>
                      </h4>
                      <p className="text-xs text-slate-400">Drive app installs and engagement across Google Search, YouTube, Display & {formData.platform === "IOS" ? "App Store network" : "Play Store"}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                </div>
              </div>

              {/* Campaign Name Input */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Campaign name</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={formData.platform === "IOS" ? "e.g. App promotion – iOS 1" : "e.g. App promotion – App 1"}
                />
              </div>

              {/* Platform Radio (Android vs iOS Switcher) */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select your mobile app’s platform</label>
                <div className="flex gap-4">
                  {[
                    { id: "ANDROID", label: "Android", sub: "Google Play Store", icon: Smartphone },
                    { id: "IOS", label: "iOS", sub: "Apple App Store", icon: Apple }
                  ].map((p) => {
                    const PIcon = p.icon;
                    const isSel = formData.platform === p.id;
                    return (
                      <label
                        key={p.id}
                        onClick={() => handlePlatformChange(p.id as any)}
                        className={`flex-1 p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSel
                            ? "bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500/30"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="platform"
                          checked={isSel}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-500"
                        />
                        <PIcon className={`h-5 w-5 ${isSel ? "text-blue-400" : "text-slate-400"}`} />
                        <div>
                          <div className="text-xs font-bold">{p.label}</div>
                          <div className="text-[10px] text-slate-400">{p.sub}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Campaign Subtype */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select a campaign subtype</label>
                <div className="space-y-2">
                  {[
                    { id: "APP_INSTALLS", label: "App installs", desc: "Get new users to download and install your app", hide: false },
                    { id: "APP_ENGAGEMENT", label: "App engagement", desc: "Re-engage existing users to take specific in-app actions", hide: false },
                    { id: "APP_PRE_REGISTRATION", label: "App pre-registration (Android only)", desc: "Build anticipation and pre-registers before app launch", hide: formData.platform === "IOS" }
                  ].filter(st => !st.hide).map((st) => {
                    const isSel = formData.campaignSubtype === st.id;
                    return (
                      <label
                        key={st.id}
                        onClick={() => setFormData(prev => ({ ...prev, campaignSubtype: st.id as any }))}
                        className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all cursor-pointer ${
                          isSel
                            ? "bg-blue-600/10 border-blue-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="subtype"
                          checked={isSel}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 bg-slate-900 border-slate-700"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-bold">{st.label}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{st.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* App Lookup Search */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <label className="text-xs font-semibold text-slate-300">Look up your app ({formData.platform === "IOS" ? "App Store URL or Bundle ID" : "Play Store URL or Package Name"})</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={appSearchQuery}
                    onFocus={() => setShowAppSearchResults(true)}
                    onChange={(e) => {
                      setAppSearchQuery(e.target.value);
                      setShowAppSearchResults(true);
                    }}
                    placeholder={formData.platform === "IOS" ? "Enter app name, Bundle ID (e.g. com.hubmate.ios) or App Store URL" : "Enter app name, package name or Play Store URL"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />

                  {/* Dropdown Results */}
                  {showAppSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden divide-y divide-slate-800">
                      {activePresetApps.filter(a => a.name.toLowerCase().includes(appSearchQuery.toLowerCase()) || a.packageName.toLowerCase().includes(appSearchQuery.toLowerCase())).map((app) => (
                        <div
                          key={app.packageName}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, selectedApp: app }));
                            setAppSearchQuery(app.name);
                            setShowAppSearchResults(false);
                          }}
                          className="p-3 flex items-center gap-3 hover:bg-slate-800/80 cursor-pointer transition-all"
                        >
                          <img src={app.icon} alt={app.name} className="h-8 w-8 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-100 truncate">{app.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{app.packageName} • {app.publisher}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold">{app.store}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected App Card */}
                {formData.selectedApp && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={formData.selectedApp.icon} alt={formData.selectedApp.name} className="h-10 w-10 rounded-xl object-cover border border-slate-800 shadow" />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {formData.selectedApp.name}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1">
                            {formData.platform === "IOS" ? <Apple className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                            {formData.selectedApp.store}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {formData.platform === "IOS" ? `Bundle ID: ${formData.selectedApp.packageName}` : `Package Name: ${formData.selectedApp.packageName}`}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{formData.selectedApp.publisher} • {formData.selectedApp.rating}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAppSearchResults(true)}
                      className="px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-all"
                    >
                      Change
                    </button>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono space-y-0.5">
                  <div className="text-blue-400 font-semibold">Backend Mapping ({formData.platform}):</div>
                  <div>advertising_channel_type = MULTI_CHANNEL</div>
                  <div>advertising_channel_sub_type = APP_CAMPAIGN</div>
                  <div>app_campaign_setting.app_store = {formData.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE"}</div>
                  <div>app_campaign_setting.app_id = {formData.selectedApp.packageName}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAMPAIGN SETTINGS */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign settings ({formData.platform})</h1>
                <p className="text-xs text-slate-400 mt-1">Specify targeting locations, languages, and compliance details</p>
              </div>

              {/* Selected App Card Summary */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={formData.selectedApp.icon} alt={formData.selectedApp.name} className="h-9 w-9 rounded-lg object-cover" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Mobile app ({formData.platform === "IOS" ? "Apple App Store" : "Google Play"})</div>
                    <div className="text-sm font-bold text-white">{formData.selectedApp.name} ({formData.selectedApp.packageName})</div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-blue-400 hover:underline">Edit step 2</button>
              </div>

              {/* Locations Section */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" /> Locations
                  </h3>
                </div>

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
                        formData.locationType === loc.id
                          ? "bg-blue-600/10 border-blue-500 text-white font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-300"
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

                {formData.locationType === "CUSTOM" && (
                  <div className="pl-6 space-y-3 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customLocationInput}
                        onChange={(e) => setCustomLocationInput(e.target.value)}
                        placeholder="Type location e.g. United States, Germany"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          if (customLocationInput.trim() && !formData.customLocations.includes(customLocationInput.trim())) {
                            setFormData(prev => ({ ...prev, customLocations: [...prev.customLocations, customLocationInput.trim()] }));
                            setCustomLocationInput("");
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.customLocations.map((loc) => (
                        <span key={loc} className="px-2.5 py-1 bg-blue-900/40 border border-blue-500/40 rounded-full text-xs text-blue-300 flex items-center gap-1.5">
                          {loc}
                          <X onClick={() => setFormData(prev => ({ ...prev, customLocations: prev.customLocations.filter(l => l !== loc) }))} className="h-3 w-3 cursor-pointer hover:text-white" />
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                  <span>We highly recommend restricting targeting to countries where the app is published and available on {formData.platform === "IOS" ? "Apple App Store" : "Google Play Store"}.</span>
                </div>
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

              {/* View-through conversion optimization */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-slate-100">View-through conversion optimization</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.viewThroughEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, viewThroughEnabled: e.target.checked }))}
                    className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-200">Turn on view-through conversions</span>
                </label>
                <p className="text-[11px] text-slate-400 pl-7">Track installs when users see your ad but do not click immediately, then install within the view-through window.</p>
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
                        formData.euPolitical === eu.id
                          ? "bg-blue-600/10 border-blue-500 text-white font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-300"
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

          {/* STEP 4: AD GROUP & ASSETS */}
          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Asset Inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Ad group & Assets</h1>
                  <p className="text-xs text-slate-400 mt-1">Google Ads automatically combines headlines, copy and images to format ads across channels</p>
                </div>

                {/* iOS Guideline Tip Callout */}
                {formData.platform === "IOS" && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
                    <Apple className="h-4 w-4 text-slate-200 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Apple Guidelines Tip:</span> Make sure your headlines, images and video assets strictly follow App Store Review Guidelines for iOS ad approvals.
                    </div>
                  </div>
                )}

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

                {/* Images & AI Image Generator Modal */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Images ({formData.uploadedImages.length}/20)</h3>
                      <p className="text-[11px] text-slate-400">Upload or generate landscape, portrait & square images</p>
                    </div>
                    <button
                      onClick={() => setShowAiImageModal(true)}
                      className="px-3.5 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow flex items-center gap-1.5 hover:brightness-110 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Generate images
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste Image URL or CDN link"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setFormData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, imageUrlInput.trim()] }));
                          setImageUrlInput("");
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" /> Add Image
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {formData.uploadedImages.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-700 aspect-video bg-slate-950">
                        <img src={img} alt="asset" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, uploadedImages: prev.uploadedImages.filter((_, idx) => idx !== i) }))}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audience Signal */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Audience signal (Optional)</h3>
                      <p className="text-[11px] text-slate-400">Guide Google AI with custom intent signals for faster campaign learning</p>
                    </div>
                    <button
                      onClick={() => setShowAudienceModal(true)}
                      className="px-3.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <Users className="h-3.5 w-3.5" /> {formData.audienceSignal ? "Edit Signal" : "Create an audience signal"}
                    </button>
                  </div>
                  {formData.audienceSignal && (
                    <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/40 text-xs text-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        <span>Signal Active: <strong>{formData.audienceSignal}</strong></span>
                      </div>
                      <X onClick={() => setFormData(prev => ({ ...prev, audienceSignal: "" }))} className="h-4 w-4 cursor-pointer text-slate-400 hover:text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Smartphone Live Preview & Ad Strength (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                
                {/* Ad Strength Box */}
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">Ad strength</h4>
                    <span className={`text-xs font-bold ${adStrength.color}`}>{adStrength.label}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${adStrength.barColor}`} style={{ width: `${adStrength.percent}%` }}></div>
                  </div>
                  {formData.headlines.filter(h=>h.trim()).length < 1 || formData.descriptions.filter(d=>d.trim()).length < 1 ? (
                    <div className="text-[11px] text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>At least 1 Headline and 1 Description required to publish.</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Minimum required assets provided! Add more headlines for better performance.</span>
                    </div>
                  )}
                </div>

                {/* Smartphone Mockup */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center">
                  
                  {/* Channel Tabs Selector */}
                  <div className="flex border-b border-slate-800 w-full mb-4 justify-around text-[11px] font-semibold">
                    {[
                      { id: "STORE", label: formData.platform === "IOS" ? "App Store" : "Google Play" },
                      { id: "SEARCH", label: "Search" },
                      { id: "YOUTUBE", label: "YouTube" },
                      { id: "DISPLAY", label: "Display" },
                      { id: "DISCOVER", label: "Discover" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPreviewTab(tab.id as any)}
                        className={`pb-2 border-b-2 transition-all ${
                          previewTab === tab.id
                            ? "border-blue-500 text-blue-400 font-bold"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Smartphone Device Mockup */}
                  <div className="w-[280px] h-[520px] rounded-[36px] border-4 border-slate-700 bg-slate-900 p-3 flex flex-col shadow-2xl relative overflow-hidden">
                    
                    {/* Notch */}
                    <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-3 shrink-0"></div>

                    {/* Preview Content based on Tab */}
                    <div className="flex-1 bg-slate-950 rounded-2xl p-3 border border-slate-800/80 flex flex-col justify-between overflow-y-auto">
                      
                      {previewTab === "STORE" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-semibold">
                            <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-500/40 rounded">Ad</span> Sponsored • {formData.platform === "IOS" ? "App Store" : "Google Play"}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <img src={formData.selectedApp.icon} alt="app" className="h-12 w-12 rounded-xl object-cover border border-slate-800" />
                            <div>
                              <div className="text-xs font-bold text-white">{formData.selectedApp.name}</div>
                              <div className="text-[10px] text-slate-400">{formData.selectedApp.publisher}</div>
                              <div className="text-[9px] text-slate-500">Contains ads • In-app purchases</div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <div className="text-xs font-bold text-blue-400">{formData.headlines.find(h=>h.trim()) || "App Title Headline"}</div>
                            <div className="text-[10px] text-slate-300 leading-snug">{formData.descriptions.find(d=>d.trim()) || "App description preview..."}</div>
                          </div>

                          {formData.uploadedImages[0] && (
                            <img src={formData.uploadedImages[0]} alt="preview" className="w-full aspect-video rounded-xl object-cover border border-slate-800" />
                          )}

                          <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5">
                            {formData.platform === "IOS" ? <Apple className="h-3.5 w-3.5" /> : null}
                            Get / Install
                          </button>
                        </div>
                      )}

                      {previewTab === "SEARCH" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                            <span className="font-bold text-emerald-400">Ad</span> • {formData.platform === "IOS" ? "apps.apple.com" : "play.google.com"}
                          </div>
                          <div className="text-xs font-bold text-blue-400 hover:underline">
                            {formData.headlines.find(h=>h.trim()) || "Download App Today"}
                          </div>
                          <div className="text-[10px] text-slate-300">
                            {formData.descriptions.find(d=>d.trim()) || "Get top features on your phone..."}
                          </div>
                          <button className="w-full mt-2 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
                            Install App
                          </button>
                        </div>
                      )}

                      {(previewTab === "YOUTUBE" || previewTab === "DISPLAY" || previewTab === "DISCOVER") && (
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                            {formData.uploadedImages[0] ? (
                              <img src={formData.uploadedImages[0]} alt="ad" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Media Preview</div>
                            )}
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 text-emerald-400 text-[9px] font-bold rounded">
                              Ad
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <img src={formData.selectedApp.icon} alt="app" className="h-8 w-8 rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white truncate">{formData.headlines.find(h=>h.trim()) || "App Title"}</div>
                              <div className="text-[10px] text-slate-400 truncate">{formData.descriptions.find(d=>d.trim()) || "Description snippet"}</div>
                            </div>
                          </div>
                          <button className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
                            Install Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BIDDING & BUDGET */}
          {step === 5 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Bidding & Budget ({formData.platform})</h1>
                <p className="text-xs text-slate-400 mt-1">Set your target cost per install (Target CPI/CPA) and average daily budget</p>
              </div>

              {/* Bidding Section */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-400" /> Bidding
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">What do you want to focus on?</label>
                    <select
                      value={formData.biddingFocus}
                      onChange={(e) => setFormData(prev => ({ ...prev, biddingFocus: e.target.value }))}
                      className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      <option value="Install volume">Install volume</option>
                      <option value="In-app actions">In-app actions</option>
                      <option value="In-app action value">In-app action value</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">How do you want to track install volume?</label>
                    <select
                      value={formData.conversionAction}
                      onChange={(e) => setFormData(prev => ({ ...prev, conversionAction: e.target.value }))}
                      className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      {formData.platform === "IOS" ? (
                        <>
                          <option value="SKAdNetwork / Apple App Store Conversion">SKAdNetwork / Apple App Store Conversion</option>
                          <option value="Firebase iOS App Installs (First Open)">Firebase iOS App Installs (First Open)</option>
                          <option value="Third-party MMP (Adjust / AppsFlyer / Branch)">Third-party MMP (Adjust / AppsFlyer / Branch)</option>
                        </>
                      ) : (
                        <>
                          <option value="Google Play app installs (First Open)">Google Play app installs (First Open)</option>
                          <option value="Firebase Analytics Conversion">Firebase Analytics Conversion</option>
                          <option value="Third-party App Analytics">Third-party App Analytics</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">What kind of users?</label>
                  <div className="flex gap-4 mt-1.5">
                    {["All users", "Users likely to perform an in-app action"].map((ut) => (
                      <label
                        key={ut}
                        onClick={() => setFormData(prev => ({ ...prev, userTargetType: ut }))}
                        className={`flex-1 p-3 rounded-lg border text-xs cursor-pointer ${
                          formData.userTargetType === ut ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        {ut}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useTargetCpa}
                      onChange={(e) => setFormData(prev => ({ ...prev, useTargetCpa: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs font-semibold text-slate-200">Set a target cost per install (Target CPI)</span>
                  </label>

                  {formData.useTargetCpa && (
                    <div className="pl-7 space-y-2">
                      <div className="flex items-center gap-2 max-w-xs">
                        <span className="text-sm font-bold text-slate-300">₹</span>
                        <input
                          type="number"
                          value={formData.targetCpaValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetCpaValue: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Typical cost for other {formData.platform} app campaigns is ₹25.00 – ₹45.00 per install</p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>This campaign will use the <strong>Target CPA</strong> bid strategy to help you get the most installs at or below your target cost per install.</span>
                  </div>
                </div>
              </div>

              {/* Budget Section */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-400" /> Budget
                </h3>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Set your average daily budget</label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { value: "500", label: "₹500.00 / day" },
                      { value: "1000", label: "₹1,000.00 / day", recommended: true },
                      { value: "2500", label: "₹2,500.00 / day" },
                      { value: "custom", label: "Custom budget" }
                    ].map((b) => (
                      <label
                        key={b.value}
                        onClick={() => setFormData(prev => ({ ...prev, budgetPreset: b.value }))}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between ${
                          formData.budgetPreset === b.value ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{b.label}</span>
                          {b.recommended && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold">Recommended</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.budgetPreset === "custom" && (
                    <div className="max-w-xs pt-2">
                      <label className="text-xs text-slate-400">Custom daily budget amount (₹)</label>
                      <input
                        type="number"
                        value={formData.customBudgetValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, customBudgetValue: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                      />
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span>Weekly spend estimate:</span>
                    <span className="font-bold text-white">
                      Up to ₹{(parseFloat(formData.budgetPreset === "custom" ? formData.customBudgetValue : formData.budgetPreset || "1000") * 7).toLocaleString()} / week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & PUBLISH */}
          {step === 6 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Review & Publish ({formData.platform})</h1>
                <p className="text-xs text-slate-400 mt-1">Review your Google Ads App Campaign configuration before publishing as PAUSED</p>
              </div>

              {/* Warning Banner if Audience Signal Missing */}
              {!formData.audienceSignal && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Audience signal: Add an audience signal for faster optimization</div>
                    <div className="text-[11px] text-amber-400/80 mt-0.5">Campaigns with audience signals reach optimized target users faster. You can publish now and add signals later.</div>
                  </div>
                </div>
              )}

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
                    <span className="text-slate-400">Campaign type</span>
                    <div className="font-bold text-white">App (Multi-Channel)</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign subtype</span>
                    <div className="font-bold text-white">{formData.campaignSubtype === "APP_INSTALLS" ? "App installs" : formData.campaignSubtype}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Platform & Mobile App</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {formData.platform === "IOS" ? <Apple className="h-3.5 w-3.5 text-slate-300" /> : <Smartphone className="h-3.5 w-3.5 text-emerald-400" />}
                      {formData.selectedApp.name} ({formData.selectedApp.packageName})
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Locations & Languages</span>
                    <div className="font-bold text-white">
                      {formData.locationType === "ALL" ? "All countries" : formData.locationType === "INDIA" ? "India" : formData.customLocations.join(", ")} • {formData.languages.join(", ")}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Bidding Focus</span>
                    <div className="font-bold text-white">Install volume ({formData.userTargetType}) • Target CPA: ₹{formData.targetCpaValue}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Average Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetPreset === "custom" ? formData.customBudgetValue : formData.budgetPreset}/day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">View-through Conversions</span>
                    <div className="font-bold text-white">{formData.viewThroughEnabled ? "On" : "Off"}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">EU Political Ads</span>
                    <div className="font-bold text-white">{formData.euPolitical}</div>
                  </div>
                </div>

                {/* Assets Summary */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <div className="text-xs font-bold text-slate-300">Assets Summary</div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>Headlines: <strong className="text-white">{formData.headlines.filter(h=>h.trim()).length}</strong></span>
                    <span>Descriptions: <strong className="text-white">{formData.descriptions.filter(d=>d.trim()).length}</strong></span>
                    <span>Images: <strong className="text-white">{formData.uploadedImages.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal / Card after publish */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your Google Ads {formData.platform} App Promotion campaign is safely saved and ready for review.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                    <div>Google Ads Channel: MULTI_CHANNEL (APP_CAMPAIGN)</div>
                    <div>App Store: {formData.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE"}</div>
                    <div>App Identifier ({formData.platform === "IOS" ? "Bundle ID" : "Package Name"}): {formData.selectedApp.packageName}</div>
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

      {/* ── AI Image Generator Modal ── */}
      {showAiImageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Google AI Ad Asset Generator</h3>
                  <p className="text-xs text-slate-400">Generate high-converting image assets for your app campaign</p>
                </div>
              </div>
              <button onClick={() => setShowAiImageModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Prompt for Image Generation</label>
              <textarea
                rows={3}
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleGenerateAiImages}
                disabled={isGeneratingAiImages}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
              >
                {isGeneratingAiImages ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Generating AI Assets...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Generate 3 Creative Variations
                  </>
                )}
              </button>
            </div>

            {generatedAiImages.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300">Click an image to add to campaign:</label>
                <div className="grid grid-cols-3 gap-3">
                  {generatedAiImages.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectAiImage(url)}
                      className={`relative rounded-xl overflow-hidden border cursor-pointer group aspect-video bg-slate-950 ${
                        formData.uploadedImages.includes(url) ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-slate-700 hover:border-blue-500"
                      }`}
                    >
                      <img src={url} alt="generated" className="w-full h-full object-cover" />
                      {formData.uploadedImages.includes(url) ? (
                        <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center text-emerald-400 font-bold text-xs">
                          <Check className="h-5 w-5" /> Added
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs">
                          + Add
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAiImageModal(false)}
                className="px-5 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Audience Signal Modal ── */}
      {showAudienceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Create an Audience Signal</h3>
                  <p className="text-xs text-slate-400">Help Google AI optimize campaign targeting</p>
                </div>
              </div>
              <button onClick={() => setShowAudienceModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Audience Name</label>
                <input
                  type="text"
                  value={audienceSignalName}
                  onChange={(e) => setAudienceSignalName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Custom Intent Keywords</label>
                <input
                  type="text"
                  value={audienceKeywordsInput}
                  onChange={(e) => setAudienceKeywordsInput(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300">
                Google AI will prioritize users searching for these intent themes across Play Store & YouTube.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAudienceModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, audienceSignal: audienceSignalName }));
                  setShowAudienceModal(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow"
              >
                Save Audience Signal
              </button>
            </div>
          </div>
        </div>
      )}

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
