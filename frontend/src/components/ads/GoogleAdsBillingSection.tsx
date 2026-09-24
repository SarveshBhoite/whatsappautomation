"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Receipt,
  FileText,
  DollarSign,
  TrendingDown,
  Info,
  Calendar,
  Lock,
  AlertTriangle
} from "lucide-react";

interface GoogleAdsBillingSectionProps {
  customerId: string;
  orgId: string;
}

interface BillingSetupInfo {
  id: string;
  resourceName: string;
  status: string;
  paymentsAccountId?: string;
  paymentsAccountName?: string;
  paymentsProfileId?: string;
  secondaryPaymentsProfileId?: string;
  paymentsAccountResource?: string;
  startDateTime?: string;
  endDateTime?: string;
}

interface CustomerBillingOverview {
  customerId: string;
  customerName: string;
  currencyCode: string;
  timeZone: string;
  billingStatus: string;
  activeBillingSetup: BillingSetupInfo | null;
  billingSetups: BillingSetupInfo[];
  apiLimitations: {
    invoicesNotice: string;
    transactionsNotice: string;
    paymentInstrumentsNotice: string;
  };
}

interface SpendHistoryItem {
  date: string;
  cost: string;
  clicks: number;
  impressions: number;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function GoogleAdsBillingSection({ customerId, orgId }: GoogleAdsBillingSectionProps) {
  const [overview, setOverview] = useState<CustomerBillingOverview | null>(null);
  const [spendHistory, setSpendHistory] = useState<SpendHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, spendRes] = await Promise.all([
        fetch(`${BACKEND}/api/ads/billing/overview?customerId=${encodeURIComponent(customerId)}`, {
          headers: { "x-organization-id": orgId }
        }),
        fetch(`${BACKEND}/api/ads/billing/spend-history?customerId=${encodeURIComponent(customerId)}&limit=30`, {
          headers: { "x-organization-id": orgId }
        })
      ]);

      const overviewData = await overviewRes.json();
      if (!overviewRes.ok) throw new Error(overviewData.error || "Failed to load billing overview");

      setOverview(overviewData.billing || null);

      if (spendRes.ok) {
        const spendData = await spendRes.json();
        setSpendHistory(spendData.items || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve billing information");
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved & Active",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          icon: CheckCircle
        };
      case "PENDING":
        return {
          label: "Pending Verification",
          color: "text-blue-700 bg-blue-50 border-blue-200",
          icon: Clock
        };
      case "APPROVED_HELD":
        return {
          label: "Approved (Held)",
          color: "text-amber-700 bg-amber-50 border-amber-200",
          icon: AlertTriangle
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          color: "text-slate-600 bg-slate-100 border-slate-200",
          icon: AlertCircle
        };
      default:
        return {
          label: status || "No Billing Setup",
          color: "text-rose-700 bg-rose-50 border-rose-200",
          icon: AlertCircle
        };
    }
  };

  const statusConfig = getStatusBadge(overview?.billingStatus || "MISSING");
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Google Ads Billing & Payments
              <span className="text-slate-500 font-normal">Customer Account Health</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified billing setup, linked Google Payments profile, and daily spend statement ledger via Google Ads API v24.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://payments.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <span>Google Payments Center</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
          <button
            onClick={fetchBillingData}
            disabled={loading}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
            title="Refresh Billing Status"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <p className="font-bold">Error loading billing data</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !overview ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Querying Google Ads API v24 for billing_setup & account status...</p>
        </div>
      ) : (
        <>
          {/* Status & Account Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Setup Status */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <p className="text-xs font-semibold text-slate-500">Billing Setup Status</p>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {overview?.billingStatus === "APPROVED"
                  ? "Campaign delivery is eligible without payment blockers."
                  : "Campaigns cannot deliver until billing is approved."}
              </p>
            </div>

            {/* 2. Payments Account Name */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <p className="text-xs font-semibold text-slate-500">Payments Account</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {overview?.activeBillingSetup?.paymentsAccountName || overview?.customerName || "—"}
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                ID: {overview?.activeBillingSetup?.paymentsAccountId || "Not Configured"}
              </p>
            </div>

            {/* 3. Payments Profile */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <p className="text-xs font-semibold text-slate-500">Payments Profile</p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {overview?.activeBillingSetup?.paymentsProfileId || "—"}
              </p>
              <p className="text-[11px] text-slate-400">Google Payments Center Entity</p>
            </div>

            {/* 4. Account Currency & Timezone */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <p className="text-xs font-semibold text-slate-500">Currency & Timezone</p>
              <p className="text-sm font-bold text-slate-900">
                {overview?.currencyCode || "INR"}
              </p>
              <p className="text-[11px] text-slate-500">{overview?.timeZone || "Asia/Calcutta"}</p>
            </div>
          </div>

          {/* Detailed Verified Setup Resource */}
          {overview?.activeBillingSetup && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Active Billing Setup Details (billing_setup)
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Resource: {overview.activeBillingSetup.resourceName}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Setup ID</span>
                  <span className="font-mono font-bold text-slate-900">{overview.activeBillingSetup.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Start Date & Time</span>
                  <span className="font-medium text-slate-800">{overview.activeBillingSetup.startDateTime || "Immediate"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Payments Account ID</span>
                  <span className="font-mono font-bold text-slate-900">{overview.activeBillingSetup.paymentsAccountId || "—"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Payments Profile ID</span>
                  <span className="font-mono font-bold text-slate-900">{overview.activeBillingSetup.paymentsProfileId || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Daily Advertising Spend (Spend History) */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  Recent Advertising Spend Statement (Last 30 Days)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily advertising debit ledger reported by Google Ads API v24 reporting engine.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                Account Currency: {overview?.currencyCode || "INR"}
              </span>
            </div>

            {spendHistory.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2 text-center px-8 bg-slate-50/50">
                <p className="text-slate-900 font-bold text-xs">No advertising spend recorded in the last 30 days</p>
                <p className="text-slate-500 text-[11px] max-w-xs">
                  Once your campaigns start serving impressions and clicks, daily spend debits will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Daily Spend</th>
                      <th className="p-4">Clicks</th>
                      <th className="p-4">Impressions</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {spendHistory.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-all">
                        <td className="p-4 font-mono font-medium text-slate-900 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {s.date}
                        </td>
                        <td className="p-4 font-bold text-emerald-700">
                          {overview?.currencyCode || "INR"} {s.cost}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{s.clicks.toLocaleString()}</td>
                        <td className="p-4 font-semibold text-slate-800">{s.impressions.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            Billed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transparent Google Ads API Limitations & Security Notice */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-slate-500" />
              Google Ads API v24 Billing & PCI-DSS Compliance Architecture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                  Payment Instrument Numbers
                </p>
                <p className="text-[11px] text-slate-500">
                  {overview?.apiLimitations?.paymentInstrumentsNotice || "Credit card details and CVVs are strictly non-queryable via Google Ads API under PCI-DSS compliance."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  Tax Invoices & Downloads
                </p>
                <p className="text-[11px] text-slate-500">
                  {overview?.apiLimitations?.invoicesNotice || "Monthly invoicing endpoints apply only to accounts with approved Google credit lines. Credit card accounts download invoices via Google Payments Center."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Receipt className="h-3.5 w-3.5 text-blue-600" />
                  Itemized Banking Statements
                </p>
                <p className="text-[11px] text-slate-500">
                  {overview?.apiLimitations?.transactionsNotice || "Detailed banking transaction receipts and VAT invoices are managed securely at payments.google.com."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
