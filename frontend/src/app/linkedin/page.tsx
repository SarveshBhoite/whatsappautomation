"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Shield,
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
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
  </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

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
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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

  // Fetch Member Posts
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/posts`, {
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchConfig(), fetchProfile(), fetchPosts()]);
      setLoading(false);
    };
    init();

    // Socket.IO Real-time Synchronization Listeners
    let socket: Socket | null = null;
    try {
      socket = io(API_BASE_URL);
      socket.emit("join-org", DEFAULT_ORG_ID);

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
    window.location.href = `${API_BASE_URL}/api/linkedin/auth?orgId=${DEFAULT_ORG_ID}&redirect=/linkedin`;
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/sync`, {
        method: "POST",
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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
        headers: { "x-organization-id": DEFAULT_ORG_ID }
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
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        {/* Top Sub-Nav Navigation Bar */}
        <div className="h-12 border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" /> Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "posts"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-blue-400" /> Posts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <User className="h-3.5 w-3.5 text-blue-400" /> Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-blue-400" /> Activity
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" /> Settings
            </button>
          </div>
        </div>

        {/* Status Alert Message Banner */}
        {statusMessage && (
          <div className="px-6 pt-4">
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-lg ${
                statusMessage.type === "success"
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
                  : statusMessage.type === "error"
                  ? "bg-red-950/40 text-red-300 border-red-800/60"
                  : "bg-blue-950/40 text-blue-300 border-blue-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
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
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* 1. Clean Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
                      <LinkedInIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
                        LinkedIn
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Personal Member Account</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <button
                        onClick={handleSyncNow}
                        disabled={syncing}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-blue-400" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Profile"}
                      </button>
                    )}

                    {isConnected ? (
                      <button
                        onClick={handleDisconnect}
                        className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Unplug className="h-3.5 w-3.5" /> Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectOAuth}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Connect LinkedIn
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Clean Profile Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-5 min-w-0">
                      {memberPicture ? (
                        <img
                          src={memberPicture}
                          alt={memberName || "Member Profile"}
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md shrink-0"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                          <User className="h-10 w-10" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-100 truncate">
                            {formatSafeValue(memberName, "LinkedIn Member")}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isConnected
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/80"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                            {isConnected ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium truncate">
                          {formatSafeValue(memberEmail, "Not synchronized")}
                        </p>
                        <p className="text-xs text-slate-500 font-normal truncate">
                          {formatSafeValue(headline, "Personal Member Account")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                      {isConnected && (
                        <button
                          onClick={handleSyncNow}
                          disabled={syncing}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-blue-400" : ""}`} /> Refresh Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Three Clean Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CARD 1: Connection */}
                  <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connection</span>
                    <span className={`text-2xl font-bold ${isConnected ? "text-emerald-400" : "text-slate-400"}`}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>

                  {/* CARD 2: Last Synchronization */}
                  <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Synchronization</span>
                    <span className="text-2xl font-bold text-slate-100 truncate">
                      {lastSyncTime}
                    </span>
                  </div>

                  {/* CARD 3: Posts */}
                  <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posts</span>
                    <span className="text-2xl font-bold text-slate-100">
                      {posts.length > 0 ? posts.length : "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* 4. Recent Posts Section */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" /> Recent Posts
                  </h3>

                  {posts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-850">
                        <thead>
                          <tr className="text-slate-500 text-[10px] uppercase font-bold">
                            <th className="py-2.5 px-3">Author</th>
                            <th className="py-2.5 px-3">Summary</th>
                            <th className="py-2.5 px-3">Published Date</th>
                            <th className="py-2.5 px-3 text-right">Engagement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/50">
                          {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-3 px-3 font-semibold text-blue-400">{post.author}</td>
                              <td className="py-3 px-3 text-slate-200 max-w-md truncate">{post.summary}</td>
                              <td className="py-3 px-3 font-mono text-slate-400">{new Date(post.publishedAt).toLocaleDateString()}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-300">
                                👍 {post.likesCount || 0} • 💬 {post.commentsCount || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl flex flex-col items-center gap-3 bg-slate-900/40">
                      <AlertCircle className="h-8 w-8 text-amber-500/80" />
                      <span className="font-semibold text-slate-200">No LinkedIn posts available.</span>
                      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
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
              </div>
            )}

            {/* TAB 2: POSTS */}
            {activeTab === "posts" && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                      <FileText className="h-5 w-5 text-blue-400" /> Member Posts & Activity
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">View personal posts feed</p>
                  </div>

                  <button
                    onClick={fetchPosts}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-blue-400" /> Refresh Feed
                  </button>
                </div>

                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {posts.map((post) => (
                        <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-400">{post.author}</span>
                            <span className="text-[10px] text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{post.summary}</p>
                          <div className="text-[11px] text-slate-400 font-mono border-t border-slate-850 pt-2 flex items-center justify-between">
                            <span>👍 {post.likesCount || 0} Likes</span>
                            <span>💬 {post.commentsCount || 0} Comments</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl flex flex-col items-center gap-3 bg-slate-900/40">
                      <AlertCircle className="h-10 w-10 text-amber-500/80" />
                      <span className="font-semibold text-slate-200 text-sm">No LinkedIn posts available.</span>
                      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                        Personal LinkedIn posts are unavailable with the current LinkedIn Member API permissions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === "profile" && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                      <User className="h-5 w-5 text-blue-400" /> Member Profile Details
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Authenticated LinkedIn member profile information</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6 mb-6">
                    <div className="flex items-center gap-5">
                      {memberPicture ? (
                        <img
                          src={memberPicture}
                          alt={memberName || "Member Profile"}
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md shrink-0"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                          <User className="h-10 w-10" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-100">
                            {formatSafeValue(memberName, "LinkedIn Member")}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isConnected
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/80"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                            {isConnected ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{formatSafeValue(memberEmail)}</p>
                        <p className="text-xs text-slate-500 font-normal">{formatSafeValue(headline, "Personal Member Account")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isConnected && (
                        <button
                          onClick={handleSyncNow}
                          disabled={syncing}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-blue-400" : ""}`} /> Refresh Profile
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-medium">Full Name</span>
                      <p className="text-slate-200 font-bold">{formatSafeValue(memberName)}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-medium">Email Address</span>
                      <p className="text-slate-200 font-bold">{formatSafeValue(memberEmail)}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-medium">Headline</span>
                      <p className="text-slate-200 font-bold">{formatSafeValue(headline)}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-medium">Last Synchronization</span>
                      <p className="text-slate-200 font-bold">{lastSyncTime}</p>
                    </div>
                  </div>
                </div>
              </div>
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
