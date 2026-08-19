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
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 font-sans relative overflow-hidden text-slate-100"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950 text-blue-400 rounded-xl border border-blue-800">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">LinkedIn Company Page</h3>
            <p className="text-xs text-slate-400">Organization Page Management & Admin Integration</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
            isConnected
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
              : "bg-amber-950/80 text-amber-300 border-amber-800"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          {isConnected ? "Page Connected" : "Pending Community Management API"}
        </span>
      </div>

      {/* Partner API Pending Graceful Fallback Banner */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200 shadow-sm">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-100 text-xs">Awaiting LinkedIn Community Management API Approval</h4>
          <p className="text-[11px] text-amber-300/90 leading-relaxed">
            Your application request for the Community Management API (`r_organization_social`) is pending LinkedIn partner review. Once approved, Company Page posts, comments moderation, and follower analytics will automatically activate without code updates.
          </p>
        </div>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Company Name</span>
          <p className="text-slate-100 font-bold">{companyName}</p>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Industry & Category</span>
          <p className="text-slate-100 font-bold">{industry}</p>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Company ID / Vanities</span>
          <p className="text-blue-400 font-mono font-bold">{companyId || "urn:li:organization:pending"}</p>
        </div>
      </div>
    </motion.div>
  );
}
