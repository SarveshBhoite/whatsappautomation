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
  HelpCircle,
  Mail,
  Send,
  Paperclip,
  Save
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
  const [activeTab, setActiveTab] = useState<"bulk_email" | "seo" | "youtube_competitor" | "ai_content" | "leads">("bulk_email");
  const [targetUrl, setTargetUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [auditing, setAuditing] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [auditResult, setAuditResult] = useState<SeoAuditData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  // Detailed audit view tab inside result
  const [detailTab, setDetailTab] = useState<"overview" | "images" | "headings" | "pagespeed">("overview");

  // Bulk Email Campaign State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [campaignDelay, setCampaignDelay] = useState(3);
  const [scheduledDate, setScheduledDate] = useState("");
  const [extractedRecipients, setExtractedRecipients] = useState<any[]>([]);
  const [extractedStats, setExtractedStats] = useState<{ total: number; valid: number; duplicates: number; invalid: number } | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const DEFAULT_ORG_ID = "demo-org-123";

  // Fetch Campaigns & Templates
  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/campaigns`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/templates`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/campaigns/extract-file`, {
        method: "POST",
        headers: { "x-organization-id": DEFAULT_ORG_ID },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedRecipients(data.recipients || []);
        setExtractedStats({
          total: data.totalExtracted || 0,
          valid: data.validCount || 0,
          duplicates: data.duplicateCount || 0,
          invalid: data.invalidCount || 0
        });
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to parse recipient file.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Network error uploading recipient file.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleLaunchCampaign = async () => {
    const finalName = campaignName.trim() || `Bulk Campaign - ${new Date().toLocaleDateString([], { month: "short", day: "numeric" })}`;

    if (!campaignSubject.trim() || !campaignBody.trim() || extractedRecipients.length === 0) {
      setErrorMsg("Please fill in Email Subject, Body, and upload a recipient file.");
      return;
    }

    setLaunchingCampaign(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({
          name: finalName,
          subject: campaignSubject,
          bodyTemplate: campaignBody,
          recipients: extractedRecipients,
          delaySeconds: Number(campaignDelay) || 3,
          scheduledAt: scheduledDate ? new Date(scheduledDate).toISOString() : undefined
        })
      });

      if (res.ok) {
        setCampaignName("");
        setCampaignSubject("");
        setCampaignBody("");
        setExtractedRecipients([]);
        setExtractedStats(null);
        setScheduledDate("");
        await fetchCampaigns();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error ? `${errData.error}${errData.details ? `: ${errData.details}` : ""}` : "Failed to launch campaign.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Network error launching campaign.");
    } finally {
      setLaunchingCampaign(false);
    }
  };

  const handleControlCampaign = async (id: string, action: "PAUSE" | "RESUME" | "CANCEL") => {
    try {
      await fetch(`${BACKEND_URL}/api/gmail/campaigns/${id}/control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({ action })
      });
      await fetchCampaigns();
    } catch (err) {
      console.error("Control action failed:", err);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !campaignSubject.trim() || !campaignBody.trim()) {
      setErrorMsg("Subject, body, and template name are required to save a template.");
      return;
    }

    setSavingTemplate(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gmail/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID
        },
        body: JSON.stringify({
          name: templateName,
          subject: campaignSubject,
          body: campaignBody
        })
      });

      if (res.ok) {
        setTemplateName("");
        await fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTemplate(false);
    }
  };

  React.useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

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
          onClick={() => setActiveTab("bulk_email")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "bulk_email"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Mail className="h-3.5 w-3.5" /> Bulk Email Campaign
          <span className="text-[9px] bg-emerald-400/20 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Live</span>
        </button>

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
        
        {/* TAB 0: BULK EMAIL CAMPAIGN TOOL */}
        {activeTab === "bulk_email" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Campaign Creator Card */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Send className="h-5 w-5 text-emerald-400" /> Bulk Email Campaign Manager
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Upload recipient lists (Excel, CSV, or PDF), parse email addresses, and send personalized campaigns using your connected Gmail.</p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Templates Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Templates:</span>
                  <select
                    onChange={(e) => {
                      const t = templates.find(temp => temp.id === e.target.value);
                      if (t) {
                        setCampaignSubject(t.subject);
                        setCampaignBody(t.body);
                      }
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Load Saved Template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Form & File Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Summer Special Promotion"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Upload Recipient File (.xlsx, .csv, .pdf)</label>
                    <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                      <Paperclip className="h-6 w-6 text-slate-500 group-hover:text-emerald-400 mb-1" />
                      <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-300">
                        {uploadingFile ? "Parsing File..." : "Click to select Excel / CSV / PDF"}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Auto-extracts emails & columns</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {extractedStats && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-400" /> Recipients Validated
                        </span>
                        <span className="text-xs font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-lg">
                          {extractedStats.valid} Ready
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-emerald-500/20">
                        <div>Total: <strong className="text-slate-200">{extractedStats.total}</strong></div>
                        <div>Duplicates: <strong className="text-amber-400">{extractedStats.duplicates}</strong></div>
                        <div>Invalid: <strong className="text-red-400">{extractedStats.invalid}</strong></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Anti-Spam Delay (Sec)</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={campaignDelay}
                        onChange={(e) => setCampaignDelay(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Schedule Later</label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[10px] text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Email Content & Action */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Subject</label>
                    <input
                      type="text"
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      placeholder="e.g. Special Offer for {{Company}}"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Body Message</label>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>Placeholders:</span>
                        <span className="font-mono bg-slate-800 text-emerald-400 px-1 rounded">{"{{Name}}"}</span>
                        <span className="font-mono bg-slate-800 text-emerald-400 px-1 rounded">{"{{Company}}"}</span>
                        <span className="font-mono bg-slate-800 text-emerald-400 px-1 rounded">{"{{Designation}}"}</span>
                      </div>
                    </div>
                    <textarea
                      value={campaignBody}
                      onChange={(e) => setCampaignBody(e.target.value)}
                      placeholder="Hello {{Name}},&#10;&#10;We are reaching out regarding {{Company}}..."
                      rows={7}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template Name..."
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 w-36"
                      />
                      <button
                        type="button"
                        onClick={handleSaveTemplate}
                        disabled={savingTemplate || !campaignSubject.trim() || !campaignBody.trim()}
                        className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5 text-slate-400" /> Save Template
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {(extractedRecipients.length === 0 || !campaignSubject.trim() || !campaignBody.trim()) && (
                        <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                          {extractedRecipients.length === 0 ? "Upload file first" : "Enter Subject & Body"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleLaunchCampaign}
                        disabled={launchingCampaign || extractedRecipients.length === 0 || !campaignSubject.trim() || !campaignBody.trim()}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-2 shadow-lg cursor-pointer ${
                          launchingCampaign || extractedRecipients.length === 0 || !campaignSubject.trim() || !campaignBody.trim()
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 shadow-none opacity-60"
                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95"
                        }`}
                      >
                        <Send className="h-4 w-4" />
                        {launchingCampaign ? "Launching Campaign..." : scheduledDate ? "Schedule Campaign" : "Send Bulk Campaign"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Preview Table */}
              {extractedRecipients.length > 0 && (
                <div className="border-t border-slate-800 pt-5">
                  <span className="text-xs font-extrabold text-slate-200 mb-3 block">Recipient Preview ({extractedRecipients.length})</span>
                  <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-2xl divide-y divide-slate-800">
                    {extractedRecipients.slice(0, 50).map((r, i) => (
                      <div key={i} className="p-3 bg-slate-900/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-100">{r.email}</span>
                          {r.name && <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">{r.name}</span>}
                          {r.company && <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">{r.company}</span>}
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Valid</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Campaign History & Real-Time Trackers */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-400" /> Campaign History & Tracking
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Monitor progress, control sending, and download detailed reports.</p>
                </div>
                <button
                  onClick={fetchCampaigns}
                  className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>

              <div className="space-y-4">
                {campaigns.map((c) => {
                  const percent = c.totalRecipients > 0 ? Math.round(((c.sentCount + c.failedCount) / c.totalRecipients) * 100) : 0;
                  return (
                    <div key={c.id} className="p-5 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-100">{c.name}</h3>
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                              c.status === "SENDING" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse" :
                              c.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                              c.status === "PAUSED" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                              c.status === "CANCELLED" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                              "bg-slate-800 text-slate-400 border-slate-700"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Subject: <strong>{c.subject}</strong></p>
                        </div>

                        <div className="flex items-center gap-2">
                          {c.status === "SENDING" && (
                            <button
                              onClick={() => handleControlCampaign(c.id, "PAUSE")}
                              className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition"
                            >
                              Pause
                            </button>
                          )}
                          {c.status === "PAUSED" && (
                            <button
                              onClick={() => handleControlCampaign(c.id, "RESUME")}
                              className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition"
                            >
                              Resume
                            </button>
                          )}
                          {(c.status === "SENDING" || c.status === "PAUSED" || c.status === "SCHEDULED") && (
                            <button
                              onClick={() => handleControlCampaign(c.id, "CANCEL")}
                              className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition"
                            >
                              Cancel
                            </button>
                          )}
                          <a
                            href={`${BACKEND_URL}/api/gmail/campaigns/${c.id}/report`}
                            download
                            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition flex items-center gap-1 shadow-sm"
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-400" /> Download Report
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                          <span>Progress: {c.sentCount + c.failedCount} / {c.totalRecipients} ({percent}%)</span>
                          <div className="flex items-center gap-3 text-[10px]">
                            <span className="text-emerald-400 font-bold">Sent: {c.sentCount}</span>
                            <span className="text-red-400 font-bold">Failed: {c.failedCount}</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {campaigns.length === 0 && (
                  <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                    No bulk email campaigns launched yet. Create your first campaign above!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
