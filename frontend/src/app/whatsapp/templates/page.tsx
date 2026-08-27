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
  Upload,
  Layers,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || "";
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

export default function WhatsAppTemplatesPage({ selectedAccountId }: { selectedAccountId?: string }) {
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
      const res = await fetch(`${BACKEND_URL}/api/admin/whatsapp/templates?accountId=${selectedAccountId || ""}`, {
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
  }, [selectedAccountId]);

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
          headers: { 
            "Content-Type": "application/json",
            "x-organization-id": getOrgId()
          },
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
    <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans antialiased">
      {/* Header Bar */}
      <header className="px-6 md:px-8 py-5 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              Meta WhatsApp Template Manager
              <Badge variant="success" className="text-[10px] font-mono">
                Official WABA Sync
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Submit new marketing templates directly to Meta Cloud API &amp; monitor live approval status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            disabled={refreshing}
            className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
            Sync Status
          </Button>

          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Submit New Template
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Summary Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-purple-50/40 border border-purple-200/60 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[11px] font-bold mb-1">
                <Sparkles className="h-3 w-3 mr-1" /> Meta Cloud API Verification Engine
              </Badge>
              <h2 className="text-lg font-black text-slate-900">Pre-Approved Message Blueprints</h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                WhatsApp requires template pre-approval for proactive outreach. Once approved by Meta AI, broadcast messages can be scheduled and dispatched seamlessly in bulk.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-purple-100 shadow-2xs shrink-0">
              <div className="text-center pr-3 border-r border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Sync</div>
                <div className="text-base font-black text-slate-900 font-mono">{templates.length}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-emerald-600 font-bold uppercase">Approved</div>
                <div className="text-base font-black text-emerald-700 font-mono">
                  {templates.filter((t) => t.status === "APPROVED").length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3 shadow-xs">
            <RefreshCw className="h-7 w-7 animate-spin text-purple-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading active templates from Meta Cloud API...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3 shadow-xs">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Templates Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Submit your first marketing template to Meta for instant approval right from this portal.
            </p>
            <Button
              size="sm"
              onClick={() => setShowModal(true)}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Template
            </Button>
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
                  className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-purple-300 rounded-3xl p-6 transition-all space-y-4 shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Card Header Bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate max-w-[180px]">
                          {tpl.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {tpl.category} • {tpl.language}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono flex items-center gap-1 ${
                          tpl.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tpl.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {tpl.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                        {tpl.status === "PENDING" && <Clock className="h-3 w-3 animate-pulse" />}
                        {tpl.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {tpl.status}
                      </span>
                    </div>

                    {/* Template Visual Bubble */}
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                      {headerComp && (
                        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 text-xs">
                          {headerComp.format === "TEXT" ? (
                            headerComp.text
                          ) : (
                            <span className="text-purple-600 flex items-center gap-1">
                              [{headerComp.format} Header Attachment]
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                        {bodyComp?.text || "No body content"}
                      </p>
                      {footerComp && (
                        <div className="text-[10px] text-slate-400 pt-1 italic border-t border-slate-200">
                          {footerComp.text}
                        </div>
                      )}
                      {buttonComp && buttonComp.buttons && buttonComp.buttons.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          {buttonComp.buttons.map((btn, i) => (
                            <div
                              key={i}
                              className="w-full bg-white border border-slate-200 text-emerald-700 text-[11px] font-semibold py-1.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <Globe className="h-3 w-3 text-emerald-600" /> {btn.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <span className="font-mono text-[10px] text-slate-400">ID: {tpl.id}</span>
                    <Link
                      href="/whatsapp/bulk"
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Submit Official Meta Template for Approval</h2>
                  <p className="text-[11px] text-slate-500">Meta auto-evaluates &amp; approves compliant templates in 1-2 minutes</p>
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
              {/* Template Name, Category & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700">Template Name</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                    placeholder="e.g. order_promo_20"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold focus:bg-white"
                  >
                    <option value="MARKETING">MARKETING (Promotions &amp; Offers)</option>
                    <option value="UTILITY">UTILITY (Transactional Updates)</option>
                    <option value="AUTHENTICATION">AUTHENTICATION (OTP &amp; Passcodes)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Language Code</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-semibold focus:bg-white"
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
                <label className="text-xs font-bold text-slate-700 block">
                  Header Format (Optional)
                </label>
                <select
                  value={headerType}
                  onChange={(e) => setHeaderType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold focus:bg-white"
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
                  <label className="text-xs font-bold text-slate-700">Header Title Text</label>
                  <input
                    type="text"
                    maxLength={60}
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g. JISNU Digital Solutions"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              )}

              {["IMAGE", "DOCUMENT", "VIDEO"].includes(headerType) && (
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Sample Media File for Meta Verification</span>
                    <span className="text-[10px] text-purple-600 font-normal">Auto-Uploaded to CDN</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={handleHeaderFileUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                    />
                    {uploadingHeaderMedia && (
                      <span className="text-xs text-purple-600 flex items-center gap-1 font-semibold">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>
                  {headerMediaUrl && (
                    <div className="text-[11px] text-emerald-700 font-mono truncate bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0" /> {headerMediaUrl}
                    </div>
                  )}
                </div>
              )}

              {/* Template Body */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Message Body</label>
                  <span className="text-[10px] text-slate-400">Use {"{{1}}"}, {"{{2}}"} for parameters</span>
                </div>
                <textarea
                  rows={4}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Hello {{1}}! Here is your exclusive offer: {{2}}"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Meta Mandated Sample Variable Values */}
              {sampleVariables.length > 0 && (
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Meta Required Sample Variables
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sampleVariables.map((sampleVal, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500">{"{{"}{idx + 1}{"}}"} value:</span>
                        <input
                          type="text"
                          value={sampleVal}
                          onChange={(e) => {
                            const newArr = [...sampleVariables];
                            newArr[idx] = e.target.value;
                            setSampleVariables(newArr);
                          }}
                          placeholder={`Sample ${idx + 1}`}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Footer Text (Optional)</label>
                <input
                  type="text"
                  maxLength={60}
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g. Reply STOP to unsubscribe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Interactive Buttons Config */}
              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="text-xs font-bold text-slate-800">Action Button (Optional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["URL", "QUICK_REPLY", "PHONE_NUMBER", "COPY_CODE"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setButtonType(type)}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                        buttonType === type
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 font-bold">Button Display Text</label>
                    <input
                      type="text"
                      maxLength={25}
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Visit Website"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {buttonType === "URL" && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-600 font-bold">Target Web URL</label>
                      <input
                        type="url"
                        value={buttonUrl}
                        onChange={(e) => setButtonUrl(e.target.value)}
                        placeholder="https://www.example.com/"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}

                  {buttonType === "PHONE_NUMBER" && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-600 font-bold">Dial Phone Number (with country code)</label>
                      <input
                        type="text"
                        value={buttonPhoneNumber}
                        onChange={(e) => setButtonPhoneNumber(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {buttonType === "COPY_CODE" && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-600 font-bold">Coupon Code to Copy</label>
                      <input
                        type="text"
                        maxLength={15}
                        value={buttonCopyCode}
                        onChange={(e) => setButtonCopyCode(e.target.value)}
                        placeholder="SUMMER20"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="border-slate-200 text-slate-700"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-500/20"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting to Meta...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-1.5" /> Submit to Meta for Approval
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
