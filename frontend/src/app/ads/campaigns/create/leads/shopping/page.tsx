
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  ShoppingBag, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical, ExternalLink,
  Target, Layers, Zap, Upload, Image as ImageIcon, MapPin, Edit3
} from "lucide-react";

// Helper: Get user's local date as YYYY-MM-DD
const getLocalToday = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface ValidationIssue {
  id: string;
  level: "Campaign" | "Ad group" | "Product group" | "Assets";
  parameter: string;
  message: string;
  step: "BUDGET_BIDDING" | "CAMPAIGN_SETTINGS" | "AD_GROUP" | "SUMMARY";
  settingKey?: string;
}

export default function LeadsShoppingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [existingCampaignsList, setExistingCampaignsList] = useState<Array<{ name?: string }>>([]);
  const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null);

  // Campaign Name
  const [campaignName, setCampaignName] = useState<string>("Leads-Shopping-1");

  // Wizard State
  const [wizardStep, setWizardStep] = useState<"BUDGET_BIDDING" | "CAMPAIGN_SETTINGS" | "AD_GROUP" | "SUMMARY">("BUDGET_BIDDING");

  // Step 1: Budget and bidding optimization
  const [openBudgetSetting, setOpenBudgetSetting] = useState<string | null>("budget");
  const [budgetType, setBudgetType] = useState("daily"); // "daily" or "total"
  const [budgetAmount, setBudgetAmount] = useState("");
  const [bidStrategy, setBidStrategy] = useState("Manual CPC");
  const [biddingFocus, setBiddingFocus] = useState("");
  const [targetRoas, setTargetRoas] = useState("");
  const [setMaxCpcLimit, setSetMaxCpcLimit] = useState(false);
  const [maxCpcLimitAmount, setMaxCpcLimitAmount] = useState("");
  const [customerAcquisition, setCustomerAcquisition] = useState(false);
  const [campaignPriority, setCampaignPriority] = useState("Low (default)");

  // Step 2: Campaign Settings
  const [openCampaignSetting, setOpenCampaignSetting] = useState<string | null>("locations");
  const [locationType, setLocationType] = useState("India"); // "All", "India", "Another"
  const [customLocation, setCustomLocation] = useState("");
  const [isSearchingLocations, setIsSearchingLocations] = useState<boolean>(false);
  const [locationSearchResults, setLocationSearchResults] = useState<Array<{ id?: string; name: string; canonicalName: string; targetType: string }>>([]);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [locationTargetType, setLocationTargetType] = useState("Presence or interest");
  const [localProducts, setLocalProducts] = useState(false);
  const [euPoliticalAds, setEuPoliticalAds] = useState("No, this campaign doesn't have EU political ads");
  const [startDate, setStartDate] = useState(getLocalToday());
  const [endDateOption, setEndDateOption] = useState("None");
  const [endDate, setEndDate] = useState("");
  const [trackingTemplate, setTrackingTemplate] = useState("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState("");
  const [customParams, setCustomParams] = useState([{ id: Date.now(), name: "", value: "" }]);
  const [networkSearch, setNetworkSearch] = useState(true);
  const [showMoreCampaignSettings, setShowMoreCampaignSettings] = useState(false);

  // Step 3: Ad Group & Assets
  const [openAdGroupSetting, setOpenAdGroupSetting] = useState<string | null>("ad_group");
  const [adGroupName, setAdGroupName] = useState("Ad group 1");
  const [adGroupBid, setAdGroupBid] = useState("");
  const [productGroup, setProductGroup] = useState("All products");
  const [productGroupFilter, setProductGroupFilter] = useState("Use all products");
  const [productGroupSelectBy, setProductGroupSelectBy] = useState("Product type");
  const [productGroupCustomLabel, setProductGroupCustomLabel] = useState("Custom label 0");
  const [productGroupSearch, setProductGroupSearch] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddValues, setBulkAddValues] = useState("");
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoTab, setLogoTab] = useState("Upload");

  // Shopping Settings (shopping_setting for Google Ads API)
  const [merchantCenterId, setMerchantCenterId] = useState<string>("5840531233");
  const [LeadsCountry, setLeadsCountry] = useState<string>("IN");
  const [feedLabel, setFeedLabel] = useState<string>("IN");
  const [enableLocalProducts, setEnableLocalProducts] = useState<boolean>(false);

  // Final URL, Headlines, and Descriptions
  const [finalUrl, setFinalUrl] = useState<string>("https://example.com");
  const [headlines, setHeadlines] = useState<string[]>(["Shop Top Deals Now"]);
  const [descriptions, setDescriptions] = useState<string[]>(["Explore our exclusive shopping collection with fast delivery and great discounts."]);

  // Load existing campaigns from Google Ads API / DB once on component mount
  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
    const targetCid = customerId || "6587355041";

    fetch(`${BACKEND}/api/ads/campaigns?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(targetCid)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setExistingCampaignsList(data);
          let nextIndex = 1;
          const existingLower = data.map((c: any) => (c.name || "").trim().toLowerCase());
          while (existingLower.includes(`Leads-shopping-${nextIndex}`.toLowerCase())) {
            nextIndex++;
          }
          const defaultName = `Leads-Shopping-${nextIndex}`;
          setCampaignName(defaultName);
          setDuplicateNameError(null);
        }
      })
      .catch(() => {});
  }, [customerId]);

  // Real-time check whenever campaignName changes
  const checkDuplicateCampaignName = (nameToTest: string): boolean => {
    const trimmed = nameToTest.trim();
    if (!trimmed) {
      setDuplicateNameError(null);
      return false;
    }
    const normalized = trimmed.toLowerCase();
    const isDup = existingCampaignsList.some(c => c.name && c.name.trim().toLowerCase() === normalized);
    if (isDup) {
      const msg = "Campaign name already exists. Please choose a unique campaign name.";
      setDuplicateNameError(msg);
      setFieldErrors(prev => ({ ...prev, campaignName: msg }));
      return true;
    } else {
      setDuplicateNameError(null);
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.campaignName;
        return updated;
      });
      return false;
    }
  };

  // Live Location Search from Google Ads Geo Targets API
  useEffect(() => {
    if (customLocation.trim().length >= 2) {
      setIsSearchingLocations(true);
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "6587355041";

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${BACKEND}/api/ads/geo-targets/search?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}&q=${encodeURIComponent(customLocation.trim())}`);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.results || data.data || []);
            const formatted = list.map((item: any) => ({
              id: item.id || item.geoTargetConstant?.id || item.resourceName?.split("/").pop(),
              name: item.name || item.geoTargetConstant?.name || item.canonicalName || item.geoTargetConstant?.canonicalName,
              canonicalName: item.canonicalName || item.geoTargetConstant?.canonicalName || item.name,
              targetType: item.targetType || item.geoTargetConstant?.targetType || "Location"
            }));
            setLocationSearchResults(formatted);
          } else {
            const localFallback = [
              { name: "Mumbai", canonicalName: "Mumbai, Maharashtra, India", targetType: "City" },
              { name: "Delhi", canonicalName: "Delhi, India", targetType: "Union territory" },
              { name: "Bengaluru", canonicalName: "Bengaluru, Karnataka, India", targetType: "City" },
              { name: "Hyderabad", canonicalName: "Hyderabad, Telangana, India", targetType: "City" },
              { name: "Ahmedabad", canonicalName: "Ahmedabad, Gujarat, India", targetType: "City" },
              { name: "Chennai", canonicalName: "Chennai, Tamil Nadu, India", targetType: "City" },
              { name: "Kolkata", canonicalName: "Kolkata, West Bengal, India", targetType: "City" },
              { name: "Pune", canonicalName: "Pune, Maharashtra, India", targetType: "City" },
              { name: "Surat", canonicalName: "Surat, Gujarat, India", targetType: "City" },
              { name: "Jaipur", canonicalName: "Jaipur, Rajasthan, India", targetType: "City" },
              { name: "United States", canonicalName: "United States", targetType: "Country" }
            ].filter(loc => loc.name.toLowerCase().includes(customLocation.toLowerCase()) || loc.canonicalName.toLowerCase().includes(customLocation.toLowerCase()));
            setLocationSearchResults(localFallback);
          }
        } catch {
          setLocationSearchResults([]);
        } finally {
          setIsSearchingLocations(false);
        }
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setLocationSearchResults([]);
      setIsSearchingLocations(false);
    }
  }, [customLocation, customerId]);

  // Comprehensive Shopping Review Validation Engine
  const getReviewValidationErrors = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // 1. Customer ID
    const trimmedCid = (customerId || accountInfo?.customerId || "").trim();
    if (!trimmedCid) {
      issues.push({
        id: "camp-cid-req",
        level: "Campaign",
        parameter: "Customer ID",
        message: "Customer ID is required.",
        step: "SUMMARY",
        settingKey: "campaign_name"
      });
    }

    // 2. Campaign Name
    const trimmedName = (campaignName || "").trim();
    if (!trimmedName) {
      issues.push({
        id: "camp-name-req",
        level: "Campaign",
        parameter: "Campaign name",
        message: "Campaign Name is required.",
        step: "SUMMARY",
        settingKey: "campaign_name"
      });
    } else {
      const isDup = existingCampaignsList.some(
        c => c.name && c.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDup || duplicateNameError) {
        issues.push({
          id: "camp-name-dup",
          level: "Campaign",
          parameter: "Campaign name",
          message: "Campaign name already exists. Please choose a unique name.",
          step: "SUMMARY",
          settingKey: "campaign_name"
        });
      }
    }

    // 3. Budget
    const numBudget = Number(budgetAmount);
    if (!budgetAmount.trim() || isNaN(numBudget) || numBudget <= 0) {
      issues.push({
        id: "camp-budget",
        level: "Campaign",
        parameter: "Budget",
        message: "Budget is required and must be greater than 0.",
        step: "BUDGET_BIDDING",
        settingKey: "budget"
      });
    }

    // 4. Shopping Settings (Merchant Center ID and Leads Country)
    const trimmedMerchantId = (merchantCenterId || "").trim();
    if (!trimmedMerchantId) {
      issues.push({
        id: "camp-merchant-id-req",
        level: "Campaign",
        parameter: "Merchant Center ID",
        message: "Merchant Center ID is required.",
        step: "AD_GROUP",
        settingKey: "product_groups"
      });
    } else if (!/^\d+$/.test(trimmedMerchantId)) {
      issues.push({
        id: "camp-merchant-id-invalid",
        level: "Campaign",
        parameter: "Merchant Center ID",
        message: "Merchant Center ID must be numeric (e.g. 5840531233).",
        step: "AD_GROUP",
        settingKey: "product_groups"
      });
    }

    const trimmedLeadsCountry = (LeadsCountry || feedLabel || "").trim();
    if (!trimmedLeadsCountry) {
      issues.push({
        id: "camp-Leads-country-req",
        level: "Campaign",
        parameter: "Leads Country",
        message: "Leads Country is required.",
        step: "AD_GROUP",
        settingKey: "product_groups"
      });
    }

    // 5. Final URL
    const trimmedFinalUrl = (finalUrl || "").trim();
    if (!trimmedFinalUrl) {
      issues.push({
        id: "camp-final-url-req",
        level: "Assets",
        parameter: "Final URL",
        message: "Final URL is required.",
        step: "AD_GROUP",
        settingKey: "assets"
      });
    } else if (!trimmedFinalUrl.startsWith("http://") && !trimmedFinalUrl.startsWith("https://")) {
      issues.push({
        id: "camp-final-url-invalid",
        level: "Assets",
        parameter: "Final URL",
        message: "Final URL must begin with http:// or https://",
        step: "AD_GROUP",
        settingKey: "assets"
      });
    }

    // 6. Headlines
    const validHeadlines = (headlines || []).map(h => typeof h === "string" ? h.trim() : "").filter(Boolean);
    if (validHeadlines.length < 1) {
      issues.push({
        id: "camp-headlines-req",
        level: "Assets",
        parameter: "Headlines",
        message: "At least 1 headline is required.",
        step: "AD_GROUP",
        settingKey: "assets"
      });
    }

    // 7. Descriptions
    const validDescriptions = (descriptions || []).map(d => typeof d === "string" ? d.trim() : "").filter(Boolean);
    if (validDescriptions.length < 1) {
      issues.push({
        id: "camp-descriptions-req",
        level: "Assets",
        parameter: "Descriptions",
        message: "At least 1 description is required.",
        step: "AD_GROUP",
        settingKey: "assets"
      });
    }

    // 8. Target ROAS (if Target ROAS strategy is selected)
    if (bidStrategy === "Target ROAS") {
      const numRoas = Number(targetRoas);
      if (!targetRoas.trim() || isNaN(numRoas) || numRoas <= 0) {
        issues.push({
          id: "camp-target-roas",
          level: "Campaign",
          parameter: "Target ROAS",
          message: "Target ROAS is required and must be greater than 0%.",
          step: "BUDGET_BIDDING",
          settingKey: "bidding"
        });
      }
    }

    // 9. Max CPC Limit (if Maximize Clicks + Limit is enabled)
    if (bidStrategy === "Maximize clicks" && setMaxCpcLimit) {
      const numMaxCpc = Number(maxCpcLimitAmount);
      if (!maxCpcLimitAmount.trim() || isNaN(numMaxCpc) || numMaxCpc <= 0) {
        issues.push({
          id: "camp-max-cpc",
          level: "Campaign",
          parameter: "Maximum CPC limit",
          message: "Maximum CPC limit must be greater than 0.",
          step: "BUDGET_BIDDING",
          settingKey: "bidding"
        });
      }
    }

    // 10. Custom Location
    if (locationType === "Another" && !customLocation.trim()) {
      issues.push({
        id: "camp-location",
        level: "Campaign",
        parameter: "Locations",
        message: "A target location is required when 'Enter another location' is selected.",
        step: "CAMPAIGN_SETTINGS",
        settingKey: "locations"
      });
    }

    // 11. Dates
    const localToday = getLocalToday();
    if (startDate && startDate < localToday) {
      issues.push({
        id: "camp-start-date",
        level: "Campaign",
        parameter: "Start date",
        message: "Start date cannot be before today.",
        step: "CAMPAIGN_SETTINGS",
        settingKey: "dates"
      });
    }
    if (endDateOption === "Select a date") {
      if (!endDate) {
        issues.push({
          id: "camp-end-date-req",
          level: "Campaign",
          parameter: "End date",
          message: "An end date must be selected.",
          step: "CAMPAIGN_SETTINGS",
          settingKey: "dates"
        });
      } else if (startDate && endDate < startDate) {
        issues.push({
          id: "camp-end-date-before",
          level: "Campaign",
          parameter: "End date",
          message: `End date cannot be earlier than start date (${startDate}).`,
          step: "CAMPAIGN_SETTINGS",
          settingKey: "dates"
        });
      }
    }

    // 12. Tracking Template Tag Validation
    if (trackingTemplate && trackingTemplate.trim()) {
      const hasTag = /\{(?:lpurl|unescapedlpurl|escapedlpurl|lpurlpath|2escapedlpurl)\}/i.test(trackingTemplate.trim());
      if (!hasTag) {
        issues.push({
          id: "camp-tracking-template",
          level: "Campaign",
          parameter: "Tracking template",
          message: "Tracking template must contain a landing page parameter tag (e.g. {lpurl}).",
          step: "CAMPAIGN_SETTINGS",
          settingKey: "url_options"
        });
      }
    }

    // 13. Ad Group Name
    if (!adGroupName.trim()) {
      issues.push({
        id: "ag-name",
        level: "Ad group",
        parameter: "Ad group name",
        message: "Ad group name is required.",
        step: "AD_GROUP",
        settingKey: "ad_group"
      });
    }

    // 14. Ad Group Bid (for Manual CPC)
    if (bidStrategy === "Manual CPC") {
      const numAgBid = Number(adGroupBid);
      if (!adGroupBid.trim() || isNaN(numAgBid) || numAgBid <= 0) {
        issues.push({
          id: "ag-bid",
          level: "Ad group",
          parameter: "Ad group bid",
          message: "Ad group CPC bid must be greater than 0.",
          step: "AD_GROUP",
          settingKey: "ad_group"
        });
      }
    }

    return issues;
  };

  const handleFixIssue = (issue: ValidationIssue) => {
    setWizardStep(issue.step);
    if (issue.step === "BUDGET_BIDDING" && issue.settingKey) {
      setOpenBudgetSetting(issue.settingKey);
    } else if (issue.step === "CAMPAIGN_SETTINGS" && issue.settingKey) {
      setOpenCampaignSetting(issue.settingKey);
      if (["dates", "url_options", "networks"].includes(issue.settingKey)) {
        setShowMoreCampaignSettings(true);
      }
    } else if (issue.step === "AD_GROUP" && issue.settingKey) {
      setOpenAdGroupSetting(issue.settingKey);
    }
  };

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "";
    if (customerId) {
      fetch(`${BACKEND}/api/ads/customer-info?orgId=${orgId}&customerId=${customerId}`)
        .then(r => r.json())
        .then(d => {
          setAccountInfo({
            customerId: d.customerId || customerId,
            name: d.descriptiveName || `Account ${customerId}`
          });
        })
        .catch(() => {
          setAccountInfo({ customerId, name: `Account ${customerId}` });
        });
    }
  }, [customerId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedLogo(e.target.files[0]);
      console.log("Mock ImageKit upload for logo:", e.target.files[0]);
    }
  };

  const navItemClass = (step: string) => {
    if (wizardStep === step) return "bg-primary/10 text-primary border border-primary/30 font-semibold";
    return "text-slate-500 hover:bg-white hover:text-slate-800";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 text-xs font-semibold">
            <span className="text-slate-500">Leads</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              Shopping Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "658-735-5041 JISNU Digital Solutions PVT LTD"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50/50 hidden md:block shrink-0 overflow-y-auto hidden-scrollbar">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-slate-800">Shopping</h2>
            </div>
            <nav className="space-y-1 text-xs">
              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("BUDGET_BIDDING")}`}
                  onClick={() => setWizardStep("BUDGET_BIDDING")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</div>
                  <span>Budget and bidding optimization</span>
                </div>
                <div className="ml-10 mt-1 space-y-2 text-[11px] text-slate-500 font-medium pb-2">
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'budget' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('budget'); }}>Budget</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'bidding' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('bidding'); }}>Bidding</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'acquisition' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('acquisition'); }}>Customer acquisition</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'priority' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('priority'); }}>Campaign priority</div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("CAMPAIGN_SETTINGS")}`}
                  onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">2</div>
                  <span>Campaign settings</span>
                </div>
                <div className="ml-10 mt-1 space-y-2 text-[11px] text-slate-500 font-medium pb-2">
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'locations' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('locations'); }}>Locations</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'local_products' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('local_products'); }}>Local products</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'eu_political' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('eu_political'); }}>EU political ads</div>
                  
                  <div className="pl-3 border-l border-slate-200 space-y-2 pt-1 pb-1">
                    <div className="text-slate-500 font-semibold cursor-pointer hover:text-slate-900 flex items-center gap-1 transition-colors" onClick={() => setShowMoreCampaignSettings(!showMoreCampaignSettings)}>More settings {showMoreCampaignSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</div>
                    {showMoreCampaignSettings && (
                      <>
                        <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'dates' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('dates'); }}>Start and end dates</div>
                        <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'url_options' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('url_options'); }}>Campaign URL options</div>
                        <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'networks' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('networks'); }}>Networks</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("AD_GROUP")}`}
                  onClick={() => setWizardStep("AD_GROUP")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">3</div>
                  <span>Ad group and assets</span>
                </div>
                <div className="ml-10 mt-1 space-y-2 text-[11px] text-slate-500 font-medium pb-2">
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'ad_group' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('ad_group'); }}>Ad group name</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'ad_group_bid' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('ad_group_bid'); }}>Ad group bid</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'product_groups' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('product_groups'); }}>Product groups</div>
                  <div className={`cursor-pointer hover:text-slate-900 ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'assets' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('assets'); }}>Business logo</div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("SUMMARY")}`}
                  onClick={() => setWizardStep("SUMMARY")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">4</div>
                  <span>Summary</span>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto pb-32">

          {/* STEP 1: BUDGET AND BIDDING */}
          {wizardStep === "BUDGET_BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Budget and bidding optimization</h1>
                <p className="text-xs text-slate-500 mt-1">Select optimization options that work best for your goals</p>
              </div>

              {/* Budget Card */}
              {openBudgetSetting === "budget" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Budget</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500">Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.</p>
                  
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-700 font-semibold text-xs">Select budget type</label>
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      <label className={`p-4 border rounded-xl cursor-pointer transition-all ${budgetType === "daily" ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-800 text-sm">Average daily budget</span>
                          <input type="radio" checked={budgetType === "daily"} onChange={() => setBudgetType("daily")} className="text-primary h-4 w-4 bg-slate-50 border-slate-300" />
                        </div>
                        <p className="text-[10px] text-slate-500">Set your average daily budget for this campaign</p>
                      </label>
                      <label className={`p-4 border rounded-xl cursor-pointer transition-all ${budgetType === "total" ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-800 text-sm">Campaign total budget</span>
                          <input type="radio" checked={budgetType === "total"} onChange={() => setBudgetType("total")} className="text-primary h-4 w-4 bg-slate-50 border-slate-300" />
                        </div>
                        <p className="text-[10px] text-slate-500">Set a budget for the duration of your campaign</p>
                      </label>
                    </div>

                    <div className="pt-2 max-w-md relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">₹</span>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={budgetAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBudgetAmount(val);
                          if (!val.trim() || isNaN(Number(val)) || Number(val) <= 0) {
                            setFieldErrors(prev => ({ ...prev, budgetAmount: "Budget must be a positive number greater than 0." }));
                          } else {
                            setFieldErrors(prev => {
                              const updated = { ...prev };
                              delete updated.budgetAmount;
                              return updated;
                            });
                          }
                        }}
                        className={`w-full bg-slate-50 border rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                          !budgetAmount.trim() || isNaN(Number(budgetAmount)) || Number(budgetAmount) <= 0 || fieldErrors.budgetAmount
                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                            : "border-slate-200 focus:border-primary"
                        }`}
                        placeholder="Enter an amount"
                      />
                    </div>
                    {(!budgetAmount.trim() || isNaN(Number(budgetAmount)) || Number(budgetAmount) <= 0 || fieldErrors.budgetAmount) && (
                      <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.budgetAmount || "Budget is required and must be greater than 0."}
                      </span>
                    )}
                    {budgetType === "daily" && (
                      <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                        For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much. <a href="#" className="text-blue-400 hover:underline">Learn more</a>
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting("bidding")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenBudgetSetting("budget")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Budget</h2>
                    <span className="text-xs font-medium">
                      {!budgetAmount.trim() || isNaN(Number(budgetAmount)) || Number(budgetAmount) <= 0 ? (
                        <span className="text-rose-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Budget required (&gt; 0)
                        </span>
                      ) : (
                        <span className="text-slate-500">₹{budgetAmount}/{budgetType === "daily" ? "day" : "total"}</span>
                      )}
                    </span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Bidding Card */}
              {openBudgetSetting === "bidding" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Bidding</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-700 font-semibold text-xs">Select your bid strategy</label>
                    <select
                      value={bidStrategy}
                      onChange={(e) => {
                        const newStrategy = e.target.value;
                        setBidStrategy(newStrategy);
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.targetRoas;
                          delete updated.maxCpcLimitAmount;
                          return updated;
                        });
                      }}
                      className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-primary"
                    >
                      <optgroup label="Automated bid strategies">
                        <option value="Target ROAS">Target ROAS</option>
                        <option value="Maximize clicks">Maximize clicks</option>
                        <option value="Maximize conversion value">Maximize conversion value</option>
                      </optgroup>
                      <optgroup label="Manual bid strategies">
                        <option value="Manual CPC">Manual CPC</option>
                      </optgroup>
                    </select>

                    {bidStrategy === "Target ROAS" && (
                      <div className="pt-2 space-y-1 max-w-md">
                        <label className="block text-slate-700 font-semibold text-xs">Target ROAS percentage <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={targetRoas}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTargetRoas(val);
                              if (!val.trim() || isNaN(Number(val)) || Number(val) <= 0) {
                                setFieldErrors(prev => ({ ...prev, targetRoas: "Target ROAS must be a positive percentage greater than 0%." }));
                              } else {
                                setFieldErrors(prev => {
                                  const updated = { ...prev };
                                  delete updated.targetRoas;
                                  return updated;
                                });
                              }
                            }}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                              !targetRoas.trim() || isNaN(Number(targetRoas)) || Number(targetRoas) <= 0 || fieldErrors.targetRoas
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "border-slate-200 focus:border-primary"
                            }`}
                            placeholder="e.g. 200"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">%</span>
                        </div>
                        {(!targetRoas.trim() || isNaN(Number(targetRoas)) || Number(targetRoas) <= 0 || fieldErrors.targetRoas) && (
                          <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.targetRoas || "Target ROAS is required and must be greater than 0%."}
                          </span>
                        )}
                      </div>
                    )}

                    {bidStrategy === "Maximize clicks" && (
                      <div className="pt-2 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer max-w-xl">
                          <input type="checkbox" checked={setMaxCpcLimit} onChange={(e) => setSetMaxCpcLimit(e.target.checked)} className="mt-0.5 text-primary h-4 w-4 bg-slate-50 border-slate-300 rounded" />
                          <span className="font-semibold text-slate-800 text-sm">Set a maximum cost per click bid limit</span>
                        </label>
                        {setMaxCpcLimit && (
                          <div className="max-w-md space-y-1">
                            <label className="block text-slate-700 font-semibold text-xs">Maximum CPC limit amount <span className="text-rose-500">*</span></label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">₹</span>
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={maxCpcLimitAmount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMaxCpcLimitAmount(val);
                                  if (!val.trim() || isNaN(Number(val)) || Number(val) <= 0) {
                                    setFieldErrors(prev => ({ ...prev, maxCpcLimitAmount: "Maximum CPC limit must be greater than 0." }));
                                  } else {
                                    setFieldErrors(prev => {
                                      const updated = { ...prev };
                                      delete updated.maxCpcLimitAmount;
                                      return updated;
                                    });
                                  }
                                }}
                                className={`w-full bg-slate-50 border rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                                  !maxCpcLimitAmount.trim() || isNaN(Number(maxCpcLimitAmount)) || Number(maxCpcLimitAmount) <= 0 || fieldErrors.maxCpcLimitAmount
                                    ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                    : "border-slate-200 focus:border-primary"
                                }`}
                                placeholder="Enter an amount"
                              />
                            </div>
                            {(!maxCpcLimitAmount.trim() || isNaN(Number(maxCpcLimitAmount)) || Number(maxCpcLimitAmount) <= 0 || fieldErrors.maxCpcLimitAmount) && (
                              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.maxCpcLimitAmount || "Maximum CPC limit must be greater than 0."}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-[11px] text-amber-500 max-w-xl bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          Portfolio bid strategies can't be used with a campaign total budget yet.
                        </p>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 max-w-xl pt-2">
                      {bidStrategy === "Manual CPC" && "With \"Manual CPC\" bidding, you set your own maximum cost-per-click (CPC) for your ads. "}
                      <a href="#" className="text-blue-400 hover:underline">Learn more about determining a bid strategy</a>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting("acquisition")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenBudgetSetting("bidding")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Bidding</h2>
                    <span className="text-xs text-slate-500">{bidStrategy}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Customer Acquisition */}
              {openBudgetSetting === "acquisition" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Customer acquisition</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer max-w-xl">
                      <input type="checkbox" checked={customerAcquisition} onChange={(e) => setCustomerAcquisition(e.target.checked)} className="mt-0.5 text-primary h-4 w-4 bg-slate-50 border-slate-300 rounded" />
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 text-sm">Only bid for new customers</span>
                        <p className="text-[11px] text-slate-500">Your campaign will be limited to only new customers, regardless of your bid strategy</p>
                      </div>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-w-xl">
                      By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" className="text-blue-400 hover:underline">Learn more</a>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting("priority")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenBudgetSetting("acquisition")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Customer acquisition</h2>
                    <span className="text-xs text-slate-500">{customerAcquisition ? "Only new customers" : "Equally for new and existing"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Campaign Priority */}
              {openBudgetSetting === "priority" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Campaign priority</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-700 font-semibold text-xs">Select a campaign priority</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={campaignPriority === "Low (default)"} onChange={() => setCampaignPriority("Low (default)")} className="text-primary h-4 w-4" />
                        Low (default) <span className="text-slate-500 text-xs ml-1">– Recommended if you only have one Shopping campaign</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={campaignPriority === "Medium"} onChange={() => setCampaignPriority("Medium")} className="text-primary h-4 w-4" />
                        Medium
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={campaignPriority === "High"} onChange={() => setCampaignPriority("High")} className="text-primary h-4 w-4" />
                        High
                      </label>
                    </div>
                    <div className="pt-2 max-w-xl">
                      <p className="text-[11px] text-slate-700 font-semibold mb-1">When to use it</p>
                      <p className="text-[11px] text-slate-500">If you have multiple campaigns with one product, use campaign priority to decide which campaign's bid will be used. If campaigns have the same priority, the campaign with the higher bid will serve.</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting(null)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Done</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenBudgetSetting("priority")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Campaign priority</h2>
                    <span className="text-xs text-slate-500">{campaignPriority}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {wizardStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>
                <p className="text-xs text-slate-500 mt-1">To reach the right people, start by defining key settings for your campaign</p>
              </div>

              {/* Locations */}
              {openCampaignSetting === "locations" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Locations</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-700 font-semibold text-xs">Select locations for this campaign</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={locationType === "All"} onChange={() => setLocationType("All")} className="text-primary h-4 w-4" />
                        All countries and territories
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={locationType === "India"} onChange={() => setLocationType("India")} className="text-primary h-4 w-4" />
                        India
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={locationType === "Another"} onChange={() => setLocationType("Another")} className="text-primary h-4 w-4" />
                        Enter another location
                      </label>
                    </div>
                    {locationType === "Another" && (
                      <div className="space-y-2 mt-2 max-w-md">
                        <div className="relative">
                          <input
                            type="text"
                            value={customLocation}
                            onChange={(e) => setCustomLocation(e.target.value)}
                            placeholder="Enter a location to target"
                            className={`w-full bg-slate-50 border rounded-xl pl-4 pr-8 py-2 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                              !customLocation.trim() || fieldErrors.customLocation
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "border-slate-200 focus:border-primary"
                            }`}
                          />
                          {isSearchingLocations && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>

                        {/* Live Geo Targets Dropdown */}
                        {locationSearchResults.length > 0 && (
                          <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 max-w-md z-10 relative">
                            {locationSearchResults.map((loc, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setCustomLocation(loc.canonicalName || loc.name);
                                  setLocationSearchResults([]);
                                }}
                                className="p-2.5 hover:bg-primary/10 cursor-pointer flex items-center justify-between transition-colors text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800 block">{loc.canonicalName || loc.name}</span>
                                  {loc.id && <span className="text-[10px] text-slate-500 font-mono">ID: {loc.id}</span>}
                                </div>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                  {loc.targetType || "Location"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Unlisted / Invalid City Warning Message */}
                        {customLocation.trim().length >= 2 && !isSearchingLocations && locationSearchResults.length === 0 && (
                          <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            <span>No matching locations found for "{customLocation}". Only verified locations from Google Ads API can be added.</span>
                          </div>
                        )}
                      </div>
                    )}
                    <button type="button" onClick={() => setShowLocationOptions(!showLocationOptions)} className="text-primary text-[11px] font-semibold hover:underline mt-2 inline-block">Location options {showLocationOptions ? "▴" : "▾"}</button>
                    {showLocationOptions && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-slate-700 font-semibold text-xs text-primary">Target</label>
                        <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                          <label className="flex items-start gap-3 cursor-pointer text-slate-700 text-sm">
                            <input type="radio" checked={locationTargetType === "Presence or interest"} onChange={() => setLocationTargetType("Presence or interest")} className="text-primary h-4 w-4 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 leading-tight">Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)</div>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer text-slate-700 text-sm">
                            <input type="radio" checked={locationTargetType === "Presence"} onChange={() => setLocationTargetType("Presence")} className="text-primary h-4 w-4 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 leading-tight">Presence: People in or regularly in your included locations</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("local_products")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenCampaignSetting("locations")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Locations</h2>
                    <span className="text-xs text-slate-500">{locationType === "Another" ? customLocation || "Unspecified" : locationType}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Local Products */}
              {openCampaignSetting === "local_products" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Local products</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer max-w-xl">
                      <input type="checkbox" checked={localProducts} onChange={(e) => setLocalProducts(e.target.checked)} className="mt-0.5 text-primary h-4 w-4 bg-slate-50 border-slate-300 rounded" />
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 text-sm">Turned {localProducts ? "on" : "off"}</span>
                      </div>
                    </label>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("eu_political")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenCampaignSetting("local_products")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Local products</h2>
                    <span className="text-xs text-slate-500">{localProducts ? "Turned on" : "Turned off"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* EU political ads */}
              {openCampaignSetting === "eu_political" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">EU political ads</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-700 font-semibold text-xs">Does your campaign have European Union political ads? <span className="text-rose-400 ml-1">Required</span></label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={euPoliticalAds === "Yes, this campaign has EU political ads"} onChange={() => setEuPoliticalAds("Yes, this campaign has EU political ads")} className="text-primary h-4 w-4" />
                        Yes, this campaign has EU political ads
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-sm">
                        <input type="radio" checked={euPoliticalAds === "No, this campaign doesn't have EU political ads"} onChange={() => setEuPoliticalAds("No, this campaign doesn't have EU political ads")} className="text-primary h-4 w-4" />
                        No, this campaign doesn't have EU political ads
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">EU regulation requires Google to ask this question. <a href="#" className="text-blue-400 hover:underline">Learn how an EU political ad is defined</a></p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("dates")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenCampaignSetting("eu_political")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">EU political ads</h2>
                    <span className="text-xs text-slate-500">{euPoliticalAds.startsWith("No") ? "Doesn't have EU political ads" : "Has EU political ads"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/40">
                <div 
                  className="flex items-center justify-between cursor-pointer group py-2"
                  onClick={() => setShowMoreCampaignSettings(!showMoreCampaignSettings)}
                >
                  <h3 className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">More settings</h3>
                  {showMoreCampaignSettings ? <ChevronUp className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" /> : <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />}
                </div>
                
                {showMoreCampaignSettings && (
                  <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Start and end dates */}
              {openCampaignSetting === "dates" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Start and end dates</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold text-xs">Start date</label>
                      <input
                        type="date"
                        min={getLocalToday()}
                        value={startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStartDate(val);
                          if (val && val < getLocalToday()) {
                            setFieldErrors(prev => ({ ...prev, startDate: "Start date cannot be in the past." }));
                          } else {
                            setFieldErrors(prev => {
                              const updated = { ...prev };
                              delete updated.startDate;
                              return updated;
                            });
                          }
                        }}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none transition-all ${
                          startDate && startDate < getLocalToday() || fieldErrors.startDate
                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                            : "border-slate-200 focus:border-primary"
                        }`}
                      />
                      {startDate && startDate < getLocalToday() && (
                        <span className="text-[10px] text-rose-500 font-medium block">
                          Start date cannot be in the past (minimum: {getLocalToday()})
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold text-xs">End date</label>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input type="radio" checked={endDateOption === "None"} onChange={() => setEndDateOption("None")} className="text-primary h-4 w-4" /> None
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input type="radio" checked={endDateOption === "Select a date"} onChange={() => setEndDateOption("Select a date")} className="text-primary h-4 w-4" /> Select a date
                        </label>
                      </div>
                      {endDateOption === "Select a date" && (
                        <div className="space-y-1">
                          <input
                            type="date"
                            min={startDate || getLocalToday()}
                            value={endDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEndDate(val);
                              if (val && startDate && val < startDate) {
                                setFieldErrors(prev => ({ ...prev, endDate: "End date cannot be earlier than start date." }));
                              } else {
                                setFieldErrors(prev => {
                                  const updated = { ...prev };
                                  delete updated.endDate;
                                  return updated;
                                });
                              }
                            }}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none transition-all ${
                              (endDate && startDate && endDate < startDate) || fieldErrors.endDate
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "border-slate-200 focus:border-primary"
                            }`}
                          />
                          {endDate && startDate && endDate < startDate && (
                            <span className="text-[10px] text-rose-500 font-medium block">
                              End date cannot be earlier than start date ({startDate})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Your ads will continue to run unless you specify an end date.</p>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("url_options")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenCampaignSetting("dates")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Start and end dates</h2>
                    <span className="text-xs text-slate-500">{startDate} - {endDateOption === "None" ? "Not set" : endDate}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Campaign URL Options */}
              {openCampaignSetting === "url_options" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Campaign URL options</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold text-xs">Tracking template</label>
                      <input type="text" value={trackingTemplate} onChange={e => setTrackingTemplate(e.target.value)} placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5" className="w-full max-w-xl bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold text-xs">Final URL suffix</label>
                      <input type="text" value={finalUrlSuffix} onChange={e => setFinalUrlSuffix(e.target.value)} placeholder="Example: param1=value1&param2=value2" className="w-full max-w-xl bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold text-xs">Custom parameters</label>
                      {customParams.map((param, i) => (
                        <div key={param.id} className="flex items-center gap-2 max-w-xl">
                          <input type="text" value={param.name} onChange={e => { const p = [...customParams]; p[i].name = e.target.value; setCustomParams(p); }} placeholder="{_Name}" className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono" />
                          <span className="text-slate-500">=</span>
                          <input type="text" value={param.value} onChange={e => { const p = [...customParams]; p[i].value = e.target.value; setCustomParams(p); }} placeholder="Value" className="w-2/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono" />
                        </div>
                      ))}
                      <div className="mt-2">
                        <button type="button" onClick={() => setCustomParams([...customParams, { id: Date.now(), name: "", value: "" }])} className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                          <Plus className="h-3 w-3" /> ADD CUSTOM PARAMETER
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">Tracking template is the URL you want the ad click to go to for tracking. <a href="#" className="text-blue-400 hover:underline">Learn more</a></p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("networks")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenCampaignSetting("url_options")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Campaign URL options</h2>
                    <span className="text-xs text-slate-500">{trackingTemplate ? "Options set" : "No options set"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Networks */}
              {openCampaignSetting === "networks" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Networks</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                      <h3 className="font-semibold text-slate-800 text-sm">Search Network</h3>
                      <p className="text-xs text-slate-500">Ads can appear near Google Search results and other Google sites when people search for terms that are relevant to your keywords</p>
                      <label className="flex items-center gap-3 cursor-pointer pt-2">
                        <input type="checkbox" checked={networkSearch} onChange={e => setNetworkSearch(e.target.checked)} className="h-4 w-4 rounded text-primary" />
                        <span className="text-sm text-slate-700 font-semibold">Include Google search partners</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting(null)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Done</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenCampaignSetting("networks")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Networks</h2>
                    <span className="text-xs text-slate-500">{networkSearch ? "Search partners" : "Google Search only"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 3: AD GROUP & ASSETS */}
          {wizardStep === "AD_GROUP" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Ad group and assets</h1>
                <p className="text-xs text-slate-500 mt-1">You can add additional ad groups in campaign settings later</p>
              </div>

              {/* Ad Group Config */}
              {openAdGroupSetting === "ad_group" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenAdGroupSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Ad group</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold text-xs">Ad group name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={adGroupName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdGroupName(val);
                          if (!val.trim()) {
                            setFieldErrors(prev => ({ ...prev, adGroupName: "Ad group name is required." }));
                          } else {
                            setFieldErrors(prev => {
                              const updated = { ...prev };
                              delete updated.adGroupName;
                              return updated;
                            });
                          }
                        }}
                        className={`w-full max-w-md bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                          !adGroupName.trim() || fieldErrors.adGroupName
                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                            : "border-slate-200 focus:border-primary"
                        }`}
                      />
                      {(!adGroupName.trim() || fieldErrors.adGroupName) && (
                        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.adGroupName || "Ad group name is required."}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold text-xs">
                        Ad group bid {bidStrategy === "Manual CPC" && <span className="text-rose-500">*</span>}
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">Enter your cost-per-click (CPC) bid</p>
                      <div className="relative max-w-xs">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">₹</span>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={adGroupBid}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdGroupBid(val);
                            if (bidStrategy === "Manual CPC" && (!val.trim() || isNaN(Number(val)) || Number(val) <= 0)) {
                              setFieldErrors(prev => ({ ...prev, adGroupBid: "Ad group bid must be a positive number greater than 0." }));
                            } else {
                              setFieldErrors(prev => {
                                const updated = { ...prev };
                                delete updated.adGroupBid;
                                return updated;
                              });
                            }
                          }}
                          placeholder="Enter an amount"
                          className={`w-full bg-slate-50 border rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                            (bidStrategy === "Manual CPC" && (!adGroupBid.trim() || isNaN(Number(adGroupBid)) || Number(adGroupBid) <= 0)) || fieldErrors.adGroupBid
                              ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                              : "border-slate-200 focus:border-primary"
                          }`}
                        />
                      </div>
                      {((bidStrategy === "Manual CPC" && (!adGroupBid.trim() || isNaN(Number(adGroupBid)) || Number(adGroupBid) <= 0)) || fieldErrors.adGroupBid) && (
                        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.adGroupBid || "Ad group bid is required and must be greater than 0."}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenAdGroupSetting("product_groups")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenAdGroupSetting("ad_group")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Ad group name</h2>
                    <span className="text-xs font-medium">
                      {!adGroupName.trim() ? (
                        <span className="text-rose-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Name required
                        </span>
                      ) : (
                        <span className="text-slate-500">{adGroupName} • Bid: {adGroupBid ? `₹${adGroupBid}` : "Not set"}</span>
                      )}
                    </span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Product groups */}
              {openAdGroupSetting === "product_groups" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenAdGroupSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Product groups</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-4 pt-2 text-xs">
                    {/* Shopping Settings (shopping_setting) */}
                    <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <ShoppingBag className="h-4 w-4 text-primary" /> Shopping Settings & Merchant Center
                        </h3>
                        <span className="text-[10px] text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded">Required for Shopping</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-slate-700 font-semibold text-xs">Merchant Center ID <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            value={merchantCenterId}
                            onChange={(e) => setMerchantCenterId(e.target.value)}
                            placeholder="e.g. 5840531233"
                            className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-medium focus:outline-none transition-all ${
                              !merchantCenterId.trim() || !/^\d+$/.test(merchantCenterId.trim())
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "border-slate-200 focus:border-primary"
                            }`}
                          />
                          {(!merchantCenterId.trim() || !/^\d+$/.test(merchantCenterId.trim())) && (
                            <span className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 shrink-0" /> {!merchantCenterId.trim() ? "Merchant Center ID is required." : "Must be numeric ID."}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-700 font-semibold text-xs">Feed / Leads Country <span className="text-rose-500">*</span></label>
                          <select
                            value={LeadsCountry}
                            onChange={(e) => {
                              setLeadsCountry(e.target.value);
                              setFeedLabel(e.target.value);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                          >
                            <option value="IN">India (IN)</option>
                            <option value="US">United States (US)</option>
                            <option value="GB">United Kingdom (GB)</option>
                            <option value="CA">Canada (CA)</option>
                            <option value="AU">Australia (AU)</option>
                            <option value="DE">Germany (DE)</option>
                            <option value="FR">France (FR)</option>
                            <option value="AE">United Arab Emirates (AE)</option>
                            <option value="SG">Singapore (SG)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-500">Choose which products to show in your ads. Your ads will use product feed data from the linked Merchant Center account.</p>
                    <label className="flex items-center gap-3 cursor-pointer text-slate-800 font-semibold text-sm">
                      <input type="radio" checked={productGroupFilter === "Use all products"} onChange={() => setProductGroupFilter("Use all products")} className="h-4 w-4 text-primary" />
                      Use all products
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-slate-800 font-semibold text-sm">
                      <input type="radio" checked={productGroupFilter === "Use a selection of products"} onChange={() => setProductGroupFilter("Use a selection of products")} className="h-4 w-4 text-primary" />
                      Use a selection of products
                    </label>
                    
                    {productGroupFilter === "Use a selection of products" && (
                      <div className="pl-7 space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold text-xs">Select products by:</label>
                          <select value={productGroupSelectBy} onChange={(e) => setProductGroupSelectBy(e.target.value)} className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary">
                            {["Category", "Brand", "Item ID", "Condition", "Product type", "Channel", "Channel exclusivity", "Custom label"].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        
                        {productGroupSelectBy === "Custom label" && (
                          <div className="space-y-1 animate-in fade-in">
                            <label className="text-slate-500 font-semibold text-xs">Custom label:</label>
                            <select value={productGroupCustomLabel} onChange={(e) => setProductGroupCustomLabel(e.target.value)} className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary">
                              {[0, 1, 2, 3, 4].map(num => (
                                <option key={num} value={`Custom label ${num}`}>Custom label {num}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {productGroupSelectBy === "Product type" && (
                          <div className="space-y-1 animate-in fade-in">
                            <label className="text-slate-500 font-semibold text-xs">Product type:</label>
                            <select className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary">
                              {["Vehicles & Parts", "Toys & Games", "Hardware", "Furniture", "Food, Beverages & Tobacco", "Electronics", "Cameras & Optics", "Business & Industrial", "Baby & Toddler", "Arts & Entertainment", "Apparel & Accessories", "Animals & Pet Supplies"].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <div className="max-w-sm relative">
                          <input type="text" value={productGroupSearch} onChange={(e) => setProductGroupSearch(e.target.value)} placeholder="Search" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary" />
                        </div>
                        
                        <div className="text-slate-500 text-[11px] p-3 bg-slate-50 border border-slate-200 rounded-lg max-w-sm text-center">
                          No suggestions available. Please add values manually.
                        </div>
                        
                        <div>
                          <button type="button" onClick={() => setShowBulkAdd(!showBulkAdd)} className="text-primary hover:underline font-semibold text-xs text-left">Bulk add values manually {showBulkAdd ? "▴" : "▾"}</button>
                        </div>
                        
                        {showBulkAdd && (
                          <div className="max-w-sm space-y-2 animate-in fade-in slide-in-from-top-2">
                            <textarea
                              value={bulkAddValues}
                              onChange={(e) => setBulkAddValues(e.target.value)}
                              placeholder="Enter or paste one value per line"
                              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary resize-none"
                            />
                            <div className="flex justify-end">
                              <button type="button" onClick={() => { setBulkAddValues(""); setShowBulkAdd(false); }} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 text-xs font-semibold rounded-lg transition-colors">Add values</button>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-slate-500 text-xs italic">
                          None selected
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenAdGroupSetting("assets")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenAdGroupSetting("product_groups")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Product groups</h2>
                    <span className="text-xs text-slate-500">{productGroup}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Assets */}
              {openAdGroupSetting === "assets" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenAdGroupSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Assets & Text</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-slate-500">Provide landing page URL and promotional text assets for your Shopping campaign.</p>
                    
                    {/* Final URL */}
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold text-xs">Final URL <span className="text-rose-500">*</span></label>
                      <input
                        type="url"
                        value={finalUrl}
                        onChange={(e) => setFinalUrl(e.target.value)}
                        placeholder="https://www.example.com"
                        className={`w-full max-w-xl bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                          !finalUrl.trim() || (!finalUrl.trim().startsWith("http://") && !finalUrl.trim().startsWith("https://"))
                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                            : "border-slate-200 focus:border-primary"
                        }`}
                      />
                      {(!finalUrl.trim() || (!finalUrl.trim().startsWith("http://") && !finalUrl.trim().startsWith("https://"))) && (
                        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {!finalUrl.trim() ? "Final URL is required." : "Final URL must begin with http:// or https://"}
                        </span>
                      )}
                    </div>

                    {/* Headlines */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between max-w-xl">
                        <label className="block text-slate-700 font-semibold text-xs">Headlines (At least 1 required) <span className="text-rose-500">*</span></label>
                        <button
                          type="button"
                          onClick={() => setHeadlines([...headlines, ""])}
                          className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add headline
                        </button>
                      </div>
                      {headlines.map((hl, idx) => (
                        <div key={idx} className="flex items-center gap-2 max-w-xl">
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => {
                              const updated = [...headlines];
                              updated[idx] = e.target.value;
                              setHeadlines(updated);
                            }}
                            placeholder={`Headline ${idx + 1}`}
                            className={`flex-1 bg-slate-50 border rounded-xl px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                              idx === 0 && !hl.trim()
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "border-slate-200 focus:border-primary"
                            }`}
                          />
                          {headlines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setHeadlines(headlines.filter((_, i) => i !== idx))}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {headlines.filter(h => h.trim()).length < 1 && (
                        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> At least 1 headline is required.
                        </span>
                      )}
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between max-w-xl">
                        <label className="block text-slate-700 font-semibold text-xs">Descriptions (At least 1 required) <span className="text-rose-500">*</span></label>
                        <button
                          type="button"
                          onClick={() => setDescriptions([...descriptions, ""])}
                          className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add description
                        </button>
                      </div>
                      {descriptions.map((desc, idx) => (
                        <div key={idx} className="flex items-center gap-2 max-w-xl">
                          <textarea
                            rows={2}
                            value={desc}
                            onChange={(e) => {
                              const updated = [...descriptions];
                              updated[idx] = e.target.value;
                              setDescriptions(updated);
                            }}
                            placeholder={`Description ${idx + 1}`}
                            className={`flex-1 bg-slate-50 border rounded-xl px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none transition-all resize-none ${
                              idx === 0 && !desc.trim()
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "border-slate-200 focus:border-primary"
                            }`}
                          />
                          {descriptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setDescriptions(descriptions.filter((_, i) => i !== idx))}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg self-center"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {descriptions.filter(d => d.trim()).length < 1 && (
                        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> At least 1 description is required.
                        </span>
                      )}
                    </div>

                    {/* Logo Section */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                      <h3 className="font-semibold text-slate-800 text-sm">Business logo</h3>
                      <p className="text-[11px] text-slate-500">Add a business logo to help shoppers recognize your ads</p>
                      
                      <div className="mt-3 space-y-4">
                        <div className="flex border-b border-slate-200 overflow-x-auto hidden-scrollbar pb-px">
                          {["Suggested", "Asset library", "Website or social", "Upload"].map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setLogoTab(tab)}
                              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                logoTab === tab
                                  ? "border-primary text-primary"
                                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                        
                        {logoTab === "Upload" ? (
                          <div className="grid grid-cols-2 gap-4 max-w-sm animate-in fade-in">
                            <label className="cursor-pointer group flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary bg-white rounded-xl p-6 transition-all aspect-square relative">
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              {uploadedLogo ? (
                                <div className="text-center space-y-2">
                                  <ImageIcon className="h-8 w-8 text-primary mx-auto" />
                                  <span className="text-[10px] text-slate-700 font-mono break-all line-clamp-1 block px-2">{uploadedLogo.name}</span>
                                </div>
                              ) : (
                                <div className="text-center space-y-2">
                                  <Upload className="h-6 w-6 text-slate-500 group-hover:text-primary transition-colors mx-auto" />
                                  <span className="text-xs font-semibold text-slate-700">Upload logo</span>
                                </div>
                              )}
                            </label>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-xl animate-in fade-in bg-slate-50">
                            {logoTab} assets will appear here.
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Suggested logos</p>
                        <div className="flex gap-2">
                           <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center text-[10px] text-slate-500">None</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button type="button" onClick={() => setOpenAdGroupSetting(null)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs rounded-lg shadow-sm">Done</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpenAdGroupSetting("assets")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-800 w-48">Assets & Text</h2>
                    <span className="text-xs text-slate-500">
                      {finalUrl ? `${finalUrl} • ` : ""}
                      {headlines.filter(h => h.trim()).length} headlines, {descriptions.filter(d => d.trim()).length} descriptions
                    </span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-500" />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="flex flex-col gap-1.5 pb-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review your campaign</h1>
                <div className="flex items-center gap-2 max-w-md">
                  <label className="text-slate-500 font-semibold text-xs shrink-0">Campaign name <span className="text-rose-500">*</span>:</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCampaignName(val);
                      checkDuplicateCampaignName(val);
                    }}
                    className={`flex-1 bg-slate-50 border rounded-xl px-3 py-1.5 font-bold text-xs text-slate-900 focus:outline-none transition-all ${
                      !campaignName.trim() || duplicateNameError || fieldErrors.campaignName
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                        : "border-slate-200 focus:border-primary"
                    }`}
                  />
                </div>
                {(!campaignName.trim() || duplicateNameError || fieldErrors.campaignName) && (
                  <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {duplicateNameError || fieldErrors.campaignName || "Campaign name is required."}
                  </span>
                )}
              </div>

              {/* Dynamic Overall Validation Status Banner - ONLY actual errors shown */}
              {(() => {
                const validationErrors = getReviewValidationErrors();
                const hasErrors = validationErrors.length > 0;

                if (hasErrors) {
                  return (
                    <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>Campaign has {validationErrors.length} {validationErrors.length === 1 ? "issue" : "issues"} that must be fixed before publishing</span>
                      </div>
                      <p className="text-slate-600 text-xs">
                        The following parameters require your attention. Click <strong className="text-rose-600">Fix</strong> to jump directly to the field.
                      </p>
                      <div className="divide-y divide-rose-500/15 pt-1">
                        {validationErrors.map((err) => (
                          <div key={err.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="text-rose-500 text-sm mt-0.5 font-bold">❌</span>
                              <div className="space-y-0.5">
                                <p className="text-rose-600 text-xs font-semibold">{err.message}</p>
                                <span className="text-[10px] text-slate-500 font-medium">Section: {err.level} &gt; {err.parameter}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFixIssue(err)}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-center transition-all cursor-pointer shadow-sm"
                            >
                              <span>Fix</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-emerald-700">Ready to publish</h4>
                        <p className="text-xs text-slate-600">All required campaign settings, budget, bidding, and product group parameters are valid.</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Submit Error Banner */}
              {submitError && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 flex items-start gap-3 text-xs font-semibold animate-in shake duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <span className="font-bold block">Failed to publish campaign</span>
                    <span className="font-normal block leading-relaxed">{submitError}</span>
                  </div>
                </div>
              )}

              {/* Overview */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Overview</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Campaign name</p>
                    <p className="text-slate-800 font-semibold mt-1">{campaignName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Campaign type</p>
                    <p className="text-slate-800 font-semibold mt-1">Shopping</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Goal</p>
                    <p className="text-slate-800 font-semibold mt-1">Leads</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Merchant Center and CSS</p>
                    <p className="text-slate-800 font-semibold mt-1">{merchantCenterId || "Not set"} ({LeadsCountry}) / CSS: Google Shopping</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Feeds</p>
                    <p className="text-slate-800 font-semibold mt-1">All products from all feeds</p>
                  </div>
                </div>
              </div>

              {/* Budget & Bidding Optimization */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Budget and bidding optimization</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Budget</p>
                    <p className="text-slate-800 font-semibold mt-1">{budgetAmount ? `₹${budgetAmount}/${budgetType === "daily" ? "day" : "total"}` : "Enter a budget"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Bidding</p>
                    <p className="text-slate-800 font-semibold mt-1">{bidStrategy} {bidStrategy === "Target ROAS" ? `(${targetRoas}%)` : ""}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Customer acquisition</p>
                    <p className="text-slate-800 font-semibold mt-1">{customerAcquisition ? "Only bid for new customers" : "Bid equally for new and existing customers"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Campaign priority</p>
                    <p className="text-slate-800 font-semibold mt-1">{campaignPriority}</p>
                  </div>
                </div>
              </div>

              {/* Campaign settings */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Campaign settings</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Locations</p>
                    <p className="text-slate-800 font-semibold mt-1">{locationType === "Another" ? customLocation || "Not set" : locationType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Local products</p>
                    <p className="text-slate-800 font-semibold mt-1">{localProducts ? "Turned on" : "Turned off"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">EU political ads</p>
                    <p className="text-slate-800 font-semibold mt-1">{euPoliticalAds.startsWith("No") ? "Doesn't have EU political ads" : "Has EU political ads"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Start and end dates</p>
                    <p className="text-slate-800 font-semibold mt-1">{startDate} - {endDateOption === "None" ? "Not set" : endDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Campaign URL options</p>
                    <p className="text-slate-800 font-semibold mt-1">{trackingTemplate ? trackingTemplate : "No options set"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Networks</p>
                    <p className="text-slate-800 font-semibold mt-1">{networkSearch ? "Search partners" : "Google Search only"}</p>
                  </div>
                </div>
              </div>

              {/* Ad group and assets */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Ad group and assets</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Ad group name</p>
                    <p className="text-slate-800 font-semibold mt-1">{adGroupName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Ad group bid</p>
                    <p className="text-slate-800 font-semibold mt-1">{adGroupBid ? `₹${adGroupBid}` : "Enter an amount"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Product groups</p>
                    <p className="text-slate-800 font-semibold mt-1">{productGroupFilter === "Use all products" ? "All products" : `${productGroupSelectBy}: Selected`}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Final URL</p>
                    <p className="text-slate-800 font-semibold mt-1 truncate">{finalUrl || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Headlines ({headlines.filter(h => h.trim()).length})</p>
                    <p className="text-slate-800 font-semibold mt-1">{headlines.filter(h => h.trim())[0] || "None added"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Descriptions ({descriptions.filter(d => d.trim()).length})</p>
                    <p className="text-slate-800 font-semibold mt-1 truncate">{descriptions.filter(d => d.trim())[0] || "None added"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Business logo</p>
                    <p className="text-slate-800 font-semibold mt-1">{uploadedLogo ? "1 logo added" : "No logo added"}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => {
            if (wizardStep === "SUMMARY") setWizardStep("AD_GROUP");
            else if (wizardStep === "AD_GROUP") setWizardStep("CAMPAIGN_SETTINGS");
            else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("BUDGET_BIDDING");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          {wizardStep === "BUDGET_BIDDING" ? "Cancel" : "Back"}
        </button>

        {wizardStep !== "SUMMARY" ? (
          <button
            onClick={() => {
              if (wizardStep === "BUDGET_BIDDING") setWizardStep("CAMPAIGN_SETTINGS");
              else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("AD_GROUP");
              else if (wizardStep === "AD_GROUP") setWizardStep("SUMMARY");
            }}
            className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-md shadow-blue-600/20 transition-all text-xs"
          >
            Next
          </button>
        ) : (
          (() => {
            const validationErrors = getReviewValidationErrors();
            const hasValidationErrors = validationErrors.length > 0;
            return (
              <button
                disabled={isPublishing || hasValidationErrors}
                onClick={async () => {
                  setSubmitError(null);

                  // Run complete frontend validation check
                  if (hasValidationErrors) {
                    const firstErr = validationErrors[0];
                    setSubmitError(`${firstErr.parameter}: ${firstErr.message}`);
                    handleFixIssue(firstErr);
                    return;
                  }

                  // All parameters are valid! Proceed to launch
                  setIsPublishing(true);
                  try {
                    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                    const activeOrgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
                    const targetCid = customerId || "6587355041";

                    // Map Bidding Strategy and strip stale fields
                    let resolvedBiddingStrategy = "MANUAL_CPC";
                    let resolvedTargetRoas: number | undefined = undefined;
                    let resolvedMaxCpc: number | undefined = undefined;

                    if (bidStrategy === "Target ROAS") {
                      resolvedBiddingStrategy = "TARGET_ROAS";
                      resolvedTargetRoas = Number(targetRoas);
                    } else if (bidStrategy === "Maximize clicks") {
                      resolvedBiddingStrategy = "MAXIMIZE_CLICKS";
                      if (setMaxCpcLimit && maxCpcLimitAmount) {
                        resolvedMaxCpc = Number(maxCpcLimitAmount);
                      }
                    } else if (bidStrategy === "Maximize conversion value") {
                      resolvedBiddingStrategy = "MAXIMIZE_CONVERSION_VALUE";
                    }

                    // Sanitize shoppingSetting object
                    const sanitizedShoppingSetting = {
                      merchantId: merchantCenterId.trim(),
                      LeadsCountry: LeadsCountry.trim(),
                      feedLabel: feedLabel.trim() || LeadsCountry.trim(),
                      campaignPriority: campaignPriority.split(" ")[0].toUpperCase(),
                      enableLocalProducts: Boolean(localProducts)
                    };

                    const payloadToLaunch = {
                      orgId: activeOrgId,
                      customerId: targetCid,
                      campaignName: campaignName.trim(),
                      channelType: "SHOPPING",
                      biddingStrategy: resolvedBiddingStrategy,
                      budget: Number(budgetAmount),
                      budgetType: budgetType.toUpperCase(),
                      targetRoas: resolvedTargetRoas,
                      maxCpcLimit: resolvedMaxCpc,
                      merchantCenterId: merchantCenterId.trim(),
                      LeadsCountry: LeadsCountry.trim(),
                      feedLabel: feedLabel.trim() || LeadsCountry.trim(),
                      shoppingSetting: sanitizedShoppingSetting,
                      finalUrl: finalUrl.trim(),
                      headlines: headlines.map(h => h.trim()).filter(Boolean),
                      descriptions: descriptions.map(d => d.trim()).filter(Boolean),
                      adGroupName: adGroupName.trim(),
                      adGroupBid: bidStrategy === "Manual CPC" && adGroupBid ? Number(adGroupBid) : undefined,
                      customerAcquisitionMode: customerAcquisition ? "NEW_CUSTOMERS_ONLY" : "ALL_CUSTOMERS",
                      campaignPriority: campaignPriority.split(" ")[0].toUpperCase(),
                      locations: locationType === "All" ? ["ALL"] : locationType === "India" ? ["INDIA"] : [customLocation.trim()],
                      localProducts,
                      euPolitical: euPoliticalAds.startsWith("Yes") ? "YES" : "NO",
                      startDate: startDate || getLocalToday(),
                      endDate: endDateOption === "Select a date" && endDate ? endDate : undefined,
                      trackingTemplate: trackingTemplate.trim() || undefined,
                      finalUrlSuffix: finalUrlSuffix.trim() || undefined,
                      includeSearchPartners: networkSearch,
                      productGroupFilter,
                      productGroupSelectBy: productGroupFilter === "Use a selection of products" ? productGroupSelectBy : undefined
                    };

                    console.log("[Shopping Launch] Sanitized payload before publish:", JSON.stringify(payloadToLaunch, null, 2));

                    // Verify shoppingSetting presence in frontend payload
                    if (!payloadToLaunch.shoppingSetting || !payloadToLaunch.shoppingSetting.merchantId || !payloadToLaunch.shoppingSetting.LeadsCountry) {
                      setSubmitError("Shopping Setting is incomplete. Merchant Center ID and Leads Country are required.");
                      setIsPublishing(false);
                      return;
                    }

                    const res = await fetch(`${BACKEND}/api/ads/campaign/launch`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payloadToLaunch)
                    });

                    if (res.ok) {
                      alert(`Shopping campaign "${campaignName.trim()}" published successfully!`);
                      router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
                    } else {
                      const errData = await res.json().catch(() => ({}));
                      setSubmitError(errData.message || errData.error || "Failed to publish Shopping campaign.");
                    }
                  } catch (err: any) {
                    setSubmitError(err?.message || "Backend server unavailable.");
                  } finally {
                    setIsPublishing(false);
                  }
                }}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
              >
                {isPublishing ? "Publishing..." : "Save & Publish"}
                <Check className="h-4 w-4" />
              </button>
            );
          })()
        )}
      </footer>
    </div>
  );
}
