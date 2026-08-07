"use client";
import { useState } from "react";
import {
  X, Loader2, TrendingUp, Check, Globe, Sparkles, Smartphone, Zap, Search, ShieldCheck
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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Step 1: Campaign Level
  const [campName, setCampName] = useState("New App Promotion campaign");
  const [dailyBudget, setDailyBudget] = useState("2000");
  const [cboEnabled, setCboEnabled] = useState(true);
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");

  // Step 2: Ad Set Level (App Promotion specific)
  const [adSetName, setAdSetName] = useState("New App Promotion ad set");
  const [appStore, setAppStore] = useState<"GOOGLE_PLAY" | "APPLE_APP_STORE">("GOOGLE_PLAY");
  const [appCountry, setAppCountry] = useState("India");
  const [appNameSearch, setAppNameSearch] = useState("com.example.app");
  const [performanceGoal, setPerformanceGoal] = useState<"APP_INSTALLS" | "APP_EVENTS">("APP_INSTALLS");
  const [costPerResult, setCostPerResult] = useState("");
  const [attributionModel, setAttributionModel] = useState("7_DAY_CLICK_1_DAY_VIEW");
  const [valueRules, setValueRules] = useState(false);
  const [securitiesDeclared, setSecuritiesDeclared] = useState(false);

  // Step 3: Ad Level (App Creative)
  const [adName, setAdName] = useState("New App Promotion ad");
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [deferredDeepLink, setDeferredDeepLink] = useState("");
  const [customStoreListingId, setCustomStoreListingId] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [aiMediaEnabled, setAiMediaEnabled] = useState(false);
  const [testimonialText, setTestimonialText] = useState("");
  const [languagesEnabled, setLanguagesEnabled] = useState(false);

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
          appStore,
          appCountry,
          appId: appNameSearch,
          specialAdCategory,
          adSetName,
          performanceGoal,
          adName,
          facebookPageId,
          deferredDeepLink,
          customStoreListingId,
          creativeHeadline: headline || "Install Our App Today",
          creativeBody: primaryText || "Download now for exclusive features and rewards.",
          creativeMediaUrl: mediaUrl || "https://example.com/app-banner.jpg",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "App Promotion Campaign publish failed.");

      showToast("App Promotion Campaign created & published live! 📲");
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

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-pink-400 font-mono uppercase tracking-wider">Meta Ads Manager • App Promotion Workspace</span>
            <h1 className="font-bold text-slate-100 text-sm">{campName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button onClick={() => setActiveStep(1)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 1 ? "bg-pink-500 text-slate-950" : "text-slate-400"}`}>
            1. Campaign Level
          </button>
          <button onClick={() => setActiveStep(2)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 2 ? "bg-pink-500 text-slate-950" : "text-slate-400"}`}>
            2. Ad Set Level
          </button>
          <button onClick={() => setActiveStep(3)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 3 ? "bg-pink-500 text-slate-950" : "text-slate-400"}`}>
            3. Ad Level
          </button>
        </div>
      </header>

      {/* Body Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto border-r border-slate-800">

          {/* STEP 1: CAMPAIGN LEVEL */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-200">Campaign name</label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Advantage+ Campaign Budget</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Budget (₹)</label>
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
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setActiveStep(2)} className="px-6 py-2.5 rounded-xl bg-pink-500 text-slate-950 text-xs font-bold shadow-lg">
                  Proceed to Step 2: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AD SET LEVEL */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-bold text-slate-200 mb-1">Ad set name</label>
                <input
                  type="text"
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold"
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
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">App Country Target</label>
                    <input
                      type="text"
                      value={appCountry}
                      onChange={(e) => setAppCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Application Name or Package ID</label>
                  <input
                    type="text"
                    value={appNameSearch}
                    onChange={(e) => setAppNameSearch(e.target.value)}
                    placeholder="com.yourcompany.app"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Performance Goal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Performance Goal</h4>
                <select
                  value={performanceGoal}
                  onChange={(e: any) => setPerformanceGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                >
                  <option value="APP_INSTALLS">App Installs</option>
                  <option value="APP_EVENTS">App In-App Events</option>
                </select>
              </div>

              {/* Securities Declaration */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={securitiesDeclared}
                  onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-pink-500 shrink-0"
                />
                <span className="text-xs text-slate-300">Declare App Store financial security compliance and SDK tracking consent.</span>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 1
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-pink-500 text-slate-950 text-xs font-bold shadow-lg">
                  Proceed to Step 3: Ad →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AD LEVEL */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-bold text-slate-200 mb-1">Ad name</label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Deep Link & Store Listing</h4>
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
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">App Install Creative</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Install Our App Today"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    placeholder="Download now for instant rewards..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
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

        <div className="w-80 bg-slate-950 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-pink-400" /> App Install Preview
            </h4>
            <p className="text-xs text-slate-400">Target App: {appNameSearch}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
