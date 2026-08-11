"use client";
import { useState } from "react";
import {
  X, Loader2, Target, Settings, Check, FileText, Phone, Globe, MessageSquare, Zap, Plus, Search, Eye, Filter, ExternalLink, AlertTriangle, ShieldCheck
} from "lucide-react";

interface LeadsCampaignFlowProps {
  orgId: string;
  backendUrl: string;
  fetchedPages: any[];
  fetchedIgAccounts: any[];
  fetchedWaNumbers: any[];
  onClose: () => void;
  onPublished: () => void;
}

export default function LeadsCampaignFlow({
  orgId,
  backendUrl,
  fetchedPages,
  fetchedIgAccounts,
  fetchedWaNumbers,
  onClose,
  onPublished,
}: LeadsCampaignFlowProps) {
  // Current active step (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2);

  // Sub-step Choice vs Config
  const [leadsSubStep, setLeadsSubStep] = useState<"CHOICE" | "CONFIG">("CHOICE");
  const [leadsStartMode, setLeadsStartMode] = useState<"RECENT" | "NEW">("NEW");

  // STEP 2: Campaign Level State
  const [campName, setCampName] = useState("New Leads campaign");
  const [leadsAdvantagePlus, setLeadsAdvantagePlus] = useState(true);
  const [leadsBudgetStrategy, setLeadsBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [dailyBudget, setDailyBudget] = useState("1200");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [leadsBudgetScheduling, setLeadsBudgetScheduling] = useState(false);
  const [leadsFrequencyControl, setLeadsFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [showMoreBudgetSettings, setShowMoreBudgetSettings] = useState(false);

  // STEP 3: Ad Set Level State
  const [adSetName, setAdSetName] = useState("New Leads ad set");
  const [conversionLocation, setConversionLocation] = useState<string>("INSTANT_FORMS");
  const [performanceGoal, setPerformanceGoal] = useState("MAXIMIZE_LEADS");
  const [costPerResultGoal, setCostPerResultGoal] = useState("");
  const [showValueRulesModal, setShowValueRulesModal] = useState(false);

  // Schedule & Audience
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [locationInclusion, setLocationInclusion] = useState("India");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("ALL");
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [advantagePlacements, setAdvantagePlacements] = useState(true);
  const [brandSuitability, setBrandSuitability] = useState("STANDARD");

  // STEP 4: Ad Level State
  const [adName, setAdName] = useState("New Leads ad");
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
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1556761175-5973dc0f32e7");
  const [aiMedia, setAiMedia] = useState(false);
  const [primaryText, setPrimaryText] = useState("Get high-quality leads directly via instant forms or direct WhatsApp consultation.");
  const [headline, setHeadline] = useState("Sign Up For Your Free Growth Audit Today");
  const [description, setDescription] = useState("Fill out our quick 30-second instant form.");
  const [callToAction, setCallToAction] = useState("SIGN_UP");

  // Instant Form Extras
  const [searchFormsQuery, setSearchFormsQuery] = useState("");
  const [formTab, setFormTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [formTesting, setFormTesting] = useState(false);
  const [requireWorkEmail, setRequireWorkEmail] = useState(false);
  const [adDestinationRadio, setAdDestinationRadio] = useState<"INSTANT" | "WEBSITE" | "CALL" | "MESSAGING">("INSTANT");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com/lead-page");
  const [adsDataSharing, setAdsDataSharing] = useState(true);

  // Conversations Chat Template
  const [chatGreeting, setChatGreeting] = useState("Hi! Thanks for requesting info. How can we help you get started?");
  const [q1, setQ1] = useState("Can I talk to a sales representative?");
  const [q2, setQ2] = useState("What are the pricing plans?");
  const [q3, setQ3] = useState("Schedule a live demo");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Tracking
  const [pixelId, setPixelId] = useState("189283719283");
  const [urlParams, setUrlParams] = useState("utm_source=facebook&utm_medium=cpc&utm_campaign=leads");
  const [showUtmModal, setShowUtmModal] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const selectedPage = fetchedPages.find((p) => p.id === facebookPageId) || fetchedPages[0];

  const handlePublish = async () => {
    if (!campName.trim() || !adSetName.trim() || !adName.trim()) {
      showToast("Please fill in Campaign, Ad Set, and Ad names.");
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: campName,
          objective: "OUTCOME_LEADS",
          dailyBudget: Number(dailyBudget),
          leadsStartMode,
          leadsAdvantagePlus,
          leadsBudgetStrategy,
          budgetMode,
          bidStrategy,
          leadsBudgetScheduling,
          leadsFrequencyControl,
          abTestEnabled,
          specialAdCategory,
          adSetName,
          conversionLocation,
          performanceGoal,
          costPerResultGoal,
          startDate,
          endDate,
          locationInclusion,
          ageMin,
          ageMax,
          gender,
          detailedTargeting,
          advantagePlacements,
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
          formTesting,
          requireWorkEmail,
          adDestinationRadio,
          websiteUrl,
          chatGreeting,
          pixelId,
          urlParams,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Leads Campaign publish failed.");

      showToast("Leads Campaign Created & Published Live! 📋");
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
              <span className="text-xs text-slate-400 font-mono">In Draft • 1 Ad set · 1 Ad</span>
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
              <Filter className="h-10 w-10 text-sky-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-100">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selected: <span className="text-sky-400 font-bold">Leads (OUTCOME_LEADS)</span>
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-sky-400" /> Leads Preview
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
                  Collect leads for your business or brand through Meta Click-to-WhatsApp ads and instant lead forms.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Website and instant forms", "Instant forms", "Messenger, Instagram and WhatsApp", "Calls"].map((tag) => (
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
                    setLeadsSubStep("CHOICE");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  Continue → Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LEADS CAMPAIGN PARAMETERS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">

              {/* 2A. SUB-STEP CHOICE */}
              {leadsSubStep === "CHOICE" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-100 text-sm">Save time and start from a recent leads campaign?</h3>
                    <p className="text-xs text-slate-400">Pick a previous campaign to pre-fill settings, or start fresh.</p>
                  </div>

                  <div className="space-y-3">
                    {/* Option 1: Recent campaign */}
                    <div
                      onClick={() => {
                        setLeadsStartMode("RECENT");
                        setLeadsSubStep("CONFIG");
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        leadsStartMode === "RECENT" ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input type="radio" checked={leadsStartMode === "RECENT"} readOnly className="mt-1 h-4 w-4 text-sky-500" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base">📄</span>
                              <h4 className="font-bold text-slate-100 text-sm">Watpornima-17-June 2026-Leads campaign</h4>
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">Suggested</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Off • Cost per messaging conversation started was ₹20.16</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: New campaign */}
                    <div
                      onClick={() => {
                        setLeadsStartMode("NEW");
                        setLeadsSubStep("CONFIG");
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        leadsStartMode === "NEW" ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={leadsStartMode === "NEW"} readOnly className="h-4 w-4 text-sky-500" />
                          <div>
                            <h4 className="font-bold text-slate-100 text-sm">No, start from a new campaign</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Build a fresh leads campaign step by step.</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-4 py-2 rounded-xl border border-sky-500/20">
                          Continue →
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                      ← Back to Step 1
                    </button>
                    <button onClick={() => setLeadsSubStep("CONFIG")} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                      Continue to Configuration →
                    </button>
                  </div>
                </div>
              )}

              {/* 2B. SUB-STEP CONFIG */}
              {leadsSubStep === "CONFIG" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <button type="button" onClick={() => setLeadsSubStep("CHOICE")} className="text-xs text-sky-400 hover:underline font-semibold mb-1 block">
                        ← Change selection
                      </button>
                      <h3 className="font-bold text-slate-100 text-sm">New Leads campaign</h3>
                      <p className="text-xs text-slate-400 mt-0.5">1 Ad set · 1 Ad · In draft</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">Step 2 of 4</span>
                  </div>

                  {/* 1. Campaign Name */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-200">Campaign name *</label>
                    <input
                      type="text"
                      required
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      placeholder="New Leads campaign"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* 2. Budget Card */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${leadsAdvantagePlus ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                            {leadsAdvantagePlus ? "Advantage+ on" : "Advantage+ off"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Distribute your budget across ad sets automatically.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={leadsAdvantagePlus}
                        onChange={(e) => setLeadsAdvantagePlus(e.target.checked)}
                        className="accent-sky-500 h-4 w-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <div
                        onClick={() => setLeadsBudgetStrategy("CAMPAIGN")}
                        className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 ${
                          leadsBudgetStrategy === "CAMPAIGN" ? "bg-sky-500/10 border-sky-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        <input type="radio" checked={leadsBudgetStrategy === "CAMPAIGN"} readOnly className="mt-1 h-4 w-4 text-sky-500" />
                        <div>
                          <p className="text-xs font-bold">Campaign budget (Advantage+ budget)</p>
                          <p className="text-[11px] text-slate-400">Automatically distribute your budget to best opportunities.</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setLeadsBudgetStrategy("ADSET")}
                        className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 ${
                          leadsBudgetStrategy === "ADSET" ? "bg-sky-500/10 border-sky-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        <input type="radio" checked={leadsBudgetStrategy === "ADSET"} readOnly className="mt-1 h-4 w-4 text-sky-500" />
                        <div>
                          <p className="text-xs font-bold">Ad set budget</p>
                          <p className="text-[11px] text-slate-400">Set different bid strategies or budget schedules for each ad set.</p>
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

                    {/* Detailed Spend Info Box & Warning */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                      <p>You'll spend an average of <span className="text-sky-400 font-bold">₹{dailyBudget}</span> per day.</p>
                      <p className="text-[11px] text-slate-400">
                        Your maximum daily spend is <span className="font-semibold text-slate-200">₹{(Number(dailyBudget) * 1.75).toFixed(0)}</span> and your maximum weekly spend is <span className="font-semibold text-slate-200">₹{(Number(dailyBudget) * 7).toFixed(0)}</span>.{" "}
                        <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                          About daily budget
                        </a>
                      </p>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        <span>⚠ Your spending may exceed ₹{dailyBudget} the first few days.</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-400">Campaign bid strategy</label>
                        <button type="button" onClick={() => showToast("Edit bid strategy")} className="text-xs font-bold text-sky-400 hover:underline">Edit</button>
                      </div>
                      <select
                        value={bidStrategy}
                        onChange={(e) => setBidStrategy(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                      >
                        <option value="HIGHEST_VOLUME">Highest volume</option>
                        <option value="COST_CAP">Cost per result goal</option>
                        <option value="BID_CAP">Bid cap</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMoreBudgetSettings(!showMoreBudgetSettings)}
                      className="text-xs font-bold text-sky-400 hover:underline"
                    >
                      {showMoreBudgetSettings ? "Hide details" : "Show more settings ▾"}
                    </button>
                  </div>

                  {/* 3. Budget Scheduling */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs">Budget scheduling</h4>
                        <p className="text-[11px] text-slate-400">Increase your budget during specific days or times.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={leadsBudgetScheduling}
                        onChange={(e) => setLeadsBudgetScheduling(e.target.checked)}
                        className="accent-sky-500 h-4 w-4"
                      />
                    </div>
                    {leadsBudgetScheduling && (
                      <button type="button" className="text-xs font-bold text-sky-400 hover:underline pt-1 block">
                        + Schedule budget increases
                      </button>
                    )}
                  </div>

                  {/* 4 & 5. Frequency & A/B */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                        <p className="text-[10px] text-slate-400">{leadsFrequencyControl ? "Frequency cap enabled" : "Off"}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={leadsFrequencyControl}
                        onChange={(e) => setLeadsFrequencyControl(e.target.checked)}
                        className="accent-sky-500 h-4 w-4"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                        <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-sky-400 hover:underline">
                          About A/B tests
                        </a>
                      </div>
                      <input
                        type="checkbox"
                        checked={abTestEnabled}
                        onChange={(e) => setAbTestEnabled(e.target.checked)}
                        className="accent-sky-500 h-4 w-4"
                      />
                    </div>
                  </div>

                  {/* 6. Special Ad Categories */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                    <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-sky-400 hover:underline block">
                      About Special Ad Categories
                    </a>
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

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setLeadsSubStep("CHOICE")} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                      ← Back to Selection
                    </button>
                    <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                      Continue to Step 3: Ad Set →
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: AD SET LEVEL (LEADS) */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 3 of 4
                  </span>
                  <span className="text-xs text-sky-400 font-semibold">In Draft</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm pt-1">New Leads campaign → New Leads ad set</h3>
                <p className="text-xs text-slate-400">Configure conversion location, form optimization, and audience parameters.</p>
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

              {/* Conversion Location Dropdown & Facebook Page */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Conversion Location</h4>
                <select
                  value={conversionLocation}
                  onChange={(e) => setConversionLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                >
                  <option value="WEBSITE_AND_INSTANT_FORMS">Website and instant forms</option>
                  <option value="WEBSITE_AND_CALLS">Website and calls</option>
                  <option value="INSTANT_FORMS_AND_MESSENGER">Instant forms and Messenger</option>
                  <option value="INSTANT_FORMS">Instant forms (Recommended)</option>
                  <option value="WEBSITE">Website</option>
                  <option value="MESSENGER">Messenger</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="CALLS">Calls</option>
                  <option value="APP">App</option>
                </select>

                <div>
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

              {/* Performance Goal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Performance Goal &amp; Value Rules</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Performance Goal</label>
                    <select
                      value={performanceGoal}
                      onChange={(e) => setPerformanceGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    >
                      <option value="MAXIMIZE_LEADS">Maximise number of leads</option>
                      <option value="MAXIMIZE_CONVERSION_VALUE">Maximise conversion value</option>
                      <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                      <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cost per result goal (Optional)</label>
                    <input
                      type="text"
                      value={costPerResultGoal}
                      onChange={(e) => setCostPerResultGoal(e.target.value)}
                      placeholder="e.g. ₹45.00"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Value rules</span>
                  <button
                    type="button"
                    onClick={() => setShowValueRulesModal(true)}
                    className="px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold"
                  >
                    Configure Value Rules
                  </button>
                </div>
              </div>

              {/* Audience Definition */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Audience definition</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Locations (Inclusion)</label>
                  <input
                    type="text"
                    value={locationInclusion}
                    onChange={(e) => setLocationInclusion(e.target.value)}
                    placeholder="India..."
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

                <p className="text-[10px] text-slate-400 italic">Estimates note: Estimates don't include Advantage+ audience expansion.</p>
              </div>

              {/* Placements */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Advantage+ placements</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Maximize lead capture efficiency across Meta apps.</p>
                </div>
                <input
                  type="checkbox"
                  checked={advantagePlacements}
                  onChange={(e) => setAdvantagePlacements(e.target.checked)}
                  className="accent-sky-500 h-4 w-4"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 4: Ad Creative & Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NEW LEADS AD */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">New Leads ad</h3>
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
                  placeholder="New Leads ad"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* 2. Partnership Ad Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Partnership ad</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Run lead ads with partners or co-brands.{" "}
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
                <p className="text-[11px] text-sky-400 font-semibold">
                  Any form submitted from your ad will go to <span className="font-bold">{selectedPage?.name || "JISNU Digital Solutions"}</span>.
                </p>
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
                    <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-sky-400 hover:underline">
                      About multi-advertiser ads
                    </a>
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
                      <option value="SIGN_UP">Sign Up</option>
                      <option value="SEND_WHATSAPP_MESSAGE">Send WhatsApp message</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="CONTACT_US">Contact Us</option>
                      <option value="GET_OFFER">Get Offer</option>
                      <option value="BOOK_NOW">Book Now</option>
                    </select>
                  </div>
                </div>

                {callToAction === "SEND_WHATSAPP_MESSAGE" && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    📱 Connected WhatsApp Number: <span className="font-bold">{whatsappPhone}</span>. Edit in Page settings. Active on WhatsApp.
                  </div>
                )}
              </div>

              {/* 6. Destination — Instant Form Extras */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Destination</h4>
                    <p className="text-[11px] text-slate-400">Tell us where to send people immediately after they tap or click your ad.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-100 text-xs">Instant form</h5>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">Selected</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Make connections with people by letting them send contact information and other details to you through a form.
                    </p>
                  </div>
                </div>

                {/* Form Search & Tabs */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchFormsQuery}
                        onChange={(e) => setSearchFormsQuery(e.target.value)}
                        placeholder="Search your forms..."
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <button type="button" className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200">
                      Search
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1 border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setFormTab("ACTIVE")}
                      className={`text-xs font-bold px-3 py-1 rounded-lg ${formTab === "ACTIVE" ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}
                    >
                      Active Forms
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTab("ARCHIVED")}
                      className={`text-xs font-bold px-3 py-1 rounded-lg ${formTab === "ARCHIVED" ? "bg-sky-500/20 text-sky-400" : "text-slate-400"}`}
                    >
                      Archived
                    </button>
                  </div>
                </div>

                {/* Form Testing Toggle */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTesting}
                      onChange={(e) => setFormTesting(e.target.checked)}
                      className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-sky-500"
                    />
                    Form testing
                  </label>
                  <p className="text-[10px] text-slate-400 pl-6">Compare up to five forms to see which one performs best.</p>
                </div>

                {/* Quality Filters Toggle */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireWorkEmail}
                      onChange={(e) => setRequireWorkEmail(e.target.checked)}
                      className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-sky-500"
                    />
                    Quality filters: Require work email address
                  </label>
                  <p className="text-[10px] text-slate-400 pl-6">Leads must verify using an active email address associated with a real organisation.</p>
                </div>

                {/* Lead Nurturing Banner */}
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 space-y-1">
                  <h5 className="font-bold flex items-center gap-1.5"><Zap className="h-4 w-4 text-sky-400" /> Instant form lead nurturing</h5>
                  <p className="text-[11px] text-slate-300">Reach leads where they're most active with tailored post-submission follow-ups through Meta's exclusive channels.</p>
                </div>
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
                <Eye className="h-4 w-4 text-sky-400" /> Ad Live Preview
              </h4>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">66/100</span>
            </div>

            {/* Mobile Ad Card Mockup */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden space-y-2 p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
                  📄
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{selectedPage?.name || "JISNU Digital Solutions"}</p>
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
                <button className="px-2.5 py-1 rounded-md bg-sky-500 text-slate-950 text-[10px] font-bold">
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
            <input
              type="text"
              value={partnershipCode}
              onChange={(e) => setPartnershipCode(e.target.value)}
              placeholder="LEADS-PARTNER-123"
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
