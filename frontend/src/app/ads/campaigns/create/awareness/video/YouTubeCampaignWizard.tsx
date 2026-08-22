"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw
} from "lucide-react";

const Youtube = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function YouTubeCampaignWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  const todayStr = new Date().toISOString().split("T")[0];

  // Active step (1 to 7) - Default to 4 (Ad Group)
  const [step, setStep] = useState<number>(4);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth matching exact Google Ads specs)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "AWARENESS",
    campaignGoal: "VIDEO_VIEWS" as "VIDEO_VIEWS" | "REACH" | "ENGAGEMENT",
    campaignGroup: "",
    campaignName: `Video views - ${todayStr}`,
    adFormats: {
      skippableInStream: true,
      inFeed: true,
      shorts: true
    },
    bidStrategy: "TARGET_CPV",
    budgetType: "TOTAL" as "DAILY" | "TOTAL",
    budgetAmount: "",
    startDate: "2026-08-12",
    endDateType: "TWO_WEEKS" as "NONE" | "TWO_WEEKS" | "CUSTOM",
    endDate: "2026-08-26",
    networks: {
      youtube: true,
      googleTv: false,
      googlePartners: true
    },
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocationInput: "",
    languages: ["All languages"],
    languageSearchInput: "",
    relatedVideos: [] as string[],

    // Ad Group Section
    adGroupName: `Video views - ${todayStr}`,
    audienceName: "",
    demographics: {
      female: true,
      male: true,
      unknownGender: true,
      ageMin: "18",
      ageMax: "65+",
      unknownAge: true
    },
    interestsInput: "",
    firstPartyDataInput: "",
    lookalikeSegment: false,
    additionalAudienceSegments: false,
    audienceExpansion: false,

    // Content Section
    keywords: [] as string[],
    keywordInput: "",
    websiteIdeaInput: "",
    productIdeaInput: "",
    topicsSearchInput: "",
    selectedTopics: [] as string[],
    placementsSearchInput: "",
    placementTypes: {
      channels: true,
      videos: true,
      websites: true,
      apps: true,
      appCategories: true
    },

    // Video Ads Section
    videoSearchUrl: "",
    videoUrls: [] as string[],

    // Bidding Section
    targetCpv: ""
  });

  // UI state
  const [previewTab, setPreviewTab] = useState<"IN_STREAM" | "IN_FEED" | "SHORTS">("IN_STREAM");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-slate-900">
      
      {/* ── Top Google Ads Header Navigation ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Close Wizard"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 text-xs font-medium">
            <span className="text-slate-500">YouTube reach, views & engagements</span>
            <span className="text-slate-600">/</span>
            <span className="text-red-400 font-semibold flex items-center gap-1.5">
              <Youtube className="h-4 w-4" /> Video Campaign Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-slate-100 border border-slate-300/60 rounded-md text-slate-700 font-mono flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>ID: {customerId}</span>
          </div>
          <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900 transition-all" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">

        {/* ── Left Sidebar Navigation (Matching Performance Max Style) ── */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50/50 hidden md:block shrink-0 overflow-y-auto hidden-scrollbar select-none">
          <div className="p-6 space-y-6">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Sparkles className="h-4 w-4 text-red-400 shrink-0" />
              <span>Performance Max</span>
            </div>

            <nav className="space-y-1.5 text-xs font-sans">
              {/* 1. Bidding */}
              <div className="space-y-1">
                <div
                  onClick={() => setStep(6)}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    step === 6
                      ? "bg-red-600/10 text-red-400 border border-red-500/30 font-bold"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  <span>1. Bidding</span>
                </div>
                {step === 6 && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="text-red-400 font-medium">Bidding</p>
                    <p className="hover:text-slate-800">Customer acquisition</p>
                    <p className="hover:text-slate-800">Customer retention</p>
                  </div>
                )}
              </div>

              {/* 2. Campaign settings */}
              <div className="space-y-1">
                <div
                  onClick={() => setStep(3)}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    step === 3
                      ? "bg-red-600/10 text-red-400 border border-red-500/30 font-bold"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  <span>2. Campaign settings</span>
                </div>
                {step === 3 && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Locations</p>
                    <p className="hover:text-slate-800">Languages</p>
                    <p className="hover:text-slate-800">EU political ads</p>
                    <div className="pt-1">
                      <p className="text-slate-700 font-semibold">more settings</p>
                      <div className="ml-2 space-y-0.5 text-[10px] text-slate-500">
                        <p>Ad Schedule</p>
                        <p>Start and end dates</p>
                        <p>Campaign URL options</p>
                        <p>Page Feeds</p>
                        <p>Devices</p>
                        <p>Brand exclusions</p>
                        <p>Demographic exclusions</p>
                        <p>Audience exclusions</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Asset group */}
              <div className="space-y-1">
                <div
                  onClick={() => setStep(4)}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    step === 4
                      ? "bg-red-600/10 text-red-400 border border-red-500/30 font-bold"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  <span>3. Asset group</span>
                </div>
                {step === 4 && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Name</p>
                    <p className="hover:text-slate-800">Final URL</p>
                    <p className="hover:text-slate-800">Assets</p>
                    <p className="hover:text-slate-800">Asset optimization</p>
                    <p className="hover:text-slate-800">Search themes</p>
                    <p className="hover:text-slate-800">Audience signal</p>
                  </div>
                )}
              </div>

              {/* 4. Budget */}
              <div
                onClick={() => setStep(3)}
                className={`p-2 rounded-lg font-medium cursor-pointer transition-all ${
                  step === 3
                    ? "bg-red-600/10 text-red-400 border border-red-500/30 font-bold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                <span>4. Budget</span>
              </div>

              {/* 5. Summary */}
              <div
                onClick={() => setStep(7)}
                className={`p-2 rounded-lg font-medium cursor-pointer transition-all ${
                  step === 7
                    ? "bg-red-600/10 text-red-400 border border-red-500/30 font-bold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                <span>5. Summary</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 max-w-5xl mx-auto">
          
          {/* CAMPAIGN SETTINGS & COMPLETE FLOW */}
          <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Campaign settings</h1>

            {/* Campaign group settings */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Campaign group settings</h2>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Video campaign group</label>
                <input
                  type="text"
                  value={formData.campaignGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignGroup: e.target.value }))}
                  placeholder="Select or enter video campaign group"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add this campaign to a video campaign group to control reach and frequency across campaigns and get aggregated reporting
              </p>
            </div>

            {/* General settings */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">General settings</h2>
              <div className="text-xs text-slate-700 flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span><strong>Type:</strong> Video campaign</span>
                <span><strong>Goal:</strong> YouTube reach, views, and engagements</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Campaign name</label>
                  <span className="text-[11px] font-mono text-slate-500">{formData.campaignName.length} / 256</span>
                </div>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  maxLength={256}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">Text is {formData.campaignName.length} characters out of 256</p>
              </div>
            </div>

            {/* Ad formats */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Ad formats</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Using all available formats can help you get up to 40% more views, 40% more consideration lift, and 25% more search lift
              </p>

              <div className="space-y-2.5">
                {[
                  { id: "skippableInStream", label: "Skippable in-stream ads" },
                  { id: "inFeed", label: "In-feed ads" },
                  { id: "shorts", label: "Shorts ads" }
                ].map((fmt) => (
                  <label key={fmt.id} className="flex items-center gap-3 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.adFormats as any)[fmt.id]}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          adFormats: { ...prev.adFormats, [fmt.id]: checked }
                        }));
                      }}
                      className="h-4 w-4 rounded text-red-600 bg-slate-50 border-slate-200"
                    />
                    <span>{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bid strategy */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Bid strategy</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Select your bid strategy</label>
                <select
                  value={formData.bidStrategy}
                  onChange={(e) => setFormData(prev => ({ ...prev, bidStrategy: e.target.value }))}
                  className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:border-red-500 focus:outline-none"
                >
                  <option value="TARGET_CPV">Target CPV</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2 leading-relaxed">
                <p>The following bid strategies aren't available in this campaign: <strong>Maximum CPV, Target CPM, Viewable CPM, Target CPA, Maximize conversions, Maximize conversion value, Target ROAS</strong></p>
                <p>
                  With TrueView target cost-per-view (previously called Target cost-per-view) you set the average amount you want to pay for TrueView views of this campaign. From the TrueView target CPV you set, we’ll optimize bids to help get as many TrueView views as possible. Some TrueView views may cost more or less than your target.
                </p>
              </div>
            </div>

            {/* Budget and dates */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Budget and dates</h2>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">Enter budget type and amount</p>

                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={formData.budgetType}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetType: e.target.value as any }))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="TOTAL">Campaign total</option>
                    <option value="DAILY">Daily</option>
                  </select>

                  <div className="relative w-48">
                    <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                    <input
                      type="text"
                      value={formData.budgetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                      placeholder="Required"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-amber-400/80 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Start date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">End date</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={formData.endDateType}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDateType: e.target.value as any }))}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        >
                          <option value="TWO_WEEKS">2 weeks</option>
                          <option value="CUSTOM">Select a date</option>
                          <option value="NONE">None</option>
                        </select>
                        <span className="text-[11px] text-amber-400 font-medium">Required</span>
                      </div>
                      {formData.endDateType === "CUSTOM" && (
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Campaign total budget represents your total spend for the duration of the campaign. You must schedule an end date for the campaign. <a href="#" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline">Learn more</a>
                </p>
              </div>
            </div>

            {/* Networks */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Networks</h2>
              <p className="text-xs font-semibold text-slate-700">YouTube & Google</p>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.networks.youtube}
                    onChange={(e) => setFormData(prev => ({ ...prev, networks: { ...prev.networks, youtube: e.target.checked } }))}
                    className="mt-0.5 rounded text-red-600 bg-slate-50 border-slate-200 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">YouTube</span>
                    <span className="text-slate-500 block">Ads can appear on YouTube videos and channels, YouTube home, and in YouTube search results</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.networks.googleTv}
                    onChange={(e) => setFormData(prev => ({ ...prev, networks: { ...prev.networks, googleTv: e.target.checked } }))}
                    className="mt-0.5 rounded text-red-600 bg-slate-50 border-slate-200 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Google TV</span>
                    <span className="text-slate-500 block">Ads can appear in video-streaming apps available with Google TV. The Google TV network is only available for campaigns running in the United States <a href="#" onClick={e => e.preventDefault()} className="text-red-400 hover:underline">Learn more</a></span>
                  </div>
                </label>

                <div className="pt-2">
                  <p className="font-semibold text-slate-700 mb-2">Google partners</p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.networks.googlePartners}
                      onChange={(e) => setFormData(prev => ({ ...prev, networks: { ...prev.networks, googlePartners: e.target.checked } }))}
                      className="mt-0.5 rounded text-red-600 bg-slate-50 border-slate-200 h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Video partners on the Google Display Network</span>
                      <span className="text-slate-500 block">Video partners extend the reach of video ads to a collection of sites and apps in the Google Display Network. <a href="#" onClick={e => e.preventDefault()} className="text-red-400 hover:underline">Learn more</a></span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Locations</h2>
              <p className="text-xs text-slate-500">Select locations for this campaign</p>

              <div className="space-y-2.5 text-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="locRad"
                    checked={formData.locationType === "ALL"}
                    onChange={() => setFormData(prev => ({ ...prev, locationType: "ALL" }))}
                    className="text-red-600 h-4 w-4"
                  />
                  <span>All countries and territories</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="locRad"
                    checked={formData.locationType === "INDIA"}
                    onChange={() => setFormData(prev => ({ ...prev, locationType: "INDIA" }))}
                    className="text-red-600 h-4 w-4"
                  />
                  <span>India</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="locRad"
                    checked={formData.locationType === "CUSTOM"}
                    onChange={() => setFormData(prev => ({ ...prev, locationType: "CUSTOM" }))}
                    className="text-red-600 h-4 w-4"
                  />
                  <span>Enter another location</span>
                </label>
              </div>
            </div>

            {/* Languages */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Languages</h2>
              <p className="text-xs text-slate-500">Select the languages your customers speak.</p>

              <div className="space-y-3">
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.languageSearchInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, languageSearchInput: e.target.value }))}
                    placeholder="Start typing or select a language"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-slate-700 font-medium">
                    All languages
                  </span>
                </div>
              </div>
            </div>

            {/* Related videos */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Related videos</h2>
              <p className="text-xs font-semibold text-slate-700">Add videos related to your video ads to help increase engagement</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Related videos appear below your video ad and offer an immersive video experience to help reinforce and extend your ad's message. <a href="#" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline">Learn more</a>
              </p>
            </div>

            {/* Additional settings */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6">
              <h2 className="text-sm font-bold text-slate-900">Additional settings</h2>

              {/* Devices */}
              <div className="space-y-3 border-b border-slate-200 pb-4 text-xs">
                <h3 className="font-bold text-slate-800">Devices</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="devRad" defaultChecked className="text-red-600 h-4 w-4" />
                    <span>Show on all eligible devices (computers, mobile, tablet, and TV screens)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="devRad" className="text-red-600 h-4 w-4" />
                    <span>Set specific targeting for devices</span>
                  </label>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Showing ads on all devices helps expand your reach. To focus your reach on specific devices, set device targeting. <a href="#" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline">Learn more</a>
                </p>
              </div>

              {/* Frequency capping */}
              <div className="space-y-3 border-b border-slate-200 pb-4 text-xs">
                <h3 className="font-bold text-slate-800">Frequency capping</h3>
                <p className="text-slate-500">Limit how many times that ads in this campaign can show to the same person</p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded text-red-600 bg-slate-50 border-slate-200 h-4 w-4" />
                    <span className="font-bold text-slate-800">Cap impression frequency</span>
                  </label>
                  <p className="text-[11px] text-slate-500 pl-7">Limit how many times that ads in this campaign can show to the same person</p>

                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input type="checkbox" className="rounded text-red-600 bg-slate-50 border-slate-200 h-4 w-4" />
                    <span className="font-bold text-slate-800">Cap view frequency</span>
                  </label>
                  <p className="text-[11px] text-slate-500 pl-7">Limit how many times that ads in this campaign can get a view or interaction from the same person</p>
                </div>
              </div>

              {/* Ad schedule */}
              <div className="space-y-3 border-b border-slate-200 pb-4 text-xs">
                <h3 className="font-bold text-slate-800">Ad schedule</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <select className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none">
                    <option value="All days">All days</option>
                  </select>
                  <select className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none">
                    <option value="12:00 AM">12:00 AM</option>
                  </select>
                  <span className="text-slate-500">to</span>
                  <select className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none">
                    <option value="12:00 AM">12:00 AM</option>
                  </select>
                </div>
                <div className="space-y-1 text-slate-500 text-[11px] leading-relaxed">
                  <p>To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline">Learn more</a></p>
                  <p>Based on account time zone: <strong>(GMT+05:30) India Standard Time</strong></p>
                  <p>To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                </div>
              </div>

              {/* Third-party measurement */}
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-slate-800">Third-party measurement</h3>
                <p className="text-slate-500 leading-relaxed">
                  Add vendors to let them see measurement data for this campaign. Only vendors that have already been added to your account can be used for new campaigns.
                </p>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium">
                  There are no available vendors for this campaign. You can add new vendors in your account settings
                </div>
              </div>
            </div>

            {/* ── CREATE YOUR AD GROUP ── */}
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <h1 className="text-2xl font-bold text-slate-900">Create your ad group</h1>

              {/* Ad group name */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Ad group name</label>
                  <span className="text-[11px] font-mono text-slate-500">{formData.adGroupName.length} / 256</span>
                </div>
                <input
                  type="text"
                  value={formData.adGroupName}
                  onChange={(e) => setFormData(prev => ({ ...prev, adGroupName: e.target.value }))}
                  maxLength={256}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">Text is {formData.adGroupName.length} characters out of 256</p>
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>Combining audience and content settings in the same ad group can limit your reach and increase your costs. This excludes audience settings for age and gender.</span>
                </div>
              </div>

              {/* Audience */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">Audience</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Audiences allow you to reach people based on who they are, their interests and habits, what they're actively researching, or how they've interacted with your business or organization.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Audience name</label>
                    <p className="text-[11px] text-slate-500 mb-1">Add a name for your audience to save it to your library (optional)</p>
                    <input
                      type="text"
                      value={formData.audienceName}
                      onChange={(e) => setFormData(prev => ({ ...prev, audienceName: e.target.value }))}
                      placeholder="Enter audience name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <p className="text-xs font-semibold text-slate-700">Include people who match any of the following</p>

                  {/* Demographics */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                    <h3 className="font-bold text-slate-800">Demographics</h3>
                    <p className="text-slate-500">People with the following demographics</p>

                    <div className="space-y-2">
                      <p className="font-semibold text-slate-700">Gender</p>
                      <div className="flex flex-wrap gap-4">
                        {["Female", "Male", "Unknown"].map((g) => (
                          <label key={g} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded text-red-600 bg-white border-slate-200 h-4 w-4" />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="font-semibold text-slate-700">Age</p>
                      <div className="flex items-center gap-3">
                        <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900">
                          <option>18</option>
                        </select>
                        <span className="text-slate-500">to</span>
                        <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900">
                          <option>65+</option>
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer ml-2">
                          <input type="checkbox" defaultChecked className="rounded text-red-600 bg-white border-slate-200 h-4 w-4" />
                          <span>Unknown</span>
                        </label>
                      </div>
                    </div>

                    <button type="button" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline text-[11px] pt-1">
                      Additional demographics ▾
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">Narrow audience to people who match the following</p>

                  {/* Interests & detailed demographics */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <h3 className="font-bold text-slate-800">Interests & detailed demographics</h3>
                    <p className="text-slate-500">Add any interests, detailed demographics, or life events related to your customers</p>
                    <input
                      type="text"
                      value={formData.interestsInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestsInput: e.target.value }))}
                      placeholder="Add in-market segments, life events, and more"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Your data */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <h3 className="font-bold text-slate-800">Your data</h3>
                    <p className="text-slate-500">First-party data can help us reach your customers</p>
                    <input
                      type="text"
                      value={formData.firstPartyDataInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstPartyDataInput: e.target.value }))}
                      placeholder="Add your data"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Lookalike segment */}
                  <button type="button" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline text-xs block">
                    Lookalike segment ▾
                  </button>

                  {/* Additional audience segments */}
                  <button type="button" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline text-xs block">
                    Additional audience segments ▾
                  </button>

                  {/* Audience expansion */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Audience expansion</span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[11px]">Off</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">Content</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Build product and brand association with content keywords, topics, and placements.
                </p>

                {/* Keywords */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-800">Keywords</h3>
                  <p className="text-slate-500">Choose terms related to your products or services to target relevant content</p>
                  <textarea
                    rows={4}
                    value={formData.keywordInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywordInput: e.target.value }))}
                    placeholder="Enter or paste keywords. You can separate each keyword by commas or enter one per line."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-mono focus:border-red-500 focus:outline-none"
                  />

                  <div className="pt-2 space-y-2">
                    <p className="font-semibold text-slate-700">Get keyword ideas</p>
                    <input
                      type="text"
                      value={formData.websiteIdeaInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteIdeaInput: e.target.value }))}
                      placeholder="Enter a related website"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={formData.productIdeaInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, productIdeaInput: e.target.value }))}
                      placeholder="Enter your product or service"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      We only show keyword ideas that are relevant to your business. To get ideas, enter your landing page, a related website, or words or phrases that describe your product or service in the field above.
                    </p>
                  </div>
                </div>

                {/* Topics */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <h3 className="font-bold text-slate-800">Topics</h3>
                  <p className="text-slate-500">Select topics to show ads on content about specific subjects.</p>
                  <input
                    type="text"
                    value={formData.topicsSearchInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, topicsSearchInput: e.target.value }))}
                    placeholder="Search by word or phrase"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900"
                  />
                </div>

                {/* Placements */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-800">Placements</h3>
                  <p className="text-slate-500">Select your placement targeting</p>
                  <input
                    type="text"
                    value={formData.placementsSearchInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, placementsSearchInput: e.target.value }))}
                    placeholder="Search by word, phrase, URL, or video ID"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 font-medium">
                    <span className="p-2 rounded-lg bg-white border border-slate-200">YouTube channels</span>
                    <span className="p-2 rounded-lg bg-white border border-slate-200">YouTube videos</span>
                    <span className="p-2 rounded-lg bg-white border border-slate-200">Websites</span>
                    <span className="p-2 rounded-lg bg-white border border-slate-200">Apps</span>
                    <span className="p-2 rounded-lg bg-white border border-slate-200">App categories (141)</span>
                  </div>

                  <p className="text-slate-500 font-semibold pt-1">None selected</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Your ad can appear on any YouTube or Display Network placements that match your other targeting. Add specific placements to narrow your targeting. If a specific website you target has an equivalent app, your ads can also show there.
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Note: Google's policy doesn't allow you to target placements that promote hatred, intolerance, discrimination, or violence towards an individual or group. All campaigns are subject to the Google Ads advertising policies. <a href="#" onClick={e => e.preventDefault()} className="text-red-400 font-semibold hover:underline">Learn more</a>
                  </p>
                </div>
              </div>
            </div>

            {/* ── CREATE YOUR VIDEO ADS ── */}
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <h1 className="text-2xl font-bold text-slate-900">Create your video ads</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create one or more ads now, or skip this step and create them later. Your campaign won't run without at least one ad.
              </p>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">Your YouTube video</h2>
                <p className="text-xs text-slate-500">Add up to 5 videos. Get more TrueView views with vertical and horizontal videos.</p>

                <div className="relative max-w-xl">
                  <input
                    type="text"
                    value={formData.videoSearchUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoSearchUrl: e.target.value }))}
                    placeholder="Search for a video or paste the URL from YouTube"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-amber-400/80 focus:border-red-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-amber-400 font-semibold block mt-1">Required</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
                  Add a video to see a preview of your video ad
                </div>

                <div className="pt-2 space-y-2">
                  <h3 className="font-bold text-xs text-slate-800">Ad creation</h3>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">Responsive video ad</p>
                    <p className="text-slate-500">Ad #1</p>
                    <p className="text-amber-400 font-semibold">No video selected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SET A BID FOR THIS AD GROUP ── */}
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <h1 className="text-2xl font-bold text-slate-900">Set a bid for this ad group</h1>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">Bid</h2>
                <p className="text-xs font-semibold text-slate-700">TrueView target CPV bid</p>

                <div className="relative w-48">
                  <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                  <input
                    type="text"
                    value={formData.targetCpv}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetCpv: e.target.value }))}
                    placeholder="Required"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-amber-400/80 focus:border-red-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-amber-400 font-semibold block mt-1">Required</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  With TrueView target CPV (cost-per-view), you set the average amount you’re willing to pay for views for this campaign. From the TrueView target CPV you set, we’ll optimize bids to help get as many TrueView views as possible. Some TrueView views may cost more or less than your target.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Bottom Sticky Action Navigation Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between z-40 shadow-md">
        <button
          onClick={() => router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`)}
          className="px-5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all"
        >
          Cancel
        </button>

        <button
          disabled={isPublishing || publishSuccess}
          onClick={handlePublish}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-900 text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
            </>
          ) : (
            <>
              Publish campaign <CheckCircle2 className="h-4 w-4" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
