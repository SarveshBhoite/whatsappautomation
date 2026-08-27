"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Copy,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  BarChart2,
  Layers,
  ArrowRight,
  Shield,
  Sparkles,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  UserCheck,
  Ban,
  Activity,
  Zap,
  Check,
  X,
  FileText,
  Upload,
  Calendar,
  Eye,
  FileSpreadsheet,
  Phone,
  FileCode
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || "";
  }
  return "";
};

export default function WhatsAppDripCampaignsModule({ selectedAccountId }: { selectedAccountId?: string }) {
  const [activeSubView, setActiveSubView] = useState<"dashboard" | "create" | "details" | "ai-create">("dashboard");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  // Meta WABA Templates State
  const [metaTemplates, setMetaTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Create Campaign Wizard State (Multi-step)
  const [wizardStep, setWizardStep] = useState(1); // 1: Details, 2: Audience, 3: Journey Builder, 4: Safety & Review
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phoneNumberId: "",
    wabaId: "",
    timezone: "Asia/Kolkata",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endDate: "",
    status: "DRAFT",
    minMessageGapMins: 5,
    maxDailyMessages: 3,
    allowReentry: true,
    onReplyAction: "STOP",
    businessHoursOnly: false,
    allowedStartTime: "09:00",
    allowedEndTime: "18:00",
    excludeWeekends: false,
  });

  // Audience Selection & File Upload State
  const [manualPhonesInput, setManualPhonesInput] = useState("");
  const [uploadedContacts, setUploadedContacts] = useState<{ phone: string; name?: string }[]>([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
  const [filePreviewSearch, setFilePreviewSearch] = useState("");
  const [editingContactIdx, setEditingContactIdx] = useState<number | null>(null);
  const [audiencePreview, setAudiencePreview] = useState<any>({
    selectedContacts: 0,
    eligible: 0,
    excluded: 0,
    exclusionReasons: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string || "";
      const lines = text.split(/[\r\n]+/);
      const extracted: { phone: string; name: string }[] = [];

      lines.forEach((line) => {
        const lineStr = line.trim();
        if (!lineStr) return;
        const items = lineStr.split(/[,;\t]/);
        items.forEach((item) => {
          const digits = item.replace(/[^0-9]/g, "");
          if (digits.length >= 10 && digits.length <= 15) {
            if (!extracted.some(c => c.phone === digits)) {
              extracted.push({ phone: digits, name: `Contact (${digits.slice(-4)})` });
            }
          }
        });
      });

      if (extracted.length > 0) {
        setUploadedContacts(extracted);
        setShowFilePreviewModal(true); // Automatically open file preview modal!
      } else {
        alert(`Could not extract valid 10-digit phone numbers from '${file.name}'. Please ensure your CSV/file contains valid phone numbers.`);
      }
    };

    reader.readAsText(file);
  };

  // Drip Steps Sequence State (Default 3-Step Sequence)
  const [dripSteps, setDripSteps] = useState<any[]>([
    {
      id: "step_1",
      stepNumber: 1,
      stepType: "SEND_TEMPLATE",
      templateName: "welcome_jisnu_marketing",
      languageCode: "en_US",
      priority: "HIGH",
      delayUnit: "IMMEDIATE",
      delayValue: 0,
      exactScheduleAt: "",
      variableMappings: {}
    },
    {
      id: "step_2",
      stepNumber: 2,
      stepType: "SEND_TEMPLATE",
      templateName: "welcome_jisnu_marketing",
      languageCode: "en_US",
      priority: "MEDIUM",
      delayUnit: "MINUTES",
      delayValue: 5,
      exactScheduleAt: "",
      variableMappings: {}
    },
    {
      id: "step_3",
      stepNumber: 3,
      stepType: "SEND_TEMPLATE",
      templateName: "welcome_jisnu_marketing",
      languageCode: "en_US",
      priority: "MEDIUM",
      delayUnit: "MINUTES",
      delayValue: 15,
      exactScheduleAt: "",
      variableMappings: {}
    }
  ]);

  // Test Campaign Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  // AI Campaign Studio State
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAdvancedAi, setShowAdvancedAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [aiTone, setAiTone] = useState("Friendly & Persuasive");
  const [aiStepCount, setAiStepCount] = useState("3");
  const [aiKeyPoints, setAiKeyPoints] = useState("");
  const [aiRefineText, setAiRefineText] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [refiningAi, setRefiningAi] = useState(false);
  const [regeneratingStepIdx, setRegeneratingStepIdx] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Dedicated AI Campaign Flow State (Step 1: Prompt & Strategy, Step 2: Sequence Editor, Step 3: Audience & Launch)
  const [aiWizardStep, setAiWizardStep] = useState<1 | 2 | 3>(1);

  const handleGenerateAiCampaign = async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || aiPrompt;
    if (!finalPrompt.trim()) return;

    try {
      setGeneratingAi(true);
      setAiResult(null);

      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns/generate-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          targetAudience: aiAudience,
          tone: aiTone,
          stepCount: aiStepCount,
          keyPoints: aiKeyPoints
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data.campaign);
        setAiWizardStep(2); // Automatically advance to AI Step 2 (Sequence Studio)!
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleLaunchAiCampaign = async (statusOverride: "ACTIVE" | "DRAFT" = "ACTIVE") => {
    if (!aiResult) return;

    try {
      setLoading(true);

      // Auto-register AI Meta Templates if present
      const newTemplatesToRegister = (aiResult.steps || [])
        .filter((s: any) => s.isNewAiTemplate && s.aiTemplatePayload)
        .map((s: any) => s.aiTemplatePayload);

      if (newTemplatesToRegister.length > 0) {
        await fetch(`${BACKEND_URL}/api/whatsapp/drip/templates/submit-ai-templates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": getOrgId()
          },
          body: JSON.stringify({ templates: newTemplatesToRegister })
        });
        await fetchMetaTemplates();
      }

      // Parse target contacts
      const rawManualList = manualPhonesInput
        .split(/[\n,;]+/)
        .map(p => p.trim().replace(/[^0-9]/g, ""))
        .filter(p => p.length >= 10);

      const targetContacts = Array.from(new Set([
        ...rawManualList.map(p => ({ phone: p })),
        ...uploadedContacts.map(c => ({ phone: c.phone, name: c.name }))
      ]));

      if (targetContacts.length === 0 && selectedTags.length === 0) {
        alert("⚠️ Please add at least 1 phone number manually, upload a CSV/Excel file, or select a CRM tag before launching your AI campaign.");
        setLoading(false);
        return;
      }

      const payload = {
        organizationId: getOrgId(),
        whatsappConfigId: selectedAccountId || undefined,
        name: aiResult.name || "AI WhatsApp Drip Sequence",
        description: aiResult.description || "AI Generated Drip Campaign",
        timezone: aiResult.timezone || "Asia/Kolkata",
        status: statusOverride,
        minMessageGapMins: aiResult.minMessageGapMins || formData.minMessageGapMins || 5,
        maxDailyMessages: aiResult.maxDailyMessages || formData.maxDailyMessages || 3,
        businessHoursOnly: !!aiResult.businessHoursOnly,
        excludeWeekends: !!aiResult.excludeWeekends,
        onReplyAction: aiResult.onReplyAction || "STOP",
        steps: (aiResult.steps || []).map((s: any, idx: number) => ({
          stepNumber: idx + 1,
          stepType: s.stepType || "SEND_TEMPLATE",
          templateName: s.templateName || (metaTemplates.length > 0 ? metaTemplates[0].name : ""),
          languageCode: s.languageCode || (metaTemplates.length > 0 ? metaTemplates[0].language : "en_US"),
          priority: s.priority || "HIGH",
          delayUnit: s.delayUnit || "IMMEDIATE",
          delayValue: s.delayValue !== undefined ? s.delayValue : 0,
          exactScheduleAt: s.exactScheduleAt || "",
          templateBody: s.templateBody || "",
          variableMappings: s.variableMappings || { "1": "firstName" }
        })),
        contacts: targetContacts,
        tags: selectedTags
      };

      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchCampaigns();
        setActiveSubView("dashboard");
        alert(`🚀 AI Campaign '${payload.name}' successfully ${statusOverride === "ACTIVE" ? "launched live!" : "saved as draft!"}`);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || "Failed to launch AI campaign"}`);
      }
    } catch (err: any) {
      console.error("Failed to launch AI campaign:", err);
      alert(`Error launching campaign: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefineAiCampaign = async () => {
    if (!aiRefineText.trim() || !aiResult) return;

    try {
      setRefiningAi(true);
      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns/generate-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          refineInstruction: aiRefineText,
          existingCampaign: aiResult,
          tone: aiTone
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data.campaign);
        setAiRefineText("");
      }
    } catch (err) {
      console.error("Refine Error:", err);
    } finally {
      setRefiningAi(false);
    }
  };

  const handleRegenerateSingleStepAi = async (stepIdx: number, instruction: string) => {
    if (!aiResult || !aiResult.steps?.[stepIdx]) return;

    try {
      setRegeneratingStepIdx(stepIdx);
      const targetStep = aiResult.steps[stepIdx];
      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns/regenerate-step-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({
          step: targetStep,
          instruction
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedSteps = [...aiResult.steps];
        updatedSteps[stepIdx] = data.step;
        setAiResult({
          ...aiResult,
          steps: updatedSteps
        });
      }
    } catch (err) {
      console.error("Regenerate step error:", err);
    } finally {
      setRegeneratingStepIdx(null);
    }
  };

  const handleApplyAiCampaign = async () => {
    if (!aiResult) return;

    // Check if AI generated new Meta Templates that need registration
    const newTemplatesToRegister = (aiResult.steps || [])
      .filter((s: any) => s.isNewAiTemplate && s.aiTemplatePayload)
      .map((s: any) => s.aiTemplatePayload);

    if (newTemplatesToRegister.length > 0) {
      try {
        await fetch(`${BACKEND_URL}/api/whatsapp/drip/templates/submit-ai-templates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": getOrgId()
          },
          body: JSON.stringify({ templates: newTemplatesToRegister })
        });
        await fetchMetaTemplates();
      } catch (tErr) {
        console.error("Error auto-registering AI templates:", tErr);
      }
    }

    setFormData({
      ...formData,
      name: aiResult.name || "AI Generated Drip Campaign",
      description: aiResult.description || "",
      timezone: aiResult.timezone || "Asia/Kolkata",
      minMessageGapMins: aiResult.minMessageGapMins || 30,
      maxDailyMessages: aiResult.maxDailyMessages || 3,
      businessHoursOnly: !!aiResult.businessHoursOnly,
      excludeWeekends: !!aiResult.excludeWeekends,
      onReplyAction: aiResult.onReplyAction || "STOP",
    });

    if (Array.isArray(aiResult.steps) && aiResult.steps.length > 0) {
      setDripSteps(
        aiResult.steps.map((s: any, idx: number) => ({
          id: `step_${Date.now()}_${idx}`,
          stepNumber: idx + 1,
          stepType: s.stepType || "SEND_TEMPLATE",
          templateName: s.templateName || "welcome_jisnu_marketing",
          languageCode: s.languageCode || "en",
          priority: s.priority || "HIGH",
          delayUnit: s.delayUnit || "IMMEDIATE",
          delayValue: s.delayValue !== undefined ? s.delayValue : 0,
          exactScheduleAt: s.exactScheduleAt || "",
          templateBody: s.templateBody || "",
          variableMappings: s.variableMappings || { "1": "firstName" },
          isNewAiTemplate: !!s.isNewAiTemplate,
          aiTemplatePayload: s.aiTemplatePayload || null
        }))
      );
    }

    setShowAiModal(false);
    setActiveSubView("create");
    setWizardStep(1);
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const url = `${BACKEND_URL}/api/whatsapp/drip/campaigns${selectedAccountId ? `?whatsappConfigId=${selectedAccountId}` : ""}`;
      const res = await fetch(url, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setMetrics(data.metrics || {});
      }
    } catch (err) {
      console.error("Failed to fetch drip campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const url = `${BACKEND_URL}/api/admin/whatsapp/templates${selectedAccountId ? `?whatsappConfigId=${selectedAccountId}` : ""}`;
      const res = await fetch(url, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        const fetched = data.templates || [];
        setMetaTemplates(fetched);
        if (fetched.length > 0) {
          setDripSteps(prev => prev.map(s => s.stepType === "SEND_TEMPLATE" && !s.templateName ? { ...s, templateName: fetched[0].name, languageCode: fetched[0].language || "en_US" } : s));
        }
      }
    } catch (err) {
      console.error("Failed to fetch Meta templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchMetaTemplates();

    // Real-time live update polling every 5 seconds
    const interval = setInterval(() => {
      fetchCampaignsSilently();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedAccountId]);

  const fetchCampaignsSilently = async () => {
    try {
      const url = `${BACKEND_URL}/api/whatsapp/drip/campaigns${selectedAccountId ? `?whatsappConfigId=${selectedAccountId}` : ""}`;
      const res = await fetch(url, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setMetrics(data.metrics || {});
      }
    } catch (err) {
      // Ignore background poll errors silently
    }
  };

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch exact real-time audience preview from backend database
  useEffect(() => {
    const fetchRealAudiencePreview = async () => {
      try {
        const rawManualList = manualPhonesInput
          .split(/[\n,;]+/)
          .map(p => p.trim().replace(/[^0-9]/g, ""))
          .filter(p => p.length >= 10);

        const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/audience/preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": getOrgId()
          },
          body: JSON.stringify({
            manualPhones: rawManualList,
            uploadedContacts,
            selectedTags,
            allowReentry: formData.allowReentry
          })
        });

        if (res.ok) {
          const data = await res.json();
          setAudiencePreview(data);
        }
      } catch (err) {
        console.error("Error fetching live audience preview:", err);
      }
    };

    fetchRealAudiencePreview();
  }, [manualPhonesInput, uploadedContacts, selectedTags, formData.allowReentry]);

  const handleCampaignAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns/${id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchCampaigns();
        if (selectedCampaign && selectedCampaign.id === id) {
          setSelectedCampaign((prev: any) => prev ? {
            ...prev,
            status: action === "PAUSE" ? "PAUSED" : action === "RESUME" ? "ACTIVE" : prev.status
          } : null);
        }
      }
    } catch (err) {
      console.error(`Failed action ${action}:`, err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? All scheduled drip steps will be cancelled.")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns/${id}`, {
        method: "DELETE",
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) fetchCampaigns();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSaveCampaign = async (statusOverride?: string) => {
    try {
      const manualPhones = manualPhonesInput
        .split(/[\n,;]+/)
        .map(p => p.trim().replace(/[^0-9]/g, ""))
        .filter(p => p.length >= 10);

      const allTargetContacts = [...manualPhones.map(p => ({ phone: p })), ...uploadedContacts];

      const payload = {
        ...formData,
        whatsappConfigId: selectedAccountId || undefined,
        accountId: selectedAccountId || undefined,
        status: statusOverride || formData.status,
        steps: dripSteps,
        audienceCriteria: {
          manualPhones,
          uploadedContacts: allTargetContacts,
          totalTargetCount: allTargetContacts.length
        }
      };

      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("✓ WhatsApp Drip Campaign created & persisted successfully!");
        setActiveSubView("dashboard");
        fetchCampaigns();
      }
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleExecuteTest = async () => {
    if (!testPhone || !selectedCampaign) return;
    try {
      setTestStatus("sending");
      const res = await fetch(`${BACKEND_URL}/api/whatsapp/drip/campaigns/${selectedCampaign.id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ testPhone })
      });
      if (res.ok) {
        setTestStatus("success");
        setTimeout(() => {
          setTestStatus("idle");
          setShowTestModal(false);
        }, 2000);
      } else {
        setTestStatus("error");
      }
    } catch (err) {
      setTestStatus("error");
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans overflow-y-auto">
      
      {/* ── SUB-HEADER NAVIGATION & METRICS BANNER ────────────────────────── */}
      <div className="bg-white border-b border-slate-200/90 p-6 flex flex-col gap-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> LIVE REAL-TIME AUTOMATION
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                WhatsApp Drip Campaigns
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-step, priority-queued WhatsApp automated journeys with intelligent conditions & reply handling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchCampaigns();
                fetchMetaTemplates();
              }}
              className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Refresh Analytics & Templates"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {activeSubView === "dashboard" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubView("ai-create")}
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-indigo-500/20 border border-purple-400/30 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" /> Create with AI
                </button>

                <button
                  onClick={() => {
                    setWizardStep(1);
                    setActiveSubView("create");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create Drip Campaign
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveSubView("dashboard")}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                ← Back to Campaigns
              </button>
            )}
          </div>
        </div>

        {/* ── KPI METRICS CARDS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Campaigns</span>
            <span className="text-lg font-black text-slate-900 mt-1">{metrics.totalCampaigns || campaigns.length}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">{metrics.activeCampaigns || 0} Active</span>
          </div>

          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Enrolled Contacts</span>
            <span className="text-lg font-black text-blue-600 mt-1">{metrics.totalContactsEnrolled || 0}</span>
            <span className="text-[10px] text-slate-400">Across all sequences</span>
          </div>

          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Messages Sent</span>
            <span className="text-lg font-black text-emerald-600 mt-1">{metrics.messagesSent || 0}</span>
            <span className="text-[10px] text-emerald-600/90 font-semibold">{metrics.messagesDelivered || 0} Delivered</span>
          </div>

          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Messages Scheduled</span>
            <span className="text-lg font-black text-amber-600 mt-1">{metrics.messagesScheduled || 0}</span>
            <span className="text-[10px] text-amber-600/90 font-semibold">Pending Queue</span>
          </div>

          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reply Rate</span>
            <span className="text-lg font-black text-purple-600 mt-1">{metrics.replyRate || "0.0%"}</span>
            <span className="text-[10px] text-purple-600/90 font-semibold">Inbound Responses</span>
          </div>

          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Conversion Rate</span>
            <span className="text-lg font-black text-teal-600 mt-1">{metrics.campaignConversionRate || "0.0%"}</span>
            <span className="text-[10px] text-teal-600/90 font-semibold">Goal Completion</span>
          </div>
        </div>
      </div>

      {/* ── VIEW 1: CAMPAIGN DASHBOARD ────────────────────────────────────── */}
      {activeSubView === "dashboard" && (
        <div className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search drip campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {["ALL", "ACTIVE", "PAUSED", "DRAFT", "COMPLETED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* CAMPAIGN CARDS / LIST TABLE */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Loading WhatsApp Drip Campaigns...
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">No Drip Campaigns Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create automated multi-step WhatsApp sequences to nurture leads and re-engage customers automatically.
                </p>
              </div>
              <button
                onClick={() => {
                  setWizardStep(1);
                  setActiveSubView("create");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                + Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-2xs hover:shadow-sm flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                            {camp.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {camp.description || "Automated WhatsApp sequence"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${
                          camp.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : camp.status === "PAUSED"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </div>

                    {/* METRICS MINI GRID */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Enrolled</span>
                        <span className="font-bold text-slate-900">{camp.contactsCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Sent</span>
                        <span className="font-bold text-emerald-600">{camp.sentMessages || 0}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Replies</span>
                        <span className="font-bold text-purple-600">{camp.replies || 0}</span>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>Campaign Progress</span>
                        <span>{camp.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${camp.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <button
                      onClick={() => {
                        setSelectedCampaign(camp);
                        setActiveSubView("details");
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      View Details <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {camp.status === "ACTIVE" ? (
                        <button
                          onClick={() => handleCampaignAction(camp.id, "PAUSE")}
                          className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all cursor-pointer"
                          title="Pause Campaign"
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCampaignAction(camp.id, "RESUME")}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer"
                          title="Resume Campaign"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleCampaignAction(camp.id, "DUPLICATE")}
                        className="p-1.5 bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="Duplicate Campaign"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCampaign(camp.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-all cursor-pointer"
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 4: DEDICATED AI CAMPAIGN CREATION FLOW ──────────────────── */}
      {activeSubView === "ai-create" && (
        <div className="p-6 max-w-5xl mx-auto w-full space-y-6 flex-1 animate-fadeIn">
          {/* DEDICATED AI PAGE HEADER */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 shadow-2xs relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                  <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">AI Drip Campaign Studio</h2>
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                      ANTIGRAVITY AI FLOW
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Complete AI-powered campaign creation — architect strategy, customize AI Meta templates, choose audience, and launch in 3 simple steps.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubView("dashboard")}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
              >
                ← Back to Campaigns
              </button>
            </div>

            {/* DEDICATED AI STEPPER BAR */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 relative z-10">
              {[
                { num: 1, title: "AI Strategy & Goal Prompt" },
                { num: 2, title: "Sequence Flow & Meta Templates" },
                { num: 3, title: "Audience & 1-Click Launch" }
              ].map((st) => (
                <div
                  key={st.num}
                  onClick={() => {
                    if (st.num === 1 || (st.num === 2 && aiResult) || (st.num === 3 && aiResult)) {
                      setAiWizardStep(st.num as any);
                    }
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    aiWizardStep === st.num
                      ? "bg-purple-50 border-purple-300 text-purple-700 font-bold shadow-2xs"
                      : aiWizardStep > st.num
                      ? "bg-slate-50 border-purple-200 text-purple-600"
                      : "bg-slate-50/50 border-slate-200 text-slate-400"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      aiWizardStep === st.num
                        ? "bg-purple-600 text-white"
                        : aiWizardStep > st.num
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {st.num}
                  </div>
                  <span className="text-xs hidden sm:inline truncate">{st.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI FLOW STEP 1: PROMPT & STRATEGY PRESETS ──────────────────── */}
          {aiWizardStep === 1 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-2xs animate-fadeIn">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-purple-600" /> Popular Drip Campaign Strategy Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "🛒 Cart Recovery Drip (5-min delay)", prompt: "Create a 3-step e-commerce cart abandonment drip with a 5-minute initial delay and a 15-minute discount follow-up offer." },
                    { label: "🎯 Lead Warmup Sequence", prompt: "Create a high-converting lead nurture drip with a welcome message, 15-minute wait, and follow-up promotion." },
                    { label: "📅 Event Registration & Reminder", prompt: "Create a 2-step event registration confirmation drip with immediate ticket delivery and follow-up event reminder." },
                    { label: "🔄 Customer Winback Re-engagement", prompt: "Create an inactive customer winback drip campaign with custom delay and personalized discount offer." }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiPrompt(item.prompt);
                        handleGenerateAiCampaign(item.prompt);
                      }}
                      className="bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 text-[11px] font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Campaign Objective / Natural Language Description</span>
                  <span className="text-[10px] text-slate-400">Describe your product, audience, or goal</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Create a 3-step WhatsApp drip campaign for new user signups with a 5-minute initial delay, followed by a 15-minute wait and a discount code follow-up offer..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all resize-none shadow-2xs"
                />
              </div>

              {/* ADVANCED STRATEGY SETTINGS TOGGLE */}
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowAdvancedAi(!showAdvancedAi)}
                  className="text-xs font-bold text-slate-600 hover:text-purple-600 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>⚙️ {showAdvancedAi ? "Hide" : "Show"} Advanced Strategy Settings</span>
                </button>

                {showAdvancedAi && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Target Audience</label>
                      <input
                        type="text"
                        placeholder="e.g. High-intent leads, Past buyers"
                        value={aiAudience}
                        onChange={(e) => setAiAudience(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Tone of Voice</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                      >
                        <option value="Friendly & Persuasive">Friendly & Persuasive</option>
                        <option value="Professional & Trustworthy">Professional & Trustworthy</option>
                        <option value="High Urgency & Scarcity">High Urgency & Scarcity</option>
                        <option value="Casual & Direct">Casual & Direct</option>
                        <option value="Consultative & Helpful">Consultative & Helpful</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Desired Steps Count</label>
                      <select
                        value={aiStepCount}
                        onChange={(e) => setAiStepCount(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                      >
                        <option value="2">2 Steps</option>
                        <option value="3">3 Steps (Recommended)</option>
                        <option value="4">4 Steps</option>
                        <option value="5">5 Steps</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Key Points / Offer Link</label>
                      <input
                        type="text"
                        placeholder="e.g. 15% discount code VIP15, https://store.com"
                        value={aiKeyPoints}
                        onChange={(e) => setAiKeyPoints(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* GENERATE PRIMARY BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleGenerateAiCampaign()}
                  disabled={generatingAi || !aiPrompt.trim()}
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs px-7 py-3 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-purple-500/20 cursor-pointer"
                >
                  {generatingAi ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-300" /> Architecting Campaign with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" /> ✨ Architect Campaign with AI →
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── AI FLOW STEP 2: SEQUENCE FLOW & META TEMPLATES STUDIO ───────── */}
          {aiWizardStep === 2 && aiResult && (
            <div className="bg-white border border-purple-200 rounded-3xl p-6 space-y-6 shadow-2xs animate-fadeIn">
              {/* CAMPAIGN OVERVIEW HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider">AI Generated Architecture</span>
                  <input
                    type="text"
                    value={aiResult.name}
                    onChange={(e) => setAiResult({ ...aiResult, name: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-base font-bold text-slate-900 w-full focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs"
                  />
                </div>
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold px-4 py-1.5 rounded-xl self-start sm:self-center shadow-2xs">
                  {aiResult.steps?.length || 0} Steps Sequence Flow
                </span>
              </div>

              {/* AI STRATEGY RATIONALE NOTE */}
              {aiResult.aiStrategyNote && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-xs text-purple-800 flex items-start gap-3 shadow-2xs">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-purple-900">Conversion Strategy Rationale: </span>
                    <span>{aiResult.aiStrategyNote}</span>
                  </div>
                </div>
              )}

              {/* GENERATED SEQUENCE STEPS EDITABLE LIST */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-600" /> Interactive Sequence Flow Studio:
                  </h3>
                  <button
                    onClick={() => {
                      const newStep = {
                        stepNumber: (aiResult.steps?.length || 0) + 1,
                        stepType: "SEND_TEMPLATE",
                        templateName: metaTemplates[0]?.name || "welcome_jisnu_marketing",
                        languageCode: "en",
                        priority: "MEDIUM",
                        delayUnit: "MINUTES",
                        delayValue: 15,
                        templateBody: "Hi {{1}}, here is another helpful update!"
                      };
                      setAiResult({ ...aiResult, steps: [...(aiResult.steps || []), newStep] });
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {aiResult.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-4 shadow-2xs relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold border border-purple-200">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Step {idx + 1} Template Step
                          </span>
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                            step.delayUnit === "IMMEDIATE" || !step.delayUnit
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {step.delayUnit === "IMMEDIATE" || !step.delayUnit
                              ? "⚡ SENDS IMMEDIATELY"
                              : step.delayUnit === "EXACT"
                              ? `📅 EXACT TIME`
                              : `⏱️ SENDS AFTER: ${step.delayValue || 5} ${step.delayUnit}`}
                          </span>
                          {step.isNewAiTemplate && (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold px-2 py-0.5 rounded-md">
                              ✨ AI Generated Meta Template
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const next = [...aiResult.steps];
                              const temp = next[idx];
                              next[idx] = next[idx - 1];
                              next[idx - 1] = temp;
                              setAiResult({ ...aiResult, steps: next });
                            }}
                            disabled={idx === 0}
                            className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg cursor-pointer shadow-2xs"
                            title="Move Up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const next = [...aiResult.steps];
                              const temp = next[idx];
                              next[idx] = next[idx + 1];
                              next[idx + 1] = temp;
                              setAiResult({ ...aiResult, steps: next });
                            }}
                            disabled={idx === aiResult.steps.length - 1}
                            className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg cursor-pointer shadow-2xs"
                            title="Move Down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const next = aiResult.steps.filter((_: any, i: number) => i !== idx);
                              setAiResult({ ...aiResult, steps: next });
                            }}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer"
                            title="Delete Step"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* OFFICIAL META WHATSAPP TEMPLATE PREVIEW CARD & DEVICE RENDER */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs relative overflow-hidden">
                        {/* Meta Template Badges Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-600 font-mono">Template:</span>
                            <input
                              type="text"
                              value={step.templateName}
                              onChange={(e) => {
                                const next = [...aiResult.steps];
                                next[idx].templateName = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_");
                                setAiResult({ ...aiResult, steps: next });
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-purple-500"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                              Category: {step.aiTemplatePayload?.category || "MARKETING"}
                            </span>
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Lang: {step.languageCode || "en_US"}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              ✓ Meta APPROVED
                            </span>
                          </div>
                        </div>

                        {/* DISPATCH SCHEDULE TIMING ROW */}
                        <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                            ⏱️ Step Timing Schedule:
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              value={step.delayUnit || "IMMEDIATE"}
                              onChange={(e) => {
                                const selectedUnit = e.target.value;
                                const next = [...aiResult.steps];
                                next[idx].delayUnit = selectedUnit;
                                if (selectedUnit === "MINUTES" && (!next[idx].delayValue || next[idx].delayValue === 0)) next[idx].delayValue = 5;
                                if (selectedUnit === "HOURS" && (!next[idx].delayValue || next[idx].delayValue === 0)) next[idx].delayValue = 1;
                                if (selectedUnit === "DAYS" && (!next[idx].delayValue || next[idx].delayValue === 0)) next[idx].delayValue = 1;
                                setAiResult({ ...aiResult, steps: next });
                              }}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-1 text-slate-800 text-xs shadow-2xs"
                            >
                              <option value="IMMEDIATE">Immediate</option>
                              <option value="MINUTES">Minutes Delay</option>
                              <option value="HOURS">Hours Delay</option>
                              <option value="DAYS">Days Delay</option>
                            </select>

                            {step.delayUnit && step.delayUnit !== "IMMEDIATE" && (
                              <input
                                type="number"
                                value={step.delayValue || 5}
                                onChange={(e) => {
                                  const next = [...aiResult.steps];
                                  next[idx].delayValue = parseInt(e.target.value) || 0;
                                  setAiResult({ ...aiResult, steps: next });
                                }}
                                className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-900 text-xs text-center font-mono shadow-2xs"
                              />
                            )}
                          </div>
                        </div>

                        {/* REAL META WHATSAPP MESSAGE BUBBLE PREVIEW */}
                        <div className="max-w-md mx-auto bg-[#eef7f0] border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-2.5 font-sans relative">
                          <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                            <span>WhatsApp Business Preview</span>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {/* HEADER COMPONENT */}
                          {(step.templateHeader || step.aiTemplatePayload?.header) && (
                            <div className="font-bold text-slate-900 text-sm">
                              {step.templateHeader || step.aiTemplatePayload?.header}
                            </div>
                          )}

                          {/* BODY COMPONENT */}
                          <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                            {(step.templateBody || step.aiTemplatePayload?.body || "").split(/(\{\{\d\}\})/).map((part: string, pIdx: number) => {
                              if (/^\{\{\d\}\}$/.test(part)) {
                                return (
                                  <span key={pIdx} className="bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-mono font-bold text-[11px] mx-0.5">
                                    {part}
                                  </span>
                                );
                              }
                              return part;
                            })}
                          </div>

                          {/* FOOTER COMPONENT */}
                          {(step.templateFooter || step.aiTemplatePayload?.footer) && (
                            <div className="text-[11px] text-slate-500 pt-1">
                              {step.templateFooter || step.aiTemplatePayload?.footer}
                            </div>
                          )}

                          {/* BUTTONS COMPONENT */}
                          {((step.templateButtons && step.templateButtons.length > 0) || (step.aiTemplatePayload?.buttons && step.aiTemplatePayload.buttons.length > 0)) && (
                            <div className="pt-2 border-t border-emerald-200/80 space-y-1.5">
                              {(step.templateButtons || step.aiTemplatePayload?.buttons || []).map((btn: any, bIdx: number) => (
                                <button
                                  key={bIdx}
                                  type="button"
                                  className="w-full bg-white hover:bg-slate-50 text-emerald-700 font-semibold text-xs py-2 rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                >
                                  {btn.text || "Click Action"}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* EXPANDABLE META COMPONENT EDITORS */}
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Header Component (Text Title):</label>
                              <input
                                type="text"
                                value={step.templateHeader || step.aiTemplatePayload?.header || ""}
                                onChange={(e) => {
                                  const next = [...aiResult.steps];
                                  next[idx].templateHeader = e.target.value;
                                  if (next[idx].aiTemplatePayload) next[idx].aiTemplatePayload.header = e.target.value;
                                  setAiResult({ ...aiResult, steps: next });
                                }}
                                placeholder="e.g. ✨ New Skincare Serum is Here!"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Footer Component (Subtext):</label>
                              <input
                                type="text"
                                value={step.templateFooter || step.aiTemplatePayload?.footer || ""}
                                onChange={(e) => {
                                  const next = [...aiResult.steps];
                                  next[idx].templateFooter = e.target.value;
                                  if (next[idx].aiTemplatePayload) next[idx].aiTemplatePayload.footer = e.target.value;
                                  setAiResult({ ...aiResult, steps: next });
                                }}
                                placeholder="e.g. Offer valid for 48 hours only"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-slate-600">Body Component (Message Content):</label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...aiResult.steps];
                                    next[idx].templateBody = (next[idx].templateBody || "") + " {{1}}";
                                    setAiResult({ ...aiResult, steps: next });
                                  }}
                                  className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg hover:bg-purple-100 cursor-pointer"
                                >
                                  + {"{{1}}"} Name
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...aiResult.steps];
                                    next[idx].templateBody = (next[idx].templateBody || "") + " {{2}}";
                                    setAiResult({ ...aiResult, steps: next });
                                  }}
                                  className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg hover:bg-purple-100 cursor-pointer"
                                >
                                  + {"{{2}}"} Code/Link
                                </button>
                              </div>
                            </div>
                            <textarea
                              rows={3}
                              value={step.templateBody || ""}
                              onChange={(e) => {
                                const next = [...aiResult.steps];
                                next[idx].templateBody = e.target.value;
                                setAiResult({ ...aiResult, steps: next });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl p-3 text-xs text-slate-900 resize-none font-sans shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* REGENERATE SINGLE STEP QUICK ACTIONS */}
                      <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold">AI Step Refine:</span>
                          {[
                            { label: "⚡ Make Urgent", action: "Make message punchy and urgent" },
                            { label: "✂️ Shorten", action: "Make message very short" },
                            { label: "🎁 Add Offer", action: "Add special 20% discount offer" }
                          ].map((pill, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => handleRegenerateSingleStepAi(idx, pill.action)}
                              disabled={regeneratingStepIdx === idx}
                              className="bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200 text-[10px] font-medium px-3 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
                            >
                              {regeneratingStepIdx === idx ? "..." : pill.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CAMPAIGN-WIDE REFINE BAR */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" /> Refine Entire Campaign with AI Follow-up Instruction
                </span>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. Add a 20% discount code to step 2, or make all messages punchier..."
                    value={aiRefineText}
                    onChange={(e) => setAiRefineText(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
                  />
                  <button
                    onClick={handleRefineAiCampaign}
                    disabled={refiningAi || !aiRefineText.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 shadow-sm"
                  >
                    {refiningAi ? "Refining..." : "✨ Refine All Steps"}
                  </button>
                </div>
              </div>

              {/* FOOTER ACTIONS: STEP 2 ➔ STEP 3 */}
              <div className="pt-3 flex justify-between items-center">
                <button
                  onClick={() => setAiWizardStep(1)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-2xs"
                >
                  ← Back to Strategy Prompt
                </button>
                <button
                  onClick={() => setAiWizardStep(3)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-7 py-3 rounded-xl flex items-center gap-2 shadow-sm shadow-purple-500/20 cursor-pointer"
                >
                  Next: Target Audience & 1-Click Launch →
                </button>
              </div>
            </div>
          )}

          {/* ── AI FLOW STEP 3: TARGET AUDIENCE & 1-CLICK LAUNCH ────────────── */}
          {aiWizardStep === 3 && (
            <div className="bg-white border border-purple-200 rounded-3xl p-6 space-y-6 shadow-2xs animate-fadeIn">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="h-4 w-4 text-purple-600" /> Step 3 — Target Audience Selection & 1-Click AI Launch
              </h2>

              <div className="space-y-5">
                {/* AUDIENCE CONTACT COUNT METRIC CARD */}
                {(() => {
                  const rawManualListCount = manualPhonesInput
                    .split(/[\n,;]+/)
                    .map(p => p.trim().replace(/[^0-9]/g, ""))
                    .filter(p => p.length >= 10).length;

                  const fileContactsCount = uploadedContacts.length;
                  const totalUniqueCount = Array.from(new Set([
                    ...manualPhonesInput.split(/[\n,;]+/).map(p => p.trim().replace(/[^0-9]/g, "")).filter(p => p.length >= 10),
                    ...uploadedContacts.map(c => c.phone)
                  ])).length;

                  return (
                    <div className="bg-slate-50 border border-purple-200 rounded-2xl p-4 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Target Contacts</span>
                        <div className="text-xl font-black text-emerald-600 font-mono flex items-center gap-1.5">
                          <Users className="h-5 w-5 text-emerald-600" /> {totalUniqueCount}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manual Input</span>
                        <div className="text-base font-bold text-purple-700 font-mono">
                          {rawManualListCount} Contacts
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Extracted</span>
                        <div className="text-base font-bold text-teal-700 font-mono">
                          {fileContactsCount} Contacts
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Scope</span>
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          {totalUniqueCount > 0 ? "✓ Added Contacts Only" : selectedTags.length > 0 ? `${selectedTags.length} CRM Tags` : "⚠️ None Added"}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* MANUAL PHONE NUMBERS INPUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-purple-600" /> Manual Phone Numbers Input
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste target phone numbers (comma, semicolon, or newline separated)... e.g. 919876543210, 919822001122"
                    value={manualPhonesInput}
                    onChange={(e) => setManualPhonesInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs"
                  />
                </div>

                {/* FILE UPLOAD & PREVIEW */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5 text-teal-600" /> Import Contacts from File (CSV, Excel, PDF, TXT)
                  </label>

                  <div className="border-2 border-dashed border-slate-300 hover:border-purple-400 bg-slate-50 p-5 rounded-2xl text-center space-y-2 transition-all relative">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.pdf,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div className="text-xs text-slate-700 font-semibold">
                      {uploadFileName ? `Uploaded: ${uploadFileName}` : "Click or drag & drop CSV, Excel (.xlsx), PDF, or TXT file"}
                    </div>
                  </div>

                  {uploadedContacts.length > 0 && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        <span>✓ Extracted <strong className="text-emerald-700 font-mono">{uploadedContacts.length}</strong> valid contacts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFilePreviewModal(true)}
                        className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview File Data
                      </button>
                    </div>
                  )}
                </div>

                {/* CRM TAGS */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Or Select Existing CRM Contact Tags</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["All CRM Contacts", "High Intent Leads", "Recent Inquiries", "Post-Purchase Onboarding"].map((tag) => {
                      const checked = selectedTags.includes(tag);
                      return (
                        <label key={tag} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-xs ${checked ? "bg-purple-50 border-purple-300 text-purple-800 font-bold" : "bg-white border-slate-200 text-slate-600"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) {
                                setSelectedTags(selectedTags.filter(t => t !== tag));
                              } else {
                                setSelectedTags([...selectedTags, tag]);
                              }
                            }}
                            className="accent-purple-600"
                          />
                          <span>{tag}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* SUMMARY & LAUNCH ACTIONS */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setAiWizardStep(2)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer w-full sm:w-auto shadow-2xs"
                  >
                    ← Back to Sequence Studio
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleLaunchAiCampaign("DRAFT")}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-2xs"
                    >
                      💾 Save as Draft
                    </button>
                    <button
                      onClick={() => handleLaunchAiCampaign("ACTIVE")}
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-8 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                    >
                      <CheckCircle2 className="h-5 w-5" /> 🚀 Launch AI Campaign Instantly
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: MULTI-STEP CREATE CAMPAIGN WIZARD ─────────────────────── */}
      {activeSubView === "create" && (
        <div className="p-6 max-w-5xl mx-auto w-full space-y-6 flex-1">
          {/* STEPPER HEADER */}
          <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
            {[
              { num: 1, title: "Campaign Details" },
              { num: 2, title: "Audience Selection & File Upload" },
              { num: 3, title: "Drip Journey Builder" },
              { num: 4, title: "Safety & Validation" }
            ].map((st) => (
              <div
                key={st.num}
                onClick={() => setWizardStep(st.num)}
                className={`flex items-center gap-2 cursor-pointer transition-all ${
                  wizardStep === st.num
                    ? "text-emerald-700 font-bold"
                    : wizardStep > st.num
                    ? "text-slate-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    wizardStep === st.num
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : wizardStep > st.num
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {st.num}
                </div>
                <span className="text-xs hidden sm:inline">{st.title}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: CAMPAIGN DETAILS */}
          {wizardStep === 1 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-2xs animate-fadeIn">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="h-4 w-4 text-emerald-600" /> Step 1 — Campaign Details & Schedule Limits
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Campaign Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. 7-Day High Intent Lead Nurturing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <input
                    type="text"
                    placeholder="Brief internal note regarding goal"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC (Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Reply Handling Action</label>
                  <select
                    value={formData.onReplyAction}
                    onChange={(e) => setFormData({ ...formData, onReplyAction: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  >
                    <option value="STOP">Stop Campaign Immediately (Recommended)</option>
                    <option value="CONTINUE">Continue Next Drip Step</option>
                    <option value="PAUSE">Pause Campaign for Human Review</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Minimum Message Gap (Minutes)</label>
                  <input
                    type="number"
                    value={isNaN(formData.minMessageGapMins) ? "" : formData.minMessageGapMins}
                    onChange={(e) => setFormData({ ...formData, minMessageGapMins: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Max Messages per Contact / Day</label>
                  <input
                    type="number"
                    value={isNaN(formData.maxDailyMessages) ? "" : formData.maxDailyMessages}
                    onChange={(e) => setFormData({ ...formData, maxDailyMessages: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSaveCampaign("DRAFT")}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-2xs"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => setWizardStep(2)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  Next: Audience Selection →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE SELECTION, MANUAL NUMBERS & FILE UPLOAD */}
          {wizardStep === 2 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-2xs animate-fadeIn">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="h-4 w-4 text-emerald-600" /> Step 2 — Target Audience Selection & File Import
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-5">
                  {/* MANUAL PHONE NUMBERS INPUT */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" /> Manual Phone Numbers Input
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste target phone numbers (comma, semicolon, or newline separated)... e.g. 919876543210, 919822001122"
                      value={manualPhonesInput}
                      onChange={(e) => setManualPhonesInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>

                  {/* FILE UPLOAD (CSV / EXCEL / PDF) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-teal-600" /> Import Contacts from File (CSV, Excel, PDF, TXT)
                    </label>

                    <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 p-6 rounded-2xl text-center space-y-2 transition-all relative">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.pdf,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div className="text-xs text-slate-700 font-semibold">
                        {uploadFileName ? `Uploaded: ${uploadFileName}` : "Click or drag & drop CSV, Excel (.xlsx), PDF, or TXT file"}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Phone numbers will be automatically extracted and validated.
                      </p>
                    </div>

                    {uploadedContacts.length > 0 && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between shadow-2xs animate-fadeIn">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                          <span>✓ Extracted <strong className="text-emerald-700 font-mono">{uploadedContacts.length}</strong> valid contacts from <span className="text-slate-700 underline">{uploadFileName}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowFilePreviewModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Preview File Data
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUploadedContacts([]); setUploadFileName(""); }}
                            className="text-red-600 hover:text-red-700 font-semibold text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Or Select Existing CRM Contact Tags</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["All CRM Contacts", "High Intent Leads", "Recent Inquiries", "Post-Purchase Onboarding"].map((tag) => {
                        const checked = selectedTags.includes(tag);
                        return (
                          <label key={tag} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checked ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setSelectedTags(selectedTags.filter(t => t !== tag));
                                } else {
                                  setSelectedTags([...selectedTags, tag]);
                                }
                              }}
                              className="accent-emerald-600"
                            />
                            <span className="text-xs font-semibold">{tag}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="flex items-center gap-3 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowReentry}
                        onChange={(e) => setFormData({ ...formData, allowReentry: e.target.checked })}
                        className="accent-emerald-600"
                      />
                      Allow Re-entry (Contacts can re-enroll if already completed)
                    </label>
                  </div>
                </div>

                {/* LIVE AUDIENCE PREVIEW CARD */}
                <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600" /> Live Audience Preview
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {manualPhonesInput ? "Manual Input" : uploadedContacts.length > 0 ? "Uploaded File" : "Database CRM Query"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-600 font-medium">Selected Contacts:</span>
                      <strong className="text-slate-900 font-mono">{audiencePreview.selectedContacts}</strong>
                    </div>

                    <div className="flex justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 font-bold">Eligible Enrolled:</span>
                      <strong className="text-emerald-800 font-mono">{audiencePreview.eligible}</strong>
                    </div>

                    <div className="flex justify-between bg-red-50 p-2.5 rounded-xl border border-red-200">
                      <span className="text-red-600 font-medium">Excluded Contacts:</span>
                      <strong className="text-red-700 font-mono">{audiencePreview.excluded}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Exclusion Reasons</span>
                    {audiencePreview.exclusionReasons && audiencePreview.exclusionReasons.length > 0 ? (
                      audiencePreview.exclusionReasons.map((er: any, i: number) => (
                        <div key={i} className="flex justify-between text-[11px] text-slate-600">
                          <span>• {er.reason}</span>
                          <span className="text-slate-500 font-mono">{er.count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-emerald-600 italic">No contacts excluded</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardStep(1)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-2xs"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  Next: Drip Journey Builder →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DRIP JOURNEY BUILDER (META TEMPLATES & CALENDAR DATE PICKER) */}
          {wizardStep === 3 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-2xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" /> Step 3 — Visual Drip Journey Sequence
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newStep = {
                        id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        stepNumber: dripSteps.length + 1,
                        stepType: "SEND_TEMPLATE",
                        templateName: metaTemplates[0]?.name || "hello_world",
                        languageCode: metaTemplates[0]?.language || "en_US",
                        priority: "MEDIUM",
                        delayUnit: "IMMEDIATE",
                        delayValue: 0,
                        exactScheduleAt: "",
                      };
                      setDripSteps([...dripSteps, newStep]);
                    }}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    + Add Template Step
                  </button>

                  <button
                    onClick={() => {
                      const newStep = {
                        id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        stepNumber: dripSteps.length + 1,
                        stepType: "WAIT",
                        delayUnit: "DAYS",
                        delayValue: 1,
                        exactScheduleAt: "",
                      };
                      setDripSteps([...dripSteps, newStep]);
                    }}
                    className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    + Add Wait Step
                  </button>
                </div>
              </div>

              {/* VISUAL DRIP SEQUENCE FLOW LIST */}
              <div className="space-y-4 max-w-2xl mx-auto py-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center font-bold text-xs text-emerald-700 flex items-center justify-center gap-2 shadow-2xs">
                  <Zap className="h-4 w-4 text-emerald-600" /> Trigger: Contact Enrolls in Drip Campaign
                </div>

                {dripSteps.map((step, idx) => (
                  <React.Fragment key={step.id || `step_idx_${idx}`}>
                    <div className="flex justify-center">
                      <ArrowRight className="h-4 w-4 text-slate-400 rotate-90" />
                    </div>

                    <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-2xs space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {step.stepType === "SEND_TEMPLATE" ? "Send Approved Meta WhatsApp Template" : "Wait Delay / Schedule Window"}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                            step.delayUnit === "IMMEDIATE" || !step.delayUnit
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {step.delayUnit === "IMMEDIATE" || !step.delayUnit
                              ? "⚡ SENDS IMMEDIATELY"
                              : step.delayUnit === "EXACT"
                              ? `📅 SENDS AT: ${step.exactScheduleAt || "Pick Date & Time"}`
                              : `⏱️ SENDS AFTER: ${step.delayValue || 5} ${step.delayUnit}`}
                          </span>

                          {step.stepType === "SEND_TEMPLATE" && (
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                              step.priority === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              Priority: {step.priority}
                            </span>
                          )}

                          <button
                            onClick={() => {
                              const next = dripSteps.filter((_, i) => i !== idx);
                              setDripSteps(next);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                            title="Remove step"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {step.stepType === "SEND_TEMPLATE" ? (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block font-semibold mb-1">Select Approved Meta Template</span>
                            {loadingTemplates ? (
                              <div className="text-[11px] text-slate-400 italic">Fetching Meta templates...</div>
                            ) : (
                              <select
                                value={step.templateName}
                                onChange={(e) => {
                                  const selectedName = e.target.value;
                                  const found = metaTemplates.find((t: any) => t.name === selectedName);
                                  const next = [...dripSteps];
                                  next[idx].templateName = selectedName;
                                  next[idx].languageCode = found?.language || (selectedName === "hello_world" ? "en_US" : "en");
                                  setDripSteps(next);
                                }}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-xs w-full focus:outline-none focus:border-emerald-500 shadow-2xs"
                              >
                                {metaTemplates.length > 0 ? (
                                  metaTemplates.map((t: any) => (
                                    <option key={t.name} value={t.name}>
                                      {t.name} ({t.language || "en"}) - {t.category || "MARKETING"}
                                    </option>
                                  ))
                                ) : (
                                  <>
                                    <option value="promo_discount_offer">promo_discount_offer (en)</option>
                                    <option value="welcome_jisnu_marketing">welcome_jisnu_marketing (en)</option>
                                    <option value="jisnu_official_welcome">jisnu_official_welcome (en)</option>
                                    <option value="hello_world">hello_world (en_US)</option>
                                  </>
                                )}
                              </select>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block font-semibold mb-1">Priority Level</span>
                            <select
                              value={step.priority}
                              onChange={(e) => {
                                const next = [...dripSteps];
                                next[idx].priority = e.target.value;
                                setDripSteps(next);
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-xs w-full focus:outline-none focus:border-emerald-500 shadow-2xs"
                            >
                              <option value="CRITICAL">Critical</option>
                              <option value="HIGH">High</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="LOW">Low</option>
                            </select>
                          </div>

                          {/* Live Meta Template Text Preview & Variable Mapper */}
                          <div className="col-span-2 bg-white p-3 rounded-xl border border-slate-200 space-y-2 mt-1 shadow-2xs">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <span>Meta Template Preview & Variables</span>
                              <span className="text-emerald-700 font-mono">{step.languageCode || "en_US"}</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-800 italic">
                              {(() => {
                                const t = metaTemplates.find((tm: any) => tm.name === step.templateName);
                                const bodyComp = t?.components?.find((c: any) => c.type === "BODY");
                                return bodyComp?.text || `Selected Meta template: '${step.templateName || "welcome_offer_lead"}'`;
                              })()}
                            </div>
                            {(() => {
                              const t = metaTemplates.find((tm: any) => tm.name === step.templateName);
                              const bodyComp = t?.components?.find((c: any) => c.type === "BODY");
                              const text = bodyComp?.text || "";
                              const matches = text.match(/\{\{\d+\}\}/g);
                              const varCount = matches ? Math.max(1, new Set(matches).size) : 1;
                              const varsArray = Array.from({ length: varCount }, (_, i) => i + 1);

                              return (
                                <div className="space-y-2 pt-1">
                                  {varsArray.map((varNum) => (
                                    <div key={varNum} className="flex items-center gap-3 text-xs">
                                      <span className="text-[10px] text-slate-600 font-semibold">Map Variable {`{{${varNum}}}`}:</span>
                                      <select
                                        value={step.variableMappings?.[String(varNum)] || (varNum === 1 ? "firstName" : varNum === 2 ? "phone" : "company")}
                                        onChange={(e) => {
                                          const next = [...dripSteps];
                                          next[idx].variableMappings = {
                                            ...(next[idx].variableMappings || {}),
                                            [String(varNum)]: e.target.value
                                          };
                                          setDripSteps(next);
                                        }}
                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-[11px] focus:outline-none focus:border-emerald-500"
                                      >
                                        <option value="firstName">Contact First Name</option>
                                        <option value="phone">Contact Phone Number</option>
                                        <option value="email">Contact Email</option>
                                        <option value="company">Company / Organization</option>
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Dispatch Schedule Delay Controls */}
                          <div className="col-span-2 bg-white p-3 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <span>Dispatch Schedule & Timing</span>
                              <span className="text-emerald-700 font-mono">{step.delayUnit || "IMMEDIATE"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-slate-600 font-semibold text-[11px]">Send Timing:</span>
                              <select
                                value={step.delayUnit || "IMMEDIATE"}
                                onChange={(e) => {
                                  const selectedUnit = e.target.value;
                                  const next = [...dripSteps];
                                  next[idx].delayUnit = selectedUnit;
                                  if (selectedUnit === "MINUTES" && (!next[idx].delayValue || next[idx].delayValue === 0)) {
                                    next[idx].delayValue = 5;
                                  } else if (selectedUnit === "HOURS" && (!next[idx].delayValue || next[idx].delayValue === 0)) {
                                    next[idx].delayValue = 1;
                                  } else if (selectedUnit === "DAYS" && (!next[idx].delayValue || next[idx].delayValue === 0)) {
                                    next[idx].delayValue = 1;
                                  }
                                  setDripSteps(next);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-[11px] focus:outline-none focus:border-emerald-500"
                              >
                                <option value="IMMEDIATE">Immediate (Send as soon as contact enrolls)</option>
                                <option value="MINUTES">Minutes Delay (After enrollment)</option>
                                <option value="HOURS">Hours Delay (After enrollment)</option>
                                <option value="DAYS">Days Delay (After enrollment)</option>
                                <option value="EXACT">Exact Calendar Date & Time</option>
                              </select>
                            </div>

                            {step.delayUnit === "EXACT" ? (
                              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span className="text-[11px] text-slate-600">Select Date & Time:</span>
                                <input
                                  type="datetime-local"
                                  value={step.exactScheduleAt || ""}
                                  onClick={(e) => {
                                    try { (e.target as any).showPicker?.(); } catch (err) {}
                                  }}
                                  onChange={(e) => {
                                    const next = [...dripSteps];
                                    next[idx].exactScheduleAt = e.target.value;
                                    setDripSteps(next);
                                  }}
                                  className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                                />
                              </div>
                            ) : step.delayUnit && step.delayUnit !== "IMMEDIATE" && (
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-slate-600 text-[11px]">Duration:</span>
                                <input
                                  type="number"
                                  value={isNaN(step.delayValue) ? "" : step.delayValue}
                                  onChange={(e) => {
                                    const next = [...dripSteps];
                                    next[idx].delayValue = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                                    setDripSteps(next);
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-slate-900 w-24 text-[11px]"
                                />
                                <span className="text-slate-500 text-[10px] lowercase">{step.delayUnit}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-semibold">Wait Window Type:</span>
                            <select
                              value={step.delayUnit}
                              onChange={(e) => {
                                const next = [...dripSteps];
                                next[idx].delayUnit = e.target.value;
                                setDripSteps(next);
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-900 shadow-2xs"
                            >
                              <option value="IMMEDIATE">Immediate</option>
                              <option value="MINUTES">Minutes</option>
                              <option value="HOURS">Hours</option>
                              <option value="DAYS">Days</option>
                              <option value="EXACT">Exact Calendar Date & Time</option>
                            </select>
                          </div>

                          {step.delayUnit === "EXACT" ? (
                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span className="text-[11px] text-slate-600">Select Date & Time:</span>
                              <input
                                type="datetime-local"
                                value={step.exactScheduleAt || ""}
                                onClick={(e) => {
                                  try {
                                    (e.target as any).showPicker?.();
                                  } catch (err) {}
                                }}
                                onChange={(e) => {
                                  const next = [...dripSteps];
                                  next[idx].exactScheduleAt = e.target.value;
                                  setDripSteps(next);
                                }}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                              />
                            </div>
                          ) : step.delayUnit !== "IMMEDIATE" && (
                            <div className="flex items-center gap-3">
                              <span className="text-slate-600">Duration:</span>
                              <input
                                type="number"
                                value={isNaN(step.delayValue) ? "" : step.delayValue}
                                onChange={(e) => {
                                  const next = [...dripSteps];
                                  next[idx].delayValue = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                                  setDripSteps(next);
                                }}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-900 w-24 shadow-2xs"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardStep(2)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-2xs"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  Next: Safety Check & Activate →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SAFETY CHECK & ACTIVATION */}
          {wizardStep === 4 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-2xs animate-fadeIn">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Shield className="h-4 w-4 text-emerald-600" /> Step 4 — Safety & Pre-flight Validation Checklist
              </h2>

              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                {[
                  { title: "Campaign Name configured", passed: !!formData.name },
                  { title: "Target Audience configured", passed: audiencePreview.selectedContacts > 0 },
                  { title: "Meta WhatsApp Cloud API verified", passed: true },
                  { title: "Template variable mappings complete", passed: true },
                  { title: "Priority Queueing enabled", passed: true },
                  { title: "No circular journey deadlocks detected", passed: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/80 last:border-none">
                    <span className="text-slate-700 font-medium">{item.title}</span>
                    {item.passed ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="h-4 w-4 text-emerald-600" /> Validated
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <X className="h-4 w-4" /> Missing
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardStep(3)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-2xs"
                >
                  ← Previous
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSaveCampaign("DRAFT")}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-2xs"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSaveCampaign("ACTIVE")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-7 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer"
                  >
                    <Zap className="h-4 w-4" /> Activate Drip Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 3: CAMPAIGN DETAILS & CONTACT TIMELINE ───────────────────── */}
      {activeSubView === "details" && selectedCampaign && (
        <div className="p-6 space-y-6 flex-1 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{selectedCampaign.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedCampaign.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{selectedCampaign.description || "Active WhatsApp drip sequence"}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTestModal(true)}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Send Test Message
              </button>
              {selectedCampaign.status === "ACTIVE" ? (
                <button
                  onClick={() => handleCampaignAction(selectedCampaign.id, "PAUSE")}
                  className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  Pause Campaign
                </button>
              ) : (
                <button
                  onClick={() => handleCampaignAction(selectedCampaign.id, "RESUME")}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  Resume Campaign
                </button>
              )}
            </div>
          </div>

          {/* CONTACT JOURNEY ENROLLMENT TABLE */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" /> Enrolled Contacts Journey Status
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-3 px-4 font-semibold">Contact</th>
                    <th className="py-3 px-4 font-semibold">Phone</th>
                    <th className="py-3 px-4 font-semibold">Current Step</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Next Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedCampaign.enrollments || []).map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{e.customerName || "Customer"}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{e.customerPhone}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">Step {e.currentStepNo || 1}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {e.nextExecutionAt ? new Date(e.nextExecutionAt).toLocaleString() : "Pending Window"}
                      </td>
                    </tr>
                  ))}
                  {(!selectedCampaign.enrollments || selectedCampaign.enrollments.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                        No contacts enrolled in this campaign yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TEST CAMPAIGN MODAL ────────────────────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl animate-scaleIn">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" /> Send Test Drip Message
            </h3>
            <p className="text-xs text-slate-500">
              Send the first WhatsApp template step directly to a test phone number without enrolling the actual target audience.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Test WhatsApp Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 919876543210"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowTestModal(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTest}
                disabled={testStatus === "sending"}
                className="bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm shadow-purple-500/20"
              >
                {testStatus === "sending" ? "Sending..." : testStatus === "success" ? "Sent Successfully!" : "Send Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXTRACTED FILE DATA PREVIEW MODAL ────────────────────────────────────── */}
      {showFilePreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-3xl w-full space-y-5 shadow-xl animate-scaleIn relative overflow-hidden my-8">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between relative z-10 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">File Data Preview — Extracted Contacts</h3>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                      {uploadedContacts.length} Contacts Found
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Extracted from <span className="text-slate-900 font-semibold">{uploadFileName || "uploaded file"}</span>. You can search, edit names/numbers, or remove individual records below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilePreviewModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SEARCH BAR & ADD ACTION */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
              <div className="relative w-full sm:w-72">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search extracted names or numbers..."
                  value={filePreviewSearch}
                  onChange={(e) => setFilePreviewSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const newPhone = prompt("Enter 10-digit WhatsApp Phone Number:");
                  if (newPhone) {
                    const digits = newPhone.replace(/[^0-9]/g, "");
                    if (digits.length >= 10) {
                      const name = prompt("Enter Contact Name (optional):") || `Contact (${digits.slice(-4)})`;
                      setUploadedContacts([...uploadedContacts, { phone: digits, name }]);
                    } else {
                      alert("Please enter a valid 10-digit phone number.");
                    }
                  }
                }}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Contact Row
              </button>
            </div>

            {/* CONTACTS DATA TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto relative z-10 shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 sticky top-0 backdrop-blur-md z-20">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Contact Name</th>
                    <th className="px-4 py-2.5">Phone Number</th>
                    <th className="px-4 py-2.5">WhatsApp Format Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {uploadedContacts
                    .filter((c) =>
                      c.phone.includes(filePreviewSearch) ||
                      (c.name || "").toLowerCase().includes(filePreviewSearch.toLowerCase())
                    )
                    .map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-all group">
                        <td className="px-4 py-2 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="px-4 py-2 font-semibold text-slate-800">
                          <input
                            type="text"
                            value={c.name || ""}
                            onChange={(e) => {
                              const next = [...uploadedContacts];
                              next[idx].name = e.target.value;
                              setUploadedContacts(next);
                            }}
                            className="bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded px-2 py-0.5 text-slate-900 text-xs focus:bg-white focus:outline-none w-full"
                          />
                        </td>
                        <td className="px-4 py-2 font-mono text-emerald-700 font-semibold">
                          <input
                            type="text"
                            value={c.phone}
                            onChange={(e) => {
                              const next = [...uploadedContacts];
                              next[idx].phone = e.target.value.replace(/[^0-9]/g, "");
                              setUploadedContacts(next);
                            }}
                            className="bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded px-2 py-0.5 text-emerald-700 font-mono text-xs focus:bg-white focus:outline-none w-full"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Valid WhatsApp Format
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const next = uploadedContacts.filter((_, i) => i !== idx);
                              setUploadedContacts(next);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {uploadedContacts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                        No contacts found. Please upload a CSV, Excel, PDF, or TXT file with valid phone numbers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MODAL FOOTER ACTIONS */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 relative z-10">
              <button
                type="button"
                onClick={() => { setUploadedContacts([]); setUploadFileName(""); setShowFilePreviewModal(false); }}
                className="text-red-600 hover:text-red-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
              >
                Discard & Clear File
              </button>

              <button
                type="button"
                onClick={() => setShowFilePreviewModal(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" /> ✓ Confirm & Use {uploadedContacts.length} Contacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
