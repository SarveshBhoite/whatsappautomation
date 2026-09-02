"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Unplug,
  Send,
  MessageSquare,
  Users,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText as DocIcon,
  FileText,
  Trash2,
  Share2,
  Calendar,
  Globe,
  Sparkles,
  ArrowRight,
  Eye,
  Clock,
  LayoutDashboard,
  SlidersHorizontal
} from "lucide-react";
import { MediaPreview, detectMediaType } from "@/components/linkedIns/MediaPreview";
import { PostComposer } from "@/components/linkedIns/PostComposer";
import { EngagementDashboard } from "@/components/linkedIns/EngagementDashboard";
import { ScheduleQueue } from "@/components/linkedIns/ScheduleQueue";
import { DraftLibrary, DraftItem } from "@/components/linkedIns/DraftLibrary";
import { ContentCalendar } from "@/components/linkedIns/ContentCalendar";
import { EnterpriseReports } from "@/components/linkedIns/EnterpriseReports";

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

export interface CompanyProfile {
  companyId?: string;
  companyName?: string;
  vanityName?: string;
  companyLogo?: string;
  website?: string;
  industry?: string;
  description?: string;
  followersCount?: number;
  organicFollowers?: number;
  paidFollowers?: number;
  staffCountRange?: string;
}

export interface CompanyPost {
  id: string;
  postId?: string;
  linkedinPostId?: string;
  author?: string;
  companyName?: string;
  summary?: string;
  commentary?: string;
  mediaUrl?: string | null;
  mediaType?: string;
  publishedAt?: string | Date;
  likesCount?: number;
  commentsCount?: number;
}

interface CompanyPageDashboardProps {
  organizationId?: string;
  profile?: CompanyProfile | null;
  config?: any;
  scheduledPosts?: any[];
  drafts?: any[];
  onRefresh?: () => void;
  onRefreshDrafts?: () => void;
  onRefreshScheduled?: () => void;
  onDisconnect?: () => void;
  onSwitchToPersonal?: () => void;
}

