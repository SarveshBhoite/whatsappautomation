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
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    code: "quarterly",
    name: "Quarterly Plan",
    durationLabel: "3 Months Access",
    durationMonths: 3,
    basePrice: 5999,
    effectiveMonthlyRate: 2000,
    tagline: "Essential starter setup for growing brands.",
    savingsText: "Standard Quarterly Rate",
    badge: "Agile Starter",
    pillClass: "bg-slate-100 text-slate-700",
  },
  {
    code: "half_yearly",
    name: "Half-Yearly Plan",
    durationLabel: "6 Months Access",
    durationMonths: 6,
    basePrice: 9999,
    effectiveMonthlyRate: 1667,
    tagline: "Balanced scale and marketing continuity.",
    savingsText: "Save ~17% vs Quarterly",
    badge: "Growing Teams",
    pillClass: "bg-emerald-100 text-emerald-800",
  },
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

  // Super Admin Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [fetchingNotifications, setFetchingNotifications] = useState<boolean>(false);

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
  const selectedTier = TIERS.find((t) => t.code === selectedPlanCode) || TIERS[2];
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
              onClick={() => setShowNotificationsModal(true)}
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const upgradeEl = document.getElementById("upgrade-section");
              if (upgradeEl) {
                setIsUpgradeSectionOpen(true);
                upgradeEl.scrollIntoView({ behavior: "smooth" });
              } else {
                setIsUpgradeSectionOpen(true);
              }
            }}
            className="border-sky-300 text-brand-blue hover:bg-sky-50 font-bold text-xs shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Upgrade / Renew
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

            <Button
              type="button"
              onClick={() => {
                setIsUpgradeSectionOpen(!isUpgradeSectionOpen);
                if (!isUpgradeSectionOpen) {
                  setTimeout(() => {
                    document.getElementById("upgrade-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
              className="bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md shadow-brand-blue/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isUpgradeSectionOpen ? "Close Plan Selector" : "Queue / Upgrade Plan"}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isUpgradeSectionOpen ? "rotate-90" : ""}`} />
            </Button>
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

        {/* ── Upgrade & Renewal Section (Opens in-place without forcing full redirect) ── */}
        {isUpgradeSectionOpen && (
          <section id="upgrade-section" className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-brand-blue shadow-xl shadow-brand-blue/10 animate-in fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-brand-blue text-xs font-bold shadow-2xs mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WORKSPACE PLAN MODIFICATION</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Select New Tier or Renew Validity
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your duration. Your active workspace will instantly extend with all 12 modules uninterrupted.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Extra Channels:</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setExtraChannels(Math.max(0, extraChannels - 1))}
                    disabled={extraChannels === 0}
                    className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900">{extraChannels}</span>
                  <button
                    type="button"
                    onClick={() => setExtraChannels(extraChannels + 1)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Tier Selector Cards inside Profile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {TIERS.map((tier) => {
                const isSelected = selectedPlanCode === tier.code;
                const isRec = tier.isRecommended;
                const tierCost = tier.basePrice + extraChannelsCost;
                const tierGst = Math.round(tierCost * 0.18 * 100) / 100;
                const tierTotal = Math.round((tierCost + tierGst) * 100) / 100;

                return (
                  <div
                    key={tier.code}
                    onClick={() => setSelectedPlanCode(tier.code)}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? isRec
                          ? "border-brand-blue bg-gradient-to-b from-sky-50/80 to-white shadow-xl ring-2 ring-brand-blue/30 -translate-y-1"
                          : "border-brand-blue bg-sky-50/50 shadow-md ring-2 ring-brand-blue/20"
                        : isRec
                        ? "border-sky-300 bg-sky-50/30 hover:border-brand-blue/60 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {/* Top Badge */}
                    {isRec ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-brand-blue to-emerald-600 text-white uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                          {tier.badge}
                        </span>
                      </div>
                    ) : (
                      <div className="absolute -top-2.5 right-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${tier.pillClass}`}>
                          {tier.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-base">{tier.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{tier.tagline}</p>
                      
                      {/* Price Block */}
                      <div className="pt-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-black text-slate-900">₹{tier.basePrice.toLocaleString("en-IN")}</span>
                            <span className="text-[10px] text-slate-500 ml-1">/ {tier.durationMonths} Mo</span>
                          </div>
                          <span className={`text-xs font-black ${isRec ? "text-emerald-700" : "text-slate-600"}`}>
                            ~₹{tier.effectiveMonthlyRate.toLocaleString("en-IN")}/mo
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            isRec ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {tier.savingsText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Base + {extraChannels} Extra:</span>
                        <span className="font-semibold">₹{tierCost.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span className="font-semibold">₹{tierGst.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200/60 pt-1">
                        <span>Total Payable:</span>
                        <span className={isRec ? "text-brand-blue font-black" : "text-slate-900"}>
                          ₹{tierTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upgrade CTA Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Selected for Renewal / Upgrade:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-900">{selectedTier.name}</span>
                  <span className="text-sm font-bold text-brand-blue">₹{upgradeTotal.toLocaleString("en-IN")} (incl. 18% GST)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => setIsUpgradeSectionOpen(false)}
                  className="font-bold text-xs text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isProcessingUpgrade}
                  onClick={handleProceedUpgrade}
                  className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md shadow-brand-blue/20"
                >
                  {isProcessingUpgrade ? "Processing..." : `Confirm & Pay ₹${upgradeTotal.toLocaleString("en-IN")}`}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── Active CRM Services & Workspace Capabilities (Cockpit Style) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Active CRM Platform Modules
              </h3>
              <p className="text-xs text-slate-500">
                All 12 modules included with zero per-module paywalls.
              </p>
            </div>
            <Link href="/#cockpit" className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
              <span>View Cockpit Showcase</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { name: "WhatsApp Cloud API", status: "Operational", sub: "Official Meta Embedded Connect", color: "text-emerald-600" },
              { name: "Google Ads Manager", status: "Operational", sub: "1-Click Search & PMax Suite", color: "text-brand-blue" },
              { name: "Meta (FB & IG) Ads", status: "Operational", sub: "Direct Page & Lead Gen Sync", color: "text-sky-600" },
              { name: "Google Reviews Sync", status: "Operational", sub: "AI Sentiment & 100% Auto-Reply", color: "text-amber-600" },
              { name: "Drag-and-Drop Chatbot", status: "Operational", sub: "Visual Builder with Multi-Paths", color: "text-emerald-600" },
              { name: "Autonomous 24/7 AI Agent", status: "Operational", sub: "Bring Any LLM Key (Zero Markup)", color: "text-purple-600" },
              { name: "Instagram DM & Comments", status: "Operational", sub: "Post Triggered Direct Responses", color: "text-rose-600" },
              { name: "Gmail Automation", status: "Operational", sub: "AI Smart Drafts & Follow-ups", color: "text-orange-600" },
              { name: "YouTube Sentiment Sync", status: "Operational", sub: "Video Comments Monitor & Replies", color: "text-red-600" },
              { name: "Google Calendar Booking", status: "Operational", sub: "Direct Meet & Slot Synchronization", color: "text-blue-600" },
              { name: "LinkedIn Post Scheduler", status: "Operational", sub: "B2B Social Lead Generation", color: "text-indigo-600" },
              { name: "Multi-Agent Team Inbox", status: "Operational", sub: "Unified Cross-Channel Workspace", color: "text-brand-blue" },
            ].map((module, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 truncate">{module.name}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{module.sub}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Status</span>
                  <span className="font-extrabold text-emerald-600">{module.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

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
                    Super Admin Announcements
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Direct broadcasts and alerts from platform management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
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

            {/* Notifications List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {fetchingNotifications ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
                  <span className="text-xs font-semibold">Loading messages...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="p-3 rounded-full bg-slate-50 border border-slate-200 text-slate-400">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No announcements yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Whenever Super Admin transmits a broadcast, alert, or update, it will appear here with the exact timestamp.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        notif.isRead
                          ? "bg-slate-50/70 border-slate-200/80 text-slate-600"
                          : "bg-sky-50/40 border-sky-200 text-slate-900 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
                          )}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                            notif.priority === "urgent"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : notif.priority === "high"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-sky-100 text-sky-800 border-sky-300"
                          }`}>
                            {notif.priority || "Announcement"}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {notif.title || "Super Admin Broadcast"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{dateStr} at {timeStr}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium pl-4 border-l-2 border-sky-200">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>Sender: <strong>{notif.sender || "Super Admin"}</strong></span>
                        {notif.isRead ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Read
                          </span>
                        ) : (
                          <span className="text-sky-700 font-bold">Click to mark read</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotificationsModal(false)}
                className="text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
