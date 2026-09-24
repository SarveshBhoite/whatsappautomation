"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Link2,
  Tag,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  HelpCircle,
  Sparkles,
  Megaphone,
  X,
  FileText
} from "lucide-react";

interface StructuredSnippetItem {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  header: string;
  values: string[];
  policyApprovalStatus: string;
  policyReviewStatus: string;
  campaigns?: Array<{ campaignId: string; campaignName: string; resourceName: string }>;
}

interface PromotionItem {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  promotionTarget: string;
  discountText: string;
  percentOff?: number | null;
  moneyAmountOff?: { amount: number; currencyCode: string } | null;
  occasion: string;
  promotionCode?: string;
  startDate?: string;
  endDate?: string;
  languageCode: string;
  finalUrls: string[];
  policyApprovalStatus: string;
  policyReviewStatus: string;
  campaigns?: Array<{ campaignId: string; campaignName: string; resourceName: string }>;
}

interface LeadFormItem {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  businessName: string;
  headline: string;
  description: string;
  privacyPolicyUrl: string;
  callToActionType: string;
  callToActionDescription: string;
  postSubmitHeadline: string;
  postSubmitDescription: string;
  fields: Array<{ inputType: string }>;
  policyApprovalStatus: string;
  policyReviewStatus: string;
  campaigns?: Array<{ campaignId: string; campaignName: string; resourceName: string }>;
}

interface CampaignItem {
  id: string;
  name: string;
  resourceName?: string;
}

interface GoogleAdsAssetsSectionProps {
  customerId: string;
  orgId: string;
  campaigns?: CampaignItem[];
}

const SNIPPET_HEADERS = [
  "Amenities",
  "Brands",
  "Courses",
  "Degree programs",
  "Destinations",
  "Featured hotels",
  "Insurance coverage",
  "Models",
  "Neighborhoods",
  "Service catalog",
  "Services",
  "Shows",
  "Styles",
  "Types"
];

const PROMOTION_OCCASIONS = [
  { value: "NONE", label: "None / General Sale" },
  { value: "NEW_YEARS", label: "New Year's" },
  { value: "CHINESE_NEW_YEAR", label: "Chinese New Year" },
  { value: "VALENTINES_DAY", label: "Valentine's Day" },
  { value: "EASTER", label: "Easter" },
  { value: "MOTHERS_DAY", label: "Mother's Day" },
  { value: "FATHERS_DAY", label: "Father's Day" },
  { value: "LABOR_DAY", label: "Labor Day" },
  { value: "BACK_TO_SCHOOL", label: "Back to School" },
  { value: "HALLOWEEN", label: "Halloween" },
  { value: "BLACK_FRIDAY", label: "Black Friday" },
  { value: "CYBER_MONDAY", label: "Cyber Monday" },
  { value: "CHRISTMAS", label: "Christmas" },
  { value: "BOXING_DAY", label: "Boxing Day" },
  { value: "EID_AL_FITR", label: "Eid al-Fitr" },
  { value: "EID_AL_ADHA", label: "Eid al-Adha" },
  { value: "DIWALI", label: "Diwali" },
  { value: "SUMMER_SALE", label: "Summer Sale" },
  { value: "WINTER_SALE", label: "Winter Sale" }
];

const LEAD_FORM_CTAS = [
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "GET_QUOTE", label: "Get Quote" },
  { value: "APPLY_NOW", label: "Apply Now" },
  { value: "SIGN_UP", label: "Sign Up" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "SUBSCRIBE", label: "Subscribe" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "BOOK_NOW", label: "Book Now" },
  { value: "GET_OFFER", label: "Get Offer" },
  { value: "REGISTER", label: "Register" },
  { value: "GET_STARTED", label: "Get Started" }
];