export function CompanyPageDashboard({
  organizationId = "demo-org-123",
  profile,
  config,
  scheduledPosts = [],
  drafts = [],
  onRefresh,
  onRefreshDrafts,
  onRefreshScheduled,
  onDisconnect,
  onSwitchToPersonal
}: CompanyPageDashboardProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [activeSection, setActiveSection] = useState<
    "overview" | "composer" | "posts" | "analytics" | "schedule" | "drafts" | "calendar" | "reports"
  >("overview");
  const [editingDraft, setEditingDraft] = useState<DraftItem | null>(null);
  const [posts, setPosts] = useState<CompanyPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postText, setPostText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Comments state
  const [selectedPostForComments, setSelectedPostForComments] = useState<CompanyPost | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentReply, setCommentReply] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Analytics metrics
  const [pageAnalytics, setPageAnalytics] = useState<{ views?: number; uniqueViews?: number; clicks?: number } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(false);

  const companyName = profile?.companyName || config?.companyName || "";
  const companyId = profile?.companyId || config?.companyId || "";
  const vanityName = profile?.vanityName || config?.vanityName || "";
  const companyLogo = profile?.companyLogo || config?.companyLogo || "";
  const website = profile?.website || config?.website || "";
  const industry = profile?.industry || config?.industry || "";
  const description = profile?.description || config?.description || "";
  const followersCount = profile?.followersCount ?? config?.followersCount;

  // Fetch company posts
  const fetchOrgPosts = async () => {
    try {
      setLoadingPosts(true);
      console.log(`[CRM3] Fetching organization posts from ${API_BASE_URL}/api/linkedin/org/posts`);
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/posts`, {
        headers: { "x-organization-id": organizationId }
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`[CRM3] Posts response:`, data);
        if (Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      }
    } catch (err) {
      console.error("[LINKEDIN ORG] Failed to fetch company posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch page analytics
  const fetchPageAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(false);
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/analytics/page`, {
        headers: { "x-organization-id": organizationId }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setPageAnalytics(data.stats);
        } else {
          setPageAnalytics({ views: 0, uniqueViews: 0, clicks: 0 });
        }
      } else {
        setAnalyticsError(true);
      }
    } catch (err) {
      console.warn("[LINKEDIN ORG] Page analytics fetch notice:", err);
      setAnalyticsError(true);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgPosts();
    fetchPageAnalytics();
  }, [organizationId]);

  // Handle media file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingMedia(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/upload`, {
        method: "POST",
        headers: { "x-organization-id": organizationId },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.file?.url) {
        setMediaUrl(data.file.url);
        setStatusMessage({ type: "success", text: "✅ Media uploaded to ImageKit Cloud CDN!" });
      } else {
        setStatusMessage({ type: "error", text: data.message || "Media upload failed." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Upload error: ${err.message}` });
    } finally {
      setUploadingMedia(false);
    }
  };

  // Handle publishing post as Company Page
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) {
      setStatusMessage({ type: "error", text: "Post commentary text is required." });
      return;
    }

    setPublishing(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({
          text: postText.trim(),
          mediaUrl: mediaUrl || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "✅ Company Post published successfully to LinkedIn Page!" });
        setPostText("");
        setMediaUrl("");
        fetchOrgPosts();
      } else {
        setStatusMessage({ type: "error", text: data.error || data.details || "Failed to publish post." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Publish error: ${err.message}` });
    } finally {
      setPublishing(false);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this Company Page post?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/posts/${encodeURIComponent(postId)}`, {
        method: "DELETE",
        headers: { "x-organization-id": organizationId }
      });
      if (res.ok) {
        setStatusMessage({ type: "success", text: "✅ Post deleted from LinkedIn Page & CRM." });
        fetchOrgPosts();
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Delete error: ${err.message}` });
    }
  };

  // Fetch comments for post
  const handleOpenComments = async (post: CompanyPost) => {
    setSelectedPostForComments(post);
    setLoadingComments(true);
    try {
      const postUrn = post.linkedinPostId || post.id;
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/comments/${encodeURIComponent(postUrn)}`, {
        headers: { "x-organization-id": organizationId }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("[LINKEDIN ORG] Error loading comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit comment reply
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentReply.trim() || !selectedPostForComments) return;

    setSubmittingComment(true);
    try {
      const postUrn = selectedPostForComments.linkedinPostId || selectedPostForComments.id;
      const res = await fetch(`${API_BASE_URL}/api/linkedin/org/comments/${encodeURIComponent(postUrn)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({ message: commentReply.trim() })
      });
      if (res.ok) {
        setCommentReply("");
        handleOpenComments(selectedPostForComments);
      }
    } catch (err: any) {
      alert(`Error posting comment: ${err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentUrn: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    if (!selectedPostForComments) return;

    try {
      const postUrn = selectedPostForComments.linkedinPostId || selectedPostForComments.id;
      const res = await fetch(
        `${API_BASE_URL}/api/linkedin/org/comments/${encodeURIComponent(postUrn)}/${encodeURIComponent(commentUrn)}`,
        {
          method: "DELETE",
          headers: { "x-organization-id": organizationId }
        }
      );
      if (res.ok) {
        handleOpenComments(selectedPostForComments);
      }
    } catch (err: any) {
      alert(`Error deleting comment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Banner & Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0A66C2] overflow-hidden shrink-0 shadow-xs">
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{companyName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                  Verified Page
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap font-medium">
                {industry && <span>{industry}</span>}
                {companyId && <span>• Organization ID: <code className="text-slate-700">{companyId}</code></span>}
                {website && (
                  <>
                    <span>•</span>
                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                      <Globe className="h-3 w-3" /> Website <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onSwitchToPersonal && (
              <button
                type="button"
                onClick={onSwitchToPersonal}
                className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A66C2] border border-blue-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <span>Go to Personal Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer transition-all shadow-xs"
                title="Refresh Company Profile"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}

            {onDisconnect && (
              <button
                type="button"
                onClick={onDisconnect}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <Unplug className="h-4 w-4" /> Disconnect Page
              </button>
            )}
          </div>
        </div>

        {/* 2. Key Metrics Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#0A66C2]" /> Total Followers
            </span>
            <p className="text-2xl font-black text-slate-900">
              {followersCount !== undefined && followersCount !== null ? followersCount.toLocaleString() : "—"}
            </p>
            <p className="text-[10px] text-slate-400">Official Page Follower Count</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-600" /> Page Views
            </span>
            <p className="text-2xl font-black text-slate-900">
              {analyticsLoading ? (
                "..."
              ) : analyticsError ? (
                <span className="text-sm font-semibold text-slate-400">Unavailable</span>
              ) : pageAnalytics && typeof pageAnalytics.views === "number" ? (
                pageAnalytics.views.toLocaleString()
              ) : (
                "—"
              )}
            </p>
            <p className="text-[10px] text-slate-400">Total Page Impressions</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-600" /> Unique Visitors
            </span>
            <p className="text-2xl font-black text-slate-900">
              {analyticsLoading ? (
                "..."
              ) : analyticsError ? (
                <span className="text-sm font-semibold text-slate-400">Unavailable</span>
              ) : pageAnalytics && typeof pageAnalytics.uniqueViews === "number" ? (
                pageAnalytics.uniqueViews.toLocaleString()
              ) : (
                "—"
              )}
            </p>
            <p className="text-[10px] text-slate-400">Unique Page Visitors</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-purple-600" /> Company Posts
            </span>
            <p className="text-2xl font-black text-slate-900">{posts.length}</p>
            <p className="text-[10px] text-slate-400">Active Live Posts</p>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs Bar for Company Page */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 shadow-2xs">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "composer", label: "Company Composer", icon: Sparkles },
          { id: "posts", label: "Company Posts & Feed", icon: FileText, count: posts.length },
          { id: "analytics", label: "Engagement & Analytics", icon: TrendingUp },
          { id: "schedule", label: "Schedule Queue", icon: Calendar, count: scheduledPosts.length },
          { id: "drafts", label: "Draft Library", icon: SlidersHorizontal, count: drafts.length },
          { id: "calendar", label: "Content Calendar", icon: Calendar },
          { id: "reports", label: "Reports & Exports", icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
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

      {/* Sub-Section 1: OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* Quick Publish Composer Card */}
          <form onSubmit={handlePublishPost} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0A66C2]" /> Quick Organization Update
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Publishing as {companyName || "Company"}</span>
            </div>

            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={`Share what's happening at ${companyName || "your company"} with your followers...`}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0A66C2] focus:bg-white transition-all resize-none"
            />

            {mediaUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/5 shrink-0 flex items-center justify-center">
                  <MediaPreview url={mediaUrl} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-slate-800 truncate">{mediaUrl}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{detectMediaType(mediaUrl)} attachment</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMediaUrl("")}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                  <span>{uploadingMedia ? "Uploading..." : "Attach Media"}</span>
                  <input
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploadingMedia}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setActiveSection("composer")}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1"
                >
                  <span>Advanced Composer</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <button
                type="submit"
                disabled={publishing || !postText.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{publishing ? "Publishing..." : "Publish Post"}</span>
              </button>
            </div>
          </form>

          {/* Company Posts Feed Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Recent Company Posts & Moderation</h3>
                <p className="text-xs text-slate-500">Live posts published to your organization feed</p>
              </div>
              <button
                type="button"
                onClick={fetchOrgPosts}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPosts ? "animate-spin" : ""}`} /> Refresh Feed
              </button>
            </div>

            {loadingPosts ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading company posts...</div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">No posts published on Company Page yet.</p>
                <p className="text-xs text-slate-400">Use the composer above to publish your first organization update.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.slice(0, 3).map((post) => (
                  <div
                    key={post.id || post.postId}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0A66C2] overflow-hidden shrink-0">
                          {companyLogo ? (
                            <img src={companyLogo} alt={post.companyName || post.author || companyName || "Company"} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{post.companyName || post.author || companyName || "Company Page"}</h4>
                          <p className="text-[10px] text-slate-400">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id || post.postId || "")}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                        title="Delete Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {post.commentary || post.summary}
                    </p>

                    {post.mediaUrl && (
                      <div className="rounded-xl overflow-hidden max-h-80 bg-black/5">
                        <MediaPreview url={post.mediaUrl} />
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <span>👍 {post.likesCount || 0} Reactions</span>
                        <span>💬 {post.commentsCount || 0} Comments</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenComments(post)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-blue-600" /> Moderate Comments
                      </button>
                    </div>
                  </div>
                ))}

                {posts.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection("posts")}
                    className="w-full py-2 text-center text-xs font-bold text-[#0A66C2] hover:underline"
                  >
                    View all {posts.length} Company Posts →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Section 2: ADVANCED COMPOSER */}
      {activeSection === "composer" && (
        <PostComposer
          organizationId={organizationId}
          authorName={companyName || "LinkedIn Company Page"}
          authorPicture={companyLogo}
          headline={industry || "Company Organization"}
          publishEndpoint="/api/linkedin/org/share"
          scheduleEndpoint="/api/linkedin/schedule"
          draftEndpoint="/api/linkedin/draft"
          draftToEdit={editingDraft}
          onPostPublished={() => {
            fetchOrgPosts();
            if (onRefresh) onRefresh();
            setActiveSection("posts");
          }}
          onDraftSaved={() => {
            if (onRefreshDrafts) onRefreshDrafts();
          }}
          onPostScheduled={() => {
            if (onRefreshScheduled) onRefreshScheduled();
          }}
        />
      )}

      {/* Sub-Section 3: COMPANY POSTS FEED & MODERATION */}
      {activeSection === "posts" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Organization Posts Feed</h3>
              <p className="text-xs text-slate-500">Manage and moderate all updates published to your company feed</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSection("composer")}
                className="px-3.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" /> Create Post
              </button>
              <button
                type="button"
                onClick={fetchOrgPosts}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPosts ? "animate-spin" : ""}`} /> Refresh Feed
              </button>
            </div>
          </div>

          {loadingPosts ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading company posts...</div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No posts published on Company Page yet.</p>
              <p className="text-xs text-slate-400">Use the composer to publish your first organization update.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id || post.postId}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0A66C2] overflow-hidden shrink-0">
                        {companyLogo ? (
                          <img src={companyLogo} alt={post.companyName || post.author || companyName || "Company"} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{post.companyName || post.author || companyName || "Company Page"}</h4>
                        <p className="text-[10px] text-slate-400">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id || post.postId || "")}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {post.commentary || post.summary}
                  </p>

                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden max-h-80 bg-black/5">
                      <MediaPreview url={post.mediaUrl} />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span>👍 {post.likesCount || 0} Reactions</span>
                      <span>💬 {post.commentsCount || 0} Comments</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenComments(post)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-blue-600" /> Moderate Comments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Section 4: ENGAGEMENT & ANALYTICS */}
      {activeSection === "analytics" && (
        <EngagementDashboard
          posts={posts.map(p => ({
            id: p.id,
            linkedinPostId: p.postId || p.linkedinPostId || p.id,
            author: p.author || p.companyName || companyName || "Company Page",
            summary: p.summary || p.commentary || "",
            mediaUrl: p.mediaUrl || undefined,
            publishedAt: typeof p.publishedAt === "string" ? p.publishedAt : p.publishedAt ? new Date(p.publishedAt).toISOString() : new Date().toISOString(),
            likesCount: p.likesCount || 0,
            commentsCount: p.commentsCount || 0
          }))}
          scheduledCount={scheduledPosts.length}
          draftsCount={drafts.length}
          onSyncEngagement={fetchOrgPosts}
        />
      )}

      {/* Sub-Section 5: SCHEDULE QUEUE */}
      {activeSection === "schedule" && (
        <ScheduleQueue
          organizationId={organizationId}
          scheduledPosts={scheduledPosts}
          onRefresh={onRefreshScheduled}
          onPostPublished={() => {
            fetchOrgPosts();
            if (onRefreshScheduled) onRefreshScheduled();
          }}
        />
      )}

      {/* Sub-Section 6: DRAFT LIBRARY */}
      {activeSection === "drafts" && (
        <DraftLibrary
          organizationId={organizationId}
          drafts={drafts}
          onRefresh={onRefreshDrafts}
          onEditDraft={(draft) => {
            setEditingDraft(draft);
            setActiveSection("composer");
          }}
          onPostPublished={() => {
            fetchOrgPosts();
            if (onRefreshDrafts) onRefreshDrafts();
          }}
        />
      )}

      {/* Sub-Section 7: CONTENT CALENDAR */}
      {activeSection === "calendar" && (
        <ContentCalendar
          posts={posts.map(p => ({
            id: p.id,
            linkedinPostId: p.postId || p.linkedinPostId || p.id,
            author: p.author || p.companyName || companyName || "Company Page",
            summary: p.summary || p.commentary || "",
            mediaUrl: p.mediaUrl || undefined,
            publishedAt: typeof p.publishedAt === "string" ? p.publishedAt : p.publishedAt ? new Date(p.publishedAt).toISOString() : new Date().toISOString(),
            likesCount: p.likesCount || 0,
            commentsCount: p.commentsCount || 0
          }))}
          scheduledPosts={scheduledPosts}
          drafts={drafts}
        />
      )}

      {/* Sub-Section 8: ENTERPRISE REPORTS */}
      {activeSection === "reports" && (
        <EnterpriseReports
          organizationId={organizationId}
          publishedCount={posts.length}
          scheduledCount={scheduledPosts.length}
        />
      )}

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs ${statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
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
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 5. Moderate Comments Modal Drawer */}
      {selectedPostForComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Comments Moderation</h3>
                <p className="text-[11px] text-slate-500">Read & Reply as {companyName}</p>
              </div>
              <button
                onClick={() => setSelectedPostForComments(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingComments ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading live comments...</div>
              ) : comments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No comments found on this post yet.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id || c.commentUrn} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{c.actorName || "LinkedIn Member"}</span>
                      <button
                        onClick={() => handleDeleteComment(c.commentUrn || c.id)}
                        className="text-slate-400 hover:text-red-600 text-xs"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-700">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
              <input
                type="text"
                value={commentReply}
                onChange={(e) => setCommentReply(e.target.value)}
                placeholder={`Reply to post as ${companyName}...`}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0A66C2]"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentReply.trim()}
                className="px-4 py-2 bg-[#0A66C2] text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" /> Reply
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
