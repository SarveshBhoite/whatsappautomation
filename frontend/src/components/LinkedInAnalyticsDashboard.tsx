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
}

export function LinkedInAnalyticsDashboard({ stats }: LinkedInAnalyticsDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5 font-sans relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-blue-400" /> CRM LinkedIn Analytics & Performance
        </h3>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
          Success Rate: {stats.successRate}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Widget 1: Published Posts */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 p-4 rounded-2xl border border-emerald-900/40 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Published
          </span>
          <p className="text-2xl font-extrabold text-slate-100">{stats.publishedCount}</p>
          <p className="text-[10px] text-slate-400">Total Live CRM Posts</p>
        </div>

        {/* Widget 2: Scheduled Posts */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 p-4 rounded-2xl border border-indigo-900/40 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-indigo-400 uppercase flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Scheduled
          </span>
          <p className="text-2xl font-extrabold text-slate-100">{stats.scheduledCount}</p>
          <p className="text-[10px] text-slate-400">In Publishing Queue</p>
        </div>

        {/* Widget 3: Drafts */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 p-4 rounded-2xl border border-amber-900/40 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Drafts
          </span>
          <p className="text-2xl font-extrabold text-slate-100">{stats.draftsCount}</p>
          <p className="text-[10px] text-slate-400">Saved Content Library</p>
        </div>

        {/* Widget 4: AI Usage */}
        <div className="bg-gradient-to-br from-slate-900 to-purple-950/30 p-4 rounded-2xl border border-purple-900/40 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-purple-400 uppercase flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> AI Assistant
          </span>
          <p className="text-2xl font-extrabold text-slate-100">{stats.aiUsageCount}</p>
          <p className="text-[10px] text-slate-400">Generations Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <User className="h-4 w-4 text-blue-400" /> Connected Accounts
          </span>
          <span className="font-bold text-slate-100 font-mono">{stats.connectedAccounts || 1} Active</span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-red-400" /> Failed Attempts
          </span>
          <span className={`font-bold font-mono ${stats.failedCount > 0 ? "text-red-400" : "text-slate-100"}`}>
            {stats.failedCount} Posts
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Pending Approvals
          </span>
          <span className="font-bold text-slate-100 font-mono">{stats.pendingApprovalsCount || 0} Queue</span>
        </div>
      </div>
    </motion.div>
  );
}
