"use client";
import { useState } from "react";
import {
  X, Loader2, Target, Settings, Check, FileText, Phone, Globe, MessageSquare, Zap, Plus
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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Sub-step Choice vs Config
  const [leadsSubStep, setLeadsSubStep] = useState<"CHOICE" | "CONFIG">("CHOICE");
  const [leadsStartMode, setLeadsStartMode] = useState<"RECENT" | "NEW">("NEW");

  // Step 1: Campaign Level
  const [campName, setCampName] = useState("New Leads campaign");
  const [leadsAdvantagePlus, setLeadsAdvantagePlus] = useState(true);
  const [leadsBudgetStrategy, setLeadsBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [dailyBudget, setDailyBudget] = useState("1200");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [leadsBudgetScheduling, setLeadsBudgetScheduling] = useState(false);
  const [leadsFrequencyControl, setLeadsFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);

  // Step 2: Ad Set Level
  const [adSetName, setAdSetName] = useState("New Leads ad set");
  const [leadMethod, setLeadMethod] = useState<"INSTANT_FORMS" | "MESSAGING_APPS" | "WEBSITE" | "CALLS">("INSTANT_FORMS");
  const [performanceGoal, setPerformanceGoal] = useState("MAXIMIZE_LEADS");

  // Step 3: Ad Level
  const [adName, setAdName] = useState("New Leads ad");
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [formTab, setFormTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [formTesting, setFormTesting] = useState(false);
  const [requireWorkEmail, setRequireWorkEmail] = useState(false);
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [callToAction, setCallToAction] = useState("SIGN_UP");

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
          objective: "OUTCOME_LEADS",
          dailyBudget: Number(dailyBudget),
          leadsStartMode,
          adSetName,
          leadMethod,
          performanceGoal,
          adName,
          facebookPageId,
          creativeHeadline: headline || "Sign Up For Free Consultation",
          creativeBody: primaryText || "Fill out our quick form to get started today.",
          creativeMediaUrl: mediaUrl || "https://example.com/lead-image.jpg",
          callToAction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Leads Campaign publish failed.");

      showToast("Leads Campaign created & published live! 📋");
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
            <span className="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider">Meta Ads Manager • Leads Campaign Workspace</span>
            <h1 className="font-bold text-slate-100 text-sm">{campName}</h1>
          </div>
        </div>

        {leadsSubStep === "CONFIG" && (
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
            </div>
          )}

          {/* 2B. CONFIG SCREEN */}
          {leadsSubStep === "CONFIG" && activeStep === 1 && (
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

              {/* Campaign Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-200">Campaign name</label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New Leads campaign"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Budget Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
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
                      <p className="text-[11px] text-slate-400">Distribute budget across ad sets automatically.</p>
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
                      <p className="text-[11px] text-slate-400">Set budget per ad set manually.</p>
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
                      <option value="DAILY">Daily Budget</option>
                      <option value="LIFETIME">Lifetime Budget</option>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign bid strategy</label>
                  <select
                    value={bidStrategy}
                    onChange={(e) => setBidStrategy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="HIGHEST_VOLUME">Highest volume</option>
                    <option value="COST_CAP">Cost per result goal</option>
                    <option value="BID_CAP">Bid cap</option>
                  </select>
                </div>
              </div>

              {/* Budget Scheduling */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Budget scheduling</h4>
                  {leadsBudgetScheduling && <p className="text-xs text-sky-400 font-semibold mt-1">+ Schedule budget increases</p>}
                </div>
                <input
                  type="checkbox"
                  checked={leadsBudgetScheduling}
                  onChange={(e) => setLeadsBudgetScheduling(e.target.checked)}
                  className="accent-sky-500 h-4 w-4"
                />
              </div>

              {/* Frequency & A/B */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                  <input
                    type="checkbox"
                    checked={leadsFrequencyControl}
                    onChange={(e) => setLeadsFrequencyControl(e.target.checked)}
                    className="accent-sky-500 h-4 w-4"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                  <input
                    type="checkbox"
                    checked={abTestEnabled}
                    onChange={(e) => setAbTestEnabled(e.target.checked)}
                    className="accent-sky-500 h-4 w-4"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setActiveStep(2)} className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg">
                  Proceed to Step 2: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AD SET LEVEL */}
          {leadsSubStep === "CONFIG" && activeStep === 2 && (
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
                <h4 className="font-bold text-slate-200 text-xs">Lead Conversion Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeadMethod("INSTANT_FORMS")}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                      leadMethod === "INSTANT_FORMS" ? "bg-sky-500/10 border-sky-500/60 text-sky-300 font-bold" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <FileText className="h-4 w-4" /> Instant Forms
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeadMethod("MESSAGING_APPS")}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                      leadMethod === "MESSAGING_APPS" ? "bg-sky-500/10 border-sky-500/60 text-sky-300 font-bold" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" /> WhatsApp / Messenger
                  </button>
                </div>
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
          {leadsSubStep === "CONFIG" && activeStep === 3 && (
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

              {/* Instant Form Extras */}
              {leadMethod === "INSTANT_FORMS" && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200 text-xs">Instant Form Selection</h4>
                  <div className="flex gap-2 border-b border-slate-800 pb-2">
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

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formTesting}
                        onChange={(e) => setFormTesting(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                      />
                      Form testing mode
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireWorkEmail}
                        onChange={(e) => setRequireWorkEmail(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                      />
                      Require work email address (Quality filter)
                    </label>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Creative Setup</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Sign Up For Free Consultation"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    placeholder="Fill out our quick instant form..."
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
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Live Leads Campaign 🚀"}
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="w-80 bg-slate-950 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Target className="h-4 w-4 text-sky-400" /> Leads Goal Preview
            </h4>
            <p className="text-xs text-slate-400">Method: {leadMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
