"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  TrendingUp,
  Star,
  Bot,
  CheckCheck,
  Sparkles,
  Layers,
  BarChart3
} from "lucide-react";

export default function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<"cockpit" | "whatsapp" | "ads" | "reviews">("cockpit");
  const [aiDraft, setAiDraft] = useState<string>(
    "Thank you so much for the 5-star review, Rahul! We are delighted that our automated WhatsApp CRM and ad sync helped scale your business."
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReply = () => {
    setIsGenerating(true);
    setAiDraft("");
    const replies = [
      "Thank you for the fantastic 5-star feedback! Our team takes pride in delivering sub-5 second automated customer responses.",
      "We're thrilled with your positive experience! Automating your ad leads into WhatsApp is exactly what Jisnu CRM was built for.",
      "Much appreciated, Rahul! It is wonderful to see your agency scaling with our omnichannel automation suite."
    ];
    const chosen = replies[Math.floor(Math.random() * replies.length)];
    let i = 0;
    const timer = setInterval(() => {
      setAiDraft(chosen.slice(0, i + 1));
      i++;
      if (i >= chosen.length) {
        clearInterval(timer);
        setIsGenerating(false);
      }
    }, 18);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bento-card bento-glow-border p-3.5 sm:p-7 bg-white/95 shadow-2xl shadow-slate-200/60 overflow-hidden">
      {/* Top Header Controls (Mobile Responsive Overflow-x Auto) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-black text-slate-800 tracking-tight ml-1 truncate">
            Jisnu CRM Live Cockpit
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Tab Selector Pills (Scrollable on Mobile) */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "cockpit"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-brand-blue shrink-0" />
            Cockpit
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "whatsapp"
                ? "pill-active-green"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "ads"
                ? "pill-active-blue"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            Ads Manager
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "reviews"
                ? "pill-active-orange"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Star className="h-3.5 w-3.5 shrink-0" />
            Reviews
          </button>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="pt-4">
        {/* 1. COCKPIT TAB */}
        {activeTab === "cockpit" && (
          <div className="flex flex-col gap-4 sm:gap-5 animate-fadeIn">
            {/* Top Metric Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400">
                  <span>WhatsApp Delivery</span>
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                </div>
                <div className="text-base sm:text-xl font-black text-emerald-700 mt-1">99.8%</div>
                <div className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold mt-0.5">Sub-3s auto-replies</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400">
                  <span>Ads ROAS</span>
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-blue" />
                </div>
                <div className="text-base sm:text-xl font-black text-brand-blue mt-1">4.82x</div>
                <div className="text-[9px] sm:text-[10px] text-brand-blue font-semibold mt-0.5">Google &amp; Meta Sync</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400">
                  <span>Google Reputation</span>
                  <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-base sm:text-xl font-black text-amber-700 mt-1">4.9 ★</div>
                <div className="text-[9px] sm:text-[10px] text-amber-600 font-semibold mt-0.5">100% AI Coverage</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400">
                  <span>AI Agent</span>
                  <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600" />
                </div>
                <div className="text-base sm:text-xl font-black text-purple-700 mt-1">24/7 Active</div>
                <div className="text-[9px] sm:text-[10px] text-purple-600 font-semibold mt-0.5">Zero Hallucinations</div>
              </div>
            </div>

            {/* Central Dashboard View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
              {/* SVG Vector Chart */}
              <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col justify-between shadow-inner overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Cross-Channel Lead Volume</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      2,450 <span className="text-[11px] text-emerald-600 font-bold">+18.4%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold flex-wrap">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> WhatsApp
                    </span>
                    <span className="flex items-center gap-1 text-sky-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Google Ads
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Meta Ads
                    </span>
                  </div>
                </div>

                <div className="py-3 w-full overflow-hidden">
                  <svg viewBox="0 0 500 160" className="w-full h-28 sm:h-36 overflow-visible">
                    <defs>
                      <linearGradient id="blueGradMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="greenGradMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />

                    <path d="M 0,140 Q 100,50 200,90 T 400,30 T 500,20 L 500,160 L 0,160 Z" fill="url(#blueGradMobile)" />
                    <path d="M 0,150 Q 120,90 220,110 T 380,60 T 500,45 L 500,160 L 0,160 Z" fill="url(#greenGradMobile)" />

                    <path d="M 0,140 Q 100,50 200,90 T 400,30 T 500,20" fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 0,150 Q 120,90 220,110 T 380,60 T 500,45" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 0,155 Q 140,120 250,130 T 420,95 T 500,80" fill="none" stroke="#F97316" strokeWidth="2.5" strokeDasharray="4 4" />

                    <circle cx="200" cy="90" r="4" fill="#0284C7" stroke="#fff" strokeWidth="2" />
                    <circle cx="400" cy="30" r="5" fill="#0284C7" stroke="#fff" strokeWidth="2" />
                  </svg>
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold pt-1">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4 (Today)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Webhooks Active
                  </span>
                  <span className="font-extrabold text-brand-blue bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                    Latency: 142ms
                  </span>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-5 flex flex-col gap-2.5">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-900">Activity Stream</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                          WA
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 text-[11px] truncate">Lead Ingested from WhatsApp</div>
                          <div className="text-[10px] text-slate-500 truncate">Aditya D. • Inbound Inq</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0 ml-2">1m ago</span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-sky-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                          AD
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 text-[11px] truncate">Google Search Ad Lead Synced</div>
                          <div className="text-[10px] text-slate-500 truncate">₹38.50 CPL • High-Intent</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0 ml-2">4m ago</span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                          5★
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 text-[11px] truncate">Google Review AI Replied</div>
                          <div className="text-[10px] text-slate-500 truncate">Priya S. • Mumbai HQ</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0 ml-2">9m ago</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-brand-blue/5 border border-brand-blue/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-blue shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">AI Auto-Pilot Mode</div>
                      <div className="text-[9px] text-slate-500">Autonomous lead nurturing active</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. WHATSAPP TAB */}
        {activeTab === "whatsapp" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fadeIn p-2 sm:p-4">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Official Meta Cloud Partner API
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Unified Multi-Agent WhatsApp Hub
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect your WhatsApp Business number. Broadcast customized offers, trigger automated follow-ups, and qualify leads with instant sub-5s AI responses.
              </p>
            </div>

            <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    SA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Siddharth Anand</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Lead from Meta Ad</div>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Qualified
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs py-1">
                <div className="self-end bg-emerald-600 text-white p-2.5 rounded-2xl rounded-tr-none max-w-[90%] text-[11px]">
                  👋 Hi Siddharth! Thank you for requesting a demo of Jisnu CRM. Would you like to connect your WhatsApp Business number today?
                </div>
                <div className="self-start bg-white border border-slate-200 text-slate-800 p-2.5 rounded-2xl rounded-tl-none max-w-[90%] shadow-2xs text-[11px]">
                  Yes please! Can it also sync our Google Ads leads automatically?
                </div>
                <div className="self-end bg-sky-50 border border-sky-200 text-slate-800 p-2.5 rounded-2xl rounded-tr-none max-w-[90%] text-[11px]">
                  <div className="text-[9px] font-bold text-brand-blue mb-0.5">⚡ Jisnu AI</div>
                  Absolutely! Jisnu CRM pulls Google &amp; Meta Ads leads into WhatsApp and initiates qualification flows in under 3 seconds.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ADS TAB */}
        {activeTab === "ads" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fadeIn p-2 sm:p-4">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
                Cross-Network Attribution
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Single-Pane Google &amp; Meta Ads
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect your Google Ads and Meta Ads accounts securely with OAuth 2.0. Monitor spend, generate high-converting headlines, and scale ad ROI seamlessly.
              </p>
            </div>

            <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold">Total Marketing Spend</span>
                  <div className="text-lg font-black text-slate-900">₹84,250.00</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  +34.2% ROAS (4.8x)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-800">Google Search Ads</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">412 Leads</div>
                  <div className="text-[9px] text-emerald-600 font-semibold">₹42.10 / lead</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-800">Meta Video Reels</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">628 Leads</div>
                  <div className="text-[9px] text-emerald-600 font-semibold">₹31.50 / lead</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fadeIn p-2 sm:p-4">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                Reputation Autopilot
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Google Business Reviews AI
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect your business locations. Receive real-time alerts when customers leave reviews and publish tailored AI responses in seconds.
              </p>
            </div>

            <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-inner">
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Rahul Kapoor • 5★ Google Review</span>
                  <span className="text-[9px] text-slate-400">2h ago</span>
                </div>
                <p className="text-[11px] text-slate-700 italic">
                  &quot;Fastest WhatsApp replies I have ever seen. Super helpful team!&quot;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    AI Auto-Draft
                  </span>
                  <button
                    onClick={handleGenerateReply}
                    disabled={isGenerating}
                    className="text-[9px] font-bold px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800"
                  >
                    {isGenerating ? "..." : "⚡ Regenerate"}
                  </button>
                </div>
                <p className="text-slate-800 bg-white p-2 rounded-lg border border-amber-200/60 text-[11px]">
                  {aiDraft}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
