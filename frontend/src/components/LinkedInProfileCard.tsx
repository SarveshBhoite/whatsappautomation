"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { RefreshProfileButton } from "./RefreshProfileButton";
import { DisconnectButton } from "./DisconnectButton";

interface LinkedInProfileCardProps {
  profile?: {
    name?: string;
    email?: string;
    memberId?: string;
    headline?: string;
    picture?: string;
    locale?: string;
    createdAt?: string;
  } | null;
  config?: {
    accessToken?: string;
    memberId?: string;
    memberName?: string;
    memberEmail?: string;
    memberPicture?: string;
    headline?: string;
    tokenExpiry?: string;
    updatedAt?: string;
    createdAt?: string;
  };
  organizationId?: string;
  onRefreshSuccess?: () => void;
  onDisconnectSuccess?: () => void;
}

export function LinkedInProfileCard({
  profile,
  config = {},
  organizationId = "demo-org-123",
  onRefreshSuccess,
  onDisconnectSuccess
}: LinkedInProfileCardProps) {
  const hasToken = Boolean(config.accessToken && config.accessToken.trim().length > 10);
  const isExpired = Boolean(config.tokenExpiry && new Date() > new Date(config.tokenExpiry));

  const connectionStatus = !hasToken ? "Disconnected" : isExpired ? "Expired" : "Connected";

  const memberName = profile?.name || config.memberName || "LinkedIn Member";
  const memberEmail = profile?.email || config.memberEmail || "No email synchronized";
  const memberPicture = profile?.picture || config.memberPicture || "";
  const headline = profile?.headline || config.headline || "LinkedIn Profile";
  const memberId = profile?.memberId || config.memberId || "N/A";
  const connectedDate = config.createdAt ? new Date(config.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";
  const tokenExpiry = config.tokenExpiry ? new Date(config.tokenExpiry).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "60 Days";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-5 min-w-0">
          {memberPicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={memberPicture}
              alt={memberName}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-100 shadow-sm shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-[#0A66C2] shrink-0">
              <User className="h-10 w-10" />
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900 truncate">{memberName}</h3>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${
                  connectionStatus === "Connected"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : connectionStatus === "Expired"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    connectionStatus === "Connected"
                      ? "bg-emerald-500 animate-pulse"
                      : connectionStatus === "Expired"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                {connectionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium truncate">📧 {memberEmail}</p>
            <p className="text-xs text-slate-500 font-normal truncate">
              🆔 Member ID: <code className="font-mono text-[#0A66C2] font-bold">{memberId}</code>
            </p>
            <p className="text-xs text-slate-500 font-normal truncate">💼 {headline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
          {hasToken && (
            <>
              <RefreshProfileButton organizationId={organizationId} onSuccess={onRefreshSuccess} />
              <DisconnectButton organizationId={organizationId} onSuccess={onDisconnectSuccess} />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-200">
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Connection Date</span>
          <p className="text-slate-800 font-bold">{connectedDate}</p>
        </div>
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">OAuth Token Expiration</span>
          <p className={`font-bold ${isExpired ? "text-amber-700" : "text-slate-800"}`}>{tokenExpiry}</p>
        </div>
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-0.5">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Authorized Scopes</span>
          <p className="text-emerald-700 font-mono font-bold text-[11px]">openid profile email w_member_social</p>
        </div>
      </div>
    </motion.div>
  );
}
