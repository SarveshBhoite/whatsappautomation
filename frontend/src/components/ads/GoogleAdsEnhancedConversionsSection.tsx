"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  ExternalLink,
  Layers,
  Lock,
  RefreshCw,
  Loader2,
  Info,
  Server,
  FileCode2,
  Sliders,
  Check
} from "lucide-react";

interface GoogleAdsEnhancedConversionsSectionProps {
  customerId: string;
  orgId: string;
}

export function GoogleAdsEnhancedConversionsSection({
  customerId,
  orgId
}: GoogleAdsEnhancedConversionsSectionProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"googleTag" | "enhancedConversions" | "gtm">("googleTag");
  const [selectedSnippetAction, setSelectedSnippetAction] = useState<any>(null);

  const fetchMeasurementOverview = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ads/measurement/overview?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(customerId)}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load Google Ads measurement data");
      }
      setData(json);
      if (json.conversionActions?.length > 0) {
        setSelectedSnippetAction(json.conversionActions[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch measurement overview");
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId]);

  useEffect(() => {
    fetchMeasurementOverview();
  }, [fetchMeasurementOverview]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-slate-700 font-bold text-sm">Loading Measurement &amp; Google Tag Settings...</p>
        <p className="text-slate-400 text-xs mt-1">Retrieving official configuration from Google Ads API v24</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-rose-900 text-sm">Unable to Load Google Ads Measurement</h3>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <button
              onClick={fetchMeasurementOverview}
              className="mt-3 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const googleTag = data?.googleTag || {};
  const enhanced = data?.enhancedConversions || {};
  const gtm = data?.googleTagManager || {};
  const conversionActions = data?.conversionActions || [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Measurement &amp; Tag Integration
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Google Ads API v24
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Google Tag (gtag.js), Enhanced Conversions first-party data framework, and GTM container integration
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchMeasurementOverview}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6">
        <button
          onClick={() => setActiveSubTab("googleTag")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "googleTag"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Google Tag (gtag.js)
        </button>
        <button
          onClick={() => setActiveSubTab("enhancedConversions")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "enhancedConversions"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Enhanced Conversions
        </button>
        <button
          onClick={() => setActiveSubTab("gtm")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "gtm"
              ? "border-purple-600 text-purple-700 bg-purple-50/40"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Google Tag Manager (GTM)
        </button>
      </div>

      {/* Tab 1: Google Tag */}
      {activeSubTab === "googleTag" && (
        <div className="p-6 space-y-6">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Official Tag ID</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-black text-slate-900 font-mono">
                  {googleTag.googleTagId || "Not Configured"}
                </span>
                {googleTag.googleTagId && (
                  <button
                    onClick={() => copyToClipboard(googleTag.googleTagId, "gtag")}
                    className="p-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 transition-all cursor-pointer shadow-2xs"
                    title="Copy Tag ID"
                  >
                    {copiedId === "gtag" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-blue-800/80 mt-1">
                Conversion Tracking ID: {googleTag.conversionTrackingId || "N/A"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Tracking Status</span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {googleTag.conversionTrackingStatus || "ACTIVE"}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-1">
                Customer: {data?.customer?.descriptiveName || data?.customer?.id}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Data Terms</span>
              <div className="flex items-center gap-2 mt-1">
                {googleTag.acceptedCustomerDataTerms ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Accepted ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    Pending / Self-Managed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Required for enhanced customer data matching
              </p>
            </div>
          </div>

          {/* Tag Installation Snippet */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">Global Site Tag (gtag.js) Implementation Code</span>
              </div>
              {googleTag.googleTagId && (
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${googleTag.googleTagId}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', '${googleTag.googleTagId}');\n</script>`,
                      "snippet"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === "snippet" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "snippet" ? "Copied!" : "Copy Code"}
                </button>
              )}
            </div>

            <pre className="mt-3 text-[11px] font-mono text-blue-200/90 overflow-x-auto p-2 bg-slate-950/60 rounded-xl leading-relaxed">
{googleTag.googleTagId
  ? `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${googleTag.googleTagId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${googleTag.googleTagId}');
</script>`
  : `<!-- Create a conversion action or connect your Google Tag ID in Google Ads to view official snippet -->`}
            </pre>
          </div>

          {/* Conversion Actions with Tag Snippets */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Connected Conversion Actions ({conversionActions.length})
            </h3>
            {conversionActions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No conversion actions found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {conversionActions.map((action: any) => (
                  <div
                    key={action.id}
                    onClick={() => setSelectedSnippetAction(action)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedSnippetAction?.id === action.id
                        ? "border-blue-500 bg-blue-50/20 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{action.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        {action.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span>Category: {action.category}</span>
                      <span>·</span>
                      <span>Origin: {action.origin}</span>
                    </div>
                    {action.hasTagSnippets && (
                      <span className="inline-block mt-2 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Event Snippet Available
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Enhanced Conversions */}
      {activeSubTab === "enhancedConversions" && (
        <div className="p-6 space-y-6">
          {/* Overview Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Enhanced Conversions (First-Party User-Provided Data)
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Enhanced Conversions improve the accuracy of your conversion measurement by supplementing conversion tags
                  with hashed, privacy-safe customer data (email addresses, phone numbers, and addresses) sent directly to Google.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Technical Standard Rule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Security &amp; Privacy Protections</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li><strong className="text-slate-800">Hashing:</strong> All user PII is normalized and hashed with SHA-256 before transmission.</li>
                <li><strong className="text-slate-800">Zero Raw Storage:</strong> Jisnu CRM strictly never persists or logs unhashed email/phone data.</li>
                <li><strong className="text-slate-800">Direct Google Matching:</strong> Only one-way hashed identifiers are matched against Google sign-in sessions.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Supported User Identifiers</span>
              </div>
              <div className="space-y-1.5">
                {(enhanced.supportedIdentifiers || []).map((idStr: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{idStr}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account Guidelines & Limitations Notice */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Google Ads API v24 Configuration Notice</p>
                <p className="text-amber-800 leading-relaxed">
                  Enabling Enhanced Conversions at the account level requires accepting Google&apos;s Customer Data Terms
                  in Google Ads under <em>Tools &amp; Settings &gt; Measurement &gt; Conversions &gt; Settings</em>.
                  Once accepted, conversion events can include user-provided data via Google Tag, GTM, or Data Manager / Conversion Adjustments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Google Tag Manager */}
      {activeSubTab === "gtm" && (
        <div className="p-6 space-y-6">
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200">
            <div className="flex items-start gap-3">
              <Layers className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-purple-950">
                  Google Tag Manager Container Integration
                </h3>
                <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                  {gtm.gtmContainerIntegration?.explanation ||
                    "Google Ads API v24 provides conversion tracking configurations, while GTM container triggers, tags, and variables are managed directly in Google Tag Manager Console."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={gtm.gtmContainerIntegration?.gtmConsoleUrl || "https://tagmanager.google.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  Open Google Tag Manager Console
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Manage GTM Web and Server containers, tags, and Enhanced Conversion variables.
                </p>
              </div>
            </a>

            <a
              href={gtm.gtmContainerIntegration?.tagAssistantUrl || "https://tagassistant.google.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  Launch Google Tag Assistant
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Test and debug live conversion tracking tags and dataLayer variables on your website.
                </p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
