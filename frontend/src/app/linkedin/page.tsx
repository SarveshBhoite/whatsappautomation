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
import { AIAssistantModal } from "@/components/AIAssistantModal";
import { EngagementDashboard } from "@/components/EngagementDashboard";
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
  Info,
  Sparkles,
  Calendar,
  TrendingUp,
  BarChart3,
  Menu,
  X
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
const DEFAULT_ORG_ID = "";

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
  <div className="p-6 sm:p-8 space-y-6 animate-pulse font-sans bg-slate-50">
    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-slate-200 rounded-xl" />
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="h-3 w-32 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="h-8 w-32 bg-slate-200 rounded-lg" />
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-slate-200 rounded-2xl shrink-0" />
        <div className="space-y-2.5 flex-1">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="h-3 w-64 bg-slate-100 rounded" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs">
          <div className="h-3.5 w-24 bg-slate-100 rounded" />
          <div className="h-7 w-32 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3.5">
      <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-14 bg-slate-50 border border-slate-100 rounded-xl" />
      ))}
    </div>
  </div>
);

export default function LinkedInPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "engagement" | "profile">("overview");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activePostSection, setActivePostSection] = useState<"all" | "published" | "scheduled" | "drafts">("all");
  const [aiIdeas, setAiIdeas] = useState<Array<{ category: string; title: string; description: string; prompt: string }>>([]);
  const [aiIdeasLoading, setAiIdeasLoading] = useState(false);
  const [selectedIdeaPrompt, setSelectedIdeaPrompt] = useState("");
  const [editingDraft, setEditingDraft] = useState<any | null>(null);

  // Fetch Dynamic AI Content Ideas
  const fetchContentIdeas = async () => {
    try {
      setAiIdeasLoading(true);
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/ai/ideas`, {
        headers: { "x-organization-id": orgId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.ideas) && data.ideas.length > 0) {
          setAiIdeas(data.ideas);
        }
      }
    } catch (err) {
      console.error("[LINKEDIN] Failed to fetch dynamic content ideas:", err);
    } finally {
      setAiIdeasLoading(false);
    }
  };

  const handleSelectIdea = (prompt: string) => {
    setSelectedIdeaPrompt(prompt);
    setIsAIOpen(true);
  };

  const handleSelectTab = (
    tab: "overview" | "posts" | "engagement" | "profile" | "activity" | "settings",
    section?: "published" | "scheduled" | "drafts" | "ai"
  ) => {
    if (section === "ai") {
      setIsAIOpen(true);
      return;
    }
    if (tab === "overview" || tab === "posts" || tab === "engagement" || tab === "profile") {
      setActiveTab(tab);
    } else {
      setActiveTab("overview");
    }
    if (section && ["published", "scheduled", "drafts"].includes(section)) {
      setActivePostSection(section as any);
      setTimeout(() => {
        const el = document.getElementById(`section-${section}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } else {
      setActivePostSection("all");
    }
  };

  // Check URL query parameters for OAuth status & errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab");
      const oauthParam = searchParams.get("oauth");
      const errorParam = searchParams.get("error");
      const descParam = searchParams.get("description");

      if (tabParam && ["overview", "posts", "profile"].includes(tabParam)) {
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

  // Helper to fetch user's active organizationId dynamically
  const getActiveOrgId = (): string => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("organization_id") || DEFAULT_ORG_ID;
    }
    return DEFAULT_ORG_ID;
  };

  const [activeOrgId, setActiveOrgId] = useState<string>(DEFAULT_ORG_ID);

  useEffect(() => {
    setActiveOrgId(getActiveOrgId());
  }, []);

  // Fetch LinkedIn Configuration, Profile & Logs
  const fetchConfig = async () => {
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/config`, {
        headers: { "x-organization-id": orgId }
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
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/profile`, {
        headers: { "x-organization-id": orgId }
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
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/posts`, {
        headers: { "x-organization-id": orgId }
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
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/drafts`, {
        headers: { "x-organization-id": orgId }
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
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/scheduled`, {
        headers: { "x-organization-id": orgId }
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
      await Promise.all([fetchConfig(), fetchProfile(), fetchPosts(), fetchDrafts(), fetchScheduled(), fetchContentIdeas()]);
      setLoading(false);
    };
    init();

    // Socket.IO Real-time Synchronization Listeners
    let socket: Socket | null = null;
    try {
      const orgId = getActiveOrgId();
      socket = io(API_BASE_URL);
      socket.emit("join-org", orgId);

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
    const orgId = getActiveOrgId();
    window.location.href = `${API_BASE_URL}/api/linkedin/auth?orgId=${orgId}&redirect=/linkedin`;
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/sync`, {
        method: "POST",
        headers: { "x-organization-id": orgId }
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
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/disconnect`, {
        method: "POST",
        headers: { "x-organization-id": orgId }
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

  const handleDeletePost = async (postId: string) => {
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/posts/${encodeURIComponent(postId)}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: "Post deleted successfully from LinkedIn live feed and CRM database."
        });
        await fetchPosts();
        await fetchConfig();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to delete post from LinkedIn."
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Delete error: ${err.message}`
      });
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
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 sm:hidden"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between p-5 transform transition-transform duration-300 ease-in-out sm:hidden ${
        mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0A66C2] shadow-xs">
                <LinkedInIcon className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">LinkedIn Suite</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enterprise Growth</p>
              </div>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
              Workspace Tabs
            </span>
            {[
              { id: "overview", label: "Overview & Analytics", icon: LayoutDashboard, color: "text-[#0A66C2]", activeBg: "bg-blue-50 text-blue-800 border-blue-200" },
              { id: "posts", label: "Posts & Scheduling", icon: FileText, color: "text-indigo-600", activeBg: "bg-indigo-50 text-indigo-800 border-indigo-200" },
              { id: "engagement", label: "Live Engagement", icon: TrendingUp, color: "text-emerald-600", activeBg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
              { id: "profile", label: "Profile & Connection", icon: User, color: "text-purple-600", activeBg: "bg-purple-50 text-purple-800 border-purple-200" },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? `${item.activeBg} border shadow-xs`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
          <span>{isConnected ? "LinkedIn Connected" : "Not Connected"}</span>
        </div>
      </aside>

      {/* MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        {/* Status Alert Message Banner */}
        {statusMessage && (
          <div className="px-4 sm:px-6 pt-3">
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
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {/* LOADING SKELETON STATE */}
        {loading ? (
          <DashboardSkeleton />
        ) : !isConnected ? (
          /* UNCONNECTED STATE: CLEAN BRAND CONNECT CARD MATCHING CRM PLATFORMS */
          <div className="flex-1 overflow-y-auto p-4 sm:p-10 flex items-center justify-center bg-slate-50 text-slate-900 scrollbar-none">
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6"
              >
                <div className="mx-auto h-16 w-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0A66C2] shadow-xs">
                  <LinkedInIcon className="h-9 w-9" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    Official LinkedIn Integration
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                    Connect Your LinkedIn Account
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                    Authenticate your personal profile or company page to publish posts, schedule campaigns, and track real-time audience engagement.
                  </p>
                </div>

                <div className="pt-2 flex flex-col items-center gap-3">
                  <button
                    onClick={handleConnectOAuth}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <LinkedInIcon className="h-5 w-5" />
                    <span>Connect with LinkedIn</span>
                  </button>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Secure OAuth 2.0 API</span>
                    <span>•</span>
                    <span>Organization Isolated</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <>
            {/* STICKY TOPBAR FOR CONNECTED USERS */}
            <div className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="sm:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 shrink-0 cursor-pointer"
                  title="Open Menu"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
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
                    onClick={() => setActiveTab("engagement")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === "engagement"
                        ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" /> Engagement
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
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAIOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span className="hidden sm:inline">AI Writing Assistant</span>
                  <span className="sm:hidden">AI Assistant</span>
                </button>
              </div>
            </div>

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
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[#0A66C2] shadow-xs">
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
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
                      >
                        <RefreshCw className={`h-4 w-4 text-blue-600 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Profile"}
                      </button>
                    )}

                    {isConnected ? (
                      <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
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
                  onSelectTab={handleSelectTab}
                />

                {/* 3. Modular Profile Card Component */}
                <LinkedInProfileCard
                  profile={profile}
                  config={config}
                  organizationId={activeOrgId}
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

                {/* 5. Post Composer Component */}
                <PostComposer
                  organizationId={activeOrgId}
                  authorName={memberName}
                  authorPicture={memberPicture}
                  headline={headline}
                  onPostPublished={(newPost) => {
                    setPosts((prev) => [newPost, ...prev]);
                    fetchConfig();
                  }}
                />

                {/* 9. Enterprise Reporting Engine */}
                <EnterpriseReports
                  organizationId={activeOrgId}
                  publishedCount={posts.length}
                  scheduledCount={scheduledPosts.length}
                />

                {/* 4. Three Clean Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CARD 1: Connection */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connection</span>
                    <span className={`text-2xl font-bold ${isConnected ? "text-emerald-600" : "text-slate-400"}`}>
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
                          <tr className="text-slate-500 text-[10px] uppercase font-bold bg-slate-50/50">
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
                              <td className="py-3 px-3 text-right font-mono text-slate-700 font-medium">
                                👍 {post.likesCount || 0} • 💬 {post.commentsCount || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3 bg-slate-50/60">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <span className="font-bold text-slate-800">No published posts yet.</span>
                      <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                        Create, draft, or schedule your first post using the LinkedIn post composer or AI assistant.
                      </p>
                      <button
                        onClick={() => setActiveTab("posts")}
                        className="mt-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Create New Post
                      </button>
                    </div>
                  )}
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
                {/* Posts Sub-Navigation Switcher */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePostSection("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activePostSection === "all"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                      }`}
                    >
                      All Content ({posts.length + scheduledPosts.length + drafts.length})
                    </button>
                    <button
                      onClick={() => setActivePostSection("published")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activePostSection === "published"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                          : "bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200"
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Published ({posts.length})
                    </button>
                    <button
                      onClick={() => setActivePostSection("scheduled")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activePostSection === "scheduled"
                          ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                          : "bg-white text-blue-700 hover:bg-blue-50 border border-slate-200"
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" /> Scheduled ({scheduledPosts.length})
                    </button>
                    <button
                      onClick={() => setActivePostSection("drafts")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activePostSection === "drafts"
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                          : "bg-white text-amber-700 hover:bg-amber-50 border border-slate-200"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" /> Drafts ({drafts.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isCalendarOpen
                          ? "bg-[#0A66C2] border-[#0A66C2] text-white shadow-md shadow-blue-600/30"
                          : "bg-white hover:bg-slate-50 text-blue-700 border-slate-200 shadow-xs"
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {isCalendarOpen ? "Close Calendar" : "📅 Content Calendar"}
                    </button>

                    <button
                      onClick={() => setIsAIOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> ✨ AI Assistant
                    </button>
                  </div>
                </div>

                {/* Interactive Toggleable Content Calendar */}
                {isCalendarOpen && (
                  <ContentCalendar
                    posts={posts}
                    scheduledPosts={scheduledPosts}
                    drafts={drafts}
                    onClose={() => setIsCalendarOpen(false)}
                  />
                )}

                {/* 1. LinkedIn Post Composer Card */}
                <PostComposer
                  organizationId={activeOrgId}
                  authorName={memberName}
                  authorPicture={memberPicture}
                  headline={headline}
                  draftToEdit={editingDraft}
                  onPostPublished={(newPost) => {
                    setPosts((prev) => [newPost, ...prev]);
                    fetchConfig();
                    setEditingDraft(null);
                  }}
                  onDraftSaved={() => {
                    fetchDrafts();
                    fetchConfig();
                  }}
                  onPostScheduled={() => {
                    fetchScheduled();
                    fetchConfig();
                    setEditingDraft(null);
                  }}
                />

                {(activePostSection === "all" || activePostSection === "scheduled") && (
                  <div id="section-scheduled">
                    <ScheduleQueue
                      organizationId={activeOrgId}
                      scheduledPosts={scheduledPosts}
                      loading={loading}
                      onRefresh={fetchScheduled}
                      onPostPublished={() => {
                        fetchPosts();
                        fetchConfig();
                      }}
                    />
                  </div>
                )}

                {(activePostSection === "all" || activePostSection === "drafts") && (
                  <div id="section-drafts">
                    <DraftLibrary
                      organizationId={activeOrgId}
                      drafts={drafts}
                      loading={loading}
                      onRefresh={fetchDrafts}
                      onPostPublished={() => {
                        fetchPosts();
                        fetchConfig();
                      }}
                      onEditDraft={(draft) => {
                        setEditingDraft(draft);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </div>
                )}

                {(activePostSection === "all" || activePostSection === "published") && (
                  <div id="section-published">
                    <RecentPosts
                      posts={posts}
                      organizationId={activeOrgId}
                      loading={loading}
                      onRefresh={fetchPosts}
                      onOpenComposer={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onDeletePost={async (postId) => {
                        try {
                          const res = await fetch(`${API_BASE_URL}/api/linkedin/posts/${encodeURIComponent(postId)}`, {
                            method: "DELETE",
                            headers: { "x-organization-id": activeOrgId }
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            setStatusMessage({ type: "success", text: "✅ Post deleted from LinkedIn feed & CRM database." });
                            fetchPosts();
                            fetchConfig();
                          } else {
                            setStatusMessage({ type: "error", text: data.error || "Failed to delete post." });
                          }
                        } catch (err: any) {
                          setStatusMessage({ type: "error", text: `Error deleting post: ${err.message}` });
                        }
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: ENGAGEMENT & PERFORMANCE DASHBOARD */}
            {activeTab === "engagement" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none"
              >
                <EngagementDashboard
                  posts={posts}
                  scheduledCount={scheduledPosts.length}
                  draftsCount={drafts.length}
                  syncingEngagement={syncing}
                  onSyncEngagement={async () => {
                    setSyncing(true);
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/linkedin/posts/sync-engagement`, {
                        method: "POST",
                        headers: { "x-organization-id": activeOrgId }
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setStatusMessage({ type: "success", text: `✅ Live likes and comments updated for ${data.updatedCount || 0} posts.` });
                        if (Array.isArray(data.posts) && data.posts.length > 0) {
                          setPosts(data.posts);
                        } else {
                          fetchPosts();
                        }
                        fetchConfig();
                      } else {
                        setStatusMessage({ type: "error", text: data.error || "Failed to update engagement." });
                      }
                    } catch (err: any) {
                      setStatusMessage({ type: "error", text: `Error: ${err.message}` });
                    } finally {
                      setSyncing(false);
                    }
                  }}
                />
              </motion.div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <LinkedInProfileDashboard
                  profile={profile}
                  config={config}
                  posts={posts}
                  scheduledPosts={scheduledPosts}
                  drafts={drafts}
                  organizationId={activeOrgId}
                  onRefreshProfile={handleSyncNow}
                  onDisconnect={handleDisconnect}
                  onOpenAIAssistant={() => setActiveTab("posts")}
                  onApplyContent={(text) => {
                    setActiveTab("posts");
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Interactive AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        organizationId={activeOrgId}
        initialPrompt={selectedIdeaPrompt}
        onClose={() => {
          setIsAIOpen(false);
          setSelectedIdeaPrompt("");
        }}
        onApplyContent={(text) => {
          setIsAIOpen(false);
          setSelectedIdeaPrompt("");
          setActiveTab("posts");
        }}
      />
    </div>
  );
}
