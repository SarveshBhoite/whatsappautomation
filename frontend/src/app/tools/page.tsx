"use client";

import React, { useState } from "react";
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Globe,
  Share2,
  ShieldCheck,
  FileText,
  Copy,
  Printer,
  ChevronRight,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Check,
  Zap,
  Smartphone,
  Monitor,
  Link2,
  FileCode,
  Layers,
  HelpCircle
} from "lucide-react";

interface SeoAuditData {
  url: string;
  domain: string;
  scannedAt: string;
  loadTimeMs: number;
  scores: {
    overall: number;
    onPage: number;
    social: number;
    technical: number;
  };
  pageSpeed?: {
    strategy: "mobile" | "desktop";
    overallExperience: string;
    scores: {
      performance: number;
      seo: number;
      accessibility: number;
      bestPractices: number;
    };
    metrics: {
      fcp: { displayValue: string; score: number };
      lcp: { displayValue: string; score: number };
      tbt: { displayValue: string; score: number };
      cls: { displayValue: string; score: number };
      speedIndex: { displayValue: string; score: number };
      tti: { displayValue: string; score: number };
      ttfb: { displayValue: string; score: number };
    };
    opportunities: Array<{ id: string; title: string; description: string; displayValue?: string; category: string }>;
    passedAuditsCount: number;
    passedAuditsSample: Array<{ id: string; title: string; category: string }>;
  };
  title: {
    value: string;
    length: number;
    status: "good" | "warning" | "error";
    message: string;
  };
  description: {
    value: string;
    length: number;
    status: "good" | "warning" | "error";
    message: string;
  };
  headings: {
    h1Count: number;
    h1List: string[];
    h2Count: number;
    h2List: string[];
    h3Count: number;
    h3List: string[];
    status: "good" | "warning" | "error";
    message: string;
  };
  openGraph: {
    title: string;
    description: string;
    image: string;
    twitterCard: string;
    status: "good" | "warning";
  };
  images: {
    total: number;
    missingAltCount: number;
    missingAltList: Array<{ src: string; alt: string }>;
    validAltList: Array<{ src: string; alt: string }>;
    coveragePercent: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
  };
  technical: {
    isHttps: boolean;
    canonicalUrl: string;
    viewportMeta: boolean;
    htmlLang: string;
    robotsMeta: string;
  };
  content: {
    wordCount: number;
  };
  aiRecommendations: string[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ToolsSuitePage() {
  const [activeTab, setActiveTab] = useState<"seo" | "youtube_competitor" | "ai_content" | "leads">("seo");
  const [targetUrl, setTargetUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [auditing, setAuditing] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [auditResult, setAuditResult] = useState<SeoAuditData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  // Detailed audit view tab inside result
  const [detailTab, setDetailTab] = useState<"overview" | "images" | "headings" | "pagespeed">("overview");

  const scanSteps = [
    "📡 Establishing secure HTTP connection & fetching website source...",
    "⚡ Querying Google PageSpeed API v5 for Performance & Core Web Vitals...",
    "🔍 Auditing Page Title, Meta Description & H1/H2/H3 Heading hierarchy...",
    "🖼️ Inspecting Image Assets & building missing ALT tag breakdown...",
    "📱 Parsing OpenGraph Social Preview Cards (WhatsApp, Facebook, LinkedIn)...",
    "🛡️ Inspecting SSL Certificate, Canonical Tags & Mobile Viewport responsiveness...",
    "🧠 Dispatching technical metrics to Groq LLaMA 3.3 AI for strategic action plan..."
  ];

  const handleRunAudit = async (urlToScan?: string, chosenStrategy?: "mobile" | "desktop") => {
    const input = urlToScan || targetUrl;
    const deviceStrategy = chosenStrategy || strategy;

    if (!input || !input.trim()) {
      setErrorMsg("Please enter a valid website URL to scan.");
      return;
    }

    setAuditing(true);
    setScanStepIndex(0);
    setErrorMsg(null);

    const stepInterval = setInterval(() => {
      setScanStepIndex(prev => (prev + 1) % scanSteps.length);
    }, 1200);

    try {
      const res = await fetch(`${BACKEND_URL}/api/seo/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input, strategy: deviceStrategy })
      });

      const data = await res.json();
      if (res.ok) {
        setAuditResult(data);
      } else {
        setErrorMsg(data.error || "Failed to audit website.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not connect to backend scan server.");
    } finally {
      clearInterval(stepInterval);
      setAuditing(false);
    }
  };

  const copyExecutiveSummary = () => {
    if (!auditResult) return;
    const summaryText = `SEO & GOOGLE LIGHTHOUSE AUDIT REPORT FOR ${auditResult.domain.toUpperCase()}
Overall Health Score: ${auditResult.scores.overall}/100
- On-Page SEO Score: ${auditResult.scores.onPage}/100
- Technical & Performance Score: ${auditResult.scores.technical}/100
- Social OpenGraph Score: ${auditResult.scores.social}/100
${auditResult.pageSpeed ? `- Google Performance: ${auditResult.pageSpeed.scores.performance}/100 | Accessibility: ${auditResult.pageSpeed.scores.accessibility}/100 | Best Practices: ${auditResult.pageSpeed.scores.bestPractices}/100` : ""}

AI Action Plan:
${auditResult.aiRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 55) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  const getStatusBadge = (status: "good" | "warning" | "error") => {
    if (status === "good") {
      return (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Optimal
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Needs Attention
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
        <XCircle className="h-3 w-3" /> Critical Fix
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/60 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <Wrench className="h-5 w-5 text-emerald-400" />
          <h1 className="text-base font-bold text-slate-100">Growth & Marketing Tools Suite</h1>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-850 border border-slate-800 px-3 py-1 rounded-lg flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Groq LLaMA 3.3 AI Enabled
        </span>
      </header>

      {/* Sub-Nav Tool Selector */}
      <div className="border-b border-slate-800 bg-slate-950/40 px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "seo"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Search className="h-3.5 w-3.5" /> Instant Live Web SEO Audit
        </button>

        <button
          onClick={() => setActiveTab("youtube_competitor")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "youtube_competitor"
              ? "bg-slate-800 text-red-400 border border-slate-700"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" /> YouTube Competitor Benchmarking
          <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.2 rounded font-mono">Next</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_content")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ai_content"
              ? "bg-slate-800 text-amber-400 border border-slate-700"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> AI Content Quality Inspector
          <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.2 rounded font-mono">Next</span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "leads"
              ? "bg-slate-800 text-sky-400 border border-slate-700"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Google Maps Lead Prospector
          <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.2 rounded font-mono">Next</span>
        </button>
      </div>

      {/* Content Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 w-full max-w-full pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-8">
        
        {/* TAB 1: INSTANT LIVE WEB SEO AUDIT */}
        {activeTab === "seo" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            
            {/* Input Hero Card */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-emerald-400" /> Website SEO & Performance Scanner
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter any website URL to perform a live audit with official Google PageSpeed Insights & Groq LLaMA 3.3 AI recommendations.
                  </p>
                </div>
                
                {/* Device Strategy Selector */}
                <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setStrategy("mobile");
                      if (targetUrl.trim()) handleRunAudit(targetUrl, "mobile");
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      strategy === "mobile" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStrategy("desktop");
                      if (targetUrl.trim()) handleRunAudit(targetUrl, "desktop");
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      strategy === "desktop" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" /> Desktop
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleRunAudit(); }} className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="e.g. https://yourwebsite.com or example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={auditing || !targetUrl.trim()}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${auditing ? "animate-spin" : ""}`} />
                  {auditing ? "Scanning Website..." : "Run Instant Live Scan"}
                </button>
              </form>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* AUDIT SCAN RESULTS */}
            {auditing ? (
              <div className="bg-slate-950/40 border border-emerald-500/30 rounded-2xl p-12 text-center space-y-5 flex flex-col items-center shadow-2xl animate-fadeIn">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
                  <Sparkles className="h-6 w-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <h3 className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
                    Performing Google PageSpeed & SEO Audit ({strategy.toUpperCase()})...
                  </h3>
                  <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-xs font-mono text-emerald-400 flex items-center justify-center gap-2 shadow-inner transition-all duration-300">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400 shrink-0" />
                    <span className="animate-fadeIn">{scanSteps[scanStepIndex]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <span>Phase {scanStepIndex + 1} of {scanSteps.length}</span>
                  <span>•</span>
                  <span className="text-emerald-400">Google API & Groq LLaMA 3.3 Active</span>
                </div>
              </div>
            ) : auditResult ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Top Scores Overview Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`border rounded-2xl p-5 shadow-xl flex flex-col justify-between ${getScoreColor(auditResult.scores.overall)}`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Overall Health Score</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black">{auditResult.scores.overall}</span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                    <span className="text-[10px] font-semibold mt-2 opacity-90">
                      {auditResult.scores.overall >= 80 ? "Excellent Grade" : auditResult.scores.overall >= 60 ? "Good — Minor Fixes Needed" : "Critical Fixes Required"}
                    </span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">On-Page SEO</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-slate-100">{auditResult.scores.onPage}</span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">Title, Meta, H1 & Image Alt</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Social Sharing</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-slate-100">{auditResult.scores.social}</span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">WhatsApp & LinkedIn Cards</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tech & Performance</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-slate-100">{auditResult.scores.technical}</span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">HTTPS, Speed ({auditResult.loadTimeMs}ms)</span>
                  </div>
                </div>

                {/* Sub-Detail Nav Bar */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setDetailTab("overview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      detailTab === "overview" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Overview & AI Plan
                  </button>

                  <button
                    onClick={() => setDetailTab("images")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      detailTab === "images" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Image ALT Breakdown ({auditResult.images.missingAltCount} Missing)
                  </button>

                  <button
                    onClick={() => setDetailTab("headings")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      detailTab === "headings" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" /> Heading Structure ({auditResult.headings.h1Count} H1 | {auditResult.headings.h2Count} H2)
                  </button>

                  {auditResult.pageSpeed && (
                    <button
                      onClick={() => setDetailTab("pagespeed")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        detailTab === "pagespeed" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" /> Google PageSpeed & Core Web Vitals
                    </button>
                  )}
                </div>

                {/* OVERVIEW TAB CONTENT */}
                {detailTab === "overview" && (
                  <div className="space-y-6">
                    {/* Groq AI Action Plan Card */}
                    <div className="bg-gradient-to-r from-slate-950/90 via-slate-900 to-slate-950/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" /> Groq AI Executive Action Plan
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copyExecutiveSummary}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
                          >
                            {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedSummary ? "Copied!" : "Copy Summary"}
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
                          >
                            <Printer className="h-3.5 w-3.5 text-sky-400" /> Print Audit Report
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {auditResult.aiRecommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                            <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Checks Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* On-Page Metadata Details */}
                      <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                        <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-850 pb-2">
                          <span>On-Page SEO Tags</span>
                          <span className="text-[10px] text-slate-500 font-mono">Domain: {auditResult.domain}</span>
                        </h3>

                        <div className="space-y-3 divide-y divide-slate-850">
                          {/* Title */}
                          <div className="pt-2 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">Page Title</span>
                              {getStatusBadge(auditResult.title.status)}
                            </div>
                            <p className="text-xs text-slate-100 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 truncate">
                              {auditResult.title.value || <span className="text-slate-500 italic">No title tag found</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 flex justify-between">
                              <span>{auditResult.title.message}</span>
                              <span className="font-mono">Length: {auditResult.title.length} chars</span>
                            </p>
                          </div>

                          {/* Meta Description */}
                          <div className="pt-3 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">Meta Description</span>
                              {getStatusBadge(auditResult.description.status)}
                            </div>
                            <p className="text-xs text-slate-100 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 leading-relaxed">
                              {auditResult.description.value || <span className="text-slate-500 italic">No meta description found</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 flex justify-between">
                              <span>{auditResult.description.message}</span>
                              <span className="font-mono">Length: {auditResult.description.length} chars</span>
                            </p>
                          </div>

                          {/* Image Alt Stats */}
                          <div className="pt-3 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">Image Alt Text Attributes</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                auditResult.images.missingAltCount === 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {auditResult.images.coveragePercent}% Covered
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-850">
                              <span>Total Images: {auditResult.images.total}</span>
                              <span className={auditResult.images.missingAltCount > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                                Missing Alt: {auditResult.images.missingAltCount}
                              </span>
                            </div>
                          </div>

                          {/* Page Links */}
                          <div className="pt-3 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">Page Links Breakdown</span>
                              <span className="text-[10px] text-slate-400 font-mono">Total: {auditResult.links.total}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-850">
                                <span className="text-[10px] text-slate-500 block">Internal Links</span>
                                <span className="font-bold text-emerald-400">{auditResult.links.internal}</span>
                              </div>
                              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-850">
                                <span className="text-[10px] text-slate-500 block">External Links</span>
                                <span className="font-bold text-sky-400">{auditResult.links.external}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Social OpenGraph & Technical Checks */}
                      <div className="space-y-6">
                        
                        {/* Social Card Preview */}
                        <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                          <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-850 pb-2">
                            <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4 text-sky-400" /> WhatsApp & Social Card Preview</span>
                            {getStatusBadge(auditResult.openGraph.status)}
                          </h3>

                          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
                            {auditResult.openGraph.image ? (
                              <img
                                src={auditResult.openGraph.image}
                                alt="OpenGraph Preview"
                                className="w-full h-36 object-cover bg-slate-950"
                                onError={(e) => { (e.target as any).style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-24 bg-slate-950 flex items-center justify-center text-slate-600 text-xs font-mono">
                                <ImageIcon className="h-6 w-6 mr-1" /> No OpenGraph Image Found
                              </div>
                            )}
                            <div className="p-3 space-y-1 bg-slate-950">
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block truncate">
                                {auditResult.domain}
                              </span>
                              <h4 className="text-xs font-bold text-slate-100 truncate">
                                {auditResult.openGraph.title || auditResult.title.value}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {auditResult.openGraph.description || auditResult.description.value || "No description provided."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Technical & Security Details */}
                        <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                          <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                            <ShieldCheck className="h-4 w-4 text-purple-400" /> Technical & Security Protocol Checks
                          </h3>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">SSL Security</span>
                              <span className={`font-bold ${auditResult.technical.isHttps ? "text-emerald-400" : "text-red-400"}`}>
                                {auditResult.technical.isHttps ? "✓ HTTPS Secure" : "✕ Insecure (HTTP)"}
                              </span>
                            </div>

                            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Canonical Tag</span>
                              <span className={`font-bold ${auditResult.technical.canonicalUrl ? "text-emerald-400" : "text-amber-400"}`}>
                                {auditResult.technical.canonicalUrl ? "✓ Configured" : "⚠️ Missing"}
                              </span>
                            </div>

                            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Language Attribute</span>
                              <span className="font-bold text-slate-200 font-mono">
                                {auditResult.technical.htmlLang}
                              </span>
                            </div>

                            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Estimated Content</span>
                              <span className="font-bold text-slate-200 font-mono">
                                {auditResult.content.wordCount.toLocaleString()} words
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* IMAGES TAB CONTENT */}
                {detailTab === "images" && (
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between border-b border-slate-850 pb-3">
                      <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-emerald-400" /> Image ALT Text Attributes Audit</span>
                      <span className="text-xs font-mono text-slate-400">{auditResult.images.coveragePercent}% Coverage</span>
                    </h3>

                    {auditResult.images.missingAltList.length > 0 ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                          ⚠️ Images Missing Descriptive ALT Tags ({auditResult.images.missingAltCount}):
                        </span>
                        <div className="space-y-2">
                          {auditResult.images.missingAltList.map((img, idx) => (
                            <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3 text-xs font-mono">
                              <span className="truncate text-slate-300 max-w-xl">{img.src}</span>
                              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shrink-0">
                                Missing ALT
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> All images on this page have valid ALT text attributes!
                      </div>
                    )}
                  </div>
                )}

                {/* HEADINGS TAB CONTENT */}
                {detailTab === "headings" && (
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between border-b border-slate-850 pb-3">
                      <span className="flex items-center gap-2"><FileCode className="h-4 w-4 text-emerald-400" /> Heading Hierarchy (H1, H2, H3)</span>
                      <span className="text-xs font-mono text-slate-400">Total H1: {auditResult.headings.h1Count}</span>
                    </h3>

                    <div className="space-y-4">
                      {/* H1 list */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Main H1 Headings ({auditResult.headings.h1Count}):</span>
                        {auditResult.headings.h1List.length > 0 ? (
                          auditResult.headings.h1List.map((h1, i) => (
                            <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-xs font-mono text-slate-100">
                              H1: "{h1}"
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                            ⚠️ No H1 heading found on this page.
                          </div>
                        )}
                      </div>

                      {/* H2 list */}
                      {auditResult.headings.h2List.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-850">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">H2 Subheadings ({auditResult.headings.h2Count}):</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {auditResult.headings.h2List.map((h2, i) => (
                              <div key={i} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 text-xs font-mono text-slate-300 truncate">
                                H2: "{h2}"
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PAGESPEED TAB CONTENT */}
                {detailTab === "pagespeed" && auditResult.pageSpeed && (
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-400" /> Google PageSpeed Insights & Core Web Vitals ({auditResult.pageSpeed.strategy.toUpperCase()})
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        Official Google Lighthouse V5
                      </span>
                    </div>

                    {/* 4 Google Categories */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Google Performance</span>
                        <span className={`text-2xl font-extrabold mt-1 ${auditResult.pageSpeed.scores.performance >= 80 ? "text-emerald-400" : auditResult.pageSpeed.scores.performance >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {auditResult.pageSpeed.scores.performance} / 100
                        </span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Google SEO</span>
                        <span className={`text-2xl font-extrabold mt-1 ${auditResult.pageSpeed.scores.seo >= 80 ? "text-emerald-400" : auditResult.pageSpeed.scores.seo >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {auditResult.pageSpeed.scores.seo} / 100
                        </span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Accessibility</span>
                        <span className={`text-2xl font-extrabold mt-1 ${auditResult.pageSpeed.scores.accessibility >= 80 ? "text-emerald-400" : auditResult.pageSpeed.scores.accessibility >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {auditResult.pageSpeed.scores.accessibility} / 100
                        </span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Best Practices</span>
                        <span className={`text-2xl font-extrabold mt-1 ${auditResult.pageSpeed.scores.bestPractices >= 80 ? "text-emerald-400" : auditResult.pageSpeed.scores.bestPractices >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {auditResult.pageSpeed.scores.bestPractices} / 100
                        </span>
                      </div>
                    </div>

                    {/* Core Web Vitals Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-semibold block">First Contentful Paint (FCP)</span>
                        <span className="text-sm font-bold font-mono text-slate-200">{auditResult.pageSpeed.metrics.fcp.displayValue}</span>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-semibold block">Largest Contentful Paint (LCP)</span>
                        <span className="text-sm font-bold font-mono text-slate-200">{auditResult.pageSpeed.metrics.lcp.displayValue}</span>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-semibold block">Total Blocking Time (TBT)</span>
                        <span className="text-sm font-bold font-mono text-slate-200">{auditResult.pageSpeed.metrics.tbt.displayValue}</span>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-semibold block">Cumulative Layout Shift (CLS)</span>
                        <span className="text-sm font-bold font-mono text-slate-200">{auditResult.pageSpeed.metrics.cls.displayValue}</span>
                      </div>
                    </div>

                    {/* Diagnostic Opportunities */}
                    {auditResult.pageSpeed.opportunities.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                          🔴 Top Google Lighthouse Fixes & Opportunities ({auditResult.pageSpeed.opportunities.length}):
                        </span>
                        <div className="space-y-2">
                          {auditResult.pageSpeed.opportunities.map((opp, idx) => (
                            <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-850 flex items-start justify-between gap-3 text-xs">
                              <div>
                                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                  {opp.title}
                                </span>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{opp.description}</p>
                              </div>
                              {opp.displayValue && (
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded shrink-0">
                                  {opp.displayValue}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-950/20 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-slate-700 stroke-1" />
                <p className="text-xs">Enter a website URL above and click "Run Instant Live Scan" to generate audit.</p>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: YOUTUBE COMPETITOR BENCHMARKING (PREVIEW) */}
        {activeTab === "youtube_competitor" && (
          <div className="max-w-4xl mx-auto bg-slate-950/30 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">YouTube Competitor Benchmarking Tool</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Compare your YouTube channel's view velocity, upload frequency, and top performing keywords side-by-side against any public YouTube creator handle.
            </p>
            <span className="inline-block px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full">
              Module Ready for Next Addition
            </span>
          </div>
        )}

        {/* TAB 3: AI CONTENT QUALITY INSPECTOR (PREVIEW) */}
        {activeTab === "ai_content" && (
          <div className="max-w-4xl mx-auto bg-slate-950/30 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">AI Content Quality & Plagiarism Inspector</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Analyze blog articles and post captions for AI probability score, readability grade, duplicate phrase risks, and target keyword density.
            </p>
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-full">
              Module Ready for Next Addition
            </span>
          </div>
        )}

        {/* TAB 4: GOOGLE MAPS LEAD PROSPECTOR (PREVIEW) */}
        {activeTab === "leads" && (
          <div className="max-w-4xl mx-auto bg-slate-950/30 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="h-16 w-16 bg-sky-500/10 border border-sky-500/20 rounded-full flex items-center justify-center mx-auto text-sky-400">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Google Maps Business Lead Prospector</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Extract local business listings by category & city, discover unclaimed profiles, extract phone numbers, and export directly into sales outreach pipelines.
            </p>
            <span className="inline-block px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold rounded-full">
              Module Ready for Next Addition
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
