"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Users,
  MessageSquare,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Zap,
  Check,
  Globe,
  Plus
} from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

export default function WhatsAppBulkBroadcastPage() {
  const [phoneNumbersText, setPhoneNumbersText] = useState<string>("");
  const [sendType, setSendType] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("jisnu_official_welcome");
  const [fetchedTemplates, setFetchedTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/whatsapp/templates`, {
      headers: { "x-organization-id": DEFAULT_ORG_ID }
    })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.templates)) {
          setFetchedTemplates(d.templates);
          const approved = d.templates.find((t: any) => t.status === "APPROVED");
          if (approved) setSelectedTemplate(approved.name);
        }
      })
      .catch((err) => console.error("Could not fetch WABA templates:", err));
  }, []);

  const [messageText, setMessageText] = useState<string>(
    "Hello! 🚀 Welcome to JISNU Digital Solutions. Check out our latest services, offers, and digital marketing brochures today!"
  );
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const [result, setResult] = useState<{
    success?: boolean;
    totalSent?: number;
    totalFailed?: number;
    details?: any[];
    error?: string;
  } | null>(null);

  const parsedRecipients = phoneNumbersText
    .split("\n")
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2 && isNaN(Number(parts[0]))) {
        return { name: parts[0], phone: parts[1].replace(/[^\d+]/g, "").trim() };
      } else if (parts.length >= 2 && isNaN(Number(parts[1]))) {
        return { name: parts[1], phone: parts[0].replace(/[^\d+]/g, "").trim() };
      } else {
        return { name: "", phone: line.replace(/[^\d+]/g, "").trim() };
      }
    })
    .filter((r) => r.phone.length >= 8);

  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setUploadedFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = (event.target?.result as string).split(",")[1];
        if (!base64Data) return;

        const res = await fetch(`${BACKEND_URL}/api/admin/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": DEFAULT_ORG_ID,
          },
          body: JSON.stringify({
            fileBase64: base64Data,
            filename: file.name,
          }),
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setMediaUrl(data.url);
        } else {
          alert("File upload failed: " + (data.error || "Unknown error"));
        }
        setUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
      setUploadingMedia(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const lines = content
          .split(/[\r\n]+/)
          .map((line) => line.split(",")[0].replace(/[^\d+]/g, "").trim())
          .filter((num) => num.length >= 8);

        if (lines.length > 0) {
          setPhoneNumbersText(lines.join("\n"));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRecipients.length === 0) {
      alert("Please enter at least one valid phone number.");
      return;
    }
    if (!messageText.trim()) {
      alert("Please enter a message content for your broadcast.");
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/whatsapp/bulk-broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": DEFAULT_ORG_ID,
        },
        body: JSON.stringify({
          recipients: parsedRecipients,
          messageText,
          mediaUrl: mediaUrl.trim() || undefined,
          templateName: selectedTemplate,
          sendType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({
          success: true,
          totalSent: data.totalSent,
          totalFailed: data.totalFailed,
          details: data.details,
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to deliver broadcast campaign.",
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || "Network error sending broadcast campaign.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100 flex items-center gap-2 tracking-tight">
              WhatsApp Bulk Broadcast Campaign
              <span className="text-[10px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1 shadow-sm">
                <Zap className="h-3 w-3 fill-emerald-400" /> Cloud API Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Send mass promotional messages, PDF brochures, and image campaigns to thousands of leads
            </p>
          </div>
        </div>

        <Link
          href="/whatsapp"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20"
        >
          View Inbox <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
        </Link>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 scrollbar-thin scrollbar-none">
        
        {/* Banner Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800/80 rounded-3xl p-6 md:p-7 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                <Sparkles className="h-3.5 w-3.5" /> High-Throughput Campaign Manager
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
                Mass WhatsApp Marketing & Outreach
              </h2>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                Paste recipient numbers or upload your lead CSV file. Each target receives your marketing message & PDF brochure directly in their WhatsApp chat while logging automatically in your CRM inbox.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 shrink-0 shadow-inner">
              <div className="text-center border-r border-slate-800 pr-4">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Recipients</div>
                <div className="text-lg font-black text-emerald-400 font-mono">{parsedRecipients.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Pacing Rate</div>
                <div className="text-xs font-bold text-slate-200 font-mono mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 500ms / msg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <form onSubmit={handleSendBroadcast} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Recipient Numbers */}
          <div className="md:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" /> Recipient Numbers
                </label>

                <label className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Upload CSV
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Enter numbers (one per line, e.g. <code className="text-emerald-400 font-mono">919876543210</code> or <code className="text-emerald-400 font-mono">John, 919876543210</code>):
              </p>

              <textarea
                rows={11}
                value={phoneNumbersText}
                onChange={(e) => setPhoneNumbersText(e.target.value)}
                placeholder="John, 919876543210&#10;Sarah, 919123456789"
                className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none shadow-inner"
              />
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Valid Numbers Ready:
              </span>
              <span className="font-extrabold text-slate-100 text-sm bg-slate-900 px-3 py-0.5 rounded-xl border border-slate-800">
                {parsedRecipients.length}
              </span>
            </div>
          </div>

          {/* Right Column: Broadcast Content & Media */}
          <div className="md:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
            
            <div className="border-b border-slate-800/80 pb-3.5 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" /> Broadcast Message & Meta Template
              </label>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                Approved Templates
              </span>
            </div>

            {/* Mode Switcher: Meta Template vs Custom CRM Portal Message */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Campaign Message Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSendType("template")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    sendType === "template"
                      ? "bg-emerald-500/10 border-emerald-500/50 text-slate-100 ring-1 ring-emerald-500/20"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Meta Template
                    </span>
                    {sendType === "template" && <Check className="h-4 w-4 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Required for 500+ cold leads (Bypasses 24-hr policy)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSendType("custom")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    sendType === "custom"
                      ? "bg-blue-500/10 border-blue-500/50 text-slate-100 ring-1 ring-blue-500/20"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-400" /> Custom CRM Message
                    </span>
                    {sendType === "custom" && <Check className="h-4 w-4 text-blue-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Custom text & attached PDF brochures/Images
                  </p>
                </button>
              </div>
            </div>

            {/* Template Selector Dropdown */}
            {sendType === "template" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Select Approved Meta WhatsApp Template
                  </label>
                  <Link
                    href="/whatsapp/templates"
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Create New Template
                  </Link>
                </div>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60 font-mono font-semibold"
                >
                  {fetchedTemplates.length > 0 ? (
                    fetchedTemplates.map((t) => (
                      <option key={t.id || t.name} value={t.name}>
                        {t.status === "APPROVED" ? "✅" : "⏳"} {t.name} ({t.category} • {t.language})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="jisnu_official_welcome">
                        ⭐ jisnu_official_welcome (Header: JISNU Digital Solutions)
                      </option>
                      <option value="welcome_jisnu_marketing">
                        welcome_jisnu_marketing (Standard Marketing Template)
                      </option>
                      <option value="hello_world">
                        hello_world (Default Sample Utility Template)
                      </option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Message Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Message Body (Supports Emojis & Formatting)
              </label>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your promotional message or announcement..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Attachment Box */}
            <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-400" /> Attachment (PDF Brochure or Image)
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                  .PDF, .JPG, .PNG
                </span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/company-brochure.pdf (or select file)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60 transition-all font-mono shadow-inner"
                />

                <label className="px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md">
                  <Upload className="h-3.5 w-3.5 text-emerald-400" />
                  {uploadingMedia ? "Uploading..." : "Select File"}
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleMediaFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {mediaUrl && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-slate-200 flex items-center justify-between font-mono">
                  <span className="truncate max-w-md flex items-center gap-2">
                    {mediaUrl.toLowerCase().endsWith(".pdf") || mediaUrl.toLowerCase().includes("pdf") ? (
                      <FileText className="h-4 w-4 text-rose-400 shrink-0" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-purple-400 shrink-0" />
                    )}
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : mediaUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setMediaUrl(""); setUploadedFileName(""); }}
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setMediaUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"); setUploadedFileName("Sample_Brochure.pdf"); }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[11px] font-medium rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="h-3 w-3 text-rose-400" /> Sample PDF Brochure
                </button>
                <button
                  type="button"
                  onClick={() => { setMediaUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"); setUploadedFileName("Banner_Image.jpg"); }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[11px] font-medium rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="h-3 w-3 text-purple-400" /> Sample Banner Image
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending || parsedRecipients.length === 0}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Dispatching Broadcast...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 fill-slate-950" /> Launch Bulk Campaign to {parsedRecipients.length} Recipients
                </>
              )}
            </button>

            {/* Campaign Execution Results */}
            {result && (
              <div
                className={`p-4.5 rounded-2xl border text-xs space-y-2 backdrop-blur-md shadow-xl ${
                  result.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {result.success ? (
                  <>
                    <div className="flex items-center gap-2 font-extrabold text-emerald-400 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> Broadcast Campaign Dispatched Successfully!
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Dispatched to <span className="font-bold text-emerald-400">{result.totalSent}</span> recipients. (Failed: {result.totalFailed})
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" /> {result.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
