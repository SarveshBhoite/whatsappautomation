"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Building,
  Mail,
  Shield,
  Calendar,
  CreditCard,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  Star,
  Check,
  Phone,
  Clock,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sliders,
  CheckCircle,
  HelpCircle,
  MapPin,
  Globe,
  Briefcase,
  FileText,
  Edit2,
  Save,
  XCircle,
  Copy,
  Info,
  Lock,
  AlertCircle,
  Bell,
  X,
  CheckCheck,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Bot,
  Share2,
  Inbox,
  Play,
  Pause,
  RotateCw,
  Send,
  Reply,
  CornerDownRight,
  Store,
  Wrench,
  Activity,
  Flame,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Instagram SVG Icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// YouTube SVG Icon
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.866.553 9.388.553 9.388.553s7.522 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionData {
  id?: string;
  planCode?: string;
  planName?: string;
  billingCycle?: string;
  durationMonths?: number;
  amountPaid?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  featuresIncluded?: string[];
  extraChannels?: number;
}

interface OrgStatusResponse {
  organizationId: string;
  organizationName: string;
  pendingBusinessName?: string | null;
  businessCategory?: string | null;
  businessAddress?: string | null;
  businessWebsite?: string | null;
  aboutBusiness?: string | null;
  gstin?: string | null;
  status: string;
  suspensionReason?: string | null;
  enabledModules: string[];
  subscription?: SubscriptionData | null;
  upcomingSubscription?: SubscriptionData | null;
  allSubscriptions?: SubscriptionData[];
  primaryUser?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    phone?: string | null;
  } | null;
  contactPhone?: string | null;
}

