"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, CheckCircle2, Clock, FileText, AlertCircle, TrendingUp, Sparkles, User, ShieldCheck } from "lucide-react";

interface LinkedInAnalyticsDashboardProps {
  stats: {
    connectedAccounts?: number;
    publishedCount: number;
    scheduledCount: number;
    draftsCount: number;
    failedCount: number;
    successRate: number;
    aiUsageCount: number;
    pendingApprovalsCount?: number;
  };
  onSelectTab?: (tab: "overview" | "posts" | "profile" | "activity" | "settings", section?: "published" | "scheduled" | "drafts" | "ai") => void;
}

export function LinkedInAnalyticsDashboard({ stats, onSelectTab }: LinkedInAnalyticsDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 font-sans relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-[#0A66C2]" /> CRM LinkedIn Analytics & Performance
        </h3>
        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
          Success Rate: {stats.successRate}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Widget 1: Published Posts */}
        <div
          onClick={() => onSelectTab && onSelectTab("posts", "published")}
          className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          title="Click to view history of Published Posts"
        >
          <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Published</span>
            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 font-bold">View ↗</span>
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{stats.publishedCount}</p>
          <p className="text-[10px] text-slate-500 font-medium">Total Live CRM Posts</p>
        </div>

        {/* Widget 2: Scheduled Posts */}
        <div
          onClick={() => onSelectTab && onSelectTab("posts", "scheduled")}
          className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 shadow-xs space-y-1 cursor-pointer hover:border-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          title="Click to view Scheduled Posts Queue"
        >
          <span className="text-[11px] font-bold text-[#0A66C2] uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Scheduled</span>
            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 font-bold">View ↗</span>
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{stats.scheduledCount}</p>
          <p className="text-[10px] text-slate-500 font-medium">Upcoming Queue</p>
        </div>

        {/* Widget 3: Drafts */}
        <div
          onClick={() => onSelectTab && onSelectTab("posts", "drafts")}
          className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1 cursor-pointer hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          title="Click to view Saved Drafts"
        >
          <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Drafts</span>
            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 font-bold">Open ↗</span>
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{stats.draftsCount}</p>
          <p className="text-[10px] text-slate-500 font-medium">In-Progress Content</p>
        </div>

        {/* Widget 4: AI Usage Count */}
        <div
          onClick={() => onSelectTab && onSelectTab("posts", "ai")}
          className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 shadow-xs space-y-1 cursor-pointer hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          title="Click to launch AI Assistant"
        >
          <span className="text-[11px] font-bold text-purple-700 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> AI Requests</span>
            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 font-bold">Open ↗</span>
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{stats.aiUsageCount}</p>
          <p className="text-[10px] text-slate-500 font-medium">Generations Completed</p>
        </div>
      </div>
    </motion.div>
  );
}
