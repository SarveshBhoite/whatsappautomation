"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  Sparkles,
  UploadCloud,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  Lock,
  Loader2,
  Trash2,
  Info,
  X,
  Database
} from "lucide-react";

interface CustomerMatchList {
  id: string;
  resourceName: string;
  name: string;
  description?: string;
  membershipStatus: string;
  membershipLifeSpan: number;
  sizeForSearch: number;
  sizeForDisplay: number;
  sizeRangeSearch: string;
  sizeRangeDisplay: string;
  matchRatePercentage?: number | null;
  uploadKeyType: string;
  dataSourceType: string;
  type: string;
}

interface CustomAudience {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  members: Array<{
    memberType: string;
    keyword?: string;
    url?: string;
    app?: string;
  }>;
}

interface GoogleAdsAudienceSectionProps {
  customerId: string;
  orgId: string;
  legacyAudiences?: any[];
}

export function GoogleAdsAudienceSection({ customerId, orgId, legacyAudiences = [] }: GoogleAdsAudienceSectionProps) {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // Subtab
  const [subTab, setSubTab] = useState<"customer-match" | "custom-audiences" | "all">("customer-match");

  // Data states
  const [customerMatchLists, setCustomerMatchLists] = useState<CustomerMatchList[]>([]);
  const [customAudiences, setCustomAudiences] = useState<CustomAudience[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateCustomModalOpen, setIsCreateCustomModalOpen] = useState(false);
  const [selectedListForUpload, setSelectedListForUpload] = useState<CustomerMatchList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create List Form
  const [listName, setListName] = useState("");
  const [listDesc, setListDesc] = useState("");
  const [membershipDays, setMembershipDays] = useState(10000);

  // Upload Form
  const [csvRawText, setCsvRawText] = useState("");
  const [uploadParsedStats, setUploadParsedStats] = useState<{
    total: number;
    validEmails: number;
    validPhones: number;
    validRows: number;
  } | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  // Create Custom Audience Form
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customType, setCustomType] = useState<"SEARCH" | "INTEREST">("INTEREST");
  const [customKeywords, setCustomKeywords] = useState("");
  const [customUrls, setCustomUrls] = useState("");

  // ── Fetch Audiences ─────────────────────────────────────────────────────────
  const fetchAudiences = useCallback(async () => {
    if (!cleanCid) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      if (subTab === "customer-match" || subTab === "all") {
        const res = await fetch(`${BACKEND}/api/ads/audiences/customer-match?customerId=${cleanCid}`, {
          headers: { "x-organization-id": orgId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCustomerMatchLists(data.items || []);
        } else {
          setErrorMsg(data.error || "Failed to load Customer Match lists");
        }
      }

      if (subTab === "custom-audiences" || subTab === "all") {
        const res2 = await fetch(`${BACKEND}/api/ads/audiences/custom?customerId=${cleanCid}`, {
          headers: { "x-organization-id": orgId }
        });
        const data2 = await res2.json();
        if (res2.ok && data2.success) {
          setCustomAudiences(data2.items || []);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error loading audiences");
    } finally {
      setLoading(false);
    }
  }, [cleanCid, orgId, subTab, BACKEND]);

  useEffect(() => {
    fetchAudiences();
  }, [fetchAudiences]);

  // ── Create Customer List ───────────────────────────────────────────────────
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) {
      alert("List name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/audiences/customer-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          name: listName.trim(),
          description: listDesc.trim(),
          membershipLifeSpanDays: membershipDays
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateListModalOpen(false);
        setListName("");
        setListDesc("");
        fetchAudiences();
      } else {
        alert(data.error || "Failed to create Customer Match list in Google Ads");
      }
    } catch (err: any) {
      alert(err.message || "Failed creating list");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Parse CSV Client-side ──────────────────────────────────────────────────
  const parseCustomerMatchCsv = (text: string) => {
    setCsvRawText(text);
    setUploadResult(null);
    if (!text.trim()) {
      setUploadParsedStats(null);
      return;
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setUploadParsedStats({ total: 0, validEmails: 0, validPhones: 0, validRows: 0 });
      return;
    }

    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const emailIdx = header.findIndex(h => h.includes("email") || h === "mail");
    const phoneIdx = header.findIndex(h => h.includes("phone") || h.includes("mobile") || h.includes("contact"));

    let emailCount = 0;
    let phoneCount = 0;
    let validRows = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
      let hasValid = false;

      if (emailIdx !== -1 && cols[emailIdx] && cols[emailIdx].includes("@")) {
        emailCount++;
        hasValid = true;
      }
      if (phoneIdx !== -1 && cols[phoneIdx] && cols[phoneIdx].replace(/\D/g, "").length >= 10) {
        phoneCount++;
        hasValid = true;
      }
      if (hasValid) validRows++;
    }

    setUploadParsedStats({
      total: lines.length - 1,
      validEmails: emailCount,
      validPhones: phoneCount,
      validRows
    });
  };

  // ── Submit Hashed Upload ───────────────────────────────────────────────────
  const handleUploadSubmit = async () => {
    if (!selectedListForUpload) {
      alert("Please select a target Customer Match list.");
      return;
    }
    if (!csvRawText.trim()) {
      alert("Please provide CSV data.");
      return;
    }

    const lines = csvRawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      alert("CSV does not contain data rows.");
      return;
    }

    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const emailIdx = header.findIndex(h => h.includes("email") || h === "mail");
    const phoneIdx = header.findIndex(h => h.includes("phone") || h.includes("mobile"));
    const fnIdx = header.findIndex(h => h.includes("first") || h === "fname");
    const lnIdx = header.findIndex(h => h.includes("last") || h === "lname");
    const countryIdx = header.findIndex(h => h.includes("country"));
    const zipIdx = header.findIndex(h => h.includes("zip") || h.includes("postal"));

    const members: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
      const record: any = {};
      if (emailIdx !== -1 && cols[emailIdx]) record.email = cols[emailIdx];
      if (phoneIdx !== -1 && cols[phoneIdx]) record.phone = cols[phoneIdx];
      if (fnIdx !== -1 && cols[fnIdx]) record.firstName = cols[fnIdx];
      if (lnIdx !== -1 && cols[lnIdx]) record.lastName = cols[lnIdx];
      if (countryIdx !== -1 && cols[countryIdx]) record.countryCode = cols[countryIdx];
      if (zipIdx !== -1 && cols[zipIdx]) record.postalCode = cols[zipIdx];

      if (record.email || record.phone || record.firstName) {
        members.push(record);
      }
    }

    if (members.length === 0) {
      alert("No valid customer identifiers detected in CSV.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/audiences/customer-match/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          userListResourceName: selectedListForUpload.resourceName,
          members
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResult(data);
        fetchAudiences();
      } else {
        alert(data.error || "Failed to upload Customer Match data to Google Ads");
      }
    } catch (err: any) {
      alert(err.message || "Failed uploading customer data");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Create Custom Audience ─────────────────────────────────────────────────
  const handleCreateCustomAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert("Audience name is required.");
      return;
    }

    const kwList = customKeywords.split(/[\n,]/).map(k => k.trim()).filter(Boolean);
    const urlList = customUrls.split(/[\n,]/).map(u => u.trim()).filter(Boolean);

    if (kwList.length === 0 && urlList.length === 0) {
      alert("Please provide at least one keyword or URL for the custom audience.");
      return;
    }

    const members: any[] = [];
    kwList.forEach(k => members.push({ type: "KEYWORD", parameter: k }));
    urlList.forEach(u => members.push({ type: "URL", parameter: u }));

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/audiences/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          name: customName.trim(),
          description: customDesc.trim() || undefined,
          type: customType,
          members
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateCustomModalOpen(false);
        setCustomName("");
        setCustomDesc("");
        setCustomKeywords("");
        setCustomUrls("");
        fetchAudiences();
      } else {
        alert(data.error || "Failed to create custom audience in Google Ads");
      }
    } catch (err: any) {
      alert(err.message || "Failed creating custom audience");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Custom Audience ─────────────────────────────────────────────────
  const handleDeleteCustomAudience = async (resourceName: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove custom audience "${name}"?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/audiences/custom`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          resourceName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAudiences();
      } else {
        alert(data.error || "Failed to delete custom audience");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting custom audience");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Users className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Google Ads Audiences &amp; Segments</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                v24 Official
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Manage first-party <strong>Customer Match</strong> data with automated in-memory SHA-256 hashing and create <strong>Custom Audiences</strong> using search intent and URL interest signals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAudiences}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              title="Refresh Audiences"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
            </button>

            {subTab === "customer-match" && (
              <>
                <button
                  onClick={() => {
                    setSelectedListForUpload(customerMatchLists[0] || null);
                    setCsvRawText("");
                    setUploadParsedStats(null);
                    setUploadResult(null);
                    setIsUploadModalOpen(true);
                  }}
                  disabled={customerMatchLists.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Customer Data</span>
                </button>

                <button
                  onClick={() => setIsCreateListModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Customer List</span>
                </button>
              </>
            )}

            {subTab === "custom-audiences" && (
              <button
                onClick={() => setIsCreateCustomModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Custom Audience</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab("customer-match")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === "customer-match"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer Match ({customerMatchLists.length})</span>
            </button>

            <button
              onClick={() => setSubTab("custom-audiences")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === "custom-audiences"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Audiences ({customAudiences.length})</span>
            </button>

            <button
              onClick={() => setSubTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>All Audiences ({legacyAudiences.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">First-Party Privacy &amp; SHA-256 Hashing Guaranteed</p>
          <p>
            Customer identifiers (emails, phone numbers, names) are normalized and hashed with SHA-256 strictly in memory according to Google Ads official specifications. No raw customer identifiers are ever stored in the database or logged to server output.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchAudiences} className="font-bold underline hover:text-rose-900 cursor-pointer">Retry</button>
        </div>
      )}

      {/* 3. Tables */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500 rounded-2xl bg-white border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
          <p className="text-xs font-bold">Querying Google Ads Audiences API...</p>
        </div>
      ) : subTab === "customer-match" ? (
        customerMatchLists.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Customer Match Lists Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Create a Customer Match list to retarget existing customers or build lookalike segments across Google Search, YouTube, and Display.
            </p>
            <button
              onClick={() => setIsCreateListModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Customer Match List</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Audience Name</th>
                    <th className="p-4">Upload Key Type</th>
                    <th className="p-4">Search Size</th>
                    <th className="p-4">Display Size</th>
                    <th className="p-4">Match Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customerMatchLists
                    .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(list => (
                      <tr key={list.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{list.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{list.description || "First-party customer list"}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {list.id}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono">
                            {list.uploadKeyType}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {list.sizeForSearch ? list.sizeForSearch.toLocaleString() : list.sizeRangeSearch.replace(/_/g, " ")}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {list.sizeForDisplay ? list.sizeForDisplay.toLocaleString() : list.sizeRangeDisplay.replace(/_/g, " ")}
                        </td>
                        <td className="p-4">
                          {list.matchRatePercentage !== null && list.matchRatePercentage !== undefined ? (
                            <span className="font-bold text-emerald-700">{list.matchRatePercentage}%</span>
                          ) : (
                            <span className="text-slate-400 text-xs">Processing...</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {list.membershipStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedListForUpload(list);
                              setCsvRawText("");
                              setUploadParsedStats(null);
                              setUploadResult(null);
                              setIsUploadModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload Data</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : subTab === "custom-audiences" ? (
        customAudiences.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Custom Audiences Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Custom audiences let you reach your ideal audience by entering relevant keywords, URLs, and apps that your prospects browse.
            </p>
            <button
              onClick={() => setIsCreateCustomModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Audience</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Audience Name</th>
                    <th className="p-4">Targeting Type</th>
                    <th className="p-4">Members (Keywords &amp; URLs)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customAudiences
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{item.description || "Custom segment"}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {item.members.slice(0, 6).map((m, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                                {m.keyword || m.url || m.app}
                              </span>
                            ))}
                            {item.members.length > 6 && (
                              <span className="text-[10px] text-slate-400 self-center">+{item.members.length - 6} more</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteCustomAudience(item.resourceName, item.name)}
                            disabled={submitting}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete Custom Audience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        // All Audiences list
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {legacyAudiences.map((aud: any) => (
            <div key={aud.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-xs">{aud.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{aud.type} · {aud.description || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{aud.sizeForSearch ? Number(aud.sizeForSearch).toLocaleString() : "—"}</p>
                <p className="text-[10px] text-slate-500">Search size</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {aud.membershipStatus || "OPEN"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE CUSTOMER MATCH LIST                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isCreateListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Create Customer Match List</h4>
                <p className="text-xs text-slate-500 mt-0.5">Google Ads API v24 (CRM_BASED)</p>
              </div>
              <button
                onClick={() => setIsCreateListModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audience List Name *</label>
                <input
                  type="text"
                  placeholder="e.g. High Value Customers 2026"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. VIP clients with over 3 completed orders"
                  value={listDesc}
                  onChange={(e) => setListDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Membership Lifespan</label>
                <select
                  value={membershipDays}
                  onChange={(e) => setMembershipDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                >
                  <option value={10000}>No Expiration (Google Ads Default)</option>
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days</option>
                  <option value={365}>365 Days</option>
                  <option value={540}>540 Days (Max)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Defines how long members remain in this audience.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateListModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create List</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: UPLOAD CUSTOMER DATA                                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Upload Customer Match Data</h4>
                <p className="text-xs text-slate-500 mt-0.5">Secure In-Memory SHA-256 Hashing</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Customer Match List *</label>
                <select
                  value={selectedListForUpload?.resourceName || ""}
                  onChange={(e) => {
                    const l = customerMatchLists.find(x => x.resourceName === e.target.value) || null;
                    setSelectedListForUpload(l);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                >
                  {customerMatchLists.map((l) => (
                    <option key={l.resourceName} value={l.resourceName}>
                      {l.name} ({l.uploadKeyType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Paste CSV or Customers Data *</label>
                  <span className="text-[10px] text-slate-400">Header required: email, phone, first_name, last_name</span>
                </div>
                <textarea
                  rows={5}
                  value={csvRawText}
                  placeholder={`email,phone,first_name,last_name\njohn@example.com,+1234567890,John,Doe\nsmith@domain.com,+919876543210,Jane,Smith`}
                  onChange={(e) => parseCustomerMatchCsv(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Validation Statistics */}
              {uploadParsedStats && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span>Parsed Summary:</span>
                    <span>{uploadParsedStats.validRows} valid of {uploadParsedStats.total} rows</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 rounded-xl bg-white border border-purple-100">
                      <span className="text-slate-400 block text-[10px]">Valid Emails</span>
                      <strong className="text-slate-900">{uploadParsedStats.validEmails}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-purple-100">
                      <span className="text-slate-400 block text-[10px]">Valid Phones</span>
                      <strong className="text-slate-900">{uploadParsedStats.validPhones}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-purple-100">
                      <span className="text-slate-400 block text-[10px]">Target Audience</span>
                      <strong className="text-purple-700 truncate block">{selectedListForUpload?.name}</strong>
                    </div>
                  </div>
                </div>
              )}

              {uploadResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Upload Submitted Successfully</span>
                  </div>
                  <p>{uploadResult.message}</p>
                  <p className="text-[11px] text-emerald-700 font-mono">Job: {uploadResult.jobResourceName}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={submitting || !uploadParsedStats || uploadParsedStats.validRows === 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Hash &amp; Upload to Google Ads</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE CUSTOM AUDIENCE                                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isCreateCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Create Custom Audience</h4>
                <p className="text-xs text-slate-500 mt-0.5">Google Ads API v24 (custom_audience)</p>
              </div>
              <button
                onClick={() => setIsCreateCustomModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomAudience} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audience Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Competitor Website Visitors &amp; Searchers"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Users interested in CRM &amp; omnichannel marketing"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audience Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomType("INTEREST")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      customType === "INTEREST"
                        ? "bg-purple-50 border-purple-500 text-purple-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    People with these interests / purchase intentions
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomType("SEARCH")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      customType === "SEARCH"
                        ? "bg-purple-50 border-purple-500 text-purple-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    People who searched for these terms on Google
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keywords (Comma or newline separated)</label>
                <textarea
                  rows={3}
                  placeholder={`crm software\nwhatsapp automation\nmarketing cloud`}
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Similar URLs / Competitors (Comma or newline separated)</label>
                <textarea
                  rows={2}
                  placeholder={`https://hubspot.com\nhttps://salesforce.com`}
                  value={customUrls}
                  onChange={(e) => setCustomUrls(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Custom Audience</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
