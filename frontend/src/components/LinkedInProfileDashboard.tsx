"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  FileText,
  Upload,
  Calendar,
  History,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sliders,
  Bell,
  Globe,
  Smile,
  Copy,
  Check,
  CheckCircle,
  Unplug,
  Building2,
  MapPin,
  TrendingUp,
  Award,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText as DocIcon
} from "lucide-react";

interface LinkedInProfileDashboardProps {
  profile?: {
    name?: string;
    email?: string;
    memberId?: string;
    headline?: string;
    picture?: string;
    locale?: string;
    createdAt?: string;
  } | null;
  config?: {
    accessToken?: string;
    memberId?: string;
    memberName?: string;
    memberEmail?: string;
    memberPicture?: string;
    headline?: string;
    companyName?: string;
    tokenExpiry?: string;
    updatedAt?: string;
    createdAt?: string;
    syncLogs?: Array<{ id: string; event: string; status: string; timestamp: string }>;
  };
  posts?: any[];
  scheduledPosts?: any[];
  drafts?: any[];
  organizationId?: string;
  onRefreshProfile?: () => void;
  onDisconnect?: () => void;
  onOpenAIAssistant?: () => void;
  onApplyContent?: (text: string) => void;
}

export function LinkedInProfileDashboard({
  profile,
  config = {},
  posts = [],
  scheduledPosts = [],
  drafts = [],
  organizationId = "demo-org-123",
  onRefreshProfile,
  onDisconnect,
  onOpenAIAssistant,
  onApplyContent
}: LinkedInProfileDashboardProps) {
  const isConnected = Boolean(config.accessToken && config.accessToken.trim().length > 10);
  const isExpired = Boolean(config.tokenExpiry && new Date() > new Date(config.tokenExpiry));

  const memberName = profile?.name || config.memberName || "LinkedIn Member";
  const memberEmail = profile?.email || config.memberEmail || "No email synchronized";
  const memberPicture = profile?.picture || config.memberPicture || "";
  const headline = profile?.headline || config.headline || "Senior Executive & Content Creator";
  const memberId = profile?.memberId || config.memberId || "urn:li:person:demo123";
  const connectedDate = config.createdAt ? new Date(config.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "30 Jan 2026";
  const lastSyncTime = config.updatedAt ? new Date(config.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Just Now";

  // Preferences State
  const [prefLanguage, setPrefLanguage] = useState("English");
  const [prefTone, setPrefTone] = useState("Thought Leadership");
  const [prefVisibility, setPrefVisibility] = useState("PUBLIC");
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [autoCTA, setAutoCTA] = useState(true);
  const [enableEmojis, setEnableEmojis] = useState(true);
  const [scheduleTime, setScheduleTime] = useState("09:00 AM");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Copy Feedback state
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Activity Timeline Items
  const syncLogs = config.syncLogs || [];
  const defaultTimeline = [
    { id: "tl-1", event: "Profile Sync", status: "SUCCESS", detail: "Synchronized LinkedIn Profile & Security Tokens", time: "Just Now", type: "sync" },
    { id: "tl-2", event: "AI Generation", status: "SUCCESS", detail: "Generated post using Groq openai/gpt-oss-120b", time: "10 mins ago", type: "ai" },
    { id: "tl-3", event: "Post Published", status: "SUCCESS", detail: "Published post to LinkedIn Personal Feed", time: "2 hours ago", type: "publish" },
    { id: "tl-4", event: "Post Scheduled", status: "SUCCESS", detail: "Queued post for automated execution", time: "1 day ago", type: "schedule" },
    { id: "tl-5", event: "Draft Saved", status: "SUCCESS", detail: "Saved post draft to local repository", time: "2 days ago", type: "draft" }
  ];

  // Derived Recent AI History
  const sampleAIHistory = [
    {
      id: "ai-h1",
      prompt: "Launching new AI-powered CRM Suite for Enterprise",
      content: "🚀 Exciting milestone! Today we launch our AI CRM automation suite.\n\nKey features:\n• Multi-channel messaging (WhatsApp, Instagram, GMB)\n• AI Copywriting\n• Automated Post Scheduling\n\nHow is your team using AI in 2026?"
    },
    {
      id: "ai-h2",
      prompt: "Hiring Staff Software Engineer in Pune",
      content: "💼 We're hiring! Looking for a Staff Full Stack Engineer to scale high-impact automation pipelines.\n\nTech stack: React, Next.js, Node.js, TypeScript, PostgreSQL.\n\nDrop your resume or tag a great engineer!"
    },
    {
      id: "ai-h3",
      prompt: "Thought leadership post on workflow automation vs tools",
      content: "💡 Most teams overestimate new tools and underestimate workflow automation.\n\nTrue scaling happens when repetitive manual tasks vanish automatically.\n\nWhat processes are you automating this quarter?"
    }
  ];

  return (
    <div className="space-y-6 font-sans pb-12 text-slate-100">
      {/* 1. Quick Actions Topbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-sm text-slate-100">Quick Actions</h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAIAssistant}
            className="px-3.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" /> ✨ Generate AI Post
          </button>
          <button
            onClick={onOpenAIAssistant}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" /> 📝 Create Draft
          </button>
          <button
            onClick={onOpenAIAssistant}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Upload className="h-3.5 w-3.5 text-purple-400" /> 📤 Upload Media
          </button>
          <button
            onClick={onOpenAIAssistant}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Calendar className="h-3.5 w-3.5 text-amber-400" /> 📅 Schedule Post
          </button>
          {onRefreshProfile && (
            <button
              onClick={onRefreshProfile}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" /> 🔄 Refresh Profile
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Profile Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-6 min-w-0">
            {memberPicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={memberPicture}
                alt={memberName}
                className="h-24 w-24 rounded-3xl object-cover border-4 border-slate-800 shadow-md shrink-0"
              />
            ) : (
              <div className="h-24 w-24 rounded-3xl bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                <User className="h-12 w-12" />
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{memberName}</h2>
                <span className="inline-flex items-center gap-1 bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> Verified Member
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                    isConnected
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                      : "bg-red-950/80 text-red-300 border-red-800"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>💼 {headline}</span>
                <span>•</span>
                <span>🏢 {config.companyName || "Jisnu Digitals"}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-4 pt-0.5">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Pune, Maharashtra, India</span>
                <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-slate-400" /> Software & IT Services</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {onDisconnect && isConnected && (
              <button
                onClick={onDisconnect}
                className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Unplug className="h-4 w-4" /> Disconnect Account
              </button>
            )}
          </div>
        </div>

        {/* Extended Details 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Email Address</span>
            <p className="text-slate-100 font-bold truncate">{memberEmail}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">LinkedIn Member ID</span>
            <p className="text-blue-400 font-mono font-bold truncate">{memberId}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Last Synchronization</span>
            <p className="text-slate-100 font-bold">{lastSyncTime}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Profile URL</span>
            <a
              href={`https://www.linkedin.com/in/${memberId}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline font-bold flex items-center gap-1 truncate"
            >
              linkedin.com/in/{memberId} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* 3. Statistics Grid (8 Metrics Cards) */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" /> Performance & Activity Statistics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Posts</span>
            <p className="text-2xl font-bold text-slate-100">{posts.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Drafts</span>
            <p className="text-2xl font-bold text-blue-400">{drafts.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Posts</span>
            <p className="text-2xl font-bold text-purple-400">{scheduledPosts.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Generated Posts</span>
            <p className="text-2xl font-bold text-emerald-400">14</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total AI Requests</span>
            <p className="text-2xl font-bold text-indigo-400">32</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Streak</span>
            <p className="text-2xl font-bold text-amber-400">🔥 7 Days</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Completion</span>
            <p className="text-2xl font-bold text-emerald-400">95%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Active</span>
            <p className="text-sm font-bold text-slate-100 pt-1">Active Just Now</p>
          </div>
        </div>
      </div>

      {/* 4. Connection Status & OAuth Health Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">OAuth Connection & Token Health</h3>
          </div>

          {/* Health Badge: Green = Healthy, Yellow = Refresh Required, Red = Disconnected */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
              !isConnected
                ? "bg-red-950/80 text-red-300 border-red-800"
                : isExpired
                ? "bg-amber-950/80 text-amber-300 border-amber-800"
                : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
            }`}
          >
            {!isConnected ? "🔴 Disconnected" : isExpired ? "🟡 Refresh Required" : "🟢 Connection Healthy"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase">OAuth Status</span>
            <p className="font-bold text-slate-100">{isConnected ? "Connected (OAuth 2.0)" : "Disconnected"}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Token Expiry</span>
            <p className="font-bold text-slate-100">{config.tokenExpiry || "60 Days (Auto-refresh)"}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Connected Since</span>
            <p className="font-bold text-slate-100">{connectedDate}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-slate-400 font-bold text-[10px] uppercase">API Version</span>
            <p className="font-mono font-bold text-blue-400">Restli 2.0 (v2026.01)</p>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400 font-bold text-[10px] uppercase">Granted OAuth Scopes</span>
          <p className="font-mono text-emerald-400 font-bold text-[11px]">openid profile email w_member_social r_basicprofile</p>
        </div>
      </div>

      {/* 5. Preferences Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">LinkedIn Publishing & AI Preferences</h3>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Preferences Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Default Language</label>
            <select
              value={prefLanguage}
              onChange={(e) => setPrefLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Marathi">Marathi</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Default AI Tone</label>
            <select
              value={prefTone}
              onChange={(e) => setPrefTone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Thought Leadership">Thought Leadership</option>
              <option value="Professional">Professional</option>
              <option value="Casual & Friendly">Casual & Friendly</option>
              <option value="Promotional & Marketing">Promotional & Marketing</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Default Visibility</label>
            <select
              value={prefVisibility}
              onChange={(e) => setPrefVisibility(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="PUBLIC">PUBLIC (Everyone)</option>
              <option value="CONNECTIONS_ONLY">CONNECTIONS_ONLY</option>
            </select>
          </div>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
          <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <span className="font-semibold text-slate-300">Auto Save Draft</span>
            <input
              type="checkbox"
              checked={autoSaveDraft}
              onChange={(e) => setAutoSaveDraft(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <span className="font-semibold text-slate-300">Auto Generate Hashtags</span>
            <input
              type="checkbox"
              checked={autoHashtags}
              onChange={(e) => setAutoHashtags(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <span className="font-semibold text-slate-300">Auto Generate CTA</span>
            <input
              type="checkbox"
              checked={autoCTA}
              onChange={(e) => setAutoCTA(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <span className="font-semibold text-slate-300">Enable Emojis</span>
            <input
              type="checkbox"
              checked={enableEmojis}
              onChange={(e) => setEnableEmojis(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSavePreferences}
            className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* 6. Activity Timeline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Activity Timeline (Newest First)</h3>
          </div>
        </div>

        <div className="space-y-3">
          {defaultTimeline.map((item) => (
            <div key={item.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-950 text-blue-400 border border-blue-800 rounded-xl">
                  {item.type === "sync" ? <RefreshCw className="h-4 w-4" /> : item.type === "ai" ? <Sparkles className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-100">{item.event}</h4>
                  <p className="text-[11px] text-slate-400">{item.detail}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Recent AI History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Recent AI Generated Contents</h3>
          </div>
        </div>

        <div className="space-y-3">
          {sampleAIHistory.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 line-clamp-1">Prompt: "{item.prompt}"</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(item.content, idx)}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg text-[11px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-blue-400" />}
                    {copiedIdx === idx ? "Copied" : "Copy"}
                  </button>
                  {onApplyContent && (
                    <button
                      onClick={() => onApplyContent(item.content)}
                      className="px-2.5 py-1 bg-[#0A66C2] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3 w-3" /> Apply
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Recent Media Uploads Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Recent Media Uploads</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-blue-950 text-blue-400 border border-blue-800 rounded-xl">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">product_launch.png</h4>
              <p className="text-[10px] text-slate-400">Image • 1.2 MB</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-purple-950 text-purple-400 border border-purple-800 rounded-xl">
              <VideoIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">demo_walkthrough.mp4</h4>
              <p className="text-[10px] text-slate-400">Video • 18.4 MB</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-amber-950 text-amber-400 border border-amber-800 rounded-xl">
              <DocIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">executive_summary.pdf</h4>
              <p className="text-[10px] text-slate-400">Document • 3.5 MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