export function GoogleAdsAssetsSection({ customerId, orgId, campaigns = [] }: GoogleAdsAssetsSectionProps) {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Subtabs
  const [activeAssetType, setActiveAssetType] = useState<"snippets" | "promotions" | "lead-forms">("snippets");

  // Data states
  const [snippets, setSnippets] = useState<StructuredSnippetItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [leadForms, setLeadForms] = useState<LeadFormItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isLeadFormModalOpen, setIsLeadFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Snippet Form
  const [snippetHeader, setSnippetHeader] = useState("Services");
  const [snippetValues, setSnippetValues] = useState<string[]>(["", "", ""]);
  const [snippetCampaign, setSnippetCampaign] = useState("");

  // Promo Form
  const [promoTarget, setPromoTarget] = useState("");
  const [promoDiscountType, setPromoDiscountType] = useState<"PERCENT_OFF" | "MONEY_AMOUNT_OFF">("PERCENT_OFF");
  const [promoPercent, setPromoPercent] = useState<number | "">(20);
  const [promoMoney, setPromoMoney] = useState<number | "">("");
  const [promoCurrency, setPromoCurrency] = useState("INR");
  const [promoOccasion, setPromoOccasion] = useState("NONE");
  const [promoCode, setPromoCode] = useState("");
  const [promoStartDate, setPromoStartDate] = useState("");
  const [promoEndDate, setPromoEndDate] = useState("");
  const [promoFinalUrl, setPromoFinalUrl] = useState("");
  const [promoCampaign, setPromoCampaign] = useState("");

  // Lead Form
  const [lfBusinessName, setLfBusinessName] = useState("");
  const [lfHeadline, setLfHeadline] = useState("");
  const [lfDescription, setLfDescription] = useState("");
  const [lfPrivacyUrl, setLfPrivacyUrl] = useState("");
  const [lfCtaType, setLfCtaType] = useState("LEARN_MORE");
  const [lfCtaDesc, setLfCtaDesc] = useState("Apply today");
  const [lfPostHeadline, setLfPostHeadline] = useState("Thank you");
  const [lfPostDesc, setLfPostDesc] = useState("We will contact you shortly");
  const [lfFields, setLfFields] = useState<string[]>(["FULL_NAME", "EMAIL", "PHONE_NUMBER"]);
  const [lfCampaign, setLfCampaign] = useState("");

  const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

  // ── Fetch Assets ────────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    if (!cleanCid) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeAssetType === "snippets") {
        const res = await fetch(`${BACKEND}/api/ads/assets/structured-snippets?customerId=${cleanCid}`, {
          headers: { "x-organization-id": orgId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSnippets(data.items || []);
        } else {
          setErrorMsg(data.error || "Failed to load structured snippets");
        }
      } else if (activeAssetType === "promotions") {
        const res = await fetch(`${BACKEND}/api/ads/assets/promotions?customerId=${cleanCid}`, {
          headers: { "x-organization-id": orgId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPromotions(data.items || []);
        } else {
          setErrorMsg(data.error || "Failed to load promotions");
        }
      } else if (activeAssetType === "lead-forms") {
        const res = await fetch(`${BACKEND}/api/ads/assets/lead-forms?customerId=${cleanCid}`, {
          headers: { "x-organization-id": orgId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLeadForms(data.items || []);
        } else {
          setErrorMsg(data.error || "Failed to load lead forms");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error loading assets");
    } finally {
      setLoading(false);
    }
  }, [cleanCid, orgId, activeAssetType, BACKEND]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // ── Handle Delete Asset ────────────────────────────────────────────────────
  const handleDeleteAsset = async (resourceName: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove asset "${name || resourceName}"? This action removes it from Google Ads.`)) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/assets?customerId=${cleanCid}&resourceName=${encodeURIComponent(resourceName)}`, {
        method: "DELETE",
        headers: { "x-organization-id": orgId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAssets();
      } else {
        alert(data.error || "Failed to remove asset from Google Ads");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting asset");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Save Snippet ───────────────────────────────────────────────────────────
  const handleSaveSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVals = snippetValues.map(v => v.trim()).filter(Boolean);
    if (!snippetHeader.trim()) {
      alert("Please select or enter a snippet header.");
      return;
    }
    if (cleanVals.length < 3) {
      alert("Google Ads requires at least 3 values for a structured snippet.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // PATCH
        const res = await fetch(`${BACKEND}/api/ads/assets/structured-snippets`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            resourceName: editingItem.resourceName,
            header: snippetHeader.trim(),
            values: cleanVals
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsSnippetModalOpen(false);
          setEditingItem(null);
          fetchAssets();
        } else {
          alert(data.error || "Failed to update structured snippet");
        }
      } else {
        // POST
        const res = await fetch(`${BACKEND}/api/ads/assets/structured-snippets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            header: snippetHeader.trim(),
            values: cleanVals,
            campaignResourceName: snippetCampaign || undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsSnippetModalOpen(false);
          setSnippetValues(["", "", ""]);
          fetchAssets();
        } else {
          alert(data.error || "Failed to create structured snippet");
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed saving snippet");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Save Promotion ─────────────────────────────────────────────────────────
  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTarget.trim()) {
      alert("Promotion Target Item or Service is required.");
      return;
    }
    if (!promoFinalUrl.trim() || !promoFinalUrl.startsWith("http")) {
      alert("Please enter a valid HTTP/HTTPS Final URL.");
      return;
    }
    if (promoDiscountType === "PERCENT_OFF" && (!promoPercent || Number(promoPercent) <= 0 || Number(promoPercent) > 100)) {
      alert("Percent off must be between 1 and 100.");
      return;
    }
    if (promoDiscountType === "MONEY_AMOUNT_OFF" && (!promoMoney || Number(promoMoney) <= 0)) {
      alert("Money discount amount must be greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await fetch(`${BACKEND}/api/ads/assets/promotions`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            resourceName: editingItem.resourceName,
            promotionTarget: promoTarget.trim(),
            discountType: promoDiscountType,
            percentOff: promoDiscountType === "PERCENT_OFF" ? Number(promoPercent) : undefined,
            moneyAmountOff: promoDiscountType === "MONEY_AMOUNT_OFF" ? {
              amount: Number(promoMoney),
              currencyCode: promoCurrency
            } : undefined,
            occasion: promoOccasion,
            promotionCode: promoCode.trim() || undefined,
            startDate: promoStartDate || undefined,
            endDate: promoEndDate || undefined,
            finalUrl: promoFinalUrl.trim()
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsPromoModalOpen(false);
          setEditingItem(null);
          fetchAssets();
        } else {
          alert(data.error || "Failed to update promotion");
        }
      } else {
        const res = await fetch(`${BACKEND}/api/ads/assets/promotions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-id": orgId
          },
          body: JSON.stringify({
            customerId: cleanCid,
            promotionTarget: promoTarget.trim(),
            discountType: promoDiscountType,
            percentOff: promoDiscountType === "PERCENT_OFF" ? Number(promoPercent) : undefined,
            moneyAmountOff: promoDiscountType === "MONEY_AMOUNT_OFF" ? {
              amount: Number(promoMoney),
              currencyCode: promoCurrency
            } : undefined,
            occasion: promoOccasion,
            promotionCode: promoCode.trim() || undefined,
            startDate: promoStartDate || undefined,
            endDate: promoEndDate || undefined,
            finalUrl: promoFinalUrl.trim(),
            campaignResourceName: promoCampaign || undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsPromoModalOpen(false);
          fetchAssets();
        } else {
          alert(data.error || "Failed to create promotion");
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed saving promotion");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Save Lead Form ─────────────────────────────────────────────────────────
  const handleSaveLeadForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfBusinessName.trim() || !lfHeadline.trim() || !lfDescription.trim()) {
      alert("Business Name, Headline, and Description are required.");
      return;
    }
    if (!lfPrivacyUrl.trim() || !lfPrivacyUrl.startsWith("http")) {
      alert("A valid Privacy Policy URL (starting with http:// or https://) is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/ads/assets/lead-forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId: cleanCid,
          businessName: lfBusinessName.trim(),
          headline: lfHeadline.trim(),
          description: lfDescription.trim(),
          privacyPolicyUrl: lfPrivacyUrl.trim(),
          callToActionType: lfCtaType,
          callToActionDescription: lfCtaDesc.trim() || "Apply today",
          postSubmitHeadline: lfPostHeadline.trim() || "Thank you",
          postSubmitDescription: lfPostDesc.trim() || "We will contact you shortly",
          fields: lfFields.map(f => ({ inputType: f })),
          campaignResourceName: lfCampaign || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLeadFormModalOpen(false);
        fetchAssets();
      } else {
        alert(data.error || "Failed to create Lead Form in Google Ads");
      }
    } catch (err: any) {
      alert(err.message || "Failed saving Lead Form");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Open Edit Snippet ──────────────────────────────────────────────────────
  const openEditSnippet = (item: StructuredSnippetItem) => {
    setEditingItem(item);
    setSnippetHeader(item.header || "Services");
    setSnippetValues(item.values.length > 0 ? [...item.values] : ["", "", ""]);
    setSnippetCampaign("");
    setIsSnippetModalOpen(true);
  };

  // ── Open Edit Promotion ────────────────────────────────────────────────────
  const openEditPromotion = (item: PromotionItem) => {
    setEditingItem(item);
    setPromoTarget(item.promotionTarget || "");
    if (item.percentOff) {
      setPromoDiscountType("PERCENT_OFF");
      setPromoPercent(item.percentOff);
      setPromoMoney("");
    } else if (item.moneyAmountOff) {
      setPromoDiscountType("MONEY_AMOUNT_OFF");
      setPromoMoney(item.moneyAmountOff.amount);
      setPromoCurrency(item.moneyAmountOff.currencyCode || "INR");
      setPromoPercent("");
    }
    setPromoOccasion(item.occasion || "NONE");
    setPromoCode(item.promotionCode || "");
    setPromoStartDate(item.startDate || "");
    setPromoEndDate(item.endDate || "");
    setPromoFinalUrl(item.finalUrls?.[0] || "");
    setPromoCampaign("");
    setIsPromoModalOpen(true);
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "DISAPPROVED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3" /> Disapproved</span>;
      case "APPROVED_LIMITED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Limited</span>;
      case "REVIEW_IN_PROGRESS":
      case "UNDER_REVIEW":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">In Review</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status || "Unknown"}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Tab Navigation */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Google Ads Extension Assets</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                v24 Official
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Create, edit, associate, and manage customer-level Structured Snippets, Promotions, and Lead Form assets connected directly to Google Ads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAssets}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              title="Refresh Assets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>

            {activeAssetType === "snippets" && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setSnippetHeader("Services");
                  setSnippetValues(["", "", ""]);
                  setSnippetCampaign("");
                  setIsSnippetModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Snippet</span>
              </button>
            )}

            {activeAssetType === "promotions" && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setPromoTarget("");
                  setPromoDiscountType("PERCENT_OFF");
                  setPromoPercent(20);
                  setPromoMoney("");
                  setPromoOccasion("NONE");
                  setPromoCode("");
                  setPromoStartDate("");
                  setPromoEndDate("");
                  setPromoFinalUrl("");
                  setPromoCampaign("");
                  setIsPromoModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Promotion</span>
              </button>
            )}

            {activeAssetType === "lead-forms" && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setLfBusinessName("");
                  setLfHeadline("");
                  setLfDescription("");
                  setLfPrivacyUrl("");
                  setLfCtaType("LEARN_MORE");
                  setLfCtaDesc("Apply today");
                  setLfPostHeadline("Thank you");
                  setLfPostDesc("We will contact you shortly");
                  setLfFields(["FULL_NAME", "EMAIL", "PHONE_NUMBER"]);
                  setLfCampaign("");
                  setIsLeadFormModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Lead Form</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAssetType("snippets")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAssetType === "snippets"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Structured Snippets ({snippets.length})</span>
            </button>

            <button
              onClick={() => setActiveAssetType("promotions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAssetType === "promotions"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Promotions ({promotions.length})</span>
            </button>

            <button
              onClick={() => setActiveAssetType("lead-forms")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAssetType === "lead-forms"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lead Forms ({leadForms.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchAssets} className="font-bold underline hover:text-rose-900 cursor-pointer">Retry</button>
        </div>
      )}

      {/* 3. Asset Lists */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500 rounded-2xl bg-white border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs font-bold">Querying Google Ads API v24...</p>
        </div>
      ) : activeAssetType === "snippets" ? (
        // ── Snippets Table ──
        snippets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Structured Snippet Assets Found</p>
            <p className="text-xs text-slate-500 mt-1">Structured snippets highlight specific aspects of your products and services.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Header</th>
                    <th className="p-4">Values</th>
                    <th className="p-4">Associated Campaigns</th>
                    <th className="p-4">Policy Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {snippets
                    .filter(s =>
                      s.header.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.values.some(v => v.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      s.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{item.header}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {item.values.map((v, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                                {v}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          {item.campaigns && item.campaigns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.campaigns.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                  {c.campaignName || `Campaign ${c.campaignId}`}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Customer Account-level</span>
                          )}
                        </td>
                        <td className="p-4">{getApprovalBadge(item.policyApprovalStatus)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditSnippet(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                              title="Edit Snippet"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(item.resourceName, item.name || item.header)}
                              disabled={submitting}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : activeAssetType === "promotions" ? (
        // ── Promotions Table ──
        promotions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Promotion Assets Found</p>
            <p className="text-xs text-slate-500 mt-1">Promotions highlight discounts, holiday sales, and special promotional offers on your ads.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Target / Item</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Occasion &amp; Code</th>
                    <th className="p-4">Associated Campaigns</th>
                    <th className="p-4">Policy Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {promotions
                    .filter(p =>
                      p.promotionTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.discountText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.occasion.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{item.promotionTarget}</div>
                          {item.finalUrls?.[0] && (
                            <a
                              href={item.finalUrls[0]}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <span>{item.finalUrls[0].slice(0, 35)}...</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs">
                            {item.discountText}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            {item.occasion && item.occasion !== "NONE" ? (
                              <span className="font-semibold text-slate-800">{item.occasion.replace(/_/g, " ")}</span>
                            ) : (
                              <span className="text-slate-400">Regular Sale</span>
                            )}
                          </div>
                          {item.promotionCode && (
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mt-1 inline-block">
                              Code: {item.promotionCode}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {item.campaigns && item.campaigns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.campaigns.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                  {c.campaignName || `Campaign ${c.campaignId}`}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Account-level</span>
                          )}
                        </td>
                        <td className="p-4">{getApprovalBadge(item.policyApprovalStatus)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditPromotion(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                              title="Edit Promotion"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(item.resourceName, item.promotionTarget)}
                              disabled={submitting}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        // ── Lead Forms Table ──
        leadForms.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Lead Form Assets Found</p>
            <p className="text-xs text-slate-500 mt-1">Lead form assets allow customers to submit information directly from your Google Search or Display ads.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Business &amp; Headline</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Form Fields</th>
                    <th className="p-4">Associated Campaigns</th>
                    <th className="p-4">Policy Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {leadForms
                    .filter(lf =>
                      lf.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      lf.headline.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{item.businessName}</div>
                          <div className="text-slate-500 font-normal">{item.headline}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                        </td>
                        <td className="p-4 max-w-xs text-slate-600 line-clamp-2">
                          {item.description}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {item.fields.map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                                {f.inputType.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          {item.campaigns && item.campaigns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.campaigns.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                  {c.campaignName || `Campaign ${c.campaignId}`}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Customer Account-level</span>
                          )}
                        </td>
                        <td className="p-4">{getApprovalBadge(item.policyApprovalStatus)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDeleteAsset(item.resourceName, item.businessName)}
                              disabled={submitting}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE / EDIT STRUCTURED SNIPPET                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isSnippetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {editingItem ? "Edit Structured Snippet" : "Create Structured Snippet"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Google Ads v24 Asset</p>
              </div>
              <button
                onClick={() => setIsSnippetModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSnippet} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Header *</label>
                <select
                  value={snippetHeader}
                  onChange={(e) => setSnippetHeader(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {SNIPPET_HEADERS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Choose the category header matching your values.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Values (At least 3 required) *</label>
                <div className="space-y-2">
                  {snippetValues.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Value ${idx + 1} (e.g. ${idx === 0 ? "Web Design" : idx === 1 ? "Cloud Suite" : "AI CRM"})`}
                        value={val}
                        maxLength={25}
                        onChange={(e) => {
                          const updated = [...snippetValues];
                          updated[idx] = e.target.value;
                          setSnippetValues(updated);
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                      {snippetValues.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSnippetValues(snippetValues.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSnippetValues([...snippetValues, ""])}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another value (up to 10)</span>
                </button>
              </div>

              {!editingItem && campaigns.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link to Campaign (Optional)</label>
                  <select
                    value={snippetCampaign}
                    onChange={(e) => setSnippetCampaign(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Account-level (All Campaigns)</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.resourceName || `customers/${cleanCid}/campaigns/${c.id}`}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSnippetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Update Snippet" : "Create in Google Ads"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE / EDIT PROMOTION                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {editingItem ? "Edit Promotion" : "Create Promotion"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Google Ads v24 Asset</p>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromotion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Promotion Target (Item/Service) *</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Sale, Enterprise Software"
                  maxLength={30}
                  value={promoTarget}
                  onChange={(e) => setPromoTarget(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPromoDiscountType("PERCENT_OFF")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      promoDiscountType === "PERCENT_OFF"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Percent Discount (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoDiscountType("MONEY_AMOUNT_OFF")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      promoDiscountType === "MONEY_AMOUNT_OFF"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Monetary Discount
                  </button>
                </div>
              </div>

              {promoDiscountType === "PERCENT_OFF" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Percent Off (%) *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="20"
                    value={promoPercent}
                    onChange={(e) => setPromoPercent(e.target.value ? Number(e.target.value) : "")}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Discount Amount *</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="500"
                      value={promoMoney}
                      onChange={(e) => setPromoMoney(e.target.value ? Number(e.target.value) : "")}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={promoCurrency}
                      onChange={(e) => setPromoCurrency(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono text-center"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Occasion</label>
                  <select
                    value={promoOccasion}
                    onChange={(e) => setPromoOccasion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {PROMOTION_OCCASIONS.map((occ) => (
                      <option key={occ.value} value={occ.value}>{occ.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Promo Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Final Destination URL *</label>
                <input
                  type="url"
                  placeholder="https://example.com/offers"
                  value={promoFinalUrl}
                  onChange={(e) => setPromoFinalUrl(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={promoStartDate}
                    onChange={(e) => setPromoStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={promoEndDate}
                    onChange={(e) => setPromoEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {!editingItem && campaigns.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link to Campaign (Optional)</label>
                  <select
                    value={promoCampaign}
                    onChange={(e) => setPromoCampaign(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Account-level (All Campaigns)</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.resourceName || `customers/${cleanCid}/campaigns/${c.id}`}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Update Promotion" : "Create in Google Ads"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE LEAD FORM                                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isLeadFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Create Lead Form Asset</h4>
                <p className="text-xs text-slate-500 mt-0.5">Google Ads API v24 (Native)</p>
              </div>
              <button
                onClick={() => setIsLeadFormModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name (Max 25 chars) *</label>
                <input
                  type="text"
                  maxLength={25}
                  placeholder="e.g. Jisnu CRM Solutions"
                  value={lfBusinessName}
                  onChange={(e) => setLfBusinessName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline (Max 30 chars) *</label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. Request an Enterprise Demo"
                  value={lfHeadline}
                  onChange={(e) => setLfHeadline(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Max 200 chars) *</label>
                <textarea
                  rows={2}
                  maxLength={200}
                  placeholder="e.g. Fill out this quick form and our specialists will reach out within 24 hours."
                  value={lfDescription}
                  onChange={(e) => setLfDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Privacy Policy URL *</label>
                <input
                  type="url"
                  placeholder="https://example.com/privacy-policy"
                  value={lfPrivacyUrl}
                  onChange={(e) => setLfPrivacyUrl(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Google Ads requires an official privacy policy for all lead form extensions.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Call to Action Type</label>
                  <select
                    value={lfCtaType}
                    onChange={(e) => setLfCtaType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {LEAD_FORM_CTAS.map((cta) => (
                      <option key={cta.value} value={cta.value}>{cta.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CTA Description (Max 30 chars)</label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Apply today"
                    value={lfCtaDesc}
                    onChange={(e) => setLfCtaDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Form Questions / Fields</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { key: "FULL_NAME", label: "Full Name" },
                    { key: "EMAIL", label: "Email" },
                    { key: "PHONE_NUMBER", label: "Phone Number" },
                    { key: "CITY", label: "City" },
                    { key: "POSTAL_CODE", label: "Postal Code" }
                  ].map((field) => {
                    const isChecked = lfFields.includes(field.key);
                    return (
                      <button
                        type="button"
                        key={field.key}
                        onClick={() => {
                          if (isChecked) {
                            if (lfFields.length <= 1) return;
                            setLfFields(lfFields.filter(f => f !== field.key));
                          } else {
                            setLfFields([...lfFields, field.key]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {field.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thank You Headline</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={lfPostHeadline}
                    onChange={(e) => setLfPostHeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thank You Description</label>
                  <input
                    type="text"
                    maxLength={200}
                    value={lfPostDesc}
                    onChange={(e) => setLfPostDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {campaigns.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link to Campaign (Optional)</label>
                  <select
                    value={lfCampaign}
                    onChange={(e) => setLfCampaign(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Account-level (All Campaigns)</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.resourceName || `customers/${cleanCid}/campaigns/${c.id}`}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeadFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Lead Form in Google Ads</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
