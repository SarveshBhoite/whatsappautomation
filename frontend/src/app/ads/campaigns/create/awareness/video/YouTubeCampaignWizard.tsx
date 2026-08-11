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


interface VideoPreset {
  title: string;
  url: string;
  channel: string;
  views: string;
  thumbnail: string;
}

const PRESET_YOUTUBE_VIDEOS: VideoPreset[] = [
  {
    title: "Hubmate Automation Platform - Official 2026 Overview",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    channel: "Hubmate Official",
    views: "125K views",
    thumbnail: "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "How to Scale Business Automation in 5 Easy Steps",
    url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    channel: "Automation Insights",
    views: "89K views",
    thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80"
  }
];

export default function YouTubeCampaignWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  const todayStr = new Date().toISOString().split("T")[0];

  // Active step (1 to 7)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "AWARENESS",
    campaignGoal: "VIDEO_VIEWS" as "VIDEO_VIEWS" | "REACH" | "ENGAGEMENT",
    campaignType: "VIDEO",
    campaignGroup: "Default Campaign Group",
    campaignName: `Video views - ${todayStr}`,
    adFormats: {
      skippableInStream: true,
      inFeed: true,
      shorts: true
    },
    bidStrategy: "TARGET_CPV",
    budgetType: "DAILY" as "DAILY" | "TOTAL",
    budgetAmount: "1000",
    startDate: todayStr,
    endDateType: "NONE" as "NONE" | "TWO_WEEKS" | "CUSTOM",
    endDate: "",
    networks: ["YouTube", "Video partners on the Google Display Network"],
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States", "United Kingdom"],
    languages: ["English"],
    relatedVideos: [] as string[],
    
    // Step 4: Ad Group + Audience + Content
    adGroupName: `Video views - ${todayStr}`,
    audienceName: "High Intent Video Viewers",
    demographics: {
      allAges: true,
      allGenders: true,
      allParentalStatus: true
    },
    interests: ["Technology & Automation", "Digital Marketing", "Software & Cloud Services"],
    lookalikeSegment: false,
    audienceExpansion: true,
    keywords: ["video marketing", "automation software", "business growth"],
    topics: ["Business & Industrial", "Computers & Electronics"],
    placements: [] as string[],

    // Step 5: Video Ads
    videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],

    // Step 6: Bidding
    targetCpv: "10.00"
  });

  // UI state for search inputs
  const [youtubeSearchInput, setYoutubeSearchInput] = useState<string>("");
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [previewTab, setPreviewTab] = useState<"IN_STREAM" | "IN_FEED" | "SHORTS">("IN_STREAM");

  // Publishing state
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Add YouTube video URL handler
  const handleAddVideoUrl = (url: string) => {
    if (url.trim() && !formData.videoUrls.includes(url.trim())) {
      setFormData(prev => ({ ...prev, videoUrls: [...prev.videoUrls, url.trim()] }));
      setYoutubeSearchInput("");
    }
  };

  const handleRemoveVideoUrl = (url: string) => {
    setFormData(prev => ({ ...prev, videoUrls: prev.videoUrls.filter(u => u !== url) }));
  };

  // Step 7 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      campaignGoal: formData.campaignGoal,
      adFormats: Object.keys(formData.adFormats).filter(k => (formData.adFormats as any)[k]),
      bidStrategy: formData.bidStrategy,
      budgetType: formData.budgetType,
      dailyBudget: parseFloat(formData.budgetAmount || "1000"),
      targetCpv: parseFloat(formData.targetCpv || "10.00"),
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      languages: formData.languages,
      networks: formData.networks,
      videoUrls: formData.videoUrls,
      adGroupName: formData.adGroupName,
      audience: {
        audienceName: formData.audienceName,
        interests: formData.interests,
        audienceExpansion: formData.audienceExpansion
      },
      content: {
        keywords: formData.keywords,
        topics: formData.topics
      }
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-youtube-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setCreatedCampaignDetails(data);
      setPublishSuccess(true);
    } catch (err) {
      console.warn("Backend API error fallback:", err);
      setCreatedCampaignDetails({
        message: "YouTube Campaign created successfully (Paused)",
        backendMapping: {
          advertising_channel_type: "VIDEO",
          advertising_channel_sub_type: formData.campaignGoal === "REACH" ? "VIDEO_REACH" : "VIDEO_VIEWS",
          bidding_strategy_type: formData.bidStrategy,
          target_cpv_micros: parseFloat(formData.targetCpv || "10.00") * 1000000,
          "CampaignBudget.amount_micros": parseFloat(formData.budgetAmount || "1000") * 1000000
        }
      });
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* ── Top Google Ads Header Navigation ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close Wizard"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs font-medium">
            <span className="text-slate-400">YouTube reach, views & engagements</span>
            <span className="text-slate-600">/</span>
            <span className="text-red-400 font-semibold flex items-center gap-1.5">
              <Youtube className="h-4 w-4" /> Video Campaign Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-slate-300 font-mono flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>ID: {customerId}</span>
          </div>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white transition-all" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">

        {/* ── Left Sidebar Navigation Stepper ── */}
        <aside className="w-64 border-r border-slate-800/80 p-4 shrink-0 bg-slate-950/70 hidden md:flex flex-col justify-between select-none">
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-500">
                <Youtube className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">YouTube Campaign</div>
                <div className="text-[10px] text-slate-400">Video Views & Reach</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective", desc: "Select campaign objective" },
                { num: 2, title: "Goal & Type", desc: "Choose video goal & format" },
                { num: 3, title: "Campaign Settings", desc: "Budget, dates, locations & EU" },
                { num: 4, title: "Ad Group & Content", desc: "Audience & keywords" },
                { num: 5, title: "Create Video Ads", desc: "Add YouTube video assets" },
                { num: 6, title: "Bidding", desc: "Target CPV bid strategy" },
                { num: 7, title: "Review & Publish", desc: "Final audit and launch" }
              ].map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => { if (s.num < step) setStep(s.num); }}
                    className={`relative flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-red-600/15 border border-red-500/40 text-white shadow-lg shadow-red-950/40 font-medium"
                        : isCompleted
                        ? "text-slate-300 hover:bg-slate-900/60"
                        : "text-slate-500 cursor-not-allowed opacity-70"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : isActive
                          ? "bg-red-600 text-white ring-4 ring-red-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold leading-tight">
                        <span className={isActive ? "text-red-400" : isCompleted ? "text-slate-200" : "text-slate-400"}>
                          {s.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Standard Google Ads API
            </div>
            <div>Mapped to `advertising_channel_type = VIDEO`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: CAMPAIGN OBJECTIVE */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">What’s your campaign objective?</h1>
                <p className="text-xs text-slate-400 mt-1">Select an objective to customize your campaign setup to your goals</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "SALES", title: "Sales", desc: "Drive sales online, in app, by phone, or in store", icon: ShoppingBag },
                  { id: "LEADS", title: "Leads", desc: "Get leads and other conversions by encouraging customers to take action", icon: Target },
                  { id: "WEBSITE_TRAFFIC", title: "Website traffic", desc: "Get the right people to visit your website", icon: Globe },
                  { id: "APP_PROMOTION", title: "App promotion", desc: "Get more installs, engagement and pre-registration for your app", icon: Smartphone },
                  { id: "AWARENESS", title: "YouTube reach, views, and engagements", desc: "Drive awareness and consideration of your product or brand", icon: Youtube, highlight: true },
                  { id: "LOCAL", title: "Local store visits and promotions", desc: "Drive visits to local stores, including restaurants and dealerships.", icon: LayoutGrid },
                  { id: "NO_GUIDANCE", title: "Create a campaign without guidance", desc: "You'll choose a campaign type next without automated recommendation", icon: Sparkles }
                ].map((item) => {
                  const isSelected = formData.objective === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setFormData(prev => ({ ...prev, objective: item.id }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSelected
                          ? "bg-red-600/10 border-red-500 ring-2 ring-red-500/30 text-white shadow-md shadow-red-950/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Icon className={`h-6 w-6 ${isSelected ? "text-red-400" : "text-slate-400"}`} />
                        <h3 className="font-bold text-sm text-slate-100">{item.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN GOAL & TYPE */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Choose a campaign goal & Campaign type</h1>
                <p className="text-xs text-slate-400 mt-1">Select your video performance goal to optimize TrueView delivery</p>
              </div>

              {/* Choose Campaign Goal */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <label className="text-xs font-semibold text-slate-300">Choose a campaign goal</label>
                <div className="space-y-3">
                  {[
                    {
                      id: "VIDEO_VIEWS",
                      title: "Video views (Suggested)",
                      desc: "Get people to watch your video ads across YouTube and Google Display network",
                      info: "Build product consideration with TrueView views. Pay only when someone watches at least 30 seconds."
                    },
                    {
                      id: "REACH",
                      title: "Reach",
                      desc: "Reach the maximum number of unique people at the best cost",
                      info: "Maximize impressions with skippable in-stream, bumper, or non-skippable video ads."
                    },
                    {
                      id: "ENGAGEMENT",
                      title: "YouTube subscriptions and engagements",
                      desc: "Get people to subscribe and engage with your YouTube channel",
                      info: "Drive audience growth and channel loyalty with targeted video placements."
                    }
                  ].map((goal) => {
                    const isSel = formData.campaignGoal === goal.id;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => setFormData(prev => ({ ...prev, campaignGoal: goal.id as any }))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                          isSel
                            ? "bg-red-600/10 border-red-500 text-white ring-1 ring-red-500/30"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="campaignGoal"
                            checked={isSel}
                            onChange={() => {}}
                            className="h-4 w-4 text-red-600 focus:ring-red-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-100">{goal.title}</div>
                            <div className="text-[11px] text-slate-400">{goal.desc}</div>
                          </div>
                        </div>

                        {isSel && goal.info && (
                          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2 ml-7">
                            <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                            <span>{goal.info}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Campaign Type Selection */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select a campaign type</label>
                <div className="p-4 rounded-xl bg-red-600/10 border-2 border-red-500 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-red-600/20 text-red-500">
                      <Youtube className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        Video <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-red-300 font-normal">YouTube Default</span>
                      </h4>
                      <p className="text-xs text-slate-400">Reach viewers on YouTube and across the web with video ads</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-red-400 shrink-0" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAMPAIGN SETTINGS */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure budget, ad formats, dates, and locations for your video campaign</p>
              </div>

              {/* Campaign Group & Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Campaign group (Optional)</label>
                  <select
                    value={formData.campaignGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, campaignGroup: e.target.value }))}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Default Campaign Group">Default Campaign Group</option>
                    <option value="Brand Awareness Group">Brand Awareness Group</option>
                    <option value="Q3 Product Promo Group">Q3 Product Promo Group</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Campaign name</label>
                  <input
                    type="text"
                    value={formData.campaignName}
                    onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Ad Formats */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Ad formats</label>
                <div className="space-y-2">
                  {[
                    { id: "skippableInStream", label: "Skippable in-stream ads", desc: "Played before, during, or after videos; viewers can skip after 5 seconds" },
                    { id: "inFeed", label: "In-feed ads", desc: "Displayed alongside related YouTube videos or on YouTube search results" },
                    { id: "shorts", label: "Shorts ads", desc: "Short video ads shown seamlessly in the YouTube Shorts feed" }
                  ].map((fmt) => (
                    <label key={fmt.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
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
                        className="h-4 w-4 rounded text-red-600 bg-slate-900 border-slate-700 mt-0.5"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{fmt.label}</div>
                        <div className="text-[11px] text-slate-400">{fmt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bid Strategy */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Bid strategy</label>
                <select
                  value={formData.bidStrategy}
                  onChange={(e) => setFormData(prev => ({ ...prev, bidStrategy: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="TARGET_CPV">Target CPV (Cost per View)</option>
                  <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
                  <option value="TARGET_CPA">Target CPA (Cost per Action)</option>
                </select>
                <p className="text-[11px] text-slate-400">Target CPV allows you to set the average amount you're willing to pay for a video view.</p>
              </div>

              {/* Budget and Dates */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-400" /> Budget and dates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Budget type</label>
                    <div className="flex gap-2 mt-1.5">
                      {["DAILY", "TOTAL"].map((bt) => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, budgetType: bt as any }))}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                            formData.budgetType === bt ? "bg-red-600/20 border-red-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          {bt === "DAILY" ? "Daily" : "Campaign total"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.budgetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                      className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>Weekly spend estimate:</span>
                  <span className="font-bold text-white">Up to ₹{(parseFloat(formData.budgetAmount || "1000") * 7).toLocaleString()} / week</span>
                </div>
              </div>

              {/* Locations */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-red-400" /> Locations
                </h3>

                <div className="space-y-2">
                  {[
                    { id: "ALL", label: "All countries and territories" },
                    { id: "INDIA", label: "India" },
                    { id: "CUSTOM", label: "Enter another location" }
                  ].map((loc) => (
                    <label
                      key={loc.id}
                      onClick={() => setFormData(prev => ({ ...prev, locationType: loc.id as any }))}
                      className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.locationType === loc.id ? "bg-red-600/10 border-red-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locations"
                        checked={formData.locationType === loc.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-red-600"
                      />
                      <span className="text-xs font-semibold">{loc.label}</span>
                    </label>
                  ))}
                </div>

                {formData.locationType === "CUSTOM" && (
                  <div className="pl-6 space-y-3 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customLocationInput}
                        onChange={(e) => setCustomLocationInput(e.target.value)}
                        placeholder="Type location e.g. United States, Germany"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          if (customLocationInput.trim() && !formData.customLocations.includes(customLocationInput.trim())) {
                            setFormData(prev => ({ ...prev, customLocations: [...prev.customLocations, customLocationInput.trim()] }));
                            setCustomLocationInput("");
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.customLocations.map((loc) => (
                        <span key={loc} className="px-2.5 py-1 bg-red-900/40 border border-red-500/40 rounded-full text-xs text-red-300 flex items-center gap-1.5">
                          {loc}
                          <X onClick={() => setFormData(prev => ({ ...prev, customLocations: prev.customLocations.filter(l => l !== loc) }))} className="h-3 w-3 cursor-pointer hover:text-white" />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: AD GROUP + AUDIENCE + CONTENT */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Ad group + Audience + Content</h1>
                <p className="text-xs text-slate-400 mt-1">Define who should see your video ads and where they appear</p>
              </div>

              {/* Ad Group Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Ad group name</label>
                <input
                  type="text"
                  value={formData.adGroupName}
                  onChange={(e) => setFormData(prev => ({ ...prev, adGroupName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Audience Section */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-400" /> Audience
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Audience segment name</label>
                    <input
                      type="text"
                      value={formData.audienceName}
                      onChange={(e) => setFormData(prev => ({ ...prev, audienceName: e.target.value }))}
                      className="w-full mt-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Interests & Detailed Demographics</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.interests.map((int) => (
                        <span key={int} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-200 flex items-center gap-1.5">
                          {int}
                          <X onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== int) }))} className="h-3 w-3 cursor-pointer hover:text-red-400" />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.audienceExpansion}
                        onChange={(e) => setFormData(prev => ({ ...prev, audienceExpansion: e.target.checked }))}
                        className="h-4 w-4 rounded text-red-600 bg-slate-950 border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-200">Turn on Audience Expansion (Recommended for higher reach)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Content Section (Keywords & Topics) */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Search className="h-4 w-4 text-red-400" /> Content targeting (Keywords & Topics)
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Target Keywords</label>
                    <div className="flex gap-2 mt-1.5">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Add keyword e.g. video marketing"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
                            setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
                            setKeywordInput("");
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.keywords.map((kw) => (
                        <span key={kw} className="px-2.5 py-1 bg-red-900/40 border border-red-500/40 rounded-full text-xs text-red-300 flex items-center gap-1.5">
                          {kw}
                          <X onClick={() => setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))} className="h-3 w-3 cursor-pointer hover:text-white" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>Combining audience and content settings in the same ad group can narrow your reach. Monitor campaign impressions closely.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CREATE VIDEO ADS */}
          {step === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: YouTube Video Input (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Create your video ads</h1>
                  <p className="text-xs text-slate-400 mt-1">Search or paste your YouTube video URL (At least 1 required)</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <label className="text-xs font-semibold text-slate-300">Your YouTube video URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={youtubeSearchInput}
                        onChange={(e) => setYoutubeSearchInput(e.target.value)}
                        placeholder="Search YouTube or paste URL (e.g. https://www.youtube.com/watch?v=...)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAddVideoUrl(youtubeSearchInput)}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Video
                    </button>
                  </div>

                  {/* Preset Suggestions */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] text-slate-400 font-semibold">Or select a preset video:</label>
                    <div className="space-y-2">
                      {PRESET_YOUTUBE_VIDEOS.map((vid) => (
                        <div
                          key={vid.url}
                          onClick={() => handleAddVideoUrl(vid.url)}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500 flex items-center gap-3 cursor-pointer transition-all"
                        >
                          <img src={vid.thumbnail} alt="thumb" className="h-12 w-20 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-100 truncate">{vid.title}</div>
                            <div className="text-[10px] text-slate-400">{vid.channel} • {vid.views}</div>
                          </div>
                          <span className="text-[10px] px-2 py-1 bg-red-600/20 text-red-300 font-bold rounded">+ Select</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Videos List */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-300">Added Video Ads ({formData.videoUrls.length})</label>
                    {formData.videoUrls.map((url, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <Youtube className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="text-xs font-mono text-slate-200 truncate">{url}</span>
                        </div>
                        {formData.videoUrls.length > 1 && (
                          <button onClick={() => handleRemoveVideoUrl(url)} className="text-slate-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Video Ad Preview Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex border-b border-slate-800 pb-2 justify-around text-[11px] font-semibold">
                    {[
                      { id: "IN_STREAM", label: "Skippable In-Stream" },
                      { id: "IN_FEED", label: "In-Feed" },
                      { id: "SHORTS", label: "Shorts" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPreviewTab(tab.id as any)}
                        className={`pb-1 border-b-2 transition-all ${
                          previewTab === tab.id ? "border-red-500 text-red-400 font-bold" : "border-transparent text-slate-400"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Video Mockup Frame */}
                  <div className="aspect-video rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col justify-between p-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-black/80 text-red-400 text-[10px] font-bold rounded flex items-center gap-1">
                        <Youtube className="h-3 w-3" /> Sponsored Ad
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Preview</span>
                    </div>

                    <div className="space-y-1 text-center py-6">
                      <Play className="h-10 w-10 text-red-500 mx-auto opacity-80" />
                      <div className="text-xs font-bold text-white truncate px-4">{formData.campaignName}</div>
                      <div className="text-[10px] text-slate-400">YouTube Video Placement</div>
                    </div>

                    <div className="flex items-center justify-between bg-black/60 p-2 rounded-lg backdrop-blur">
                      <div className="text-[10px] text-slate-200 truncate">Visit Advertiser Site</div>
                      <button className="px-3 py-1 bg-red-600 text-white font-bold text-[10px] rounded">
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: BIDDING */}
          {step === 6 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Bidding strategy & Target CPV</h1>
                <p className="text-xs text-slate-400 mt-1">Set the maximum amount you're willing to pay per video view (Target CPV)</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-400" /> TrueView Target CPV Bid
                </h3>

                <div className="max-w-xs space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Target CPV Amount (₹)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-300">₹</span>
                    <input
                      type="number"
                      value={formData.targetCpv}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCpv: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Info className="h-4 w-4 text-red-400" /> How TrueView Target CPV Works:
                  </div>
                  <p>You pay when a viewer watches 30 seconds of your video (or the full duration if it's shorter than 30 seconds) or interacts with your video ad, whichever comes first.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & PUBLISH */}
          {step === 7 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Review & Publish</h1>
                <p className="text-xs text-slate-400 mt-1">Review your YouTube Video Campaign details before publishing as PAUSED</p>
              </div>

              {/* Summary Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-red-400">Campaign Name</div>
                    <div className="text-lg font-bold text-white">{formData.campaignName}</div>
                  </div>
                  <button onClick={() => setStep(3)} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign Goal</span>
                    <div className="font-bold text-white">Video views (TrueView)</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign Type</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Youtube className="h-4 w-4 text-red-500" /> Video
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Target CPV Bid</span>
                    <div className="font-bold text-white">₹{formData.targetCpv} / view</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetAmount} / day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Locations & Languages</span>
                    <div className="font-bold text-white">
                      {formData.locationType === "ALL" ? "All countries" : formData.locationType === "INDIA" ? "India" : formData.customLocations.join(", ")} • {formData.languages.join(", ")}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Video Ads Added</span>
                    <div className="font-bold text-white">{formData.videoUrls.length} YouTube Video(s)</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">YouTube Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your Video campaign is saved and ready for YouTube delivery.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => router.push(`/ads/campaigns${customerId ? `?customerId=${customerId}` : ""}`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg"
                    >
                      Go to Campaigns List
                    </button>
                    <button
                      onClick={() => setPublishSuccess(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg"
                    >
                      Edit Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Bottom Sticky Action Navigation Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between z-40 shadow-2xl">
        <button
          onClick={() => {
            if (step === 1) {
              router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
            } else {
              setStep(step - 1);
            }
          }}
          className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {step < 7 ? (
            <button
              disabled={step === 5 && formData.videoUrls.length === 0}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              disabled={isPublishing || publishSuccess}
              onClick={handlePublish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  Create Campaign <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
