"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LinkedInProfileCard } from "@/components/LinkedInProfileCard";
import { LinkedInProfileDashboard } from "@/components/LinkedInProfileDashboard";
import { PostComposer } from "@/components/PostComposer";
import { RecentPosts } from "@/components/RecentPosts";
import { ScheduleQueue } from "@/components/ScheduleQueue";
import { DraftLibrary } from "@/components/DraftLibrary";
import { CompanyPageCard } from "@/components/CompanyPageCard";
import { LinkedInAnalyticsDashboard } from "@/components/LinkedInAnalyticsDashboard";
import { ApprovalWorkflowQueue } from "@/components/ApprovalWorkflowQueue";
import { ContentCalendar } from "@/components/ContentCalendar";
import { MediaLibrary } from "@/components/MediaLibrary";
import { EnterpriseReports } from "@/components/EnterpriseReports";
import {
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Unplug,
  SlidersHorizontal,
  LayoutDashboard,
  User,
  FileText,
  Activity,
  CheckCircle,
  Info
} from "lucide-react";
import { io, Socket } from "socket.io-client";

// Native SVG representation of LinkedIn logo
const LinkedInIcon = ({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
  </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "";
};

// Helper function to safely format values
const formatSafeValue = (val: any, fallback = "Not synchronized"): string => {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "Connected" : "Disconnected";
  return String(val);
};

interface LinkedInProfileData {
  id?: string;
  memberId?: string;
  name?: string;
  email?: string;
  headline?: string;
  picture?: string;
  vanityName?: string;
  profileUrl?: string;
  locale?: string;
  updatedAt?: string;
}

interface LinkedInSyncLog {
  id: string;
  event: string;
  status: string;
  details?: string;
  timestamp: string;
}

interface LinkedInConfigData {
  id?: string;
  organizationId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenExpiry?: string;
  memberId?: string;
  memberName?: string;
  memberEmail?: string;
  memberPicture?: string;
  headline?: string;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  website?: string;
  updatedAt?: string;
  profile?: LinkedInProfileData;
  syncLogs?: LinkedInSyncLog[];
}

interface PersonalPostItem {
  id: string;
  linkedinPostId: string;
  author: string;
  summary: string;
  mediaUrl?: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
}

// -------------------------------------------------------------
// CRM Loading Skeletons
// -------------------------------------------------------------
const DashboardSkeleton = () => (
  <div className="p-6 sm:p-8 space-y-6 animate-pulse font-sans">
    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-slate-800 rounded-xl" />
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-800 rounded-md" />
          <div className="h-3 w-32 bg-slate-850 rounded-md" />
        </div>
      </div>
      <div className="h-8 w-32 bg-slate-800 rounded-lg" />
    </div>

    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 bg-slate-800 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="h-3 w-64 bg-slate-850 rounded" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-2 shadow-md">
          <div className="h-3 w-24 bg-slate-800 rounded" />
          <div className="h-7 w-32 bg-slate-800 rounded" />
        </div>
      ))}
    </div>

    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
      <div className="h-4 w-40 bg-slate-800 rounded mb-4" />
      {[1, 2].map((i) => (
        <div key={i} className="h-12 bg-slate-900/60 rounded-xl" />
      ))}
    </div>
  </div>
);

