"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ShieldCheck,
  CreditCard,
  Tag,
  Target,
  Users,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Globe,
  Building2,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Key,
  Wrench,
  ArrowRight
} from "lucide-react";

export interface AccountHealthData {
  overallStatus: "READY" | "WARNING" | "BLOCKED" | "UNKNOWN";
  summary: {
    readyCount: number;
    warningCount: number;
    blockedCount: number;
  };
  checks: {
    key: string;
    name?: string;
    status: "READY" | "WARNING" | "BLOCKED" | "UNKNOWN" | "PASS" | "FAIL";
    classification: string;
    message: string;
    details?: any;
  }[];
  checkedAt: string;
}

interface AccountHealthSectionProps {
  customerId: string;
  orgId: string;
  primaryWebsite?: string | null;
  onNavigateToBusinessProfile?: () => void;
  userRole?: string;
}

export function GoogleAdsAccountHealthSection({
  customerId,
  orgId,
  primaryWebsite,
  onNavigateToBusinessProfile,
  userRole = "ADMIN"
}: AccountHealthSectionProps) {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<AccountHealthData | null>(null);

  // Modal / drawer state for "View Required Action"
  const [selectedActionItem, setSelectedActionItem] = useState<{
    title: string;
    status: string;
    userExplanation: string;
    actionLabel?: string;
    actionType?: "verify_tag" | "complete_billing" | "profile" | "goals" | "support";
  } | null>(null);

  // Admin collapsible diagnostic toggle
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Website Tag Verification state
  const [verifyingTag, setVerifyingTag] = useState(false);
  const [tagVerifyResult, setTagVerifyResult] = useState<{
    status: string;
    detectionMethod: string;
    message: string;
  } | null>(null);

  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  const fetchHealth = useCallback(async (isManualRefresh = false) => {
    if (!cleanCid) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${BACKEND}/api/ads/account-readiness?orgId=${encodeURIComponent(
          orgId
        )}&customerId=${encodeURIComponent(cleanCid)}`
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status} failed to load account health`);
      }
      const data = await res.json();
      const healthData = data.readiness || data;
      setHealth(healthData);
    } catch (err: any) {
      setError(err.message || "Failed to load account health");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [BACKEND, orgId, cleanCid]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleVerifyWebsiteTag = async () => {
    if (!cleanCid) return;
    setVerifyingTag(true);
    setTagVerifyResult(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/verify-website-tag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({ customerId: cleanCid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tag verification failed");
      setTagVerifyResult({
        status: data.status,
        detectionMethod: data.detectionMethod,
        message: data.message
      });
      fetchHealth(true);
    } catch (err: any) {
      setTagVerifyResult({
        status: "ERROR",
        detectionMethod: "FETCH_ERROR",
        message: err.message || "Could not verify website tag"
      });
    } finally {
      setVerifyingTag(false);
    }
  };

  const checksList = Array.isArray(health?.checks) ? health.checks : [];

  // Match checks by key (supporting both canonical and snake_case keys)
  const findCheck = (keys: string[]) => {
    return checksList.find((c) => keys.includes(c.key?.toUpperCase()));
  };

  const oauthCheck = findCheck(["OAUTH_CONNECTION", "OAUTH"]);
  const devTokenCheck = findCheck(["DEVELOPER_TOKEN"]);
  const statusCheck = findCheck(["CUSTOMER_STATUS", "ACCOUNT_STATUS"]);
  const mccCheck = findCheck(["MCC_ALIGNMENT", "MCC"]);
  const billingCheck = findCheck(["BILLING_SETUP", "BILLING"]);
  const tagAccountCheck = findCheck(["GOOGLE_TAG_ACCOUNT", "ACCOUNT_GOOGLE_TAG", "GOOGLE_TAG"]);
  const tagWebsiteCheck = findCheck(["GOOGLE_TAG_WEBSITE", "WEBSITE_TAG"]);
  const goalsCheck = findCheck(["CONVERSION_GOALS"]);
  const userAccessCheck = findCheck(["USER_ACCESS"]);
  const ga4Check = findCheck(["GA4_INTEGRATION", "GA4_LINKAGE", "GA4"]);
  const profileCheck = findCheck(["CRM_BUSINESS_PROFILE", "BUSINESS_PROFILE"]);

  // 1. Google Ads Account status
  const isAccountActive =
    (statusCheck?.status === "READY" || statusCheck?.status === "PASS") &&
    (oauthCheck?.status === "READY" || oauthCheck?.status === "PASS" || !oauthCheck);
  const accountClientStatus: "Connected ✓" | "Action Required ⚠" | "Checking" = loading
    ? "Checking"
    : isAccountActive
    ? "Connected ✓"
    : "Action Required ⚠";

  // 2. Billing Status
  const isBillingApproved =
    billingCheck?.status === "READY" ||
    billingCheck?.status === "PASS" ||
    billingCheck?.details?.status === "APPROVED";
  const isBillingPending =
    billingCheck?.status === "WARNING" &&
    (billingCheck?.details?.status === "PENDING" || billingCheck?.details?.status === "APPROVED_HELD");
  const isBillingMissing =
    billingCheck?.status === "BLOCKED" ||
    billingCheck?.status === "FAIL" ||
    billingCheck?.details?.status === "MISSING";

  const billingClientStatus: "Ready ✓" | "Action Required ⚠" | "Checking / Unable to Verify" = loading
    ? "Checking / Unable to Verify"
    : isBillingApproved
    ? "Ready ✓"
    : isBillingPending || isBillingMissing
    ? "Action Required ⚠"
    : "Checking / Unable to Verify";

  // 3. Conversion Tracking
  const hasConversionTracking =
    goalsCheck?.status === "READY" ||
    goalsCheck?.status === "PASS" ||
    (goalsCheck?.details?.biddableCount ?? 0) > 0 ||
    (goalsCheck?.details?.biddableGoalsCount ?? 0) > 0;
  const conversionTrackingClientStatus: "Ready ✓" | "Action Required ⚠" | "Not Configured" = loading
    ? "Not Configured"
    : hasConversionTracking
    ? "Ready ✓"
    : goalsCheck?.status === "WARNING"
    ? "Action Required ⚠"
    : "Not Configured";

  // 4. Google Tag
  const isTagVerified = tagWebsiteCheck?.status === "READY" || tagWebsiteCheck?.status === "PASS";
  const isTagNotDetected = tagWebsiteCheck?.status === "WARNING";
  const googleTagClientStatus: "Verified ✓" | "Not Detected ⚠" | "Action Required ⚠" | "Not Checked" = loading
    ? "Not Checked"
    : isTagVerified
    ? "Verified ✓"
    : isTagNotDetected
    ? "Not Detected ⚠"
    : tagAccountCheck?.details?.googleTagId
    ? "Action Required ⚠"
    : "Not Checked";

  // 5. Campaign Readiness
  const isCampaignBlocked = health?.overallStatus === "BLOCKED";
  const isCampaignWarning = health?.overallStatus === "WARNING";
  const campaignReadinessStatus: "Ready to create campaigns ✓" | "Action Required ⚠" | "Campaign creation blocked 🛑" = loading
    ? "Ready to create campaigns ✓"
    : isCampaignBlocked
    ? "Campaign creation blocked 🛑"
    : isCampaignWarning
    ? "Action Required ⚠"
    : "Ready to create campaigns ✓";

  // 6. Business Profile
  const isProfileComplete = profileCheck?.status === "READY" || profileCheck?.status === "PASS";
  const businessProfileStatus: "Complete ✓" | "Incomplete ⚠" = isProfileComplete
    ? "Complete ✓"
    : "Incomplete ⚠";

  // 7. Optional GA4 status
  const isGa4Linked = ga4Check?.status === "READY" || ga4Check?.status === "PASS";
  const ga4ClientStatus: "Connected ✓" | "Not Connected" | "Unable to Verify" = loading
    ? "Unable to Verify"
    : isGa4Linked
    ? "Connected ✓"
    : "Not Connected";

  // Hard blocker determination message
  const getPrimaryActionForBlocked = () => {
    if (isBillingMissing) {
      return {
        title: "Billing Setup Required",
        status: "Action Required",
        userExplanation:
          "Your Google Ads billing setup needs to be completed before campaigns can be published. Add a payment method directly in your Google Ads account.",
        actionLabel: "Open Google Ads Billing",
        actionType: "complete_billing" as const
      };
    }
    if (statusCheck?.status === "FAIL" || statusCheck?.status === "BLOCKED") {
      return {
        title: "Google Ads Account Suspended",
        status: "Action Required",
        userExplanation:
          "Your Google Ads account is currently marked as suspended or closed by Google. Please check your Google Ads account dashboard to resolve any policy holds.",
        actionLabel: "Contact Google Support",
        actionType: "support" as const
      };
    }
    if (oauthCheck?.status === "FAIL" || oauthCheck?.status === "BLOCKED") {
      return {
        title: "Google Account Re-Authentication Needed",
        status: "Action Required",
        userExplanation:
          "Your Google Account authorization has expired or was revoked. Reconnect your Google account to restore campaign management.",
        actionLabel: "Reconnect Google Account",
        actionType: "support" as const
      };
    }
    return {
      title: "Account Setup Required",
      status: "Action Required",
      userExplanation:
        "Your Google Ads account requires attention before campaigns can be published. Verify your account connection and billing setup.",
      actionLabel: "Review Setup",
      actionType: "support" as const
    };
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
      {/* Header bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Google Ads Account Readiness
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                  health?.overallStatus === "READY"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : health?.overallStatus === "BLOCKED"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {health?.overallStatus === "READY"
                  ? "● Account Ready"
                  : health?.overallStatus === "BLOCKED"
                  ? "● Action Required"
                  : "● Setup in Progress"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of your Google Ads account, billing, and conversion tracking readiness
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchHealth(true)}
            disabled={loading || refreshing}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh Account Health"
          >
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{refreshing ? "Refreshing..." : "Refresh Health"}</span>
          </button>
        </div>
      </div>

      {/* Main Client-Facing Body */}
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center space-y-2.5">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Checking Google Ads account status…</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Unable to check account status</p>
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* 7 Clean Client-Facing Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Google Ads Account */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" /> Google Ads Account
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        accountClientStatus.includes("✓")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {accountClientStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isAccountActive
                      ? "Account is active and authorized for ad delivery."
                      : "Account status requires attention."}
                  </p>
                </div>
                <div className="pt-3 text-[11px] font-mono text-slate-400">
                  ID: {cleanCid}
                </div>
              </div>

              {/* Card 2: Billing */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Billing
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        billingClientStatus.includes("✓")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : billingClientStatus.includes("⚠")
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {billingClientStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isBillingApproved
                      ? "Payment profile approved for campaigns."
                      : isBillingPending
                      ? "Payment profile activation is in progress."
                      : "Add payment method before publishing ads."}
                  </p>
                </div>
                {!isBillingApproved && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedActionItem({
                        title: "Billing Setup",
                        status: "Action Required",
                        userExplanation:
                          "Your Google Ads billing setup needs to be completed before campaigns can be published. Please add or verify your payment profile in Google Ads.",
                        actionLabel: "Open Google Ads Billing",
                        actionType: "complete_billing"
                      })
                    }
                    className="pt-2 text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  >
                    View Required Action <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Card 3: Conversion Tracking */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-purple-600" /> Conversion Tracking
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        conversionTrackingClientStatus.includes("✓")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {conversionTrackingClientStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {hasConversionTracking
                      ? "Smart Bidding goals are active and optimizing."
                      : "Configure lead or sales goals for Smart Bidding."}
                  </p>
                </div>
                {!hasConversionTracking && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedActionItem({
                        title: "Conversion Goals Setup",
                        status: "Action Required",
                        userExplanation:
                          "No active biddable conversion goals were found. To get optimal results with Smart Bidding, set up at least one primary conversion goal (like Leads or Purchases).",
                        actionLabel: "Configure Conversion Goals",
                        actionType: "goals"
                      })
                    }
                    className="pt-2 text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  >
                    View Required Action <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Card 4: Google Tag */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" /> Google Tag
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        googleTagClientStatus.includes("✓")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {googleTagClientStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isTagVerified
                      ? "Google Tag verified on your website."
                      : "Verify tag installation on your landing page."}
                  </p>
                </div>
                {!isTagVerified && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedActionItem({
                        title: "Website Google Tag",
                        status: "Action Required",
                        userExplanation:
                          "We could not verify your website's Google Tag. Make sure the Google Tag (AW-...) is present on your website header or configured via Google Tag Manager, then verify again.",
                        actionLabel: "Verify Website Tag",
                        actionType: "verify_tag"
                      })
                    }
                    className="pt-2 text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  >
                    View Required Action <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Card 5: Campaign Readiness */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Campaign Readiness
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        campaignReadinessStatus.includes("✓")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : campaignReadinessStatus.includes("🛑")
                          ? "bg-rose-100 text-rose-800 border border-rose-200 font-bold"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {campaignReadinessStatus.includes("✓")
                        ? "Ready ✓"
                        : campaignReadinessStatus.includes("🛑")
                        ? "Blocked 🛑"
                        : "Action Required ⚠"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {campaignReadinessStatus.includes("✓")
                      ? "Account is cleared to publish Google Ads campaigns."
                      : campaignReadinessStatus.includes("🛑")
                      ? "A critical account issue is preventing publishing."
                      : "Campaigns can be created, but recommendations exist."}
                  </p>
                </div>
                {isCampaignBlocked && (
                  <button
                    type="button"
                    onClick={() => setSelectedActionItem(getPrimaryActionForBlocked())}
                    className="pt-2 text-xs text-rose-600 font-bold hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  >
                    View Required Action <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Card 6: Business Profile */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> Business Profile
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        businessProfileStatus.includes("✓")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {businessProfileStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isProfileComplete
                      ? "Products, services, and location profile are complete."
                      : "Complete your profile to generate high-performing AI ad copy."}
                  </p>
                </div>
                {!isProfileComplete && onNavigateToBusinessProfile && (
                  <button
                    type="button"
                    onClick={onNavigateToBusinessProfile}
                    className="pt-2 text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  >
                    Complete Profile <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Card 7: Optional GA4 Status */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-amber-600" /> Google Analytics 4
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ga4ClientStatus.includes("✓")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {ga4ClientStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isGa4Linked
                      ? "GA4 conversions imported into Google Ads."
                      : "Optional: Link GA4 for cross-platform visitor insights."}
                  </p>
                </div>
                <div className="pt-3 text-[10px] text-slate-400 font-medium">
                  Informational (Non-blocking)
                </div>
              </div>
            </div>

            {/* Quick Website Tag Verification Bar */}
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">
                      Website Google Tag Verification
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isTagVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isTagVerified ? "Verified on Website" : "Not Verified"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Website: <strong className="font-mono text-slate-700">{primaryWebsite || "Not configured"}</strong>
                  </p>
                  {tagVerifyResult && (
                    <p
                      className={`text-[11px] font-semibold mt-1 ${
                        tagVerifyResult.status === "VERIFIED" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {tagVerifyResult.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyWebsiteTag}
                disabled={verifyingTag || !primaryWebsite}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {verifyingTag ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{verifyingTag ? "Scanning..." : "Verify Website Tag"}</span>
              </button>
            </div>

            {/* Action Dialog / Explanatory Card */}
            {selectedActionItem && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-amber-900">{selectedActionItem.title}</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                    {selectedActionItem.userExplanation}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedActionItem.actionType === "verify_tag" && (
                    <button
                      type="button"
                      onClick={handleVerifyWebsiteTag}
                      disabled={verifyingTag}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Verify Now
                    </button>
                  )}
                  {selectedActionItem.actionType === "complete_billing" && (
                    <a
                      href="https://ads.google.com/aw/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Google Billing</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedActionItem(null)}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Collapsible Admin / Developer Diagnostics */}
            {(userRole === "ADMIN" || userRole === "OWNER" || userRole === "DEVELOPER") && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDiagnostics((prev) => !prev)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>Technical Diagnostics (Internal / Developer View)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {checksList.length} Checks
                    </span>
                  </span>
                  {showDiagnostics ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showDiagnostics && (
                  <div className="mt-3 space-y-2 animate-fadeIn">
                    <p className="text-[11px] text-slate-400 pb-1">
                      Raw Google Ads API audit items, classifications, and system diagnostics for workspace administrators.
                    </p>
                    <div className="space-y-2">
                      {checksList.map((check) => {
                        const isPass = check.status === "READY" || check.status === "PASS";
                        const isFail = check.status === "BLOCKED" || check.status === "FAIL";
                        return (
                          <div
                            key={check.key}
                            className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                              isPass
                                ? "bg-white border-slate-200"
                                : isFail
                                ? "bg-rose-50/40 border-rose-200"
                                : "bg-amber-50/40 border-amber-200"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-slate-900">
                                  {check.name || check.key}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {check.classification}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                                {check.message}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isPass
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isFail
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {check.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
