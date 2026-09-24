"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Link2,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Tag,
  Info,
  Check,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface GoogleAdsDataManagerProps {
  customerId: string;
  orgId: string;
}

interface DataLinkItem {
  id: string;
  resourceName: string;
  type: string;
  status: string;
  customerId: string;
}

interface OfflineConversionActionItem {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  status: string;
  category: string;
  defaultValue: number;
  currencyCode: string;
  countingType: string;
}

interface UserDataJobItem {
  id: string;
  resourceName: string;
  type: string;
  status: string;
  failureReason: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const CONVERSION_CATEGORIES = [
  { value: "PURCHASE", label: "Purchase" },
  { value: "LEAD", label: "Lead" },
  { value: "QUALIFIED_LEAD", label: "Qualified Lead" },
  { value: "CONVERTED_LEAD", label: "Converted Lead" },
  { value: "SIGNUP", label: "Sign-up" },
  { value: "CONTACT", label: "Contact" }
];

export function GoogleAdsDataManagerSection({ customerId, orgId }: GoogleAdsDataManagerProps) {
  const [activeTab, setActiveTab] = useState<"connections" | "offline-conversions" | "user-jobs">("connections");

  // Data Links State
  const [dataLinks, setDataLinks] = useState<DataLinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState<string | null>(null);

  // Offline Conversion Actions State
  const [conversionActions, setConversionActions] = useState<OfflineConversionActionItem[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState<string | null>(null);

  // Offline User Data Jobs State
  const [userJobs, setUserJobs] = useState<UserDataJobItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Create Offline Action Modal
  const [showCreateActionModal, setShowCreateActionModal] = useState(false);
  const [actionName, setActionName] = useState("");
  const [actionCategory, setActionCategory] = useState("QUALIFIED_LEAD");
  const [actionDefaultValue, setActionDefaultValue] = useState("100.00");
  const [actionCurrency, setActionCurrency] = useState("INR");
  const [creatingAction, setCreatingAction] = useState(false);
  const [createActionError, setCreateActionError] = useState<string | null>(null);

  // Upload Offline Conversion Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadActionId, setUploadActionId] = useState("");
  const [uploadGclid, setUploadGclid] = useState("");
  const [uploadDateTime, setUploadDateTime] = useState("");
  const [uploadValue, setUploadValue] = useState("");
  const [uploadOrderId, setUploadOrderId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Toast / Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Data Links
  const fetchDataLinks = useCallback(async () => {
    if (!customerId) return;
    setLinksLoading(true);
    setLinksError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/data-manager/data-links?customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load data links");

      setDataLinks(data.items || []);
    } catch (err: any) {
      setLinksError(err.message || "Failed to retrieve data links");
    } finally {
      setLinksLoading(false);
    }
  }, [customerId, orgId]);

  // Fetch Offline Conversion Actions
  const fetchConversionActions = useCallback(async () => {
    if (!customerId) return;
    setConvLoading(true);
    setConvError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/data-manager/offline-conversions?customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load offline conversion actions");

      setConversionActions(data.items || []);
    } catch (err: any) {
      setConvError(err.message || "Failed to retrieve offline conversion actions");
    } finally {
      setConvLoading(false);
    }
  }, [customerId, orgId]);

  // Fetch User Data Jobs
  const fetchUserJobs = useCallback(async () => {
    if (!customerId) return;
    setJobsLoading(true);
    setJobsError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/data-manager/user-data-jobs?customerId=${encodeURIComponent(customerId)}`, {
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load user data jobs");

      setUserJobs(data.items || []);
    } catch (err: any) {
      setJobsError(err.message || "Failed to retrieve user data jobs");
    } finally {
      setJobsLoading(false);
    }
  }, [customerId, orgId]);

  // Load based on active subtab
  useEffect(() => {
    if (activeTab === "connections") fetchDataLinks();
    if (activeTab === "offline-conversions") fetchConversionActions();
    if (activeTab === "user-jobs") fetchUserJobs();
  }, [activeTab, fetchDataLinks, fetchConversionActions, fetchUserJobs]);

  // Handle Create Offline Conversion Action
  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionName.trim()) {
      setCreateActionError("Action name is required.");
      return;
    }

    setCreatingAction(true);
    setCreateActionError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/data-manager/offline-conversions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          name: actionName.trim(),
          category: actionCategory,
          defaultValue: actionDefaultValue ? parseFloat(actionDefaultValue) : 0,
          currencyCode: actionCurrency
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create offline conversion action");

      setToastMessage(`Offline conversion action "${actionName}" created successfully.`);
      setShowCreateActionModal(false);
      setActionName("");
      fetchConversionActions();
    } catch (err: any) {
      setCreateActionError(err.message || "Creation failed");
    } finally {
      setCreatingAction(false);
    }
  };

  // Handle Upload Conversion
  const handleUploadConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadActionId) {
      setUploadError("Please select a conversion action.");
      return;
    }
    if (!uploadGclid.trim()) {
      setUploadError("GCLID (Google Click ID) is required.");
      return;
    }
    if (!uploadDateTime.trim()) {
      setUploadError("Conversion date & time is required.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const res = await fetch(`${BACKEND}/api/ads/data-manager/upload-conversion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          conversionActionId: uploadActionId,
          gclid: uploadGclid.trim(),
          conversionDateTime: uploadDateTime.trim(),
          conversionValue: uploadValue ? parseFloat(uploadValue) : undefined,
          orderId: uploadOrderId.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload conversion");

      setToastMessage("First-party click conversion uploaded to Google Ads.");
      setShowUploadModal(false);
      setUploadGclid("");
      setUploadDateTime("");
      setUploadValue("");
      setUploadOrderId("");
    } catch (err: any) {
      setUploadError(err.message || "Conversion upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Google Ads Data Manager
              <span className="text-slate-500 font-normal">First-Party & Offline Integrations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect first-party customer touchpoints, sync CRM events, and import offline conversions into Google Ads API v24.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Customer: {customerId || "None"}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Google Ads API v24 Verified
          </span>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab("connections")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "connections"
              ? "bg-white text-blue-600 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Data Links & Sources ({dataLinks.length})
        </button>
        <button
          onClick={() => setActiveTab("offline-conversions")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "offline-conversions"
              ? "bg-white text-blue-600 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Offline Conversion Actions ({conversionActions.length})
        </button>
        <button
          onClick={() => setActiveTab("user-jobs")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "user-jobs"
              ? "bg-white text-blue-600 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          User Data Sync Jobs ({userJobs.length})
        </button>
      </div>

      {/* Action Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. DATA LINKS SUBTAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "connections" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-blue-600" />
                  Connected Data Links
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  First-party and third-party data integrations linked to your Google Ads customer via official Data Link API.
                </p>
              </div>
              <button
                onClick={fetchDataLinks}
                disabled={linksLoading}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
                title="Refresh Data Links"
              >
                <RefreshCw className={`h-4 w-4 ${linksLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>

            {linksLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-xs font-medium text-slate-500">Querying Google Ads API v24 for data_link...</p>
              </div>
            ) : dataLinks.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Database className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-slate-900 font-bold text-sm">No Active Data Links</p>
                <p className="text-slate-500 text-xs max-w-sm">
                  No automated third-party data links (e.g. BigQuery, Salesforce, GA4) are currently connected. You can manage offline conversions and direct user data syncs using the tabs above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Link ID</th>
                      <th className="p-4">Integration Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Resource Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {dataLinks.map((link, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-all">
                        <td className="p-4 font-mono font-bold text-slate-900">{link.id}</td>
                        <td className="p-4 font-semibold text-slate-800">{link.type.replace(/_/g, " ")}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {link.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-xs">{link.resourceName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. OFFLINE CONVERSIONS SUBTAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "offline-conversions" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateActionModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" /> New Offline Conversion Action
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-black transition-all shadow-xs cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" /> Upload Click Conversion
              </button>
            </div>
            <button
              onClick={fetchConversionActions}
              disabled={convLoading}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
              title="Refresh Offline Conversions"
            >
              <RefreshCw className={`h-4 w-4 ${convLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            {convLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-xs font-medium text-slate-500">Loading offline conversion actions...</p>
              </div>
            ) : conversionActions.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <UploadCloud className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-slate-900 font-bold text-sm">No Offline Conversion Actions Found</p>
                <p className="text-slate-500 text-xs max-w-sm">
                  Create an upload conversion action to track qualified offline leads, phone orders, or store transactions attributed to your Google Ads clicks.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Action Name</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Default Value</th>
                      <th className="p-4">Action ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {conversionActions.map((action, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-all">
                        <td className="p-4 font-bold text-slate-900">{action.name}</td>
                        <td className="p-4 font-mono text-[11px] text-slate-600">{action.type}</td>
                        <td className="p-4 font-semibold text-slate-800">{action.category}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {action.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {action.currencyCode} {action.defaultValue.toFixed(2)}
                        </td>
                        <td className="p-4 font-mono text-slate-500 text-[11px]">{action.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. USER DATA SYNC JOBS SUBTAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "user-jobs" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  First-Party User Data Jobs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitors asynchronous background customer match and enhanced conversion user data synchronization jobs.
                </p>
              </div>
              <button
                onClick={fetchUserJobs}
                disabled={jobsLoading}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
                title="Refresh User Data Jobs"
              >
                <RefreshCw className={`h-4 w-4 ${jobsLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>

            {jobsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-xs font-medium text-slate-500">Querying offline_user_data_job...</p>
              </div>
            ) : userJobs.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-slate-900 font-bold text-sm">No Active User Data Jobs</p>
                <p className="text-slate-500 text-xs max-w-sm">
                  Customer match audience uploads and enhanced conversion streams execute background user data jobs when invoked.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Job ID</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Failure Reason</th>
                      <th className="p-4">Resource</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {userJobs.map((job, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-all">
                        <td className="p-4 font-mono font-bold text-slate-900">{job.id}</td>
                        <td className="p-4 font-semibold text-slate-800">{job.type.replace(/_/g, " ")}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            job.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : job.status === "FAILED"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{job.failureReason}</td>
                        <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-xs">{job.resourceName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE OFFLINE CONVERSION ACTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCreateActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                New Offline Conversion Action
              </h3>
              <button
                onClick={() => setShowCreateActionModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="p-6 space-y-4">
              {createActionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {createActionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Action Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Qualified CRM Lead - Deal Closed"
                  value={actionName}
                  onChange={(e) => setActionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {CONVERSION_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={actionCurrency}
                    onChange={(e) => setActionCurrency(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={actionDefaultValue}
                  onChange={(e) => setActionDefaultValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateActionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAction}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingAction ? "Creating..." : "Save Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: UPLOAD CLICK CONVERSION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-blue-600" />
                Upload Offline Click Conversion
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadConversion} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Offline Conversion Action *
                </label>
                <select
                  value={uploadActionId}
                  onChange={(e) => setUploadActionId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Conversion Action...</option>
                  {conversionActions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (ID: {a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Click ID (GCLID) *</label>
                <input
                  type="text"
                  placeholder="e.g. Cj0KCQjwmOm3BhDhARIs..."
                  value={uploadGclid}
                  onChange={(e) => setUploadGclid(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Conversion Date & Time * (Format: YYYY-MM-DD HH:MM:SS+|-HH:MM)
                </label>
                <input
                  type="text"
                  placeholder="2026-09-24 12:30:00+05:30"
                  value={uploadDateTime}
                  onChange={(e) => setUploadDateTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Value (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="250.00"
                    value={uploadValue}
                    onChange={(e) => setUploadValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="INV-98214"
                    value={uploadOrderId}
                    onChange={(e) => setUploadOrderId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Conversion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
