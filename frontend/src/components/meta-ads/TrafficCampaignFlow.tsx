"use client";
import { useState } from "react";
import {
  X, Loader2, MousePointerClick, Settings, ChevronRight, Check,
  Globe, Info, Sparkles, ArrowUpRight, ArrowLeft, Phone, Zap
} from "lucide-react";

interface TrafficCampaignFlowProps {
  orgId: string;
  backendUrl: string;
  fetchedPages: any[];
  fetchedIgAccounts: any[];
  fetchedWaNumbers: any[];
  onClose: () => void;
  onPublished: () => void;
}

export default function TrafficCampaignFlow({
  orgId,
  backendUrl,
  fetchedPages,
  fetchedIgAccounts,
  fetchedWaNumbers,
  onClose,
  onPublished,
}: TrafficCampaignFlowProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Sub-step inside Step 1 (Campaign level)
  const [trafficSubStep, setTrafficSubStep] = useState<"CHOICE" | "CONFIG">("CHOICE");
  const [trafficPresetMode, setTrafficPresetMode] = useState<"tailored" | "manual">("tailored");

  // Step 1: Campaign Level State
  const [campName, setCampName] = useState("New Traffic campaign");
  const [trafficLiveVideo, setTrafficLiveVideo] = useState(false);
  const [trafficLiveVideoLocation, setTrafficLiveVideoLocation] = useState("FACEBOOK");
  const [trafficBudgetStrategy, setTrafficBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [trafficShareBudget, setTrafficShareBudget] = useState(false);
  const [trafficAbTest, setTrafficAbTest] = useState(false);
  const [trafficTestVariable, setTrafficTestVariable] = useState("CREATIVE");
  const [trafficTestDuration, setTrafficTestDuration] = useState("7_DAYS");
  const [trafficTestMetric, setTrafficTestMetric] = useState("COST_PER_LINK_CLICK");
  const [dailyBudget, setDailyBudget] = useState("1000");
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [trafficShowMoreNameOptions, setTrafficShowMoreNameOptions] = useState(false);
  const [trafficShowMoreDetailsOptions, setTrafficShowMoreDetailsOptions] = useState(false);

  // Step 2: Ad Set Level State
  const [adSetName, setAdSetName] = useState("New Traffic ad set");
  const [destinationType, setDestinationType] = useState<"WEBSITE" | "APP" | "MESSENGER" | "WHATSAPP" | "CALLS">("WEBSITE");
  const [trafficPerformanceGoal, setTrafficPerformanceGoal] = useState<"MAXIMIZE_LINK_CLICKS" | "MAXIMIZE_LANDING_PAGE_VIEWS">("MAXIMIZE_LINK_CLICKS");
  const [trafficCostPerResult, setTrafficCostPerResult] = useState("");

  // Step 3: Ad Level State
  const [adName, setAdName] = useState("New Traffic ad");
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccountId, setInstagramAccountId] = useState(fetchedIgAccounts[0]?.id || "");
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com");
  const [callToAction, setCallToAction] = useState("LEARN_MORE");

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
          objective: "OUTCOME_TRAFFIC",
          dailyBudget: Number(dailyBudget),
          specialAdCategory,
          trafficPresetMode,
          liveVideoAd: trafficLiveVideo,
          adSetName,
          destinationType,
          performanceGoal: trafficPerformanceGoal,
          costPerResult: trafficCostPerResult,
          adName,
          facebookPageId,
          instagramAccountId,
          creativeHeadline: headline || "Visit Our Website",
          creativeBody: primaryText || "Click below to explore our latest offerings.",
          creativeDescription: description,
          creativeMediaUrl: mediaUrl || "https://example.com/banner.jpg",
          callToAction,
          websiteUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Traffic Campaign publish failed.");

      showToast("Traffic Campaign created & published live! 🚀");
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
        <div className="absolute top-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/50 text-sky-300 text-xs font-bold shadow-2xl">
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
            <span className="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider">Meta Ads Manager • Traffic Campaign Workspace</span>
            <h1 className="font-bold text-slate-100 text-sm">{campName}</h1>
          </div>
        </div>

        {trafficSubStep === "CONFIG" && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button onClick={() => setActiveStep(1)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 1 ? "bg-sky-500 text-slate-950" : "text-slate-400"}`}>
              1. Campaign Level
            </button>
            <button onClick={() => setActiveStep(2)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 2 ? "bg-sky-500 text-slate-950" : "text-slate-400"}`}>
              2. Ad Set Level
            </button>
            <button onClick={() => setActiveStep(3)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 3 ? "bg-sky-500 text-slate-950" : "text-slate-400"}`}>
              3. Ad Level
            </button>
          </div>
        )}
      </header>

      {/* Body Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto border-r border-slate-800">

          {/* 2A. CHOICE SCREEN */}
          {trafficSubStep === "CHOICE" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Step 2: Configure TRAFFIC Campaign Parameters</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Parameters tailored specifically for your TRAFFIC campaign setup.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Choose a campaign setup</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Create your traffic campaign using a tailored and streamlined setup, or manually build your campaign. Suggestions may vary based on your recent ad account activity.
                  </p>
                </div>

                {/* Option 1: Tailored web traffic campaign */}
                <div
                  onClick={() => {
                    setTrafficPresetMode("tailored");
                    setTrafficSubStep("CONFIG");
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    trafficPresetMode === "tailored"
                      ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="trafficChoice"
                      checked={trafficPresetMode === "tailored"}
                      readOnly
                      className="mt-1 h-4 w-4 text-sky-500"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                      <MousePointerClick className="h-6 w-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div>
                        <h5 className="font-bold text-slate-100 text-sm">Tailored web traffic campaign</h5>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          Quickly create a campaign optimised to help get more web traffic at the best value. Preset settings include Advantage+ placements, highest volume bid strategy and more.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">Streamlined</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">Tailored</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] font-semibold text-sky-400">Best practices</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option 2: Manual traffic campaign */}
                <div
                  onClick={() => {
                    setTrafficPresetMode("manual");
                    setTrafficSubStep("CONFIG");
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    trafficPresetMode === "manual"
                      ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="trafficChoice"
                        checked={trafficPresetMode === "manual"}
                        readOnly
                        className="h-4 w-4 text-sky-500"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                        <Settings className="h-6 w-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-100 text-sm">Manual traffic campaign</h5>
                        <p className="text-xs text-slate-400 mt-0.5">Create a traffic campaign from scratch for finer control over all settings.</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
                      Configure →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2B. CONFIG SCREEN */}
          {trafficSubStep === "CONFIG" && activeStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <button type="button" onClick={() => setTrafficSubStep("CHOICE")} className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mb-1">
                    ← Change campaign setup
                  </button>
                  <h3 className="font-bold text-slate-100 text-sm">New Traffic campaign</h3>
                  <p className="text-xs text-slate-400 mt-0.5">1 Ad set • 1 Ad • {trafficPresetMode === "tailored" ? "Tailored" : "Manual"} setup mode</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">In draft</span>
                  <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
                </div>
              </div>

              {/* Card 1: Campaign Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                  <h4 className="font-bold text-slate-100 text-xs">Campaign name</h4>
                </div>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New Traffic campaign"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setTrafficShowMoreNameOptions(!trafficShowMoreNameOptions)}
                  className="text-xs text-sky-400 hover:underline font-semibold"
                >
                  {trafficShowMoreNameOptions ? "Hide details" : "Show more options ▾"}
                </button>
              </div>

              {/* Card 2: Live Video Ad */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${trafficLiveVideo ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}`}>
                        {trafficLiveVideo ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={trafficLiveVideo}
                      onChange={(e) => setTrafficLiveVideo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {trafficLiveVideo && (
                  <div className="pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                    <h5 className="font-bold text-slate-200 text-xs">Live video location</h5>
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-2.5">
                      <input type="radio" checked={trafficLiveVideoLocation === "FACEBOOK"} readOnly className="accent-sky-500" />
                      <span className="text-xs font-bold text-slate-100">Facebook</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Campaign Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                  <h4 className="font-bold text-slate-100 text-xs">Campaign details</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">Buying type</label>
                    <p className="font-bold text-slate-200 mt-0.5">Auction</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">Campaign objective</label>
                    <p className="font-bold text-slate-200 mt-0.5">Traffic</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrafficShowMoreDetailsOptions(!trafficShowMoreDetailsOptions)}
                    className="text-xs text-sky-400 hover:underline font-semibold"
                  >
                    {trafficShowMoreDetailsOptions ? "Hide details" : "Show more options ▾"}
                  </button>
                </div>
              </div>

              {/* Card 4: Budget */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                  <h4 className="font-bold text-slate-100 text-xs">Budget</h4>
                </div>
                <div className="space-y-2">
                  <div
                    onClick={() => setTrafficBudgetStrategy("CAMPAIGN")}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 ${
                      trafficBudgetStrategy === "CAMPAIGN" ? "bg-sky-500/10 border-sky-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <input type="radio" checked={trafficBudgetStrategy === "CAMPAIGN"} readOnly className="mt-1 h-4 w-4 text-sky-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-100">Campaign budget (Advantage+ budget)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Automatically distribute budget to best opportunities.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setTrafficBudgetStrategy("ADSET")}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 ${
                      trafficBudgetStrategy === "ADSET" ? "bg-sky-500/10 border-sky-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <input type="radio" checked={trafficBudgetStrategy === "ADSET"} readOnly className="mt-1 h-4 w-4 text-sky-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-100">Ad set budget</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Set different bid strategies or budget schedules per ad set.</p>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={trafficShareBudget}
                    onChange={(e) => setTrafficShareBudget(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                  />
                  Share up to 20% of your budget with other ad sets
                </label>
              </div>

              {/* Card 5: A/B Test */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                    <h4 className="font-bold text-slate-100 text-xs">A/B test</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${trafficAbTest ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}`}>
                      {trafficAbTest ? "On" : "Off"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={trafficAbTest}
                      onChange={(e) => setTrafficAbTest(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {trafficAbTest && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">What would you like to test?</label>
                      <select
                        value={trafficTestVariable}
                        onChange={(e) => setTrafficTestVariable(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        <option value="CREATIVE">Creative</option>
                        <option value="AUDIENCE">Audience</option>
                        <option value="PLACEMENT">Placement</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">How long should the test run?</label>
                      <select
                        value={trafficTestDuration}
                        onChange={(e) => setTrafficTestDuration(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        <option value="7_DAYS">7 days</option>
                        <option value="3_DAYS">3 days</option>
                        <option value="5_DAYS">5 days</option>
                        <option value="14_DAYS">14 days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">How do you want to compare performance?</label>
                      <select
                        value={trafficTestMetric}
                        onChange={(e) => setTrafficTestMetric(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        <option value="COST_PER_LINK_CLICK">Cost per link click</option>
                        <option value="COST_PER_LANDING_PAGE_VIEW">Cost per landing page view</option>
                        <option value="COST_PER_RESULT">Cost per result</option>
                        <option value="CPM">Cost per 1,000 impressions (CPM)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 6: Special Ad Categories */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="NONE">Declare category if applicable</option>
                  <option value="CREDIT">Financial products and services</option>
                  <option value="EMPLOYMENT">Employment</option>
                  <option value="HOUSING">Housing</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Social issues, elections or politics</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setActiveStep(2)} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                  Proceed to Step 2: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AD SET LEVEL */}
          {trafficSubStep === "CONFIG" && activeStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-bold text-slate-200 mb-1">Ad set name</label>
                <input
                  type="text"
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Destination Type</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "WEBSITE", label: "Website" },
                    { id: "APP", label: "App" },
                    { id: "MESSENGER", label: "Messenger / WhatsApp" },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setDestinationType(loc.id as any)}
                      className={`p-3 rounded-xl border text-xs font-semibold ${
                        destinationType === loc.id ? "bg-sky-500/10 border-sky-500/60 text-sky-300 font-bold" : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Performance Goal</h4>
                <select
                  value={trafficPerformanceGoal}
                  onChange={(e: any) => setTrafficPerformanceGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                >
                  <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                  <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                </select>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 1
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                  Proceed to Step 3: Ad →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AD LEVEL */}
          {trafficSubStep === "CONFIG" && activeStep === 3 && (
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
                <h4 className="font-bold text-slate-200 text-xs">Identity</h4>
                <select
                  value={facebookPageId}
                  onChange={(e) => setFacebookPageId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                >
                  {fetchedPages.map((p) => (
                    <option key={p.id} value={p.id}>📄 {p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Ad Creative & Destination URL</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Visit Our Official Store Today"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    placeholder="Discover our new collection online..."
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
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Live Traffic Campaign 🚀"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Panel Preview */}
        <div className="w-80 bg-slate-950 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <MousePointerClick className="h-4 w-4 text-sky-400" /> Traffic Live Preview
            </h4>
            <p className="text-xs text-slate-400">Destination: {websiteUrl}</p>
            <p className="text-xs font-semibold text-sky-300">Goal: {trafficPerformanceGoal}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
