"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  CheckCheck,
  TrendingUp,
  Star,
  Bot,
  Zap,
  ArrowRight,
  ShieldCheck,
  Play,
  Pause,
  Send,
  Building2,
  Sliders,
  DollarSign,
  Layers
} from "lucide-react";

export default function LiveAutomationMatrix() {
  const [activeChannel, setActiveChannel] = useState<"whatsapp" | "ads" | "reviews">("whatsapp");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<"mumbai" | "bengaluru" | "delhi">("mumbai");
  const [monthlyBudget, setMonthlyBudget] = useState<number>(45000);
  const [aiDraftReview, setAiDraftReview] = useState<string>(
    "Hi Priya, thank you so much for the 5-star rating! We are delighted our automated WhatsApp CRM and campaign tracking boosted your team's workflow. We appreciate your partnership!"
  );
  const [isDrafting, setIsDrafting] = useState(false);
  const [whatsappMessages, setWhatsappMessages] = useState<
    Array<{ sender: "user" | "bot" | "broadcast"; text: string; time: string }>
  >([
    {
      sender: "broadcast",
      text: "👋 Hi Aditya! We noticed you explored the Jisnu Marketing Automation Suite. Would you like a 1-click setup guide for WhatsApp API?",
      time: "10:40 AM",
    },
    {
      sender: "user",
      text: "Yes, does this support automated follow-ups for Google & Meta Ads leads too?",
      time: "10:41 AM",
    },
    {
      sender: "bot",
      text: "⚡ Instantly! Inbound leads from Meta & Google trigger automatic 1-to-1 WhatsApp messages within 3 seconds.",
      time: "10:41 AM",
    },
  ]);

  const triggerTestMessage = () => {
    const newMsg = {
      sender: "broadcast" as const,
      text: "🚀 Exclusive Offer: Connect your WhatsApp Business API today and get 5,000 free AI message credits!",
      time: "Just now",
    };
    setWhatsappMessages((prev) => [...prev, newMsg]);
  };

  const handleRegenerateReview = () => {
    setIsDrafting(true);
    setAiDraftReview("");
    const options = [
      "Thank you for the fantastic 5-star review! Our team takes pride in helping brands scale their customer engagement with lightning-fast AI auto-replies.",
      "We're thrilled to hear your positive experience, Priya! Automating your ad campaigns and customer chat workflows is what we strive for every day.",
      "Much appreciated! It's fantastic knowing Jisnu CRM simplified your marketing operations across all locations."
    ];
    const picked = options[Math.floor(Math.random() * options.length)];
    let idx = 0;
    const timer = setInterval(() => {
      setAiDraftReview(picked.slice(0, idx + 1));
      idx++;
      if (idx >= picked.length) {
        clearInterval(timer);
        setIsDrafting(false);
      }
    }, 18);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bento-card bento-glow-border p-5 sm:p-8 bg-white/95">
      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">Omnichannel Control Canvas</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-500">Interactive live simulation of cross-channel automations</p>
          </div>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveChannel("whatsapp")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeChannel === "whatsapp"
                ? "pill-active-green"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            WhatsApp Hub
          </button>
          <button
            onClick={() => setActiveChannel("ads")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeChannel === "ads"
                ? "pill-active-blue"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Meta &amp; Google Ads
          </button>
          <button
            onClick={() => setActiveChannel("reviews")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeChannel === "reviews"
                ? "pill-active-orange"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            Google Business AI
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="pt-6">
        {/* 1. WHATSAPP CHANNEL STAGE */}
        {activeChannel === "whatsapp" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            {/* Left: Chat Simulator */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-3 shadow-inner">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    AD
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Aditya Deshmukh</div>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Inbound Lead from Google Ads Search
                    </div>
                  </div>
                </div>
                <button
                  onClick={triggerTestMessage}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Send className="h-3 w-3" /> + Send Broadcast
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                {whatsappMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                      msg.sender === "user"
                        ? "self-start bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs"
                        : msg.sender === "bot"
                        ? "self-end bg-sky-50 border border-sky-200 text-slate-800 rounded-tr-xs"
                        : "self-end bg-emerald-600 text-white rounded-tr-xs shadow-xs"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="flex items-center gap-1 font-bold text-brand-blue-deep text-[10px] mb-1">
                        <Sparkles className="h-3 w-3 text-brand-blue" />
                        Jisnu AI Response (3.2s)
                      </div>
                    )}
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        msg.sender === "broadcast" ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      <span>{msg.time}</span>
                      <CheckCheck className={`h-3 w-3 ${msg.sender === "broadcast" ? "text-white" : "text-sky-600"}`} />
                    </div>
                  </div>
                ))}

                {/* Voice Note Simulation Widget */}
                <div className="self-start bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-xs max-w-[85%] shadow-2xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                    >
                      {isPlayingAudio ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-0.5 h-4">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 55, 90, 35, 75, 50, 85].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all ${
                              isPlayingAudio ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                        <span>Customer Voice Note</span>
                        <span>0:24</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick reply tags */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Quick Triggers:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[10px] hover:border-emerald-500 cursor-pointer">
                  📦 Send Product Catalog
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[10px] hover:border-emerald-500 cursor-pointer">
                  📅 Schedule Video Call
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[10px] hover:border-emerald-500 cursor-pointer">
                  💳 Payment Link
                </span>
              </div>
            </div>

            {/* Right: Technical Features */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
                Official Meta Cloud API
              </span>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Zero Ban Risk. Verified Embedded Signup.
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your business number in under 2 minutes through official Meta Embedded Signup. Never risk account bans from unofficial scrapers.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                      99%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Message Open Rate</div>
                      <div className="text-[11px] text-slate-500">Industry avg: 20% for Email</div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    5x Higher
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center font-black text-xs">
                      24/7
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Autonomous AI Qualifier</div>
                      <div className="text-[11px] text-slate-500">Collects email, budget &amp; intent</div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-brand-blue bg-sky-50 px-2 py-1 rounded-md">
                    Instant
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ADS CHANNEL STAGE */}
        {activeChannel === "ads" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            {/* Left: Ads Interactive Controller */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 shadow-inner">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-500">Monthly Ad Budget Allocation</span>
                  <div className="text-xl font-black text-slate-900">
                    ₹{monthlyBudget.toLocaleString("en-IN")}
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">
                  Unified Cross-Platform ROAS: 4.8x
                </span>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>₹10,000</span>
                  <span>₹1,00,000</span>
                  <span>₹2,00,000+</span>
                </div>
              </div>

              {/* Dynamic Live Cards */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                      G
                    </div>
                    <span className="text-xs font-bold text-slate-800">Google Search Ads</span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {Math.round(monthlyBudget * 0.009).toLocaleString()} Leads
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                    ₹{Math.round(monthlyBudget / (monthlyBudget * 0.009))} / lead (Avg)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-md bg-sky-500/10 text-brand-blue flex items-center justify-center font-bold text-[10px]">
                      M
                    </div>
                    <span className="text-xs font-bold text-slate-800">Meta Video Reels</span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {Math.round(monthlyBudget * 0.014).toLocaleString()} Leads
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                    ₹{Math.round(monthlyBudget / (monthlyBudget * 0.014))} / lead (Avg)
                  </div>
                </div>
              </div>

              {/* AI Copywriting Preview */}
              <div className="p-3.5 rounded-2xl bg-brand-blue/5 border border-brand-blue/20 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-brand-blue-deep font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
                    Real-Time AI Ad Copy Generator
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-brand-blue/20 font-extrabold">
                    A/B Variant #1
                  </span>
                </div>
                <p className="text-slate-800 font-semibold italic">
                  &quot;Stop Losing Inbound Leads. Automate WhatsApp &amp; Google Ads from 1 Unified Command Center.&quot;
                </p>
              </div>
            </div>

            {/* Right: Technical Explanation */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-brand-blue">
                Cross-Network Attribution
              </span>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                One Dashboard. Absolute Visibility on Every Rupee Spent.
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your Google Ads &amp; Meta Ads via official OAuth 2.0. Stop switching tabs to reconcile leads and conversion metrics.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Official Google Ads API v17 Scopes
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Official Meta Graph API v21 Integration
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Automatic Offline Conversion Feedback
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GOOGLE REVIEWS STAGE */}
        {activeChannel === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            {/* Left: Location & Review Simulator */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 shadow-inner">
              {/* Location tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-700">Select Business Location:</span>
                </div>
                <div className="flex gap-1">
                  {(["mumbai", "bengaluru", "delhi"] as const).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedBranch(loc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                        selectedBranch === loc
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                      PS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Priya Sharma</div>
                      <div className="text-[10px] text-slate-400">
                        {selectedBranch === "mumbai"
                          ? "Mumbai Bandra HQ"
                          : selectedBranch === "bengaluru"
                          ? "Bengaluru Indiranagar"
                          : "Delhi Connaught Place"}{" "}
                        • 1 hour ago
                      </div>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 italic">
                  &quot;Super smooth onboarding! We get all our client notifications and WhatsApp lead updates instantly. Customer support is 10/10.&quot;
                </p>
              </div>

              {/* AI Auto Draft Box */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    AI Auto-Reply Draft
                  </span>
                  <button
                    onClick={handleRegenerateReview}
                    disabled={isDrafting}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-500 hover:text-white transition-all"
                  >
                    {isDrafting ? "Drafting..." : "⚡ Regenerate"}
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-amber-200/80">
                  {aiDraftReview}
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs">
                    Publish to Google Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Technical Highlights */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                Google Business API
              </span>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Protect &amp; Scale Your Local Reputation Automatically.
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Respond to 100% of customer reviews across all your branches within minutes. Never let an unanswered review hurt your local SEO rank.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500">Response Rate</div>
                  <div className="text-2xl font-black text-amber-600">100%</div>
                  <div className="text-[10px] text-slate-400">Zero missed reviews</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500">Avg Star Rating</div>
                  <div className="text-2xl font-black text-slate-900">4.9 ★</div>
                  <div className="text-[10px] text-slate-400">Across all locations</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
