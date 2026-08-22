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
  const [templateName, setTemplateName] = useState<string>("jisnu_promo_offer");
  const [category, setCategory] = useState<string>("MARKETING");
  const [language, setLanguage] = useState<string>("en");
  const [headerType, setHeaderType] = useState<"TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO" | "NONE">("TEXT");
  const [headerText, setHeaderText] = useState<string>("JISNU Digital Solutions");
  const [headerMediaUrl, setHeaderMediaUrl] = useState<string>("");
  const [uploadingHeaderMedia, setUploadingHeaderMedia] = useState<boolean>(false);
  const [bodyText, setBodyText] = useState<string>(
    "Hello {{1}}! 🚀 Thank you for choosing JISNU. Enjoy an exclusive 20% discount on your next service. Claim now!"
  );
  const [footerText, setFooterText] = useState<string>("Reply STOP to unsubscribe • JISNU CRM");
  const [buttonText, setButtonText] = useState<string>("Claim Offer Online");
  const [buttonUrl, setButtonUrl] = useState<string>("https://www.jisnudigital.com/offers");

  const fetchTemplates = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/whatsapp/templates`, {
        headers: { "x-organization-id": getOrgId() },
      });
      const data = await res.json();
      if (data.templates && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed to load WABA templates:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleHeaderFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeaderMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/messages/upload-media`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setHeaderMediaUrl(data.url);
      } else {
        alert("Sample media upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Media upload error:", err);
      alert("Error uploading media file.");
    } finally {
      setUploadingHeaderMedia(false);
    }
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const components: any[] = [];

    // Header component
    if (headerType === "TEXT" && headerText.trim()) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: headerText.trim(),
      });
    } else if (["IMAGE", "DOCUMENT", "VIDEO"].includes(headerType)) {
      const sampleHandle = headerMediaUrl.trim() || undefined;
      components.push({
        type: "HEADER",
        format: headerType,
        example: sampleHandle ? { header_handle: [sampleHandle] } : undefined,
      });
    }

    // Body component
    components.push({
      type: "BODY",
      text: bodyText.trim(),
      example: bodyText.includes("{{1}}") ? { body_text: [["Valued Customer"]] } : undefined,
    });

    // Footer component
    if (footerText.trim()) {
      components.push({
        type: "FOOTER",
        text: footerText.trim(),
      });
    }

    // Buttons component
    if (buttonText.trim()) {
      components.push({
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: buttonText.trim(),
            url: buttonUrl.trim() || "https://www.jisnudigital.com/",
          },
        ],
      });
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/whatsapp/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId(),
        },
        body: JSON.stringify({
          name: templateName.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
          category,
          language,
          components,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("🎉 Template submitted successfully to Meta! It will be reviewed in a few minutes.");
        setShowModal(false);
        fetchTemplates();
      } else {
        alert(`Failed to submit template: ${data.error || data.message || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Error submitting template: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 shadow-2xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              Meta WhatsApp Templates Manager
              <Badge variant="brand" className="text-[10px] font-mono">
                Official WABA
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Create, manage, and verify official Meta Cloud API approved templates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            disabled={refreshing}
            className="border-slate-200 text-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
            Sync Status
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
          >
            <Plus className="h-4 w-4" />
            Submit New Template
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3 shadow-xs">
            <RefreshCw className="h-7 w-7 animate-spin text-purple-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading active templates from Meta Cloud API...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3 shadow-xs">
            <FileText className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Templates Found</h3>
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
                  className="bg-white border border-slate-200 hover:border-purple-300 rounded-3xl p-6 transition-all space-y-4 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          {tpl.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {tpl.category} • {tpl.language}
                        </span>
                      </div>
                      <Badge
                        variant={
                          tpl.status === "APPROVED"
                            ? "success"
                            : tpl.status === "PENDING"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {tpl.status === "APPROVED" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {tpl.status === "PENDING" && <Clock className="h-3 w-3 mr-1" />}
                        {tpl.status === "REJECTED" && <XCircle className="h-3 w-3 mr-1" />}
                        {tpl.status}
                      </Badge>
                    </div>

                    {/* Preview Bubble */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs space-y-2 relative shadow-inner">
                      {headerComp && (
                        <div className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1.5">
                          {headerComp.text || `[Header Media: ${headerComp.format}]`}
                        </div>
                      )}
                      {bodyComp && (
                        <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-wrap">
                          {bodyComp.text}
                        </p>
                      )}
                      {footerComp && (
                        <p className="text-[9px] text-slate-400 pt-1 border-t border-slate-200">
                          {footerComp.text}
                        </p>
                      )}
                      {buttonComp && buttonComp.buttons && (
                        <div className="pt-2 space-y-1.5">
                          {buttonComp.buttons.map((btn, i) => (
                            <div
                              key={i}
                              className="w-full bg-white border border-slate-200 text-brand-blue text-[11px] font-bold py-1.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <Globe className="h-3 w-3" /> {btn.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono text-[10px]">ID: {tpl.id}</span>
                    <Link
                      href="/whatsapp/bulk"
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Submit Template for Approval</h2>
                  <p className="text-[11px] text-slate-500">Meta auto-evaluates &amp; approves in 1-2 minutes</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Template Name (Lowercase, no spaces)</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                    placeholder="e.g. promo_discount_offer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    <option value="MARKETING">MARKETING</option>
                    <option value="UTILITY">UTILITY</option>
                  </select>
                </div>
              </div>

              {/* Header Format Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Header Type / Media Sample (Optional)
                </label>
                <select
                  value={headerType}
                  onChange={(e) => setHeaderType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="NONE">None (No Header)</option>
                  <option value="TEXT">Text Header (e.g. JISNU Digital Solutions)</option>
                  <option value="IMAGE">🖼️ Image Header (.JPG, .PNG)</option>
                  <option value="DOCUMENT">📄 Document / PDF Header (.PDF)</option>
                  <option value="VIDEO">🎥 Video Header (.MP4)</option>
                </select>
              </div>

              {headerType === "TEXT" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Header Title Text</label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g. JISNU Digital Solutions"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              )}

              {["IMAGE", "DOCUMENT", "VIDEO"].includes(headerType) && (
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Sample Media File (Required by Meta for Approval)</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {headerType}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={headerMediaUrl}
                      onChange={(e) => setHeaderMediaUrl(e.target.value)}
                      placeholder={`https://example.com/sample-${headerType.toLowerCase()}.${headerType === 'DOCUMENT' ? 'pdf' : headerType === 'IMAGE' ? 'jpg' : 'mp4'}`}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono shadow-2xs"
                    />

                    <label className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm">
                      <Upload className="h-3.5 w-3.5 text-purple-400" />
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Message Body Content</label>
                <textarea
                  rows={5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Hello! Welcome to JISNU Digital Solutions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Footer Text</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="e.g. Powered by JISNU CRM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Button Label</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Visit website"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Button Website URL</label>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="https://www.jisnudigital.com/"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  variant="default"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
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
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
