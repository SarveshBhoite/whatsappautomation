"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LinkedInProfileCard } from "@/components/linkedIns/LinkedInProfileCard";
import { LinkedInProfileDashboard } from "@/components/linkedIns/LinkedInProfileDashboard";
import { PostComposer } from "@/components/linkedIns/PostComposer";
import { RecentPosts } from "@/components/linkedIns/RecentPosts";
import { ScheduleQueue } from "@/components/linkedIns/ScheduleQueue";
import { DraftLibrary, DraftItem } from "@/components/linkedIns/DraftLibrary";
import { CompanyPageCard } from "@/components/linkedIns/CompanyPageCard";
import { CompanyPageDashboard } from "@/components/linkedIns/CompanyPageDashboard";
import { LinkedInAnalyticsDashboard } from "@/components/linkedIns/LinkedInAnalyticsDashboard";
import { ApprovalWorkflowQueue } from "@/components/linkedIns/ApprovalWorkflowQueue";
import { ContentCalendar } from "@/components/linkedIns/ContentCalendar";
import { MediaLibrary } from "@/components/linkedIns/MediaLibrary";
import { EnterpriseReports } from "@/components/linkedIns/EnterpriseReports";
import { AIAssistantModal } from "@/components/linkedIns/AIAssistantModal";
import { EngagementDashboard } from "@/components/linkedIns/EngagementDashboard";
import {
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Unplug,
  Building2,
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

interface LinkedInOrgConfigData {
  id?: string;
  organizationId?: string;
  companyId?: string;
  companyName?: string;
  vanityName?: string;
  companyLogo?: string;
  website?: string;
  industry?: string;
  description?: string;
  followersCount?: number;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  updatedAt?: string;
}

interface LinkedInOrgProfileData {
  id?: string;
  companyId?: string;
  companyName?: string;
  vanityName?: string;
  companyLogo?: string;
  website?: string;
  industry?: string;
  description?: string;
  localizedName?: string;
  followersCount?: number;
  organicFollowers?: number;
  paidFollowers?: number;
  staffCountRange?: string;
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

function LinkedInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query param `tab` is the SINGLE SOURCE OF TRUTH
  // Default to 'profile' if not provided or unknown
  const tabParam = searchParams.get("tab");
  const activeTab: "profile" | "company" | "posts" | "engagement" = 
    tabParam === "company" ? "company" :
    tabParam === "posts" ? "posts" :
    tabParam === "engagement" ? "engagement" :
    "profile";

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [config, setConfig] = useState<LinkedInConfigData>({});
  const [profile, setProfile] = useState<LinkedInProfileData | null>(null);
  const [orgConfig, setOrgConfig] = useState<LinkedInOrgConfigData>({});
  const [orgProfile, setOrgProfile] = useState<LinkedInOrgProfileData | null>(null);
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
  const [activePostSection, setActivePostSection] = useState<
    "all" | "overview" | "composer" | "posts" | "analytics" | "schedule" | "drafts" | "calendar" | "reports"
  >("overview");
  const [aiIdeas, setAiIdeas] = useState<Array<{ category: string; title: string; description: string; prompt: string }>>([]);
  const [aiIdeasLoading, setAiIdeasLoading] = useState(false);
  const [selectedIdeaPrompt, setSelectedIdeaPrompt] = useState("");
  const [editingDraft, setEditingDraft] = useState<DraftItem | null>(null);

  // Switch tabs strictly via router.push with clean query parameters
  const navigateToTab = (tab: "profile" | "company" | "posts" | "engagement") => {
    router.push(`/linkedin?tab=${tab}`);
  };

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
    tab: "overview" | "posts" | "engagement" | "profile" | "company" | "activity" | "settings",
    section?: "published" | "scheduled" | "drafts" | "ai"
  ) => {
    if (section === "ai") {
      setIsAIOpen(true);
      return;
    }
    const targetTab = tab === "company" ? "company" : tab === "posts" ? "posts" : tab === "engagement" ? "engagement" : "profile";
    navigateToTab(targetTab);

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
    const oauthParam = searchParams.get("oauth");
    const errorParam = searchParams.get("error");
    const descParam = searchParams.get("description");
    const platformParam = searchParams.get("platform");

    if (oauthParam === "success") {
      const isOrg = platformParam === "linkedin_org" || tabParam === "company";
      setStatusMessage({
        type: "success",
        text: isOrg ? "LinkedIn Company Page successfully connected!" : "Personal LinkedIn account successfully connected!"
      });
    } else if (oauthParam === "error") {
      const isOrg = platformParam === "linkedin_org" || tabParam === "company";
      const fullErr = descParam
        ? `LinkedIn OAuth Error: ${descParam}`
        : errorParam
          ? `LinkedIn OAuth Error: ${errorParam}`
          : isOrg ? "Failed to authorize LinkedIn Company Page." : "Failed to authorize Personal LinkedIn account.";

      setStatusMessage({
        type: "error",
        text: fullErr
      });
    }
  }, [searchParams, tabParam]);

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

  // Fetch CRM1 LinkedIn Configuration, Profile & Logs
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

  // Fetch CRM3 LinkedIn Organization Configuration & Profile
  const fetchOrgConfig = async () => {
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/config`, {
        headers: { "x-organization-id": orgId }
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[CRM3] /api/linkedin/org/config response:", data);
        if (data.config) setOrgConfig(data.config);
        if (data.profile) setOrgProfile(data.profile);
      }

      // Also query /api/linkedin/org/profile to ensure live follower stats and profile fields are loaded
      const profRes = await fetch(`${API_BASE_URL}/api/linkedin/org/profile`, {
        headers: { "x-organization-id": orgId }
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        console.log("[CRM3] /api/linkedin/org/profile response:", profData);
        if (profData.profile) {
          setOrgProfile(profData.profile);
        }
      }
    } catch (err) {
      console.error("[LINKEDIN ORG] Failed to fetch org config & profile:", err);
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
      await Promise.all([
        fetchConfig(),
        fetchOrgConfig(),
        fetchProfile(),
        fetchPosts(),
        fetchDrafts(),
        fetchScheduled(),
        fetchContentIdeas()
      ]);
      setLoading(false);
    };
    init();
  }, [activeOrgId]);

  useEffect(() => {
    if (activeTab === "company") {
      fetchOrgConfig();
    } else if (activeTab === "profile") {
      fetchConfig();
      fetchProfile();
      fetchPosts();
    }
  }, [activeTab]);

  // Socket.IO Real-time Synchronization Listeners
  useEffect(() => {
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
        fetchOrgConfig();
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
    window.location.href = `${API_BASE_URL}/api/linkedin/auth?orgId=${orgId}&redirect=/linkedin?tab=profile`;
  };

  const handleConnectOrgOAuth = () => {
    const orgId = getActiveOrgId();
    window.location.href = `${API_BASE_URL}/api/linkedin/auth/org?orgId=${orgId}&redirect=/linkedin?tab=company`;
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
          text: "Personal LinkedIn account disconnected."
        });
        const isOrgConn = Boolean(orgConfig.accessToken && orgConfig.accessToken.trim().length > 10);
        if (isOrgConn) {
          navigateToTab("company");
        }
      }
    } catch (err) {
      console.error("[LINKEDIN] Disconnect error:", err);
    }
  };

  const handleDisconnectOrg = async () => {
    if (!confirm("Are you sure you want to disconnect your LinkedIn Company Page?")) return;

    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/disconnect`, {
        method: "POST",
        headers: { "x-organization-id": orgId }
      });
      if (res.ok) {
        setOrgConfig({});
        setOrgProfile(null);
        setStatusMessage({
          type: "info",
          text: "LinkedIn Company Page disconnected."
        });
        const isPersConn = Boolean(config.accessToken && config.accessToken.trim().length > 10);
        if (isPersConn) {
          navigateToTab("profile");
        }
      }
    } catch (err) {
      console.error("[LINKEDIN ORG] Disconnect error:", err);
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
  const isOrgConnected = Boolean(orgConfig.accessToken && orgConfig.accessToken.trim().length > 10);
  const hasAnyConnection = isConnected || isOrgConnected;

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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between p-5 transform transition-transform duration-300 ease-in-out sm:hidden ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
              Account Modes
            </span>
            <button
              onClick={() => {
                navigateToTab("profile");
                setMobileDrawerOpen(false);
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "profile"
                  ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <User className="h-4 w-4" />
              <span>Personal Profile (CRM1)</span>
            </button>

            <button
              onClick={() => {
                navigateToTab("company");
                setMobileDrawerOpen(false);
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "company"
                  ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Company Page (CRM3)</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span>Personal: {isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isOrgConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span>Company: {isOrgConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 pb-[calc(env(safe-area-inset-bottom)+56px)] sm:pb-0">
        {/* Status Alert Message Banner */}
        {statusMessage && (
          <div className="px-4 sm:px-6 pt-3">
            <div
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-sm ${statusMessage.type === "success"
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
        ) : (
          <>
            {/* STICKY TOPBAR HEADER WITH DIRECT ROUTER TABS */}
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
                    onClick={() => navigateToTab("profile")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <User className="h-4 w-4" /> Personal Profile (CRM1)
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToTab("company")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === "company"
                        ? "bg-[#0A66C2] text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="h-4 w-4" /> Company Page (CRM3)
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

            {/* TAB: PERSONAL PROFILE (CRM1 MODE) */}
            {activeTab === "profile" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {isConnected ? (
                  <>
                    {/* CRM1 Sub-Navigation Tabs Bar */}
                    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 shadow-2xs">
                      {[
                        { id: "overview", label: "Overview", icon: LayoutDashboard },
                        { id: "composer", label: "Post Composer", icon: Sparkles },
                        { id: "posts", label: "Published Posts", icon: FileText, count: posts.length },
                        { id: "analytics", label: "Engagement & Analytics", icon: TrendingUp },
                        { id: "schedule", label: "Schedule Queue", icon: Calendar, count: scheduledPosts.length },
                        { id: "drafts", label: "Draft Library", icon: SlidersHorizontal, count: drafts.length },
                        { id: "calendar", label: "Content Calendar", icon: Calendar },
                        { id: "reports", label: "Reports & Exports", icon: BarChart3 }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isCurrent = activePostSection === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActivePostSection(tab.id as any);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                              isCurrent
                                ? "bg-blue-50 text-[#0A66C2] border border-blue-200 shadow-2xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                isCurrent ? "bg-[#0A66C2] text-white" : "bg-slate-200 text-slate-700"
                              }`}>
                                {tab.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {activePostSection === "all" || activePostSection === "overview" ? (
                        <LinkedInProfileDashboard
                          profile={profile}
                          config={config}
                          posts={posts}
                          scheduledPosts={scheduledPosts}
                          drafts={drafts}
                          organizationId={activeOrgId}
                          onRefreshProfile={handleSyncNow}
                          onDisconnect={handleDisconnect}
                          onOpenAIAssistant={() => setIsAIOpen(true)}
                          onApplyContent={(text) => {
                            setActivePostSection("composer");
                            setIsAIOpen(false);
                          }}
                          onSwitchToCompany={() => navigateToTab("company")}
                        />
                      ) : null}

                      {activePostSection === "composer" && (
                        <PostComposer
                          organizationId={activeOrgId}
                          authorName={memberName || "LinkedIn Member"}
                          authorPicture={memberPicture}
                          headline={headline}
                          draftToEdit={editingDraft}
                          onPostPublished={() => {
                            fetchPosts();
                            fetchConfig();
                          }}
                          onDraftSaved={fetchDrafts}
                          onPostScheduled={fetchScheduled}
                        />
                      )}

                      {activePostSection === "posts" && (
                        <div className="space-y-4">
                          <RecentPosts
                            posts={posts}
                            organizationId={activeOrgId}
                            onRefresh={() => {
                              fetchPosts();
                              fetchConfig();
                            }}
                            onOpenComposer={() => setActivePostSection("composer")}
                            onDeletePost={handleDeletePost}
                          />
                        </div>
                      )}

                      {activePostSection === "analytics" && (
                        <EngagementDashboard
                          posts={posts}
                          scheduledCount={scheduledPosts.length}
                          draftsCount={drafts.length}
                          onSyncEngagement={fetchPosts}
                        />
                      )}

                      {activePostSection === "schedule" && (
                        <ScheduleQueue
                          organizationId={activeOrgId}
                          scheduledPosts={scheduledPosts}
                          onRefresh={fetchScheduled}
                          onPostPublished={() => {
                            fetchPosts();
                            fetchScheduled();
                          }}
                        />
                      )}

                      {activePostSection === "drafts" && (
                        <DraftLibrary
                          organizationId={activeOrgId}
                          drafts={drafts}
                          onRefresh={fetchDrafts}
                          onEditDraft={(draft) => {
                            setEditingDraft(draft);
                            setActivePostSection("composer");
                          }}
                          onPostPublished={() => {
                            fetchPosts();
                            fetchDrafts();
                          }}
                        />
                      )}

                      {activePostSection === "calendar" && (
                        <ContentCalendar
                          posts={posts}
                          scheduledPosts={scheduledPosts}
                          drafts={drafts}
                        />
                      )}

                      {activePostSection === "reports" && (
                        <EnterpriseReports
                          organizationId={activeOrgId}
                          publishedCount={posts.length}
                          scheduledCount={scheduledPosts.length}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  /* Personal Connect UI */
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6 max-w-xl mx-auto my-8">
                      <div className="h-16 w-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-[#0A66C2] mx-auto shadow-xs">
                        <User className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-blue-700 tracking-wider">CRM1 App</span>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Connect Personal LinkedIn Profile</h2>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                          Sign in with OpenID Connect to synchronize your personal profile, headline, live posts, and schedule member updates.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          onClick={handleConnectOAuth}
                          className="w-full sm:w-auto px-6 py-3 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <LinkedInIcon className="h-4 w-4" /> Connect Personal Profile
                        </button>
                        <button
                          onClick={() => navigateToTab("company")}
                          className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <Building2 className="h-4 w-4 text-blue-600" /> Go to Company Page
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COMPANY PAGE (CRM3 MODE) */}
            {activeTab === "company" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {isOrgConnected ? (
                  <CompanyPageDashboard
                    organizationId={activeOrgId}
                    profile={orgProfile}
                    config={orgConfig}
                    scheduledPosts={scheduledPosts}
                    drafts={drafts}
                    onRefresh={fetchOrgConfig}
                    onRefreshDrafts={fetchDrafts}
                    onRefreshScheduled={fetchScheduled}
                    onDisconnect={handleDisconnectOrg}
                    onSwitchToPersonal={() => navigateToTab("profile")}
                  />
                ) : (
                  /* Company Connect UI */
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6 max-w-xl mx-auto my-8">
                      <div className="h-16 w-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-[#0A66C2] mx-auto shadow-xs">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-700 tracking-wider">CRM3 App</span>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Connect LinkedIn Company Page</h2>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                          Authorize your CRM3 Developer App to unlock official LinkedIn Community Management APIs for Organization posts, media attachments, and follower analytics.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          onClick={handleConnectOrgOAuth}
                          className="w-full sm:w-auto px-6 py-3 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <Building2 className="h-4 w-4" /> Connect Company Page (CRM3)
                        </button>
                        <button
                          onClick={() => navigateToTab("profile")}
                          className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <User className="h-4 w-4 text-purple-600" /> Go to Personal Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
        }}
      />
    </div>
  );
}

export default function LinkedInPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <LinkedInPageContent />
    </Suspense>
  );
}
