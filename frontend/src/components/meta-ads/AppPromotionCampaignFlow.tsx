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

  // Dynamic Meta Registered Applications from Graph API
  const [registeredApps, setRegisteredApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [objectStoreUrl, setObjectStoreUrl] = useState("https://play.google.com/store/apps/details?id=com.whatsapp");
  const [customEventType, setCustomEventType] = useState("PURCHASE");
  const [customEventStr, setCustomEventStr] = useState("");
  const [callToAction, setCallToAction] = useState("INSTALL_MOBILE_APP");

  // Dynamic Meta Graph API search states for Geo Locations, Targeting Specs & Languages
  const [locQuery, setLocQuery] = useState("");
  const [locResults, setLocResults] = useState<any[]>([]);
  const [searchingLoc, setSearchingLoc] = useState(false);
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["India"]);

  const [targetingQuery, setTargetingQuery] = useState("");
  const [targetingResults, setTargetingResults] = useState<any[]>([]);
  const [searchingTargeting, setSearchingTargeting] = useState(false);
  const [showTargetingDropdown, setShowTargetingDropdown] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<any[]>([]);

  const [langQuery, setLangQuery] = useState("");
  const [langResults, setLangResults] = useState<any[]>([]);
  const [searchingLang, setSearchingLang] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["ALL"]);

  // Search Meta Geo Locations via Graph API
  const handleSearchLocations = async (q: string) => {
    setLocQuery(q);
    if (!q.trim()) {
      setLocResults([]);
      setShowLocDropdown(false);
      return;
    }
    setSearchingLoc(true);
    setShowLocDropdown(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/search/locations?organizationId=${orgId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results) setLocResults(data.results);
    } catch (e) {
      console.warn("Location search error:", e);
    } finally {
      setSearchingLoc(false);
    }
  };

  // Search Meta Detailed Targeting via Graph API
  const handleSearchTargeting = async (q: string) => {
    setTargetingQuery(q);
    if (!q.trim()) {
      setTargetingResults([]);
      setShowTargetingDropdown(false);
      return;
    }
    setSearchingTargeting(true);
    setShowTargetingDropdown(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/search/targeting?organizationId=${orgId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results) setTargetingResults(data.results);
    } catch (e) {
      console.warn("Targeting search error:", e);
    } finally {
      setSearchingTargeting(false);
    }
  };

  // Search Meta Languages via Graph API
  const handleSearchLanguages = async (q: string) => {
    setLangQuery(q);
    if (!q.trim()) {
      setLangResults([]);
      setShowLangDropdown(false);
      return;
    }
    setSearchingLang(true);
    setShowLangDropdown(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/search/languages?organizationId=${orgId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results) setLangResults(data.results);
    } catch (e) {
      console.warn("Language search error:", e);
    } finally {
      setSearchingLang(false);
    }
  };

  // Fetch registered Meta Apps
  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/applications?organizationId=${orgId}`);
      const data = await res.json();
      if (data.applications) {
        setRegisteredApps(data.applications);
        if (data.applications.length > 0 && !selectedApp) {
          setSelectedApp(data.applications[0].id);
          if (data.applications[0].object_store_url) {
            setObjectStoreUrl(data.applications[0].object_store_url);
          }
        }
      }
    } catch (e) {
      console.warn("Error fetching apps:", e);
    } finally {
      setLoadingApps(false);
    }
  };

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
          applicationId: selectedApp,
          objectStoreUrl,
          appStore,
          appSearchQuery,
          performanceGoal,
          customEventType: performanceGoal === "MAXIMIZE_APP_EVENTS" ? customEventType : undefined,
          customEventStr: (performanceGoal === "MAXIMIZE_APP_EVENTS" && customEventType === "OTHER") ? customEventStr : undefined,
          attributionModel,
          appCountry,
          ageMin,
          ageMax,
          gender,
          targeting: {
            locations: selectedLocations,
            ageMin,
            ageMax,
            gender,
            languages: selectedLanguages,
            interests: selectedInterests.map(i => i.name),
            detailedTargeting: detailedTargeting || selectedInterests.map(i => i.name).join(", "),
            user_os: appStore === "APPLE_APP_STORE" ? ["iOS"] : ["Android"],
            device_platforms: ["mobile"],
          },
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
          callToAction,
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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 overflow-hidden animate-fadeIn">
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-2xl">
          ⚡ {toastMessage}
        </div>
      )}

      {/* Header Stepper Navigation */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shrink-0 shadow-2xs">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                Step {activeStep} of 4
              </span>
              <span className="text-xs text-slate-500 font-mono">In Draft • 1 Ad set • 1 Ad</span>
            </div>
            <h1 className="font-bold text-slate-900 text-sm">{campName}</h1>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button onClick={() => setActiveStep(1)} className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
            1. Objective
          </button>
          <button onClick={() => setActiveStep(2)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 2 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
            2. Campaign Parameters
          </button>
          <button onClick={() => setActiveStep(3)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 3 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
            3. Ad Set Level
          </button>
          <button onClick={() => setActiveStep(4)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 4 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
            4. Ad Creative & Preview
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-4xl mx-auto border-r border-slate-200">

          {/* STEP 1: OBJECTIVE CHOICE REDIRECT */}
          {activeStep === 1 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-2xs">
              <Smartphone className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Selected: <span className="text-blue-600 font-bold">App promotion (OUTCOME_APP_PROMOTION)</span>
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-blue-600" /> App Promotion Preview
                  </h4>
                  <a
                    href="https://www.facebook.com/business/help/1438417719786914"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    About campaign objectives <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-700">
                  Find new people to install your mobile app and continue using it.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["App installs", "App events"].map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Continue → Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: NEW APP PROMOTION CAMPAIGN */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 mb-1 cursor-pointer"
                  >
                    ← Change Objective
                  </button>
                  <h3 className="font-bold text-slate-900 text-sm">New App promotion Campaign</h3>
                  <p className="text-xs text-slate-500 mt-0.5">1 Ad set • 1 Ad</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">Edit</button>
                  <button type="button" className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">Review</button>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">Step 2 of 4</span>
                </div>
              </div>

              {/* 1. Campaign Name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Campaign name *</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New App promotion Campaign"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setAppPromoShowMoreSettings(!appPromoShowMoreSettings)}
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  {appPromoShowMoreSettings ? "Hide details" : "Show more options ▾"}
                </button>
              </div>

              {/* 2. Live video ad */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Live video ad</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Use settings that are suggested for a live video ad promoting app installs.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={liveVideoAd}
                      onChange={(e) => setLiveVideoAd(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {liveVideoAd && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Live video location</label>
                    <select
                      value={liveVideoLocation}
                      onChange={(e) => setLiveVideoLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
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
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Campaign details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Buying type</label>
                    <select
                      value={buyingType}
                      onChange={(e) => setBuyingType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="AUCTION">Auction</option>
                      <option value="RESERVED">Reservation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Campaign objective</label>
                    <input
                      type="text"
                      disabled
                      value="App promotion"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. iOS 14+ campaign toggle */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">iOS 14+ campaign</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Optimized for Apple's App Tracking Transparency &amp; SKAdNetwork frameworks.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={ios14Campaign}
                      onChange={(e) => setIos14Campaign(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* 5. App Selection */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">Registered App (Application ID) *</h4>
                  <button
                    type="button"
                    onClick={fetchApplications}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {loadingApps ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "↻ Load Meta Apps"}
                  </button>
                </div>
                
                <select
                  value={selectedApp}
                  onChange={(e) => {
                    setSelectedApp(e.target.value);
                    const matched = registeredApps.find(a => a.id === e.target.value);
                    if (matched?.object_store_url) setObjectStoreUrl(matched.object_store_url);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {registeredApps.length > 0 ? (
                    registeredApps.map((a: any) => (
                      <option key={a.id} value={a.id}>📱 {a.name} ({a.id})</option>
                    ))
                  ) : (
                    <>
                      <option value="whatsapp_automation_app">📱 WhatsApp Automation Pro (org.jisnu.wa)</option>
                      <option value="jisnu_crm_app">💼 JISNU CRM Mobile (org.jisnu.crm)</option>
                    </>
                  )}
                </select>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Object Store URL (Play Store / App Store link) *</label>
                  <input
                    type="text"
                    value={objectStoreUrl}
                    onChange={(e) => setObjectStoreUrl(e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 6. Budget (Advantage+ toggle & strategy) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">Budget</h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">Advantage+ on</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={cboEnabled}
                      onChange={(e) => setCboEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => setBudgetStrategyMode("CAMPAIGN")}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      budgetStrategyMode === "CAMPAIGN" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" checked={budgetStrategyMode === "CAMPAIGN"} readOnly className="mt-1 h-4 w-4 accent-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Campaign budget — Automatically distribute budget (Advantage+)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Maximizes total app installs across all ad sets.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setBudgetStrategyMode("ADSET")}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      budgetStrategyMode === "ADSET" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" checked={budgetStrategyMode === "ADSET"} readOnly className="mt-1 h-4 w-4 accent-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Ad set budget — Control per ad set</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Set individual limits for specific audiences or regions.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Budget mode</label>
                    <select
                      value={budgetMode}
                      onChange={(e: any) => setBudgetMode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="DAILY">Daily budget</option>
                      <option value="LIFETIME">Lifetime budget</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign bid strategy</label>
                  <select
                    value={bidStrategy}
                    onChange={(e) => setBidStrategy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HIGHEST_VOLUME">Highest volume (Max installs)</option>
                    <option value="COST_CAP">Cost per result goal</option>
                    <option value="BID_CAP">Bid cap</option>
                  </select>
                </div>
              </div>

              {/* 7 & 8. Frequency & A/B Test */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-xs">Campaign frequency control</h4>
                  <input
                    type="checkbox"
                    checked={frequencyControl}
                    onChange={(e) => setFrequencyControl(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-xs">A/B test</h4>
                  <input
                    type="checkbox"
                    checked={abTestEnabled}
                    onChange={(e) => setAbTestEnabled(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>
              </div>

              {/* 9. Special Ad Categories */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Special Ad Categories</h4>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="NONE">None — Standard Commercial App Ads</option>
                  <option value="CREDIT">Credit — Loans or credit cards</option>
                  <option value="EMPLOYMENT">Employment — Job offers &amp; hiring</option>
                  <option value="HOUSING">Housing — Real estate listings</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Issues &amp; Politics — Social causes</option>
                </select>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 1
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  Continue to Step 3: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: NEW APP PROMOTION AD SET */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                  Step 3 of 4
                </span>
                <h3 className="font-bold text-slate-900 text-sm pt-1">New App promotion Campaign → New App promotion Ad set</h3>
                <p className="text-xs text-slate-500">Configure app store, target country, attribution windows, and audience.</p>
              </div>

              {/* 1. Ad set name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Ad set name *</label>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  placeholder="New App promotion ad set"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. App store / Mobile app store */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">App store / Mobile app store</h4>
                <select
                  value={appStore}
                  onChange={(e: any) => setAppStore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="GOOGLE_PLAY">🤖 Google Play Store</option>
                  <option value="APPLE_APP_STORE">🍎 Apple App Store</option>
                  <option value="AMAZON_APPSTORE">📦 Amazon Appstore</option>
                </select>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Search App / Identity</label>
                  <input
                    type="text"
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    placeholder="Enter app name, app ID or exact app store URL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 3. Performance goal & Attribution */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Performance goal &amp; In-App Events</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Performance goal</label>
                    <select
                      value={performanceGoal}
                      onChange={(e: any) => setPerformanceGoal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="MAXIMIZE_INSTALLS">APP_INSTALLS — Maximise app installs</option>
                      <option value="MAXIMIZE_APP_EVENTS">OFFSITE_CONVERSIONS — In-app events (Purchase, etc.)</option>
                      <option value="MAXIMIZE_VALUE">VALUE — Maximise conversion value</option>
                      <option value="LINK_CLICKS">LINK_CLICKS — Store traffic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Attribution Window</label>
                    <select
                      value={attributionModel}
                      onChange={(e) => setAttributionModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="STANDARD">Standard (7-day click or 1-day view)</option>
                      <option value="1_DAY_CLICK">1-day click</option>
                      <option value="7_DAY_CLICK">7-day click</option>
                      <option value="1_DAY_VIEW">1-day view</option>
                    </select>
                  </div>
                </div>

                {performanceGoal === "MAXIMIZE_APP_EVENTS" && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 pt-2">
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-blue-600" /> In-App Custom Event Type
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Event Type (custom_event_type)</label>
                        <select
                          value={customEventType}
                          onChange={(e) => setCustomEventType(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                        >
                          <option value="PURCHASE">PURCHASE</option>
                          <option value="ADD_TO_CART">ADD_TO_CART</option>
                          <option value="COMPLETE_REGISTRATION">COMPLETE_REGISTRATION</option>
                          <option value="INITIATED_CHECKOUT">INITIATED_CHECKOUT</option>
                          <option value="ADD_PAYMENT_INFO">ADD_PAYMENT_INFO</option>
                          <option value="LEAD">LEAD</option>
                          <option value="SUBSCRIBE">SUBSCRIBE</option>
                          <option value="START_TRIAL">START_TRIAL</option>
                          <option value="LEVEL_ACHIEVED">LEVEL_ACHIEVED</option>
                          <option value="ACHIEVEMENT_UNLOCKED">ACHIEVEMENT_UNLOCKED</option>
                          <option value="SPENT_CREDITS">SPENT_CREDITS</option>
                          <option value="CONTENT_VIEW">CONTENT_VIEW</option>
                          <option value="SEARCH">SEARCH</option>
                          <option value="TUTORIAL_COMPLETION">TUTORIAL_COMPLETION</option>
                          <option value="RATE">RATE</option>
                          <option value="D2_RETENTION">D2_RETENTION</option>
                          <option value="D7_RETENTION">D7_RETENTION</option>
                          <option value="OTHER">OTHER (Custom Event String)</option>
                        </select>
                      </div>

                      {customEventType === "OTHER" && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Custom Event String (custom_event_str)</label>
                          <input
                            type="text"
                            value={customEventStr}
                            onChange={(e) => setCustomEventStr(e.target.value)}
                            placeholder="e.g. booked_consultation"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Audience Controls */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Audience Controls</h4>

                {/* Dynamic Geo Location Autocomplete from Graph API */}
                <div className="space-y-1.5 relative">
                  <label className="block text-[11px] font-bold text-slate-700">Locations (Inclusion)</label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                    {selectedLocations.map((loc, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold shadow-2xs">
                        📍 {loc}
                        <button
                          type="button"
                          onClick={() => setSelectedLocations(selectedLocations.filter((_, i) => i !== idx))}
                          className="hover:text-red-600 ml-1 text-slate-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={locQuery}
                      onChange={(e) => handleSearchLocations(e.target.value)}
                      onFocus={() => locQuery && setShowLocDropdown(true)}
                      className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 min-w-[140px]"
                      placeholder="Search Meta Geo Locations (e.g. India, Mumbai)..."
                    />
                    {searchingLoc && <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin shrink-0" />}
                  </div>

                  {/* Location Autocomplete Dropdown */}
                  {showLocDropdown && locResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {locResults.map((item: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => {
                            const displayName = item.name + (item.country_name ? `, ${item.country_name}` : "");
                            if (!selectedLocations.includes(displayName)) {
                              setSelectedLocations([...selectedLocations, displayName]);
                            }
                            setLocQuery("");
                            setShowLocDropdown(false);
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{item.type} {item.country_name ? `• ${item.country_name}` : ""}</p>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Add Location</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Min Age</label>
                    <input
                      type="number"
                      value={ageMin}
                      onChange={(e) => setAgeMin(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Age</label>
                    <input
                      type="number"
                      value={ageMax}
                      onChange={(e) => setAgeMax(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none"
                    >
                      <option value="ALL">All Genders</option>
                      <option value="MEN">Men</option>
                      <option value="WOMEN">Women</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Language (adlocale) Autocomplete */}
                <div className="space-y-1.5 relative">
                  <label className="block text-[11px] font-bold text-slate-700">Languages (Locales)</label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                    {selectedLanguages.map((lang, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold shadow-2xs">
                        🗣️ {lang === "ALL" ? "All Languages" : lang}
                        {lang !== "ALL" && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = selectedLanguages.filter((_, i) => i !== idx);
                              setSelectedLanguages(next.length === 0 ? ["ALL"] : next);
                            }}
                            className="hover:text-red-600 ml-1 text-slate-400 cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    <input
                      type="text"
                      value={langQuery}
                      onChange={(e) => handleSearchLanguages(e.target.value)}
                      onFocus={() => langQuery && setShowLangDropdown(true)}
                      className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 min-w-[140px]"
                      placeholder="Search Meta languages (e.g. English, Hindi)..."
                    />
                    {searchingLang && <Loader2 className="h-3.5 w-3.5 text-indigo-600 animate-spin shrink-0" />}
                  </div>

                  {/* Languages Autocomplete Dropdown */}
                  {showLangDropdown && langResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {langResults.map((item: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => {
                            const lName = item.name || item.key;
                            const cleaned = selectedLanguages.filter(l => l !== "ALL");
                            if (!cleaned.includes(lName)) {
                              setSelectedLanguages([...cleaned, lName]);
                            }
                            setLangQuery("");
                            setShowLangDropdown(false);
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-500">Meta Locale Key: {item.key}</p>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Add Language</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic Detailed Targeting Autocomplete */}
                <div className="space-y-1.5 relative">
                  <label className="block text-[11px] font-bold text-slate-700">Detailed Targeting (Interests, Behaviors)</label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                    {selectedInterests.map((interest, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                        🏷️ {interest.name}
                        <button
                          type="button"
                          onClick={() => {
                            const next = selectedInterests.filter((_, i) => i !== idx);
                            setSelectedInterests(next);
                            setDetailedTargeting(next.map(n => n.name).join(", "));
                          }}
                          className="hover:text-red-600 ml-1 text-slate-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={targetingQuery}
                      onChange={(e) => handleSearchTargeting(e.target.value)}
                      onFocus={() => targetingQuery && setShowTargetingDropdown(true)}
                      className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 min-w-[160px]"
                      placeholder="Search Meta App Interests (e.g. Mobile Gaming, SaaS)..."
                    />
                    {searchingTargeting && <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin shrink-0" />}
                  </div>

                  {/* Detailed Targeting Autocomplete Dropdown */}
                  {showTargetingDropdown && targetingResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {targetingResults.map((item: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (!selectedInterests.some(s => s.id === item.id)) {
                              const next = [...selectedInterests, item];
                              setSelectedInterests(next);
                              setDetailedTargeting(next.map(n => n.name).join(", "));
                            }
                            setTargetingQuery("");
                            setShowTargetingDropdown(false);
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{item.topic || item.type || "Interest"} {item.audience_size ? `• ~${(item.audience_size / 1000000).toFixed(1)}M size` : ""}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Add Spec</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 5, 6 & 7. Regulatory & Placements */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={securitiesDeclared}
                    onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 shrink-0"
                  />
                  <span>Policy and regulatory requirements (India) compliance verified.</span>
                </label>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs">Advantage+ placements</h4>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={advantagePlacements}
                      onChange={(e) => setAdvantagePlacements(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  Continue to Step 4: Ad Creative & Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NEW APP PROMOTION AD */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">New App promotion Campaign → New App promotion Ad set → New App promotion Ad</h3>
                </div>
              </div>

              {/* 1. Ad Name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Ad name *</label>
                <input
                  type="text"
                  required
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="New App promotion ad"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. Destination / App deep link */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Destination / App deep link</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { id: "APP", label: "App — Send people to your app" },
                    { id: "INSTANT_EXPERIENCE", label: "Instant Experience — Fast mobile UI" },
                    { id: "PLAYABLE_SOURCE", label: "Playable source — Play demo" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDestinationType(d.id as any)}
                      className={`p-3 rounded-2xl border font-bold text-left transition-all cursor-pointer ${destinationType === d.id ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Deferred deep link</label>
                  <input
                    type="text"
                    value={deferredDeepLink}
                    onChange={(e) => setDeferredDeepLink(e.target.value)}
                    placeholder="Enter the deferred deep link URL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Custom store listing</label>
                  <input
                    type="text"
                    value={customStoreListingId}
                    onChange={(e) => setCustomStoreListingId(e.target.value)}
                    placeholder="Enter custom store listing ID"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 3. Creative / Media */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Creative / Media</h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Download WhatsApp Automation App Today!"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Body Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    placeholder="Boost your business messaging efficiency by 10x with automated replies and bulk broadcasts."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Media Banner URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/app-banner.jpg"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("Fetched media from Meta Library!")}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Fetch Meta Library
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Call to Action (CTA) *</label>
                  <select
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="INSTALL_MOBILE_APP">INSTALL_MOBILE_APP — Install Now</option>
                    <option value="USE_MOBILE_APP">USE_MOBILE_APP — Use App</option>
                    <option value="USE_APP">USE_APP — Open App</option>
                    <option value="DOWNLOAD">DOWNLOAD — Download App</option>
                    <option value="LEARN_MORE">LEARN_MORE — Learn More</option>
                    <option value="SHOP_NOW">SHOP_NOW — Shop Now</option>
                    <option value="SIGN_UP">SIGN_UP — Sign Up</option>
                    <option value="PLAY_GAME">PLAY_GAME — Play Game</option>
                    <option value="WATCH_MORE">WATCH_MORE — Watch More</option>
                    <option value="BOOK_TRAVEL">BOOK_TRAVEL — Book Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Testimonial / Partner Text</label>
                  <textarea
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    placeholder="Add text from your partner..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4. Languages */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">Multi-language Creative</h4>
                  <input
                    type="checkbox"
                    checked={appPromoLanguagesEnabled}
                    onChange={(e) => setAppPromoLanguagesEnabled(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>

                {appPromoLanguagesEnabled && (
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <p className="text-slate-700 font-bold">Default: English</p>
                    <button
                      type="button"
                      onClick={() => setAdditionalLanguages([...additionalLanguages, "Spanish"])}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer"
                    >
                      + Add language
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Tracking */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Tracking</h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                    <input type="checkbox" checked={trackWebsiteEvents} onChange={(e) => setTrackWebsiteEvents(e.target.checked)} className="accent-blue-600" />
                    Website events (Pixel ID: <span className="font-mono text-blue-600 font-bold">{pixelId}</span>)
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                    <input type="checkbox" checked={trackAppEvents} onChange={(e) => setTrackAppEvents(e.target.checked)} className="accent-blue-600" />
                    App events (SDK Tracking)
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                    <input type="checkbox" checked={trackOfflineEvents} onChange={(e) => setTrackOfflineEvents(e.target.checked)} className="accent-blue-600" />
                    Offline events
                  </label>
                  <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-bold block pt-1">
                    About third-party reporting
                  </a>
                </div>
              </div>

              {/* 7. Legal terms */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs text-slate-500 shadow-2xs">
                <p>By clicking Publish Campaign Live, you agree to Meta's App Promotion Terms & Conditions.</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(3)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 3
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Campaign Live 🚀"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Live Ad Preview Panel */}
        <div className="w-80 bg-slate-50 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-200">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-600" /> Mobile App Preview
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Google Play Store</span>
            </div>

            {/* Mobile App Install Card Mockup */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden space-y-2.5 p-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                  📲
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">WhatsApp Automation App</p>
                  <p className="text-[10px] text-slate-400">Sponsored • Mobile App Store</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed">{primaryText}</p>

              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36">
                  <img src={mediaUrl} alt="App Ad Media" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">{headline}</p>
                  <p className="text-[9px] text-slate-500 truncate max-w-[150px]">Free • Ratings ⭐ 4.8</p>
                </div>
                <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-2xs">
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
