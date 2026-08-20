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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "";
};

export default function WhatsAppBulkBroadcastPage() {
  const [phoneNumbersText, setPhoneNumbersText] = useState<string>("");
  const [sendType, setSendType] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("jisnu_official_welcome");
  const [fetchedTemplates, setFetchedTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/whatsapp/templates`, {
      headers: { "x-organization-id": getOrgId() }
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
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);

  const [sending, setSending] = useState<boolean>(false);
  const [result, setResult] = useState<{
    success: boolean;
    totalSent?: number;
    totalFailed?: number;
    error?: string;
  } | null>(null);

  // Parse phone numbers from multi-line text or comma-separated list
  const parsedRecipients = phoneNumbersText
    .split(/[\n,]+/)
    .map((num) => num.trim())
    .filter((num) => num.length >= 8);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r?\n/);
      const extracted: string[] = [];

      for (const line of lines) {
        const parts = line.split(/[;,	]/);
        for (const part of parts) {
          const cleaned = part.replace(/\D/g, "");
          if (cleaned.length >= 9 && cleaned.length <= 15) {
            extracted.push(cleaned);
          }
        }
      }

      if (extracted.length > 0) {
        const unique = Array.from(new Set(extracted));
        setPhoneNumbersText((prev) => (prev ? `${prev}\n${unique.join("\n")}` : unique.join("\n")));
      }
    };
    reader.readAsText(file);
  };

  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/messages/upload-media`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMediaUrl(data.url);
      } else {
        alert("Media upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading media file.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRecipients.length === 0) {
      alert("Please provide at least one valid phone number.");
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const payload: any = {
        organizationId: getOrgId(),
        recipients: parsedRecipients,
        sendType,
        message: messageText,
        mediaUrl: mediaUrl.trim() || undefined,
        fileName: uploadedFileName || undefined
      };

      if (sendType === "template") {
        payload.templateName = selectedTemplate;
      }

      const res = await fetch(`${BACKEND_URL}/api/messages/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          totalSent: data.totalSent || parsedRecipients.length,
          totalFailed: data.totalFailed || 0,
        });
      } else {
        setResult({
          success: false,
          error: data.error || data.message || "Failed to send bulk broadcast.",
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
    <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-2xs">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              WhatsApp Bulk Broadcast Campaign
              <Badge variant="success" className="text-[10px] font-mono">
                <Zap className="h-3 w-3 fill-emerald-600 mr-1" /> Cloud API Engine
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Send mass promotional messages, PDF brochures, and image campaigns to thousands of leads
            </p>
          </div>
        </div>

        <Link href="/whatsapp">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700">
            View Inbox <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
          </Button>
        </Link>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Banner Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 border border-emerald-200/80 rounded-3xl p-6 md:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <Badge variant="success" className="text-xs font-bold mb-1">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> High-Throughput Campaign Manager
              </Badge>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Mass WhatsApp Marketing &amp; Outreach
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Paste recipient numbers or upload your lead CSV file. Each target receives your marketing message &amp; PDF brochure directly in their WhatsApp chat while logging automatically in your CRM inbox.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-emerald-100 shrink-0 shadow-xs">
              <div className="text-center border-r border-slate-100 pr-4">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Recipients</div>
                <div className="text-lg font-black text-emerald-700 font-mono">{parsedRecipients.length}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pacing Rate</div>
                <div className="text-xs font-bold text-slate-800 font-mono mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 500ms / msg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <form onSubmit={handleSendBroadcast} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Recipient Numbers */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" /> Recipient Numbers
                </label>

                <label className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Upload CSV
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-500 leading-normal">
                Enter numbers (one per line, e.g. <code className="text-emerald-700 font-mono font-bold">919876543210</code> or <code className="text-emerald-700 font-mono font-bold">John, 919876543210</code>):
              </p>

              <textarea
                rows={11}
                value={phoneNumbersText}
                onChange={(e) => setPhoneNumbersText(e.target.value)}
                placeholder="John, 919876543210&#10;Sarah, 919123456789"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none shadow-inner"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Valid Numbers Ready:
              </span>
              <span className="font-extrabold text-slate-900 text-sm bg-white px-3 py-0.5 rounded-xl border border-slate-200 shadow-2xs">
                {parsedRecipients.length}
              </span>
            </div>
          </div>

          {/* Right Column: Broadcast Content & Media */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" /> Broadcast Message &amp; Meta Template
              </label>
              <Badge variant="success" className="text-[10px] font-mono">
                Approved Templates
              </Badge>
            </div>

            {/* Mode Switcher: Meta Template vs Custom CRM Message */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Campaign Message Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSendType("template")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    sendType === "template"
                      ? "bg-emerald-50 border-emerald-400 text-slate-900 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Meta Template
                    </span>
                    {sendType === "template" && <Check className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    Required for 500+ cold leads (Bypasses 24-hr policy)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSendType("custom")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    sendType === "custom"
                      ? "bg-sky-50 border-sky-400 text-slate-900 ring-2 ring-sky-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-brand-blue" /> Custom CRM Message
                    </span>
                    {sendType === "custom" && <Check className="h-4 w-4 text-brand-blue" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    Custom text &amp; attached PDF brochures/Images
                  </p>
                </button>
              </div>
            </div>

            {/* Template Selector Dropdown */}
            {sendType === "template" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Approved Meta WhatsApp Template
                  </label>
                  <Link
                    href="/whatsapp/templates"
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Create New Template
                  </Link>
                </div>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-semibold shadow-2xs"
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
              <label className="block text-xs font-bold text-slate-700">
                Message Body (Supports Emojis &amp; Formatting)
              </label>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your promotional message or announcement..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Attachment Box */}
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-brand-blue" /> Attachment (PDF Brochure or Image)
                </span>
                <span className="text-[10px] text-slate-500 font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  .PDF, .JPG, .PNG
                </span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/company-brochure.pdf (or select file)"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-all font-mono shadow-2xs"
                />

                <label className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm">
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
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-slate-800 flex items-center justify-between font-mono">
                  <span className="truncate max-w-md flex items-center gap-2">
                    {mediaUrl.toLowerCase().endsWith(".pdf") || mediaUrl.toLowerCase().includes("pdf") ? (
                      <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-purple-600 shrink-0" />
                    )}
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : mediaUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setMediaUrl(""); setUploadedFileName(""); }}
                    className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setMediaUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"); setUploadedFileName("Sample_Brochure.pdf"); }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileText className="h-3 w-3 text-rose-500" /> Sample PDF Brochure
                </button>
                <button
                  type="button"
                  onClick={() => { setMediaUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"); setUploadedFileName("Banner_Image.jpg"); }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ImageIcon className="h-3 w-3 text-purple-600" /> Sample Banner Image
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={sending || parsedRecipients.length === 0}
              variant="default"
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Dispatching Broadcast...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 fill-white" /> Launch Bulk Campaign to {parsedRecipients.length} Recipients
                </>
              )}
            </Button>

            {/* Campaign Execution Results */}
            {result && (
              <div
                className={`p-4.5 rounded-2xl border text-xs space-y-2 shadow-sm ${
                  result.success
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border-rose-300 text-rose-900"
                }`}
              >
                {result.success ? (
                  <>
                    <div className="flex items-center gap-2 font-extrabold text-emerald-800 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> Broadcast Campaign Dispatched Successfully!
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Dispatched to <span className="font-bold text-emerald-700">{result.totalSent}</span> recipients. (Failed: {result.totalFailed})
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" /> {result.error}
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
