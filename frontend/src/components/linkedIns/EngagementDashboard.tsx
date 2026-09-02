"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Share2,
  Calendar,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Clock,
  Layers
} from "lucide-react";
import { PostItem } from "./RecentPosts";

interface EngagementDashboardProps {
  posts: PostItem[];
  scheduledCount?: number;
  draftsCount?: number;
  onSyncEngagement?: () => void;
  syncingEngagement?: boolean;
}

export function EngagementDashboard({
  posts = [],
  scheduledCount = 0,
  draftsCount = 0,
  onSyncEngagement,
  syncingEngagement = false
}: EngagementDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d">("all");

  // Filter posts by time range
  const now = new Date();
  const filteredPosts = posts.filter((post) => {
    if (timeFilter === "all") return true;
    const postDate = new Date(post.publishedAt);
    const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 3600 * 24);
    if (timeFilter === "7d") return diffDays <= 7;
    if (timeFilter === "30d") return diffDays <= 30;
    return true;
  });

  // Calculate Engagement Metrics
  const totalPosts = filteredPosts.length;
  const totalLikes = filteredPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
  const totalComments = filteredPosts.reduce((acc, p) => acc + (p.commentsCount || 0), 0);
  const totalEngagements = totalLikes + totalComments;
  const avgEngagementPerPost = totalPosts > 0 ? (totalEngagements / totalPosts).toFixed(1) : "0";
  const avgLikesPerPost = totalPosts > 0 ? (totalLikes / totalPosts).toFixed(1) : "0";
  const avgCommentsPerPost = totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : "0";

  // Top Performing Post
  const topPost = [...filteredPosts].sort((a, b) => {
    const engA = (a.likesCount || 0) + (a.commentsCount || 0);
    const engB = (b.likesCount || 0) + (b.commentsCount || 0);
    return engB - engA;
  })[0];

  // Group by day for simple Trend Visualization (last 7 or 14 items)
  const recentTrendPosts = [...filteredPosts]
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    .slice(-7);

  const maxPostEngagement = Math.max(...recentTrendPosts.map((p) => (p.likesCount || 0) + (p.commentsCount || 0)), 5);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* 1. Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0A66C2]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">LinkedIn Post Engagement & Performance</h2>
              <p className="text-xs text-slate-500">
                Track live reactions, comment interactions, and audience response across your published content.
              </p>
            </div>
          </div>
        </div>

        {/* Time Filters & Sync Action */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${timeFilter === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter("30d")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${timeFilter === "30d" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeFilter("7d")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${timeFilter === "7d" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Last 7 Days
            </button>
          </div>

          {onSyncEngagement && (
            <button
              onClick={onSyncEngagement}
              disabled={syncingEngagement}
              className="px-3.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <TrendingUp className={`h-3.5 w-3.5 ${syncingEngagement ? "animate-spin" : ""}`} />
              {syncingEngagement ? "Syncing..." : "Sync Live Engagement"}
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interactions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Interactions</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#0A66C2]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalEngagements}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Avg. <strong>{avgEngagementPerPost}</strong> engagements per post
          </p>
        </div>

        {/* Total Likes & Reactions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reactions / Likes</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <ThumbsUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalLikes}</span>
            <span className="text-xs font-semibold text-slate-500">reactions</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Avg. <strong>{avgLikesPerPost}</strong> likes per published post
          </p>
        </div>

        {/* Total Comments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Comments & Replies</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalComments}</span>
            <span className="text-xs font-semibold text-slate-500">comments</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Avg. <strong>{avgCommentsPerPost}</strong> comments per published post
          </p>
        </div>

        {/* Published Posts Content Ratio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Published Content</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalPosts}</span>
            <span className="text-xs font-semibold text-slate-500">posts live</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {scheduledCount} queued • {draftsCount} saved drafts
          </p>
        </div>
      </div>

      {/* 3. Visual Engagement Trend Bar Chart & Top Post Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0A66C2]" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Post-by-Post Engagement Trend
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {recentTrendPosts.length} Most Recent Posts
            </span>
          </div>

          {recentTrendPosts.length > 0 ? (
            <div className="space-y-4 pt-2">
              {/* Bar Visualizer */}
              <div className="h-44 flex items-end gap-3 sm:gap-6 justify-between px-2 pt-4">
                {recentTrendPosts.map((p, idx) => {
                  const postLikes = p.likesCount || 0;
                  const postComments = p.commentsCount || 0;
                  const total = postLikes + postComments;
                  const heightPercent = Math.max(Math.round((total / maxPostEngagement) * 100), 12);

                  return (
                    <div key={p.id || idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {total} ({postLikes}L/{postComments}C)
                      </div>

                      {/* Stacked Bar */}
                      <div className="w-full max-w-[48px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end transition-all group-hover:scale-105" style={{ height: `${heightPercent}%` }}>
                        {/* Comments segment */}
                        <div
                          className="bg-purple-500 w-full"
                          style={{
                            height: total > 0 ? `${(postComments / total) * 100}%` : "0%"
                          }}
                        />
                        {/* Likes segment */}
                        <div
                          className="bg-[#0A66C2] w-full"
                          style={{
                            height: total > 0 ? `${(postLikes / total) * 100}%` : "100%"
                          }}
                        />
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[60px] text-center">
                        {new Date(p.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-[#0A66C2]" />
                  <span>Likes & Reactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-purple-500" />
                  <span>Comments</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <BarChart3 className="h-8 w-8 text-slate-400" />
              <span>No published posts available to generate trend chart.</span>
            </div>
          )}
        </div>

        {/* Top Performing Post Spotlight */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Top Performing Post
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                👑 #1 Rated
              </span>
            </div>

            {topPost ? (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#0A66C2]">{topPost.author || "LinkedIn Member"}</span>
                  <span className="font-mono text-slate-500">
                    {new Date(topPost.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-800 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {topPost.summary}
                </p>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0A66C2] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      <ThumbsUp className="h-3 w-3" /> {topPost.likesCount || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      <MessageSquare className="h-3 w-3" /> {topPost.commentsCount || 0}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">
                    {(topPost.likesCount || 0) + (topPost.commentsCount || 0)} Total
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Publish posts to discover top performing content.
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0A66C2] animate-ping" />
            <span>Engagement metrics sync live from official LinkedIn REST Social APIs.</span>
          </div>
        </div>
      </div>

      {/* 4. Post-by-Post Detailed Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#0A66C2]" /> Post-Wise Performance Breakdown ({filteredPosts.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Sorted by latest publication</span>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase font-bold bg-slate-50/60">
                  <th className="py-3 px-3">Post Content</th>
                  <th className="py-3 px-3">Published Date</th>
                  <th className="py-3 px-3 text-center">Likes</th>
                  <th className="py-3 px-3 text-center">Comments</th>
                  <th className="py-3 px-3 text-center">Total Engagement</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map((post) => {
                  const lCount = post.likesCount || 0;
                  const cCount = post.commentsCount || 0;
                  const total = lCount + cCount;

                  return (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 max-w-sm">
                        <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>
                        {post.mediaUrl && (
                          <span className="text-[10px] text-purple-700 font-semibold mt-0.5 inline-block">
                            📎 Media Attachment
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#0A66C2]">
                        <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          👍 {lCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-purple-700">
                        <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          💬 {cCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-slate-900 font-mono">
                        {total}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Synced
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No posts published in this timeframe.
          </div>
        )}
      </div>
    </div>
  );
}
