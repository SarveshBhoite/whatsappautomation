"use client";
import { useState } from "react";
import {
  X, Loader2, Eye, Check, Globe, Sparkles, Megaphone, Zap, ArrowUpRight, Plus, Info,
  Search, ShieldCheck, Phone, MessageSquare, Tag, Users, Filter, Code, Layers, Calendar, ArrowLeft
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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2); // Starts at Step 2 after Step 1 selection

  // STEP 2: Campaign Level Parameters
  const [campName, setCampName] = useState("New Awareness campaign");
  const [liveVideoAd, setLiveVideoAd] = useState(false);
  const [buyingType, setBuyingType] = useState("AUCTION");
  const [cboEnabled, setCboEnabled] = useState(true);
  const [dailyBudget, setDailyBudget] = useState("800");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [shareBudgetPercent, setShareBudgetPercent] = useState(false);
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [formPageId, setFormPageId] = useState(fetchedPages[0]?.id || "");

  // STEP 3: Ad Set & Target Audience Setup
  const [adSetName, setAdSetName] = useState("New Awareness ad set");
  const [performanceGoal, setPerformanceGoal] = useState("MAXIMIZE_REACH");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [locationInclusion, setLocationInclusion] = useState("India");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("ALL");
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [language, setLanguage] = useState("ALL");
  const [advantagePlacements, setAdvantagePlacements] = useState(true);
  const [placementsFeeds, setPlacementsFeeds] = useState(true);
  const [placementsStories, setPlacementsStories] = useState(true);

  // STEP 4: Ad Creative, Identity & Live Preview
  const [adName, setAdName] = useState("New Awareness ad");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccount, setInstagramAccount] = useState(fetchedIgAccounts[0]?.username || "@jisnudigital");
  const [whatsappPhone, setWhatsappPhone] = useState("+91 9876543210");
  const [adSetupMode, setAdSetupMode] = useState<"CREATE" | "EXISTING">("CREATE");
  const [adFormat, setAdFormat] = useState<"SINGLE" | "CAROUSEL">("SINGLE");
  const [multiAdvertiser, setMultiAdvertiser] = useState(true);
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe");
  const [aiMedia, setAiMedia] = useState(false);
  const [primaryText, setPrimaryText] = useState("Discover top-tier digital marketing and growth solutions tailored for your brand.");
  const [headline, setHeadline] = useState("Boost Your Brand Awareness Today");
  const [description, setDescription] = useState("Get in touch with our expert team for a custom consultation.");
  const [callToAction, setCallToAction] = useState("LEARN_MORE");

  // Destination & Conversations
  const [destinationType, setDestinationType] = useState<"INSTANT" | "WEBSITE" | "CALL" | "MESSAGING">("WEBSITE");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com");
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
          advantagePlacements,
          adName,
          partnershipAd,
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

          {/* STEP 1: CHANGE OBJECTIVE REDIRECT */}
          {activeStep === 1 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <Megaphone className="h-10 w-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-100">Step 1: Awareness Objective Selected</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Reach the maximum number of people who are likely to remember your brand, video content, or store location.
              </p>
              <button
                onClick={() => setActiveStep(2)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Proceed to Step 2: Configure Campaign Parameters →
              </button>
            </div>
          )}

          {/* STEP 2: CONFIGURE AWARENESS CAMPAIGN PARAMETERS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-md">
                <div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 2 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">Configure Awareness Campaign Parameters</h3>
                  <p className="text-xs text-slate-400">Set budget, bidding strategies, and category declarations for your brand awareness goals.</p>
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
                  placeholder="New Awareness campaign"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. Live video ad toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
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

              {/* 3. Campaign details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Campaign details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Buying type</label>
                    <select
                      value={buyingType}
                      onChange={(e) => setBuyingType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
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

              {/* 4. Advantage+ campaign budget toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Distribute your budget across ad sets to get more results. You can control spending for each ad set.
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
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Budget (₹ INR)</label>
                        <input
                          type="number"
                          value={dailyBudget}
                          onChange={(e) => setDailyBudget(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign bid strategy</label>
                        <select
                          value={bidStrategy}
                          onChange={(e) => setBidStrategy(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        >
                          <option value="HIGHEST_VOLUME">Highest volume</option>
                          <option value="BID_CAP">Bid cap</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={shareBudgetPercent}
                        onChange={(e) => setShareBudgetPercent(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-amber-500"
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
                    <p className="text-[10px] text-slate-400 mt-0.5">Set a frequency limit for views.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={frequencyControl}
                      onChange={(e) => setFrequencyControl(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Compare versions for performance.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={abTestEnabled}
                      onChange={(e) => setAbTestEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* 7. Special Ad Categories */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                <p className="text-[11px] text-slate-400">
                  Declare if your ads are related to financial products, employment, housing, or politics.
                </p>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="NONE">None — Declare category if applicable</option>
                  <option value="CREDIT">Credit — Financial products & loans</option>
                  <option value="EMPLOYMENT">Employment — Jobs & hiring</option>
                  <option value="HOUSING">Housing — Real estate & property</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Social Issues, Elections or Politics</option>
                </select>
              </div>

              {/* 8. Facebook Page Selection */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Facebook Page (Linked to Ad Creative)</label>
                {fetchedPages.length > 0 ? (
                  <select
                    value={formPageId}
                    onChange={(e) => setFormPageId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium"
                  >
                    {fetchedPages.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        📄 {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formPageId}
                    onChange={(e) => setFormPageId(e.target.value)}
                    placeholder="Facebook Page ID (Auto-detected)"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                )}
              </div>

              {/* 9. Campaign score */}
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
                <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  Cancel
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
                  <span className="text-xs text-amber-400 font-semibold">In Draft</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm pt-1">{campName} → Ad Set & Target Audience Setup</h3>
                <p className="text-xs text-slate-400">Configure performance goal, placements, budget & audience targeting.</p>
              </div>

              {/* 1. Ad set name */}
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

              {/* 2. Performance goal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">Performance Goal</h4>
                <select
                  value={performanceGoal}
                  onChange={(e) => setPerformanceGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                >
                  <option value="MAXIMIZE_REACH">Maximise reach of ads</option>
                  <option value="MAXIMIZE_IMPRESSIONS">Maximise number of impressions</option>
                  <option value="MAXIMIZE_BRAND_RECALL">Maximise brand recall lift</option>
                  <option value="MAXIMIZE_VIDEO_VIEWS">Maximise 2-second continuous video views</option>
                </select>
              </div>

              {/* 3. Budget & Schedule */}
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>

                {liveVideoAd && (
                  <p className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    💡 Suggested budget for live video stream boost applied automatically.
                  </p>
                )}
              </div>

              {/* 4. Audience Targeting */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Audience Controls</h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Locations (Inclusion)</label>
                  <input
                    type="text"
                    value={locationInclusion}
                    onChange={(e) => setLocationInclusion(e.target.value)}
                    placeholder="India, Mumbai, Delhi..."
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
                      <option value="MEN">Men Only</option>
                      <option value="WOMEN">Women Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Detailed Targeting (Interests, Demographics)</label>
                  <input
                    type="text"
                    value={detailedTargeting}
                    onChange={(e) => setDetailedTargeting(e.target.value)}
                    placeholder="e.g. Entrepreneurship, Online Shopping, Marketing..."
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* 5. Placements */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Advantage+ placements</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Automatically maximize budget across Meta feeds, stories & reels.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={advantagePlacements}
                    onChange={(e) => setAdvantagePlacements(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
                  />
                </div>

                {!advantagePlacements && (
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" checked={placementsFeeds} onChange={(e) => setPlacementsFeeds(e.target.checked)} className="accent-amber-500" /> Feeds (Facebook, Instagram)
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" checked={placementsStories} onChange={(e) => setPlacementsStories(e.target.checked)} className="accent-amber-500" /> Stories & Reels
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 4: Ad Creative & Live Preview →
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
                  <h3 className="font-bold text-slate-100 text-sm mt-1">Step 4: Ad Creative, Identity & Live Preview</h3>
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
                    <p className="text-[11px] text-slate-400 mt-0.5">Run ads with creators, brands and other businesses.</p>
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
                      onClick={() => setShowPartnershipModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold"
                    >
                      Enter ad code or post info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPartnershipModal(true)}
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
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Media URL</label>
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

                {destinationType === "WEBSITE" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Website Landing Page URL</label>
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                )}
              </div>

              {/* 7. Conversations Chat Template */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    Conversations Template <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">AI Template</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Edit template
                  </button>
                </div>
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
                  <p className="text-slate-300">Website events Pixel ID: <span className="font-mono text-amber-400 font-bold">{pixelId}</span></p>
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
                  <p className="text-[10px] text-slate-400">Sponsored</p>
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
      {showPartnershipModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Partnership Ad Setup</h3>
            <p className="text-xs text-slate-400">Enter creator ad code or select brand partnership credentials.</p>
            <input type="text" placeholder="Ad code e.g. PARTNER-123" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" />
            <div className="flex justify-end">
              <button onClick={() => setShowPartnershipModal(false)} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                Save Partnership Code
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
