"use client";
import { useState } from "react";
import {
  X, Loader2, Smartphone, Settings, Check, Globe, Sparkles, Megaphone, Zap, ArrowUpRight, Plus,
  Search, ShieldCheck, Eye, Layers, Calendar, ExternalLink, HelpCircle, AlertCircle
} from "lucide-react";

interface AppPromotionCampaignFlowProps {
  orgId: string;
  backendUrl: string;
  fetchedPages: any[];
  fetchedIgAccounts: any[];
  onClose: () => void;
  onPublished: () => void;
}

export default function AppPromotionCampaignFlow({
  orgId,
  backendUrl,
  fetchedPages,
  fetchedIgAccounts,
  onClose,
  onPublished,
}: AppPromotionCampaignFlowProps) {
  // Current active step (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2);

  // STEP 2: Campaign Level State
  const [campName, setCampName] = useState("New App promotion Campaign");
  const [liveVideoAd, setLiveVideoAd] = useState(false);
  const [liveVideoLocation, setLiveVideoLocation] = useState("FACEBOOK");
  const [buyingType, setBuyingType] = useState("AUCTION");
  const [ios14Campaign, setIos14Campaign] = useState(true);
  const [selectedApp, setSelectedApp] = useState("whatsapp_automation_app");

  const [cboEnabled, setCboEnabled] = useState(true);
  const [budgetStrategyMode, setBudgetStrategyMode] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [dailyBudget, setDailyBudget] = useState("2000");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [shareBudgetPercent, setShareBudgetPercent] = useState(false);
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [appPromoShowMoreSettings, setAppPromoShowMoreSettings] = useState(false);

  // STEP 3: Ad Set (App Promotion)
  const [adSetName, setAdSetName] = useState("New App promotion ad set");
  const [appStore, setAppStore] = useState<"GOOGLE_PLAY" | "APPLE_APP_STORE" | "AMAZON_APPSTORE">("GOOGLE_PLAY");
  const [appSearchQuery, setAppSearchQuery] = useState("org.jisnu.wa");
  const [performanceGoal, setPerformanceGoal] = useState<"MAXIMIZE_INSTALLS" | "MAXIMIZE_APP_EVENTS" | "MAXIMIZE_VALUE">("MAXIMIZE_INSTALLS");
  const [attributionModel, setAttributionModel] = useState("STANDARD");

  const [appCountry, setAppCountry] = useState("IN");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("ALL");
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [costPerResult, setCostPerResult] = useState("");
  const [securitiesDeclared, setSecuritiesDeclared] = useState(false);
  const [advantagePlacements, setAdvantagePlacements] = useState(true);
  const [brandSuitability, setBrandSuitability] = useState("STANDARD");

  // STEP 4: App Promotion Ad Creative
  const [adName, setAdName] = useState("New App promotion ad");
  const [destinationType, setDestinationType] = useState<"APP" | "INSTANT_EXPERIENCE" | "PLAYABLE_SOURCE">("APP");
  const [deferredDeepLink, setDeferredDeepLink] = useState("");
  const [customStoreListingId, setCustomStoreListingId] = useState("");
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c");
  const [aiMedia, setAiMedia] = useState(false);
  const [headline, setHeadline] = useState("Download WhatsApp Automation App Today!");
  const [primaryText, setPrimaryText] = useState("Boost your business messaging efficiency by 10x with automated replies and bulk broadcasts.");
  const [testimonialText, setTestimonialText] = useState("");

  // Languages & Tracking
  const [appPromoLanguagesEnabled, setAppPromoLanguagesEnabled] = useState(false);
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);
  const [trackWebsiteEvents, setTrackWebsiteEvents] = useState(true);
  const [trackAppEvents, setTrackAppEvents] = useState(true);
  const [trackOfflineEvents, setTrackOfflineEvents] = useState(false);
  const [pixelId, setPixelId] = useState("189283719283");

  const [publishing, setPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handlePublish = async () => {
    if (!campName.trim() || !adSetName.trim() || !adName.trim()) {
      showToast("Please fill in Campaign, Ad Set, and Ad names.");
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns/app-promotion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: campName,
          objective: "OUTCOME_APP_PROMOTION",
          dailyBudget: Number(dailyBudget),
          buyingType,
          liveVideoAd,
          liveVideoLocation,
          ios14Campaign,
          selectedApp,
          cboEnabled,
          budgetStrategyMode,
          budgetMode,
          bidStrategy,
          specialAdCategory,
          adSetName,
          appStore,
          appSearchQuery,
          performanceGoal,
          attributionModel,
          appCountry,
          ageMin,
          ageMax,
          gender,
          detailedTargeting,
          costPerResult,
          securitiesDeclared,
          advantagePlacements,
          adName,
          destinationType,
          deferredDeepLink,
          customStoreListingId,
          creativeHeadline: headline,
          creativeBody: primaryText,
          creativeMediaUrl: mediaUrl,
          aiMedia,
          testimonialText,
          appPromoLanguagesEnabled,
          trackWebsiteEvents,
          trackAppEvents,
          trackOfflineEvents,
          pixelId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "App Promotion Campaign publish failed.");

      showToast("App Promotion Campaign Created & Published Live! 📲");
      onPublished();
    } catch (err: any) {
      showToast(`Publish error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-hidden animate-fadeIn">
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-pink-500/50 text-pink-300 text-xs font-bold shadow-2xl">
          ⚡ {toastMessage}
        </div>
      )}

      {/* Header Stepper Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-bold uppercase">
                Step {activeStep} of 4
              </span>
              <span className="text-xs text-slate-400 font-mono">In Draft • 1 Ad set • 1 Ad</span>
            </div>
            <h1 className="font-bold text-slate-100 text-sm">{campName}</h1>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button onClick={() => setActiveStep(1)} className="px-3 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-white">
            1. Objective
          </button>
          <button onClick={() => setActiveStep(2)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 2 ? "bg-pink-500 text-slate-950" : "text-slate-400"}`}>
            2. Campaign Parameters
          </button>
          <button onClick={() => setActiveStep(3)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 3 ? "bg-pink-500 text-slate-950" : "text-slate-400"}`}>
            3. Ad Set Level
          </button>
          <button onClick={() => setActiveStep(4)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 4 ? "bg-pink-500 text-slate-950" : "text-slate-400"}`}>
            4. Ad Creative & Preview
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-4xl mx-auto border-r border-slate-800">

          {/* STEP 1: OBJECTIVE CHOICE REDIRECT */}
          {activeStep === 1 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <Smartphone className="h-10 w-10 text-pink-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-100">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selected: <span className="text-pink-400 font-bold">App promotion (OUTCOME_APP_PROMOTION)</span>
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-pink-400" /> App Promotion Preview
                  </h4>
                  <a
                    href="https://www.facebook.com/business/help/1438417719786914"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1"
                  >
                    About campaign objectives <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300">
                  Find new people to install your mobile app and continue using it.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["App installs", "App events"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-[10px] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  Cancel
                </button>
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-pink-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  Continue → Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: NEW APP PROMOTION CAMPAIGN */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-xs text-pink-400 hover:underline font-semibold flex items-center gap-1 mb-1"
                  >
                    ← Change Objective
                  </button>
                  <h3 className="font-bold text-slate-100 text-sm">New App promotion Campaign</h3>
                  <p className="text-xs text-slate-400 mt-0.5">1 Ad set • 1 Ad</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">Edit</button>
                  <button type="button" className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">Review</button>
                  <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-semibold">Step 2 of 4</span>
                </div>
              </div>

              {/* 1. Campaign Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Campaign name *</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New App promotion Campaign"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={() => setAppPromoShowMoreSettings(!appPromoShowMoreSettings)}
                  className="text-xs text-pink-400 hover:underline font-semibold"
                >
                  {appPromoShowMoreSettings ? "Hide details" : "Show more options ▾"}
                </button>
              </div>

              {/* 2. Live video ad */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use settings that are suggested for a live video ad promoting app installs.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={liveVideoAd}
                    onChange={(e) => setLiveVideoAd(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>

                {liveVideoAd && (
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Live video location</label>
                    <select
                      value={liveVideoLocation}
                      onChange={(e) => setLiveVideoLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="FACEBOOK">Facebook</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="AUDIENCE_NETWORK">Audience Network</option>
                      <option value="FACEBOOK_INSTAGRAM">Facebook &amp; Instagram</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Campaign details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Campaign details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Buying type</label>
                    <select
                      value={buyingType}
                      onChange={(e) => setBuyingType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
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
                      value="App promotion"
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-pink-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. iOS 14+ campaign toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">iOS 14+ campaign</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Optimized for Apple's App Tracking Transparency &amp; SKAdNetwork frameworks.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ios14Campaign}
                    onChange={(e) => setIos14Campaign(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* 5. App Selection */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">App</h4>
                <select
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                >
                  <option value="whatsapp_automation_app">📱 WhatsApp Automation Pro (org.jisnu.wa)</option>
                  <option value="jisnu_crm_app">💼 JISNU CRM Mobile (org.jisnu.crm)</option>
                  <option value="custom_app">+ Add new mobile app ID</option>
                </select>
              </div>

              {/* 6. Budget (Advantage+ toggle & strategy) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-200 text-xs">Budget</h4>
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 text-[10px] font-bold">Advantage+ on</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cboEnabled}
                    onChange={(e) => setCboEnabled(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => setBudgetStrategyMode("CAMPAIGN")}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 ${
                      budgetStrategyMode === "CAMPAIGN" ? "bg-pink-500/10 border-pink-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <input type="radio" checked={budgetStrategyMode === "CAMPAIGN"} readOnly className="mt-1 h-4 w-4 text-pink-500" />
                    <div>
                      <p className="text-xs font-bold">Campaign budget — Automatically distribute budget (Advantage+)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Maximizes total app installs across all ad sets.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setBudgetStrategyMode("ADSET")}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 ${
                      budgetStrategyMode === "ADSET" ? "bg-pink-500/10 border-pink-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <input type="radio" checked={budgetStrategyMode === "ADSET"} readOnly className="mt-1 h-4 w-4 text-pink-500" />
                    <div>
                      <p className="text-xs font-bold">Ad set budget — Control per ad set</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Set individual limits for specific audiences or regions.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Budget mode</label>
                    <select
                      value={budgetMode}
                      onChange={(e: any) => setBudgetMode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="DAILY">Daily budget</option>
                      <option value="LIFETIME">Lifetime budget</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign bid strategy</label>
                  <select
                    value={bidStrategy}
                    onChange={(e) => setBidStrategy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="HIGHEST_VOLUME">Highest volume (Max installs)</option>
                    <option value="COST_CAP">Cost per result goal</option>
                    <option value="BID_CAP">Bid cap</option>
                  </select>
                </div>
              </div>

              {/* 7 & 8. Frequency & A/B Test */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                  <input
                    type="checkbox"
                    checked={frequencyControl}
                    onChange={(e) => setFrequencyControl(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                  <input
                    type="checkbox"
                    checked={abTestEnabled}
                    onChange={(e) => setAbTestEnabled(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* 9. Special Ad Categories */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="NONE">None — Standard Commercial App Ads</option>
                  <option value="CREDIT">Credit — Loans or credit cards</option>
                  <option value="EMPLOYMENT">Employment — Job offers &amp; hiring</option>
                  <option value="HOUSING">Housing — Real estate listings</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Issues &amp; Politics — Social causes</option>
                </select>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 1
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-pink-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 3: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: NEW APP PROMOTION AD SET */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="px-2.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-bold uppercase">
                  Step 3 of 4
                </span>
                <h3 className="font-bold text-slate-100 text-sm pt-1">New App promotion Campaign → New App promotion Ad set</h3>
                <p className="text-xs text-slate-400">Configure app store, target country, attribution windows, and audience.</p>
              </div>

              {/* 1. Ad set name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Ad set name *</label>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  placeholder="New App promotion ad set"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* 2. App store / Mobile app store */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">App store / Mobile app store</h4>
                <select
                  value={appStore}
                  onChange={(e: any) => setAppStore(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                >
                  <option value="GOOGLE_PLAY">🤖 Google Play Store</option>
                  <option value="APPLE_APP_STORE">🍎 Apple App Store</option>
                  <option value="AMAZON_APPSTORE">📦 Amazon Appstore</option>
                </select>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Search App / Identity</label>
                  <input
                    type="text"
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    placeholder="Enter app name, app ID or exact app store URL"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* 3. Performance goal & Attribution */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Performance goal &amp; Attribution</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Performance goal</label>
                    <select
                      value={performanceGoal}
                      onChange={(e: any) => setPerformanceGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    >
                      <option value="MAXIMIZE_INSTALLS">Maximise number of app installs</option>
                      <option value="MAXIMIZE_APP_EVENTS">Maximise number of in-app events</option>
                      <option value="MAXIMIZE_VALUE">Maximise value of conversions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Attribution Window</label>
                    <select
                      value={attributionModel}
                      onChange={(e) => setAttributionModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="STANDARD">Standard (7-day click or 1-day view)</option>
                      <option value="1_DAY_CLICK">1-day click</option>
                      <option value="7_DAY_CLICK">7-day click</option>
                      <option value="1_DAY_VIEW">1-day view</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Audience definition */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Audience definition</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Country / Region</label>
                  <select
                    value={appCountry}
                    onChange={(e) => setAppCountry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                  >
                    <option value="IN">🇮🇳 India (IN)</option>
                    <option value="US">🇺🇸 United States (US)</option>
                    <option value="GB">🇬🇧 United Kingdom (GB)</option>
                    <option value="CA">🇨🇦 Canada (CA)</option>
                    <option value="AU">🇦🇺 Australia (AU)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min Age</label>
                    <input
                      type="number"
                      value={ageMin}
                      onChange={(e) => setAgeMin(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Max Age</label>
                    <input
                      type="number"
                      value={ageMax}
                      onChange={(e) => setAgeMax(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="ALL">All Genders</option>
                      <option value="MEN">Men</option>
                      <option value="WOMEN">Women</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cost per result goal</label>
                  <input
                    type="text"
                    value={costPerResult}
                    onChange={(e) => setCostPerResult(e.target.value)}
                    placeholder="None"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* 5, 6 & 7. Regulatory & Placements */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitiesDeclared}
                    onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-pink-500 shrink-0"
                  />
                  <span>Policy and regulatory requirements (India) compliance verified.</span>
                </label>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 text-xs">Advantage+ placements</h4>
                  <input
                    type="checkbox"
                    checked={advantagePlacements}
                    onChange={(e) => setAdvantagePlacements(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-pink-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 4: Ad Creative & Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NEW APP PROMOTION AD */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">New App promotion Campaign → New App promotion Ad set → New App promotion Ad</h3>
                </div>
              </div>

              {/* 1. Ad Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Ad name *</label>
                <input
                  type="text"
                  required
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="New App promotion ad"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* 2. Destination / App deep link */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Destination / App deep link</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "APP", label: "App — Send people to your app" },
                    { id: "INSTANT_EXPERIENCE", label: "Instant Experience — Fast mobile UI" },
                    { id: "PLAYABLE_SOURCE", label: "Playable source — Play demo" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDestinationType(d.id as any)}
                      className={`p-2.5 rounded-xl border font-bold text-left ${destinationType === d.id ? "bg-pink-500/10 border-pink-500/60 text-pink-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Deferred deep link</label>
                  <input
                    type="text"
                    value={deferredDeepLink}
                    onChange={(e) => setDeferredDeepLink(e.target.value)}
                    placeholder="Enter the deferred deep link URL"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Custom store listing</label>
                  <input
                    type="text"
                    value={customStoreListingId}
                    onChange={(e) => setCustomStoreListingId(e.target.value)}
                    placeholder="Enter custom store listing ID"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* 3. Creative / Media */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Creative / Media</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Download WhatsApp Automation App Today!"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Body Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    placeholder="Boost your business messaging efficiency by 10x with automated replies and bulk broadcasts."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Media Banner URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/app-banner.jpg"
                      className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("Fetched media from Meta Library!")}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold shrink-0"
                    >
                      Fetch Meta Library
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Testimonial / Partner Text</label>
                  <textarea
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    placeholder="Add text from your partner..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* 4. Languages */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Multi-language Creative</h4>
                  <input
                    type="checkbox"
                    checked={appPromoLanguagesEnabled}
                    onChange={(e) => setAppPromoLanguagesEnabled(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>

                {appPromoLanguagesEnabled && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                    <p className="text-slate-300 font-semibold">Default: English</p>
                    <button
                      type="button"
                      onClick={() => setAdditionalLanguages([...additionalLanguages, "Spanish"])}
                      className="px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/30 text-xs font-bold"
                    >
                      + Add language
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Tracking */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Tracking</h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={trackWebsiteEvents} onChange={(e) => setTrackWebsiteEvents(e.target.checked)} className="accent-pink-500" />
                    Website events (Pixel ID: <span className="font-mono text-pink-400 font-bold">{pixelId}</span>)
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={trackAppEvents} onChange={(e) => setTrackAppEvents(e.target.checked)} className="accent-pink-500" />
                    App events (SDK Tracking)
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={trackOfflineEvents} onChange={(e) => setTrackOfflineEvents(e.target.checked)} className="accent-pink-500" />
                    Offline events
                  </label>
                  <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-pink-400 hover:underline block pt-1">
                    About third-party reporting
                  </a>
                </div>
              </div>

              {/* 7. Legal terms */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400">
                <p>By clicking Publish Campaign Live, you agree to Meta's App Promotion Terms & Conditions.</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(3)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 3
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-xl flex items-center gap-2"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Campaign Live 🚀"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Live Ad Preview Panel */}
        <div className="w-80 bg-slate-950 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-pink-400" /> Mobile App Preview
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Google Play Store</span>
            </div>

            {/* Mobile App Install Card Mockup */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden space-y-2 p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">
                  📲
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">WhatsApp Automation App</p>
                  <p className="text-[10px] text-slate-400">Sponsored • Mobile App Store</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-tight">{primaryText}</p>

              {mediaUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900 h-36">
                  <img src={mediaUrl} alt="App Ad Media" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-100 truncate max-w-[150px]">{headline}</p>
                  <p className="text-[9px] text-slate-400 truncate max-w-[150px]">Free • Ratings ⭐ 4.8</p>
                </div>
                <button className="px-3 py-1 rounded-md bg-pink-500 text-slate-950 text-[10px] font-bold">
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
