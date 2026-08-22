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

  // Dynamic Instant Lead Forms from Facebook Page
  const [leadForms, setLeadForms] = useState<any[]>([]);
  const [selectedLeadFormId, setSelectedLeadFormId] = useState<string>("");
  const [loadingForms, setLoadingForms] = useState(false);
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);

  // New Lead Form Creator State
  const [newFormName, setNewFormName] = useState("");
  const [newFormPrivacyUrl, setNewFormPrivacyUrl] = useState("https://jisnudigital.com/privacy");
  const [newFormThankYouTitle, setNewFormThankYouTitle] = useState("Thank you! We received your details.");
  const [newFormThankYouBody, setNewFormThankYouBody] = useState("Our team will reach out to you within 24 hours.");
  const [newFormThankYouBtn, setNewFormThankYouBtn] = useState("VIEW_WEBSITE");
  const [newFormThankYouWebsite, setNewFormThankYouWebsite] = useState("https://jisnudigital.com");
  const [creatingForm, setCreatingForm] = useState(false);

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

  // Fetch Page Instant Forms dynamically
  const fetchLeadForms = async (pageId?: string) => {
    const targetPageId = pageId || facebookPageId;
    if (!targetPageId) return;
    setLoadingForms(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/lead-forms?organizationId=${orgId}&pageId=${targetPageId}`);
      const data = await res.json();
      if (data.forms) {
        setLeadForms(data.forms);
        if (data.forms.length > 0 && !selectedLeadFormId) {
          setSelectedLeadFormId(data.forms[0].id);
        }
      }
    } catch (e) {
      console.warn("Error loading lead forms:", e);
    } finally {
      setLoadingForms(false);
    }
  };

  // Create New Instant Lead Form on Facebook Page
  const handleCreateLeadForm = async () => {
    if (!newFormName.trim()) {
      showToast("Please enter a Lead Form Name.");
      return;
    }
    setCreatingForm(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/lead-forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          pageId: facebookPageId,
          name: newFormName,
          privacyPolicyUrl: newFormPrivacyUrl,
          thankYouTitle: newFormThankYouTitle,
          thankYouBody: newFormThankYouBody,
          thankYouButtonType: newFormThankYouBtn,
          thankYouWebsiteUrl: newFormThankYouWebsite,
          shouldEnforceWorkEmail: requireWorkEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create Instant Form.");
      showToast("New Instant Lead Form Created on Facebook! 🎉");
      setShowCreateFormModal(false);
      await fetchLeadForms(facebookPageId);
      if (data.form?.id) {
        setSelectedLeadFormId(data.form.id);
      }
    } catch (err: any) {
      showToast(`Error creating Form: ${err.message}`);
    } finally {
      setCreatingForm(false);
    }
  };

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
          leadGenFormId: selectedLeadFormId,
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
              <span className="text-xs text-slate-500 font-mono">In Draft • 1 Ad set · 1 Ad</span>
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
              <Filter className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Selected: <span className="text-blue-600 font-bold">Leads (OUTCOME_LEADS)</span>
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-blue-600" /> Leads Preview
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
                  Collect leads for your business or brand through Meta Click-to-WhatsApp ads and instant lead forms.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Website and instant forms", "Instant forms", "Messenger, Instagram and WhatsApp", "Calls"].map((tag) => (
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
                    setLeadsSubStep("CHOICE");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
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
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <h3 className="font-bold text-slate-900 text-sm">Save time and start from a recent leads campaign?</h3>
                    <p className="text-xs text-slate-500">Pick a previous campaign to pre-fill settings, or start fresh.</p>
                  </div>

                  <div className="space-y-3">
                    {/* Option 1: Recent campaign */}
                    <div
                      onClick={() => {
                        setLeadsStartMode("RECENT");
                        setLeadsSubStep("CONFIG");
                      }}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                        leadsStartMode === "RECENT" ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-500/20 text-slate-900" : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input type="radio" checked={leadsStartMode === "RECENT"} readOnly className="mt-1 h-4 w-4 accent-blue-600" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base">📄</span>
                              <h4 className="font-bold text-slate-900 text-sm">Watpornima-17-June 2026-Leads campaign</h4>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">Suggested</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Off • Cost per messaging conversation started was ₹20.16</p>
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
                      className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                        leadsStartMode === "NEW" ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-500/20 text-slate-900" : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={leadsStartMode === "NEW"} readOnly className="h-4 w-4 accent-blue-600" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">No, start from a new campaign</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Build a fresh leads campaign step by step.</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                          Continue →
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setActiveStep(1)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                      ← Back to Step 1
                    </button>
                    <button onClick={() => setLeadsSubStep("CONFIG")} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                      Continue to Configuration →
                    </button>
                  </div>
                </div>
              )}

              {/* 2B. SUB-STEP CONFIG */}
              {leadsSubStep === "CONFIG" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <button type="button" onClick={() => setLeadsSubStep("CHOICE")} className="text-xs text-blue-600 hover:underline font-bold mb-1 block cursor-pointer">
                        ← Change selection
                      </button>
                      <h3 className="font-bold text-slate-900 text-sm">New Leads campaign</h3>
                      <p className="text-xs text-slate-500 mt-0.5">1 Ad set · 1 Ad · In draft</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">Step 2 of 4</span>
                  </div>

                  {/* 1. Campaign Name */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <label className="block text-xs font-bold text-slate-700">Campaign name *</label>
                    <input
                      type="text"
                      required
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      placeholder="New Leads campaign"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* 2. Budget Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">Advantage+ campaign budget</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${leadsAdvantagePlus ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                            {leadsAdvantagePlus ? "Advantage+ on" : "Advantage+ off"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Distribute your budget across ad sets automatically.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                        <input
                          type="checkbox"
                          checked={leadsAdvantagePlus}
                          onChange={(e) => setLeadsAdvantagePlus(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div
                        onClick={() => setLeadsBudgetStrategy("CAMPAIGN")}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                          leadsBudgetStrategy === "CAMPAIGN" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input type="radio" checked={leadsBudgetStrategy === "CAMPAIGN"} readOnly className="mt-1 h-4 w-4 accent-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Campaign budget (Advantage+ budget)</p>
                          <p className="text-[11px] text-slate-500">Automatically distribute your budget to best opportunities.</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setLeadsBudgetStrategy("ADSET")}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                          leadsBudgetStrategy === "ADSET" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input type="radio" checked={leadsBudgetStrategy === "ADSET"} readOnly className="mt-1 h-4 w-4 accent-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Ad set budget</p>
                          <p className="text-[11px] text-slate-500">Set different bid strategies or budget schedules for each ad set.</p>
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

                    {/* Detailed Spend Info Box & Warning */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                      <p>You'll spend an average of <span className="text-blue-600 font-bold">₹{dailyBudget}</span> per day.</p>
                      <p className="text-[11px] text-slate-500">
                        Your maximum daily spend is <span className="font-semibold text-slate-900">₹{(Number(dailyBudget) * 1.75).toFixed(0)}</span> and your maximum weekly spend is <span className="font-semibold text-slate-900">₹{(Number(dailyBudget) * 7).toFixed(0)}</span>.{" "}
                        <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
                          About daily budget
                        </a>
                      </p>
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>⚠ Your spending may exceed ₹{dailyBudget} the first few days.</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">Campaign bid strategy</label>
                        <button type="button" onClick={() => showToast("Edit bid strategy")} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">Edit</button>
                      </div>
                      <select
                        value={bidStrategy}
                        onChange={(e) => setBidStrategy(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="HIGHEST_VOLUME">Highest volume</option>
                        <option value="COST_CAP">Cost per result goal</option>
                        <option value="BID_CAP">Bid cap</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMoreBudgetSettings(!showMoreBudgetSettings)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {showMoreBudgetSettings ? "Hide details" : "Show more settings ▾"}
                    </button>
                  </div>

                  {/* 3. Budget Scheduling */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Budget scheduling</h4>
                        <p className="text-[11px] text-slate-500">Increase your budget during specific days or times.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={leadsBudgetScheduling}
                        onChange={(e) => setLeadsBudgetScheduling(e.target.checked)}
                        className="accent-blue-600 h-4 w-4"
                      />
                    </div>
                    {leadsBudgetScheduling && (
                      <button type="button" className="text-xs font-bold text-blue-600 hover:underline pt-1 block cursor-pointer">
                        + Schedule budget increases
                      </button>
                    )}
                  </div>

                  {/* 4 & 5. Frequency & A/B */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Campaign frequency control</h4>
                        <p className="text-[10px] text-slate-500">{leadsFrequencyControl ? "Frequency cap enabled" : "Off"}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={leadsFrequencyControl}
                        onChange={(e) => setLeadsFrequencyControl(e.target.checked)}
                        className="accent-blue-600 h-4 w-4"
                      />
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">A/B test</h4>
                        <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-bold">
                          About A/B tests
                        </a>
                      </div>
                      <input
                        type="checkbox"
                        checked={abTestEnabled}
                        onChange={(e) => setAbTestEnabled(e.target.checked)}
                        className="accent-blue-600 h-4 w-4"
                      />
                    </div>
                  </div>

                  {/* 6. Special Ad Categories */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-xs">Special Ad Categories</h4>
                    <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-bold block">
                      About Special Ad Categories
                    </a>
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

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setLeadsSubStep("CHOICE")} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                      ← Back to Selection
                    </button>
                    <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
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
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 3 of 4
                  </span>
                  <span className="text-xs text-blue-600 font-bold">In Draft</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm pt-1">New Leads campaign → New Leads ad set</h3>
                <p className="text-xs text-slate-500">Configure conversion location, form optimization, and audience parameters.</p>
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

              {/* Conversion Location Dropdown & Facebook Page */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Conversion Location</h4>
                <select
                  value={conversionLocation}
                  onChange={(e) => setConversionLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-500"
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

              {/* Performance Goal */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Performance Goal &amp; Value Rules</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Performance Goal</label>
                    <select
                      value={performanceGoal}
                      onChange={(e) => setPerformanceGoal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="MAXIMIZE_LEADS">Maximise number of leads</option>
                      <option value="MAXIMIZE_CONVERSION_VALUE">Maximise conversion value</option>
                      <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                      <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Cost per result goal (Optional)</label>
                    <input
                      type="text"
                      value={costPerResultGoal}
                      onChange={(e) => setCostPerResultGoal(e.target.value)}
                      placeholder="e.g. ₹45.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">Value rules</span>
                  <button
                    type="button"
                    onClick={() => setShowValueRulesModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer"
                  >
                    Configure Value Rules
                  </button>
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
                      placeholder="Search Meta Geo Locations (e.g. India, Pune, Maharashtra)..."
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
                      placeholder="Search Meta Interests, Demographics (e.g. Real Estate, Software)..."
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

              {/* Placements */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Advantage+ placements</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Maximize lead capture efficiency across Meta apps.</p>
                </div>
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

          {/* STEP 4: NEW LEADS AD */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">New Leads ad</h3>
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
                  placeholder="New Leads ad"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. Partnership Ad Toggle */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Partnership ad</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Run lead ads with partners or co-brands.{" "}
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
                <p className="text-[11px] text-blue-700 font-semibold">
                  Any form submitted from your ad will go to <span className="font-bold">{selectedPage?.name || "JISNU Digital Solutions"}</span>.
                </p>
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
                    <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-bold">
                      About multi-advertiser ads
                    </a>
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Media URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("Fetched media from Meta Library!")}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Fetch Meta Media Library
                    </button>
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
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs">
                    📱 Connected WhatsApp Number: <span className="font-bold">{whatsappPhone}</span>. Edit in Page settings. Active on WhatsApp.
                  </div>
                )}
              </div>

              {/* 6. Destination — Instant Form Extras */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Destination</h4>
                    <p className="text-[11px] text-slate-500">Tell us where to send people immediately after they tap or click your ad.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs">Instant form</h5>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">Selected</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5">
                      Make connections with people by letting them send contact information and other details to you through a form.
                    </p>
                  </div>
                </div>

                {/* Live Form Selection & Creation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900">Select Instant Lead Form</h5>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fetchLeadForms(facebookPageId)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        {loadingForms ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> : "↻ Refresh Forms"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateFormModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Create Form
                      </button>
                    </div>
                  </div>

                  {loadingForms ? (
                    <div className="p-5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Fetching Instant Forms from Facebook Page...</span>
                    </div>
                  ) : leadForms.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <p className="text-xs text-slate-500">No Instant Forms found on this Page yet.</p>
                      <button
                        type="button"
                        onClick={() => setShowCreateFormModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer"
                      >
                        + Create Your First Lead Form
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {leadForms
                        .filter(f => !searchFormsQuery || f.name?.toLowerCase().includes(searchFormsQuery.toLowerCase()))
                        .map((f: any) => (
                          <div
                            key={f.id}
                            onClick={() => setSelectedLeadFormId(f.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                              selectedLeadFormId === f.id
                                ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">{f.name}</p>
                              <p className="text-[10px] text-slate-500">ID: {f.id} • Status: {f.status || "ACTIVE"} • Leads: {f.leads_count || 0}</p>
                            </div>
                            <input
                              type="radio"
                              name="lead_form"
                              checked={selectedLeadFormId === f.id}
                              onChange={() => setSelectedLeadFormId(f.id)}
                              className="accent-blue-600 h-4 w-4"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Form Testing Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTesting}
                      onChange={(e) => setFormTesting(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    Form testing
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6">Compare up to five forms to see which one performs best.</p>
                </div>

                {/* Quality Filters Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireWorkEmail}
                      onChange={(e) => setRequireWorkEmail(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    Quality filters: Require work email address
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6">Leads must verify using an active email address associated with a real organisation.</p>
                </div>

                {/* Lead Nurturing Banner */}
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <h5 className="font-bold flex items-center gap-1.5 text-blue-800"><Zap className="h-4 w-4 text-blue-600" /> Instant form lead nurturing</h5>
                  <p className="text-[11px] text-slate-700">Reach leads where they're most active with tailored post-submission follow-ups through Meta's exclusive channels.</p>
                </div>
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
                  <p className="text-xs font-bold text-slate-900">{selectedPage?.name || "JISNU Digital Solutions"}</p>
                  <p className="text-[10px] text-slate-400">Sponsored</p>
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
            <input
              type="text"
              value={partnershipCode}
              onChange={(e) => setPartnershipCode(e.target.value)}
              placeholder="LEADS-PARTNER-123"
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

      {/* Create Lead Form Modal */}
      {showCreateFormModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-blue-600" /> Create Instant Lead Form
              </h3>
              <button onClick={() => setShowCreateFormModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Form Name *</label>
                <input
                  type="text"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="e.g. Free Consultation Lead Form"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Default Captured Questions</label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600 font-medium">
                  <p>✓ Full Name (FULL_NAME)</p>
                  <p>✓ Email Address (EMAIL)</p>
                  <p>✓ Phone Number (PHONE)</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Privacy Policy URL *</label>
                <input
                  type="text"
                  value={newFormPrivacyUrl}
                  onChange={(e) => setNewFormPrivacyUrl(e.target.value)}
                  placeholder="https://yoursite.com/privacy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <h4 className="font-bold text-slate-900">Thank You / Completion Screen</h4>
                <div>
                  <label className="block text-slate-500 text-[11px] font-bold mb-1">Thank You Title</label>
                  <input
                    type="text"
                    value={newFormThankYouTitle}
                    onChange={(e) => setNewFormThankYouTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] font-bold mb-1">Thank You Message</label>
                  <input
                    type="text"
                    value={newFormThankYouBody}
                    onChange={(e) => setNewFormThankYouBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[11px] font-bold mb-1">Button Action</label>
                    <select
                      value={newFormThankYouBtn}
                      onChange={(e) => setNewFormThankYouBtn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="VIEW_WEBSITE">View Website</option>
                      <option value="CALL_BUSINESS">Call Business</option>
                      <option value="MESSAGE_BUSINESS">Message Business</option>
                      <option value="DOWNLOAD">Download Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] font-bold mb-1">Website URL</label>
                    <input
                      type="text"
                      value={newFormThankYouWebsite}
                      onChange={(e) => setNewFormThankYouWebsite(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateFormModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateLeadForm}
                disabled={creatingForm}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {creatingForm ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save & Create Form"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
