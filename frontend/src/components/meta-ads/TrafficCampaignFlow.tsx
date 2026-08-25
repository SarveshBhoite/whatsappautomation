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
  const [instagramAccount, setInstagramAccount] = useState(fetchedIgAccounts[0]?.username || "");
  const [whatsappPhone, setWhatsappPhone] = useState(fetchedWaNumbers[0]?.phoneNumber || "");
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

  // Tracking & UTM Builder State
  const [pixelId, setPixelId] = useState("");
  const [urlParams, setUrlParams] = useState("utm_source=facebook&utm_medium=cpc_traffic&utm_campaign=traffic");
  const [showUtmModal, setShowUtmModal] = useState(false);

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

  // Search Meta Detailed Targeting (Interests, Demographics, Behaviors) via Graph API
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

  // Search Meta Languages (Ad Locales) via Graph API
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
          targeting: {
            locations: selectedLocations,
            ageMin,
            ageMax,
            gender,
            languages: selectedLanguages,
            interests: selectedInterests.map(i => i.name),
            detailedTargeting: detailedTargeting || selectedInterests.map(i => i.name).join(", "),
          },
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
              <MousePointerClick className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Selected: <span className="text-blue-600 font-bold">Traffic (OUTCOME_TRAFFIC)</span>
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-blue-600" /> Traffic Preview
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
                  Send people to a destination, such as your website, shop, landing page, or WhatsApp chat.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Link clicks", "Landing page views", "Messenger and WhatsApp", "Calls"].map((tag) => (
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
                  onClick={() => {
                    setActiveStep(2);
                    setTrafficSubStep("CHOICE");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
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
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        ← Change Objective
                      </button>
                      <h3 className="font-bold text-slate-900 text-sm">Step 2: Configure TRAFFIC Campaign Parameters</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Parameters tailored specifically for your TRAFFIC campaign setup.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">Step 2 of 4</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Choose a campaign setup</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
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
                          ? "border-blue-500 bg-blue-50/70 shadow-2xs ring-1 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="trafficChoice"
                          checked={trafficPresetMode === "tailored"}
                          readOnly
                          className="mt-1 h-4 w-4 text-blue-600"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                          <MousePointerClick className="h-6 w-6" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">Tailored web traffic campaign</h5>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              Quickly create a campaign optimised to help get more web traffic at the best value. Preset settings include Advantage+ placements, highest volume bid strategy and more.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">Streamlined</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">Tailored</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700">Best practices</span>
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
                          ? "border-blue-500 bg-blue-50/70 shadow-2xs ring-1 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="trafficChoice"
                            checked={trafficPresetMode === "manual"}
                            readOnly
                            className="h-4 w-4 text-blue-600"
                          />
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                            <Settings className="h-6 w-6" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">Manual traffic campaign</h5>
                            <p className="text-xs text-slate-500 mt-0.5">Create a traffic campaign from scratch for finer control over all settings.</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                          Configure →
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all">
                      ← Back to Step 1
                    </button>
                    <button onClick={() => setTrafficSubStep("CONFIG")} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all">
                      Continue to Configuration →
                    </button>
                  </div>
                </div>
              )}

              {/* 2B. SUB-STEP CONFIG */}
              {trafficSubStep === "CONFIG" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <button type="button" onClick={() => setTrafficSubStep("CHOICE")} className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 mb-1 cursor-pointer">
                        ← Change campaign setup
                      </button>
                      <h3 className="font-bold text-slate-900 text-sm">New Traffic campaign</h3>
                      <p className="text-xs text-slate-500 mt-0.5">1 Ad set • 1 Ad • {trafficPresetMode === "tailored" ? "Tailored" : "Manual"} setup mode</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">In draft</span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">Step 2 of 4</span>
                    </div>
                  </div>

                  {/* Card 1: Campaign Name */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs font-bold">✓</div>
                      <h4 className="font-bold text-slate-900 text-xs">Campaign name</h4>
                    </div>
                    <input
                      type="text"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      placeholder="New Traffic campaign"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setTrafficShowMoreNameOptions(!trafficShowMoreNameOptions)}
                      className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      {trafficShowMoreNameOptions ? "Hide details" : "Show more options ▾"}
                    </button>
                  </div>

                  {/* Card 2: Live Video Ad */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">Live video ad</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trafficLiveVideo ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                            {trafficLiveVideo ? "On" : "Off"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
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
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {trafficLiveVideo && (
                      <div className="pt-3 border-t border-slate-100 space-y-2 animate-fadeIn">
                        <h5 className="font-bold text-slate-900 text-xs">Live video location</h5>
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5">
                          <input type="radio" checked={trafficLiveVideoLocation === "FACEBOOK"} readOnly className="accent-blue-600" />
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">f</span> Facebook
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Campaign Details */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs font-bold">✓</div>
                      <h4 className="font-bold text-slate-900 text-xs">Campaign details</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">Buying type</label>
                        <p className="font-bold text-slate-900 mt-0.5">Auction</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          Campaign objective <Info className="h-3 w-3 text-slate-400" />
                        </label>
                        <p className="font-bold text-slate-900 mt-0.5">Traffic</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTrafficShowMoreDetailsOptions(!trafficShowMoreDetailsOptions)}
                        className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        {trafficShowMoreDetailsOptions ? "Hide details" : "Show more options ▾"}
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Budget */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs font-bold">✓</div>
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        Budget <Info className="h-3.5 w-3.5 text-slate-400" />
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div
                        onClick={() => setTrafficBudgetStrategy("CAMPAIGN")}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                          trafficBudgetStrategy === "CAMPAIGN" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input type="radio" checked={trafficBudgetStrategy === "CAMPAIGN"} readOnly className="mt-1 h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Campaign budget (Advantage+ campaign budget)</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Automatically distribute your budget across ad sets to get more results.{" "}
                            <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
                              About campaign budget
                            </a>
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setTrafficBudgetStrategy("ADSET")}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                          trafficBudgetStrategy === "ADSET" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input type="radio" checked={trafficBudgetStrategy === "ADSET"} readOnly className="mt-1 h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Ad set budget</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Set different bid strategies or budget schedules for each ad set.</p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={trafficShareBudget}
                        onChange={(e) => setTrafficShareBudget(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      Share up to 20% of your budget with other ad sets
                    </label>

                    <p className="text-[11px] text-slate-500">Campaign bid strategy: <span className="font-bold text-slate-900">Highest volume</span></p>
                  </div>

                  {/* Card 5: A/B test */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs font-bold">✓</div>
                        <h4 className="font-bold text-slate-900 text-xs">A/B test</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trafficAbTest ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
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
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Help improve ad performance by comparing versions to see what works best.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
                        About A/B tests
                      </a>
                    </p>

                    {trafficAbTest && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">What would you like to test?</label>
                          <select
                            value={trafficTestVariable}
                            onChange={(e) => setTrafficTestVariable(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="CREATIVE">Creative</option>
                            <option value="AUDIENCE">Audience</option>
                            <option value="PLACEMENT">Placement</option>
                            <option value="CUSTOM">Custom</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">How long should the test run?</label>
                          <p className="text-[10px] text-slate-500 mb-1">Your test will run for this many days or until your ad set has ended.</p>
                          <select
                            value={trafficTestDuration}
                            onChange={(e) => setTrafficTestDuration(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="7_DAYS">7 days</option>
                            <option value="3_DAYS">3 days</option>
                            <option value="5_DAYS">5 days</option>
                            <option value="14_DAYS">14 days</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                            How do you want to compare performance? <Info className="h-3 w-3 text-slate-400" />
                          </label>
                          <select
                            value={trafficTestMetric}
                            onChange={(e) => setTrafficTestMetric(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
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
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs font-bold">✓</div>
                      <h4 className="font-bold text-slate-900 text-xs">Special Ad Categories</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
                        About Special Ad Categories
                      </a>
                    </p>
                    <select
                      value={specialAdCategory}
                      onChange={(e) => setSpecialAdCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
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
                    <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 shadow-2xs">
                      <h4 className="font-bold text-blue-700 text-xs flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-blue-600" /> Tailored Web Traffic Quick Setup
                      </h4>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Headline</label>
                        <input
                          type="text"
                          value={tailoredHeadline}
                          onChange={(e) => setTailoredHeadline(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Website URL</label>
                        <input
                          type="text"
                          value={tailoredUrl}
                          onChange={(e) => setTailoredUrl(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setTrafficSubStep("CHOICE")} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                      ← Back to Setup Choice
                    </button>
                    <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
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
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 3 of 4
                  </span>
                  <span className="text-xs text-blue-600 font-bold">In Draft</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm pt-1">{campName} → New Traffic ad set</h3>
                <p className="text-xs text-slate-500">Configure destination, performance goals, placements, and audience targeting.</p>
              </div>

              {/* Ad Set Name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Ad set name *</label>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Conversion Destination */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Conversion / Destination Location</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
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
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        destinationType === loc.id ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Performance Goal */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Performance Goal</h4>
                <select
                  value={trafficPerformanceGoal}
                  onChange={(e) => setTrafficPerformanceGoal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                  <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                  <option value="MAXIMIZE_CONVERSATIONS">Maximise number of conversations</option>
                  <option value="MAXIMIZE_DAILY_UNIQUE_REACH">Maximise daily unique reach</option>
                  <option value="MAXIMIZE_IMPRESSIONS">Maximise number of impressions</option>
                </select>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook Page</label>
                  <select
                    value={facebookPageId}
                    onChange={(e) => setFacebookPageId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {fetchedPages.map((p) => (
                      <option key={p.id} value={p.id}>📄 {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget & Schedule */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Budget & schedule</h4>
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Budget Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Audience Controls */}
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
                      placeholder="Search Meta Geo Locations (e.g. India, Mumbai, Wakad)..."
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
                      <option value="MEN">Men (1)</option>
                      <option value="WOMEN">Women (2)</option>
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
                      placeholder="Search Meta languages (e.g. English, Hindi, Marathi)..."
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
                  <label className="block text-[11px] font-bold text-slate-700">Detailed Targeting (Demographics, Interests, Behaviors)</label>
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
                      placeholder="Search Meta Interests, Demographics (e.g. Digital Marketing)..."
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

              {/* Placements & Brand Suitability */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Advantage+ placements</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Maximize link clicks across Meta network.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={advantagePlacements}
                    onChange={(e) => setAdvantagePlacements(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs">Show estimated audience size</h4>
                  <input
                    type="checkbox"
                    checked={showAudienceSize}
                    onChange={(e) => setShowAudienceSize(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>
              </div>

              {/* Campaign Score Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    100
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Campaign score: 100/100</h4>
                    <p className="text-[11px] text-slate-500">Broad Audience configuration active.</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  Continue to Step 4: Ad Creative & Live Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AD CREATIVE, IDENTITY & LIVE PREVIEW (TRAFFIC) */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">New Traffic ad</h3>
                </div>
              </div>

              {/* 1. Ad Name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Ad Name *</label>
                <input
                  type="text"
                  required
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="New Traffic ad"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. Partnership Ad Toggle */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Partnership ad</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Run ads with creators, brands and other businesses.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
                        Go to Partnership Ads Hub
                      </a>
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={partnershipAd}
                    onChange={(e) => setPartnershipAd(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>

                {partnershipAd && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowPartnershipCodeModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold cursor-pointer"
                    >
                      Enter ad code or post info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSelectPartnershipModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Select partnership
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Identity */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook Page *</label>
                    <select
                      value={facebookPageId}
                      onChange={(e) => setFacebookPageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPages.map((p) => (
                        <option key={p.id} value={p.id}>📄 {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Instagram Profile</label>
                    <input
                      type="text"
                      value={instagramAccount}
                      onChange={(e) => setInstagramAccount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Ad Setup */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Ad setup</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdSetupMode("CREATE")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${adSetupMode === "CREATE" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Create ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdSetupMode("EXISTING")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${adSetupMode === "EXISTING" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Use existing post
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setAdFormat("SINGLE")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${adFormat === "SINGLE" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      <p className="text-xs font-bold text-slate-900">Single image or video</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">One image or video, or slideshow.</p>
                    </div>

                    <div
                      onClick={() => setAdFormat("CAROUSEL")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${adFormat === "CAROUSEL" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      <p className="text-xs font-bold text-slate-900">Carousel</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">2 or more scrollable images or videos.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Multi-advertiser ads</h4>
                    <p className="text-[10px] text-slate-500">Your ad can appear with others in the same ad unit.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={multiAdvertiser}
                    onChange={(e) => setMultiAdvertiser(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>
              </div>

              {/* 5. Ad Creative */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Ad creative</h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">* Media (Image or Video URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://... or upload image"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold shrink-0 cursor-pointer border border-blue-200 flex items-center gap-1">
                      📁 Upload
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const localUrl = URL.createObjectURL(file);
                            setMediaUrl(localUrl);
                            showToast(`Selected file: ${file.name}`);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiMedia}
                    onChange={(e) => setAiMedia(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Ad includes media created or edited with AI
                </label>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Chat with us"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Call to Action</label>
                    <select
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
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
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs">
                    📱 Connected WhatsApp Number: <span className="font-bold">{whatsappPhone}</span>. Edit in Page settings. Active on WhatsApp.
                  </div>
                )}
              </div>

              {/* 6. Destination Radios */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Destination</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
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
                      className={`p-3 rounded-2xl border font-bold text-center transition-all cursor-pointer ${adDestinationRadio === d.id ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {adDestinationRadio === "MESSAGING" && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <p className="text-slate-700 font-bold">Messenger: Connected Page</p>
                    <p className="text-slate-700 font-bold">Instagram: {instagramAccount}</p>
                    <p className="text-slate-700 font-bold">WhatsApp Number:</p>
                    <select
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                    >
                      {fetchedWaNumbers && fetchedWaNumbers.length > 0 ? (
                        fetchedWaNumbers.map((wa) => (
                          <option key={wa.phoneNumber || wa.id} value={wa.phoneNumber}>
                            📱 {wa.verifiedName || wa.phoneNumber} ({wa.phoneNumber})
                          </option>
                        ))
                      ) : (
                        <option value="">No connected WhatsApp numbers found</option>
                      )}
                      <option value="custom">+ Enter custom WhatsApp number</option>
                    </select>

                    <label className="flex items-center gap-2 text-slate-700 pt-1 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={adsDataSharing}
                        onChange={(e) => setAdsDataSharing(e.target.checked)}
                        className="accent-blue-600"
                      />
                      Enable Ads Data Sharing with Messenger, Instagram & WhatsApp
                    </label>
                  </div>
                )}
              </div>

              {/* 7. Conversations Chat Template */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    Conversations Template <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">🤖 AI Badge</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit template
                  </button>
                </div>
                <p className="text-[11px] text-blue-700 font-semibold">💡 You could get 7% more messages by adding recommended settings (+7%)</p>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Greeting: {chatGreeting}</p>
                  <p className="text-[11px] text-slate-500">Q1: {q1}</p>
                  <p className="text-[11px] text-slate-500">Q2: {q2}</p>
                  <p className="text-[11px] text-slate-500">Q3: {q3}</p>
                </div>
              </div>

              {/* 8. Tracking */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Tracking</h4>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 font-medium">Website events: Active Dataset • Pixel ID <span className="font-mono text-blue-600 font-bold">{pixelId || "1380912777544016"}</span></p>
                  <p className="text-slate-400">App events: Not configured</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">URL Parameters: {urlParams}</span>
                    <button
                      type="button"
                      onClick={() => setShowUtmModal(true)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Build a URL parameter
                    </button>
                  </div>
                </div>
              </div>

              {/* 9 & 10 Legal & Preview Note */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs text-slate-500 shadow-2xs">
                <p>By clicking Publish Campaign Live, you acknowledge that your use of Meta's ad tools is subject to Terms and Conditions.</p>
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
                <Eye className="h-4 w-4 text-blue-600" /> Ad Live Preview
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">100/100</span>
            </div>

            {/* Mobile Ad Card Mockup */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden space-y-2.5 p-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                  📄
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">JISNU Digital Solutions</p>
                  <p className="text-[10px] text-slate-400">Sponsored • @{instagramAccount}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed">{primaryText}</p>
              <p className="text-[10px] text-blue-600 italic font-medium">{q1} / {q2}</p>

              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36">
                  <img src={mediaUrl} alt="Ad Media" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">{headline || "Chat with us on WhatsApp"}</p>
                  <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{description}</p>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-2xs">
                  Send message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPartnershipCodeModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Enter partnership ad code, post ID or post URL</h3>
            <input
              type="text"
              value={partnershipCode}
              onChange={(e) => setPartnershipCode(e.target.value)}
              placeholder="PARTNER-123"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPartnershipCodeModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={() => setShowPartnershipCodeModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showSelectPartnershipModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Select partnership</h3>
            <div className="flex border-b border-slate-200 text-xs gap-4 font-bold">
              <span className="text-blue-600 border-b-2 border-blue-600 pb-1">Sent requests</span>
              <span className="text-slate-400 pb-1">Received requests</span>
            </div>
            <p className="text-xs text-slate-500 text-center py-4">No ad partnerships currently linked.</p>
            <div className="flex justify-end">
              <button onClick={() => setShowSelectPartnershipModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showUtmModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Build URL Parameters</h3>
            <input
              type="text"
              value={urlParams}
              onChange={(e) => setUrlParams(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button onClick={() => setShowUtmModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs">
                Apply URL Parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
