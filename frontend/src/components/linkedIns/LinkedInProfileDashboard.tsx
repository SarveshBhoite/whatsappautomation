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
  Users,
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
    vanityName?: string;
    profileUrl?: string;
    about?: string;
    description?: string;
    followersCount?: number | null;
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
    about?: string;
    description?: string;
    followersCount?: number | null;
    tokenExpiry?: string;
    updatedAt?: string;
    createdAt?: string;
    syncLogs?: Array<{ id: string; event: string; status: string; details?: string; timestamp: string }>;
    stats?: {
      totalAIRequests?: number;
      aiGeneratedPosts?: number;
      publishedCount?: number;
      draftsCount?: number;
      scheduledCount?: number;
      activityStreak?: number;
    };
  };
  posts?: any[];
  scheduledPosts?: any[];
  drafts?: any[];
  organizationId?: string;
  onRefreshProfile?: () => void;
  onDisconnect?: () => void;
  onOpenAIAssistant?: () => void;
  onApplyContent?: (text: string) => void;
  onSwitchToCompany?: () => void;
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
  onApplyContent,
  onSwitchToCompany
}: LinkedInProfileDashboardProps) {
  const isConnected = Boolean(config.accessToken && config.accessToken.trim().length > 10);
  const isExpired = Boolean(config.tokenExpiry && new Date() > new Date(config.tokenExpiry));

  const memberName = profile?.name || config.memberName || "LinkedIn Member";
  const memberEmail = profile?.email || config.memberEmail || "No email synchronized";
  const memberPicture = profile?.picture || config.memberPicture || "";
  const headline = profile?.headline || config.headline || "LinkedIn Creator & Professional";
  const memberId = profile?.memberId || config.memberId || "Not Connected";
  const connectedDate = config.createdAt
    ? new Date(config.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : isConnected
    ? "Active"
    : "Not Connected";
  const lastSyncTime = config.updatedAt
    ? new Date(config.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Never";

  // Dynamic AI History state fetched directly from live endpoint
  const [realAIHistory, setRealAIHistory] = useState<Array<{ id: string; prompt: string; content: string }>>([]);

  React.useEffect(() => {
    const fetchAIHistory = async () => {
      try {
        const res = await fetch(`/api/ai/history?limit=3`, {
          headers: { "x-organization-id": organizationId }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.history) && data.history.length > 0) {
            setRealAIHistory(
              data.history.map((h: any) => ({
                id: h.id,
                prompt: h.prompt,
                content: h.generatedContent || h.generatedText || ""
              }))
            );
          }
        }
      } catch (err) {
        console.error("[LINKEDIN DASHBOARD] Failed to load real AI history:", err);
      }
    };
    if (isConnected) {
      fetchAIHistory();
    }
  }, [organizationId, isConnected]);

  // Dynamic profile completion score calculation based on real populated fields
  const profileScore = React.useMemo(() => {
    let score = 0;
    if (isConnected) score += 40;
    if (memberName && memberName !== "LinkedIn Member") score += 20;
    if (memberEmail && memberEmail !== "No email synchronized") score += 15;
    if (memberPicture) score += 15;
    if (headline) score += 10;
    return score;
  }, [isConnected, memberName, memberEmail, memberPicture, headline]);

  // Copy Feedback state
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [syncingLocal, setSyncingLocal] = useState(false);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans pb-12 text-slate-900">
      {/* 1. Quick Actions Topbar with Top Position Disconnect Account */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#0A66C2]" />
          <h3 className="font-bold text-sm text-slate-800">Quick Actions</h3>
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
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <FileText className="h-3.5 w-3.5 text-[#0A66C2]" /> 📝 Create Draft
          </button>
          <button
            onClick={onOpenAIAssistant}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Upload className="h-3.5 w-3.5 text-purple-600" /> 📤 Upload Media
          </button>
          <button
            onClick={onOpenAIAssistant}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Calendar className="h-3.5 w-3.5 text-amber-600" /> 📅 Schedule Post
          </button>
          {onSwitchToCompany && (
            <button
              onClick={onSwitchToCompany}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A66C2] border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" /> Go to Company Page
            </button>
          )}
          {onRefreshProfile && (
            <button
              onClick={async () => {
                if (syncingLocal) return;
                setSyncingLocal(true);
                try {
                  await onRefreshProfile();
                } finally {
                  setTimeout(() => setSyncingLocal(false), 800);
                }
              }}
              disabled={syncingLocal || !isConnected}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${syncingLocal ? "animate-spin" : ""}`} />
              {syncingLocal ? "Syncing..." : "🔄 Refresh Profile"}
            </button>
          )}
          {onDisconnect && isConnected && (
            <button
              onClick={onDisconnect}
              className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Unplug className="h-3.5 w-3.5" /> Disconnect Account
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Profile Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 min-w-0">
            {memberPicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={memberPicture}
                alt={memberName}
                className="h-24 w-24 rounded-3xl object-cover border-4 border-slate-100 shadow-md shrink-0"
              />
            ) : (
              <div className="h-24 w-24 rounded-3xl bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-[#0A66C2] shrink-0 shadow-inner">
                <User className="h-12 w-12" />
              </div>
            )}

            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{memberName}</h2>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2]" /> Verified Member
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                    isConnected
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-2 flex-wrap">
                <span>💼 {headline}</span>
                {config.companyName && (
                  <>
                    <span>•</span>
                    <span>🏢 {config.companyName}</span>
                  </>
                )}
              </p>

              {/* Real LinkedIn About / Bio Description (if available) */}
              {(profile?.about || profile?.description || config.about || config.description) && (
                <p className="text-xs text-slate-700 bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 leading-relaxed max-w-2xl">
                  {profile?.about || profile?.description || config.about || config.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Clean Profile Details Grid: Email ID & Direct LinkedIn Profile Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Email Address</span>
            <p className="text-slate-800 font-bold truncate flex items-center gap-1.5">
              <span>📧</span> {memberEmail}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">LinkedIn Profile Link</span>
            {isConnected ? (
              <a
                href={
                  profile?.profileUrl ||
                  (profile?.vanityName ? `https://www.linkedin.com/in/${profile.vanityName}` : "https://www.linkedin.com/in/me")
                }
                target="_blank"
                rel="noreferrer"
                className="text-[#0A66C2] hover:underline font-bold flex items-center gap-1.5 truncate"
              >
                <span>🔗</span>
                <span className="truncate">
                  {profile?.profileUrl ||
                    (profile?.vanityName ? `https://www.linkedin.com/in/${profile.vanityName}` : "https://www.linkedin.com/in/me")}
                </span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <p className="text-slate-400 font-semibold italic">Not connected</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. Key Statistics Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#0A66C2]" /> Performance & Activity Statistics
        </h3>

        <div className={`grid grid-cols-2 ${(profile?.followersCount !== undefined && profile?.followersCount !== null) || (config?.followersCount !== undefined && config?.followersCount !== null) ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-4`}>
          {/* Real Total Followers (if returned by LinkedIn API) */}
          {((profile?.followersCount !== undefined && profile?.followersCount !== null) || (config?.followersCount !== undefined && config?.followersCount !== null)) && (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs hover:border-slate-300 transition-colors">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[#0A66C2]" /> Total Followers
              </span>
              <p className="text-2xl font-bold text-[#0A66C2]">
                {(profile?.followersCount ?? config?.followersCount)?.toLocaleString() || 0}
              </p>
            </div>
          )}

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Published Posts</span>
            <p className="text-2xl font-bold text-slate-900">{posts.length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Posts</span>
            <p className="text-2xl font-bold text-[#0A66C2]">{scheduledPosts.length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Drafts</span>
            <p className="text-2xl font-bold text-amber-600">{drafts.length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Completion</span>
            <p className="text-2xl font-bold text-emerald-700">{profileScore}%</p>
          </div>
        </div>
      </div>

      {/* 4. Connection Status & OAuth Health Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">OAuth Connection & Token Health</h3>
          </div>

          {/* Health Badge: Green = Healthy, Yellow = Refresh Required, Red = Disconnected */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              !isConnected
                ? "bg-red-50 text-red-700 border-red-200"
                : isExpired
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {!isConnected ? "🔴 Disconnected" : isExpired ? "🟡 Refresh Required" : "🟢 Connection Healthy"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
            <span className="text-slate-500 font-bold text-[10px] uppercase">Connection Status</span>
            <p className="font-bold text-slate-800">{isConnected ? "Connected & Synchronized" : "Disconnected"}</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
            <span className="text-slate-500 font-bold text-[10px] uppercase">Session Validity</span>
            <p className="font-bold text-slate-800">{config.tokenExpiry ? new Date(config.tokenExpiry).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : (isConnected ? "Active (Auto-renewing)" : "None")}</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
            <span className="text-slate-500 font-bold text-[10px] uppercase">Connected Since</span>
            <p className="font-bold text-slate-800">{connectedDate}</p>
          </div>
        </div>
      </div>

      {/* 7. Recent AI History Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#0A66C2]" />
            <h3 className="font-bold text-sm text-slate-800">Recent AI Generated Contents</h3>
          </div>
        </div>

        <div className="space-y-3">
          {realAIHistory.length > 0 ? (
            realAIHistory.map((item, idx) => (
              <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">Prompt: "{item.prompt}"</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(item.content, idx)}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-[#0A66C2]" />}
                      {copiedIdx === idx ? "Copied" : "Copy"}
                    </button>
                    {onApplyContent && (
                      <button
                        onClick={() => onApplyContent(item.content)}
                        className="px-2.5 py-1 bg-[#0A66C2] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Check className="h-3 w-3" /> Apply
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              No AI generations saved for this account yet. Click "Generate AI Post" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
