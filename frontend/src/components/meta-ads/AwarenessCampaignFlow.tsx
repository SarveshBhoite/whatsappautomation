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
  fetchedWaNumbers?: any[];
  onClose: () => void;
  onPublished: () => void;
}

export default function AwarenessCampaignFlow({
  orgId,
  backendUrl,
  fetchedPages,
  fetchedIgAccounts,
  fetchedWaNumbers = [],
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
  const [excludeAudience, setExcludeAudience] = useState("");
  const [customAudience, setCustomAudience] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("ALL");
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [securitiesDeclared, setSecuritiesDeclared] = useState(false);
  const [showAudienceNotice, setShowAudienceNotice] = useState(true);

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
  const [instagramAccount, setInstagramAccount] = useState(fetchedIgAccounts[0]?.username || "");
  const [whatsappPhone, setWhatsappPhone] = useState(fetchedWaNumbers[0]?.phoneNumber || "");

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
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns/awareness`, {
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
          frequencyControl,
          frequencyCapCount,
          frequencyCapDays,
          specialAdCategory,
          adSetName,
          performanceGoal,
          budgetMode,
          startDate,
          endDate,
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
            3. Ad Set & Audience
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
              <Megaphone className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Selected: <span className="text-blue-600 font-bold">Awareness (OUTCOME_AWARENESS)</span>
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-blue-600" /> Awareness Preview
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
                  Reach the maximum number of people who are likely to remember your brand, video content, or store location.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Reach", "Brand awareness", "Video views", "Store location awareness"].map((tag) => (
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

          {/* STEP 2: CONFIGURE AWARENESS CAMPAIGN PARAMETERS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                      Step 2 of 4
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">In Draft</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{campName}</h3>
                  <p className="text-xs text-slate-500">1 Ad set • 1 Ad</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveStep(4)} className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold cursor-pointer">
                    Review & Preview →
                  </button>
                  <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                    ← Change Objective
                  </button>
                </div>
              </div>

              {/* 1. Campaign Name & Objective */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    placeholder="New Awareness campaign"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

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
                      value="Awareness"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Live video ad toggle & location dropdown */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">Live video ad</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${liveVideoAd ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                        {liveVideoAd ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
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
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {liveVideoAd && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Live Video Streaming Location</label>
                    <select
                      value={liveVideoLocation}
                      onChange={(e) => setLiveVideoLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="FACEBOOK">Facebook</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="AUDIENCE_NETWORK">Audience Network</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Advantage+ campaign budget toggle & sub-settings */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">Advantage+ campaign budget</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cboEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                        {cboEnabled ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Distribute your budget across ad sets to get more results. You can control spending for each ad set.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
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
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {cboEnabled && (
                  <div className="pt-3 space-y-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Budget Mode</label>
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

                    <p className="text-[11px] text-slate-500">
                      You'll spend no more than <span className="text-blue-600 font-bold">₹{dailyBudget}</span> during the {budgetMode.toLowerCase()} of your campaign.{" "}
                      <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
                        About {budgetMode.toLowerCase()} budget
                      </a>
                    </p>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Campaign bid strategy</p>
                          <p className="text-[10px] text-slate-500">Maximise reach or impressions for your budget.</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          {bidStrategy === "HIGHEST_VOLUME" ? "Highest volume" : bidStrategy === "BID_CAP" ? "Bid cap" : "Cost cap"}
                        </span>
                      </div>
                      <select
                        value={bidStrategy}
                        onChange={(e) => setBidStrategy(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="HIGHEST_VOLUME">Highest volume (Lowest Cost - Maximize Reach)</option>
                        <option value="BID_CAP">Bid cap (Set maximum bid per 1,000 impressions)</option>
                        <option value="COST_CAP">Cost per result goal (Cost Cap)</option>
                      </select>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scheduleBudgetIncreases}
                          onChange={(e) => setScheduleBudgetIncreases(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        Schedule budget increases during specific peak days
                      </label>
                      <p className="text-[11px] text-slate-500">Ad scheduling: <span className="font-semibold text-slate-900">Run ads all the time</span></p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Campaign frequency control */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">Campaign frequency control</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${frequencyControl ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                        {frequencyControl ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
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
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {frequencyControl && (
                  <div className="pt-3 space-y-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setFrequencyMode("TARGET")}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${frequencyMode === "TARGET" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                      >
                        <p className="text-xs font-bold text-slate-900">Target</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Average number of times people see ads.</p>
                      </div>

                      <div
                        onClick={() => setFrequencyMode("CAP")}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${frequencyMode === "CAP" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                      >
                        <p className="text-xs font-bold text-slate-900">Cap</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Maximum number of times people see ads.</p>
                      </div>
                    </div>

                    {frequencyMode === "CAP" && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="number"
                            value={frequencyCapCount}
                            onChange={(e) => setFrequencyCapCount(Number(e.target.value))}
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-blue-600 focus:outline-none"
                          />
                          <span className="text-slate-700 font-medium">times every</span>
                          <input
                            type="number"
                            value={frequencyCapDays}
                            onChange={(e) => setFrequencyCapDays(Number(e.target.value))}
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-blue-600 focus:outline-none"
                          />
                          <span className="text-slate-700 font-medium">days</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          As a maximum, we'll aim to stay under <span className="text-blue-600 font-bold">{frequencyCapCount}</span> impressions every <span className="text-blue-600 font-bold">{frequencyCapDays}</span> days.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5. A/B Test toggle & parameters */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">A/B test</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${abTestEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                        {abTestEnabled ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
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
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {abTestEnabled && (
                  <div className="pt-3 space-y-3 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">What to test?</label>
                        <select
                          value={abTestVariable}
                          onChange={(e) => setAbTestVariable(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="CREATIVE">Creative</option>
                          <option value="AUDIENCE">Audience</option>
                          <option value="PLACEMENT">Placement</option>
                          <option value="CUSTOM">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Test duration</label>
                        <select
                          value={abTestDuration}
                          onChange={(e) => setAbTestDuration(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="7_DAYS">7 days</option>
                          <option value="3_DAYS">3 days</option>
                          <option value="5_DAYS">5 days</option>
                          <option value="14_DAYS">14 days</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Compare performance by</label>
                        <select
                          value={abTestMetric}
                          onChange={(e) => setAbTestMetric(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
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
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Special Ad Categories</h4>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="NONE">None — Declare category if applicable</option>
                  <option value="CREDIT">Credit — Financial products & loans</option>
                  <option value="EMPLOYMENT">Employment — Jobs & hiring</option>
                  <option value="HOUSING">Housing — Real estate & property</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Social Issues, Elections or Politics</option>
                </select>
              </div>

              {/* 7. Facebook Page Selection */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Facebook Page</label>
                <select
                  value={formPageId}
                  onChange={(e) => setFormPageId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {fetchedPages.map((p: any) => (
                    <option key={p.id} value={p.id}>📄 {p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              {/* 8. Campaign score */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                    66
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Campaign score</h4>
                    <p className="text-[11px] text-slate-500">Your campaign has room to improve. No additional recommendations available.</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Change Objective
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  Continue to Step 3: Ad Set & Audience →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AD SET & TARGET AUDIENCE SETUP */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 3 of 4
                  </span>
                  <span className="text-xs text-blue-600 font-bold">● In Draft</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm pt-1">{campName} → Ad Set &amp; Target Audience Setup</h3>
                <p className="text-xs text-slate-500">Configure performance goal, placements, budget &amp; audience targeting.</p>
              </div>

              {/* 1. Ad set name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Ad set name *</label>
                  <button
                    type="button"
                    onClick={() => setShowAdSetOptions(!showAdSetOptions)}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    {showAdSetOptions ? "Hide options ▴" : "Show more options ▾"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. Conversion & Performance Goal */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Conversion &amp; Performance Goal</h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Performance Goal</label>
                  <select
                    value={performanceGoal}
                    onChange={(e) => setPerformanceGoal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
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
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook Page</label>
                    <select
                      value={formPageId}
                      onChange={(e) => setFormPageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPages.map((p: any) => (
                        <option key={p.id} value={p.id}>📄 {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bid cap (Optional)</label>
                    <input
                      type="text"
                      value={bidCap}
                      onChange={(e) => setBidCap(e.target.value)}
                      placeholder="₹ X.XX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-700 font-semibold">Value rules</span>
                  <button
                    type="button"
                    onClick={() => setShowValueRulesModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer"
                  >
                    Configure Value Rules
                  </button>
                </div>
              </div>

              {/* 3. Budget & schedule */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Budget &amp; schedule</h4>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      disabled={!hasEndDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                  Set an end date for campaign
                </label>
              </div>

              {/* 4. Audience Controls */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                {showAudienceNotice && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex justify-between items-center">
                    <span>Targeting broad audience to maximize brand recall lift.</span>
                    <button onClick={() => setShowAudienceNotice(false)} className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer">×</button>
                  </div>
                )}

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
                      placeholder="Search Meta Geo Locations (e.g. India, Delhi)..."
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
                      <option value="MEN">Male (1)</option>
                      <option value="WOMEN">Female (2)</option>
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
                      placeholder="Search Meta Interests (e.g. Brand Awareness, Marketing)..."
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

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={securitiesDeclared}
                    onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                  Securities declaration (for India ad compliance)
                </label>
              </div>

              {/* 5. Placements */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Placements</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setPlacementMode("ADVANTAGE")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${placementMode === "ADVANTAGE" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    <p className="font-bold text-slate-900">Advantage+ placements</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recommended automatically across Meta network.</p>
                  </div>

                  <div
                    onClick={() => setPlacementMode("MANUAL")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${placementMode === "MANUAL" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    <p className="font-bold text-slate-900">Manual placements</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Select platforms manually.</p>
                  </div>
                </div>

                {placementMode === "MANUAL" && (
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <p className="font-bold text-slate-700">Platforms:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <label className="flex items-center gap-1.5 text-slate-700 font-medium"><input type="checkbox" checked={platFb} onChange={(e) => setPlatFb(e.target.checked)} className="accent-blue-600" /> Facebook</label>
                      <label className="flex items-center gap-1.5 text-slate-700 font-medium"><input type="checkbox" checked={platIg} onChange={(e) => setPlatIg(e.target.checked)} className="accent-blue-600" /> Instagram</label>
                      <label className="flex items-center gap-1.5 text-slate-700 font-medium"><input type="checkbox" checked={platAudienceNet} onChange={(e) => setPlatAudienceNet(e.target.checked)} className="accent-blue-600" /> Audience Network</label>
                      <label className="flex items-center gap-1.5 text-slate-700 font-medium"><input type="checkbox" checked={platMessenger} onChange={(e) => setPlatMessenger(e.target.checked)} className="accent-blue-600" /> Messenger</label>
                      <label className="flex items-center gap-1.5 text-slate-700 font-medium"><input type="checkbox" checked={platWa} onChange={(e) => setPlatWa(e.target.checked)} className="accent-blue-600" /> WhatsApp</label>
                      <label className="flex items-center gap-1.5 text-slate-700 font-medium"><input type="checkbox" checked={platThreads} onChange={(e) => setPlatThreads(e.target.checked)} className="accent-blue-600" /> Threads</label>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Brand Safety */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">Brand safety and suitability</h4>
                  <button type="button" onClick={() => setShowBrandSuitability(!showBrandSuitability)} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                    {showBrandSuitability ? "Hide options ▴" : "Show options ▾"}
                  </button>
                </div>
                {showBrandSuitability && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Standard inventory filter applied for Audience Network and In-Stream Video ads.
                  </p>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  Continue to Step 4: Ad Creative &amp; Live Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AD CREATIVE, IDENTITY & LIVE PREVIEW */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">Step 4: Ad Creative, Identity &amp; Live Preview</h3>
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
                  placeholder="New Awareness ad"
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
                      <p className="text-[10px] text-slate-500 mt-0.5">One image or video, or slideshow with multiple images.</p>
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
                  <h4 className="font-bold text-slate-900 text-xs">Multi-advertiser ads</h4>
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
                      placeholder="https://... or upload brand creative"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Call to Action (Optional for Awareness)</label>
                    <select
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="LEARN_MORE">LEARN_MORE — Learn More</option>
                      <option value="WATCH_MORE">WATCH_MORE — Watch More (Video/ThruPlay)</option>
                      <option value="SEND_WHATSAPP_MESSAGE">WHATSAPP_MESSAGE — Send WhatsApp message</option>
                      <option value="CONTACT_US">CONTACT_US — Contact Us</option>
                      <option value="SHOP_NOW">SHOP_NOW — Shop Now</option>
                      <option value="SIGN_UP">SIGN_UP — Sign Up</option>
                      <option value="SUBSCRIBE">SUBSCRIBE — Subscribe</option>
                      <option value="BOOK_NOW">BOOK_NOW — Book Now</option>
                      <option value="NO_BUTTON">NO_BUTTON — No Button (Pure Brand Recall)</option>
                    </select>
                  </div>
                </div>

                {callToAction === "SEND_WHATSAPP_MESSAGE" && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs">
                    📱 Active on WhatsApp. Edit WhatsApp connection in Page settings.
                  </div>
                )}
              </div>

              {/* 6. Destination */}
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
                      onClick={() => setDestinationType(d.id as any)}
                      className={`p-3 rounded-2xl border font-bold text-center transition-all cursor-pointer ${destinationType === d.id ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {destinationType === "MESSAGING" && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <p className="text-slate-700 font-bold">Connected WhatsApp Number:</p>
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
                      <input type="checkbox" checked={adsDataSharing} onChange={(e) => setAdsDataSharing(e.target.checked)} className="accent-blue-600" />
                      Expand messaging data sharing for optimized delivery.
                    </label>
                  </div>
                )}
              </div>

              {/* 7. Conversations Chat Template */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    Conversations Template <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">AI Template</span>
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

              {/* 9 & 10 Legal */}
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
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">66/100</span>
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

              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36">
                  <img src={mediaUrl} alt="Ad Media" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">{headline}</p>
                  <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{description}</p>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-2xs">
                  {callToAction.replace(/_/g, " ")}
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
            <p className="text-xs text-slate-500">Enter creator ad code or post link to connect identity.</p>
            <input
              type="text"
              value={partnershipCode}
              onChange={(e) => setPartnershipCode(e.target.value)}
              placeholder="e.g. PARTNER-123 or https://instagram.com/p/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
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
