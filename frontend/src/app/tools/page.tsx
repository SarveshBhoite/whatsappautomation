"use client";

import React, { useState } from "react";
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Globe,
  Share2,
  ShieldCheck,
  FileText,
  Copy,
  Printer,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Check,
  Zap,
  Smartphone,
  Monitor,
  FileCode,
  Sliders,
  History,
  BookOpen,
  FileCheck2,
  BrainCircuit,
  UploadCloud,
  Download
} from "lucide-react";

interface InspectionResult {
  id: string;
  filename: string;
  text: string;
  analyzedAt: string;
  scores: {
    overallQuality: number;
    aiProbability: number;
    humanScore: number;
    originalityScore: number;
    plagiarismScore: number;
    grammarScore: number;
    readabilityScore: number;
    seoScore: number;
    tone: string;
  };
  metrics: {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
    readingTimeMinutes: number;
    fleschKincaidGrade: string;
  };
  issues: Array<{
    type: "grammar" | "spelling" | "wordiness" | "ai_phrase" | "seo";
    originalText: string;
    suggestion: string;
    explanation: string;
  }>;
  recommendations: string[];
  humanizedDrafts: Record<string, string>;
}

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
  const [activeTab, setActiveTab] = useState<"seo" | "ai_content" | "youtube_competitor" | "leads">("seo");
  const [targetUrl, setTargetUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [auditing, setAuditing] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [auditResult, setAuditResult] = useState<SeoAuditData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  // Detailed audit view tab inside result
  const [detailTab, setDetailTab] = useState<"overview" | "images" | "headings" | "pagespeed">("overview");

  // AI Content Quality Inspector State
  const [inspectorText, setInspectorText] = useState("");
  const [inspectorFile, setInspectorFile] = useState<File | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionStep, setInspectionStep] = useState(0);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [humanizeMode, setHumanizeMode] = useState<string>("Professional");
  const [humanizing, setHumanizing] = useState(false);
  const [humanizedOutput, setHumanizedOutput] = useState<string | null>(null);
  const [inspectorHistory, setInspectorHistory] = useState<InspectionResult[]>([]);
  const [inspectorViewTab, setInspectorViewTab] = useState<"analysis" | "humanizer" | "history">("analysis");
  const [copiedInspectorText, setCopiedInspectorText] = useState(false);

  const DEFAULT_ORG_ID = "demo-org-123";

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

  // AI Content Quality Inspector Handlers
  const inspectorSteps = [
    "📄 Parsing document structure & extracting plain text payload...",
    "🧠 Running Groq LLaMA 3.3 Deep Neural AI Probability & Pattern Detection...",
    "🔍 Executing Plagiarism & Originality Index cross-check...",
    "✍️ Analyzing Flesch-Kincaid Readability, Tone, & Grammar syntax...",
    "🚀 Evaluating SEO Keyword Density & Generating Actionable Recommendations..."
  ];

  const fetchInspectorHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/inspector/history`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setInspectorHistory(data);
      }
    } catch (e) {}
  };

  const handleInspectorFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInspectorFile(file);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/inspector/extract-file`, {
        method: "POST",
        headers: { "x-organization-id": DEFAULT_ORG_ID },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setInspectorText(data.text || "");
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to extract text from file.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Network error extracting file text.");
    }
  };

  const handleRunInspection = async () => {
    if (!inspectorText || !inspectorText.trim()) {
      setErrorMsg("Please paste content or upload a document file (PDF, DOCX, TXT) to inspect.");
      return;
    }

    setInspecting(true);
    setInspectionStep(0);
    setErrorMsg(null);

    const stepInterval = setInterval(() => {
      setInspectionStep(prev => (prev + 1) % inspectorSteps.length);
    }, 1100);

    try {
      const res = await fetch(`${BACKEND_URL}/api/inspector/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({
          text: inspectorText,
          filename: inspectorFile ? inspectorFile.name : "Direct Input Text"
        })
      });

      const data = await res.json();
      if (res.ok) {
        setInspectionResult(data);
        if (data.humanizedDrafts && data.humanizedDrafts["Professional"]) {
          setHumanizedOutput(data.humanizedDrafts["Professional"]);
        }
        setInspectorViewTab("analysis");
        await fetchInspectorHistory();
      } else {
        setErrorMsg(data.error || "Failed to complete content quality inspection.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Network error contacting inspection engine.");
    } finally {
      clearInterval(stepInterval);
      setInspecting(false);
    }
  };

  const handleHumanizeRewrite = async (mode: string) => {
    setHumanizeMode(mode);

    // If pre-generated in full analysis, use it immediately
    if (inspectionResult?.humanizedDrafts && inspectionResult.humanizedDrafts[mode]) {
      setHumanizedOutput(inspectionResult.humanizedDrafts[mode]);
      return;
    }

    if (!inspectorText.trim()) return;

    setHumanizing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/inspector/humanize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inspectorText,
          mode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setHumanizedOutput(data.rewrittenText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHumanizing(false);
    }
  };

  const handleDownloadInspectorReport = (format: "txt" | "md" | "json" | "html") => {
    if (!inspectionResult) return;

    let content = "";
    let mimeType = "text/plain";
    let ext = format;

    if (format === "html") {
      mimeType = "text/html";
      content = `
<!DOCTYPE html>
<html>
<head>
  <title>AI Content Quality Report - ${inspectionResult.filename}</title>
  <style>
    body { font-family: sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; }
    h1 { color: #d97706; }
    .card { background: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .score { font-size: 24px; font-weight: bold; color: #059669; }
  </style>
</head>
<body>
  <h1>AI Content Quality Inspection Report</h1>
  <p><strong>File/Source:</strong> ${inspectionResult.filename}</p>
  <p><strong>Date:</strong> ${new Date(inspectionResult.analyzedAt).toLocaleString()}</p>

  <div class="card">
    <h2>Quality Overview</h2>
    <p class="score">Overall Quality Score: ${inspectionResult.scores.overallQuality}%</p>
    <p>AI Probability: ${inspectionResult.scores.aiProbability}% | Human Score: ${inspectionResult.scores.humanScore}%</p>
    <p>Originality: ${inspectionResult.scores.originalityScore}% | Plagiarism Risk: ${inspectionResult.scores.plagiarismScore}%</p>
    <p>Grammar: ${inspectionResult.scores.grammarScore}% | Readability: ${inspectionResult.scores.readabilityScore}% | SEO: ${inspectionResult.scores.seoScore}%</p>
  </div>

  <div class="card">
    <h2>Original Content</h2>
    <pre>${inspectionResult.text}</pre>
  </div>

  ${humanizedOutput ? `
  <div class="card">
    <h2>Humanized Rewrite (${humanizeMode} Mode)</h2>
    <pre>${humanizedOutput}</pre>
  </div>
  ` : ""}
</body>
</html>
      `;
    } else if (format === "md") {
      content = `# AI Content Quality Inspection Report

**Source**: ${inspectionResult.filename}  
**Date**: ${new Date(inspectionResult.analyzedAt).toLocaleString()}  

## Quality Scores
- **Overall Quality Score**: ${inspectionResult.scores.overallQuality}%
- **AI Detection Probability**: ${inspectionResult.scores.aiProbability}%
- **Human Written Score**: ${inspectionResult.scores.humanScore}%
- **Originality Index**: ${inspectionResult.scores.originalityScore}%
- **Plagiarism Risk**: ${inspectionResult.scores.plagiarismScore}%
- **Grammar & Syntax**: ${inspectionResult.scores.grammarScore}%
- **Readability Score**: ${inspectionResult.scores.readabilityScore}%
- **SEO Optimization**: ${inspectionResult.scores.seoScore}%
- **Primary Tone**: ${inspectionResult.scores.tone}

## Text Metrics
- **Word Count**: ${inspectionResult.metrics.wordCount}
- **Sentence Count**: ${inspectionResult.metrics.sentenceCount}
- **Est. Reading Time**: ${inspectionResult.metrics.readingTimeMinutes} mins
- **Readability Grade**: ${inspectionResult.metrics.fleschKincaidGrade}

## Original Content
${inspectionResult.text}

${humanizedOutput ? `## Humanized Rewrite (${humanizeMode})\n${humanizedOutput}` : ""}
`;
    } else {
      content = `AI CONTENT QUALITY INSPECTION REPORT
Source: ${inspectionResult.filename}
Overall Quality Score: ${inspectionResult.scores.overallQuality}%
AI Probability: ${inspectionResult.scores.aiProbability}%
Originality Score: ${inspectionResult.scores.originalityScore}%
Plagiarism Risk: ${inspectionResult.scores.plagiarismScore}%

ORIGINAL TEXT:
${inspectionResult.text}

${humanizedOutput ? `HUMANIZED REWRITE (${humanizeMode}):\n${humanizedOutput}` : ""}
`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quality_Report_${inspectionResult.filename.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 border-emerald-200 bg-emerald-50/70";
    if (score >= 55) return "text-amber-700 border-amber-200 bg-amber-50/70";
    return "text-red-700 border-red-200 bg-red-50/70";
  };

  const getStatusBadge = (status: "good" | "warning" | "error") => {
    if (status === "good") {
      return (
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Optimal
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Needs Attention
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
        <XCircle className="h-3 w-3" /> Critical Fix
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Header */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-20 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <Wrench className="h-4 w-4" />
          </div>
          <h1 className="text-base font-black text-slate-900">Growth &amp; Marketing Tools Suite</h1>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Groq LLaMA 3.3 AI Enabled
        </span>
      </header>

      {/* Sub-Nav Tool Selector */}
      <div className="border-b border-slate-200 bg-slate-100/70 px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "seo"
              ? "bg-white text-emerald-800 border border-slate-200 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-emerald-600" /> Instant Live Web SEO Audit
          <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.2 rounded font-mono font-bold">Live</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_content")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ai_content"
              ? "bg-white text-amber-800 border border-slate-200 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-amber-600" /> AI Content Quality Inspector
          <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">Live</span>
        </button>

        <button
          onClick={() => setActiveTab("youtube_competitor")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "youtube_competitor"
              ? "bg-white text-red-700 border border-slate-200 shadow-2xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-red-600" /> YouTube Competitor Benchmarking
          <span className="text-[9px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-mono">Next</span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "leads"
              ? "bg-white text-sky-700 border border-slate-200 shadow-2xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
          }`}
        >
          <Users className="h-3.5 w-3.5 text-sky-600" /> Google Maps Lead Prospector
          <span className="text-[9px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-mono">Next</span>
        </button>
      </div>

      {/* Content Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 w-full max-w-full pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-8">

        {/* TAB 1: INSTANT LIVE WEB SEO AUDIT */}
        {activeTab === "seo" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            
            {/* Input Hero Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-emerald-600" /> Website SEO &amp; Performance Scanner
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter any website URL to perform a live audit with official Google PageSpeed Insights &amp; Groq LLaMA 3.3 AI recommendations.
                  </p>
                </div>
                
                {/* Device Strategy Selector */}
                <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-2xl gap-1 self-start sm:self-auto shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStrategy("mobile");
                      if (targetUrl.trim()) handleRunAudit(targetUrl, "mobile");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      strategy === "mobile" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      strategy === "desktop" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" /> Desktop
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleRunAudit(); }} className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="e.g. https://yourwebsite.com or example.com"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={auditing || !targetUrl.trim()}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm disabled:opacity-50 disabled:hover:bg-emerald-600 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${auditing ? "animate-spin" : ""}`} />
                  {auditing ? "Scanning Website..." : "Run Instant Live Scan"}
                </button>
              </form>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* AUDIT SCAN RESULTS */}
            {auditing ? (
              <div className="bg-white border border-emerald-200 rounded-3xl p-12 text-center space-y-5 flex flex-col items-center shadow-md animate-fadeIn">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
                  <Sparkles className="h-6 w-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <h3 className="text-base font-black text-slate-900 flex items-center justify-center gap-2">
                    Performing Google PageSpeed &amp; SEO Audit ({strategy.toUpperCase()})...
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs font-mono text-emerald-700 flex items-center justify-center gap-2 shadow-2xs transition-all duration-300">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600 shrink-0" />
                    <span className="animate-fadeIn">{scanSteps[scanStepIndex]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Phase {scanStepIndex + 1} of {scanSteps.length}</span>
                  <span>•</span>
                  <span className="text-emerald-700">Google API &amp; Groq LLaMA 3.3 Active</span>
                </div>
              </div>
            ) : auditResult ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Top Scores Overview Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`border rounded-3xl p-5 shadow-xs flex flex-col justify-between ${getScoreColor(auditResult.scores.overall)}`}>
                    <span className="text-[10px] uppercase font-black tracking-wider opacity-80">Overall Health Score</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black">{auditResult.scores.overall}</span>
                      <span className="text-xs font-bold opacity-60">/ 100</span>
                    </div>
                    <span className="text-[10px] font-bold mt-2 opacity-90">
                      {auditResult.scores.overall >= 80 ? "Excellent Grade" : auditResult.scores.overall >= 60 ? "Good — Minor Fixes Needed" : "Critical Fixes Required"}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">On-Page SEO</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-slate-900">{auditResult.scores.onPage}</span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">Title, Meta, H1 &amp; Image Alt</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Social Sharing</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-slate-900">{auditResult.scores.social}</span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">WhatsApp &amp; LinkedIn Cards</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tech &amp; Performance</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-slate-900">{auditResult.scores.technical}</span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">HTTPS, Speed ({auditResult.loadTimeMs}ms)</span>
                  </div>
                </div>

                {/* Sub-Detail Nav Bar */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setDetailTab("overview")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      detailTab === "overview" ? "bg-emerald-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Overview &amp; AI Plan
                  </button>

                  <button
                    onClick={() => setDetailTab("images")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      detailTab === "images" ? "bg-emerald-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Image ALT Breakdown ({auditResult.images.missingAltCount} Missing)
                  </button>

                  <button
                    onClick={() => setDetailTab("headings")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      detailTab === "headings" ? "bg-emerald-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" /> Heading Structure ({auditResult.headings.h1Count} H1 | {auditResult.headings.h2Count} H2)
                  </button>

                  {auditResult.pageSpeed && (
                    <button
                      onClick={() => setDetailTab("pagespeed")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        detailTab === "pagespeed" ? "bg-emerald-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" /> Google PageSpeed &amp; Core Web Vitals
                    </button>
                  )}
                </div>

                {/* OVERVIEW TAB CONTENT */}
                {detailTab === "overview" && (
                  <div className="space-y-6">
                    {/* Groq AI Action Plan Card */}
                    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                        <h3 className="font-black text-sm text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" /> Groq AI Executive Action Plan
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copyExecutiveSummary}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 shadow-2xs"
                          >
                            {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedSummary ? "Copied!" : "Copy Summary"}
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 shadow-2xs"
                          >
                            <Printer className="h-3.5 w-3.5 text-sky-600" /> Print Audit Report
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {auditResult.aiRecommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                            <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-800 leading-relaxed font-semibold">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Checks Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* On-Page Metadata Details */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                          <span>On-Page SEO Tags</span>
                          <span className="text-[10px] text-slate-500 font-mono">Domain: {auditResult.domain}</span>
                        </h3>

                        <div className="space-y-3 divide-y divide-slate-100">
                          {/* Title */}
                          <div className="pt-2 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800">Page Title</span>
                              {getStatusBadge(auditResult.title.status)}
                            </div>
                            <p className="text-xs text-slate-900 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200 truncate">
                              {auditResult.title.value || <span className="text-slate-400 italic">No title tag found</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 flex justify-between font-medium">
                              <span>{auditResult.title.message}</span>
                              <span className="font-mono">Length: {auditResult.title.length} chars</span>
                            </p>
                          </div>

                          {/* Meta Description */}
                          <div className="pt-3 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800">Meta Description</span>
                              {getStatusBadge(auditResult.description.status)}
                            </div>
                            <p className="text-xs text-slate-900 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                              {auditResult.description.value || <span className="text-slate-400 italic">No meta description found</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 flex justify-between font-medium">
                              <span>{auditResult.description.message}</span>
                              <span className="font-mono">Length: {auditResult.description.length} chars</span>
                            </p>
                          </div>

                          {/* Image Alt Stats */}
                          <div className="pt-3 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800">Image Alt Text Attributes</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                auditResult.images.missingAltCount === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {auditResult.images.coveragePercent}% Covered
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold">
                              <span>Total Images: {auditResult.images.total}</span>
                              <span className={auditResult.images.missingAltCount > 0 ? "text-amber-700 font-bold" : "text-emerald-700"}>
                                Missing Alt: {auditResult.images.missingAltCount}
                              </span>
                            </div>
                          </div>

                          {/* Page Links */}
                          <div className="pt-3 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800">Page Links Breakdown</span>
                              <span className="text-[10px] text-slate-400 font-mono font-medium">Total: {auditResult.links.total}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] text-slate-400 block font-normal">Internal Links</span>
                                <span className="text-emerald-700">{auditResult.links.internal}</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] text-slate-400 block font-normal">External Links</span>
                                <span className="text-sky-700">{auditResult.links.external}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Social OpenGraph & Technical Checks */}
                      <div className="space-y-6">
                        
                        {/* Social Card Preview */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4 text-sky-600" /> WhatsApp &amp; Social Card Preview</span>
                            {getStatusBadge(auditResult.openGraph.status)}
                          </h3>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-w-md mx-auto">
                            {auditResult.openGraph.image ? (
                              <img
                                src={auditResult.openGraph.image}
                                alt="OpenGraph Preview"
                                className="w-full h-36 object-cover bg-slate-100"
                                onError={(e) => { (e.target as any).style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-mono font-medium">
                                <ImageIcon className="h-6 w-6 mr-1 text-slate-300" /> No OpenGraph Image Found
                              </div>
                            )}
                            <div className="p-3.5 space-y-1 bg-white border-t border-slate-200">
                              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block truncate font-bold">
                                {auditResult.domain}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {auditResult.openGraph.title || auditResult.title.value}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {auditResult.openGraph.description || auditResult.description.value || "No description provided."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Technical & Security Details */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <ShieldCheck className="h-4 w-4 text-purple-600" /> Technical &amp; Security Protocol Checks
                          </h3>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">SSL Security</span>
                              <span className={`font-bold ${auditResult.technical.isHttps ? "text-emerald-700" : "text-red-700"}`}>
                                {auditResult.technical.isHttps ? "✓ HTTPS Secure" : "✕ Insecure (HTTP)"}
                              </span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Canonical Tag</span>
                              <span className={`font-bold ${auditResult.technical.canonicalUrl ? "text-emerald-700" : "text-amber-700"}`}>
                                {auditResult.technical.canonicalUrl ? "✓ Configured" : "⚠️ Missing"}
                              </span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Language Attribute</span>
                              <span className="font-bold text-slate-800 font-mono">
                                {auditResult.technical.htmlLang}
                              </span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Content</span>
                              <span className="font-bold text-slate-800 font-mono">
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
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="font-black text-sm text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-emerald-600" /> Image ALT Text Attributes Audit</span>
                      <span className="text-xs font-mono text-slate-500 font-bold">{auditResult.images.coveragePercent}% Coverage</span>
                    </h3>

                    {auditResult.images.missingAltList.length > 0 ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                          ⚠️ Images Missing Descriptive ALT Tags ({auditResult.images.missingAltCount}):
                        </span>
                        <div className="space-y-2">
                          {auditResult.images.missingAltList.map((img, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs font-mono">
                              <span className="truncate text-slate-700 max-w-xl font-medium">{img.src}</span>
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
                                Missing ALT
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> All images on this page have valid ALT text attributes!
                      </div>
                    )}
                  </div>
                )}

                {/* HEADINGS TAB CONTENT */}
                {detailTab === "headings" && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="font-black text-sm text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-2"><FileCode className="h-4 w-4 text-emerald-600" /> Heading Hierarchy (H1, H2, H3)</span>
                      <span className="text-xs font-mono text-slate-500 font-bold">Total H1: {auditResult.headings.h1Count}</span>
                    </h3>

                    <div className="space-y-4">
                      {/* H1 list */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Main H1 Headings ({auditResult.headings.h1Count}):</span>
                        {auditResult.headings.h1List.length > 0 ? (
                          auditResult.headings.h1List.map((h1, i) => (
                            <div key={i} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 font-semibold">
                              H1: "{h1}"
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-2xl font-semibold">
                            ⚠️ No H1 heading found on this page.
                          </div>
                        )}
                      </div>

                      {/* H2 list */}
                      {auditResult.headings.h2List.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">H2 Subheadings ({auditResult.headings.h2Count}):</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {auditResult.headings.h2List.map((h2, i) => (
                              <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 truncate font-medium">
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
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" /> Google PageSpeed Insights &amp; Core Web Vitals ({auditResult.pageSpeed.strategy.toUpperCase()})
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Official Google Lighthouse V5
                      </span>
                    </div>

                    {/* 4 Google Categories */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Google Performance</span>
                        <span className={`text-2xl font-black mt-1 ${auditResult.pageSpeed.scores.performance >= 80 ? "text-emerald-700" : auditResult.pageSpeed.scores.performance >= 50 ? "text-amber-700" : "text-red-700"}`}>
                          {auditResult.pageSpeed.scores.performance} / 100
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Google SEO</span>
                        <span className={`text-2xl font-black mt-1 ${auditResult.pageSpeed.scores.seo >= 80 ? "text-emerald-700" : auditResult.pageSpeed.scores.seo >= 50 ? "text-amber-700" : "text-red-700"}`}>
                          {auditResult.pageSpeed.scores.seo} / 100
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Accessibility</span>
                        <span className={`text-2xl font-black mt-1 ${auditResult.pageSpeed.scores.accessibility >= 80 ? "text-emerald-700" : auditResult.pageSpeed.scores.accessibility >= 50 ? "text-amber-700" : "text-red-700"}`}>
                          {auditResult.pageSpeed.scores.accessibility} / 100
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Best Practices</span>
                        <span className={`text-2xl font-black mt-1 ${auditResult.pageSpeed.scores.bestPractices >= 80 ? "text-emerald-700" : auditResult.pageSpeed.scores.bestPractices >= 50 ? "text-amber-700" : "text-red-700"}`}>
                          {auditResult.pageSpeed.scores.bestPractices} / 100
                        </span>
                      </div>
                    </div>

                    {/* Core Web Vitals Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">First Contentful Paint (FCP)</span>
                        <span className="text-sm font-black font-mono text-slate-900">{auditResult.pageSpeed.metrics.fcp.displayValue}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">Largest Contentful Paint (LCP)</span>
                        <span className="text-sm font-black font-mono text-slate-900">{auditResult.pageSpeed.metrics.lcp.displayValue}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">Total Blocking Time (TBT)</span>
                        <span className="text-sm font-black font-mono text-slate-900">{auditResult.pageSpeed.metrics.tbt.displayValue}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">Cumulative Layout Shift (CLS)</span>
                        <span className="text-sm font-black font-mono text-slate-900">{auditResult.pageSpeed.metrics.cls.displayValue}</span>
                      </div>
                    </div>

                    {/* Diagnostic Opportunities */}
                    {auditResult.pageSpeed.opportunities.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider block">
                          🔴 Top Google Lighthouse Fixes &amp; Opportunities ({auditResult.pageSpeed.opportunities.length}):
                        </span>
                        <div className="space-y-2">
                          {auditResult.pageSpeed.opportunities.map((opp, idx) => (
                            <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                              <div>
                                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                  {opp.title}
                                </span>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{opp.description}</p>
                              </div>
                              {opp.displayValue && (
                                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg shrink-0">
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
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center gap-2 shadow-xs">
                <Search className="h-8 w-8 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold">Enter a website URL above and click &quot;Run Instant Live Scan&quot; to generate audit.</p>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: AI CONTENT QUALITY INSPECTOR (FULL PRODUCTION MODULE) */}
        {activeTab === "ai_content" && (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Main Header Banner */}
            <div className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border border-amber-200/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
              <div className="space-y-2 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold rounded-full flex items-center gap-1.5">
                    <BrainCircuit className="h-3.5 w-3.5" /> LLaMA 3.3 70B Neural Engine
                  </span>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-full shadow-2xs">
                    Originality.ai &amp; Grammarly Grade
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  AI Content Quality &amp; Humanizer Inspector
                </h2>
                <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Detect AI probability, plagiarism risk, grammar syntax flaws, and SEO readability in seconds. One-click humanize to bypass AI detectors with natural phrasing.
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl z-10 shrink-0 shadow-2xs">
                <button
                  onClick={() => setInspectorViewTab("analysis")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    inspectorViewTab === "analysis"
                      ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileCheck2 className="h-3.5 w-3.5" /> Inspector &amp; Analysis
                </button>
                <button
                  onClick={() => setInspectorViewTab("humanizer")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    inspectorViewTab === "humanizer"
                      ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI Humanizer
                </button>
                <button
                  onClick={() => {
                    setInspectorViewTab("history");
                    fetchInspectorHistory();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    inspectorViewTab === "history"
                      ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <History className="h-3.5 w-3.5" /> Scan History ({inspectorHistory.length})
                </button>
              </div>
            </div>

            {/* Input & File Upload Area */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Paste Article Content or Upload File</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition shadow-2xs">
                    <UploadCloud className="h-3.5 w-3.5 text-amber-600" />
                    <span>{inspectorFile ? inspectorFile.name : "Upload PDF, DOCX, TXT"}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.md"
                      onChange={handleInspectorFileUpload}
                      className="hidden"
                    />
                  </label>

                  {inspectorText && (
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl font-bold">
                      {inspectorText.trim().split(/\s+/).length} Words | {inspectorText.length} Chars
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={inspectorText}
                onChange={(e) => setInspectorText(e.target.value)}
                placeholder="Paste your blog article, social post, website text, or essay here to run AI probability detection, grammar syntax audit, and readability check..."
                rows={7}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition duration-300 resize-none font-sans leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Supports PDF, DOCX, &amp; TXT up to 10MB • Auto Groq LLaMA 3.3 Neural Scoring</span>
                </div>

                <button
                  onClick={handleRunInspection}
                  disabled={inspecting || !inspectorText.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs md:text-sm rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                >
                  {inspecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Inspecting Content...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4.5 w-4.5" /> Inspect Quality &amp; Detect AI
                    </>
                  )}
                </button>
              </div>

              {/* Progress Stepper Bar */}
              {inspecting && (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-black text-amber-800">
                    <span>{inspectorSteps[inspectionStep]}</span>
                    <span>Step {inspectionStep + 1} / {inspectorSteps.length}</span>
                  </div>
                  <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-amber-200">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${((inspectionStep + 1) / inspectorSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700 font-bold">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" /> {errorMsg}
                </span>
                <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900 font-bold">Dismiss</button>
              </div>
            )}

            {/* TAB 1: INSPECTION ANALYSIS RESULT DASHBOARD */}
            {inspectorViewTab === "analysis" && inspectionResult && (
              <div className="space-y-6">
                
                {/* Executive Scorecards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  
                  {/* Overall Score */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Quality</span>
                    <div className="text-2xl font-black text-amber-700">{inspectionResult.scores.overallQuality}%</div>
                    <span className="text-[10px] text-slate-400 font-semibold">Grade Score</span>
                  </div>

                  {/* AI Probability */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Detection</span>
                    <div className={`text-2xl font-black ${inspectionResult.scores.aiProbability > 40 ? "text-red-600" : "text-emerald-600"}`}>
                      {inspectionResult.scores.aiProbability}%
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{inspectionResult.scores.aiProbability > 40 ? "High AI Signal" : "Human Written"}</span>
                  </div>

                  {/* Human Score */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Human Score</span>
                    <div className="text-2xl font-black text-emerald-600">{inspectionResult.scores.humanScore}%</div>
                    <span className="text-[10px] text-slate-400 font-semibold">Natural Rhythm</span>
                  </div>

                  {/* Originality Score */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Originality</span>
                    <div className="text-2xl font-black text-sky-600">{inspectionResult.scores.originalityScore}%</div>
                    <span className="text-[10px] text-slate-400 font-semibold">Unique Content</span>
                  </div>

                  {/* Plagiarism Risk */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plagiarism</span>
                    <div className={`text-2xl font-black ${inspectionResult.scores.plagiarismScore > 15 ? "text-amber-600" : "text-emerald-600"}`}>
                      {inspectionResult.scores.plagiarismScore}%
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">Risk Index</span>
                  </div>

                  {/* Readability Score */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Readability</span>
                    <div className="text-2xl font-black text-purple-600">{inspectionResult.scores.readabilityScore}%</div>
                    <span className="text-[10px] text-slate-400 font-semibold">{inspectionResult.metrics.fleschKincaidGrade}</span>
                  </div>

                  {/* SEO Optimization */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Score</span>
                    <div className="text-2xl font-black text-emerald-600">{inspectionResult.scores.seoScore}%</div>
                    <span className="text-[10px] text-slate-400 font-semibold">Search Clarity</span>
                  </div>

                </div>

                {/* Detailed Analysis Content Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Detected Issues & Recommendations */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Actionable Recommendations */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" /> AI Action Plan &amp; Recommendations
                      </h3>
                      <div className="space-y-2">
                        {inspectionResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-slate-800">
                            <span className="h-5 w-5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed font-semibold">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detected Issues Highlight Feed */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" /> Detected Content Issues ({inspectionResult.issues.length})
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold">Grammar, AI Phrasing &amp; SEO</span>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {inspectionResult.issues.map((iss, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg uppercase text-[9px]">
                                {iss.type}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">Suggestion available</span>
                            </div>
                            <div className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="line-through text-red-600 mr-2">{iss.originalText}</span>
                              <span className="text-emerald-700 font-bold">➔ {iss.suggestion}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{iss.explanation}</p>
                          </div>
                        ))}

                        {inspectionResult.issues.length === 0 && (
                          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                            No critical grammar syntax or AI pattern flaws detected. Content looks clean!
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Export Report & Quick Metrics */}
                  <div className="space-y-6">
                    
                    {/* One-click Export Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Download className="h-4 w-4 text-amber-600" /> Export Audit Report
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Download full content quality assessment report in your preferred document format:
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleDownloadInspectorReport("html")}
                          className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileCode className="h-3.5 w-3.5 text-amber-600" /> HTML Report
                        </button>
                        <button
                          onClick={() => handleDownloadInspectorReport("md")}
                          className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-sky-600" /> Markdown (.md)
                        </button>
                        <button
                          onClick={() => handleDownloadInspectorReport("txt")}
                          className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-600" /> Plain Text (.txt)
                        </button>
                        <button
                          onClick={() => handleDownloadInspectorReport("json")}
                          className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileCode className="h-3.5 w-3.5 text-purple-600" /> Raw JSON
                        </button>
                      </div>
                    </div>

                    {/* Metadata Metrics Panel */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-amber-600" /> Text Structure Metrics
                      </h3>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-medium">Total Word Count</span>
                          <span className="font-bold text-slate-900 font-mono">{inspectionResult.metrics.wordCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-medium">Total Sentence Count</span>
                          <span className="font-bold text-slate-900 font-mono">{inspectionResult.metrics.sentenceCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-medium">Est. Reading Time</span>
                          <span className="font-bold text-amber-700 font-mono">{inspectionResult.metrics.readingTimeMinutes} mins</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-medium">Flesch Grade Level</span>
                          <span className="font-bold text-emerald-700">{inspectionResult.metrics.fleschKincaidGrade}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-medium">Detected Tone</span>
                          <span className="font-bold text-purple-700">{inspectionResult.scores.tone}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: AI HUMANIZER SIDE-BY-SIDE REWRITE ENGINE */}
            {inspectorViewTab === "humanizer" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" /> One-Click AI Humanizer &amp; Diff Comparison
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Select target rewrite style mode to transform formulaic AI text into 100% natural, human-written content.
                    </p>
                  </div>

                  {/* Mode Selector Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    {["Professional", "Casual", "Academic", "Marketing", "Technical", "Creative"].map((m) => (
                      <button
                        key={m}
                        onClick={() => handleHumanizeRewrite(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          humanizeMode === m
                            ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Side-by-Side Dual Editor View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Original Content Panel */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                      <span>Original Input Content</span>
                      <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg font-mono text-[10px]">
                        AI Prob: {inspectionResult?.scores.aiProbability || 0}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 leading-relaxed font-sans min-h-64 whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {inspectorText || "No content loaded."}
                    </div>
                  </div>

                  {/* Humanized Rewritten Panel */}
                  <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 space-y-3 relative">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 pb-2 border-b border-amber-200/80">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Humanized Output ({humanizeMode} Mode)
                      </span>
                      <div className="flex items-center gap-2">
                        {humanizedOutput && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(humanizedOutput);
                              setCopiedInspectorText(true);
                              setTimeout(() => setCopiedInspectorText(false), 2000);
                            }}
                            className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                          >
                            <Copy className="h-3 w-3" /> {copiedInspectorText ? "Copied!" : "Copy"}
                          </button>
                        )}
                        <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold">
                          Human Score: 98%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-900 leading-relaxed font-sans min-h-64 whitespace-pre-wrap max-h-96 overflow-y-auto font-medium">
                      {humanizing ? (
                        <div className="p-12 text-center space-y-3 text-amber-700 animate-pulse">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                          <p className="text-xs font-bold">Rewriting content into natural {humanizeMode} tone...</p>
                        </div>
                      ) : (
                        humanizedOutput || "Click a style mode above to generate humanized rewrite."
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: SCAN HISTORY TABLE */}
            {inspectorViewTab === "history" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-amber-600" /> Analysis Scan History ({inspectorHistory.length})
                </h3>

                <div className="space-y-3">
                  {inspectorHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setInspectionResult(item);
                        setInspectorText(item.text);
                        if (item.humanizedDrafts && item.humanizedDrafts["Professional"]) {
                          setHumanizedOutput(item.humanizedDrafts["Professional"]);
                        }
                        setInspectorViewTab("analysis");
                      }}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-400 rounded-2xl cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-amber-600" /> {item.filename}
                        </span>
                        <p className="text-[11px] text-slate-600 line-clamp-1 max-w-xl">{item.text}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(item.analyzedAt).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">Overall Quality</span>
                          <span className="font-black text-amber-700 font-mono">{item.scores.overallQuality}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">AI Prob</span>
                          <span className={`font-black font-mono ${item.scores.aiProbability > 40 ? "text-red-600" : "text-emerald-700"}`}>
                            {item.scores.aiProbability}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {inspectorHistory.length === 0 && (
                    <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                      No inspection history recorded yet. Run your first analysis above!
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: YOUTUBE COMPETITOR BENCHMARKING (PREVIEW) */}
        {activeTab === "youtube_competitor" && (
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
            <div className="h-16 w-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-2xs">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">YouTube Competitor Benchmarking Tool</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              Compare your YouTube channel&apos;s view velocity, upload frequency, and top performing keywords side-by-side against any public YouTube creator handle.
            </p>
            <span className="inline-block px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full">
              Module Ready for Next Addition
            </span>
          </div>
        )}

        {/* TAB 4: GOOGLE MAPS LEAD PROSPECTOR (PREVIEW) */}
        {activeTab === "leads" && (
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
            <div className="h-16 w-16 bg-sky-50 border border-sky-200 rounded-full flex items-center justify-center mx-auto text-sky-600 shadow-2xs">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Google Maps Business Lead Prospector</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              Extract local business listings by category &amp; city, discover unclaimed profiles, extract phone numbers, and export directly into sales outreach pipelines.
            </p>
            <span className="inline-block px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold rounded-full">
              Module Ready for Next Addition
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
