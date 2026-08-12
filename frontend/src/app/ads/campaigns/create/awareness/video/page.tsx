"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, LayoutGrid, Zap, ChevronUp, Info, Settings, Sparkles, Image as ImageIcon
} from "lucide-react";

export default function YouTubeVideoPage() {
  const objective = "awareness";
  const type = "video";
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Flow Step: "CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW"
  const [currentStep, setCurrentStep] = useState<"CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW">("CAMPAIGN_SETTINGS");

  // 1. Campaign Settings State
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");

  // 2. Budget and Bidding State
  const [dailyBudget, setDailyBudget] = useState<string>("");

  // 3. Targeting State

  // 4. Ads Creation State
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");
  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = "demo-org-123";
    if (customerId) {
      fetch(`${BACKEND}/api/ads/customer-info?orgId=${orgId}&customerId=${customerId}`)
        .then(r => r.json())
        .then(d => {
          setAccountInfo({
            customerId: d.customerId || customerId,
            name: d.descriptiveName || `Account ${customerId}`
          });
        })
        .catch(() => {
          setAccountInfo({ customerId, name: `Account ${customerId}` });
        });
    }
  }, [customerId]);

  const formattedObjective = objective.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const formattedType = type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs font-semibold">
            <span className="text-slate-400">{formattedObjective}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-bold">{formattedType} Setup</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-950/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <LayoutGrid className="h-4 w-4 text-primary shrink-0" />
              <span>{formattedType}</span>
            </div>

            <nav className="space-y-1 text-xs">
              <div
                onClick={() => setCurrentStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-xl space-y-1 cursor-pointer transition-all ${
                  currentStep === "CAMPAIGN_SETTINGS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Settings className="h-4 w-4" />
                  <span>Campaign settings</span>
                </div>
              </div>

              <div
                onClick={() => setCurrentStep("BUDGET_BIDDING")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  currentStep === "BUDGET_BIDDING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Budget and bidding</span>
              </div>

              <div
                onClick={() => setCurrentStep("TARGETING")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  currentStep === "TARGETING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Targeting</span>
              </div>

              <div
                onClick={() => setCurrentStep("ADS")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  currentStep === "ADS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Ads</span>
              </div>

              <div
                onClick={() => setCurrentStep("REVIEW")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  currentStep === "REVIEW"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Info className="h-4 w-4" />
                <span>Review</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto">
          
          {currentStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>

              {/* Locations Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="loc" checked={selectedLocation === "ALL"} onChange={() => setSelectedLocation("ALL")} className="text-primary h-4 w-4" />
                    <span className="text-slate-200">All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="loc" checked={selectedLocation === "INDIA"} onChange={() => setSelectedLocation("INDIA")} className="text-primary h-4 w-4" />
                    <span className="text-slate-200">India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="loc" checked={selectedLocation === "CUSTOM"} onChange={() => setSelectedLocation("CUSTOM")} className="text-primary h-4 w-4" />
                    <span className="text-slate-200">Enter another location</span>
                  </label>
                </div>
              </div>

              {/* Languages Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="relative max-w-md text-xs">
                  <input
                    type="text"
                    value={languageSearchInput}
                    onChange={(e) => setLanguageSearchInput(e.target.value)}
                    placeholder="Start typing or select a language"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === "BUDGET_BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Budget and bidding</h1>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <label className="block text-slate-200 font-semibold">Average daily budget (₹)</label>
                <input
                  type="text"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-full max-w-xs bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {currentStep === "TARGETING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Targeting</h1>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <p className="text-slate-300">Optimized targeting is enabled for {formattedObjective} ({formattedType}).</p>
              </div>
            </div>
          )}

          {currentStep === "ADS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Ads</h1>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <label className="block font-semibold text-slate-200">Final URL</label>
                <input type="text" value={finalUrl} onChange={(e) => setFinalUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-mono" />
                <label className="block font-semibold text-slate-200 pt-2">Business Name</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100" />
              </div>
            </div>
          )}

          {currentStep === "REVIEW" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Review</h1>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <p>Objective: <strong>{formattedObjective}</strong></p>
                <p>Campaign Type: <strong>{formattedType}</strong></p>
                <p>Status: <span className="text-emerald-400 font-bold">Ready to Publish</span></p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => {
            if (currentStep === "REVIEW") setCurrentStep("ADS");
            else if (currentStep === "ADS") setCurrentStep("TARGETING");
            else if (currentStep === "TARGETING") setCurrentStep("BUDGET_BIDDING");
            else if (currentStep === "BUDGET_BIDDING") setCurrentStep("CAMPAIGN_SETTINGS");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          {currentStep === "CAMPAIGN_SETTINGS" ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {currentStep !== "REVIEW" ? (
            <button
              onClick={() => {
                if (currentStep === "CAMPAIGN_SETTINGS") setCurrentStep("BUDGET_BIDDING");
                else if (currentStep === "BUDGET_BIDDING") setCurrentStep("TARGETING");
                else if (currentStep === "TARGETING") setCurrentStep("ADS");
                else if (currentStep === "ADS") setCurrentStep("REVIEW");
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                alert(`${formattedObjective} - ${formattedType} campaign saved successfully!`);
                router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
            >
              Save & Publish
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
