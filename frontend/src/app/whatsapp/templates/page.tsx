"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Send,
  Globe,
  ExternalLink,
  ShieldCheck,
  Check,
  Upload
} from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || DEFAULT_ORG_ID;
  }
  return DEFAULT_ORG_ID;
};

interface MetaTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  components: Array<{
    type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
    format?: string;
    text?: string;
    buttons?: Array<{ type: string; text: string; url?: string }>;
  }>;
}

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State for New Template Submission
  const [templateName, setTemplateName] = useState<string>("");
  const [category, setCategory] = useState<string>("MARKETING");
  const [language, setLanguage] = useState<string>("en_US");
  const [headerType, setHeaderType] = useState<"TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO" | "NONE">("TEXT");
  const [headerText, setHeaderText] = useState<string>("JISNU Digital Solutions");
  const [headerMediaUrl, setHeaderMediaUrl] = useState<string>("");
  const [uploadingHeaderMedia, setUploadingHeaderMedia] = useState<boolean>(false);
  const [bodyText, setBodyText] = useState<string>("Hello {{1}}! Welcome to JISNU Digital Solutions. Use coupon code {{2}} to get 20% off.");
  const [sampleVariables, setSampleVariables] = useState<string[]>(["Rahul", "SUMMER20"]);
  const [footerText, setFooterText] = useState<string>("Powered by JISNU CRM");

  // Button States
  const [buttonType, setButtonType] = useState<"URL" | "QUICK_REPLY" | "PHONE_NUMBER" | "COPY_CODE">("URL");
  const [buttonText, setButtonText] = useState<string>("Visit website");
  const [buttonUrl, setButtonUrl] = useState<string>("https://www.jisnudigital.com/");
  const [buttonPhoneNumber, setButtonPhoneNumber] = useState<string>("+919876543210");
  const [buttonCopyCode, setButtonCopyCode] = useState<string>("SUMMER20");

  const fetchTemplates = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/whatsapp/templates`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Auto-extract placeholders {{1}}, {{2}} to manage Meta mandated sample variable inputs
  useEffect(() => {
    const matches = bodyText.match(/\{\{\d+\}\}/g);
    if (matches) {
      setSampleVariables((prev) => {
        const next = [...prev];
        for (let i = 0; i < matches.length; i++) {
          if (!next[i]) next[i] = `Sample_${i + 1}`;
        }
        return next.slice(0, matches.length);
      });
    } else {
      setSampleVariables([]);
    }
  }, [bodyText]);

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert("Please enter a template name.");
      return;
    }
    if (!bodyText.trim()) {
      alert("Please enter the template message body.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/whatsapp/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          name: templateName,
          category,
          language,
          headerType,
          headerText,
          headerMediaUrl,
          bodyText,
          sampleVariables,
          footerText,
          buttonType,
          buttonText,
          buttonUrl,
          buttonPhoneNumber,
          buttonCopyCode
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("🎉 Template submitted to Meta for approval successfully!");
        setShowModal(false);
        setTemplateName("");
        setBodyText("");
        fetchTemplates();
      } else {
        alert("Meta Template Approval Error: " + (data.error || "Submission failed"));
      }
    } catch (err: any) {
      alert("Submission Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleHeaderFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeaderMedia(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = (event.target?.result as string).split(",")[1];
        const res = await fetch(`${BACKEND_URL}/api/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: base64Data,
            filename: file.name
          })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setHeaderMediaUrl(data.url);
        } else {
          alert("Media upload failed: " + (data.error || "Unknown error"));
        }
        setUploadingHeaderMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert("Error uploading media file: " + err.message);
      setUploadingHeaderMedia(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans antialiased">
      {/* Header Bar */}
      <header className="px-8 py-5 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-emerald-500/20 border border-purple-500/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Meta WhatsApp Template Manager
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                Official WABA Sync
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Submit new marketing templates directly to Meta Cloud API & monitor approval status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTemplates}
            disabled={refreshing}
            className="px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
            Sync Status
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Submit New Template for Approval
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-purple-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading active templates from Meta Cloud API...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
            <FileText className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No Templates Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Submit your first marketing template to Meta for instant approval right from this portal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              const headerComp = tpl.components.find((c) => c.type === "HEADER");
              const bodyComp = tpl.components.find((c) => c.type === "BODY");
              const footerComp = tpl.components.find((c) => c.type === "FOOTER");
              const buttonComp = tpl.components.find((c) => c.type === "BUTTONS");

              return (
                <div
                  key={tpl.id || tpl.name}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-3xl p-6 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <h3 className="font-mono font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          {tpl.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {tpl.category} • {tpl.language}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono flex items-center gap-1 ${
                          tpl.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : tpl.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {tpl.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                        {tpl.status === "PENDING" && <Clock className="h-3 w-3 animate-pulse" />}
                        {tpl.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {tpl.status}
                      </span>
                    </div>

                    {/* Template Card Content */}
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-2 text-xs">
                      {headerComp && (
                        <div className="font-bold text-slate-200 border-b border-slate-850 pb-1.5 text-xs">
                          {headerComp.format === "TEXT" ? (
                            headerComp.text
                          ) : (
                            <span className="text-purple-400 flex items-center gap-1">
                              [{headerComp.format} Header Attachment]
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {bodyComp?.text || "No body content"}
                      </p>
                      {footerComp && (
                        <div className="text-[10px] text-slate-500 pt-1 italic border-t border-slate-850">
                          {footerComp.text}
                        </div>
                      )}
                      {buttonComp && buttonComp.buttons && buttonComp.buttons.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          {buttonComp.buttons.map((btn, i) => (
                            <div
                              key={i}
                              className="w-full bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] font-semibold py-1.5 rounded-xl text-center flex items-center justify-center gap-1.5"
                            >
                              <Globe className="h-3 w-3" /> {btn.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">ID: {tpl.id}</span>
                    <Link
                      href="/whatsapp/bulk"
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      Use in Bulk <Send className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Submit Official Meta Template for Approval</h2>
                  <p className="text-[11px] text-slate-400">Meta auto-evaluates & approves compliant templates in 1-2 minutes</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTemplate} className="space-y-4">
              {/* Template Name, Category & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-300">Template Name</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                    placeholder="e.g. order_promo_20"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/60"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60 font-semibold"
                  >
                    <option value="MARKETING">MARKETING (Promotions & Offers)</option>
                    <option value="UTILITY">UTILITY (Transactional Updates)</option>
                    <option value="AUTHENTICATION">AUTHENTICATION (OTP & Passcodes)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Language Code</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60 font-mono font-semibold"
                  >
                    <option value="en_US">en_US (English US)</option>
                    <option value="en">en (English Default)</option>
                    <option value="hi">hi (Hindi)</option>
                    <option value="mr">mr (Marathi)</option>
                    <option value="es">es (Spanish)</option>
                    <option value="pt_BR">pt_BR (Portuguese BR)</option>
                    <option value="fr">fr (French)</option>
                    <option value="de">de (German)</option>
                    <option value="ar">ar (Arabic)</option>
                  </select>
                </div>
              </div>

              {/* Header Format Selection (None, Text, Image, Document, Video) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Header Format (Optional)
                </label>
                <select
                  value={headerType}
                  onChange={(e) => setHeaderType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60 font-semibold"
                >
                  <option value="NONE">None (No Header)</option>
                  <option value="TEXT">Text Header (Max 60 chars)</option>
                  <option value="IMAGE">🖼️ Image Header (.JPG, .PNG)</option>
                  <option value="DOCUMENT">📄 Document / PDF Header (.PDF)</option>
                  <option value="VIDEO">🎥 Video Header (.MP4)</option>
                </select>
              </div>

              {headerType === "TEXT" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Header Title Text</label>
                  <input
                    type="text"
                    maxLength={60}
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g. JISNU Digital Solutions"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              )}

              {["IMAGE", "DOCUMENT", "VIDEO"].includes(headerType) && (
                <div className="space-y-2 bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Sample Media File (Required by Meta for Approval)</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {headerType}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={headerMediaUrl}
                      onChange={(e) => setHeaderMediaUrl(e.target.value)}
                      placeholder={`https://example.com/sample-${headerType.toLowerCase()}.${headerType === 'DOCUMENT' ? 'pdf' : headerType === 'IMAGE' ? 'jpg' : 'mp4'}`}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60 font-mono shadow-inner"
                    />

                    <label className="px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md">
                      <Upload className="h-3.5 w-3.5 text-emerald-400" />
                      {uploadingHeaderMedia ? "Uploading..." : "Select File"}
                      <input
                        type="file"
                        accept={
                          headerType === "IMAGE"
                            ? "image/*"
                            : headerType === "DOCUMENT"
                            ? ".pdf"
                            : "video/*"
                        }
                        onChange={handleHeaderFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Message Body Text & Sample Variables */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Message Body Content (Supports {"{{1}}"}, {"{{2}}"} variables)</span>
                  <span className="text-[10px] font-mono text-slate-400">{bodyText.length}/1024 chars</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={1024}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Hello {{1}}! Welcome to JISNU Digital Solutions. Here is your 20% discount code: {{2}}."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60 resize-none leading-relaxed"
                  required
                />
              </div>

              {sampleVariables.length > 0 && (
                <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold text-blue-300 block uppercase tracking-wider">
                    Meta Mandate: Sample Variable Values for Approval ({sampleVariables.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sampleVariables.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 shrink-0 font-bold">{`{{${idx + 1}}}`}:</span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => {
                            const copy = [...sampleVariables];
                            copy[idx] = e.target.value;
                            setSampleVariables(copy);
                          }}
                          placeholder={`Sample value for {{${idx + 1}}}`}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Footer Text (Optional, Max 60 chars)</label>
                <input
                  type="text"
                  maxLength={60}
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g. Powered by JISNU CRM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              {/* Interactive Buttons Config */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">Interactive Action Buttons (Optional)</label>
                  <select
                    value={buttonType}
                    onChange={(e) => setButtonType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-bold focus:outline-none"
                  >
                    <option value="URL">🌐 Visit Website URL</option>
                    <option value="QUICK_REPLY">⚡ Quick Reply</option>
                    <option value="PHONE_NUMBER">📞 Call Phone Number</option>
                    <option value="COPY_CODE">📋 Copy Offer Code</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-bold">Button Label Text</label>
                    <input
                      type="text"
                      maxLength={25}
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Visit Website"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  {buttonType === "URL" && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold">Website Destination URL</label>
                      <input
                        type="url"
                        value={buttonUrl}
                        onChange={(e) => setButtonUrl(e.target.value)}
                        placeholder="https://www.jisnudigital.com/"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  )}

                  {buttonType === "PHONE_NUMBER" && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold">Phone Number (International Format)</label>
                      <input
                        type="text"
                        value={buttonPhoneNumber}
                        onChange={(e) => setButtonPhoneNumber(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  )}

                  {buttonType === "COPY_CODE" && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold">Coupon Code to Copy</label>
                      <input
                        type="text"
                        maxLength={15}
                        value={buttonCopyCode}
                        onChange={(e) => setButtonCopyCode(e.target.value)}
                        placeholder="SUMMER20"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Submitting to Meta...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Submit to Meta for Approval
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
