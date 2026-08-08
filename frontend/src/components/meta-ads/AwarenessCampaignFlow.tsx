"use client";
import { useState } from "react";
import {
  X, Loader2, Eye, Check, Globe, Sparkles, Megaphone, Zap, ArrowUpRight, Plus, Info,
  Search, ShieldCheck, Phone, MessageSquare, Tag, Users, Filter, Code, Layers, Calendar, ArrowLeft, ExternalLink, HelpCircle
} from "lucide-react";

interface AwarenessCampaignFlowProps {
  orgId: string;
  backendUrl: string;
  fetchedPages: any[];
  fetchedIgAccounts: any[];
  onClose: () => void;
  onPublished: () => void;
}

export default function AwarenessCampaignFlow({
  orgId,
  backendUrl,
  fetchedPages,
  fetchedIgAccounts,
  onClose,
  onPublished,
}: AwarenessCampaignFlowProps) {
  // Current active step (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2);

  // STEP 2: Campaign Level Parameters
  const [campName, setCampName] = useState("New Awareness campaign");
  const [liveVideoAd, setLiveVideoAd] = useState(false);
  const [liveVideoLocation, setLiveVideoLocation] = useState("FACEBOOK");
  const [buyingType, setBuyingType] = useState("AUCTION");
  const [cboEnabled, setCboEnabled] = useState(true);
  const [dailyBudget, setDailyBudget] = useState("800");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [shareBudgetPercent, setShareBudgetPercent] = useState(false);
  const [scheduleBudgetIncreases, setScheduleBudgetIncreases] = useState(false);

  // Frequency Control
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [frequencyMode, setFrequencyMode] = useState<"TARGET" | "CAP">("CAP");
  const [frequencyCapCount, setFrequencyCapCount] = useState(2);
  const [frequencyCapDays, setFrequencyCapDays] = useState(7);

  // A/B Test
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [abTestVariable, setAbTestVariable] = useState("CREATIVE");
  const [abTestDuration, setAbTestDuration] = useState("7_DAYS");
  const [abTestMetric, setAbTestMetric] = useState("COST_PER_RESULT");

  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [formPageId, setFormPageId] = useState(fetchedPages[0]?.id || "");

  // STEP 3: Ad Set & Target Audience Setup
  const [adSetName, setAdSetName] = useState("New Awareness ad set");
  const [performanceGoal, setPerformanceGoal] = useState("REACH");
  const [bidCap, setBidCap] = useState("");
  const [showValueRulesModal, setShowValueRulesModal] = useState(false);
  const [showAdSetOptions, setShowAdSetOptions] = useState(false);

  // Budget & Schedule
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [hasEndDate, setHasEndDate] = useState(false);

  // Audience
  const [locationInclusion, setLocationInclusion] = useState("India");
  const [excludeAudience, setExcludeAudience] = useState("");
  const [language, setLanguage] = useState("ALL");
  const [customAudience, setCustomAudience] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("ALL");
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [securitiesDeclared, setSecuritiesDeclared] = useState(false);
  const [showAudienceNotice, setShowAudienceNotice] = useState(true);

  // Placements
  const [placementMode, setPlacementMode] = useState<"ADVANTAGE" | "MANUAL">("ADVANTAGE");
  const [platFb, setPlatFb] = useState(true);
  const [platIg, setPlatIg] = useState(true);
  const [platAudienceNet, setPlatAudienceNet] = useState(true);
  const [platMessenger, setPlatMessenger] = useState(true);
  const [platWa, setPlatWa] = useState(true);
  const [platThreads, setPlatThreads] = useState(true);
  const [showBrandSuitability, setShowBrandSuitability] = useState(false);

  // STEP 4: Ad Creative, Identity & Live Preview
  const [adName, setAdName] = useState("New Awareness ad");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [showPartnershipCodeModal, setShowPartnershipCodeModal] = useState(false);
  const [showSelectPartnershipModal, setShowSelectPartnershipModal] = useState(false);
  const [partnershipCode, setPartnershipCode] = useState("");

  // Identity
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccount, setInstagramAccount] = useState(fetchedIgAccounts[0]?.username || "@jisnudigital");
  const [whatsappPhone, setWhatsappPhone] = useState("+91 9876543210");

  // Setup & Format
  const [adSetupMode, setAdSetupMode] = useState<"CREATE" | "EXISTING">("CREATE");
  const [adFormat, setAdFormat] = useState<"SINGLE" | "CAROUSEL">("SINGLE");
  const [multiAdvertiser, setMultiAdvertiser] = useState(true);

  // Creative Content
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe");
  const [aiMedia, setAiMedia] = useState(false);
  const [primaryText, setPrimaryText] = useState("Discover top-tier digital marketing and growth solutions tailored for your brand.");
  const [headline, setHeadline] = useState("Boost Your Brand Awareness Today");
  const [description, setDescription] = useState("Get in touch with our expert team for a custom consultation.");
  const [callToAction, setCallToAction] = useState("LEARN_MORE");

  // Destination
  const [destinationType, setDestinationType] = useState<"INSTANT" | "WEBSITE" | "CALL" | "MESSAGING">("WEBSITE");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com");
  const [adsDataSharing, setAdsDataSharing] = useState(true);

  // Conversations
  const [chatGreeting, setChatGreeting] = useState("Hi! Thanks for reaching out. How can we help you today?");
  const [q1, setQ1] = useState("Can I learn more about your services?");
  const [q2, setQ2] = useState("What are your pricing packages?");
  const [q3, setQ3] = useState("Can I talk to a consultant?");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Tracking
  const [pixelId, setPixelId] = useState("189283719283");
  const [urlParams, setUrlParams] = useState("utm_source=facebook&utm_medium=cpc&utm_campaign=awareness");
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
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: campName,
          objective: "OUTCOME_AWARENESS",
          dailyBudget: Number(dailyBudget),
          buyingType,
          liveVideoAd,
          liveVideoLocation,
          cboEnabled,
          bidStrategy,
          specialAdCategory,
          adSetName,
          performanceGoal,
          budgetMode,
          startDate,
          endDate,
          locationInclusion,
          ageMin,
          ageMax,
          gender,
          detailedTargeting,
          language,
          advantagePlacements: placementMode === "ADVANTAGE",
          adName,
          partnershipAd,
          partnershipCode,
          facebookPageId: formPageId || facebookPageId,
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
          destinationType,
          websiteUrl,
          chatGreeting,
          pixelId,
          urlParams,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Awareness Campaign publish failed.");

      showToast("Awareness Campaign Published Live! 📢");
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
        <div className="absolute top-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-2xl">
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
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
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
          <button onClick={() => setActiveStep(2)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 2 ? "bg-amber-500 text-slate-950" : "text-slate-400"}`}>
            2. Campaign Parameters
          </button>
          <button onClick={() => setActiveStep(3)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 3 ? "bg-amber-500 text-slate-950" : "text-slate-400"}`}>
            3. Ad Set & Audience
          </button>
          <button onClick={() => setActiveStep(4)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 4 ? "bg-amber-500 text-slate-950" : "text-slate-400"}`}>
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
              <Megaphone className="h-10 w-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-100">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selected: <span className="text-amber-400 font-bold">Awareness (OUTCOME_AWARENESS)</span>
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-400" /> Awareness Preview
                  </h4>
                  <a
                    href="https://www.facebook.com/business/help/1438417719786914"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    About campaign objectives <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300">
                  Reach the maximum number of people who are likely to remember your brand, video content, or store location.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Reach", "Brand awareness", "Video views", "Store location awareness"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
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
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  Continue → Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE AWARENESS CAMPAIGN PARAMETERS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                      Step 2 of 4
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">In Draft</span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">{campName}</h3>
                  <p className="text-xs text-slate-400">1 Ad set • 1 Ad</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => showToast("Reviewing Awareness parameters...")} className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
                    Review
                  </button>
                  <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 hover:text-white">
                    ← Change Objective
                  </button>
                </div>
              </div>

              {/* 1. Campaign Name & Objective */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    placeholder="New Awareness campaign"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

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
                      value="Awareness"
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Live video ad toggle & location dropdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${liveVideoAd ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"}`}>
                        {liveVideoAd ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Use settings that are suggested for a live video ad. This will adjust your budget and schedule to more efficiently deliver your ads and drive engagement.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={liveVideoAd}
                      onChange={(e) => setLiveVideoAd(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {liveVideoAd && (
                  <div className="pt-3 border-t border-slate-800">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Live Video Streaming Location</label>
                    <select
                      value={liveVideoLocation}
                      onChange={(e) => setLiveVideoLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    >
                      <option value="FACEBOOK">Facebook</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="AUDIENCE_NETWORK">Audience Network</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Advantage+ campaign budget toggle & sub-settings */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cboEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"}`}>
                        {cboEnabled ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Distribute your budget across ad sets to get more results. You can control spending for each ad set.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                        About Advantage+ campaign budget
                      </a>
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={cboEnabled}
                      onChange={(e) => setCboEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {cboEnabled && (
                  <div className="pt-3 space-y-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Budget Mode</label>
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

                    <p className="text-[11px] text-slate-400">
                      You'll spend no more than <span className="text-amber-400 font-bold">₹{dailyBudget}</span> during the {budgetMode.toLowerCase()} of your campaign.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                        About {budgetMode.toLowerCase()} budget
                      </a>
                    </p>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Campaign bid strategy: Highest volume</p>
                        <p className="text-[10px] text-slate-400">Maximise reach or impressions for your budget.</p>
                      </div>
                      <button type="button" onClick={() => showToast("Bid strategy set to Highest volume.")} className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold text-amber-400">
                        Edit
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scheduleBudgetIncreases}
                          onChange={(e) => setScheduleBudgetIncreases(e.target.checked)}
                          className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-amber-500"
                        />
                        Schedule budget increases during specific peak days
                      </label>
                      <p className="text-[11px] text-slate-400">Ad scheduling: <span className="font-semibold text-slate-200">Run ads all the time</span></p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Campaign frequency control */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${frequencyControl ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"}`}>
                        {frequencyControl ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Set a target frequency for lifetime budget to control impression cap per user.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={frequencyControl}
                      onChange={(e) => setFrequencyControl(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {frequencyControl && (
                  <div className="pt-3 space-y-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setFrequencyMode("TARGET")}
                        className={`p-3 rounded-xl border cursor-pointer ${frequencyMode === "TARGET" ? "bg-amber-500/10 border-amber-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                      >
                        <p className="text-xs font-bold">Target</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Average number of times people see ads.</p>
                      </div>

                      <div
                        onClick={() => setFrequencyMode("CAP")}
                        className={`p-3 rounded-xl border cursor-pointer ${frequencyMode === "CAP" ? "bg-amber-500/10 border-amber-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                      >
                        <p className="text-xs font-bold">Cap</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Maximum number of times people see ads.</p>
                      </div>
                    </div>

                    {frequencyMode === "CAP" && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="number"
                            value={frequencyCapCount}
                            onChange={(e) => setFrequencyCapCount(Number(e.target.value))}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-amber-400"
                          />
                          <span>times every</span>
                          <input
                            type="number"
                            value={frequencyCapDays}
                            onChange={(e) => setFrequencyCapDays(Number(e.target.value))}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-amber-400"
                          />
                          <span>days</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          As a maximum, we'll aim to stay under <span className="text-amber-400 font-bold">{frequencyCapCount}</span> impressions every <span className="text-amber-400 font-bold">{frequencyCapDays}</span> days.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5. A/B Test toggle & parameters */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${abTestEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"}`}>
                        {abTestEnabled ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Help improve ad performance by comparing versions to see what works best.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={abTestEnabled}
                      onChange={(e) => setAbTestEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {abTestEnabled && (
                  <div className="pt-3 space-y-3 border-t border-slate-800">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">What to test?</label>
                        <select
                          value={abTestVariable}
                          onChange={(e) => setAbTestVariable(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="CREATIVE">Creative</option>
                          <option value="AUDIENCE">Audience</option>
                          <option value="PLACEMENT">Placement</option>
                          <option value="CUSTOM">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Test duration</label>
                        <select
                          value={abTestDuration}
                          onChange={(e) => setAbTestDuration(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="7_DAYS">7 days</option>
                          <option value="3_DAYS">3 days</option>
                          <option value="5_DAYS">5 days</option>
                          <option value="14_DAYS">14 days</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Compare performance by</label>
                        <select
                          value={abTestMetric}
                          onChange={(e) => setAbTestMetric(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="COST_PER_RESULT">Cost per result</option>
                          <option value="COST_PER_REACH">Cost per 1,000 Reach</option>
                          <option value="COST_PER_THRUPLAY">Cost per ThruPlay</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Special Ad Categories */}
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

              {/* 7. Facebook Page Selection */}
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

              {/* 8. Campaign score */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                    66
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Campaign score</h4>
                    <p className="text-[11px] text-slate-400">Your campaign has room to improve. No additional recommendations available.</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Change Objective
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 3: Ad Set & Audience →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AD SET & TARGET AUDIENCE SETUP */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 3 of 4
                  </span>
                  <span className="text-xs text-amber-400 font-semibold animate-pulse">● In Draft</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm pt-1">{campName} → Ad Set &amp; Target Audience Setup</h3>
                <p className="text-xs text-slate-400">Configure performance goal, placements, budget &amp; audience targeting.</p>
              </div>

              {/* 1. Ad set name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Ad set name *</label>
                  <button
                    type="button"
                    onClick={() => setShowAdSetOptions(!showAdSetOptions)}
                    className="text-xs text-amber-400 font-semibold hover:underline"
                  >
                    {showAdSetOptions ? "Hide options ▴" : "Show more options ▾"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* 2. Conversion & Performance Goal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Conversion &amp; Performance Goal</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Performance Goal</label>
                  <select
                    value={performanceGoal}
                    onChange={(e) => setPerformanceGoal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                  >
                    <option value="IMPRESSIONS">Maximise number of impressions</option>
                    <option value="REACH">Maximise reach of ads</option>
                    <option value="AD_RECALL_LIFT">Maximise ad recall lift</option>
                    <option value="THRUPLAY">Maximise ThruPlay views</option>
                    <option value="CONTINUOUS_2SEC_VIDEO_PLAY">Maximise 2-second continuous video plays</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facebook Page</label>
                    <select
                      value={formPageId}
                      onChange={(e) => setFormPageId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      {fetchedPages.map((p: any) => (
                        <option key={p.id} value={p.id}>📄 {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Bid cap (Optional)</label>
                    <input
                      type="text"
                      value={bidCap}
                      onChange={(e) => setBidCap(e.target.value)}
                      placeholder="₹ X.XX"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-xs text-slate-300 font-semibold">Value rules</span>
                  <button
                    type="button"
                    onClick={() => setShowValueRulesModal(true)}
                    className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold"
                  >
                    Configure Value Rules
                  </button>
                </div>
              </div>

              {/* 3. Budget & schedule */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Budget &amp; schedule</h4>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      disabled={!hasEndDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 disabled:opacity-50"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
                  />
                  Set an end date for campaign
                </label>
              </div>

              {/* 4. Audience */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                {showAudienceNotice && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex justify-between items-center">
                    <span>Targeting broad audience to maximize brand recall lift.</span>
                    <button onClick={() => setShowAudienceNotice(false)} className="text-amber-400 hover:text-white font-bold">×</button>
                  </div>
                )}

                <h4 className="font-bold text-slate-200 text-xs">Audience</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Locations (Inclusion)</label>
                    <input
                      type="text"
                      value={locationInclusion}
                      onChange={(e) => setLocationInclusion(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Exclude Audience</label>
                    <input
                      type="text"
                      value={excludeAudience}
                      onChange={(e) => setExcludeAudience(e.target.value)}
                      placeholder="e.g. Existing Customers"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
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
                      <option value="MEN">Male</option>
                      <option value="WOMEN">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Detailed Targeting Search</label>
                  <input
                    type="text"
                    value={detailedTargeting}
                    onChange={(e) => setDetailedTargeting(e.target.value)}
                    placeholder="Search interests, demographics..."
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={securitiesDeclared}
                    onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
                  />
                  Securities declaration (for India ad compliance)
                </label>
              </div>

              {/* 5. Placements */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Placements</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setPlacementMode("ADVANTAGE")}
                    className={`p-3 rounded-xl border cursor-pointer ${placementMode === "ADVANTAGE" ? "bg-amber-500/10 border-amber-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    <p className="font-bold">Advantage+ placements</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Recommended automatically across Meta network.</p>
                  </div>

                  <div
                    onClick={() => setPlacementMode("MANUAL")}
                    className={`p-3 rounded-xl border cursor-pointer ${placementMode === "MANUAL" ? "bg-amber-500/10 border-amber-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    <p className="font-bold">Manual placements</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Select platforms manually.</p>
                  </div>
                </div>

                {placementMode === "MANUAL" && (
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <p className="font-semibold text-slate-300">Platforms:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-1.5 text-slate-300"><input type="checkbox" checked={platFb} onChange={(e) => setPlatFb(e.target.checked)} className="accent-amber-500" /> Facebook</label>
                      <label className="flex items-center gap-1.5 text-slate-300"><input type="checkbox" checked={platIg} onChange={(e) => setPlatIg(e.target.checked)} className="accent-amber-500" /> Instagram</label>
                      <label className="flex items-center gap-1.5 text-slate-300"><input type="checkbox" checked={platAudienceNet} onChange={(e) => setPlatAudienceNet(e.target.checked)} className="accent-amber-500" /> Audience Network</label>
                      <label className="flex items-center gap-1.5 text-slate-300"><input type="checkbox" checked={platMessenger} onChange={(e) => setPlatMessenger(e.target.checked)} className="accent-amber-500" /> Messenger</label>
                      <label className="flex items-center gap-1.5 text-slate-300"><input type="checkbox" checked={platWa} onChange={(e) => setPlatWa(e.target.checked)} className="accent-amber-500" /> WhatsApp</label>
                      <label className="flex items-center gap-1.5 text-slate-300"><input type="checkbox" checked={platThreads} onChange={(e) => setPlatThreads(e.target.checked)} className="accent-amber-500" /> Threads</label>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Brand Safety */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Brand safety and suitability</h4>
                  <button type="button" onClick={() => setShowBrandSuitability(!showBrandSuitability)} className="text-xs text-amber-400 font-semibold">
                    {showBrandSuitability ? "Hide options ▴" : "Show options ▾"}
                  </button>
                </div>
                {showBrandSuitability && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    Standard inventory filter applied for Audience Network and In-Stream Video ads.
                  </p>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 4: Ad Creative &amp; Live Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AD CREATIVE, IDENTITY & LIVE PREVIEW */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">Step 4: Ad Creative, Identity &amp; Live Preview</h3>
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
                  placeholder="New Awareness ad"
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
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                        Go to Partnership Ads Hub
                      </a>
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={partnershipAd}
                    onChange={(e) => setPartnershipAd(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
                  />
                </div>

                {partnershipAd && (
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowPartnershipCodeModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold"
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${adSetupMode === "CREATE" ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
                  >
                    Create ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdSetupMode("EXISTING")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${adSetupMode === "EXISTING" ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
                  >
                    Use existing post
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setAdFormat("SINGLE")}
                      className={`p-3 rounded-xl border cursor-pointer ${adFormat === "SINGLE" ? "bg-amber-500/10 border-amber-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      <p className="text-xs font-bold">Single image or video</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">One image or video, or slideshow with multiple images.</p>
                    </div>

                    <div
                      onClick={() => setAdFormat("CAROUSEL")}
                      className={`p-3 rounded-xl border cursor-pointer ${adFormat === "CAROUSEL" ? "bg-amber-500/10 border-amber-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      <p className="text-xs font-bold">Carousel</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">2 or more scrollable images or videos.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Multi-advertiser ads</h4>
                  <input
                    type="checkbox"
                    checked={multiAdvertiser}
                    onChange={(e) => setMultiAdvertiser(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
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
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-amber-500"
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
                    📱 Active on WhatsApp. Edit WhatsApp connection in Page settings.
                  </div>
                )}
              </div>

              {/* 6. Destination */}
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
                      onClick={() => setDestinationType(d.id as any)}
                      className={`p-2.5 rounded-xl border font-bold text-center ${destinationType === d.id ? "bg-amber-500/10 border-amber-500/60 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {destinationType === "MESSAGING" && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <p className="text-slate-300 font-semibold">Connected WhatsApp Number:</p>
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
                      <input type="checkbox" checked={adsDataSharing} onChange={(e) => setAdsDataSharing(e.target.checked)} className="accent-amber-500" />
                      Expand messaging data sharing for optimized delivery.
                    </label>
                  </div>
                )}
              </div>

              {/* 7. Conversations Chat Template */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    Conversations Template <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">AI Template</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Edit template
                  </button>
                </div>
                <p className="text-[11px] text-amber-300 font-semibold">💡 You could get 7% more messages by adding recommended settings (+7%)</p>
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
                  <p className="text-slate-300">Website events: Active Dataset • Pixel ID <span className="font-mono text-amber-400 font-bold">{pixelId}</span></p>
                  <p className="text-slate-400">App events: Not configured</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">URL Parameters: {urlParams}</span>
                    <button
                      type="button"
                      onClick={() => setShowUtmModal(true)}
                      className="text-xs font-bold text-amber-400 hover:underline"
                    >
                      Build a URL parameter
                    </button>
                  </div>
                </div>
              </div>

              {/* 9 & 10 Legal */}
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
                <Eye className="h-4 w-4 text-amber-400" /> Ad Live Preview
              </h4>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">66/100</span>
            </div>

            {/* Mobile Ad Card Mockup */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden space-y-2 p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  📄
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">JISNU Digital Solutions</p>
                  <p className="text-[10px] text-slate-400">Sponsored • @{instagramAccount}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-tight">{primaryText}</p>

              {mediaUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900 h-36">
                  <img src={mediaUrl} alt="Ad Media" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-100 truncate max-w-[150px]">{headline}</p>
                  <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{description}</p>
                </div>
                <button className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold">
                  {callToAction.replace(/_/g, " ")}
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
            <p className="text-xs text-slate-400">Enter creator ad code or post link to connect identity.</p>
            <input
              type="text"
              value={partnershipCode}
              onChange={(e) => setPartnershipCode(e.target.value)}
              placeholder="e.g. PARTNER-123 or https://instagram.com/p/..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPartnershipCodeModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={() => setShowPartnershipCodeModal(false)} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
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
              <span className="text-amber-400 border-b-2 border-amber-400 pb-1">Sent requests</span>
              <span className="text-slate-400 pb-1">Received requests</span>
            </div>
            <p className="text-xs text-slate-400 text-center py-4">No ad partnerships currently linked.</p>
            <div className="flex justify-end">
              <button onClick={() => setShowSelectPartnershipModal(false)} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
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
              <button onClick={() => setShowUtmModal(false)} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                Apply URL Parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