interface NotificationItem {
  id: string;
  organizationId: string;
  title?: string;
  message: string;
  priority: string;
  sender: string;
  isRead: boolean;
  createdAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const TIERS = [
  {
    code: "annual",
    name: "Annual Plan",
    durationLabel: "1 Year / 12 Months",
    durationMonths: 12,
    basePrice: 14999,
    effectiveMonthlyRate: 1250,
    tagline: "Maximum value & complete enterprise automation.",
    isRecommended: true,
    savingsText: "Save ₹8,997 (37% OFF)",
    badge: "MOST POPULAR • BEST VALUE",
    pillClass: "bg-gradient-to-r from-brand-blue to-emerald-600 text-white",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [gstin, setGstin] = useState("");

  // Editable Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    category: "",
    address: "",
    website: "",
    about: "",
    gstin: "",
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [orgId, setOrgId] = useState("");
  const [orgData, setOrgData] = useState<OrgStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Upgrade / Renew Drawer State
  const [isUpgradeSectionOpen, setIsUpgradeSectionOpen] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("annual");
  const [extraChannels, setExtraChannels] = useState<number>(0);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [pendingBusinessName, setPendingBusinessName] = useState<string>("");
  const [suspensionReason, setSuspensionReason] = useState<string>("");

  // Super Admin Notifications & Customer Reply State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [fetchingNotifications, setFetchingNotifications] = useState<boolean>(false);
  const [isComposingMessage, setIsComposingMessage] = useState<boolean>(false);
  const [replyingToNotif, setReplyingToNotif] = useState<NotificationItem | null>(null);
  const [msgTitle, setMsgTitle] = useState<string>("");
  const [msgBody, setMsgBody] = useState<string>("");
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);

  // 12 CRM Modules Circle Rotation State
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedName = localStorage.getItem("user_name") || "";
    const storedRole = localStorage.getItem("user_role") || "";
    const storedOrgId = localStorage.getItem("organization_id") || "";
    const storedEmail = localStorage.getItem("user_email") || "";
    const storedPhone = localStorage.getItem("user_phone") || "";
    const storedBizName = localStorage.getItem("organization_name") || "";
    const storedCategory = localStorage.getItem("business_category") || "";
    const storedAddress = localStorage.getItem("business_address") || "";
    const storedWebsite = localStorage.getItem("business_website") || "";
    const storedAbout = localStorage.getItem("about_business") || "";
    const storedGstin = localStorage.getItem("business_gstin") || "";
    const storedPendingBiz = localStorage.getItem("pending_business_name") || "";

    setUserName(storedName);
    setUserRole(storedRole);
    setOrgId(storedOrgId);
    setUserEmail(storedEmail);
    setUserPhone(storedPhone);
    setBusinessName(storedBizName);
    setBusinessCategory(storedCategory);
    setBusinessAddress(storedAddress);
    setBusinessWebsite(storedWebsite);
    setAboutBusiness(storedAbout);
    setGstin(storedGstin);
    setPendingBusinessName(storedPendingBiz);

    if (storedOrgId) {
      fetchStatus(storedOrgId);
    } else {
      setLoading(false);
    }
  }, []);

  // 12 CRM modules automatic circle rotation timer (every 2.8s)
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setActiveModuleIndex((prev) => (prev + 1) % 12);
    }, 2800);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const handleStartEdit = () => {
    setEditForm({
      name: userName,
      email: userEmail,
      phone: userPhone,
      businessName: pendingBusinessName || businessName,
      category: businessCategory,
      address: businessAddress,
      website: businessWebsite,
      about: aboutBusiness,
      gstin: gstin,
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editForm.name.trim()) {
      setActionMsg({ text: "Name is a required field.", type: "error" });
      return;
    }

    const trimmedBizName = editForm.businessName.trim();
    const isBizNameChanged = trimmedBizName && trimmedBizName !== businessName;

    setUserName(editForm.name.trim());
    setUserPhone(editForm.phone.trim());
    setBusinessCategory(editForm.category.trim());
    setBusinessAddress(editForm.address.trim());
    setBusinessWebsite(editForm.website.trim());
    setAboutBusiness(editForm.about.trim());
    setGstin(editForm.gstin.trim());

    if (typeof window !== "undefined") {
      localStorage.setItem("user_name", editForm.name.trim());
      localStorage.setItem("user_phone", editForm.phone.trim());
      localStorage.setItem("business_category", editForm.category.trim());
      localStorage.setItem("business_address", editForm.address.trim());
      localStorage.setItem("business_website", editForm.website.trim());
      localStorage.setItem("about_business", editForm.about.trim());
      localStorage.setItem("business_gstin", editForm.gstin.trim());
    }

    const payload = {
      userName: editForm.name.trim(),
      phone: editForm.phone.trim(),
      pendingBusinessName: isBizNameChanged ? trimmedBizName : (pendingBusinessName || undefined),
      businessCategory: editForm.category.trim(),
      businessAddress: editForm.address.trim(),
      businessWebsite: editForm.website.trim(),
      aboutBusiness: editForm.about.trim(),
      gstin: editForm.gstin.trim(),
    };

    if (orgId) {
      try {
        await fetch(`${BACKEND_URL}/api/admin/organizations/${orgId}/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Failed to sync profile to server:", err);
      }
    }

    if (isBizNameChanged) {
      setPendingBusinessName(trimmedBizName);
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_business_name", trimmedBizName);
      }
      setIsEditingProfile(false);
      setActionMsg({
        text: `Business name change to "${trimmedBizName}" submitted. Pending Super Admin approval!`,
        type: "success",
      });
      setTimeout(() => setActionMsg(null), 6000);
      return;
    }

    setIsEditingProfile(false);
    setActionMsg({ text: "Profile details updated successfully!", type: "success" });
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Report Export Format Selection Modal State (Doc / PDF / CSV)
  const [reportExportModal, setReportExportModal] = useState<boolean>(false);

  // Trigger browser file download (generic)
  const triggerFileDownload = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper function to safely escape CSV values
  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Trigger browser download for a CSV string
  const triggerCSVDownload = (csvContent: string, fileName: string) => {
    triggerFileDownload("\uFEFF" + csvContent, fileName, "text/csv;charset=utf-8;");
  };

  // Open printable PDF preview window for an HTML report document
  const triggerPrintPDF = (htmlContent: string) => {
    const printWindow = window.open("", "_blank", "width=920,height=800");
    if (!printWindow) {
      alert("Popup blocked! Please allow popups to open the PDF print report.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Trigger DOC (.doc Word compatible HTML) download
  const triggerDocDownload = (htmlBody: string, fileName: string) => {
    const docHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>JISNU CRM Client Report</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 24px; }
          h1 { color: #0f172a; font-size: 20pt; margin-bottom: 2px; }
          h2 { color: #0284c7; font-size: 13pt; margin-top: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
          p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; font-size: 10pt; }
          th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 8px; font-weight: bold; border: 1px solid #cbd5e1; }
          td { padding: 7px 8px; border: 1px solid #cbd5e1; vertical-align: top; }
          tr:nth-child(even) td { background-color: #f8fafc; }
          .badge-active { font-size: 9pt; font-weight: bold; padding: 3px 8px; border-radius: 4px; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; display: inline-block; }
          .badge-inactive { font-size: 9pt; font-weight: bold; padding: 3px 8px; border-radius: 4px; background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; display: inline-block; }
          .mod-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; background: #ffffff; }
        </style>
      </head>
      <body>
        ${htmlBody}
      </body>
      </html>
    `;
    triggerFileDownload(docHtml, fileName, "application/msword;charset=utf-8;");
  };

  // Comprehensive audit metadata for each module
  const MODULE_AUDIT_INFO: Record<string, {
    category: string;
    endpoint: string;
    features: string[];
    compliance: string;
  }> = {
    whatsapp: {
      category: "Core Messaging",
      endpoint: "/whatsapp",
      features: ["Official Meta Cloud API Direct Connect", "Green Tick Verified Business Profile", "Interactive Message Templates (Buttons, Carousels)", "Multi-Agent Routing & Chat Handoff", "Automated 24h Customer Service Window Handling"],
      compliance: "Meta WABA Terms of Service & Business Policy Compliant"
    },
    google_ads: {
      category: "Paid Advertising & Growth",
      endpoint: "/ads",
      features: ["Google Ads API Campaign Launcher", "Search, Performance Max & Display Ad Wizards", "Live Keyword Bid Tracking & Negative Keyword Lists", "Real-Time ROAS & Cost-Per-Acquisition Analytics"],
      compliance: "Google Ads API Commercial Terms & Data Privacy Policy"
    },
    meta_ads: {
      category: "Social Advertising",
      endpoint: "/meta-ads",
      features: ["Facebook & Instagram Lead Generation Ads Integration", "Direct Webhook Lead Sync into CRM Pipeline (<100ms)", "Custom Audience & Conversion API (CAPI) Tracking", "Instant Auto-DM to Ad Responders"],
      compliance: "Meta Business Tools Terms & Consumer Consent Guidelines"
    },
    reviews: {
      category: "Reputation & Google Ecosystem",
      endpoint: "/reviews",
      features: ["Google Business Profile Review Sync", "AI Sentiment Classification (Positive, Neutral, Negative)", "100% Automated Context-Aware Responses", "Negative Review Escalation & Alert Dispatch"],
      compliance: "Google Business Profile Review Policy Guidelines"
    },
    chatbot: {
      category: "Workflow Automation",
      endpoint: "/flows",
      features: ["Visual Drag-and-Drop Conversation Flow Canvas", "Multi-Branch Conditional Routing & Quick Replies", "Dynamic CRM Contact Attribute Extraction", "External Webhook Triggering & Data Capture"],
      compliance: "End-to-End Encrypted Session Workflow Execution"
    },
    ai_agent: {
      category: "Autonomous AI Intelligence",
      endpoint: "/ai-agent",
      features: ["Autonomous 24/7 AI Customer Support Copilot", "BYOK Support: OpenAI (GPT-4o), Claude 3.5, or Gemini", "Zero Per-Token Markup Billing (Direct Client API)", "Custom Knowledge Base RAG & Business FAQ Training"],
      compliance: "Enterprise LLM Zero Data Retention SLA Compliant"
    },
    instagram_dm: {
      category: "Social Commerce",
      endpoint: "/instagram",
      features: ["Instagram Graph API Official Direct Messenger", "Story Mentions & Reel Comment Keyword Triggers", "Automated DM Link Dispatch for High-Converting Leads", "Unified Media & Direct Messaging Sync"],
      compliance: "Instagram Platform Terms & Anti-Spam Guidelines"
    },
    gmail: {
      category: "Email Outreach",
      endpoint: "/gmail",
      features: ["Google Workspace & Gmail API Thread Synchronization", "AI Draft Generation with Brand Tone Tuning", "Automated Drip Follow-ups & Open/Reply Tracking", "Seamless Inbox to CRM Contact Sync"],
      compliance: "Google API Services User Data Policy CASA Tier 2"
    },
    youtube: {
      category: "Video CRM",
      endpoint: "/youtube",
      features: ["YouTube Data API v3 Video Comments Monitor", "Comment Sentiment Scoring & Auto-Reply Dispatch", "Channel Subscriber Lead Identification", "Spam & Negative Comment Moderation Alerts"],
      compliance: "YouTube API Services Terms of Service"
    },
    calendar: {
      category: "Scheduling & Booking",
      endpoint: "/dashboard",
      features: ["Real-Time Google Calendar Slot Availability Checker", "Automated Booking Confirmation via WhatsApp & Email", "Timezone Conversion & Dual-Party Meet Links", "Rescheduling & Cancellation Self-Serve Portals"],
      compliance: "Google Calendar API Calendar Data Privacy Standards"
    },
    linkedin: {
      category: "B2B Social Pipeline",
      endpoint: "/linkedin",
      features: ["LinkedIn Community Management API", "Personal Profile & Company Page Scheduled Publishing", "Inbound Post Comment Lead Detection", "B2B Authority Content Queue Planner"],
      compliance: "LinkedIn Developer Agreement & Data Protection"
    },
    inbox: {
      category: "Team Collaboration",
      endpoint: "/dashboard",
      features: ["Unified Cross-Channel Inbox (WhatsApp, Instagram, Email, Reviews)", "Multi-Agent Ticket Assignment & Internal Notes", "Canned Quick Replies & Snippet Library", "Response Time SLA Tracking & Agent Performance Stats"],
      compliance: "ISO/IEC 27001 Access Control & Audit Log Standard"
    }
  };

  // Build Profile Report HTML Document with JISNU CRM Title and Active Modules Breakdown
  const buildProfileReportHTML = () => {
    const rawEnabledList: string[] = (() => {
      if (orgData && Array.isArray(orgData.enabledModules)) return orgData.enabledModules;
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("enabled_modules");
          if (cached !== null) {
            const p = JSON.parse(cached);
            if (Array.isArray(p)) return p;
          }
        } catch (_) {}
      }
      return [];
    })();

    const hasLoadedOrg = !!orgData || (typeof window !== "undefined" && localStorage.getItem("enabled_modules") !== null);

    const isModActive = (mId: string): boolean => {
      if (hasLoadedOrg && rawEnabledList.length === 0) return false;
      if (!hasLoadedOrg && rawEnabledList.length === 0) return true;
      if (rawEnabledList.includes(mId)) return true;
      if (mId === "instagram_dm" && (rawEnabledList.includes("instagram") || rawEnabledList.includes("instagram_dm"))) return true;
      if (mId === "chatbot" && (rawEnabledList.includes("flows") || rawEnabledList.includes("chatbot") || rawEnabledList.includes("whatsapp"))) return true;
      if (mId === "inbox" && (rawEnabledList.includes("inbox") || rawEnabledList.includes("whatsapp") || rawEnabledList.includes("tools"))) return true;
      if (mId === "calendar" && (rawEnabledList.includes("calendar") || rawEnabledList.includes("gmb") || rawEnabledList.includes("tools"))) return true;
      return false;
    };

    // Master list of 12 CRM modules
    const ALL_MODULES_LIST = [
      { id: "whatsapp", name: "WhatsApp Cloud API", shortName: "WhatsApp", sub: "Official Meta Embedded Connect", desc: "Instant customer onboarding, verified green-tick messaging, template approvals & multi-agent routing." },
      { id: "google_ads", name: "Google Ads Manager", shortName: "Google Ads", sub: "1-Click Search & PMax Suite", desc: "Launch high-intent Search & Performance Max campaigns with live ROAS optimization & keyword tracking." },
      { id: "meta_ads", name: "Meta (FB & IG) Ads", shortName: "Meta Ads", sub: "Direct Page & Lead Gen Sync", desc: "Synchronize leads instantly from Facebook and Instagram lead gen ads directly into your team inbox." },
      { id: "reviews", name: "Google Reviews Sync", shortName: "Reviews AI", sub: "AI Sentiment & 100% Auto-Reply", desc: "Monitor Google Business Profile ratings and auto-generate personalized, positive brand responses." },
      { id: "chatbot", name: "Drag-and-Drop Chatbot", shortName: "Flow Bot", sub: "Visual Builder with Multi-Paths", desc: "Design complex conversation workflows, qualification branching, and dynamic CRM variable updates." },
      { id: "ai_agent", name: "Autonomous 24/7 AI Agent", shortName: "AI Agent", sub: "Bring Any LLM Key (Zero Markup)", desc: "Empower your inbox with OpenAI, Claude, or Gemini models responding naturally to customer inquiries round the clock." },
      { id: "instagram_dm", name: "Instagram DM & Comments", shortName: "Instagram", sub: "Post Triggered Direct Responses", desc: "Instantly auto-DM users when they comment keyword triggers on reels and feed posts to capture hot leads." },
      { id: "gmail", name: "Gmail Automation", shortName: "Gmail AI", sub: "AI Smart Drafts & Follow-ups", desc: "Sync emails, generate context-aware draft replies, and schedule automated high-converting follow-ups." },
      { id: "youtube", name: "YouTube Sentiment Sync", shortName: "YouTube", sub: "Video Comments Monitor & Replies", desc: "Detect positive, neutral, or negative sentiment on video comments and engage leads right from your dashboard." },
      { id: "calendar", name: "Google Calendar Booking", shortName: "Calendar", sub: "Direct Meet & Slot Synchronization", desc: "Enable automated appointment bookings with real-time Google Calendar slot availability checking." },
      { id: "linkedin", name: "LinkedIn Post Scheduler", shortName: "LinkedIn", sub: "B2B Social Lead Generation", desc: "Schedule B2B thought-leadership content, track company page engagement, and route incoming leads." },
      { id: "inbox", name: "Multi-Agent Team Inbox", shortName: "Team Inbox", sub: "Unified Cross-Channel Workspace", desc: "Manage WhatsApp, Instagram, Gmail, and Reviews from one cohesive cockpit with teammate assignments." }
    ];

    const activeList = ALL_MODULES_LIST.filter(m => isModActive(m.id));
    const inactiveList = ALL_MODULES_LIST.filter(m => !isModActive(m.id));

    const currentSub = orgData?.subscription;
    const upcomingSub = orgData?.upcomingSubscription;
    const nowTime = Date.now();
    const daysUntilExpiry = currentSub?.endDate
      ? Math.ceil((new Date(currentSub.endDate).getTime() - nowTime) / (1000 * 60 * 60 * 24))
      : "N/A";

    // Build Active Modules HTML Cards with comprehensive features & additional info
    const activeModulesCardsHtml = activeList.length > 0 ? activeList.map((m, idx) => {
      const audit = MODULE_AUDIT_INFO[m.id] || {
        category: "CRM Feature",
        endpoint: "/dashboard",
        features: ["Operational Core Component", "Enterprise Workspace Enabled"],
        compliance: "Verified JISNU Platform Standards"
      };

      const featureItems = audit.features.map(f => `<li style="margin-bottom:3px; color:#334155;">${f}</li>`).join("");

      return `
        <div style="border:1px solid #bbf7d0; background:#f0fdf4; border-radius:10px; padding:14px; margin-bottom:12px; page-break-inside:avoid;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <div>
              <span style="font-size:10px; font-weight:800; text-transform:uppercase; color:#059669; letter-spacing:0.5px;">
                ${audit.category} • Module #${idx + 1}
              </span>
              <h3 style="margin:2px 0; font-size:15px; font-weight:900; color:#064e3b;">
                ${m.name} (${m.shortName})
              </h3>
              <p style="margin:0; font-size:11px; color:#047857; font-weight:600;">
                ${m.sub}
              </p>
            </div>
            <span style="background:#059669; color:#ffffff; font-size:10px; font-weight:900; padding:3px 10px; border-radius:20px; text-transform:uppercase;">
              ● ACTIVE &amp; WORKING
            </span>
          </div>

          <p style="font-size:11px; color:#1e293b; margin:6px 0; line-height:1.4;">
            ${m.desc}
          </p>

          <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #86efac;">
            <span style="font-size:10px; font-weight:bold; color:#065f46; text-transform:uppercase;">Included Capabilities &amp; Technical Specifications:</span>
            <ul style="margin:4px 0 6px 16px; padding:0; font-size:11px;">
              ${featureItems}
            </ul>
            <div style="font-size:10px; color:#047857;">
              <strong>Security &amp; Protocol:</strong> ${audit.compliance} • <em>Endpoint: ${audit.endpoint}</em>
            </div>
          </div>
        </div>
      `;
    }).join("") : `
      <div style="border:1px solid #fecaca; background:#fef2f2; border-radius:10px; padding:16px; text-align:center; color:#991b1b; margin-bottom:12px;">
        <h4 style="margin:0; font-size:13px; font-weight:bold;">No Active Platform Modules Assigned</h4>
        <p style="margin:4px 0 0 0; font-size:11px;">All module entitlements are currently paused or waiting Super Admin authorization.</p>
      </div>
    `;

    // Inactive Modules Table summary if any
    const inactiveSummaryRows = inactiveList.map((m, idx) => `
      <tr>
        <td style="padding:6px 8px; border:1px solid #e2e8f0; font-weight:bold; color:#64748b;">${idx + 1}</td>
        <td style="padding:6px 8px; border:1px solid #e2e8f0; font-weight:bold; color:#334155;">${m.name}</td>
        <td style="padding:6px 8px; border:1px solid #e2e8f0; color:#64748b; font-size:10px;">${m.sub}</td>
        <td style="padding:6px 8px; border:1px solid #e2e8f0; text-align:center;">
          <span style="background:#f1f5f9; color:#64748b; font-size:9px; font-weight:bold; padding:2px 8px; border-radius:4px;">
            NOT ENABLED
          </span>
        </td>
      </tr>
    `).join("");

    return `
      <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 18px;">
          <div>
            <h1 style="margin:0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">JISNU CRM</h1>
            <p style="margin:2px 0 0 0; font-size: 13px; color: #0284c7; font-weight: 700;">Client Platform Status &amp; Active Modules Audit Report</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0; font-size: 11px; color: #64748b;">Generated: <strong>${new Date().toLocaleString("en-IN")}</strong></p>
            <p style="margin:2px 0 0 0; font-size: 11px; color: #059669; font-weight: bold;">Status: ${orgData?.status || "ACTIVE"}</p>
          </div>
        </div>

        <h2 style="font-size: 14px; color: #0f172a; margin: 16px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform:uppercase; letter-spacing:0.5px;">
          1. Client Identity &amp; Workspace Details
        </h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom: 16px; font-size: 11px;">
          <tr>
            <td style="width:25%; font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Business Name</td>
            <td style="width:75%; font-weight:bold; color:#0f172a; border:1px solid #e2e8f0; padding:8px;">
              ${businessName || orgData?.organizationName || "Company Workspace"}
              ${pendingBusinessName && pendingBusinessName !== businessName ? ` <span style="color:#d97706; font-size:10px;">(Pending Approval: "${pendingBusinessName}")</span>` : ""}
            </td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Organization ID</td>
            <td style="font-family:monospace; border:1px solid #e2e8f0; padding:8px;">${orgId || orgData?.organizationId || "Not Registered"}</td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Primary Operator</td>
            <td style="border:1px solid #e2e8f0; padding:8px; font-weight:600;">
              ${userName || orgData?.primaryUser?.name || "Client Admin"} • 
              <span style="font-family:monospace; font-weight:normal;">${userEmail || orgData?.primaryUser?.email || "N/A"}</span> • 
              <span style="color:#059669; font-weight:bold;">${userPhone || orgData?.primaryUser?.phone || orgData?.contactPhone || "N/A"}</span>
            </td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Business Category</td>
            <td style="border:1px solid #e2e8f0; padding:8px;">${businessCategory || orgData?.businessCategory || "Not Specified"}</td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">GSTIN</td>
            <td style="font-family:monospace; font-weight:bold; border:1px solid #e2e8f0; padding:8px;">${gstin || orgData?.gstin || "Not Provided"}</td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Registered Address</td>
            <td style="border:1px solid #e2e8f0; padding:8px;">${businessAddress || orgData?.businessAddress || "Not Provided"}</td>
          </tr>
        </table>

        <h2 style="font-size: 14px; color: #0f172a; margin: 16px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform:uppercase; letter-spacing:0.5px;">
          2. Subscription &amp; Commercial Terms
        </h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom: 16px; font-size: 11px;">
          <tr>
            <td style="width:25%; font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Current Active Plan</td>
            <td style="width:75%; border:1px solid #e2e8f0; padding:8px; font-weight:bold; color:#0284c7;">
              ${currentSub?.planName || "Annual Plan"}
            </td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Paid Revenue (INR)</td>
            <td style="border:1px solid #e2e8f0; padding:8px; font-weight:bold;">
              ${currentSub?.amountPaid ? `₹${currentSub.amountPaid.toLocaleString("en-IN")}` : "₹14,999"}
            </td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Plan Start Date</td>
            <td style="border:1px solid #e2e8f0; padding:8px;">
              ${currentSub?.startDate ? new Date(currentSub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active"}
            </td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Plan Expiry Date</td>
            <td style="border:1px solid #e2e8f0; padding:8px; font-weight:bold;">
              ${currentSub?.endDate ? new Date(currentSub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active (Continuous)"}
            </td>
          </tr>
          <tr>
            <td style="font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">Remaining Validity</td>
            <td style="border:1px solid #e2e8f0; padding:8px; font-weight:bold; color:#059669;">
              ${daysUntilExpiry !== "N/A" ? `${daysUntilExpiry} Days Remaining` : "Active"}
            </td>
          </tr>
          ${upcomingSub ? `
          <tr>
            <td style="font-weight:bold; background:#faf5ff; border:1px solid #e2e8f0; padding:8px; color:#7e22ce;">Queued Renewal</td>
            <td style="border:1px solid #e2e8f0; padding:8px; color:#7e22ce; font-weight:bold;">
              ${upcomingSub.planName} (${upcomingSub.durationMonths} Months) • Scheduled to activate after current plan expiry
            </td>
          </tr>
          ` : ""}
        </table>

        <h2 style="font-size: 14px; color: #0f172a; margin: 20px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform:uppercase; letter-spacing:0.5px;">
          3. Active CRM Platform Modules (${activeList.length} of 12 Live &amp; Operational)
        </h2>
        <p style="font-size:11px; color:#64748b; margin:0 0 12px 0;">
          The following modules have been verified as actively working for this client organization, including full capability specs:
        </p>

        ${activeModulesCardsHtml}

        ${inactiveList.length > 0 ? `
          <h2 style="font-size: 13px; color: #64748b; margin: 20px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform:uppercase; letter-spacing:0.5px;">
            4. Inactive / Unassigned Modules (${inactiveList.length} Modules)
          </h2>
          <table style="width:100%; border-collapse:collapse; margin-bottom: 20px; font-size: 11px;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:6px 8px; border:1px solid #e2e8f0; text-align:left; width:30px;">#</th>
                <th style="padding:6px 8px; border:1px solid #e2e8f0; text-align:left;">Module Name</th>
                <th style="padding:6px 8px; border:1px solid #e2e8f0; text-align:left;">Description</th>
                <th style="padding:6px 8px; border:1px solid #e2e8f0; text-align:center; width:110px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${inactiveSummaryRows}
            </tbody>
          </table>
        ` : ""}

        <div style="border-top:1px solid #e2e8f0; padding-top:12px; margin-top:24px; font-size:11px; color:#64748b; display:flex; justify-content:space-between;">
          <span>Generated by <strong>JISNU CRM Enterprise Client Portal</strong></span>
          <span>Official Verified Client Dossier • Confidential</span>
        </div>
      </div>
    `;
  };

  // Perform Final Export in Selected Format (doc, pdf, csv) from Profile Page
  const handlePerformProfileExport = (format: "pdf" | "doc" | "csv") => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const sanitizedName = (businessName || orgData?.organizationName || "Client").replace(/[^a-zA-Z0-9_-]/g, "_");
    const baseName = `JISNU_CRM_Report_${sanitizedName}_${dateStr}`;

    // Close format modal
    setReportExportModal(false);

    if (format === "pdf") {
      const html = buildProfileReportHTML();
      triggerPrintPDF(html);
      setActionMsg({ text: "✓ PDF Print preview generated! You can Save as PDF or Print.", type: "success" });
      setTimeout(() => setActionMsg(null), 5000);
    } else if (format === "doc") {
      const html = buildProfileReportHTML();
      triggerDocDownload(html, `${baseName}.doc`);
      setActionMsg({ text: "✓ Word Document (.doc) downloaded successfully!", type: "success" });
      setTimeout(() => setActionMsg(null), 4000);
    } else {
      // CSV Export with fixed JISNU CRM Title and detailed modules audit
      const rawEnabledList: string[] = (() => {
        if (orgData && Array.isArray(orgData.enabledModules)) return orgData.enabledModules;
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem("enabled_modules");
            if (cached !== null) {
              const p = JSON.parse(cached);
              if (Array.isArray(p)) return p;
            }
          } catch (_) {}
        }
        return [];
      })();

      const hasLoadedOrg = !!orgData || (typeof window !== "undefined" && localStorage.getItem("enabled_modules") !== null);

      const isModActive = (mId: string): boolean => {
        if (hasLoadedOrg && rawEnabledList.length === 0) return false;
        if (!hasLoadedOrg && rawEnabledList.length === 0) return true;
        if (rawEnabledList.includes(mId)) return true;
        if (mId === "instagram_dm" && (rawEnabledList.includes("instagram") || rawEnabledList.includes("instagram_dm"))) return true;
        if (mId === "chatbot" && (rawEnabledList.includes("flows") || rawEnabledList.includes("chatbot") || rawEnabledList.includes("whatsapp"))) return true;
        if (mId === "inbox" && (rawEnabledList.includes("inbox") || rawEnabledList.includes("whatsapp") || rawEnabledList.includes("tools"))) return true;
        if (mId === "calendar" && (rawEnabledList.includes("calendar") || rawEnabledList.includes("gmb") || rawEnabledList.includes("tools"))) return true;
        return false;
      };

      const ALL_MODULES_LIST = [
        { id: "whatsapp", name: "WhatsApp Cloud API", category: "Core Messaging" },
        { id: "google_ads", name: "Google Ads Manager", category: "Paid Advertising & Growth" },
        { id: "meta_ads", name: "Meta (FB & IG) Ads", category: "Social Advertising" },
        { id: "reviews", name: "Google Reviews Sync", category: "Reputation & Google Ecosystem" },
        { id: "chatbot", name: "Drag-and-Drop Chatbot", category: "Workflow Automation" },
        { id: "ai_agent", name: "Autonomous 24/7 AI Agent", category: "Autonomous AI Intelligence" },
        { id: "instagram_dm", name: "Instagram DM & Comments", category: "Social Commerce" },
        { id: "gmail", name: "Gmail Automation", category: "Email Outreach" },
        { id: "youtube", name: "YouTube Sentiment Sync", category: "Video CRM" },
        { id: "calendar", name: "Google Calendar Booking", category: "Scheduling & Booking" },
        { id: "linkedin", name: "LinkedIn Post Scheduler", category: "B2B Social Pipeline" },
        { id: "inbox", name: "Multi-Agent Team Inbox", category: "Team Collaboration" }
      ];

      const activeList = ALL_MODULES_LIST.filter(m => isModActive(m.id));
      const currentSub = orgData?.subscription;
      const nowTime = Date.now();
      const daysUntilExpiry = currentSub?.endDate
        ? Math.ceil((new Date(currentSub.endDate).getTime() - nowTime) / (1000 * 60 * 60 * 24))
        : "N/A";

      const rows: string[][] = [
        ["JISNU CRM - CLIENT PLATFORM AUDIT & ACTIVE MODULES REPORT"],
        ["Generated At", new Date().toLocaleString("en-IN")],
        ["Report Scope", "Individual Client Organization Dossier"],
        [],
        ["--- CLIENT IDENTITY & WORKSPACE DETAILS ---"],
        ["Business Name", businessName || orgData?.organizationName || "Company Workspace"],
        ["Organization ID", orgId || orgData?.organizationId || "Not Registered"],
        ["Account Status", orgData?.status || "ACTIVE"],
        ["Primary Contact Person", userName || orgData?.primaryUser?.name || "Client Admin"],
        ["Primary Email Address", userEmail || orgData?.primaryUser?.email || "Not Provided"],
        ["Primary Phone Number", userPhone || orgData?.primaryUser?.phone || orgData?.contactPhone || "Not Provided"],
        ["Business Category", businessCategory || orgData?.businessCategory || "Not Specified"],
        ["GSTIN Number", gstin || orgData?.gstin || "Not Provided"],
        ["Registered Address", businessAddress || orgData?.businessAddress || "Not Provided"],
        ["Business Website", businessWebsite || orgData?.businessWebsite || "Not Provided"],
        [],
        ["--- SUBSCRIPTION & VALIDITY SUMMARY ---"],
        ["Current Active Plan", currentSub?.planName || "Annual Plan"],
        ["Paid Revenue (INR)", currentSub?.amountPaid ? `₹${currentSub.amountPaid.toLocaleString("en-IN")}` : "₹14,999"],
        ["Plan Start Date", currentSub?.startDate ? new Date(currentSub.startDate).toLocaleDateString("en-IN") : "Active"],
        ["Plan Expiry Date", currentSub?.endDate ? new Date(currentSub.endDate).toLocaleDateString("en-IN") : "Active"],
        ["Days Remaining", String(daysUntilExpiry)],
        ["Total Live Working Modules", `${activeList.length} of 12 Modules Active`],
        [],
        ["--- ACTIVE PLATFORM MODULES BREAKDOWN & AUDIT ---"],
        ["#", "Module Key", "Module Name", "Category", "Status", "Technical Endpoint", "Included Core Features"]
      ];

      activeList.forEach((m, idx) => {
        const audit = MODULE_AUDIT_INFO[m.id];
        rows.push([
          String(idx + 1),
          m.id,
          m.name,
          audit?.category || "CRM Feature",
          "ACTIVE & WORKING",
          audit?.endpoint || "/dashboard",
          (audit?.features || []).join(" | ")
        ]);
      });

      const csvContent = rows.map(r => r.map(escapeCSV).join(",")).join("\r\n");
      triggerCSVDownload(csvContent, `${baseName}.csv`);
      setActionMsg({ text: "✓ CSV Report downloaded successfully!", type: "success" });
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const fetchStatus = async (organizationId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/subscription/status`, {
        headers: {
          "x-organization-id": organizationId,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setOrgData(data);
          if (data.organizationName) {
            setBusinessName(data.organizationName);
            if (typeof window !== "undefined") {
              localStorage.setItem("organization_name", data.organizationName);
            }
          }
          if (data.pendingBusinessName) {
            setPendingBusinessName(data.pendingBusinessName);
            if (typeof window !== "undefined") {
              localStorage.setItem("pending_business_name", data.pendingBusinessName);
            }
          } else {
            setPendingBusinessName("");
            if (typeof window !== "undefined") {
              localStorage.removeItem("pending_business_name");
            }
          }
          if (data.businessCategory) {
            setBusinessCategory(data.businessCategory);
            if (typeof window !== "undefined") {
              localStorage.setItem("business_category", data.businessCategory);
            }
          }
          if (data.businessAddress) {
            setBusinessAddress(data.businessAddress);
            if (typeof window !== "undefined") {
              localStorage.setItem("business_address", data.businessAddress);
            }
          }
          if (data.businessWebsite) {
            setBusinessWebsite(data.businessWebsite);
            if (typeof window !== "undefined") {
              localStorage.setItem("business_website", data.businessWebsite);
            }
          }
          if (data.aboutBusiness) {
            setAboutBusiness(data.aboutBusiness);
            if (typeof window !== "undefined") {
              localStorage.setItem("about_business", data.aboutBusiness);
            }
          }
          if (data.gstin) {
            setGstin(data.gstin);
            if (typeof window !== "undefined") {
              localStorage.setItem("business_gstin", data.gstin);
            }
          }
          if (data.primaryUser?.email) {
            setUserEmail(data.primaryUser.email);
            if (typeof window !== "undefined") {
              localStorage.setItem("user_email", data.primaryUser.email);
            }
          }
          if (data.primaryUser?.name) {
            setUserName(data.primaryUser.name);
            if (typeof window !== "undefined") {
              localStorage.setItem("user_name", data.primaryUser.name);
            }
          }
          const resolvedPhone = data.primaryUser?.phone || data.contactPhone;
          if (resolvedPhone) {
            setUserPhone(resolvedPhone);
            if (typeof window !== "undefined") {
              localStorage.setItem("user_phone", resolvedPhone);
            }
          }
          if (data.status) {
            if (data.suspensionReason) {
              setSuspensionReason(data.suspensionReason);
            } else {
              setSuspensionReason("");
            }
          }
          if (Array.isArray(data.enabledModules)) {
            if (typeof window !== "undefined") {
              localStorage.setItem("enabled_modules", JSON.stringify(data.enabledModules));
            }
          }
          if (data.subscription?.planCode) {
            setSelectedPlanCode(data.subscription.planCode);
            setExtraChannels(data.subscription.extraChannels || 0);
          }

          // Fetch Super Admin notifications for this organization
          fetchNotifications(organizationId);
        }
      }
    } catch (err) {
      console.warn("Could not load latest subscription status from backend, keeping cached details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (organizationId: string) => {
    if (!organizationId) return;
    setFetchingNotifications(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${organizationId}/notifications`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.warn("Could not fetch admin notifications:", err);
    } finally {
      setFetchingNotifications(false);
    }
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/notifications/${notifId}/read`, {
        method: "POST",
      });
      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!orgId) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/organizations/${orgId}/notifications/read-all`, {
        method: "POST",
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleInitiateReply = (notif: NotificationItem) => {
    setReplyingToNotif(notif);
    setMsgTitle(`Re: ${notif.title || "Super Admin Announcement"}`);
    setMsgBody("");
    setIsComposingMessage(true);
  };

  const handleSendMessageToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !msgBody.trim()) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/organizations/${orgId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: msgTitle.trim() || "Message from Client",
          message: msgBody.trim(),
          replyToId: replyingToNotif?.id || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message to Super Admin");
      }

      // Add to notifications list locally and refresh
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
      }
      setMsgTitle("");
      setMsgBody("");
      setReplyingToNotif(null);
      setIsComposingMessage(false);
      setActionMsg({ text: "Message transmitted to Super Admin successfully!", type: "success" });
    } catch (err: any) {
      console.error("Failed to send message to admin:", err);
      setActionMsg({ text: err.message || "Failed to transmit message.", type: "error" });
    } finally {
      setSendingMsg(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_role");
      localStorage.removeItem("organization_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("enabled_modules");
    }
    router.push("/login");
  };

  const sub = orgData?.subscription;
  const isExpired = sub?.endDate ? new Date(sub.endDate).getTime() < Date.now() : false;

  // Selected tier calculations for upgrade section
  const selectedTier = TIERS.find((t) => t.code === selectedPlanCode) || TIERS[0];
  const extraChannelsCost = extraChannels * 2000;
  const upgradeSubtotal = selectedTier.basePrice + extraChannelsCost;
  const upgradeGst = Math.round(upgradeSubtotal * 0.18 * 100) / 100;
  const upgradeTotal = Math.round((upgradeSubtotal + upgradeGst) * 100) / 100;

  // Handle direct Upgrade / Renewal checkout order
  const handleProceedUpgrade = async () => {
    setActionMsg(null);
    setIsProcessingUpgrade(true);

    try {
      const orderRes = await fetch(`${BACKEND_URL}/api/subscription/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlanCode,
          extraChannels,
          email: userEmail || `${userName.toLowerCase().replace(/\s+/g, "")}@workspace.com`,
          name: userName,
          phone: "9876543210",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create upgrade order");
      }

      // Check Razorpay vs Mock Sandbox
      const isMock = orderData.isMock || !window.Razorpay;

      if (!isMock && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: "INR",
          name: "Jisnu CRM",
          description: `Plan Upgrade / Renewal: ${selectedTier.name}`,
          image: "/icon.jpeg",
          order_id: orderData.orderId,
          prefill: {
            name: userName,
            email: userEmail,
          },
          theme: {
            color: "#0284c7",
          },
          handler: async function (response: any) {
            await finalizeUpgrade({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessingUpgrade(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct mock activation for dev/sandbox mode
        await finalizeUpgrade({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature_approved",
        });
      }
    } catch (err: any) {
      console.error(err);
      setActionMsg({ text: err.message || "Failed to process upgrade.", type: "error" });
      setIsProcessingUpgrade(false);
    }
  };

  const finalizeUpgrade = async (paymentDetails: any) => {
    try {
      const upgradeRes = await fetch(`${BACKEND_URL}/api/subscription/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          planCode: selectedPlanCode,
          extraChannels,
          ...paymentDetails,
        }),
      });

      const upgradeData = await upgradeRes.json();
      if (!upgradeRes.ok || !upgradeData.success) {
        throw new Error(upgradeData.error || "Failed to finalize plan update");
      }

      // Re-fetch status to refresh active and upcoming subscription cards immediately
      if (orgId) {
        await fetchStatus(orgId);
      }
      setActionMsg({ 
        text: upgradeData.message || `Plan successfully updated to ${selectedTier.name}!`, 
        type: "success" 
      });
      setIsUpgradeSectionOpen(false);
    } catch (e: any) {
      console.error(e);
      setActionMsg({ text: e.message || "Plan payment verified, please refresh the page.", type: "error" });
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-mesh-canvas text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900 pb-20">
      
      {/* ── Top Header Navigation Bar (Same as Cockpit Page) ── */}
      <div className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl overflow-hidden border border-slate-200/90 p-0.5 bg-white shadow-2xs">
            <img src="/icon.jpeg" alt="Jisnu Logo" className="h-full w-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Account &amp; Subscription Profile
              </h1>
              <Badge variant="outline" className="text-[10px] font-extrabold text-brand-blue border-sky-200 bg-sky-50 uppercase">
                {userRole.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {businessName || orgData?.organizationName || "Company Workspace"}{orgId ? <> • ID: <span className="font-mono text-slate-600">{orgId.slice(0, 8)}...</span></> : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Super Admin Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsComposingMessage(false);
                setReplyingToNotif(null);
                setShowNotificationsModal(true);
              }}
              className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              title="Super Admin Messages & Broadcasts"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center shadow-xs border-2 border-white animate-pulse">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>

          {/* Download Client Report Button (PDF, DOC, CSV) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReportExportModal(true)}
            className="border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Download verified audit report of your active CRM modules & subscription (PDF, DOC, or CSV)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Download Report</span>
          </Button>

          {/* Quick Message Admin Action Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setReplyingToNotif(null);
              setMsgTitle("");
              setMsgBody("");
              setIsComposingMessage(true);
              setShowNotificationsModal(true);
            }}
            className="border-sky-300 text-brand-blue hover:bg-sky-50 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Send direct message or inquiry to Super Admin"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Message Admin</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>
      </div>

      {/* ── Main Container ── */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8 flex-1">
        
        {/* Action Alert Banner */}
        {actionMsg && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in ${
            actionMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* ── Critical Account Suspension Banner ── */}
        {(orgData?.status === "SUSPENDED" || suspensionReason) && (
          <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-200 shadow-sm space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-rose-900">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-rose-900">
                  Account Deployment Status: SUSPENDED
                </h3>
                <p className="text-xs text-rose-700 font-medium">
                  Your organization access has been suspended by the Super Administrator.
                </p>
              </div>
            </div>
            {suspensionReason && (
              <div className="mt-2 p-3.5 rounded-2xl bg-white border border-rose-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                  Official Suspension Reason:
                </span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  &quot;{suspensionReason}&quot;
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 1. Operator & Business Profile Card (Light Theme) ── */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
          {/* Card Header */}
          <div className="p-6 pb-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-sky-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#0F52BA] text-white font-black text-2xl flex items-center justify-center shadow-md shadow-brand-blue/20 ring-2 ring-white">
                    {userName ? userName.slice(0, 2).toUpperCase() : <User className="w-7 h-7" />}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white rounded-full p-0.5 shadow-xs" title="Online & Isolated">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                      {userName || "Registered Operator"}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Session
                    </span>
                    <Badge variant="outline" className="text-[10px] font-extrabold text-brand-blue border-sky-300 bg-sky-50 uppercase py-0.5 px-2.5">
                      Role: {userRole ? userRole.replace("_", " ") : "Operator"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-blue font-bold mt-1">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{businessName || orgData?.organizationName || "Company Workspace"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={handleStartEdit}
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold shadow-sm shadow-brand-blue/20"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information Grid (Light Theme) */}
          <div className="p-6 space-y-5 text-xs">
            {/* Operator Contact Credentials Row */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Registered Operator Credentials
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Email Item */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-sky-100/80 text-brand-blue shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-400">Registered Email ID (Permanent)</p>
                      <p className="font-bold text-slate-900 truncate">
                        {userEmail || <span className="text-slate-400 font-normal italic">Not specified</span>}
                      </p>
                    </div>
                  </div>
                  {userEmail && (
                    <button
                      onClick={() => copyToClipboard(userEmail, "email")}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Phone Item */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-400">Registered Phone Number</p>
                      <p className="font-bold text-slate-900">
                        {userPhone || <span className="text-slate-400 font-normal italic">Not specified</span>}
                      </p>
                    </div>
                  </div>
                  {userPhone && (
                    <button
                      onClick={() => copyToClipboard(userPhone, "phone")}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Business Profile Details */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Business &amp; Commerce Identity</span>
                {businessWebsite && (
                  <a
                    href={businessWebsite.startsWith("http") ? businessWebsite : `https://${businessWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-blue font-bold flex items-center gap-1 hover:underline lowercase"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{businessWebsite.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50/60 to-white border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-100 text-brand-blue shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400">Commercial Business Name</p>
                      <h4 className="font-black text-slate-900 text-base">
                        {businessName || orgData?.organizationName || <span className="text-slate-400 font-normal italic">No business name</span>}
                      </h4>
                    </div>
                  </div>

                  {businessCategory && (
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                      {businessCategory}
                    </span>
                  )}
                </div>

                {/* Pending Business Name Approval Banner */}
                {pendingBusinessName && pendingBusinessName !== businessName && (
                  <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Requested Name Change: <strong className="font-black">&quot;{pendingBusinessName}&quot;</strong>
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-200/80 text-amber-950 font-black rounded-lg text-[10px] uppercase tracking-wider self-start sm:self-auto border border-amber-300">
                      Pending Super Admin Approval
                    </span>
                  </div>
                )}

                {/* About Business */}
                <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>About Business</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {aboutBusiness || <span className="text-slate-400 italic">No business description added yet. Click &quot;Edit Profile&quot; to add details.</span>}
                  </p>
                </div>

                {/* Address & GSTIN Details */}
                {(businessAddress || gstin) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs">
                    {businessAddress && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{businessAddress}</span>
                      </div>
                    )}
                    {gstin && (
                      <div className="flex items-center gap-2 text-slate-600 sm:justify-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">GSTIN / Tax ID:</span>
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {gstin}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tenant Security Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Organization ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-800 font-bold select-all text-[11px] truncate">
                    {orgId || "—"}
                  </span>
                  {orgId && (
                    <button
                      onClick={() => copyToClipboard(orgId, "orgId")}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      title="Copy Org ID"
                    >
                      {copiedField === "orgId" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Tenant Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md text-[10px] uppercase self-start">
                  {orgData?.status || "ACTIVE"}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Database Isolation</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                  Row-Level Isolation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Active Subscription & Continuity Cockpit (Light Theme) ── */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 via-white to-emerald-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-blue flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                  Subscription &amp; Continuity Cockpit
                </span>
                {orgData?.upcomingSubscription && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Next Tier Queued
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {sub?.planName || "Annual Complete Growth Plan"}
              </h2>
            </div>
          </div>

          {/* Subscription Content (Light Theme) */}
          <div className="p-6 space-y-5">
            {orgData?.upcomingSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                    Lifecycle Timeline • Continuous Auto-Transition
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Zero Downtime Guarantee
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Current Plan */}
                  <div className="p-5 rounded-2xl bg-sky-50/60 border-2 border-sky-300/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                          Active Now
                        </span>
                        <span className="text-base font-black text-brand-blue">
                          ₹{sub?.amountPaid?.toLocaleString("en-IN") || "—"}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-2.5">{sub?.planName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sub?.durationMonths} Months Duration • {sub?.extraChannels ? `${sub.extraChannels} Extra Channel(s)` : "Standard Suite"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-sky-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-blue" /> Start Date:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Live"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> Expires:
                        </span>
                        <span className="font-bold text-amber-800">
                          {sub?.endDate ? new Date(sub.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Continuous"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Upcoming Plan */}
                  <div className="p-5 rounded-2xl bg-emerald-50/60 border-2 border-emerald-300/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          Queued Next
                        </span>
                        <span className="text-base font-black text-emerald-700">
                          ₹{orgData.upcomingSubscription.amountPaid?.toLocaleString("en-IN") || "—"}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-2.5">{orgData.upcomingSubscription.planName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {orgData.upcomingSubscription.durationMonths} Months Duration • Seamless auto-activation
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-emerald-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" /> Auto-Starts:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {orgData.upcomingSubscription.startDate
                            ? new Date(orgData.upcomingSubscription.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "Upon Expiry"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-blue" /> Valid Through:
                        </span>
                        <span className="font-bold text-emerald-700">
                          {orgData.upcomingSubscription.endDate
                            ? new Date(orgData.upcomingSubscription.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "Extended"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Plan Light Theme View */
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Plan Active &amp; Operational
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {sub?.planName || "Annual Complete Growth Plan"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Full 12-Module Enterprise Suite • Valid for {sub?.durationMonths || 12} Months
                    </p>
                  </div>

                  {sub?.amountPaid && (
                    <div className="sm:text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Total Paid</span>
                      <span className="text-2xl font-black text-brand-blue">
                        ₹{sub.amountPaid.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white border border-slate-200/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Active Since
                    </span>
                    <div className="text-slate-900 font-bold text-sm">
                      {sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Live"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {sub?.startDate ? new Date(sub.startDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : ""}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Expiration Date
                    </span>
                    <div className={`font-black text-sm ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                      {sub?.endDate ? new Date(sub.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Year-Round"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {sub?.endDate ? new Date(sub.endDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : ""}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Continuity Banner (Light Theme) */}
            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" />
                <span>
                  {orgData?.upcomingSubscription
                    ? "Your upcoming plan is queued. When current expiry arrives, your modules will renew automatically without downtime."
                    : "Plan validity can be extended anytime. Stacking a new tier automatically queues it without overlapping."}
                </span>
              </div>
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider shrink-0 bg-white px-2.5 py-1 rounded-md border border-sky-200">
                Auto-Renewal Protection
              </span>
            </div>
          </div>
        </div>

        {/* ── Active CRM Services & Workspace Capabilities (Cockpit Style) ── */}
        {(() => {
          // Master List of all 12 platform modules with their configuration
          const ALL_CRM_MODULES = [
            {
              id: "whatsapp",
              name: "WhatsApp Cloud API",
              shortName: "WhatsApp",
              status: "Operational",
              sub: "Official Meta Embedded Connect",
              desc: "Instant customer onboarding, verified green-tick messaging, template approvals & multi-agent routing.",
              icon: MessageSquare,
              color: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
              borderColor: "border-emerald-500/30",
              glowColor: "rgba(16, 185, 129, 0.4)",
              tag: "Core Messaging",
              href: "/whatsapp"
            },
            {
              id: "google_ads",
              name: "Google Ads Manager",
              shortName: "Google Ads",
              status: "Operational",
              sub: "1-Click Search & PMax Suite",
              desc: "Launch high-intent Search & Performance Max campaigns with live ROAS optimization & keyword tracking.",
              icon: BarChart3,
              color: "text-sky-500",
              bgColor: "bg-sky-500/10",
              borderColor: "border-sky-500/30",
              glowColor: "rgba(14, 165, 233, 0.4)",
              tag: "Search Ads",
              href: "/ads"
            },
            {
              id: "meta_ads",
              name: "Meta (FB & IG) Ads",
              shortName: "Meta Ads",
              status: "Operational",
              sub: "Direct Page & Lead Gen Sync",
              desc: "Synchronize leads instantly from Facebook and Instagram lead gen ads directly into your team inbox.",
              icon: Share2,
              color: "text-blue-500",
              bgColor: "bg-blue-500/10",
              borderColor: "border-blue-500/30",
              glowColor: "rgba(59, 130, 246, 0.4)",
              tag: "Social Ads",
              href: "/meta-ads"
            },
            {
              id: "reviews",
              name: "Google Reviews Sync",
              shortName: "Reviews AI",
              status: "Operational",
              sub: "AI Sentiment & 100% Auto-Reply",
              desc: "Monitor Google Business Profile ratings and auto-generate personalized, positive brand responses.",
              icon: Star,
              color: "text-amber-500",
              bgColor: "bg-amber-500/10",
              borderColor: "border-amber-500/30",
              glowColor: "rgba(245, 158, 11, 0.4)",
              tag: "Reputation",
              href: "/reviews"
            },
            {
              id: "chatbot",
              name: "Drag-and-Drop Chatbot",
              shortName: "Flow Bot",
              status: "Operational",
              sub: "Visual Builder with Multi-Paths",
              desc: "Design complex conversation workflows, qualification branching, and dynamic CRM variable updates.",
              icon: MessageCircle,
              color: "text-teal-500",
              bgColor: "bg-teal-500/10",
              borderColor: "border-teal-500/30",
              glowColor: "rgba(20, 184, 166, 0.4)",
              tag: "Automation",
              href: "/flows"
            },
            {
              id: "ai_agent",
              name: "Autonomous 24/7 AI Agent",
              shortName: "AI Agent",
              status: "Operational",
              sub: "Bring Any LLM Key (Zero Markup)",
              desc: "Empower your inbox with OpenAI, Claude, or Gemini models responding naturally to customer inquiries round the clock.",
              icon: Bot,
              color: "text-purple-500",
              bgColor: "bg-purple-500/10",
              borderColor: "border-purple-500/30",
              glowColor: "rgba(168, 85, 247, 0.4)",
              tag: "Intelligence",
              href: "/ai-agent"
            },
            {
              id: "instagram_dm",
              name: "Instagram DM & Comments",
              shortName: "Instagram",
              status: "Operational",
              sub: "Post Triggered Direct Responses",
              desc: "Instantly auto-DM users when they comment keyword triggers on reels and feed posts to capture hot leads.",
              icon: InstagramIcon,
              color: "text-rose-500",
              bgColor: "bg-rose-500/10",
              borderColor: "border-rose-500/30",
              glowColor: "rgba(244, 63, 94, 0.4)",
              tag: "Social Growth",
              href: "/instagram"
            },
            {
              id: "gmail",
              name: "Gmail Automation",
              shortName: "Gmail AI",
              status: "Operational",
              sub: "AI Smart Drafts & Follow-ups",
              desc: "Sync emails, generate context-aware draft replies, and schedule automated high-converting follow-ups.",
              icon: Mail,
              color: "text-orange-500",
              bgColor: "bg-orange-500/10",
              borderColor: "border-orange-500/30",
              glowColor: "rgba(249, 115, 22, 0.4)",
              tag: "Email Outreach",
              href: "/gmail"
            },
            {
              id: "youtube",
              name: "YouTube Sentiment Sync",
              shortName: "YouTube",
              status: "Operational",
              sub: "Video Comments Monitor & Replies",
              desc: "Detect positive, neutral, or negative sentiment on video comments and engage leads right from your dashboard.",
              icon: YoutubeIcon,
              color: "text-red-500",
              bgColor: "bg-red-500/10",
              borderColor: "border-red-500/30",
              glowColor: "rgba(239, 68, 68, 0.4)",
              tag: "Video CRM",
              href: "/youtube"
            },
            {
              id: "calendar",
              name: "Google Calendar Booking",
              shortName: "Calendar",
              status: "Operational",
              sub: "Direct Meet & Slot Synchronization",
              desc: "Enable automated appointment bookings with real-time Google Calendar slot availability checking.",
              icon: Calendar,
              color: "text-indigo-500",
              bgColor: "bg-indigo-500/10",
              borderColor: "border-indigo-500/30",
              glowColor: "rgba(99, 102, 241, 0.4)",
              tag: "Scheduling",
              href: "/dashboard"
            },
            {
              id: "linkedin",
              name: "LinkedIn Post Scheduler",
              shortName: "LinkedIn",
              status: "Operational",
              sub: "B2B Social Lead Generation",
              desc: "Schedule B2B thought-leadership content, track company page engagement, and route incoming leads.",
              icon: Globe,
              color: "text-cyan-500",
              bgColor: "bg-cyan-500/10",
              borderColor: "border-cyan-500/30",
              glowColor: "rgba(6, 182, 212, 0.4)",
              tag: "B2B Pipeline",
              href: "/linkedin"
            },
            {
              id: "inbox",
              name: "Multi-Agent Team Inbox",
              shortName: "Team Inbox",
              status: "Operational",
              sub: "Unified Cross-Channel Workspace",
              desc: "Manage WhatsApp, Instagram, Gmail, and Reviews from one cohesive cockpit with teammate assignments.",
              icon: Inbox,
              color: "text-brand-blue",
              bgColor: "bg-sky-500/10",
              borderColor: "border-sky-500/30",
              glowColor: "rgba(2, 132, 199, 0.4)",
              tag: "Collaboration",
              href: "/dashboard"
            },
          ];

          // 1. First check which modules are working / enabled for this organization
          const hasLoadedOrg = !!orgData || (typeof window !== "undefined" && localStorage.getItem("enabled_modules") !== null);
          const rawEnabledList: string[] = (() => {
            if (orgData && Array.isArray(orgData.enabledModules)) {
              return orgData.enabledModules;
            }
            if (typeof window !== "undefined") {
              try {
                const cached = localStorage.getItem("enabled_modules");
                if (cached !== null) {
                  const parsed = JSON.parse(cached);
                  if (Array.isArray(parsed)) return parsed;
                }
              } catch (_) {}
            }
            return [];
          })();

          // Helper to check if a specific module key is enabled
          const isModActive = (mId: string): boolean => {
            // If organization has loaded and enabledModules is explicitly empty, all access is removed
            if (hasLoadedOrg && rawEnabledList.length === 0) {
              return false;
            }
            if (!hasLoadedOrg && rawEnabledList.length === 0) {
              // Initial default before network response
              return true;
            }
            if (rawEnabledList.includes(mId)) return true;
            if (mId === "instagram_dm" && (rawEnabledList.includes("instagram") || rawEnabledList.includes("instagram_dm"))) return true;
            if (mId === "chatbot" && (rawEnabledList.includes("flows") || rawEnabledList.includes("chatbot") || rawEnabledList.includes("whatsapp"))) return true;
            if (mId === "inbox" && (rawEnabledList.includes("inbox") || rawEnabledList.includes("whatsapp") || rawEnabledList.includes("tools"))) return true;
            if (mId === "calendar" && (rawEnabledList.includes("calendar") || rawEnabledList.includes("gmb") || rawEnabledList.includes("tools"))) return true;
            return false;
          };

          // Filter to only modules that are active / working
          const activeModules = ALL_CRM_MODULES.filter(m => isModActive(m.id));
          const inactiveModules = ALL_CRM_MODULES.filter(m => !isModActive(m.id));

          // Effective active modules count
          const activeCount = activeModules.length;
          const isSingleModule = activeCount === 1;
          const isZeroModule = activeCount === 0;

          // Find latest revocation/removal notice from admin notifications if present
          const adminNotice = notifications.find(n => 
            n.message.toLowerCase().includes("module") || 
            n.title?.toLowerCase().includes("module") || 
            n.priority === "high" || 
            n.priority === "urgent"
          );

          const safeIndex = activeCount > 0 ? (activeModuleIndex % activeModules.length) : 0;
          const activeMod = activeModules[safeIndex] || ALL_CRM_MODULES[0];
          const ActiveIcon = activeMod.icon;

          return (
            <section className="space-y-6">
              {/* Header with status counter & controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="relative flex h-2.5 w-2.5">
                      {isZeroModule ? (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      ) : (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </>
                      )}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Active CRM Platform Modules
                    </h3>
                    <Badge variant="outline" className={`font-bold text-[10px] px-2 py-0.5 ${
                      isZeroModule
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : activeCount === 12
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {isZeroModule ? "0/12 Active (Paused)" : `${activeCount}/12 Live for this Client`}
                    </Badge>

                    {inactiveModules.length > 0 && !isZeroModule && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        ({inactiveModules.length} waiting admin assignment)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setReportExportModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    title="Export verified audit report of all working modules with technical specifications"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download Report</span>
                  </button>

                  {!isSingleModule && !isZeroModule && (
                    <button
                      type="button"
                      onClick={() => setIsAutoRotating(!isAutoRotating)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      title={isAutoRotating ? "Pause auto-rotation" : "Resume auto-rotation"}
                    >
                      {isAutoRotating ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Auto-Rotating</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  )}

                  <Link
                    href="/#cockpit"
                    className="text-xs font-bold text-brand-blue hover:text-brand-blue-deep bg-sky-50 hover:bg-sky-100 border border-sky-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>Cockpit Showcase</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* ── CASE 0: ZERO MODULES ACTIVE (ADMIN REMOVED ALL ACCESS) ── */}
              {isZeroModule ? (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50/70 via-white to-rose-50/40 border border-amber-200/90 p-8 sm:p-12 shadow-xl shadow-amber-500/5 text-slate-900">
                  {/* Soft ambient lighting */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
                    <div className="p-4 rounded-3xl bg-amber-100 border border-amber-200 text-amber-700 shadow-md">
                      <Lock className="w-10 h-10 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>No Current Services / Modules Available</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Your CRM Module Access is Currently Paused
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                        The Super Administrator has temporarily deactivated all module capabilities for this organization workspace.
                      </p>
                    </div>

                    {/* Admin Reason Card (if admin provided a reason or sent notice) */}
                    {(adminNotice || suspensionReason) && (
                      <div className="w-full bg-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-left shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-wider">
                          <Info className="w-4 h-4 text-amber-600" />
                          <span>Admin Stated Reason / Notice</span>
                        </div>
                        <p className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 font-medium leading-relaxed">
                          {adminNotice ? adminNotice.message : suspensionReason}
                        </p>
                        {adminNotice && (
                          <div className="text-[10px] text-slate-400 text-right">
                            Notice sent by {adminNotice.sender} • {new Date(adminNotice.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons: Message Admin & Notifications */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMsgTitle("Inquiry: Request to Restore Module Access");
                          setMsgBody(
                            "Hello Administrator,\n\nOur workspace currently shows that all module access is paused. Could you please review and restore access to our CRM modules or let us know what is required?\n\nThank you."
                          );
                          setIsComposingMessage(true);
                          setShowNotificationsModal(true);
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-deep text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Message to Admin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowNotificationsModal(true)}
                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>Check Admin Notices ({notifications.length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : isSingleModule ? (
                /* ── CASE 1: ONLY ONE MODULE ACTIVE -> Light Theme Radar & Clean Waveform UI ── */
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50/70 via-white to-slate-50/80 border border-slate-200/90 p-8 sm:p-12 shadow-lg shadow-slate-200/60 text-slate-900">
                  {/* Soft Light Mode Ambient Glares */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-20 blur-3xl"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${activeMod.glowColor}, transparent 65%)`
                    }}
                  />
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-200/35 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />

                  {/* Concentric Light Radar Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] rounded-full border border-sky-300/40 animate-ping opacity-30" style={{ animationDuration: "3.5s" }} />
                    <div className="absolute w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rounded-full border border-dashed border-brand-blue/35 animate-[spin_30s_linear_infinite]" />
                    <div className="absolute w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] rounded-full border border-slate-200/90" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-5">
                    {/* Mode Tag */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200 text-xs font-black text-brand-blue shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Single Active Dedicated Module Focus</span>
                    </div>

                    {/* Central Solo Pulsing Card (Light Theme) */}
                    <motion.div
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="relative p-7 sm:p-9 rounded-3xl bg-white/95 backdrop-blur-xl border-2 shadow-xl flex flex-col items-center space-y-4 max-w-sm w-full group"
                      style={{
                        borderColor: activeMod.glowColor,
                        boxShadow: `0 15px 35px -5px ${activeMod.glowColor}, 0 4px 12px rgba(0,0,0,0.04)`
                      }}
                    >
                      <div className={`p-4 sm:p-5 rounded-3xl ${activeMod.bgColor} ${activeMod.color} shadow-sm ring-4 ring-slate-100 group-hover:scale-110 transition-transform duration-300`}>
                        <ActiveIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ● {activeMod.status} &amp; Synced
                        </span>
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                          {activeMod.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-brand-blue font-bold">
                          {activeMod.sub}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed px-2">
                        {activeMod.desc}
                      </p>

                      <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          Category: {activeMod.tag}
                        </span>
                        {activeMod.href && (
                          <Link
                            href={activeMod.href}
                            className="inline-flex items-center gap-1 font-bold text-brand-blue hover:text-brand-blue-deep hover:underline"
                          >
                            <span>Open Console</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </motion.div>

                    {/* Notice for remaining modules */}
                    <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs max-w-md text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
                        <Sparkles className="w-4 h-4 text-brand-blue" />
                        <span>11 Additional Modules Available in Your All-In-One Pass</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        The super admin has assigned you this focused suite. Contact admin if you need access to any other platform module.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── CASE 2: MORE THAN ONE MODULE ACTIVE -> Circular 360° Rotating Graphics with Active Modules ── */
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50/80 via-white to-sky-50/30 border border-slate-200/90 p-6 sm:p-10 shadow-lg shadow-slate-200/50 text-slate-900">
                  {/* Background ambient lighting effects (Light mode) */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-25 blur-3xl"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${activeMod.glowColor}, transparent 65%)`
                    }}
                  />
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />

                  {/* Subtitle / Mode prompt */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Displaying {activeCount} active platform modules in circular orbit</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span className="text-brand-blue font-bold">Node {safeIndex + 1}</span> / {activeCount}
                    </div>
                  </div>

                  {/* ── Visual Circle Rotating Stage (Calculated specifically for active count) ── */}
                  <div className="relative z-10 w-full min-h-[440px] sm:min-h-[500px] flex items-center justify-center py-6 select-none">
                    {/* Decorative Orbit Concentric Rings (Light Theme) */}
                    <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full border border-dashed border-sky-400/35 animate-[spin_60s_linear_infinite] pointer-events-none" />
                    <div className="absolute w-[210px] h-[210px] sm:w-[280px] sm:h-[280px] rounded-full border border-slate-200/90 pointer-events-none" />
                    <div className="absolute w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full border border-slate-200/60 pointer-events-none" />

                    {/* Pulsing Central Hub with Currently Active Module Detail (Light Theme) */}
                    <div className="relative z-20 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full bg-white/95 border-2 backdrop-blur-xl p-4 flex flex-col items-center justify-center text-center shadow-xl transition-all duration-500 hover:scale-105 group"
                      style={{
                        borderColor: activeMod.glowColor,
                        boxShadow: `0 10px 35px -5px ${activeMod.glowColor}, 0 4px 12px rgba(0,0,0,0.05)`
                      }}
                    >
                      <div className={`p-3 rounded-2xl ${activeMod.bgColor} ${activeMod.color} mb-1.5 transition-transform duration-300 group-hover:scale-110 shadow-2xs`}>
                        <ActiveIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-1 mb-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        {activeMod.status}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                        {activeMod.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 px-1 leading-snug">
                        {activeMod.sub}
                      </p>
                      <span className="mt-2 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                        {activeMod.tag}
                      </span>
                    </div>

                    {/* ── Active Orbiting Nodes arranged along 360° circle ── */}
                    {activeModules.map((mod, idx) => {
                      const total = activeModules.length;
                      // Angle in radians (starts from top -90deg, distributed evenly across active count)
                      const angle = ((idx / total) * 360 - 90) * (Math.PI / 180);
                      const isActive = idx === safeIndex;
                      const ModIcon = mod.icon;

                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => {
                            setActiveModuleIndex(idx);
                            setIsAutoRotating(false);
                          }}
                          onMouseEnter={() => {
                            setActiveModuleIndex(idx);
                          }}
                          className={`absolute z-30 transition-all duration-300 cursor-pointer group focus:outline-none ${
                            isActive ? "scale-125 z-40" : "scale-95 opacity-80 hover:opacity-100 hover:scale-110"
                          }`}
                          style={{
                            transform: `translate(calc(cos(${angle}) * clamp(135px, 26vw, 205px)), calc(sin(${angle}) * clamp(135px, 26vw, 205px)))`
                          }}
                          aria-label={mod.name}
                        >
                          <div
                            className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                              isActive
                                ? `bg-white text-slate-900 border-2 shadow-lg ring-4 ring-sky-100`
                                : "bg-white/95 text-slate-600 border-slate-200/90 shadow-2xs hover:text-slate-900 hover:border-slate-300 hover:shadow-sm"
                            }`}
                            style={
                              isActive
                                ? {
                                    boxShadow: `0 8px 25px -4px ${mod.glowColor}`,
                                    borderColor: mod.glowColor,
                                  }
                                : undefined
                            }
                          >
                            <ModIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? mod.color : "group-hover:text-slate-900"}`} />

                            {/* Active ripple dot indicator */}
                            {isActive && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                              </span>
                            )}

                            {/* Floating module name badge tooltip (Light Theme) */}
                            <div className={`hidden sm:block absolute whitespace-nowrap px-2 py-0.5 rounded-lg text-[9px] font-bold pointer-events-none transition-all duration-200 ${
                              isActive
                                ? "opacity-100 -bottom-6 bg-white text-slate-900 border border-slate-200 shadow-md scale-100"
                                : "opacity-0 group-hover:opacity-100 -bottom-6 bg-white/95 text-slate-700 border border-slate-200 shadow-xs scale-90"
                            }`}>
                              {mod.shortName}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Active Module Spotlight Footer Bar inside the Cockpit (Light Theme) ── */}
                  <div className="relative z-10 mt-2 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 w-full md:w-auto">
                      <div className={`p-2.5 rounded-xl ${activeMod.bgColor} ${activeMod.color} shrink-0 shadow-2xs`}>
                        <ActiveIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{activeMod.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {activeMod.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {activeMod.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModuleIndex((prev) => (prev - 1 + activeCount) % activeCount);
                          setIsAutoRotating(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                      >
                        ← Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModuleIndex((prev) => (prev + 1) % activeCount);
                          setIsAutoRotating(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-bold transition-all shadow-md shadow-brand-blue/20 cursor-pointer"
                      >
                        Next Module →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Interactive Grid Cards (Synchronized with active status) ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Workspace Module Status ({activeCount} Active / {ALL_CRM_MODULES.length} Total)
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {isSingleModule ? "Dedicated single module workspace" : "Hover or click any card to inspect"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {ALL_CRM_MODULES.map((mod) => {
                    const active = isModActive(mod.id);
                    const activeIdxInActiveList = activeModules.findIndex(m => m.id === mod.id);
                    const isSelected = active && activeIdxInActiveList === safeIndex;
                    const ModIcon = mod.icon;

                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          if (active && activeIdxInActiveList !== -1) {
                            setActiveModuleIndex(activeIdxInActiveList);
                            setIsAutoRotating(false);
                          }
                        }}
                        onMouseEnter={() => {
                          if (active && activeIdxInActiveList !== -1) {
                            setActiveModuleIndex(activeIdxInActiveList);
                          }
                        }}
                        className={`group p-4 rounded-2xl transition-all duration-300 flex flex-col justify-between space-y-2.5 border ${
                          active
                            ? isSelected
                              ? "bg-white border-brand-blue shadow-lg shadow-brand-blue/10 scale-[1.02] ring-2 ring-brand-blue/20 cursor-pointer"
                              : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm cursor-pointer"
                            : "bg-slate-50/70 border-slate-200/60 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`p-1.5 rounded-lg transition-colors ${
                              active
                                ? isSelected
                                  ? mod.bgColor + " " + mod.color
                                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                : "bg-slate-200 text-slate-400"
                            }`}>
                              <ModIcon className="w-4 h-4 shrink-0" />
                            </div>
                            <span className={`text-xs font-black truncate transition-colors ${
                              active
                                ? isSelected
                                  ? "text-brand-blue font-extrabold"
                                  : "text-slate-800"
                                : "text-slate-400"
                            }`}>
                              {mod.name}
                            </span>
                          </div>
                          <span className={`h-2 w-2 rounded-full shrink-0 ${
                            active
                              ? isSelected
                                ? "bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"
                                : "bg-emerald-500"
                              : "bg-slate-300"
                          }`} />
                        </div>

                        <p className={`text-[11px] leading-tight ${active ? "text-slate-500" : "text-slate-400 line-through"}`}>
                          {mod.sub}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">
                            {mod.tag}
                          </span>
                          {active ? (
                            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="font-bold text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Admin Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })()}

      </main>

      {/* ── Edit Profile & Business Details Modal ── */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-brand-blue">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Operator &amp; Business Profile</h3>
                  <p className="text-xs text-slate-500">Update your company details, contact numbers &amp; commerce profile</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 text-xs font-semibold text-slate-700">
              
              {/* Operator Personal Details */}
              <div className="space-y-3 pb-3 border-b border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-brand-blue flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Operator Contact Info
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Raj Joshi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-bold">Registered Email ID (Locked)</label>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Permanent
                      </span>
                    </div>
                    <input
                      type="email"
                      disabled
                      readOnly
                      value={editForm.email}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed outline-none select-none font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Company login email cannot be changed.</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      value={editForm.gstin}
                      onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value.toUpperCase() })}
                      placeholder="27AABCU9603R1ZM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs uppercase font-mono focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Business Entity Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Business &amp; Commerce Details
                  </p>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                    Name changes require Super Admin Approval
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Commercial Business Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.businessName}
                      onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                      placeholder="e.g. Acme Tech Solutions"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                    <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Changing name submits request for Super Admin approval
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Industry / Category</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="e.g. Retail & Electronics / Mobile Services"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Website URL</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    placeholder="https://rajmobileshop.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Commercial Address / Store Location</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Shop No. 4, Main Market, Mumbai, Maharashtra 400001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">About Business (Summary &amp; Speciality)</label>
                  <textarea
                    rows={3}
                    value={editForm.about}
                    onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                    placeholder="Describe your products, services, operating hours or customer value proposition..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditingProfile(false)}
                  className="font-bold text-xs text-slate-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md shadow-brand-blue/20 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* Super Admin Messages & Notifications Drawer / Modal */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Super Admin Communication
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Announcements, broadcasts, and direct messages with management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isComposingMessage && notifications.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer flex items-center gap-1 mr-2"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs between Feed and Compose */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => {
                  setIsComposingMessage(false);
                  setReplyingToNotif(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isComposingMessage
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Messages & Alerts</span>
                {notifications.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    !isComposingMessage ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setReplyingToNotif(null);
                  setMsgTitle("");
                  setMsgBody("");
                  setIsComposingMessage(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isComposingMessage
                    ? "bg-brand-blue text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{replyingToNotif ? "Reply to Announcement" : "Send Message to Admin"}</span>
              </button>
            </div>

            {/* Active Content: Either Compose / Reply Form OR Notifications Feed */}
            {isComposingMessage ? (
              <form onSubmit={handleSendMessageToAdmin} className="space-y-4 py-1 flex-1 flex flex-col">
                {replyingToNotif && (
                  <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sky-800 font-bold">
                        <CornerDownRight className="w-3.5 h-3.5 text-sky-600" />
                        <span>Replying to: {replyingToNotif.title || "Super Admin Announcement"}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 italic text-[11px] pl-5">
                        &ldquo;{replyingToNotif.message}&rdquo;
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToNotif(null);
                        setMsgTitle("");
                      }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Clear Reply
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject / Title</label>
                  <input
                    type="text"
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    placeholder="e.g. Plan question, technical help, billing inquiry..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-700">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder="Write your message or reply to the Super Admin here..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-brand-blue resize-none flex-1"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsComposingMessage(false);
                      setReplyingToNotif(null);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={sendingMsg || !msgBody.trim()}
                    size="sm"
                    className="bg-brand-blue hover:bg-sky-700 text-white font-bold text-xs gap-1.5 px-4 shadow-sm"
                  >
                    {sendingMsg ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{replyingToNotif ? "Send Reply" : "Send Message to Admin"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Notifications List */
              <div className="overflow-y-auto space-y-3 flex-1 pr-1 max-h-[50vh]">
                {fetchingNotifications ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
                    <span className="text-xs font-semibold">Loading messages...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="p-3 rounded-full bg-slate-50 border border-slate-200 text-slate-400">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-700">No messages yet</h4>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Whenever Super Admin transmits a broadcast or announcement, it will appear here. You can also send a direct inquiry to Admin anytime.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingToNotif(null);
                        setMsgTitle("");
                        setMsgBody("");
                        setIsComposingMessage(true);
                      }}
                      className="text-xs font-bold gap-1.5 border-sky-300 text-brand-blue hover:bg-sky-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>Write Message to Admin</span>
                    </Button>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isClientMsg = notif.priority === "client_message" || (notif.sender && notif.sender.toLowerCase().startsWith("client"));
                    const dateStr = new Date(notif.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const timeStr = new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={notif.id}
                        onClick={() => !notif.isRead && handleMarkNotificationRead(notif.id)}
                        className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                          isClientMsg
                            ? "bg-slate-50/90 border-slate-200 text-slate-800 ml-4 shadow-2xs"
                            : notif.isRead
                            ? "bg-white border-slate-200/80 text-slate-600"
                            : "bg-sky-50/40 border-sky-200 text-slate-900 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {!notif.isRead && !isClientMsg && (
                              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
                            )}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                              isClientMsg
                                ? "bg-purple-100 text-purple-800 border-purple-300"
                                : notif.priority === "urgent"
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : notif.priority === "high"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-sky-100 text-sky-800 border-sky-300"
                            }`}>
                              {isClientMsg ? "Your Message to Admin" : notif.priority || "Announcement"}
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              {notif.title || (isClientMsg ? "Direct Inquiry" : "Super Admin Broadcast")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{dateStr} at {timeStr}</span>
                          </div>
                        </div>

                        <p className={`text-xs leading-relaxed font-medium pl-3.5 border-l-2 ${
                          isClientMsg
                            ? "border-purple-300 text-slate-700"
                            : "border-sky-300 text-slate-800"
                        }`}>
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>From: <strong className="text-slate-700">{isClientMsg ? "You (Client)" : notif.sender || "Super Admin"}</strong></span>
                            {!isClientMsg && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInitiateReply(notif);
                                }}
                                className="px-2 py-0.5 rounded-md bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold border border-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Reply className="w-2.5 h-2.5" />
                                <span>Reply</span>
                              </button>
                            )}
                          </div>

                          {isClientMsg ? (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <CheckCheck className="w-3 h-3 text-sky-600" /> Delivered to Super Admin
                            </span>
                          ) : notif.isRead ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Read
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkNotificationRead(notif.id);
                              }}
                              className="text-sky-700 font-bold hover:underline cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {!isComposingMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingToNotif(null);
                    setMsgTitle("");
                    setMsgBody("");
                    setIsComposingMessage(true);
                  }}
                  className="text-xs font-bold gap-1.5 border-sky-300 text-brand-blue hover:bg-sky-50"
                >
                  <Send className="w-3 h-3" />
                  <span>Send New Message to Admin</span>
                </Button>
              )}
              {isComposingMessage && <div />}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotificationsModal(false)}
                className="text-xs font-bold ml-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Format Selection Modal (PDF / DOC / CSV) ── */}
      {reportExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl animate-scaleUp">
            
            {/* Modal Header with JISNU CRM Branding */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0F52BA] text-white shadow-md shadow-sky-500/25">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Export Workspace Audit Report
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {businessName || orgData?.organizationName || "Client Account"} • Active Modules &amp; Subscription Dossier
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReportExportModal(false)}
                className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header info badge */}
            <div className="p-3 bg-sky-50/80 border border-sky-100 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-slate-700">Official Report Title:</span>
              </div>
              <span className="font-black font-mono text-sky-800 bg-white px-2.5 py-0.5 rounded-lg border border-sky-200 text-[11px]">
                JISNU CRM
              </span>
            </div>

            {/* Format Selection Cards */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Select Report Download Format:
              </p>

              {/* PDF Option */}
              <button
                onClick={() => handlePerformProfileExport("pdf")}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-rose-400 bg-white hover:bg-rose-50/40 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-rose-900">
                      PDF Document (.pdf)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Formatted printable audit dossier with all active modules &amp; technical specs
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                  Generate PDF →
                </span>
              </button>

              {/* DOC / Word Option */}
              <button
                onClick={() => handlePerformProfileExport("doc")}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-900">
                      Word Document (.doc)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Editable Microsoft Word compatible report with structured tables
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Generate DOC →
                </span>
              </button>

              {/* CSV Spreadsheet Option */}
              <button
                onClick={() => handlePerformProfileExport("csv")}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 group-hover:scale-105 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-900">
                      CSV Spreadsheet (.csv)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Raw verified data records ready for Excel, Google Sheets, or internal auditing
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                  Generate CSV →
                </span>
              </button>
            </div>

            {/* Footer / Cancel */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setReportExportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
