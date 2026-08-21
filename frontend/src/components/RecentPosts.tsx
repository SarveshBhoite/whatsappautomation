"use client";

import React from "react";
import { FileText, CheckCircle, RefreshCw } from "lucide-react";
import { MediaPreview } from "./MediaPreview";

export interface PostItem {
  id: string;
  linkedinPostId: string;
  author: string;
  summary: string;
  mediaUrl?: string | null;
  visibility?: string;
  lifecycleState?: string;
  publishedAt: string | Date;
  likesCount?: number;
  commentsCount?: number;
}

interface RecentPostsProps {
  posts: PostItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onOpenComposer?: () => void;
}

export function RecentPosts({
  posts,
  loading = false,
  onRefresh,
  onOpenComposer
}: RecentPostsProps) {
  return (
    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" /> Recent CRM-Published Posts ({posts.length})
        </h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} /> Refresh Feed
          </button>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">{post.author}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(post.publishedAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{post.summary}</p>

                {post.mediaUrl && (
                  <MediaPreview mediaUrl={post.mediaUrl} className="mt-3" />
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono border-t border-slate-850 pt-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle className="h-3 w-3" /> Saved in CRM DB
                </span>
                <span className="text-slate-500">{post.visibility || "PUBLIC"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl flex flex-col items-center gap-3 bg-slate-900/40">
          <FileText className="h-10 w-10 text-slate-600" />
          <span className="font-semibold text-slate-200 text-sm">No CRM-published posts yet.</span>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Use the LinkedIn Post Composer to publish your first post. All published posts will be saved into the CRM database and rendered in this section.
          </p>
          {onOpenComposer && (
            <button
              type="button"
              onClick={onOpenComposer}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Compose First Post
            </button>
          )}
        </div>
      )}
    </div>
  );
}