export default function LinkedInPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "profile" | "activity" | "settings">("overview");
  const [activeTheme, setActiveTheme] = useState("aurora");
  const [config, setConfig] = useState<LinkedInConfigData>({});
  const [profile, setProfile] = useState<LinkedInProfileData | null>(null);
  const [syncLogs, setSyncLogs] = useState<LinkedInSyncLog[]>([]);
  const [posts, setPosts] = useState<PersonalPostItem[]>([]);
  const [postsPermissionMessage, setPostsPermissionMessage] = useState<string>(
    "Personal LinkedIn posts are unavailable with the current LinkedIn Member API permissions."
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Check URL query parameters for OAuth status & errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab");
      const oauthParam = searchParams.get("oauth");
      const errorParam = searchParams.get("error");
      const descParam = searchParams.get("description");

      if (tabParam && ["overview", "posts", "profile", "activity", "settings"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }

      if (oauthParam === "success") {
        setStatusMessage({
          type: "success",
          text: "Personal LinkedIn account successfully connected!"
        });
      } else if (oauthParam === "error") {
        const fullErr = descParam
          ? `LinkedIn OAuth Error: ${descParam}`
          : errorParam
            ? `LinkedIn OAuth Error: ${errorParam}`
            : "Failed to authorize Personal LinkedIn account.";

        setStatusMessage({
          type: "error",
          text: fullErr
        });
      }
    }
  }, []);

  // Fetch LinkedIn Configuration, Profile & Logs
  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/config`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.profile) setProfile(data.profile);
        if (data.syncLogs) setSyncLogs(data.syncLogs);
      }
    } catch (err) {
      console.error("[LINKEDIN] Failed to fetch config:", err);
    }
  };

  // Fetch Profile details directly
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/profile`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.config) setConfig(data.config);
      }
    } catch (err) {
      console.error("[LINKEDIN] Failed to fetch profile:", err);
    }
  };

  const [drafts, setDrafts] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);

  // Fetch Member Posts
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/posts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.posts) setPosts(data.posts);
        if (data.message) setPostsPermissionMessage(data.message);
      }
    } catch (err) {
      console.error("[LINKEDIN] Failed to fetch posts:", err);
    }
  };

  // Fetch Drafts
  const fetchDrafts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/drafts`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.drafts) setDrafts(data.drafts);
      }
    } catch (err) {
      console.error("[LINKEDIN] Failed to fetch drafts:", err);
    }
  };

  // Fetch Scheduled Posts
  const fetchScheduled = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/scheduled`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scheduledPosts) setScheduledPosts(data.scheduledPosts);
      }
    } catch (err) {
      console.error("[LINKEDIN] Failed to fetch scheduled posts:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchConfig(), fetchProfile(), fetchPosts(), fetchDrafts(), fetchScheduled()]);
      setLoading(false);
    };
    init();

    // Socket.IO Real-time Synchronization Listeners
    let socket: Socket | null = null;
    try {
      socket = io(API_BASE_URL);
      const org = getOrgId(); if (org) socket.emit("join-org", org);

      socket.on("linkedin-profile-updated", (data: any) => {
        if (data.profile) setProfile(data.profile);
      });

      socket.on("linkedin-sync-completed", () => {
        fetchConfig();
        fetchPosts();
      });

      socket.on("linkedin-connected", () => {
        fetchConfig();
        fetchProfile();
      });

      socket.on("linkedin-disconnected", () => {
        setProfile(null);
        setConfig({});
      });
    } catch (err) {
      console.error("[LINKEDIN] Socket connection error:", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleConnectOAuth = () => {
    window.location.href = `${API_BASE_URL}/api/linkedin/auth?orgId=${getOrgId()}&redirect=/linkedin`;
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/sync`, {
        method: "POST",
        headers: { "x-organization-id": getOrgId() }
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: data.message || "LinkedIn profile synchronized successfully!"
        });
        await fetchConfig();
        await fetchProfile();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to synchronize profile."
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Sync error: ${err.message}`
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Personal LinkedIn account?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/disconnect`, {
        method: "POST",
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        setConfig({});
        setProfile(null);
        setPosts([]);
        setStatusMessage({
          type: "info",
          text: "LinkedIn account disconnected."
        });
      }
    } catch (err) {
      console.error("[LINKEDIN] Disconnect error:", err);
    }
  };

  const isConnected = Boolean(config.accessToken && config.accessToken.trim().length > 10);
  const memberName = profile?.name || config.memberName || "";
  const memberEmail = profile?.email || config.memberEmail || "";
  const memberPicture = profile?.picture || config.memberPicture || "";
  const headline = profile?.headline || config.headline || "LinkedIn Member";
  const memberId = profile?.memberId || config.memberId || "";
  const profileUrl = profile?.profileUrl || (profile?.vanityName ? `https://www.linkedin.com/in/${profile.vanityName}` : null);
  const lastSyncTime = config.updatedAt ? new Date(config.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not synchronized";
  const tokenExpiry = config.tokenExpiry ? new Date(config.tokenExpiry).toLocaleDateString() : "60 Days (OAuth 2.0)";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F8FAFC] text-slate-900 font-sans">
      {/* MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC] pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        {/* Sticky Glass Topbar */}
        <div className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 gap-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "posts"
                  ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileText className="h-4 w-4" /> Posts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <User className="h-4 w-4" /> Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Activity className="h-4 w-4" /> Activity
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-white shadow-sm"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Settings
            </button>
          </div>
        </div>

        {/* Status Alert Message Banner */}
        {statusMessage && (
          <div className="px-6 pt-4">
            <div
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-sm ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : statusMessage.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* LOADING SKELETON STATE */}
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none"
              >
                {/* 1. Clean Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[#0A66C2] shadow-sm">
                      <LinkedInIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                        LinkedIn Workspace
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">Enterprise Member Account & Growth Engine</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <button
                        onClick={handleSyncNow}
                        disabled={syncing}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition-all"
                      >
                        <RefreshCw className={`h-4 w-4 text-[#0A66C2] ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Profile"}
                      </button>
                    )}

                    {isConnected ? (
                      <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                      >
                        <Unplug className="h-4 w-4" /> Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectOAuth}
                        className="px-5 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4" /> Connect LinkedIn
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Analytics Dashboard Component */}
                <LinkedInAnalyticsDashboard
                  stats={{
                    connectedAccounts: isConnected ? 1 : 0,
                    publishedCount: posts.length,
                    scheduledCount: scheduledPosts.length,
                    draftsCount: drafts.length,
                    failedCount: scheduledPosts.filter((s) => s.status === "FAILED").length,
                    successRate: posts.length + scheduledPosts.length > 0 ? Math.round((posts.length / (posts.length + scheduledPosts.filter((s) => s.status === "FAILED").length || 1)) * 100) : 100,
                    aiUsageCount: config?.syncLogs?.filter((l: any) => l.event?.includes("AI")).length || 0,
                    pendingApprovalsCount: scheduledPosts.filter((s) => s.approvalStatus === "PENDING_APPROVAL").length
                  }}
                />

                {/* 3. Modular Profile Card Component */}
                <LinkedInProfileCard
                  profile={profile}
                  config={config}
                  organizationId={getOrgId()}
                  onRefreshSuccess={() => {
                    fetchConfig();
                    fetchProfile();
                  }}
                  onDisconnectSuccess={() => {
                    setConfig({});
                    setProfile(null);
                    setPosts([]);
                  }}
                />

                {/* 4. Company Page Module */}
                <CompanyPageCard
                  companyName={config?.companyName || "Your Company Page"}
                  companyId={config?.companyId || ""}
                  companyLogo={config?.companyLogo || ""}
                  website={config?.website || ""}
                  isConnected={Boolean(config?.companyId)}
                />

                {/* 5. Post Composer Component */}
                <PostComposer
                  organizationId={getOrgId()}
                  authorName={memberName}
                  authorPicture={memberPicture}
                  headline={headline}
                  onPostPublished={(newPost) => {
                    setPosts((prev) => [newPost, ...prev]);
                    fetchConfig();
                  }}
                />

                {/* 6. Approval Workflow Queue */}
                <ApprovalWorkflowQueue
                  organizationId={getOrgId()}
                  pendingPosts={scheduledPosts.filter((s) => s.approvalStatus === "PENDING_APPROVAL")}
                  onRefresh={fetchScheduled}
                />

                {/* 7. Content Calendar */}
                <ContentCalendar
                  posts={posts}
                  scheduledPosts={scheduledPosts}
                  drafts={drafts}
                />

                {/* 8. Media Asset Library */}
                <MediaLibrary />

                {/* 9. Enterprise Reporting Engine */}
                <EnterpriseReports
                  organizationId={getOrgId()}
                  publishedCount={posts.length}
                  scheduledCount={scheduledPosts.length}
                />

                {/* 4. Three Clean Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CARD 1: Connection */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connection</span>
                    <span className={`text-2xl font-bold ${isConnected ? "text-emerald-600" : "text-slate-500"}`}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>

                  {/* CARD 2: Last Synchronization */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Synchronization</span>
                    <span className="text-2xl font-bold text-slate-900 truncate">
                      {lastSyncTime}
                    </span>
                  </div>

                  {/* CARD 3: Posts */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Published Posts</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {posts.length > 0 ? posts.length : "0"}
                    </span>
                  </div>
                </div>

                {/* 4. Recent Posts Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0A66C2]" /> Recent Posts
                  </h3>

                  {posts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
                        <thead>
                          <tr className="text-slate-500 text-[10px] uppercase font-bold">
                            <th className="py-2.5 px-3">Author</th>
                            <th className="py-2.5 px-3">Summary</th>
                            <th className="py-2.5 px-3">Published Date</th>
                            <th className="py-2.5 px-3 text-right">Engagement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-3 font-bold text-[#0A66C2]">{post.author}</td>
                              <td className="py-3 px-3 text-slate-800 max-w-md truncate">{post.summary}</td>
                              <td className="py-3 px-3 font-mono text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700">
                                👍 {post.likesCount || 0} • 💬 {post.commentsCount || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3 bg-slate-50/60">
                      <AlertCircle className="h-8 w-8 text-amber-500" />
                      <span className="font-bold text-slate-800">No LinkedIn posts available.</span>
                      <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                        Personal LinkedIn posts are unavailable with the current LinkedIn Member API permissions.
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Clean Recent Activity (Latest 5 items only) */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-400" /> Recent Activity
                  </h3>

                  {syncLogs.length > 0 ? (
                    <div className="space-y-2.5">
                      {syncLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-855 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-200">{log.event}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No recent synchronization activity.
                    </div>
                  )}
                </div>

                {/* 6. Compact Information Banner */}
                <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-blue-300 shadow-sm">
                  <Info className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Personal analytics and personal posts are not available through the LinkedIn Member API.</span>
                </div>
              </motion.div>
            )}

            {/* TAB 2: POSTS */}
            {activeTab === "posts" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <PostComposer
                  organizationId={getOrgId()}
                  authorName={memberName}
                  authorPicture={memberPicture}
                  headline={headline}
                  onPostPublished={(newPost) => {
                    setPosts((prev) => [newPost, ...prev]);
                    fetchConfig();
                  }}
                  onDraftSaved={() => {
                    fetchDrafts();
                    fetchConfig();
                  }}
                  onPostScheduled={() => {
                    fetchScheduled();
                    fetchConfig();
                  }}
                />

                <ScheduleQueue
                  organizationId={getOrgId()}
                  scheduledPosts={scheduledPosts}
                  loading={loading}
                  onRefresh={fetchScheduled}
                  onPostPublished={() => {
                    fetchPosts();
                    fetchConfig();
                  }}
                />

                <DraftLibrary
                  organizationId={getOrgId()}
                  drafts={drafts}
                  loading={loading}
                  onRefresh={fetchDrafts}
                  onPostPublished={() => {
                    fetchPosts();
                    fetchConfig();
                  }}
                />

                <RecentPosts
                  posts={posts}
                  loading={loading}
                  onRefresh={fetchPosts}
                />
              </motion.div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-none"
              >
                <LinkedInProfileDashboard
                  profile={profile}
                  config={config}
                  posts={posts}
                  scheduledPosts={scheduledPosts}
                  drafts={drafts}
                  organizationId={getOrgId()}
                  onRefreshProfile={handleSyncNow}
                  onDisconnect={handleDisconnect}
                  onOpenAIAssistant={() => setActiveTab("posts")}
                  onApplyContent={(text) => {
                    setActiveTab("posts");
                  }}
                />
              </motion.div>
            )}

            {/* TAB 4: ACTIVITY */}
            {activeTab === "activity" && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                      <Activity className="h-5 w-5 text-blue-400" /> Synchronization Activity
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Real-time synchronization events</p>
                  </div>
                </div>

                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  {syncLogs.length > 0 ? (
                    <div className="space-y-2.5">
                      {syncLogs.map((log) => (
                        <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-200">{log.event}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No recent synchronization activity.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {activeTab === "settings" && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 w-full max-w-4xl mx-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <SlidersHorizontal className="h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 font-sans uppercase tracking-wider">LinkedIn Settings & Technical Details</h2>
                    <p className="text-xs text-slate-400 mt-0.5">OAuth credentials, member identifiers, and API permissions</p>
                  </div>
                </div>

                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <LinkedInIcon className="h-4.5 w-4.5 text-blue-500" /> Technical Connection Details
                    </h3>
                    {isConnected && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                        Connected ✓
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold">Connection Status</span>
                      <p className={`font-bold ${isConnected ? "text-emerald-400" : "text-slate-400"}`}>
                        {isConnected ? "Connected" : "Disconnected"}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold">LinkedIn Member ID</span>
                      <p className="text-slate-200 font-mono font-bold">{formatSafeValue(memberId)}</p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold">Authorized Scopes</span>
                      <p className="text-emerald-400 font-mono font-bold">openid profile email</p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold">OAuth Provider</span>
                      <p className="text-blue-400 font-bold">LinkedIn OAuth 2.0 (OpenID Connect)</p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold">Access Token Status</span>
                      <p className="text-slate-200 font-bold">
                        {isConnected ? "Active OAuth 2.0 Token" : "No active token"}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold">Token Expiration</span>
                      <p className="text-slate-200 font-bold">{tokenExpiry}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                    <button
                      onClick={handleSyncNow}
                      disabled={syncing || !isConnected}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-blue-400" : ""}`} /> Refresh Profile
                    </button>

                    <div className="flex items-center gap-3">
                      {isConnected && (
                        <button
                          onClick={handleDisconnect}
                          className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-semibold text-xs transition-all cursor-pointer"
                        >
                          Disconnect Account
                        </button>
                      )}
                      <button
                        onClick={handleConnectOAuth}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Reconnect LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
