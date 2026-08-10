"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical
} from "lucide-react";

const VIDEO_CONFIGS = {
  SALES: {
    objective: "SALES",
    objectiveLabel: "Sales",
    headerTitle: "Sales Video Campaign Setup"
  },
  LEADS: {
    objective: "LEADS",
    objectiveLabel: "Leads",
    headerTitle: "Leads Video Campaign Setup"
  }
};

export default function VideoCampaignCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const rawObjective = (searchParams.get("objective") || "LEADS").toUpperCase();
  const currentConfig = rawObjective === "SALES" ? VIDEO_CONFIGS.SALES : VIDEO_CONFIGS.LEADS;

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Form states matching user prompt screenshot
  const [adGroupName, setAdGroupName] = useState<string>("Ad group 1");
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [channelChoice, setChannelChoice] = useState<"ALL" | "CHOOSE">("ALL");
  const [includeDisplayNetwork, setIncludeDisplayNetwork] = useState<boolean>(true);
  const [useOptimizedTargeting, setUseOptimizedTargeting] = useState<boolean>(true);
  const [onlyAgeGenderSpecs, setOnlyAgeGenderSpecs] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Back to Campaign Setup"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-sm font-semibold text-slate-200">{currentConfig.headerTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "658-735-5041 JISNU Digital Solutions PVT LTD"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto pb-24">
        
        {/* Upgrade Banner Notice matching prompt text */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-3 shadow-md">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">You can no longer create new video conversion campaigns because they're being upgraded to Demand Gen campaigns.</p>
            <p className="text-[11px] text-amber-300/80">Capturing engagement and action across YouTube, including Shorts, Discover, and Gmail, Demand Gen campaigns are ideal for social advertisers.</p>
          </div>
        </div>

        {/* Video Ad Group Setup Form matching prompt screenshot */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl animate-in fade-in duration-200">
          <h1 className="text-xl font-semibold text-white tracking-tight">{adGroupName}</h1>

          {/* 1. Ad group name Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Ad group name</label>
            <input
              type="text"
              value={adGroupName}
              onChange={(e) => setAdGroupName(e.target.value)}
              maxLength={256}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Text is {adGroupName.length} characters out of 256</span>
              <span>{adGroupName.length} / 256</span>
            </div>
          </div>

          {/* 2. Locations Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200">Locations</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>
            <p className="text-xs text-slate-400">Select locations for this campaign</p>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="videoLocationChoice"
                  checked={selectedLocation === "ALL"}
                  onChange={() => setSelectedLocation("ALL")}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-200">All countries and territories</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="videoLocationChoice"
                  checked={selectedLocation === "INDIA"}
                  onChange={() => setSelectedLocation("INDIA")}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-200">India</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="videoLocationChoice"
                  checked={selectedLocation === "CUSTOM"}
                  onChange={() => setSelectedLocation("CUSTOM")}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-200">Enter another location</span>
              </label>

              {selectedLocation === "CUSTOM" && (
                <div className="ml-7 pt-2 space-y-2 animate-in fade-in duration-200">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={customLocationInput}
                      onChange={(e) => setCustomLocationInput(e.target.value)}
                      placeholder="Enter a location to target or exclude"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Languages Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200">Languages</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>
            <p className="text-xs text-slate-400">Select the languages your customers speak.</p>
            <div className="space-y-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={languageSearchInput}
                  onChange={(e) => setLanguageSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && languageSearchInput.trim()) {
                      setSelectedLanguages(prev => [...prev, languageSearchInput.trim()]);
                      setLanguageSearchInput("");
                    }
                  }}
                  placeholder="Start typing or select a language"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 font-medium">All languages</span>
                {selectedLanguages.map((lang, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-medium">
                    {lang}
                    <button onClick={() => setSelectedLanguages(prev => prev.filter((_, i) => i !== idx))}>
                      <X className="h-3 w-3 hover:text-rose-400" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Channels Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200">Channels</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>
            <p className="text-xs text-slate-400">Choose which ad channels your ad group is eligible to serve on</p>
            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="videoChannelChoice"
                  checked={channelChoice === "ALL"}
                  onChange={() => setChannelChoice("ALL")}
                  className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">All Google channels</span>
                  <span className="text-[11px] text-slate-400 block">Your ad will show across all eligible Google channels, driving campaign performance</span>
                  {channelChoice === "ALL" && (
                    <div className="mt-2 pl-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeDisplayNetwork}
                          onChange={(e) => setIncludeDisplayNetwork(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-300 text-[11px]">Include Google Display Network</span>
                      </label>
                    </div>
                  )}
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer border-t border-slate-800/60 pt-2.5">
                <input
                  type="radio"
                  name="videoChannelChoice"
                  checked={channelChoice === "CHOOSE"}
                  onChange={() => setChannelChoice("CHOOSE")}
                  className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">Let me choose</span>
                  <span className="text-[11px] text-slate-400 block">Your ad will be limited to show only on the eligible channels of your choice</span>
                </div>
              </label>
            </div>
          </div>

          {/* 5. Audience Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200">Audience</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audiences allow you to reach people based on who they are, their interests and habits, what they're actively researching, or how they've interacted with your business or organization. To ensure your ads deliver the best results, select an existing audience or create a new one.
            </p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
            >
              <Plus className="h-3.5 w-3.5" /> Add an audience
            </button>
          </div>

          {/* 6. Optimized targeting Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200">Optimized targeting</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized targeting helps you get more conversions within your budget. Google may find people beyond your selected audience.
            </p>
            <div className="space-y-2 text-xs pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useOptimizedTargeting}
                  onChange={(e) => setUseOptimizedTargeting(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-primary h-4 w-4"
                />
                <span className="font-semibold text-slate-200">Use optimized targeting</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer pl-7">
                <input
                  type="checkbox"
                  checked={onlyAgeGenderSpecs}
                  onChange={(e) => setOnlyAgeGenderSpecs(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-primary h-3.5 w-3.5"
                />
                <span className="text-slate-300">Only show ads to people within my age and gender specifications</span>
              </label>
            </div>
            <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
              Ads have seen an average of 20% more conversions by using optimized targeting. Information such as your selected audience, landing page, and assets are used to find people likely to convert. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
            </div>
          </div>

          {/* 7. Ad group URL options Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200">Ad group URL options</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>
            <p className="text-xs text-slate-400">No options set</p>
          </div>

        </div>
      </main>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            alert(`Video campaign ad group "${adGroupName}" saved!`);
            router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          Save & Continue
          <Check className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
