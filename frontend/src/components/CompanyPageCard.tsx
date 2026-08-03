"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, ShieldAlert, CheckCircle2, Lock, ExternalLink, RefreshCw, MessageSquare, Users } from "lucide-react";

interface CompanyPageCardProps {
  companyName?: string;
  companyId?: string;
  companyLogo?: string;
  website?: string;
  industry?: string;
  description?: string;
  isConnected?: boolean;
}

export function CompanyPageCard({
  companyName = "Your Company Page",
  companyId = "",
  companyLogo = "",
  website = "",
  industry = "Software & IT Services",
  description = "Official LinkedIn Company Page",
  isConnected = false
}: CompanyPageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 font-sans relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#0A66C2] rounded-xl border border-blue-100">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">LinkedIn Company Page</h3>
            <p className="text-xs text-slate-500">Organization Page Management & Admin Integration</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
            isConnected
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          {isConnected ? "Page Connected" : "Pending Community Management API"}
        </span>
      </div>

      {/* Partner API Pending Graceful Fallback Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 shadow-sm">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-950 text-xs">Awaiting LinkedIn Community Management API Approval</h4>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Your application request for the Community Management API (`r_organization_social`) is pending LinkedIn partner review. Once approved, Company Page posts, comments moderation, and follower analytics will automatically activate without code updates.
          </p>
        </div>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Company Name</span>
          <p className="text-slate-900 font-bold">{companyName}</p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Organization ID</span>
          <p className="text-slate-900 font-mono font-bold">{companyId || "Pending Verification"}</p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Official Industry</span>
          <p className="text-slate-900 font-bold">{industry}</p>
        </div>
      </div>
    </motion.div>
  );
}
