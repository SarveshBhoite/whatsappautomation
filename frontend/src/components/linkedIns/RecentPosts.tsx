"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle,
  RefreshCw,
  Trash2,
  Loader2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { MediaPreview } from "@/components/linkedIns/MediaPreview";

export interface PostItem {
  id: string;
  linkedinPostId?: string | null;
  author?: string;
  summary: string;
  mediaUrl?: string | null;
  visibility?: string;
  lifecycleState?: string;
  likesCount?: number | null;
  commentsCount?: number | null;
  publishedAt: string | Date;
}

interface RecentPostsProps {
  posts: PostItem[];
  organizationId?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onOpenComposer?: () => void;
  onDeletePost?: (postId: string) => Promise<void> | void;
}

export function RecentPosts({
  posts,
  organizationId = "demo-org-123",
  loading = false,
  onRefresh,
  onOpenComposer,
  onDeletePost
}: RecentPostsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncingEngagement, setSyncingEngagement] = useState(false);
  const [engagementMessage, setEngagementMessage] = useState<string | null>(null);

  const handleSyncEngagement = async () => {
    setSyncingEngagement(true);
    setEngagementMessage(null);
    try {
      const res = await fetch(`/api/linkedin/posts/sync-engagement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEngagementMessage(`✅ Live likes and comments updated for ${data.updatedCount || 0} posts.`);
        if (onRefresh) onRefresh();
      } else {
        setEngagementMessage(`⚠ Sync note: ${data.error || "Failed to update engagement."}`);
      }
    } catch (err: any) {
      setEngagementMessage(`Error syncing engagement: ${err.message}`);
    } finally {
      setSyncingEngagement(false);
      setTimeout(() => setEngagementMessage(null), 5000);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This will delete the post from your live LinkedIn feed as well as from the CRM database.")) {
      return;
    }

    try {
      setDeletingId(postId);
      if (onDeletePost) {
        await onDeletePost(postId);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#0A66C2]" /> Recent CRM-Published Posts ({posts.length})
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Manual Live Engagement Sync Button */}
          {posts.length > 0 && (
            <button
              type="button"
              onClick={handleSyncEngagement}
              disabled={syncingEngagement || loading}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A66C2] border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50"
              title="Fetch real-time likes and comments from LinkedIn API"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncingEngagement ? "animate-spin" : ""}`} />
              {syncingEngagement ? "Syncing Metrics..." : "Sync Engagement"}
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} /> Refresh Feed
            </button>
          )}
        </div>
      </div>

      {/* Engagement Sync Toast Feedback */}
      {engagementMessage && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between shadow-xs">
          <span>{engagementMessage}</span>
          <button onClick={() => setEngagementMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2.5">
                {/* Author & Timestamp */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0A66C2]">{post.author || "LinkedIn Member"}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(post.publishedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                    {onDeletePost && (
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        title="Delete from LinkedIn & CRM"
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Text Body */}
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{post.summary}</p>

                {/* Attached Media Preview (Single or Multi-Attachment Grid) */}
                {post.mediaUrl && (
                  <MediaPreview mediaUrl={post.mediaUrl} className="mt-2" />
                )}
              </div>

              {/* Engagement Badges & CRM Verification */}
              <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between gap-2">
                {/* Real-time Likes & Comments Pill Badges */}
                <div className="flex items-center gap-2">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200 text-[#0A66C2] text-xs font-bold shadow-2xs"
                    title="Live Likes / Reactions"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 fill-[#0A66C2]/20" />
                    <span>{post.likesCount ?? 0}</span>
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-200 text-purple-700 text-xs font-bold shadow-2xs"
                    title="Live Comments"
                  >
                    <MessageSquare className="h-3.5 w-3.5 fill-purple-700/20" />
                    <span>{post.commentsCount ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Synced
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{post.visibility || "PUBLIC"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3 bg-slate-50/60">
          <FileText className="h-10 w-10 text-slate-400" />
          <span className="font-semibold text-slate-800 text-sm">No CRM-published posts yet.</span>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Use the LinkedIn Post Composer to publish your first post. All published posts will be saved into the CRM database and tracked here with real-time engagement metrics.
          </p>
          {onOpenComposer && (
            <button
              type="button"
              onClick={onOpenComposer}
              className="mt-2 px-4 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Compose First Post
            </button>
          )}
        </div>
      )}
    </div>
  );
}
