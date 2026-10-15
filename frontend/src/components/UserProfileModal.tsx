"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building,
  Mail,
  Shield,
  Calendar,
  CreditCard,
  LogOut,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface SubscriptionData {
  planCode?: string;
  planName?: string;
  billingCycle?: string;
  durationMonths?: number;
  amountPaid?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  featuresIncluded?: string[];
  extraChannels?: number;
}

interface OrgStatusResponse {
  organizationId: string;
  organizationName: string;
  status: string;
  enabledModules: string[];
  subscription?: SubscriptionData | null;
}

export default function UserProfileModal({ isOpen, onClose, onLogout }: UserProfileModalProps) {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin User");
  const [userRole, setUserRole] = useState("client_admin");
  const [orgId, setOrgId] = useState("");
  const [orgData, setOrgData] = useState<OrgStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    const storedName = localStorage.getItem("user_name") || "Admin User";
    const storedRole = localStorage.getItem("user_role") || "client_admin";
    const storedOrgId = localStorage.getItem("organization_id") || "";

    setUserName(storedName);
    setUserRole(storedRole);
    setOrgId(storedOrgId);

    if (storedOrgId) {
      fetchSubscriptionStatus(storedOrgId);
    }
  }, [isOpen]);

  const fetchSubscriptionStatus = async (organizationId: string) => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/subscription/status`, {
        headers: {
          "x-organization-id": organizationId,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setOrgData(data);
        }
      }
    } catch (e) {
      console.error("Error fetching subscription profile:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const sub = orgData?.subscription;
  const isExpired = sub?.endDate ? new Date(sub.endDate).getTime() < Date.now() : false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-deep text-white font-black text-sm flex items-center justify-center shadow-xs">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {userName}
                </h3>
                <Badge variant="outline" className="text-[10px] font-extrabold text-brand-blue border-sky-300 bg-sky-50 uppercase">
                  {userRole.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {orgData?.organizationName || "Jisnu Workspace"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          
          {/* 1. Subscription & Plan Details */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-sky-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Active Subscription Plan
              </span>
              <Badge className={isExpired ? "bg-rose-500/80 text-white" : "bg-emerald-500/80 text-white text-[10px]"}>
                {sub?.status || (orgData ? "ACTIVE" : "FREE TRIAL")}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <h4 className="text-xl font-black tracking-tight text-white">
                  {sub?.planName || "Complete Omnichannel Suite"}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Duration: {sub?.durationMonths ? `${sub.durationMonths} Months Access` : "12-Month Plan"}
                  {sub?.extraChannels ? ` • ${sub.extraChannels} Extra Channel(s)` : ""}
                </p>
              </div>
              {sub?.amountPaid && (
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-300">Paid: </span>
                  <span className="text-base font-black text-sky-300">
                    ₹{sub.amountPaid.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Date timeline */}
            <div className="pt-2 border-t border-slate-700/80 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Date</span>
                <span>{sub?.startDate ? new Date(sub.startDate).toLocaleDateString() : "Active"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                <span className={isExpired ? "text-rose-400 font-bold" : "text-emerald-300 font-bold"}>
                  {sub?.endDate ? new Date(sub.endDate).toLocaleDateString() : "Annual Renewal"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Want to renew or change tiers?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/pricing");
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <span>Upgrade / Renew Plan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 2. Organization & Accounting Profile */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              Workspace &amp; Accounting Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Organization ID</span>
                <span className="font-mono text-slate-700 select-all font-semibold break-all">
                  {orgId || "Default Workspace"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Billing Currency</span>
                <span className="font-semibold text-slate-800">INR (₹) • 18% GST Compliant</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Payment Method</span>
                <span className="font-semibold text-slate-800">Razorpay Direct Gateway</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Multi-Tenant Isolation</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Dedicated Row-Level Isolation
                </span>
              </div>
            </div>
          </div>

          {/* 3. Unlocked Services & CRM Modules */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Active Workspace Services (12+ Modules)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: "WhatsApp Cloud API", active: true },
                { label: "Google Ads Suite", active: true },
                { label: "Meta Ads Manager", active: true },
                { label: "Google Business (GMB)", active: true },
                { label: "Chatbot Flow Builder", active: true },
                { label: "24/7 AI Agent Studio", active: true },
                { label: "Instagram DMs & Comments", active: true },
                { label: "Gmail Auto-Replies", active: true },
                { label: "YouTube Sentiment Sync", active: true },
                { label: "Google Calendar Booking", active: true },
                { label: "LinkedIn Automation", active: true },
                { label: "Unified Multi-Agent Inbox", active: true },
              ].map((service, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2 shadow-2xs"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate text-[11px]">
                    {service.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-600 font-bold"
          >
            Close
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-1.5 shadow-sm bg-rose-600 hover:bg-rose-700 font-bold text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of Workspace</span>
          </Button>
        </div>

      </div>
    </div>
  );
}
