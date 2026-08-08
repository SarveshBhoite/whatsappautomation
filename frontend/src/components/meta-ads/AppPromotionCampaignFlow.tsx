"use client";
import { useState } from "react";
import {
  X, Loader2, Smartphone, Settings, Check, Globe, Sparkles, Megaphone, Zap, ArrowUpRight, Plus,
  Search, ShieldCheck, Eye, Layers, Calendar
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

  // STEP 2: Campaign Parameters
  const [campName, setCampName] = useState("New App promotion campaign");
  const [liveVideoAd, setLiveVideoAd] = useState(false);
  const [buyingType, setBuyingType] = useState("AUCTION");
  const [cboEnabled, setCboEnabled] = useState(true);
  const [dailyBudget, setDailyBudget] = useState("2000");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [shareBudgetPercent, setShareBudgetPercent] = useState(false);
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [abTestVariable, setAbTestVariable] = useState("CREATIVE");
  const [abTestDuration, setAbTestDuration] = useState("7_DAYS");
  const [abTestMetric, setAbTestMetric] = useState("COST_PER_INSTALL");
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [formPageId, setFormPageId] = useState(fetchedPages[0]?.id || "");

  // STEP 3: Ad Set (App Promotion)
  const [adSetName, setAdSetName] = useState("New App Promotion ad set");
  const [appStore, setAppStore] = useState<"GOOGLE_PLAY" | "APPLE_APP_STORE">("GOOGLE_PLAY");
  const [appCountry, setAppCountry] = useState("India");
  const [appNameSearch, setAppNameSearch] = useState("com.yourcompany.app");
  const [performanceGoal, setPerformanceGoal] = useState<"APP_INSTALLS" | "APP_EVENTS">("APP_INSTALLS");
  const [costPerResult, setCostPerResult] = useState("");
  const [attributionModel, setAttributionModel] = useState("7_DAY_CLICK_1_DAY_VIEW");
  const [valueRulesEnabled, setValueRulesEnabled] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [securitiesDeclared, setSecuritiesDeclared] = useState(false);
  const [advantagePlacements, setAdvantagePlacements] = useState(true);
  const [brandSuitability, setBrandSuitability] = useState("STANDARD");
  const [showAudienceSize, setShowAudienceSize] = useState(true);

  // STEP 4: App Promotion Ad Creative (Custom)
  const [adName, setAdName] = useState("New App Promotion ad");
  const [deferredDeepLink, setDeferredDeepLink] = useState("");
  const [customStoreListingId, setCustomStoreListingId] = useState("");
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c");
  const [aiMedia, setAiMedia] = useState(false);
  const [primaryText, setPrimaryText] = useState("Download our app today for seamless experiences and exclusive rewards!");
  const [headline, setHeadline] = useState("Install Now & Get 500 Bonus Points");
  const [testimonialText, setTestimonialText] = useState("");

  // Languages & Tracking
  const [languagesEnabled, setLanguagesEnabled] = useState(false);
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
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: campName,
          objective: "OUTCOME_APP_PROMOTION",
          dailyBudget: Number(dailyBudget),
          buyingType,
          liveVideoAd,
          cboEnabled,
          bidStrategy,
          specialAdCategory,
          adSetName,
          appStore,
          appCountry,
          appId: appNameSearch,
          performanceGoal,
          costPerResult,
          attributionModel,
          valueRulesEnabled,
          securitiesDeclared,
          advantagePlacements,
          adName,
          facebookPageId: formPageId,
          deferredDeepLink,
          customStoreListingId,
          creativeHeadline: headline,
          creativeBody: primaryText,
          creativeMediaUrl: mediaUrl,
          aiMedia,
          testimonialText,
          languagesEnabled,
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
              <span className="text-xs text-slate-400 font-mono">In Draft</span>
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
              <h3 className="text-base font-bold text-slate-100">Step 1: App Promotion Objective Selected</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Find new people to install your mobile app and continue using it.
              </p>
              <button
                onClick={() => setActiveStep(2)}
                className="px-6 py-2.5 rounded-xl bg-pink-500 text-slate-950 font-bold text-xs"
              >
                Proceed to Step 2: Configure Campaign Parameters →
              </button>
            </div>
          )}

          {/* STEP 2: CONFIGURE APP PROMOTION CAMPAIGN PARAMETERS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-pink-950/30 border border-slate-800 shadow-md">
                <div>
                  <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 2 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">Configure App Promotion Campaign Parameters</h3>
                  <p className="text-xs text-slate-400">Set budget, bidding strategies, and category declarations for app installs & events.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 hover:text-white"
                >
                  ← Change Objective
                </button>
              </div>

              {/* 1. Campaign Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New App promotion campaign"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* 2. Live video ad toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use settings suggested for live stream video ad promotions.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={liveVideoAd}
                    onChange={(e) => setLiveVideoAd(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
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

              {/* 4. Advantage+ campaign budget toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Distribute budget across ad sets for maximum app installs.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={cboEnabled}
                      onChange={(e) => setCboEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                {cboEnabled && (
                  <div className="pt-3 space-y-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Budget (₹ INR)</label>
                        <input
                          type="number"
                          value={dailyBudget}
                          onChange={(e) => setDailyBudget(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Bid Strategy</label>
                        <select
                          value={bidStrategy}
                          onChange={(e) => setBidStrategy(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="HIGHEST_VOLUME">Highest volume (Max installs)</option>
                          <option value="BID_CAP">Bid cap</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={shareBudgetPercent}
                        onChange={(e) => setShareBudgetPercent(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-pink-500"
                      />
                      Share up to 20% of your budget with other ad sets
                    </label>
                  </div>
                )}
              </div>

              {/* 5 & 6. Campaign Frequency Control & A/B Test */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Set view limit.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={frequencyControl}
                    onChange={(e) => setFrequencyControl(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Compare versions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={abTestEnabled}
                    onChange={(e) => setAbTestEnabled(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* 7. Special Ad Categories */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="NONE">None — Declare category if applicable</option>
                  <option value="CREDIT">Credit — Financial products & loans</option>
                  <option value="EMPLOYMENT">Employment — Jobs & hiring</option>
                  <option value="HOUSING">Housing — Real estate & property</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Social Issues, Elections or Politics</option>
                </select>
              </div>

              {/* 8. Facebook Page */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Facebook Page</label>
                <select
                  value={formPageId}
                  onChange={(e) => setFormPageId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {fetchedPages.map((p: any) => (
                    <option key={p.id} value={p.id}>📄 {p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              {/* 9. Campaign score */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center font-bold text-xs">
                    66
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Campaign score</h4>
                    <p className="text-[11px] text-slate-400">App campaign optimization ready.</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  Cancel
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-pink-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 3: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AD SET (APP PROMOTION) */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="px-2.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-bold uppercase">
                  Step 3 of 4
                </span>
                <h3 className="font-bold text-slate-100 text-sm pt-1">Step 3 — App Promotion Ad Set Configuration</h3>
                <p className="text-xs text-slate-400">Configure app store target, app package ID, performance goals, and attribution.</p>
              </div>

              {/* Ad set name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Ad set name *</label>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* App Store & Country */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Target Application</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">App Store</label>
                    <select
                      value={appStore}
                      onChange={(e: any) => setAppStore(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="GOOGLE_PLAY">Google Play Store (Android)</option>
                      <option value="APPLE_APP_STORE">Apple App Store (iOS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">App Country</label>
                    <select
                      value={appCountry}
                      onChange={(e) => setAppCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">App Package ID or Name Search</label>
                  <input
                    type="text"
                    value={appNameSearch}
                    onChange={(e) => setAppNameSearch(e.target.value)}
                    placeholder="com.yourcompany.app"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Performance Goal & Attribution */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Performance Goal & Bidding</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Performance Goal</label>
                    <select
                      value={performanceGoal}
                      onChange={(e: any) => setPerformanceGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    >
                      <option value="APP_INSTALLS">App Installs</option>
                      <option value="APP_EVENTS">App In-App Events</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cost Per Result (Optional)</label>
                    <input
                      type="text"
                      value={costPerResult}
                      onChange={(e) => setCostPerResult(e.target.value)}
                      placeholder="e.g. ₹25.00"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Attribution Model</label>
                  <select
                    value={attributionModel}
                    onChange={(e) => setAttributionModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="7_DAY_CLICK_1_DAY_VIEW">7-day click or 1-day view</option>
                    <option value="1_DAY_CLICK">1-day click</option>
                    <option value="7_DAY_CLICK">7-day click</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 text-xs">Value rules enabled</h4>
                  <input
                    type="checkbox"
                    checked={valueRulesEnabled}
                    onChange={(e) => setValueRulesEnabled(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* Securities Declaration & Audience Display */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitiesDeclared}
                    onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-pink-500 shrink-0"
                  />
                  <span>Declare App Store financial security compliance and SDK tracking consent.</span>
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

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 text-xs">Estimated audience size toggle</h4>
                  <input
                    type="checkbox"
                    checked={showAudienceSize}
                    onChange={(e) => setShowAudienceSize(e.target.checked)}
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

          {/* STEP 4: APP PROMOTION AD CREATIVE (CUSTOM) */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">App Promotion Ad Creative (Custom Setup)</h3>
                </div>
              </div>

              {/* 1. Ad Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Ad Name *</label>
                <input
                  type="text"
                  required
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="New App Promotion ad"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* 2. Deep Link & Custom Store Listing */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Deep Link & Custom Store Listing</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Deferred Deep Link URL</label>
                  <input
                    type="text"
                    value={deferredDeepLink}
                    onChange={(e) => setDeferredDeepLink(e.target.value)}
                    placeholder="myapp://open/deal?id=123"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Custom Store Listing ID (Optional)</label>
                  <input
                    type="text"
                    value={customStoreListingId}
                    onChange={(e) => setCustomStoreListingId(e.target.value)}
                    placeholder="e.g. promo_banner_v2"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* 3. Ad Creative */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Ad Creative</h4>
                  <button
                    type="button"
                    onClick={() => showToast("Selected existing post!")}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold"
                  >
                    Select post
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ad Media Banner URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
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

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiMedia}
                    onChange={(e) => setAiMedia(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-pink-500"
                  />
                  Ad includes media created or edited with AI
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Body Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Testimonial Text (Optional)</label>
                  <textarea
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    placeholder="User quote or review rating..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* 4. Languages */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Languages</h4>
                  <input
                    type="checkbox"
                    checked={languagesEnabled}
                    onChange={(e) => setLanguagesEnabled(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                </div>

                {languagesEnabled && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                    <p className="text-slate-300 font-semibold">Default language: English</p>
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
                </div>
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
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish (PUBLISHING 1 OF 1) 🚀"}
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
            </div>

            {/* Mobile App Install Card Mockup */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden space-y-2 p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">
                  📲
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">App Store Featured</p>
                  <p className="text-[10px] text-slate-400">{appNameSearch}</p>
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
                  Install Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
