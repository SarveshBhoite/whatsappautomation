"use client";
import { useState } from "react";
import {
  X, Loader2, MousePointerClick, Settings, ChevronRight, Check,
  Globe, Info, Sparkles, ArrowUpRight, ArrowLeft, Phone, Zap, Eye, MessageSquare, Plus, ExternalLink, HelpCircle
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
  // Current active step (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2);

  // Sub-step inside Step 2 (CHOICE vs CONFIG)
  const [trafficSubStep, setTrafficSubStep] = useState<"CHOICE" | "CONFIG">("CHOICE");
  const [trafficPresetMode, setTrafficPresetMode] = useState<"tailored" | "manual">("tailored");

  // STEP 2: Campaign Level State
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

  // Tailored Mode Specific Inputs
  const [tailoredHeadline, setTailoredHeadline] = useState("Visit Our Website for Exclusive Offers!");
  const [tailoredUrl, setTailoredUrl] = useState("https://jisnudigital.com");

  // STEP 3: Ad Set Level State
  const [adSetName, setAdSetName] = useState("New Traffic ad set");
  const [destinationType, setDestinationType] = useState<"WEBSITE" | "APP" | "MESSENGER" | "WHATSAPP" | "CALLS">("WEBSITE");
  const [trafficPerformanceGoal, setTrafficPerformanceGoal] = useState("MAXIMIZE_LINK_CLICKS");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [locationInclusion, setLocationInclusion] = useState("India");
  const [excludeAudience, setExcludeAudience] = useState("");
  const [language, setLanguage] = useState("ALL");
  const [customAudience, setCustomAudience] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("ALL");
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [advantagePlacements, setAdvantagePlacements] = useState(true);
  const [brandSuitability, setBrandSuitability] = useState("STANDARD");
  const [showAudienceSize, setShowAudienceSize] = useState(true);
  const [showBrandSuitability, setShowBrandSuitability] = useState(false);

  // STEP 4: Ad Level State
  const [adName, setAdName] = useState("New Traffic ad");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [showPartnershipCodeModal, setShowPartnershipCodeModal] = useState(false);
  const [showSelectPartnershipModal, setShowSelectPartnershipModal] = useState(false);
  const [partnershipCode, setPartnershipCode] = useState("");

  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccount, setInstagramAccount] = useState(fetchedIgAccounts[0]?.username || "@jisnudigital");
  const [whatsappPhone, setWhatsappPhone] = useState(fetchedWaNumbers[0]?.phoneNumber || "+91 9876543210");
  const [adSetupMode, setAdSetupMode] = useState<"CREATE" | "EXISTING">("CREATE");
  const [adFormat, setAdFormat] = useState<"SINGLE" | "CAROUSEL">("SINGLE");
  const [multiAdvertiser, setMultiAdvertiser] = useState(true);
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1557804506-669a67965ba0");
  const [aiMedia, setAiMedia] = useState(false);
  const [primaryText, setPrimaryText] = useState("Drive qualified traffic directly to your website or WhatsApp channel.");
  const [headline, setHeadline] = useState("Explore Our Exclusive Online Deals");
  const [description, setDescription] = useState("Click below to view full details and claims.");
  const [callToAction, setCallToAction] = useState("LEARN_MORE");
  const [adDestinationRadio, setAdDestinationRadio] = useState<"INSTANT" | "WEBSITE" | "CALL" | "MESSAGING">("WEBSITE");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com");
  const [adsDataSharing, setAdsDataSharing] = useState(true);

  // Chat Conversations Template
  const [chatGreeting, setChatGreeting] = useState("Hi! Thanks for clicking our traffic ad. How can we help you today?");
  const [q1, setQ1] = useState("Can I learn more about your business?");
  const [q2, setQ2] = useState("Is anyone available to chat?");
  const [q3, setQ3] = useState("Where are you located?");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Tracking
  const [pixelId, setPixelId] = useState("189283719283");
  const [urlParams, setUrlParams] = useState("utm_source=facebook&utm_medium=cpc&utm_campaign=traffic");
  const [showUtmModal, setShowUtmModal] = useState(false);

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
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns/traffic`, {
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
          liveVideoLocation: trafficLiveVideoLocation,
          budgetStrategy: trafficBudgetStrategy,
          abTest: trafficAbTest,
          abTestVariable: trafficTestVariable,
          abTestDuration: trafficTestDuration,
          abTestMetric: trafficTestMetric,
          adSetName,
          destinationType,
          performanceGoal: trafficPerformanceGoal,
          budgetMode,
          startDate,
          endDate,
          locationInclusion,
          ageMin,
          ageMax,
          gender,
          detailedTargeting,
          advantagePlacements,
          brandSuitability,
          adName,
          partnershipAd,
          partnershipCode,
          facebookPageId,
          instagramAccount,
          whatsappPhone,
          adSetupMode,
          adFormat,
          multiAdvertiser,
          creativeHeadline: headline,
          creativeBody: primaryText,
          creativeDescription: description,
          creativeMediaUrl: mediaUrl,
          aiMedia,
          callToAction,
          adDestinationRadio,
          websiteUrl,
          chatGreeting,
          pixelId,
          urlParams,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Traffic Campaign publish failed.");

      showToast("Traffic Campaign Created & Published Live! 🚀");
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

      {/* Header Stepper Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase">
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
          <button onClick={() => setActiveStep(2)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 2 ? "bg-sky-500 text-slate-950" : "text-slate-400"}`}>
            2. Campaign Parameters
          </button>
          <button onClick={() => setActiveStep(3)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 3 ? "bg-sky-500 text-slate-950" : "text-slate-400"}`}>
            3. Ad Set Level
          </button>
          <button onClick={() => setActiveStep(4)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 4 ? "bg-sky-500 text-slate-950" : "text-slate-400"}`}>
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
              <MousePointerClick className="h-10 w-10 text-sky-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-100">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selected: <span className="text-sky-400 font-bold">Traffic (OUTCOME_TRAFFIC)</span>
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-sky-400" /> Traffic Preview
                  </h4>
                  <a
                    href="https://www.facebook.com/business/help/1438417719786914"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    About campaign objectives <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300">
                  Send people to a destination, such as your website, shop, landing page, or WhatsApp chat.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Link clicks", "Landing page views", "Messenger and WhatsApp", "Calls"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-semibold">
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
                  onClick={() => {
                    setActiveStep(2);
                    setTrafficSubStep("CHOICE");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  Continue → Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE TRAFFIC CAMPAIGN PARAMETERS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">

              {/* 2A. SUB-STEP CHOICE */}
              {trafficSubStep === "CHOICE" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1 mb-1"
                      >
                        ← Change Objective
                      </button>
                      <h3 className="font-bold text-slate-100 text-sm">Step 2: Configure TRAFFIC Campaign Parameters</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Parameters tailored specifically for your TRAFFIC campaign setup.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
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

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                      ← Back to Step 1
                    </button>
                    <button onClick={() => setTrafficSubStep("CONFIG")} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                      Continue to Configuration →
                    </button>
                  </div>
                </div>
              )}

              {/* 2B. SUB-STEP CONFIG */}
              {trafficSubStep === "CONFIG" && (
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
                          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">f</span> Facebook
                          </span>
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
                        <label className="block text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          Campaign objective <Info className="h-3 w-3 text-slate-500" />
                        </label>
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
                      <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                        Budget <Info className="h-3.5 w-3.5 text-slate-500" />
                      </h4>
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
                          <p className="text-xs font-bold text-slate-100">Campaign budget (Advantage+ campaign budget)</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Automatically distribute your budget across ad sets to get more results.{" "}
                            <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                              About campaign budget
                            </a>
                          </p>
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
                          <p className="text-[11px] text-slate-400 mt-0.5">Set different bid strategies or budget schedules for each ad set.</p>
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

                    <p className="text-[11px] text-slate-400">Campaign bid strategy: <span className="font-bold text-slate-200">Highest volume</span></p>
                  </div>

                  {/* Card 5: A/B test */}
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
                    <p className="text-[11px] text-slate-400">
                      Help improve ad performance by comparing versions to see what works best.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                        About A/B tests
                      </a>
                    </p>

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
                          <p className="text-[10px] text-slate-400 mb-1">Your test will run for this many days or until your ad set has ended.</p>
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
                          <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                            How do you want to compare performance? <Info className="h-3 w-3 text-slate-500" />
                          </label>
                          <select
                            value={trafficTestMetric}
                            onChange={(e) => setTrafficTestMetric(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                          >
                            <option value="COST_PER_POST_ENGAGEMENT">Cost per post engagement</option>
                            <option value="COST_PER_LINK_CLICK">Cost per link click</option>
                            <option value="COST_PER_RESULT">Cost per result</option>
                            <option value="COST_PER_LANDING_PAGE_VIEW">Cost per landing page view</option>
                            <option value="COST_PER_1000_REACHED">Cost per 1,000 people reached</option>
                            <option value="COST_PER_THRUPLAY">Cost per ThruPlay</option>
                            <option value="COST_PER_MESSAGING">Cost per messaging conversation started</option>
                            <option value="COST_PER_LEAD">Cost per lead</option>
                            <option value="COST_PER_PURCHASE">Cost per purchase</option>
                            <option value="CPM">Cost per 1,000 impressions (CPM)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 6: Special Ad Categories */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">✓</div>
                      <h4 className="font-bold text-slate-100 text-xs">Special Ad Categories</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                        About Special Ad Categories
                      </a>
                    </p>
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

                  {/* Tailored Path Additional Section */}
                  {trafficPresetMode === "tailored" && (
                    <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-3">
                      <h4 className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> Tailored Web Traffic Quick Setup
                      </h4>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                        <input
                          type="text"
                          value={tailoredHeadline}
                          onChange={(e) => setTailoredHeadline(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Website URL</label>
                        <input
                          type="text"
                          value={tailoredUrl}
                          onChange={(e) => setTailoredUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setTrafficSubStep("CHOICE")} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                      ← Back to Setup Choice
                    </button>
                    <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                      Continue to Step 3: Ad Set →
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: AD SET LEVEL (TRAFFIC) */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 3 of 4
                  </span>
                  <span className="text-xs text-sky-400 font-semibold">In Draft</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm pt-1">{campName} → New Traffic ad set</h3>
                <p className="text-xs text-slate-400">Configure destination, performance goals, placements, and audience targeting.</p>
              </div>

              {/* Ad Set Name */}
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

              {/* Conversion Destination */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Conversion / Destination Location</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "WEBSITE", label: "Website" },
                    { id: "APP", label: "App" },
                    { id: "MESSENGER", label: "Messenger / WhatsApp" },
                    { id: "CALLS", label: "Calls" },
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

              {/* Performance Goal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">Performance Goal</h4>
                <select
                  value={trafficPerformanceGoal}
                  onChange={(e) => setTrafficPerformanceGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                >
                  <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                  <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                  <option value="MAXIMIZE_CONVERSATIONS">Maximise number of conversations</option>
                  <option value="MAXIMIZE_DAILY_UNIQUE_REACH">Maximise daily unique reach</option>
                  <option value="MAXIMIZE_IMPRESSIONS">Maximise number of impressions</option>
                </select>

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facebook Page</label>
                  <select
                    value={facebookPageId}
                    onChange={(e) => setFacebookPageId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {fetchedPages.map((p) => (
                      <option key={p.id} value={p.id}>📄 {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget & Schedule */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Budget & schedule</h4>
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Budget Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Audience Controls */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Audience Controls</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Locations (Search city or country e.g. Mumbai, Delhi, United States)</label>
                  <input
                    type="text"
                    value={locationInclusion}
                    onChange={(e) => setLocationInclusion(e.target.value)}
                    placeholder="Search city or country..."
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
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
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Detailed Targeting (Demographics, Interests, Behaviours)</label>
                  <input
                    type="text"
                    value={detailedTargeting}
                    onChange={(e) => setDetailedTargeting(e.target.value)}
                    placeholder="e.g. Technology, Online Shopping..."
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Placements & Brand Suitability */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Advantage+ placements</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Maximize link clicks across Meta network.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={advantagePlacements}
                    onChange={(e) => setAdvantagePlacements(e.target.checked)}
                    className="accent-sky-500 h-4 w-4"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 text-xs">Show estimated audience size</h4>
                  <input
                    type="checkbox"
                    checked={showAudienceSize}
                    onChange={(e) => setShowAudienceSize(e.target.checked)}
                    className="accent-sky-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* Campaign Score Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    100
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Campaign score: 100/100</h4>
                    <p className="text-[11px] text-slate-400">Broad Audience configuration active.</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 4: Ad Creative & Live Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AD CREATIVE, IDENTITY & LIVE PREVIEW (TRAFFIC) */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">New Traffic ad</h3>
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
                  placeholder="New Traffic ad"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* 2. Partnership Ad Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Partnership ad</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Run ads with creators, brands and other businesses.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                        Go to Partnership Ads Hub
                      </a>
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={partnershipAd}
                    onChange={(e) => setPartnershipAd(e.target.checked)}
                    className="accent-sky-500 h-4 w-4"
                  />
                </div>

                {partnershipAd && (
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowPartnershipCodeModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold"
                    >
                      Enter ad code or post info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSelectPartnershipModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Select partnership
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Identity */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Identity</h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facebook Page *</label>
                    <select
                      value={facebookPageId}
                      onChange={(e) => setFacebookPageId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                    >
                      {fetchedPages.map((p) => (
                        <option key={p.id} value={p.id}>📄 {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instagram Profile</label>
                    <input
                      type="text"
                      value={instagramAccount}
                      onChange={(e) => setInstagramAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Ad Setup */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Ad setup</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdSetupMode("CREATE")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${adSetupMode === "CREATE" ? "bg-sky-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
                  >
                    Create ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdSetupMode("EXISTING")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${adSetupMode === "EXISTING" ? "bg-sky-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
                  >
                    Use existing post
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setAdFormat("SINGLE")}
                      className={`p-3 rounded-xl border cursor-pointer ${adFormat === "SINGLE" ? "bg-sky-500/10 border-sky-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      <p className="text-xs font-bold">Single image or video</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">One image or video, or slideshow.</p>
                    </div>

                    <div
                      onClick={() => setAdFormat("CAROUSEL")}
                      className={`p-3 rounded-xl border cursor-pointer ${adFormat === "CAROUSEL" ? "bg-sky-500/10 border-sky-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      <p className="text-xs font-bold">Carousel</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">2 or more scrollable images or videos.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Multi-advertiser ads</h4>
                    <p className="text-[10px] text-slate-400">Your ad can appear with others in the same ad unit.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={multiAdvertiser}
                    onChange={(e) => setMultiAdvertiser(e.target.checked)}
                    className="accent-sky-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* 5. Ad Creative */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Ad creative</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">* Media</label>
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
                      Fetch Meta Media Library
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiMedia}
                    onChange={(e) => setAiMedia(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                  />
                  Ad includes media created or edited with AI
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Chat with us"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Call to Action</label>
                    <select
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    >
                      <option value="SEND_WHATSAPP_MESSAGE">Send WhatsApp message</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="CONTACT_US">Contact Us</option>
                      <option value="SHOP_NOW">Shop Now</option>
                      <option value="BOOK_NOW">Book Now</option>
                      <option value="GET_OFFER">Get Offer</option>
                      <option value="SIGN_UP">Sign Up</option>
                    </select>
                  </div>
                </div>

                {callToAction === "SEND_WHATSAPP_MESSAGE" && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    📱 Connected WhatsApp Number: <span className="font-bold">{whatsappPhone}</span>. Edit in Page settings. Active on WhatsApp.
                  </div>
                )}
              </div>

              {/* 6. Destination Radios */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Destination</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: "INSTANT", label: "Instant Experience" },
                    { id: "WEBSITE", label: "Website" },
                    { id: "CALL", label: "Call" },
                    { id: "MESSAGING", label: "Messaging apps" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setAdDestinationRadio(d.id as any)}
                      className={`p-2.5 rounded-xl border font-bold text-center ${adDestinationRadio === d.id ? "bg-sky-500/10 border-sky-500/60 text-sky-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {adDestinationRadio === "MESSAGING" && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <p className="text-slate-300 font-semibold">Messenger: Connected Page</p>
                    <p className="text-slate-300 font-semibold">Instagram: {instagramAccount}</p>
                    <p className="text-slate-300 font-semibold">WhatsApp Number:</p>
                    <select
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="+91 9876543210">+91 9876543210</option>
                      <option value="+91 77099 36965">+91 77099 36965</option>
                      <option value="NEW">+ Connect new WhatsApp number</option>
                    </select>

                    <label className="flex items-center gap-2 text-slate-300 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adsDataSharing}
                        onChange={(e) => setAdsDataSharing(e.target.checked)}
                        className="accent-sky-500"
                      />
                      Enable Ads Data Sharing with Messenger, Instagram & WhatsApp
                    </label>
                  </div>
                )}
              </div>

              {/* 7. Conversations Chat Template */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    Conversations Template <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">🤖 AI Badge</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="text-xs font-bold text-sky-400 hover:underline"
                  >
                    Edit template
                  </button>
                </div>
                <p className="text-[11px] text-sky-300 font-semibold">💡 You could get 7% more messages by adding recommended settings (+7%)</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200">Greeting: {chatGreeting}</p>
                  <p className="text-[11px] text-slate-400">Q1: {q1}</p>
                  <p className="text-[11px] text-slate-400">Q2: {q2}</p>
                  <p className="text-[11px] text-slate-400">Q3: {q3}</p>
                </div>
              </div>

              {/* 8. Tracking */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Tracking</h4>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300">Website events: Active Dataset • Pixel ID <span className="font-mono text-sky-400 font-bold">{pixelId}</span></p>
                  <p className="text-slate-400">App events: Not configured</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">URL Parameters: {urlParams}</span>
                    <button
                      type="button"
                      onClick={() => setShowUtmModal(true)}
                      className="text-xs font-bold text-sky-400 hover:underline"
                    >
                      Build a URL parameter
                    </button>
                  </div>
                </div>
              </div>

              {/* 9 & 10 Legal & Preview Note */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400">
                <p>By clicking Publish Campaign Live, you acknowledge that your use of Meta's ad tools is subject to Terms and Conditions.</p>
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
                <Eye className="h-4 w-4 text-sky-400" /> Ad Live Preview
              </h4>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">100/100</span>
            </div>

            {/* Mobile Ad Card Mockup */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden space-y-2 p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
                  📄
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">JISNU Digital Solutions</p>
                  <p className="text-[10px] text-slate-400">Sponsored • @{instagramAccount}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-tight">{primaryText}</p>
              <p className="text-[10px] text-sky-300 italic">{q1} / {q2}</p>

              {mediaUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900 h-36">
                  <img src={mediaUrl} alt="Ad Media" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-100 truncate max-w-[150px]">{headline || "Chat with us on WhatsApp"}</p>
                  <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{description}</p>
                </div>
                <button className="px-2.5 py-1 rounded-md bg-sky-500 text-slate-950 text-[10px] font-bold">
                  Send message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPartnershipCodeModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Enter partnership ad code, post ID or post URL</h3>
            <input
              type="text"
              value={partnershipCode}
              onChange={(e) => setPartnershipCode(e.target.value)}
              placeholder="PARTNER-123"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPartnershipCodeModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={() => setShowPartnershipCodeModal(false)} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showSelectPartnershipModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-lg w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Select partnership</h3>
            <div className="flex border-b border-slate-800 text-xs gap-4 font-bold">
              <span className="text-sky-400 border-b-2 border-sky-400 pb-1">Sent requests</span>
              <span className="text-slate-400 pb-1">Received requests</span>
            </div>
            <p className="text-xs text-slate-400 text-center py-4">No ad partnerships currently linked.</p>
            <div className="flex justify-end">
              <button onClick={() => setShowSelectPartnershipModal(false)} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showUtmModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Build URL Parameters</h3>
            <input
              type="text"
              value={urlParams}
              onChange={(e) => setUrlParams(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
            />
            <div className="flex justify-end">
              <button onClick={() => setShowUtmModal(false)} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
                Apply URL Parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
