import { Router } from "express";
import { GoogleAdsAiAssistantService, CampaignState } from "../../services/googleAds/GoogleAdsAiAssistantService";
import { GoogleAdsImageGenService } from "../../services/googleAds/GoogleAdsImageGenService";
import { GoogleAdsCampaignValidator } from "../../services/googleAds/shared/GoogleAdsCampaignValidator";
import { GoogleAdsBaseService } from "../../services/googleAds/shared/GoogleAdsBaseService";
import { CampaignPlan, CampaignPlanMapper, CampaignReviewSummary } from "../../services/googleAds/shared/CampaignPlan";
import { CampaignPlanValidator } from "../../services/googleAds/shared/CampaignPlanValidator";
import { analyzeWebsiteUrl } from "../../services/googleAds/shared/websiteAnalyzer";
import { CustomerBusinessProfileService } from "../../services/googleAds/CustomerBusinessProfileService";
import { SalesSearchService } from "../../services/googleAds/sales/SalesSearchService";
import { SalesPerformanceMaxService } from "../../services/googleAds/sales/SalesPerformanceMaxService";
import { SalesDisplayService } from "../../services/googleAds/sales/SalesDisplayService";
import { SalesDemandGenService } from "../../services/googleAds/sales/SalesDemandGenService";
import { SalesVideoService } from "../../services/googleAds/sales/SalesVideoService";
import { SalesShoppingService } from "../../services/googleAds/sales/SalesShoppingService";
import { LeadsSearchService } from "../../services/googleAds/leads/LeadsSearchService";
import { LeadsPerformanceMaxService } from "../../services/googleAds/leads/LeadsPerformanceMaxService";
import { LeadsDisplayService } from "../../services/googleAds/leads/LeadsDisplayService";
import { LeadsDemandGenService } from "../../services/googleAds/leads/LeadsDemandGenService";
import { LeadsVideoService } from "../../services/googleAds/leads/LeadsVideoService";
import { LeadsShoppingService } from "../../services/googleAds/leads/LeadsShoppingService";
import { WebsiteTrafficSearchService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficSearchService";
import { WebsiteTrafficPerformanceMaxService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficPerformanceMaxService";
import { WebsiteTrafficDemandGenService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficDemandGenService";
import { WebsiteTrafficDisplayService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficDisplayService";
import { WebsiteTrafficVideoService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficVideoService";
import { WebsiteTrafficShoppingService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficShoppingService";
import { YoutubeVideoService } from "../../services/googleAds/youtubeReach/YoutubeVideoService";
import { YoutubeDemandGenService } from "../../services/googleAds/youtubeReach/YoutubeDemandGenService";
import { YoutubeDisplayLocalService } from "../../services/googleAds/youtubeReach/YoutubeDisplayLocalService";
import { NoGuidanceSearchService } from "../../services/googleAds/noGuidance/NoGuidanceSearchService";
import { NoGuidanceDisplayService } from "../../services/googleAds/noGuidance/NoGuidanceDisplayService";
import { NoGuidanceVideoService } from "../../services/googleAds/noGuidance/NoGuidanceVideoService";
import { NoGuidanceShoppingService } from "../../services/googleAds/noGuidance/NoGuidanceShoppingService";
import { NoGuidanceDemandGenService } from "../../services/googleAds/noGuidance/NoGuidanceDemandGenService";
import { NoGuidancePerformanceMaxService } from "../../services/googleAds/noGuidance/NoGuidancePerformanceMaxService";
import { StoreVisitsPerformanceMaxService } from "../../services/googleAds/storeVisits/StoreVisitsPerformanceMaxService";
import { AppPromotionAppService } from "../../services/googleAds/appPromotion/AppPromotionAppService";
import axios from "axios";
import { IndianHolidayService } from "../../services/googleAds/shared/IndianHolidayService";
import { GoogleAdsKeywordIntelligenceService } from "../../services/googleAds/shared/GoogleAdsKeywordIntelligenceService";
import { GoogleAdsAudienceIntelligenceService } from "../../services/googleAds/shared/GoogleAdsAudienceIntelligenceService";
import { GoogleAdsSharedSetService } from "../../services/googleAds/GoogleAdsSharedSetService";
import { GoogleAdsPerformancePlannerService } from "../../services/googleAds/GoogleAdsPerformancePlannerService";
import { GoogleAdsKeywordPlannerService } from "../../services/googleAds/GoogleAdsKeywordPlannerService";
import { GoogleAdsService } from "../../services/googleAdsService";
import { GoogleAdsAssetGroupService } from "../../services/googleAds/GoogleAdsAssetGroupService";
import { GoogleAdsAssetTypesService } from "../../services/googleAds/GoogleAdsAssetTypesService";
import { GoogleAdsShoppingService } from "../../services/googleAds/GoogleAdsShoppingService";
import { CampaignNormalizationService, CampaignValidationError, SupportedCampaignType, SupportedObjective } from "../../services/googleAds/shared/CampaignNormalizationService";
import { CampaignPayloadBuilders, NormalizedCampaignContext } from "../../services/googleAds/shared/CampaignPayloadBuilders";

import prisma from "../../utils/prisma";

import { validateCustomerOwnership } from "../../utils/customerOwnership";
import { YouTubeService } from "../../services/youtubeService";

const router = Router();

/**
 * Resolves the effective 10-digit Google Ads customer ID for an organization.
 * If customerId is provided, validates that it matches 10-digit format and belongs to org.
 * If customerId is missing, empty, or undefined, auto-detects from the organization's
 * connected Google Ad Accounts (active first) or GMB Google Ads configuration.
 */
async function resolveEffectiveCustomerId(orgId: string, explicitCustomerId?: string | null): Promise<string | null> {
  const cleanProvided = String(explicitCustomerId || "").replace(/-/g, "").trim();
  if (cleanProvided && /^\d{10}$/.test(cleanProvided)) {
    return cleanProvided;
  }

  if (!orgId) return null;

  try {
    const org = await (prisma.organization as any).findUnique({
      where: { id: orgId },
      include: {
        googleAdAccounts: true,
        gmbConfigs: { take: 1 }
      }
    });

    if (org?.googleAdAccounts && org.googleAdAccounts.length > 0) {
      const activeAccount = org.googleAdAccounts.find((a: any) => a.isActive && a.customerId && /^\d{10}$/.test(a.customerId.replace(/-/g, "").trim()));
      if (activeAccount) {
        return activeAccount.customerId.replace(/-/g, "").trim();
      }
      const anyAccount = org.googleAdAccounts.find((a: any) => a.customerId && /^\d{10}$/.test(a.customerId.replace(/-/g, "").trim()));
      if (anyAccount) {
        return anyAccount.customerId.replace(/-/g, "").trim();
      }
    }

    const gmbCid = org?.gmbConfigs?.[0]?.googleAdsCustomerId;
    if (gmbCid && /^\d{10}$/.test(String(gmbCid).replace(/-/g, "").trim())) {
      return String(gmbCid).replace(/-/g, "").trim();
    }

    // Direct lookup on GoogleAdAccount table
    const directAccount = await prisma.googleAdAccount.findFirst({
      where: { organizationId: orgId, isActive: true }
    });
    if (directAccount?.customerId && /^\d{10}$/.test(directAccount.customerId.replace(/-/g, "").trim())) {
      return directAccount.customerId.replace(/-/g, "").trim();
    }
  } catch (err: any) {
    console.warn(`[AI-GUIDED] Warning auto-resolving customerId for org ${orgId}:`, err?.message || err);
  }

  return null;
}

// GET /api/ads/ai-guided/user-profile — Fetch detailed login, organization & Google Ads business profile
router.get("/user-profile", async (req, res) => {
  try {
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || "demo-org-123") as string;
    const customerId = (req.query.customerId || "") as string;

    const org = await (prisma.organization as any).findUnique({
      where: { id: orgId },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        gmbConfigs: { take: 1 },
        aiAgentConfigs: { take: 1 },
        googleAdAccounts: true,
        aiKnowledgeItems: { where: { isActive: true }, take: 5 }
      }
    });

    const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";
    let currentAccount = null;
    if (org?.googleAdAccounts && cleanCid) {
      currentAccount = org.googleAdAccounts.find((a: any) => a.customerId === cleanCid);
    } else if (!cleanCid && org?.googleAdAccounts?.length) {
      // Only default to first account if no customerId was specified in request
      currentAccount = org.googleAdAccounts[0];
    }

    const firstUser = org?.users?.[0];
    const orgName = org?.name || "";
    const primaryGmbConfig = org?.gmbConfigs?.[0] || org?.gmbConfig;
    const primaryAiConfig = org?.aiAgentConfigs?.[0] || org?.aiAgentConfig;
    const gmbLocation = primaryGmbConfig?.locationName || "";
    const gmbAccount = primaryGmbConfig?.accountName || "";
    const knowledgeSnippets = org?.aiKnowledgeItems?.map((k: any) => k.content).join("\n") || "";

    // If customerId was requested but not found in accounts, do not leak default account or GMB customerId
    const resolvedCustomerId = cleanCid
      ? (currentAccount?.customerId || customerId)
      : (currentAccount?.customerId || primaryGmbConfig?.googleAdsCustomerId || "");

    const businessName = currentAccount?.name || (cleanCid ? (orgName || "My Business") : (gmbLocation || orgName || "My Business"));
    const userName = firstUser?.name || firstUser?.email?.split("@")[0] || "User";

    // Query customer-scoped approved business profile with ownership validation
    let savedProfile: any = null;
    if (cleanCid) {
      const isOwned = await validateCustomerOwnership(orgId, cleanCid);
      if (!isOwned) {
        return res.status(403).json({
          error: "Access denied. Customer ID does not belong to your organization."
        });
      }
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    }

    // Filter only active records (Do NOT expose rejected AI suggestions to AI Guided assistant)
    const activeProducts = Array.isArray(savedProfile?.products)
      ? savedProfile.products.filter((p: any) => typeof p === "string" || p.isActive !== false)
      : [];
    const activeServices = Array.isArray(savedProfile?.services)
      ? savedProfile.services.filter((s: any) => typeof s === "string" || s.isActive !== false)
      : [];
    const activeTargetAudiences = Array.isArray(savedProfile?.targetAudiences)
      ? savedProfile.targetAudiences.filter((a: any) => a.isActive !== false)
      : [];
    const activeCustomerPersonas = Array.isArray(savedProfile?.customerPersonas)
      ? savedProfile.customerPersonas.filter((p: any) => p.isActive !== false)
      : [];
    const activeLocationRecords = Array.isArray(savedProfile?.locationRecords)
      ? savedProfile.locationRecords.filter((l: any) => l.isActive !== false)
      : [];
    const activeConversionGoals = Array.isArray(savedProfile?.conversionGoals)
      ? savedProfile.conversionGoals.filter((g: any) => g.isActive !== false)
      : [];
    const activeCompetitors = Array.isArray(savedProfile?.competitors)
      ? savedProfile.competitors.filter((c: any) => c.isActive !== false)
      : [];
    const activeSeoKeywords = Array.isArray(savedProfile?.seoKeywords)
      ? savedProfile.seoKeywords.filter((k: any) => k.isActive !== false)
      : [];
    const activeNegativeKeywords = Array.isArray(savedProfile?.negativeKeywords)
      ? savedProfile.negativeKeywords.filter((nk: any) => nk.isActive !== false)
      : [];
    const activeFaqs = Array.isArray(savedProfile?.faqs)
      ? savedProfile.faqs.filter((f: any) => f.isActive !== false)
      : [];
    const activeMediaAssets = Array.isArray(savedProfile?.mediaAssets)
      ? savedProfile.mediaAssets.filter((m: any) => m.status !== "INACTIVE" && m.legalRightsConfirmed)
      : [];
    const rawYoutubeLinks = Array.isArray(savedProfile?.youtubeLinks)
      ? savedProfile.youtubeLinks.filter((y: any) => typeof y === "string" && y.trim().length > 0)
      : [];
    const activeAiSuggestions = Array.isArray(savedProfile?.aiSuggestions)
      ? savedProfile.aiSuggestions.filter((s: any) => !s.rejected)
      : [];

    const effectiveLocations = (savedProfile?.locations && Array.isArray(savedProfile.locations) && savedProfile.locations.length > 0)
      ? savedProfile.locations
      : (cleanCid && !currentAccount ? [] : (gmbLocation ? [gmbLocation] : ["India"]));

    const customerProfile = savedProfile ? {
      isApproved: Boolean(savedProfile.isApproved),
      approvedAt: savedProfile.approvedAt || null,
      businessName: savedProfile.businessName || businessName,
      legalBusinessName: savedProfile.legalBusinessName || "",
      industry: savedProfile.industry || "",
      businessCategory: savedProfile.businessCategory || "",
      businessDescription: savedProfile.businessDescription || "",
      customerType: savedProfile.customerType || "",
      businessModel: savedProfile.businessModel || "",
      businessEmail: savedProfile.businessEmail || "",
      businessPhone: savedProfile.businessPhone || "",
      whatsappNumber: savedProfile.whatsappNumber || "",
      businessAddress: savedProfile.businessAddress || "",
      serviceAreas: savedProfile.serviceAreas || [],
      languagesServed: savedProfile.languagesServed || [],
      primaryWebsite: savedProfile.primaryWebsite || "",
      additionalWebsites: savedProfile.additionalWebsites || [],
      products: activeProducts,
      services: activeServices,
      targetAudience: savedProfile.targetAudience || "",
      targetAudiences: activeTargetAudiences,
      customerPersonas: activeCustomerPersonas,
      locations: effectiveLocations,
      locationRecords: activeLocationRecords,
      conversionGoals: activeConversionGoals,
      brandProfile: savedProfile.brandProfile || null,
      brandExclusions: savedProfile?.brandProfile?.brandExclusions || [],
      competitors: activeCompetitors,
      seoKeywords: activeSeoKeywords,
      negativeKeywords: activeNegativeKeywords,
      faqs: activeFaqs,
      aiSuggestions: activeAiSuggestions,
      mediaAssets: activeMediaAssets,
      youtubeLinks: rawYoutubeLinks,
      youtubeConnection: { isConnected: false },
      keyOfferings: savedProfile.keyOfferings || [],
      hasMerchantAccount: Boolean(savedProfile.hasMerchantAccount),
      merchantCenterId: savedProfile.merchantCenterId || "",
      merchantDetails: savedProfile.merchantDetails || null,
      hasAppAccount: Boolean(savedProfile.hasAppAccount),
      appDetails: savedProfile.appDetails || []
    } : null;

    // Query authenticated YouTube module connection status (Scoped strictly to authenticated orgId)
    let youtubeConnection = { isConnected: false } as {
      isConnected: boolean;
      channelId?: string;
      channelTitle?: string;
      thumbnail?: string;
    };
    try {
      youtubeConnection = await YouTubeService.getOrganizationConnectionStatus(orgId);
    } catch (ytStatusErr: any) {
      console.warn("[AI-GUIDED.user-profile] YouTube connection status check warning:", ytStatusErr?.message || ytStatusErr);
    }

    if (customerProfile) {
      customerProfile.youtubeConnection = youtubeConnection;
    }

    res.status(200).json({
      success: true,
      orgId,
      organizationName: orgName,
      userName,
      userEmail: firstUser?.email || "",
      userRole: firstUser?.role || "agent",
      businessName: savedProfile?.businessName || businessName,
      legalBusinessName: savedProfile?.legalBusinessName || "",
      businessCategory: savedProfile?.businessCategory || "",
      businessDescription: savedProfile?.businessDescription || "",
      customerType: savedProfile?.customerType || "",
      businessModel: savedProfile?.businessModel || "",
      businessEmail: savedProfile?.businessEmail || "",
      businessPhone: savedProfile?.businessPhone || "",
      whatsappNumber: savedProfile?.whatsappNumber || "",
      businessAddress: savedProfile?.businessAddress || "",
      serviceAreas: savedProfile?.serviceAreas || [],
      languagesServed: savedProfile?.languagesServed || [],
      industry: savedProfile?.industry || "",
      primaryWebsite: savedProfile?.primaryWebsite || "",
      additionalWebsites: savedProfile?.additionalWebsites || [],
      products: activeProducts,
      services: activeServices,
      targetAudience: savedProfile?.targetAudience || "",
      targetAudiences: activeTargetAudiences,
      customerPersonas: activeCustomerPersonas,
      keyOfferings: savedProfile?.keyOfferings || [],
      locations: effectiveLocations,
      locationRecords: activeLocationRecords,
      conversionGoals: activeConversionGoals,
      brandProfile: savedProfile?.brandProfile || null,
      brandExclusions: savedProfile?.brandProfile?.brandExclusions || [],
      competitors: activeCompetitors,
      seoKeywords: activeSeoKeywords,
      negativeKeywords: activeNegativeKeywords,
      faqs: activeFaqs,
      aiSuggestions: activeAiSuggestions,
      mediaAssets: activeMediaAssets,
      youtubeLinks: rawYoutubeLinks,
      youtubeConnection,
      hasMerchantAccount: Boolean(savedProfile?.hasMerchantAccount),
      merchantCenterId: savedProfile?.merchantCenterId || "",
      merchantDetails: savedProfile?.merchantDetails || null,
      hasAppAccount: Boolean(savedProfile?.hasAppAccount),
      appDetails: savedProfile?.appDetails || [],
      isProfileApproved: Boolean(savedProfile?.isApproved),
      approvedAt: savedProfile?.approvedAt || null,
      customerProfile,
      locationName: cleanCid && !currentAccount ? "" : gmbLocation,
      accountName: cleanCid && !currentAccount ? "" : gmbAccount,
      customerId: resolvedCustomerId,
      currencyCode: currentAccount?.currencyCode || "INR",
      timeZone: currentAccount?.timeZone || "Asia/Kolkata",
      knowledgeSummary: knowledgeSnippets,
      agentGreeting: primaryAiConfig?.greetingMessage || ""
    });
  } catch (error: any) {
    console.error("[AI-GUIDED] Error fetching user profile:", error);
    res.status(500).json({ error: error.message || "Failed to fetch user profile" });
  }
});

// GET /api/ads/ai-guided/calendar-opportunities — Standalone Indian Festival & Holiday Calendar Opportunities
router.get("/calendar-opportunities", async (req, res) => {
  try {
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || "demo-org-123") as string;
    const customerId = (req.query.customerId || "") as string;
    const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";
    const requestedYear = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

    let savedProfile: any = null;
    if (cleanCid) {
      const isOwned = await validateCustomerOwnership(orgId, cleanCid);
      if (!isOwned) {
        return res.status(403).json({ error: "Access denied. Customer ID does not belong to your organization." });
      }
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    }

    const activeProducts = Array.isArray(savedProfile?.products)
      ? savedProfile.products.map((p: any) => typeof p === "string" ? p : p.name).filter(Boolean)
      : [];
    const activeServices = Array.isArray(savedProfile?.services)
      ? savedProfile.services.map((s: any) => typeof s === "string" ? s : s.name).filter(Boolean)
      : [];

    const customerContext = {
      businessName: savedProfile?.businessName || "",
      industry: savedProfile?.industry || "",
      category: savedProfile?.businessCategory || "",
      products: activeProducts,
      services: activeServices,
      targetAudience: savedProfile?.targetAudience || "",
      locations: Array.isArray(savedProfile?.locations) ? savedProfile.locations : []
    };

    const calendarData = await IndianHolidayService.getRollingWindowCalendar(customerContext, requestedYear);

    res.status(200).json({
      success: true,
      customerId: cleanCid,
      ...calendarData
    });
  } catch (error: any) {
    console.error("[AI-GUIDED] Error generating calendar opportunities:", error);
    res.status(500).json({ error: error.message || "Failed to generate calendar opportunities" });
  }
});

// In-memory cache for analyzed website URLs to prevent redundant re-scraping and duplicate Groq AI calls
export const urlAnalysisCache = new Map<string, { timestamp: number; data: any }>();
export const URL_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in-session cache

export function normalizeWebsiteUrl(raw: string): string {
  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    // Keep pathname and search params if present, strip trailing slash and hash
    const cleanHost = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const cleanPath = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.protocol}//${cleanHost}${cleanPath}${parsed.search}`;
  } catch {
    return raw.trim().toLowerCase().replace(/\/+$/, "");
  }
}

// POST /api/ads/ai-guided/analyze-url
router.post("/analyze-url", async (req, res) => {
  const rawUrl = req.body?.url;
  const url = typeof rawUrl === "string" ? rawUrl.trim().replace(/^["'(\[]+|["')\].,]+$/g, "") : "";
  console.log(`[AI-GUIDED] URL detected / analyze-url request started: ${url}`);
  try {
    if (!url) {
      console.warn("[AI-GUIDED] analyze-url failed: missing url in body");
      return res.status(400).json({ error: "URL is required" });
    }

    const normalizedKey = normalizeWebsiteUrl(url);
    const cached = urlAnalysisCache.get(normalizedKey);
    if (cached && (Date.now() - cached.timestamp < URL_CACHE_TTL_MS)) {
      console.log(`[AI-GUIDED] Reusing cached website analysis for: ${url} (0 AI tokens consumed)`);
      return res.status(200).json({ ...cached.data, cached: true });
    }

    const analysis = await analyzeWebsiteUrl(url);
    if (!analysis.success) {
      console.warn(`[AI-GUIDED] analyze-url returned unsuccessful for ${url}:`, analysis.error);
      return res.status(200).json(analysis);
    }

    console.log(`[AI-GUIDED] analyze-url success for ${url}:`, {
      title: analysis.title,
      description: analysis.description?.substring(0, 100),
      headingsCount: analysis.headings?.length || 0,
      snippetLength: analysis.mainTextSnippet?.length || 0
    });

    // Comprehensive AI Analysis with Groq/Grok Llama-3.3-70B model
    let derivedBusinessName = "";
    let industry = "";
    let productsServices: string[] = [];
    let businessDescription = analysis.description || "";
    let usp = "";
    let targetAudience = "";
    let locations: string[] = [];
    let language = "en";
    let headlines: string[] = [];
    let longHeadlines: string[] = [];
    let descriptions: string[] = [];
    let keywords: string[] = [];
    let searchThemes: string[] = [];
    let sitelinks: Array<{ text: string; desc1?: string; desc2?: string; url: string }> = [];
    let callouts: string[] = [];
    let structuredSnippets: Array<{ header: string; values: string[] }> = [];

    if (analysis.title) {
      derivedBusinessName = analysis.title.split(/[-|:–]/)[0]?.trim();
    }
    if (!derivedBusinessName) {
      try {
        const u = new URL(url);
        const hostParts = u.hostname.replace(/^www\./, "").split(".");
        derivedBusinessName = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);
      } catch { }
    }

    // Call Groq if we have any scraped text
    if (analysis.title || analysis.description || (analysis.headings && analysis.headings.length > 0) || analysis.mainTextSnippet) {
      try {
        const prompt = `Analyze this verified website content to extract business intelligence, conversion-focused Google Ads ad copy, Performance Max search themes, and sitelink extensions.
Website Title: "${analysis.title || ""}"
Meta Description: "${analysis.description || ""}"
Headings: ${JSON.stringify(analysis.headings || [])}
Discovered Site Links: ${JSON.stringify((analysis.discoveredLinks || []).slice(0, 10))}
Content Snippet: "${(analysis.mainTextSnippet || "").slice(0, 2000)}"
Target URL: "${url}"

Provide:
1. Business Name (clean, under 25 chars, no legal suffixes like LLC/Inc/Pvt Ltd unless essential).
2. Industry / Business Category.
3. Core Products or Services (array of 3-6 items).
4. Concise Business Description (under 150 chars).
5. Unique Selling Proposition / Key differentiator (under 90 chars).
6. Target Audience summary (under 60 chars).
7. Target Locations / Regions mentioned or inferred from language/currency/contact (e.g. ["India"] or ["United States"]).
8. Primary language of the content (e.g. "en", "es", "hi").
9. Headlines: 3 to 5 punchy, high-CTR Google Ads headlines (EXACTLY <= 30 characters each). DO NOT exceed 30 chars.
10. Long Headlines: 1 to 2 compelling long headlines for Performance Max & responsive ads (EXACTLY <= 90 characters each).
11. Descriptions: 2 to 4 high-converting descriptions (EXACTLY <= 90 characters each). DO NOT exceed 90 chars.
12. Call to Action: appropriate CTA (e.g., "Shop Now", "Learn More", "Get Quote", "Contact Us").
13. Keywords: 5 to 10 purchase-intent search keywords based strictly on actual website offerings (in primary language or relevant search terms).
14. Search Themes: 5 to 10 buyer intent search topics/categories for Google Performance Max Asset Group signals (each <= 80 characters, e.g. "gaming laptop store", "custom pc build services", "best deals on electronics").
15. Sitelinks: 2 to 4 high-relevance sitelink extensions for Performance Max & Search ads.
    CRITICAL SITELINK URL REQUIREMENT: Google Ads requires each sitelink to point to a UNIQUE and relevant destination URL / subpage. DO NOT output the exact same homepage URL for every sitelink.
    - If a matching link exists in "Discovered Site Links", use its exact URL.
    - Otherwise, build appropriate subpage paths based on the link's topic, e.g.:
      * For "About Us" / company info: construct "${url.replace(/\/+$/, '')}/about" or "/about-us"
      * For "Contact Us" / support: construct "${url.replace(/\/+$/, '')}/contact" or "/contact-us"
      * For "Services" / "Products": construct "${url.replace(/\/+$/, '')}/services" or "/products"
      * For "Pricing" / "Plans": construct "${url.replace(/\/+$/, '')}/pricing"
    Each sitelink must have:
    - "text": Punchy link title (EXACTLY <= 25 characters, e.g., "About Us", "Our Products", "Pricing Plans", "Contact Us")
    - "desc1": First description line (EXACTLY <= 35 characters)
    - "desc2": Second description line (EXACTLY <= 35 characters)
    - "url": Distinct landing page URL for that specific page (e.g., https://example.com/about)

16. Callouts: 3 to 4 short highlights (each <= 25 characters, e.g. "Free Shipping", "24/7 Support", "Verified Quality").
17. Structured Snippets: 1 snippet with a header (e.g. "Services", "Brands", "Types", "Models") and 3 to 4 values (each <= 25 characters).

Return ONLY JSON matching this format:
{
  "businessName": "string",
  "industry": "string",
  "productsServices": ["string"],
  "description": "string",
  "usp": "string",
  "targetAudience": "string",
  "locations": ["string"],
  "language": "string",
  "headlines": ["string"],
  "longHeadlines": ["string"],
  "descriptions": ["string"],
  "keywords": ["string"],
  "searchThemes": ["string"],
  "callouts": ["string"],
  "structuredSnippets": [
    {
      "header": "string",
      "values": ["string"]
    }
  ],
  "sitelinks": [
    {
      "text": "string",
      "desc1": "string",
      "desc2": "string",
      "url": "string"
    }
  ]
}`;

        const groqResult = await GoogleAdsAiAssistantService.executeGroqChat({
          messages: [
            { role: "system", content: "You are an expert Google Ads strategist extracting verified business information, ad copy, Performance Max search themes, and sitelink extensions from website content. Output strictly valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 1200,
          response_format: { type: "json_object" }
        });

        const copyData = JSON.parse(groqResult.content || "{}");
        if (copyData.businessName && typeof copyData.businessName === "string" && copyData.businessName.length <= 25) {
          derivedBusinessName = copyData.businessName.trim();
        }
        if (copyData.industry && typeof copyData.industry === "string") {
          industry = copyData.industry.trim();
        }
        if (Array.isArray(copyData.productsServices) && copyData.productsServices.length > 0) {
          productsServices = copyData.productsServices.map((p: string) => String(p).trim()).filter(Boolean);
        }
        if (copyData.description && typeof copyData.description === "string") {
          businessDescription = copyData.description.trim();
        }
        if (copyData.usp && typeof copyData.usp === "string") {
          usp = copyData.usp.trim();
        }
        if (copyData.targetAudience && typeof copyData.targetAudience === "string") {
          targetAudience = copyData.targetAudience.trim();
        }
        if (Array.isArray(copyData.locations) && copyData.locations.length > 0) {
          locations = copyData.locations.map((l: string) => String(l).trim()).filter(Boolean);
        }
        if (copyData.language && typeof copyData.language === "string") {
          language = copyData.language.trim();
        }
        if (Array.isArray(copyData.headlines) && copyData.headlines.length > 0) {
          headlines = copyData.headlines.map((h: string) => h.trim().slice(0, 30)).filter(Boolean);
        }
        if (Array.isArray(copyData.longHeadlines) && copyData.longHeadlines.length > 0) {
          longHeadlines = copyData.longHeadlines.map((lh: string) => lh.trim().slice(0, 90)).filter(Boolean);
        }
        if (Array.isArray(copyData.descriptions) && copyData.descriptions.length > 0) {
          descriptions = copyData.descriptions.map((d: string) => d.trim().slice(0, 90)).filter(Boolean);
        }
        if (Array.isArray(copyData.keywords) && copyData.keywords.length > 0) {
          keywords = copyData.keywords.map((k: string) => k.trim()).filter(Boolean);
        }
        if (Array.isArray(copyData.searchThemes) && copyData.searchThemes.length > 0) {
          searchThemes = copyData.searchThemes
            .map((st: string) => GoogleAdsBaseService.cleanAdText(st, 80))
            .filter(Boolean);
        }
        if (Array.isArray(copyData.sitelinks) && copyData.sitelinks.length > 0) {
          sitelinks = copyData.sitelinks
            .filter((s: any) => s && (s.text || s.linkText))
            .map((s: any) => ({
              text: GoogleAdsBaseService.cleanAdText(String(s.text || s.linkText), 25),
              desc1: s.desc1 || s.description1 ? GoogleAdsBaseService.cleanAdText(String(s.desc1 || s.description1), 35) : "",
              desc2: s.desc2 || s.description2 ? GoogleAdsBaseService.cleanAdText(String(s.desc2 || s.description2), 35) : "",
              url: GoogleAdsBaseService.cleanUrl ? GoogleAdsBaseService.cleanUrl(s.url || url) : (s.url || url)
            }))
            .filter((s: any) => s.text && s.url);
        }
        if (Array.isArray(copyData.callouts) && copyData.callouts.length > 0) {
          callouts = copyData.callouts
            .map((c: string) => GoogleAdsBaseService.cleanAdText(String(c), 25))
            .filter(Boolean);
        }
        if (Array.isArray(copyData.structuredSnippets) && copyData.structuredSnippets.length > 0) {
          structuredSnippets = copyData.structuredSnippets.filter((sn: any) => sn && sn.header && Array.isArray(sn.values));
        }
      } catch (gErr: any) {
        console.warn("[AI-GUIDED] AI analysis from website failed, falling back to heuristic extraction:", gErr.message);
      }
    }

    // Heuristic fallbacks if AI copy was not completely generated
    const isBotText = (t?: string): boolean => {
      if (!t) return false;
      const lower = t.toLowerCase();
      return (
        lower.includes("javascript is disabled") ||
        lower.includes("enable javascript") ||
        lower.includes("verify that you're not a robot") ||
        lower.includes("verify you are a human") ||
        lower.includes("robot or human") ||
        lower.includes("access denied") ||
        lower.includes("security check") ||
        lower.includes("captcha") ||
        lower.includes("this requires javascript")
      );
    };

    if (headlines.length < 3) {
      const candidates: string[] = [];
      if (analysis.title && !isBotText(analysis.title)) candidates.push(GoogleAdsBaseService.cleanAdText(analysis.title, 30));
      if (analysis.headings) {
        for (const h of analysis.headings) {
          const cleanedH = GoogleAdsBaseService.cleanAdText(h, 30);
          if (cleanedH && !candidates.includes(cleanedH) && !isBotText(cleanedH)) candidates.push(cleanedH);
        }
      }
      if (derivedBusinessName && !candidates.includes(derivedBusinessName)) {
        candidates.unshift(GoogleAdsBaseService.cleanAdText(derivedBusinessName, 30));
      }
      headlines = candidates.filter(h => !isBotText(h) && h.length > 0).slice(0, 5);
    }

    if (longHeadlines.length < 1) {
      if (analysis.description && analysis.description.length <= 90 && !isBotText(analysis.description)) {
        longHeadlines.push(GoogleAdsBaseService.cleanAdText(analysis.description, 90));
      } else if (analysis.title && !isBotText(analysis.title)) {
        longHeadlines.push(GoogleAdsBaseService.cleanAdText(analysis.title, 90));
      } else if (derivedBusinessName) {
        longHeadlines.push(GoogleAdsBaseService.cleanAdText(`Discover Top Deals and Authentic Products at ${derivedBusinessName}`, 90));
      }
    }

    if (descriptions.length < 2) {
      if (businessDescription && !isBotText(businessDescription)) {
        descriptions.push(GoogleAdsBaseService.cleanAdText(businessDescription, 90));
      } else if (analysis.description && !isBotText(analysis.description)) {
        descriptions.push(GoogleAdsBaseService.cleanAdText(analysis.description, 90));
      }
      if (analysis.mainTextSnippet) {
        const sentences = analysis.mainTextSnippet
          .split(/[.!?]+/)
          .map(s => GoogleAdsBaseService.cleanAdText(s, 90))
          .filter(s => s.length >= 20 && s.length <= 90 && !isBotText(s));
        for (const s of sentences) {
          if (!descriptions.includes(s) && descriptions.length < 4) {
            descriptions.push(s);
          }
        }
      }
    }
    if (descriptions.length === 0 && businessDescription && !isBotText(businessDescription)) {
      descriptions.push(GoogleAdsBaseService.cleanAdText(businessDescription, 90));
    }

    // Heuristic fallback for searchThemes from productsServices or keywords if empty
    if (searchThemes.length === 0) {
      if (productsServices.length > 0) {
        searchThemes = productsServices
          .map(p => GoogleAdsBaseService.cleanAdText(p, 80))
          .filter(p => p.length > 0);
      } else if (keywords.length > 0) {
        searchThemes = keywords
          .slice(0, 5)
          .map(k => GoogleAdsBaseService.cleanAdText(k, 80))
          .filter(k => k.length > 0);
      }
    }

    // Heuristic fallback for sitelinks if empty
    if (sitelinks.length === 0) {
      const cleanBaseUrl = url.trim().replace(/\/+$/, "");

      if (analysis.discoveredLinks && analysis.discoveredLinks.length >= 2) {
        sitelinks = analysis.discoveredLinks.slice(0, 4).map(dl => ({
          text: GoogleAdsBaseService.cleanAdText(dl.text, 25),
          desc1: GoogleAdsBaseService.cleanAdText(`Explore ${dl.text} on our site`, 35),
          desc2: GoogleAdsBaseService.cleanAdText("Fast, reliable & customer focused", 35),
          url: dl.url
        }));
      } else if (productsServices.length >= 2) {
        sitelinks = productsServices.slice(0, 4).map(p => {
          const slug = encodeURIComponent(p.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
          return {
            text: GoogleAdsBaseService.cleanAdText(p, 25),
            desc1: GoogleAdsBaseService.cleanAdText(`Explore top rated ${p}`, 35),
            desc2: GoogleAdsBaseService.cleanAdText(`Best quality & prices guaranteed`, 35),
            url: slug ? `${cleanBaseUrl}/${slug}` : cleanBaseUrl
          };
        });
      } else {
        sitelinks = [
          {
            text: "About Us",
            desc1: GoogleAdsBaseService.cleanAdText(`Learn more about ${derivedBusinessName || "our company"}`, 35),
            desc2: GoogleAdsBaseService.cleanAdText("Committed to customer excellence", 35),
            url: `${cleanBaseUrl}/about`
          },
          {
            text: "Contact Us",
            desc1: GoogleAdsBaseService.cleanAdText("Get in touch with our team today", 35),
            desc2: GoogleAdsBaseService.cleanAdText("Fast response and full support", 35),
            url: `${cleanBaseUrl}/contact`
          },
          {
            text: "Services & Products",
            desc1: GoogleAdsBaseService.cleanAdText("Browse our complete catalog", 35),
            desc2: GoogleAdsBaseService.cleanAdText("Quality service guaranteed", 35),
            url: `${cleanBaseUrl}/services`
          }
        ];
      }
    }

    // Clean and sanitize all returned items
    const sanitizedHeadlines = headlines
      .map(h => GoogleAdsBaseService.cleanAdText(h, 30))
      .filter(h => h.length > 0);
    const sanitizedLongHeadlines = longHeadlines
      .map(lh => GoogleAdsBaseService.cleanAdText(lh, 90))
      .filter(lh => lh.length > 0);
    const sanitizedDescriptions = descriptions
      .map(d => GoogleAdsBaseService.cleanAdText(d, 90))
      .filter(d => d.length > 0);
    const sanitizedSearchThemes = Array.from(new Set(searchThemes
      .map(st => GoogleAdsBaseService.cleanAdText(st, 80))
      .filter(st => st.length > 0 && !isBotText(st))
    )).slice(0, 25);

    // Ensure distinct URLs for each sitelink (Google Ads policy disallows duplicate final URLs across sitelinks)
    const cleanBaseUrl = url.trim().replace(/\/+$/, "");
    const usedUrls = new Set<string>();

    const sanitizedSitelinks = sitelinks
      .filter(s => s && s.text)
      .slice(0, 8)
      .map((s, idx) => {
        let sitelinkUrl = s.url ? (GoogleAdsBaseService.cleanUrl ? GoogleAdsBaseService.cleanUrl(s.url) : s.url) : cleanBaseUrl;

        // If url is the same as the base homepage or already used by another sitelink, synthesize a distinct subpage URL
        const normalized = sitelinkUrl.trim().replace(/\/+$/, "");
        if (normalized === cleanBaseUrl || usedUrls.has(normalized)) {
          const textSlug = s.text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          if (textSlug) {
            sitelinkUrl = `${cleanBaseUrl}/${textSlug}`;
          } else {
            sitelinkUrl = `${cleanBaseUrl}/page-${idx + 1}`;
          }
        }
        usedUrls.add(sitelinkUrl.trim().replace(/\/+$/, ""));

        return {
          text: GoogleAdsBaseService.cleanAdText(s.text, 25),
          desc1: s.desc1 ? GoogleAdsBaseService.cleanAdText(s.desc1, 35) : "",
          desc2: s.desc2 ? GoogleAdsBaseService.cleanAdText(s.desc2, 35) : "",
          url: sitelinkUrl
        };
      });

    const resultPayload = {
      ...analysis,
      derivedBusinessName: GoogleAdsBaseService.cleanAdText(derivedBusinessName, 25),
      industry,
      productsServices,
      description: GoogleAdsBaseService.cleanAdText(businessDescription, 150),
      usp: GoogleAdsBaseService.cleanAdText(usp, 90),
      targetAudience,
      locations: locations.length > 0 ? locations : [],
      language: language || "",
      headlines: sanitizedHeadlines,
      longHeadlines: sanitizedLongHeadlines,
      descriptions: sanitizedDescriptions,
      keywords,
      searchThemes: sanitizedSearchThemes,
      sitelinks: sanitizedSitelinks,
      callouts,
      structuredSnippets
    };

    urlAnalysisCache.set(normalizedKey, {
      timestamp: Date.now(),
      data: resultPayload
    });

    return res.status(200).json(resultPayload);
  } catch (error: any) {
    console.error(`[AI-GUIDED] analyze-url failure for ${url}:`, error.message);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/ads/ai-guided/upload-media
router.post("/upload-media", async (req, res) => {
  try {
    const { file, fileName, fieldType = "MARKETING_IMAGE" } = req.body;
    if (!file) {
      return res.status(400).json({ error: "File data (base64 or URL) is required" });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const name = fileName || `gads_asset_${Date.now()}.png`;

    if (privateKey) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", name);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/google_ads/ai_guided");
      formData.append("tags", `google_ads,upload,${String(fieldType).toLowerCase()}`);

      const authHeader = Buffer.from(`${privateKey}:`).toString("base64");
      const ikRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
        headers: {
          Authorization: `Basic ${authHeader}`
        }
      });

      return res.status(200).json({
        success: true,
        url: ikRes.data.url,
        name: ikRes.data.name || name,
        fileId: ikRes.data.fileId,
        thumbnailUrl: ikRes.data.thumbnailUrl || ikRes.data.url,
        width: ikRes.data.width,
        height: ikRes.data.height,
        fieldType
      });
    }

    if (typeof file === "string" && file.startsWith("http")) {
      return res.status(200).json({
        success: true,
        url: file,
        name,
        fieldType
      });
    }

    return res.status(400).json({
      error: "ImageKit configuration is required to upload local images."
    });
  } catch (error: any) {
    console.error("[AI Guided upload-media error]:", error?.response?.data || error.message);
    return res.status(500).json({
      error: error?.response?.data?.message || error.message || "Failed to upload media"
    });
  }
});

// GET /api/ads/ai-guided/media-library
router.get("/media-library", async (req, res) => {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(200).json({
        success: true,
        files: []
      });
    }

    const authHeader = Buffer.from(`${privateKey}:`).toString("base64");

    // Query files from ImageKit API (searches all files or specific google_ads folder)
    const ikRes = await axios.get("https://api.imagekit.io/v1/files", {
      headers: {
        Authorization: `Basic ${authHeader}`
      },
      params: {
        path: "/google_ads/ai_guided",
        limit: 100,
        sort: "DESC_CREATED"
      },
      timeout: 15000
    }).catch(async () => {
      // Fallback without path filter if folder is new
      return await axios.get("https://api.imagekit.io/v1/files", {
        headers: {
          Authorization: `Basic ${authHeader}`
        },
        params: {
          limit: 100,
          sort: "DESC_CREATED"
        },
        timeout: 15000
      });
    });

    const rawFiles = Array.isArray(ikRes.data) ? ikRes.data : [];

    const files = rawFiles.map((f: any) => {
      const width = f.width || 0;
      const height = f.height || 0;
      const ratio = height > 0 ? (width / height) : 1;

      let inferredFieldType: "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" | "LOGO" | "VIDEO" = "MARKETING_IMAGE";
      let inferredAspect = "1.91:1";

      const tags = Array.isArray(f.tags) ? f.tags : [];
      const nameLower = (f.name || "").toLowerCase();

      if (f.fileType === "video" || nameLower.endsWith(".mp4") || nameLower.endsWith(".webm") || tags.includes("video")) {
        inferredFieldType = "VIDEO";
        inferredAspect = "16:9";
      } else if (tags.includes("logo") || nameLower.includes("logo")) {
        inferredFieldType = "LOGO";
        inferredAspect = ratio >= 3.5 ? "4:1" : "1:1";
      } else if (ratio >= 0.9 && ratio <= 1.1) {
        inferredFieldType = "SQUARE_MARKETING_IMAGE";
        inferredAspect = "1:1";
      } else if (ratio >= 1.7 && ratio <= 2.1) {
        inferredFieldType = "MARKETING_IMAGE";
        inferredAspect = "1.91:1";
      } else if (ratio >= 0.75 && ratio <= 0.85) {
        inferredFieldType = "MARKETING_IMAGE";
        inferredAspect = "4:5";
      } else if (ratio >= 0.5 && ratio <= 0.65) {
        inferredFieldType = "MARKETING_IMAGE";
        inferredAspect = "9:16";
      }

      const isVideo = f.fileType === "video" || nameLower.endsWith(".mp4") || nameLower.endsWith(".webm") || tags.includes("video") || inferredFieldType === "VIDEO";
      const isLogo = tags.includes("logo") || nameLower.includes("logo") || inferredFieldType === "LOGO";
      const mediaType = isVideo ? "video" : isLogo ? "logo" : "image";

      return {
        id: f.fileId,
        name: f.name,
        url: f.url,
        thumbnailUrl: f.thumbnail || f.url,
        fileType: f.fileType || "image",
        type: mediaType,
        fieldType: inferredFieldType,
        aspectRatio: inferredAspect,
        dimensions: { width, height },
        size: f.size,
        createdAt: f.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      files
    });
  } catch (error: any) {
    console.error("[AI Guided media-library error]:", error?.response?.data || error.message);
    return res.status(200).json({
      success: true,
      files: []
    });
  }
});

// DELETE /api/ads/ai-guided/media-library/:fileId
router.delete("/media-library/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ success: false, error: "fileId is required" });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(400).json({ success: false, error: "IMAGEKIT_PRIVATE_KEY is not configured" });
    }

    const authHeader = Buffer.from(`${privateKey}:`).toString("base64");
    await axios.delete(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      headers: {
        Authorization: `Basic ${authHeader}`
      },
      timeout: 15000
    });

    return res.status(200).json({
      success: true,
      message: "File deleted successfully from ImageKit"
    });
  } catch (error: any) {
    console.error("[AI Guided delete media error]:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to delete file from ImageKit"
    });
  }
});

// POST /api/ads/ai-guided/chat
router.post("/chat", async (req, res) => {
  try {
    const { messages = [], campaignState = {}, customerId: bodyCid, customerProfile: bodyProfile } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;
    const cidParam = (bodyCid || campaignState?.customerId || req.query.customerId || "") as string;
    const cleanCid = cidParam ? cidParam.replace(/-/g, "").trim() : "";

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    let resolvedProfile = bodyProfile || campaignState?.customerProfile || null;
    // If not provided in request body but we have orgId and cleanCid, resolve with customer ownership isolation
    if (!resolvedProfile && cleanCid && orgId) {
      const isOwned = await validateCustomerOwnership(orgId, cleanCid);
      if (isOwned) {
        const rawProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
        if (rawProfile) {
          const activeProducts = Array.isArray(rawProfile.products)
            ? rawProfile.products.filter((p: any) => typeof p === "string" || p.isActive !== false)
            : [];
          const activeServices = Array.isArray(rawProfile.services)
            ? rawProfile.services.filter((s: any) => typeof s === "string" || s.isActive !== false)
            : [];
          const activeTargetAudiences = Array.isArray(rawProfile.targetAudiences)
            ? rawProfile.targetAudiences.filter((a: any) => a.isActive !== false)
            : [];
          const activeCustomerPersonas = Array.isArray(rawProfile.customerPersonas)
            ? rawProfile.customerPersonas.filter((p: any) => p.isActive !== false)
            : [];
          const activeLocationRecords = Array.isArray(rawProfile.locationRecords)
            ? rawProfile.locationRecords.filter((l: any) => l.isActive !== false)
            : [];
          const activeConversionGoals = Array.isArray(rawProfile.conversionGoals)
            ? rawProfile.conversionGoals.filter((g: any) => g.isActive !== false)
            : [];
          const activeCompetitors = Array.isArray(rawProfile.competitors)
            ? rawProfile.competitors.filter((c: any) => c.isActive !== false)
            : [];
          const activeSeoKeywords = Array.isArray(rawProfile.seoKeywords)
            ? rawProfile.seoKeywords.filter((k: any) => k.isActive !== false)
            : [];
          const activeNegativeKeywords = Array.isArray(rawProfile.negativeKeywords)
            ? rawProfile.negativeKeywords.filter((nk: any) => nk.isActive !== false)
            : [];
          const activeFaqs = Array.isArray(rawProfile.faqs)
            ? rawProfile.faqs.filter((f: any) => f.isActive !== false)
            : [];

          resolvedProfile = {
            isApproved: Boolean(rawProfile.isApproved),
            approvedAt: rawProfile.approvedAt || null,
            businessName: rawProfile.businessName || "",
            legalBusinessName: rawProfile.legalBusinessName || "",
            industry: rawProfile.industry || "",
            businessCategory: rawProfile.businessCategory || "",
            businessDescription: rawProfile.businessDescription || "",
            customerType: rawProfile.customerType || "",
            businessModel: rawProfile.businessModel || "",
            businessEmail: rawProfile.businessEmail || "",
            businessPhone: rawProfile.businessPhone || "",
            whatsappNumber: rawProfile.whatsappNumber || "",
            businessAddress: rawProfile.businessAddress || "",
            serviceAreas: rawProfile.serviceAreas || [],
            languagesServed: rawProfile.languagesServed || [],
            primaryWebsite: rawProfile.primaryWebsite || "",
            additionalWebsites: rawProfile.additionalWebsites || [],
            products: activeProducts,
            services: activeServices,
            targetAudience: rawProfile.targetAudience || "",
            targetAudiences: activeTargetAudiences,
            customerPersonas: activeCustomerPersonas,
            locations: Array.isArray(rawProfile.locations) ? rawProfile.locations : [],
            locationRecords: activeLocationRecords,
            conversionGoals: activeConversionGoals,
            brandProfile: rawProfile.brandProfile || null,
            competitors: activeCompetitors,
            seoKeywords: activeSeoKeywords,
            negativeKeywords: activeNegativeKeywords,
            faqs: activeFaqs,
            keyOfferings: rawProfile.keyOfferings || [],
            hasMerchantAccount: Boolean(rawProfile.hasMerchantAccount),
            merchantCenterId: rawProfile.merchantCenterId || "",
            merchantDetails: rawProfile.merchantDetails || null,
            hasAppAccount: Boolean(rawProfile.hasAppAccount),
            appDetails: rawProfile.appDetails || []
          };
        }
      }
    }

    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";

    // If user message is requesting AI image or logo generation, call image generation pipeline
    if (GoogleAdsImageGenService.isImageGenRequest(lastUserMsg)) {
      console.log(`[AI-GUIDED] Image generation intent detected for: "${lastUserMsg.slice(0, 80)}..."`);
      const imgGenResponse = await GoogleAdsImageGenService.generateAdImages(lastUserMsg, campaignState);
      return res.status(200).json({
        message: imgGenResponse.message,
        suggestions: ["Add More Images", "Generate Logo", "Use Recommended Settings", "Show Required Assets"],
        campaignState: imgGenResponse.campaignState,
        generatedImages: imgGenResponse.generatedImages,
        missingFields: GoogleAdsAiAssistantService.computeMissingFields(imgGenResponse.campaignState),
        validationErrors: GoogleAdsCampaignValidator.validate(imgGenResponse.campaignState).errors,
        readyForReview: Boolean(imgGenResponse.campaignState.businessName || imgGenResponse.campaignState.website),
        readyForPublish: GoogleAdsCampaignValidator.validate(imgGenResponse.campaignState).isValid,
        stage: imgGenResponse.campaignState.stage || "collecting_assets"
      });
    }

    // Normal Google Ads text and campaign strategic advisory via Groq
    const aiResponse = await GoogleAdsAiAssistantService.processChat(messages, campaignState, resolvedProfile);
    return res.status(200).json(aiResponse);
  } catch (error: any) {
    console.error("[AI Guided Route Error]:", error?.message || error);
    return res.status(500).json({
      error: "Failed to process AI chat message.",
      details: error.message
    });
  }
});

import * as crypto from "crypto";

interface IdempotencyRecord {
  status: "IN_PROGRESS" | "SUCCESS" | "FAILED";
  organizationId?: string;
  customerId?: string;
  requestHash?: string;
  result?: any;
  message?: string;
  error?: any;
  timestamp: number;
}

// In-memory idempotency cache (TTL: 15 minutes) with collision protection
const idempotencyCache = new Map<string, IdempotencyRecord>();

// Periodic cleanup of expired idempotency keys (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of idempotencyCache.entries()) {
    if (now - record.timestamp > 15 * 60 * 1000) {
      idempotencyCache.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

// POST /api/ads/ai-guided/preflight — Preflight validation for CampaignPlan before user confirmation
router.post("/preflight", async (req, res) => {
  try {
    const { customerId, campaignState } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    let resolvedCid = await resolveEffectiveCustomerId(orgId, customerId || campaignState?.customerId);

    if (!resolvedCid) {
      return res.status(400).json({
        error: "Google Ads Customer ID is required. Please connect a Google Ads account in Settings or specify a customerId.",
        code: "MISSING_CUSTOMER_ID"
      });
    }

    if (!orgId) {
      return res.status(400).json({
        error: "Organization ID is required.",
        code: "MISSING_ORG_ID"
      });
    }

    const cleanCid = resolvedCid.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        error: "Access denied. Customer ID does not belong to this organization.",
        code: "CUSTOMER_ACCESS_DENIED"
      });
    }

    const plan: CampaignPlan = CampaignPlanMapper.fromState(orgId, cleanCid, campaignState || {});
    const preflight = await CampaignPlanValidator.validate(orgId, cleanCid, plan);
    plan.preflightChecks = preflight;

    return res.status(200).json({
      success: preflight.passed,
      preflight,
      plan
    });
  } catch (error: any) {
    console.error("[AI Guided Preflight Error]:", error?.message || error);
    return res.status(500).json({
      error: "Failed to perform campaign preflight validation.",
      details: error.message
    });
  }
});

// Cache for keyword intelligence (TTL: 10 minutes)
const keywordIntelligenceCache = new Map<string, { data: any; timestamp: number }>();

// POST /api/ads/ai-guided/keyword-intelligence — Grounded Google Ads keyword intelligence
router.post("/keyword-intelligence", async (req, res) => {
  try {
    const {
      customerId,
      campaignType = "SEARCH",
      queryKeywords = [],
      url,
      businessName,
      productsServices = [],
      locations = [],
      language
    } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    // Check cache: orgId + customerId + campaignType + seed queries
    const cacheKey = `${orgId}:${cleanCid}:${campaignType}:${(queryKeywords || []).sort().join(",")}:${url || ""}`;
    const cached = keywordIntelligenceCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    const result = await GoogleAdsKeywordIntelligenceService.gatherIntelligence(
      orgId,
      cleanCid,
      campaignType,
      {
        queryKeywords,
        url,
        businessName,
        productsServices,
        locations,
        language
      }
    );

    keywordIntelligenceCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error("[AI Guided Keyword Intelligence Error]:", error?.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve Google Ads keyword intelligence."
    });
  }
});

// Cache for audience intelligence (TTL: 10 minutes)
const audienceIntelligenceCache = new Map<string, { data: any; timestamp: number }>();

// POST /api/ads/ai-guided/audience-intelligence — Grounded Google Ads audience signals
router.post("/audience-intelligence", async (req, res) => {
  try {
    const { customerId, campaignType = "PERFORMANCE_MAX" } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    const cacheKey = `${orgId}:${cleanCid}:${campaignType}`;
    const cached = audienceIntelligenceCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    const result = await GoogleAdsAudienceIntelligenceService.gatherIntelligence(
      orgId,
      cleanCid,
      campaignType
    );

    audienceIntelligenceCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error("[AI Guided Audience Intelligence Error]:", error?.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve Google Ads audience intelligence."
    });
  }
});

// Cache for performance planner forecasts (TTL: 10 minutes)
const performanceForecastCache = new Map<string, { data: any; timestamp: number }>();

// POST /api/ads/ai-guided/performance-forecast — Grounded Google Ads Performance Planner forecast
router.post("/performance-forecast", async (req, res) => {
  try {
    const {
      customerId,
      campaignType = "SEARCH",
      dailyBudget,
      startDate,
      endDate,
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      targetCpa,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      keywords = []
    } = req.body;

    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    // Campaign Type Guardrail: only Search is supported for keyword forecasting
    if (campaignType && campaignType.toUpperCase() !== "SEARCH") {
      return res.status(200).json({
        success: true,
        status: "UNSUPPORTED",
        dailyBudget: Number(dailyBudget) || 0,
        warnings: [
          `Google Ads Performance Planner keyword forecasting is only supported for Search campaigns. "${campaignType}" campaigns allocate budget across dynamic multi-channel placements.`
        ],
        notice: `Performance Planner forecast is not available for ${campaignType}. You can proceed with your desired budget.`
      });
    }

    // Budget guardrail
    const budgetNum = Number(dailyBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      return res.status(200).json({
        success: true,
        status: "INVALID_CONFIGURATION",
        warnings: ["A positive daily budget is required to generate a forecast."],
        notice: "Please specify a positive daily budget to calculate forecast."
      });
    }

    // Approved keywords guardrail
    const approvedKeywords = (Array.isArray(keywords) ? keywords : [])
      .map(k => (typeof k === "string" ? k.trim() : ""))
      .filter(k => k.length > 0);

    if (approvedKeywords.length === 0) {
      return res.status(200).json({
        success: true,
        status: "INVALID_CONFIGURATION",
        dailyBudget: budgetNum,
        warnings: ["At least one approved Search keyword is required to generate a forecast."],
        notice: "Select or approve Search keywords to calculate estimated traffic and cost."
      });
    }

    // Cache key scoped to org + customer + budget + dates + sorted keywords
    const keywordsKey = [...approvedKeywords].sort().join("|");
    const cacheKey = `${orgId}:${cleanCid}:${budgetNum}:${startDate || "def"}:${endDate || "def"}:${biddingStrategy}:${keywordsKey}`;
    const cached = performanceForecastCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    // Fetch profile context to note context used (locations, languages, goals)
    let savedProfile: any = null;
    try {
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    } catch (_profErr) { }

    const forecastResult = await GoogleAdsPerformancePlannerService.generateForecastForPlan(
      orgId,
      cleanCid,
      {
        campaignType,
        dailyBudget: budgetNum,
        startDate,
        endDate,
        biddingStrategy,
        targetCpa: targetCpa ? Number(targetCpa) : undefined,
        targetRoas: targetRoas ? Number(targetRoas) : undefined,
        locations: Array.isArray(locations) ? locations : [locations],
        languages: Array.isArray(languages) ? languages : [languages],
        keywords: approvedKeywords
      }
    );

    const enrichedForecastResult = {
      ...forecastResult,
      profileContext: {
        businessName: savedProfile?.businessName || undefined,
        industry: savedProfile?.businessCategory || savedProfile?.industry || undefined,
        conversionGoals: savedProfile?.conversionGoals || []
      },
      authoritativeSource: "Google Ads Performance Planner (Live Forecast)"
    };

    performanceForecastCache.set(cacheKey, {
      data: enrichedForecastResult,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      ...enrichedForecastResult
    });
  } catch (error: any) {
    console.error("[AI Guided Performance Forecast Error]:", error?.message || error);
    return res.status(200).json({
      success: true,
      status: "UNAVAILABLE",
      warnings: [error.message || "Failed to retrieve Google Ads performance forecast."],
      notice: "Google Ads forecast is currently unavailable. You can continue with the selected budget."
    });
  }
});

// Cache for recommendations insights (TTL: 10 minutes)
const recommendationsInsightsCache = new Map<string, { data: any; timestamp: number }>();

// Helper to format clean human-readable title and description from recommendation type
function formatRecommendationMeta(recType: string, recDetails: any) {
  switch (recType) {
    case "CAMPAIGN_BUDGET":
      return {
        title: "Adjust Campaign Budget",
        description: "Google Ads recommends optimizing daily budget based on auction demand to avoid losing impressions during peak hours."
      };
    case "KEYWORD":
      return {
        title: "Add High-Relevance Search Keywords",
        description: "Google Ads identified high-performing keywords searched by prospective customers that match your offerings."
      };
    case "RESPONSIVE_SEARCH_AD":
    case "TEXT_AD":
      return {
        title: "Improve Ad Copy Strength",
        description: "Add diverse headlines and compelling descriptions to enable Google machine learning to deliver top-performing combinations."
      };
    case "TARGET_CPA_OPT_IN":
      return {
        title: "Opt into Target CPA Bidding",
        description: "Set a target cost-per-acquisition to get more conversions within your target budget efficiency."
      };
    case "MAXIMIZE_CONVERSIONS_OPT_IN":
      return {
        title: "Adopt Maximize Conversions Bidding",
        description: "Allow smart bidding to automatically adjust real-time bids for every search auction to drive the highest conversion volume."
      };
    case "MAXIMIZE_CLICKS_OPT_IN":
      return {
        title: "Adopt Maximize Clicks Bidding",
        description: "Optimize bidding to attract the highest volume of qualified traffic within your daily budget."
      };
    case "USE_BROAD_MATCH_KEYWORD":
      return {
        title: "Upgrade to Smart Bidding with Broad Match",
        description: "Use broad match keywords alongside automated smart bidding to capture high-intent related customer searches."
      };
    case "SITELINK_ASSET":
      return {
        title: "Add Sitelink Extensions",
        description: "Include prominent deep-links to popular pages on your site to enhance ad click-through rate and prominence."
      };
    case "CALLOUT_ASSET":
      return {
        title: "Add Callout Highlights",
        description: "Highlight special offers, free delivery, 24/7 support, or core value propositions directly in search results."
      };
    case "CALL_ASSET":
      return {
        title: "Add Phone Call Asset",
        description: "Allow prospective customers to tap-to-call your business directly from mobile search ads."
      };
    case "SEARCH_PARTNERS_OPT_IN":
      return {
        title: "Expand to Google Search Partners",
        description: "Extend reach by showing ads on hundreds of non-Google search websites and YouTube search."
      };
    case "DISPLAY_EXPANSION_OPT_IN":
      return {
        title: "Enable Display Network Expansion",
        description: "Use remaining Search campaign budget to capture extra conversions across relevant Display network websites."
      };
    case "OPTIMIZE_AD_ROTATION":
      return {
        title: "Optimize Ad Rotation",
        description: "Display your highest performing ads more frequently in auctions to maximize overall conversions."
      };
    default:
      return {
        title: recType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
        description: "Google Ads recommended optimization to improve campaign delivery and efficiency."
      };
  }
}

// POST /api/ads/ai-guided/recommendations — Grounded Google Ads Recommendations & Insights
router.post("/recommendations", async (req, res) => {
  try {
    const { customerId, campaignType = "SEARCH", campaignId } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    const cacheKey = `${orgId}:${cleanCid}:${campaignType || "ALL"}:${campaignId || "ALL"}`;
    const cached = recommendationsInsightsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    // Fetch profile context to enrich recommendation relevance explanations
    let savedProfile: any = null;
    try {
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    } catch (_profErr) { }

    const bizName = savedProfile?.businessName || "";
    const bizCategory = savedProfile?.businessCategory || savedProfile?.industry || "";
    const bizGoals = Array.isArray(savedProfile?.conversionGoals) ? savedProfile.conversionGoals.join(", ") : "";

    // Call EXISTING GoogleAdsService.listRecommendations() directly (no internal HTTP calls)
    const rawRecommendations = await GoogleAdsService.listRecommendations(orgId, cleanCid);

    // Convert raw Google Ads recommendation rows into compact, advisory RecommendationInsight objects
    const compactRecommendations = (Array.isArray(rawRecommendations) ? rawRecommendations : [])
      .filter((r: any) => {
        if (!r) return false;
        // If specific campaign requested, filter to it; otherwise include all account recommendations
        if (campaignId && r.campaignId && String(r.campaignId) !== String(campaignId)) {
          return false;
        }
        return true;
      })
      .slice(0, 15) // Limit top 15 recommendations to keep response concise
      .map((r: any) => {
        const meta = formatRecommendationMeta(r.type, r.details);
        let profileReasoning: string | undefined = undefined;
        if (bizCategory || bizGoals) {
          if (r.type === "KEYWORD") {
            profileReasoning = `Aligns with your ${bizCategory || "business"} profile offerings and search demand.`;
          } else if (r.type === "MAXIMIZE_CONVERSIONS_OPT_IN" || r.type === "TARGET_CPA_OPT_IN") {
            profileReasoning = bizGoals ? `Optimizes bidding toward your target profile conversion goals (${bizGoals}).` : undefined;
          } else if (r.type === "SITELINK_ASSET" || r.type === "CALLOUT_ASSET") {
            profileReasoning = bizName ? `Enhances presence for ${bizName} with rich navigational highlights.` : undefined;
          }
        }

        return {
          id: String(r.id || `rec-${Math.random().toString(36).substring(7)}`),
          type: String(r.type || "UNKNOWN"),
          title: meta.title,
          description: meta.description,
          profileReasoning,
          source: "GOOGLE_ADS" as const,
          impact: r.impact ? {
            hasImpact: Boolean(r.impact.hasImpact),
            deltaClicks: r.impact.deltaClicks !== undefined ? Math.round(r.impact.deltaClicks) : undefined,
            deltaCost: r.impact.deltaCost !== undefined ? Number(Number(r.impact.deltaCost).toFixed(2)) : undefined,
            deltaConversions: r.impact.deltaConversions !== undefined ? Number(Number(r.impact.deltaConversions).toFixed(1)) : undefined
          } : undefined,
          campaignId: r.campaignId ? String(r.campaignId) : undefined,
          campaignName: r.campaignName ? String(r.campaignName) : undefined,
          resourceName: r.resourceName ? String(r.resourceName) : undefined,
          recommendationType: String(r.type || "UNKNOWN"),
          recommended: true,
          approved: false // Never automatically approved; user must explicitly select
        };
      });

    const responsePayload = {
      status: compactRecommendations.length > 0 ? "SUCCESS" : "NO_RECOMMENDATIONS",
      recommendationsCount: compactRecommendations.length,
      recommendations: compactRecommendations,
      profileContextUsed: Boolean(bizName || bizCategory || bizGoals),
      notice: compactRecommendations.length > 0
        ? "Official Google Ads Recommendations are advisory. Review recommendations before applying them to your CampaignPlan."
        : "No active Google Ads recommendations found for this account. You can proceed with campaign creation."
    };

    recommendationsInsightsCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      ...responsePayload
    });
  } catch (error: any) {
    console.warn("[AI Guided Recommendations Error]:", error?.message || error);
    return res.status(200).json({
      success: true,
      status: "UNAVAILABLE",
      recommendationsCount: 0,
      recommendations: [],
      warnings: [error.message || "Failed to retrieve Google Ads recommendations."],
      notice: "Google Ads recommendations are currently unavailable. You can continue with campaign creation."
    });
  }
});

// Cache for extensions & assets insights (TTL: 10 minutes)
const extensionsAssetsCache = new Map<string, { data: any; timestamp: number }>();

// POST /api/ads/ai-guided/extensions-assets — Grounded Google Ads Extensions & Assets
router.post("/extensions-assets", async (req, res) => {
  try {
    const { customerId, campaignType = "SEARCH", campaignId } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    const cacheKey = `${orgId}:${cleanCid}:${campaignType || "ALL"}:${campaignId || "ALL"}`;
    const cached = extensionsAssetsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    const cType = (campaignType || "SEARCH").toUpperCase();
    const items: Array<{
      id: string;
      type: string;
      name: string;
      description: string;
      source: "GOOGLE_ADS" | "PROFILE";
      campaignId?: string;
      campaignName?: string;
      resourceName?: string;
      fileUrl?: string;
      aspectRatio?: string;
      status?: string;
      recommended: boolean;
      approved: boolean;
    }> = [];

    // Fetch customer-scoped business profile to integrate verified media assets and brand context
    let savedProfile: any = null;
    try {
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    } catch (profErr: any) {
      console.warn("[aiGuidedRoutes.extensions-assets] getProfile notice:", profErr.message);
    }

    // 0. PROFILE MEDIA ASSETS & CREATIVE CONTEXT INTEGRATION (Campaign-Type Filtered)
    if (savedProfile) {
      const activeMedia: any[] = Array.isArray(savedProfile.mediaAssets)
        ? savedProfile.mediaAssets.filter((m: any) => m.status !== "INACTIVE" && m.legalRightsConfirmed && m.fileUrl)
        : [];
      const brandLogoUrl = savedProfile.brandProfile?.logoUrl || "";
      const rawYoutube: any[] = Array.isArray(savedProfile.youtubeLinks)
        ? savedProfile.youtubeLinks.filter((y: any) => typeof y === "string" && y.trim().length > 0)
        : [];

      // A. PERFORMANCE_MAX: Requires landscape images (1.91:1), square images (1:1), logos, and supports YouTube video
      if (cType === "PERFORMANCE_MAX") {
        for (const m of activeMedia) {
          const isLandscape = m.subtype === "IMAGE_LANDSCAPE" || m.aspectRatio === "1.91:1";
          const isSquare = m.subtype === "IMAGE_SQUARE" || m.aspectRatio === "1:1";
          const isLogo = m.type === "LOGO" || m.subtype === "LOGO_SQUARE" || m.subtype === "LOGO_LANDSCAPE";
          const isVideo = m.type === "VIDEO";

          if (isLandscape || isSquare || isLogo || isVideo) {
            const assetType = isLogo ? "LOGO" : (isVideo ? "YOUTUBE_VIDEO" : (isSquare ? "SQUARE_MARKETING_IMAGE" : "MARKETING_IMAGE"));
            items.push({
              id: `prof-${m.id || m.fileName || items.length}`,
              type: assetType,
              name: `Profile Asset: ${m.fileName || assetType}`,
              description: `Approved profile media (${m.aspectRatio || (isLogo ? "Logo" : "Creative")}) ready for Asset Group.`,
              source: "PROFILE",
              fileUrl: m.fileUrl,
              aspectRatio: m.aspectRatio,
              status: "ACTIVE",
              recommended: true,
              approved: false
            });
          }
        }

        // Add brand profile logo if not already present
        if (brandLogoUrl && !items.some(it => it.fileUrl === brandLogoUrl)) {
          items.push({
            id: `prof-brand-logo`,
            type: "LOGO",
            name: `Brand Profile Logo: ${savedProfile.brandProfile?.brandName || "Logo"}`,
            description: "Primary brand logo configured in Customer Business Profile.",
            source: "PROFILE",
            fileUrl: brandLogoUrl,
            aspectRatio: "1:1",
            status: "ACTIVE",
            recommended: true,
            approved: false
          });
        }

        // Add YouTube video links from profile
        for (const yt of rawYoutube) {
          const ytUrl = typeof yt === "string" ? yt : yt.url || yt.videoUrl;
          if (ytUrl && !items.some(it => it.fileUrl === ytUrl)) {
            items.push({
              id: `prof-yt-${items.length}`,
              type: "YOUTUBE_VIDEO",
              name: `Profile Video: YouTube Link`,
              description: `YouTube video link configured in Business Profile: ${ytUrl}`,
              source: "PROFILE",
              fileUrl: ytUrl,
              aspectRatio: "16:9",
              status: "ACTIVE",
              recommended: true,
              approved: false
            });
          }
        }
      }

      // B. DISPLAY: Image assets and logos only (no video required; no extension-only items)
      else if (cType === "DISPLAY") {
        for (const m of activeMedia) {
          if (m.type === "IMAGE" || m.type === "LOGO") {
            const isLogo = m.type === "LOGO" || m.subtype === "LOGO_SQUARE";
            const assetType = isLogo ? "LOGO" : "MARKETING_IMAGE";
            items.push({
              id: `prof-${m.id || m.fileName || items.length}`,
              type: assetType,
              name: `Profile Asset: ${m.fileName || assetType}`,
              description: `Approved profile ${isLogo ? "logo" : "creative"} (${m.aspectRatio || "Image"}).`,
              source: "PROFILE",
              fileUrl: m.fileUrl,
              aspectRatio: m.aspectRatio,
              status: "ACTIVE",
              recommended: true,
              approved: false
            });
          }
        }

        if (brandLogoUrl && !items.some(it => it.fileUrl === brandLogoUrl)) {
          items.push({
            id: `prof-brand-logo`,
            type: "LOGO",
            name: `Brand Profile Logo: ${savedProfile.brandProfile?.brandName || "Logo"}`,
            description: "Primary brand logo configured in Customer Business Profile.",
            source: "PROFILE",
            fileUrl: brandLogoUrl,
            aspectRatio: "1:1",
            status: "ACTIVE",
            recommended: true,
            approved: false
          });
        }
      }

      // C. DEMAND_GEN: High-impact image & YouTube video assets
      else if (cType === "DEMAND_GEN") {
        for (const m of activeMedia) {
          if (m.type === "IMAGE" || m.type === "VIDEO" || m.type === "LOGO") {
            const isLogo = m.type === "LOGO";
            const isVideo = m.type === "VIDEO";
            const assetType = isLogo ? "LOGO" : (isVideo ? "YOUTUBE_VIDEO" : "MARKETING_IMAGE");
            items.push({
              id: `prof-${m.id || m.fileName || items.length}`,
              type: assetType,
              name: `Profile Asset: ${m.fileName || assetType}`,
              description: `Approved profile ${isVideo ? "video" : (isLogo ? "logo" : "image")} asset (${m.aspectRatio || "Media"}).`,
              source: "PROFILE",
              fileUrl: m.fileUrl,
              aspectRatio: m.aspectRatio,
              status: "ACTIVE",
              recommended: true,
              approved: false
            });
          }
        }

        if (brandLogoUrl && !items.some(it => it.fileUrl === brandLogoUrl)) {
          items.push({
            id: `prof-brand-logo`,
            type: "LOGO",
            name: `Brand Profile Logo: ${savedProfile.brandProfile?.brandName || "Logo"}`,
            description: "Primary brand logo configured in Customer Business Profile.",
            source: "PROFILE",
            fileUrl: brandLogoUrl,
            aspectRatio: "1:1",
            status: "ACTIVE",
            recommended: true,
            approved: false
          });
        }

        for (const yt of rawYoutube) {
          const ytUrl = typeof yt === "string" ? yt : yt.url || yt.videoUrl;
          if (ytUrl && !items.some(it => it.fileUrl === ytUrl)) {
            items.push({
              id: `prof-yt-${items.length}`,
              type: "YOUTUBE_VIDEO",
              name: `Profile Video: YouTube Link`,
              description: `YouTube video link configured in Business Profile: ${ytUrl}`,
              source: "PROFILE",
              fileUrl: ytUrl,
              aspectRatio: "16:9",
              status: "ACTIVE",
              recommended: true,
              approved: false
            });
          }
        }
      }

      // D. VIDEO: YouTube links and profile video assets only (Do NOT inject images or text extensions)
      else if (cType === "VIDEO") {
        for (const m of activeMedia) {
          if (m.type === "VIDEO") {
            items.push({
              id: `prof-vid-${m.id || m.fileName || items.length}`,
              type: "YOUTUBE_VIDEO",
              name: `Profile Video: ${m.fileName || "Video Asset"}`,
              description: `Profile video (${m.aspectRatio || "16:9"}, ${m.durationSeconds ? `${m.durationSeconds}s` : "valid duration"}).`,
              source: "PROFILE",
              fileUrl: m.fileUrl,
              aspectRatio: m.aspectRatio || "16:9",
              status: "ACTIVE",
              recommended: true,
              approved: false
            });
          }
        }

        for (const yt of rawYoutube) {
          const ytUrl = typeof yt === "string" ? yt : yt.url || yt.videoUrl;
          if (ytUrl && !items.some(it => it.fileUrl === ytUrl)) {
            items.push({
              id: `prof-yt-${items.length}`,
              type: "YOUTUBE_VIDEO",
              name: `YouTube Link: ${ytUrl}`,
              description: `Verified YouTube video link from Business Profile.`,
              source: "PROFILE",
              fileUrl: ytUrl,
              aspectRatio: "16:9",
              status: "ACTIVE",
              recommended: true,
              approved: false
            });
          }
        }
      }

      // E. SEARCH: Sitelinks, Callouts, Structured Snippets from profile web/brand/service context
      // (Do NOT inject image or video assets into SEARCH)
      else if (cType === "SEARCH" || cType === "LEADS" || cType === "WEBSITE_TRAFFIC" || cType === "SALES") {
        // Derive advisory Sitelinks from additionalWebsites or subPages
        if (Array.isArray(savedProfile.additionalWebsites)) {
          for (const web of savedProfile.additionalWebsites) {
            if (web.url && web.title) {
              items.push({
                id: `prof-site-${items.length}`,
                type: "SITELINK",
                name: `Profile Sitelink: "${web.title.slice(0, 25)}"`,
                description: web.description ? web.description.slice(0, 35) : `Link to ${web.url}`,
                source: "PROFILE",
                fileUrl: web.url,
                status: "ACTIVE",
                recommended: true,
                approved: false
              });
            }
          }
        }

        // Derive advisory Callouts from brand USPs
        if (Array.isArray(savedProfile.brandProfile?.brandUsps)) {
          for (const uspText of savedProfile.brandProfile.brandUsps.slice(0, 4)) {
            if (uspText && typeof uspText === "string") {
              items.push({
                id: `prof-callout-${items.length}`,
                type: "CALLOUT",
                name: `Profile Callout: "${uspText.slice(0, 25)}"`,
                description: "Key business highlight derived from verified Brand USPs.",
                source: "PROFILE",
                status: "ACTIVE",
                recommended: true,
                approved: false
              });
            }
          }
        }
      }
    }

    // 1. For SEARCH and compatible types: fetch Sitelinks, Callouts, Call Assets, Structured Snippets, Promotions, Lead Forms
    if (cType === "SEARCH" || cType === "LEADS" || cType === "WEBSITE_TRAFFIC" || cType === "SALES") {
      // Sitelinks, Callouts, Call Assets via existing GoogleAdsService.listExtensions
      try {
        const rawExtensions = await GoogleAdsService.listExtensions(orgId, cleanCid);
        for (const ext of rawExtensions || []) {
          const typeStr = ext.fieldType || ext.assetType || "EXTENSION";
          let name = ext.assetName || "Account Extension";
          let desc = "Existing account extension in Google Ads.";

          if (ext.sitelink) {
            name = ext.sitelink.linkText ? `Sitelink: "${ext.sitelink.linkText}"` : name;
            desc = ext.sitelink.description1 ? `${ext.sitelink.description1}` : "Deep-link to relevant page on your website.";
          } else if (ext.callout) {
            name = `Callout: "${ext.callout}"`;
            desc = "Special offer or key business highlight shown in search ads.";
          } else if (ext.call) {
            name = `Call Asset: ${ext.call.phoneNumber}`;
            desc = "Click-to-call phone number for direct customer calls.";
          }

          items.push({
            id: String(ext.assetId || ext.assetResourceName || `ext-${items.length}`),
            type: ext.sitelink ? "SITELINK" : (ext.callout ? "CALLOUT" : (ext.call ? "CALL_ASSET" : typeStr)),
            name,
            description: desc,
            source: "GOOGLE_ADS",
            campaignId: ext.campaignResourceName ? ext.campaignResourceName.split("/").pop() : undefined,
            resourceName: ext.assetResourceName,
            status: ext.status || "ENABLED",
            recommended: true,
            approved: false
          });
        }
      } catch (extErr: any) {
        console.warn("[aiGuidedRoutes.extensions-assets] listExtensions notice:", extErr.message);
      }

      // Structured Snippets via existing GoogleAdsAssetTypesService.listStructuredSnippets
      try {
        const snippets = await GoogleAdsAssetTypesService.listStructuredSnippets(orgId, cleanCid);
        for (const snip of snippets || []) {
          items.push({
            id: String(snip.id || snip.resourceName),
            type: "STRUCTURED_SNIPPET",
            name: `Snippet: ${snip.header}`,
            description: `Values: ${(snip.values || []).join(", ")}`,
            source: "GOOGLE_ADS",
            campaignId: snip.campaigns?.[0]?.campaignId,
            campaignName: snip.campaigns?.[0]?.campaignName,
            resourceName: snip.resourceName,
            status: snip.policyApprovalStatus || "ENABLED",
            recommended: true,
            approved: false
          });
        }
      } catch (snipErr: any) {
        console.warn("[aiGuidedRoutes.extensions-assets] listStructuredSnippets notice:", snipErr.message);
      }

      // Promotions via existing GoogleAdsAssetTypesService.listPromotions
      try {
        const promos = await GoogleAdsAssetTypesService.listPromotions(orgId, cleanCid);
        for (const p of promos || []) {
          items.push({
            id: String(p.id || p.resourceName),
            type: "PROMOTION",
            name: `Promotion: ${p.promotionTarget || p.name}`,
            description: p.discountText ? `Discount: ${p.discountText}` : "Promotional offer active on account.",
            source: "GOOGLE_ADS",
            campaignId: p.campaigns?.[0]?.campaignId,
            campaignName: p.campaigns?.[0]?.campaignName,
            resourceName: p.resourceName,
            status: p.policyApprovalStatus || "ENABLED",
            recommended: true,
            approved: false
          });
        }
      } catch (promoErr: any) {
        console.warn("[aiGuidedRoutes.extensions-assets] listPromotions notice:", promoErr.message);
      }

      // Lead Forms via existing GoogleAdsAssetTypesService.listLeadForms
      try {
        const leadForms = await GoogleAdsAssetTypesService.listLeadForms(orgId, cleanCid);
        for (const lf of leadForms || []) {
          items.push({
            id: String(lf.id || lf.resourceName),
            type: "LEAD_FORM",
            name: `Lead Form: ${lf.headline || lf.businessName}`,
            description: lf.description || "In-ad lead capture form for inquiries and quotes.",
            source: "GOOGLE_ADS",
            resourceName: lf.resourceName,
            status: "ENABLED",
            recommended: true,
            approved: false
          });
        }
      } catch (lfErr: any) {
        console.warn("[aiGuidedRoutes.extensions-assets] listLeadForms notice:", lfErr.message);
      }
    }

    // 2. For PERFORMANCE_MAX: fetch Asset Groups via existing GoogleAdsAssetGroupService.listAssetGroups
    if (cType === "PERFORMANCE_MAX") {
      try {
        const agRes = await GoogleAdsAssetGroupService.listAssetGroups(orgId, cleanCid, campaignId);
        for (const ag of agRes.assetGroups || []) {
          items.push({
            id: String(ag.id || ag.resourceName),
            type: "ASSET_GROUP",
            name: `Asset Group: ${ag.name}`,
            description: `Configured PMax creative package with ${ag.finalUrls?.[0] || "custom destination"}.`,
            source: "GOOGLE_ADS",
            campaignId: ag.campaignId,
            campaignName: ag.campaignName,
            resourceName: ag.resourceName,
            status: ag.status || "ENABLED",
            recommended: true,
            approved: false
          });
        }
      } catch (agErr: any) {
        console.warn("[aiGuidedRoutes.extensions-assets] listAssetGroups notice:", agErr.message);
      }
    }

    // Limit to top 20 items to keep payload compact
    const compactItems = items.slice(0, 20);

    const status = compactItems.length > 0 ? "SUCCESS" : "NO_ASSETS";
    const responsePayload = {
      success: true,
      status,
      itemsCount: compactItems.length,
      items: compactItems,
      notice: compactItems.length > 0
        ? "Existing account assets and extensions retrieved. Review and select items to include in your CampaignPlan."
        : "No existing reusable extensions or assets found for this campaign type. AI Guided will create new assets based on your inputs."
    };

    extensionsAssetsCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now()
    });

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.warn("[AI Guided Extensions & Assets Error]:", error?.message || error);
    return res.status(200).json({
      success: true,
      status: "UNAVAILABLE",
      itemsCount: 0,
      items: [],
      warnings: [error.message || "Failed to retrieve Google Ads assets and extensions."],
      notice: "Google Ads extensions and assets are currently unavailable. You can continue with campaign creation."
    });
  }
});

// Cache for shopping intelligence (TTL: 10 minutes)
const shoppingIntelCache = new Map<string, { data: any; timestamp: number }>();

// POST /api/ads/ai-guided/shopping-intelligence — Live Google Merchant Center Validation & Product Feed Intelligence
router.post("/shopping-intelligence", async (req, res) => {
  try {
    const { customerId, campaignType = "SHOPPING" } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    // Strict Campaign-Type Isolation: SHOPPING and PERFORMANCE_MAX only
    const cType = (campaignType || "SHOPPING").toUpperCase();
    if (cType !== "SHOPPING" && cType !== "PERFORMANCE_MAX") {
      return res.status(200).json({
        success: true,
        supported: false,
        status: "UNSUPPORTED_CAMPAIGN_TYPE",
        notice: `Merchant Center intelligence is isolated to SHOPPING and PERFORMANCE_MAX retail campaigns. Campaign type "${cType}" does not use retail product feeds.`,
        profileMerchantCenterId: null,
        liveConnected: false,
        liveMerchantId: null,
        summary: {
          totalProducts: 0,
          approved: 0,
          disapproved: 0,
          expiring: 0,
          pending: 0
        },
        profileProductsCount: 0,
        sampleProducts: []
      });
    }

    const cacheKey = `${orgId}:${cleanCid}:${cType}`;
    const cached = shoppingIntelCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    // 1. Fetch Profile context safely (CustomerBusinessProfile is advisory context only)
    let savedProfile: any = null;
    try {
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    } catch (profErr: any) {
      console.warn("[shopping-intelligence] getProfile notice:", profErr.message);
    }

    const profileMerchantId = savedProfile?.merchantCenterId
      ? String(savedProfile.merchantCenterId).trim()
      : null;

    const profileProducts: any[] = Array.isArray(savedProfile?.products)
      ? savedProfile.products
      : [];

    const profileMerchantDetails = savedProfile?.merchantDetails || null;

    // 2. Query Live Authoritative Merchant Center status via GoogleAdsShoppingService
    // Existing live validation remains authoritative: do not substitute profile products for feed items
    let liveDiagnostics: any = null;
    try {
      liveDiagnostics = await GoogleAdsShoppingService.listProductDiagnostics(orgId, cleanCid, {
        merchantId: profileMerchantId || undefined,
        limit: 10
      });
    } catch (liveErr: any) {
      console.warn("[shopping-intelligence] listProductDiagnostics notice:", liveErr.message);
      liveDiagnostics = {
        connected: false,
        merchantId: null,
        items: [],
        total: 0,
        summary: {
          totalProducts: 0,
          approved: 0,
          disapproved: 0,
          expiring: 0,
          pending: 0
        },
        notice: `Live Merchant Center query encountered an issue: ${liveErr.message}`
      };
    }

    const isConnected = Boolean(liveDiagnostics?.connected && liveDiagnostics?.merchantId);
    const liveMerchantId = liveDiagnostics?.merchantId || null;

    let status = "CONNECTED";
    let notice = "Google Merchant Center account is linked and live product feed diagnostics are available.";

    if (!profileMerchantId && !liveMerchantId) {
      status = "NOT_CONFIGURED";
      notice = "No Google Merchant Center account is configured or linked. Link a Merchant Center account in Settings or Profile before launching Shopping campaigns.";
    } else if (profileMerchantId && !isConnected) {
      status = "PROFILE_UNVERIFIED";
      notice = `Profile has Merchant Center ID (${profileMerchantId}), but live Google Ads / Shopping Content API linkage is unverified or awaiting approval. Live Merchant Center validation is authoritative.`;
    }

    // Profile products are provided strictly as advisory business context
    const sampleProfileProducts = profileProducts.slice(0, 5).map((p: any) => ({
      name: p.name || p.title || "Product",
      price: p.price || p.regularPrice || undefined,
      category: p.category || undefined,
      isContextualOnly: true
    }));

    const responsePayload = {
      supported: true,
      status,
      liveConnected: isConnected,
      liveMerchantId,
      profileMerchantCenterId: profileMerchantId,
      profileMerchantDetails,
      summary: liveDiagnostics?.summary || {
        totalProducts: 0,
        approved: 0,
        disapproved: 0,
        expiring: 0,
        pending: 0
      },
      liveProductCount: liveDiagnostics?.total || 0,
      liveIssuesCount: (liveDiagnostics?.summary?.disapproved || 0) + (liveDiagnostics?.summary?.expiring || 0),
      profileProductsCount: profileProducts.length,
      sampleProfileProducts,
      notice,
      authoritativeSource: "Google Merchant Center Content API (Live)"
    };

    shoppingIntelCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      ...responsePayload
    });
  } catch (error: any) {
    console.warn("[AI Guided Shopping Intelligence Error]:", error?.message || error);
    return res.status(200).json({
      success: true,
      supported: true,
      status: "UNAVAILABLE",
      liveConnected: false,
      liveMerchantId: null,
      profileMerchantCenterId: null,
      summary: {
        totalProducts: 0,
        approved: 0,
        disapproved: 0,
        expiring: 0,
        pending: 0
      },
      profileProductsCount: 0,
      sampleProfileProducts: [],
      notice: "Merchant Center intelligence is temporarily unavailable. Live validation remains required prior to Shopping campaign creation."
    });
  }
});

// Cache for app intelligence (TTL: 10 minutes)
const appIntelCache = new Map<string, { data: any; timestamp: number }>();

// POST /api/ads/ai-guided/app-intelligence — Live App Lookup & Profile App Promotion Intelligence
router.post("/app-intelligence", async (req, res) => {
  try {
    const { customerId, campaignType = "APP" } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    // Strict Campaign-Type Isolation: APP campaigns only
    const cType = (campaignType || "APP").toUpperCase();
    if (cType !== "APP") {
      return res.status(200).json({
        success: true,
        supported: false,
        status: "UNSUPPORTED_CAMPAIGN_TYPE",
        notice: `App intelligence is isolated to APP promotion campaigns. Campaign type "${cType}" does not use mobile app packages or store configurations.`,
        profileApps: [],
        primaryApp: null,
        liveAssets: []
      });
    }

    const cacheKey = `${orgId}:${cleanCid}`;
    const cached = appIntelCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    // 1. Fetch Profile appDetails context
    let savedProfile: any = null;
    try {
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    } catch (profErr: any) {
      console.warn("[app-intelligence] getProfile notice:", profErr.message);
    }

    const profileApps: Array<{
      id: string;
      platform: "ANDROID" | "IOS";
      appId: string;
      appName?: string;
      appUrl?: string;
      source: "PROFILE";
    }> = [];

    if (Array.isArray(savedProfile?.appDetails)) {
      for (const app of savedProfile.appDetails) {
        if (app.appId && typeof app.appId === "string" && app.appId.trim()) {
          const rawId = app.appId.trim();
          const isIos = app.platform === "IOS" || /^\d+$/.test(rawId);
          const platform = isIos ? "IOS" : "ANDROID";
          profileApps.push({
            id: app.id || `prof-app-${profileApps.length}`,
            platform,
            appId: rawId,
            appName: app.appName || rawId,
            appUrl: app.appUrl || (platform === "IOS"
              ? `https://apps.apple.com/app/id${rawId}`
              : `https://play.google.com/store/apps/details?id=${rawId}`),
            source: "PROFILE"
          });
        }
      }
    }

    // 2. Query Live Google Ads App Assets (Authoritative)
    const liveAssets: Array<{
      id: string;
      platform: "ANDROID" | "IOS";
      appId: string;
      appName: string;
      appUrl: string;
      source: "GOOGLE_ADS";
    }> = [];

    try {
      const config = await prisma.googleBusinessConfig.findFirst({
        where: { organizationId: orgId }
      });

      if (config?.googleRefreshToken) {
        const { headers } = await GoogleAdsBaseService.getAdsHeaders(orgId, cleanCid);
        const query = `
          SELECT
            asset.id,
            asset.name,
            asset.type,
            asset.app_asset.app_id,
            asset.app_asset.app_store
          FROM asset
          WHERE asset.type = 'MOBILE_APP'
          LIMIT 20
        `;
        const adsBase = "https://googleads.googleapis.com/v24";
        const gaqlRes = await axios.post(`${adsBase}/customers/${cleanCid}/googleAds:search`, { query }, { headers });
        const results = gaqlRes.data?.results || [];

        for (const row of results) {
          const a = row.asset;
          const aId = a?.appAsset?.appId;
          if (aId) {
            const store = a?.appAsset?.appStore;
            const isIos = store === "APPLE_APP_STORE" || /^\d+$/.test(String(aId));
            const platform = isIos ? "IOS" : "ANDROID";
            liveAssets.push({
              id: `live-asset-${a.id}`,
              platform,
              appId: String(aId),
              appName: a.name || `Mobile App (${aId})`,
              appUrl: platform === "IOS"
                ? `https://apps.apple.com/app/id${aId}`
                : `https://play.google.com/store/apps/details?id=${aId}`,
              source: "GOOGLE_ADS"
            });
          }
        }
      }
    } catch (liveErr: any) {
      console.warn("[app-intelligence] Live GAQL app assets query notice:", liveErr.message);
    }

    // Determine primary app recommendation
    const primaryApp = profileApps[0] || liveAssets[0] || null;

    let status = "CONFIGURED";
    let notice = "App configuration verified. Review platform and package identifier before generating CampaignPlan.";

    if (!primaryApp) {
      status = "NOT_CONFIGURED";
      notice = "App details not configured. Provide an Android Package Name (e.g. com.example.app) or iOS App Store ID in your business profile or prompt to configure App Promotion.";
    }

    const responsePayload = {
      supported: true,
      status,
      primaryApp,
      profileApps,
      liveAssets,
      totalAppsAvailable: profileApps.length + liveAssets.length,
      notice,
      authoritativeSource: "Google Play Store / Apple App Store & Google Ads API"
    };

    appIntelCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      ...responsePayload
    });
  } catch (error: any) {
    console.warn("[AI Guided App Intelligence Error]:", error?.message || error);
    return res.status(200).json({
      success: true,
      supported: true,
      status: "UNAVAILABLE",
      primaryApp: null,
      profileApps: [],
      liveAssets: [],
      totalAppsAvailable: 0,
      notice: "App intelligence is currently unavailable. You can continue configuring your App campaign manually."
    });
  }
});

// Cache for conversion goal intelligence (TTL: 10 minutes)
const conversionGoalIntelCache = new Map<string, { data: any; timestamp: number }>();

// POST /api/ads/ai-guided/conversion-goal-intelligence — Profile Intent vs Live Google Ads Conversion Action Comparison
router.post("/conversion-goal-intelligence", async (req, res) => {
  try {
    const { customerId, campaignType = "SEARCH", objective = "LEADS" } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter)."
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Google Ads Customer ID is required."
      });
    }

    const cleanCid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to this organization."
      });
    }

    const cType = (campaignType || "SEARCH").toUpperCase();
    const obj = (objective || "LEADS").toUpperCase();

    const cacheKey = `${orgId}:${cleanCid}:${cType}:${obj}`;
    const cached = conversionGoalIntelCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        ...cached.data,
        isCached: true
      });
    }

    // 1. Fetch Profile Conversion Goals context (Customer Intent / Context only)
    let savedProfile: any = null;
    try {
      savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
    } catch (profErr: any) {
      console.warn("[conversion-goal-intelligence] getProfile notice:", profErr.message);
    }

    const rawProfileGoals: string[] = Array.isArray(savedProfile?.conversionGoals)
      ? savedProfile.conversionGoals.filter((g: any) => typeof g === "string" && g.trim().length > 0)
      : [];

    // 2. Query Live Authoritative Google Ads Conversion Actions via existing GoogleAdsService.listConversions
    let liveConversions: any[] = [];
    let liveError: string | null = null;
    try {
      liveConversions = await GoogleAdsService.listConversions(orgId, cleanCid);
    } catch (err: any) {
      console.warn("[conversion-goal-intelligence] listConversions notice:", err.message);
      liveError = err.message;
    }

    const activeLiveConversions = liveConversions.filter(
      (c: any) => c.status === "ENABLED" || c.status === "HIDDEN" || c.status === "PAUSED"
    );

    // 3. Helper to determine objective compatibility
    const isGoalCompatibleWithObjective = (goalText: string, actionCategory: string, campObj: string, campType: string) => {
      const g = (goalText || "").toLowerCase();
      const cat = (actionCategory || "").toLowerCase();

      if (campObj.includes("SALE") || campType === "SHOPPING") {
        return g.includes("purchase") || g.includes("sale") || g.includes("checkout") || g.includes("cart") ||
          cat.includes("purchase") || cat.includes("ecommerce");
      }
      if (campObj.includes("LEAD")) {
        return g.includes("lead") || g.includes("form") || g.includes("contact") || g.includes("call") || g.includes("quote") || g.includes("inquiry") ||
          cat.includes("lead") || cat.includes("submit_lead_form") || cat.includes("phone_call_lead") || cat.includes("contact");
      }
      if (campObj.includes("APP") || campType === "APP") {
        return g.includes("install") || g.includes("download") || g.includes("app") ||
          cat.includes("download") || cat.includes("mobile_app");
      }
      if (campObj.includes("STORE") || campObj.includes("LOCAL")) {
        return g.includes("direction") || g.includes("store") || g.includes("visit") || g.includes("location") ||
          cat.includes("store_visit") || cat.includes("store_sale");
      }
      if (campObj.includes("TRAFFIC") || campObj.includes("AWARENESS") || campObj.includes("YOUTUBE")) {
        return true; // Broader compatibility
      }
      return true;
    };

    // 4. Detailed comparison: Profile Goal vs Live Conversion Action
    // Matches if live conversion name or category contains/matches profile goal tokens
    const matchedItems: any[] = [];
    const profileOnlyItems: any[] = [];
    const matchedLiveActionIds = new Set<string>();

    for (const pGoal of rawProfileGoals) {
      const cleanP = pGoal.toLowerCase().replace(/[^a-z0-9]/g, "");
      const foundLive = activeLiveConversions.find((live: any) => {
        const liveNameClean = (live.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const liveCatClean = (live.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          liveNameClean.includes(cleanP) ||
          cleanP.includes(liveNameClean) ||
          liveCatClean.includes(cleanP) ||
          cleanP.includes(liveCatClean)
        );
      });

      const isCompatible = isGoalCompatibleWithObjective(pGoal, foundLive?.category || "", obj, cType);

      if (foundLive) {
        matchedLiveActionIds.add(foundLive.id);
        matchedItems.push({
          goal: pGoal,
          classification: "MATCHED",
          status: "VERIFIED",
          liveActionId: foundLive.id,
          liveActionName: foundLive.name,
          liveCategory: foundLive.category,
          liveStatus: foundLive.status,
          isCompatibleWithObjective: isCompatible,
          explanation: `Profile intent matches live Google Ads conversion action "${foundLive.name}" (${foundLive.category}).`
        });
      } else {
        profileOnlyItems.push({
          goal: pGoal,
          classification: "PROFILE_ONLY",
          status: "UNVERIFIED",
          isCompatibleWithObjective: isCompatible,
          explanation: "Profile customer intent configured, but no corresponding active Google Ads conversion action was found. Profile goals remain advisory and will NOT trigger conversion bidding without a live conversion action."
        });
      }
    }

    // Identify Live-only conversion actions
    const liveOnlyItems: any[] = [];
    for (const live of activeLiveConversions) {
      if (!matchedLiveActionIds.has(live.id)) {
        const isCompatible = isGoalCompatibleWithObjective(live.name, live.category || "", obj, cType);
        liveOnlyItems.push({
          goal: live.name,
          classification: "LIVE_ONLY",
          status: "LIVE_ACTION",
          liveActionId: live.id,
          liveActionName: live.name,
          liveCategory: live.category,
          liveStatus: live.status,
          conversionsLast30Days: live.conversions || 0,
          isCompatibleWithObjective: isCompatible,
          explanation: `Active Google Ads conversion action (${live.category}) detected on account.`
        });
      }
    }

    const allItems = [...matchedItems, ...profileOnlyItems, ...liveOnlyItems];

    const responsePayload = {
      status: liveError ? "LIVE_ERROR" : (allItems.length > 0 ? "SUCCESS" : "NO_GOALS"),
      summary: {
        totalGoalsEvaluated: allItems.length,
        matchedCount: matchedItems.length,
        profileOnlyCount: profileOnlyItems.length,
        liveOnlyCount: liveOnlyItems.length,
        liveConversionActionsCount: activeLiveConversions.length
      },
      items: allItems,
      campaignContext: {
        campaignType: cType,
        objective: obj
      },
      notice: matchedItems.length > 0
        ? "Live conversion actions verified against profile intent. Only verified live actions are used for Smart Bidding."
        : profileOnlyItems.length > 0
          ? "Profile conversion goals are customer context. Live conversion actions must be configured in Google Ads for conversion optimization."
          : "No conversion goals or actions detected. Standard click or conversion bidding will apply based on campaign configuration.",
      authoritativeSource: "Google Ads conversion_action API (Live)"
    };

    conversionGoalIntelCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      ...responsePayload
    });
  } catch (error: any) {
    console.warn("[AI Guided Conversion Goal Intelligence Error]:", error?.message || error);
    return res.status(200).json({
      success: true,
      status: "UNAVAILABLE",
      summary: {
        totalGoalsEvaluated: 0,
        matchedCount: 0,
        profileOnlyCount: 0,
        liveOnlyCount: 0,
        liveConversionActionsCount: 0
      },
      items: [],
      campaignContext: {
        campaignType: (req.body?.campaignType || "SEARCH").toUpperCase(),
        objective: (req.body?.objective || "LEADS").toUpperCase()
      },
      notice: "Conversion goal intelligence is temporarily unavailable. Live conversion actions remain required for conversion tracking."
    });
  }
});

// POST /api/ads/ai-guided/save-profile — Explicit AI Guided → Profile Save-Back
router.post("/save-profile", async (req, res) => {
  try {
    const { customerId, approvedChanges } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!customerId || !/^\d{3}-?\d{3}-?\d{4}$|^\d{10}$/.test(String(customerId).trim())) {
      return res.status(400).json({
        success: false,
        error: "A valid 10-digit Google Ads Customer ID is required.",
        code: "INVALID_CUSTOMER_ID"
      });
    }

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter).",
        code: "MISSING_ORG_ID"
      });
    }

    const cleanCid = String(customerId).replace(/-/g, "").trim();

    // 1. Strict customer ownership validation
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Customer ID does not belong to your organization.",
        code: "CUSTOMER_ACCESS_DENIED"
      });
    }

    if (!approvedChanges || typeof approvedChanges !== "object") {
      return res.status(400).json({
        success: false,
        error: "approvedChanges object is required.",
        code: "INVALID_CHANGES_PAYLOAD"
      });
    }

    // 2. Fetch current profile from CustomerBusinessProfileService
    const existingProfile: any = (await CustomerBusinessProfileService.getProfile(orgId, cleanCid)) || {};

    // 3. Perform safe merge and deduplication
    // Never persist temporary campaign config (campaignName, dailyBudget, biddingStrategy, etc.)
    const summaryItems: string[] = [];

    // Business info scalar fields
    let updatedBusinessName = existingProfile.businessName || "";
    if (approvedChanges.businessName && typeof approvedChanges.businessName === "string" && approvedChanges.businessName.trim()) {
      if (approvedChanges.businessName.trim() !== updatedBusinessName) {
        updatedBusinessName = approvedChanges.businessName.trim();
        summaryItems.push("Business Name: Updated");
      }
    }

    let updatedLegalName = existingProfile.legalBusinessName || "";
    if (approvedChanges.legalBusinessName && typeof approvedChanges.legalBusinessName === "string" && approvedChanges.legalBusinessName.trim()) {
      updatedLegalName = approvedChanges.legalBusinessName.trim();
    }

    let updatedCategory = existingProfile.businessCategory || "";
    if (approvedChanges.businessCategory && typeof approvedChanges.businessCategory === "string" && approvedChanges.businessCategory.trim()) {
      updatedCategory = approvedChanges.businessCategory.trim();
    }

    let updatedIndustry = existingProfile.industry || "";
    if (approvedChanges.industry && typeof approvedChanges.industry === "string" && approvedChanges.industry.trim()) {
      updatedIndustry = approvedChanges.industry.trim();
    }

    let updatedDescription = existingProfile.businessDescription || "";
    if (approvedChanges.businessDescription && typeof approvedChanges.businessDescription === "string" && approvedChanges.businessDescription.trim()) {
      if (approvedChanges.businessDescription.trim() !== updatedDescription) {
        updatedDescription = approvedChanges.businessDescription.trim();
        summaryItems.push("Business Description: Updated");
      }
    }

    let updatedPrimaryWebsite = existingProfile.primaryWebsite || "";
    if (approvedChanges.primaryWebsite && typeof approvedChanges.primaryWebsite === "string" && approvedChanges.primaryWebsite.trim()) {
      if (approvedChanges.primaryWebsite.trim() !== updatedPrimaryWebsite) {
        updatedPrimaryWebsite = approvedChanges.primaryWebsite.trim();
        summaryItems.push("Website: Updated");
      }
    }

    // Additional websites merge
    const existingWebsites: any[] = Array.isArray(existingProfile.additionalWebsites) ? [...existingProfile.additionalWebsites] : [];
    let addedWebsitesCount = 0;
    if (Array.isArray(approvedChanges.additionalWebsites)) {
      for (const w of approvedChanges.additionalWebsites) {
        const urlStr = typeof w === "string" ? w.trim() : (w?.url || "").trim();
        if (urlStr && !existingWebsites.some((ew: any) => (typeof ew === "string" ? ew : ew?.url)?.toLowerCase() === urlStr.toLowerCase())) {
          existingWebsites.push(typeof w === "string" ? { url: urlStr } : w);
          addedWebsitesCount++;
        }
      }
    }
    if (addedWebsitesCount > 0) {
      summaryItems.push(`Websites: +${addedWebsitesCount}`);
    }

    // Products merge
    const existingProducts: any[] = Array.isArray(existingProfile.products) ? [...existingProfile.products] : [];
    let addedProductsCount = 0;
    if (Array.isArray(approvedChanges.products)) {
      for (const p of approvedChanges.products) {
        const pName = (typeof p === "string" ? p : p?.name || "").trim();
        if (pName && !existingProducts.some((ep: any) => (typeof ep === "string" ? ep : ep?.name || "").toLowerCase() === pName.toLowerCase())) {
          existingProducts.push(
            typeof p === "string"
              ? { id: `prod-${Date.now()}-${addedProductsCount}`, name: pName, isActive: true }
              : { ...p, id: p.id || `prod-${Date.now()}-${addedProductsCount}`, name: pName, isActive: true }
          );
          addedProductsCount++;
        }
      }
    }
    if (addedProductsCount > 0) {
      summaryItems.push(`Products: +${addedProductsCount}`);
    }

    // Services merge
    const existingServices: any[] = Array.isArray(existingProfile.services) ? [...existingProfile.services] : [];
    let addedServicesCount = 0;
    if (Array.isArray(approvedChanges.services)) {
      for (const s of approvedChanges.services) {
        const sName = (typeof s === "string" ? s : s?.name || "").trim();
        if (sName && !existingServices.some((es: any) => (typeof es === "string" ? es : es?.name || "").toLowerCase() === sName.toLowerCase())) {
          existingServices.push(
            typeof s === "string"
              ? { id: `serv-${Date.now()}-${addedServicesCount}`, name: sName, isActive: true }
              : { ...s, id: s.id || `serv-${Date.now()}-${addedServicesCount}`, name: sName, isActive: true }
          );
          addedServicesCount++;
        }
      }
    }
    if (addedServicesCount > 0) {
      summaryItems.push(`Services: +${addedServicesCount}`);
    }

    // Locations merge
    const existingLocations: string[] = Array.isArray(existingProfile.locations) ? [...existingProfile.locations] : [];
    let addedLocationsCount = 0;
    if (Array.isArray(approvedChanges.locations)) {
      for (const loc of approvedChanges.locations) {
        const locStr = String(loc || "").trim();
        if (locStr && !existingLocations.some((el: string) => el.toLowerCase() === locStr.toLowerCase())) {
          existingLocations.push(locStr);
          addedLocationsCount++;
        }
      }
    }
    if (addedLocationsCount > 0) {
      summaryItems.push(`Locations: +${addedLocationsCount}`);
    }

    // Languages served merge
    const existingLanguages: string[] = Array.isArray(existingProfile.languagesServed) ? [...existingProfile.languagesServed] : [];
    if (Array.isArray(approvedChanges.languagesServed)) {
      for (const lang of approvedChanges.languagesServed) {
        const langStr = String(lang || "").trim();
        if (langStr && !existingLanguages.some((el: string) => el.toLowerCase() === langStr.toLowerCase())) {
          existingLanguages.push(langStr);
        }
      }
    } else if (typeof approvedChanges.language === "string" && approvedChanges.language.trim()) {
      const langStr = approvedChanges.language.trim();
      if (!existingLanguages.some((el: string) => el.toLowerCase() === langStr.toLowerCase())) {
        existingLanguages.push(langStr);
      }
    }

    // SEO / Target Keywords merge
    const existingKeywords: any[] = Array.isArray(existingProfile.seoKeywords) ? [...existingProfile.seoKeywords] : [];
    let addedKeywordsCount = 0;
    if (Array.isArray(approvedChanges.seoKeywords)) {
      for (const kw of approvedChanges.seoKeywords) {
        const kwText = (typeof kw === "string" ? kw : kw?.keyword || "").trim();
        if (kwText && !existingKeywords.some((ek: any) => (typeof ek === "string" ? ek : ek?.keyword || "").toLowerCase() === kwText.toLowerCase())) {
          existingKeywords.push(
            typeof kw === "string"
              ? { id: `kw-${Date.now()}-${addedKeywordsCount}`, keyword: kwText, keywordType: "Primary", isActive: true }
              : { ...kw, id: kw.id || `kw-${Date.now()}-${addedKeywordsCount}`, keyword: kwText, isActive: true }
          );
          addedKeywordsCount++;
        }
      }
    }
    if (addedKeywordsCount > 0) {
      summaryItems.push(`Keywords: +${addedKeywordsCount}`);
    }

    // Negative Keywords merge
    const existingNegativeKeywords: any[] = Array.isArray(existingProfile.negativeKeywords) ? [...existingProfile.negativeKeywords] : [];
    let addedNegativeKeywordsCount = 0;
    if (Array.isArray(approvedChanges.negativeKeywords)) {
      for (const nkw of approvedChanges.negativeKeywords) {
        const nkwText = (typeof nkw === "string" ? nkw : nkw?.keyword || "").trim();
        if (nkwText && !existingNegativeKeywords.some((en: any) => (typeof en === "string" ? en : en?.keyword || "").toLowerCase() === nkwText.toLowerCase())) {
          existingNegativeKeywords.push(
            typeof nkw === "string"
              ? { id: `nkw-${Date.now()}-${addedNegativeKeywordsCount}`, keyword: nkwText, matchType: "Phrase", isActive: true }
              : { ...nkw, id: nkw.id || `nkw-${Date.now()}-${addedNegativeKeywordsCount}`, keyword: nkwText, isActive: true }
          );
          addedNegativeKeywordsCount++;
        }
      }
    }
    if (addedNegativeKeywordsCount > 0) {
      summaryItems.push(`Negative Keywords: +${addedNegativeKeywordsCount}`);
    }

    // Conversion Goals merge
    const existingGoals: any[] = Array.isArray(existingProfile.conversionGoals) ? [...existingProfile.conversionGoals] : [];
    let addedGoalsCount = 0;
    if (Array.isArray(approvedChanges.conversionGoals)) {
      for (const cg of approvedChanges.conversionGoals) {
        const gName = (typeof cg === "string" ? cg : cg?.goalName || cg?.name || "").trim();
        if (gName && !existingGoals.some((eg: any) => (typeof eg === "string" ? eg : eg?.goalName || eg?.name || "").toLowerCase() === gName.toLowerCase())) {
          existingGoals.push(
            typeof cg === "string"
              ? {
                id: `cg-${Date.now()}-${addedGoalsCount}`,
                goalName: gName,
                conversionType: "Lead Form",
                source: "Website",
                isPrimary: true,
                isActive: true
              }
              : {
                ...cg,
                id: cg.id || `cg-${Date.now()}-${addedGoalsCount}`,
                goalName: gName,
                conversionType: cg.conversionType || "Lead Form",
                source: cg.source || "Website",
                isPrimary: cg.isPrimary !== undefined ? Boolean(cg.isPrimary) : true,
                isActive: true
              }
          );
          addedGoalsCount++;
        }
      }
    }
    if (addedGoalsCount > 0) {
      summaryItems.push(`Conversion Goals: +${addedGoalsCount}`);
    }

    // Target Audiences & Personas merge
    const existingAudiences: any[] = Array.isArray(existingProfile.targetAudiences) ? [...existingProfile.targetAudiences] : [];
    let addedAudiencesCount = 0;
    if (Array.isArray(approvedChanges.targetAudiences)) {
      for (const aud of approvedChanges.targetAudiences) {
        const aName = (typeof aud === "string" ? aud : aud?.name || "").trim();
        if (aName && !existingAudiences.some((ea: any) => (typeof ea === "string" ? ea : ea?.name || "").toLowerCase() === aName.toLowerCase())) {
          existingAudiences.push(
            typeof aud === "string"
              ? { id: `aud-${Date.now()}-${addedAudiencesCount}`, name: aName, isActive: true }
              : { ...aud, id: aud.id || `aud-${Date.now()}-${addedAudiencesCount}`, name: aName, isActive: true }
          );
          addedAudiencesCount++;
        }
      }
    }
    if (addedAudiencesCount > 0) {
      summaryItems.push(`Target Audiences: +${addedAudiencesCount}`);
    }

    // Retail & Merchant Center ID
    let hasMerchantAccount = existingProfile.hasMerchantAccount ?? false;
    let merchantCenterId = existingProfile.merchantCenterId || null;
    if (approvedChanges.merchantCenterId && typeof approvedChanges.merchantCenterId === "string" && approvedChanges.merchantCenterId.trim()) {
      const cleanMid = approvedChanges.merchantCenterId.trim();
      if (cleanMid !== merchantCenterId) {
        merchantCenterId = cleanMid;
        hasMerchantAccount = true;
        summaryItems.push("Merchant Center ID: Updated");
      }
    }

    // App Details
    const existingAppDetails: any[] = Array.isArray(existingProfile.appDetails) ? [...existingProfile.appDetails] : [];
    let hasAppAccount = existingProfile.hasAppAccount ?? false;
    if (approvedChanges.appDetails && Array.isArray(approvedChanges.appDetails)) {
      for (const app of approvedChanges.appDetails) {
        if (app && app.appId && !existingAppDetails.some((ea: any) => ea.appId === app.appId)) {
          existingAppDetails.push(app);
          hasAppAccount = true;
          summaryItems.push("App Details: Added");
        }
      }
    } else if (approvedChanges.appId && typeof approvedChanges.appId === "string" && approvedChanges.appId.trim()) {
      const appIdStr = approvedChanges.appId.trim();
      if (!existingAppDetails.some((ea: any) => ea.appId === appIdStr)) {
        existingAppDetails.push({
          id: `app-${Date.now()}`,
          platform: approvedChanges.appStore === "APPLE_APP_STORE" ? "IOS" : "ANDROID",
          appId: appIdStr,
          appName: approvedChanges.appName || undefined
        });
        hasAppAccount = true;
        summaryItems.push("App Details: Added");
      }
    }

    // YouTube links
    const existingYoutubeLinks: string[] = Array.isArray(existingProfile.youtubeLinks) ? [...existingProfile.youtubeLinks] : [];
    let addedYtCount = 0;
    if (Array.isArray(approvedChanges.youtubeLinks)) {
      for (const yt of approvedChanges.youtubeLinks) {
        const ytUrl = String(yt || "").trim();
        if (ytUrl && !existingYoutubeLinks.some((ey: string) => ey.toLowerCase() === ytUrl.toLowerCase())) {
          existingYoutubeLinks.push(ytUrl);
          addedYtCount++;
        }
      }
    }
    if (addedYtCount > 0) {
      summaryItems.push(`YouTube Links: +${addedYtCount}`);
    }

    // Brand Profile merge
    const mergedBrandProfile = {
      ...(existingProfile.brandProfile || {}),
      ...(approvedChanges.brandProfile || {})
    };

    // 4. Construct payload for CustomerBusinessProfileService.saveProfile
    const profilePayload: any = {
      businessName: updatedBusinessName,
      legalBusinessName: updatedLegalName,
      businessCategory: updatedCategory,
      industry: updatedIndustry,
      businessDescription: updatedDescription,
      primaryWebsite: updatedPrimaryWebsite,
      additionalWebsites: existingWebsites,
      products: existingProducts,
      services: existingServices,
      locations: existingLocations,
      languagesServed: existingLanguages,
      hasMerchantAccount,
      merchantCenterId,
      merchantDetails: existingProfile.merchantDetails || null,
      hasAppAccount,
      appDetails: existingAppDetails,
      metadata: {
        ...(existingProfile.metadata || {}),
        targetAudiences: existingAudiences,
        customerPersonas: existingProfile.customerPersonas || [],
        locationRecords: existingProfile.locationRecords || [],
        conversionGoals: existingGoals,
        brandProfile: Object.keys(mergedBrandProfile).length > 0 ? mergedBrandProfile : null,
        competitors: existingProfile.competitors || [],
        seoKeywords: existingKeywords,
        negativeKeywords: existingNegativeKeywords,
        faqs: existingProfile.faqs || [],
        mediaAssets: existingProfile.mediaAssets || [],
        youtubeLinks: existingYoutubeLinks
      }
    };

    // Save profile with existing approval status preserved
    const saved = await CustomerBusinessProfileService.saveProfile(
      orgId,
      cleanCid,
      profilePayload,
      Boolean(existingProfile.isApproved)
    );

    // Fetch refreshed complete profile
    const refreshedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);

    return res.status(200).json({
      success: true,
      message: summaryItems.length > 0
        ? `Successfully saved to Business Profile: ${summaryItems.join(", ")}`
        : "Business Profile synchronized successfully.",
      summary: summaryItems,
      changesCount: summaryItems.length,
      customerProfile: refreshedProfile
    });
  } catch (error: any) {
    console.error("[Save to Business Profile Error]:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to save profile changes. Please try again.",
      code: "PROFILE_SAVE_FAILED"
    });
  }
});

// POST /api/ads/ai-guided/final-review — Hardened Pre-Creation Consolidated Campaign Review
router.post("/final-review", async (req, res) => {
  try {
    const { customerId, campaignState } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    const resolvedCid = await resolveEffectiveCustomerId(orgId, customerId || campaignState?.customerId);

    if (!resolvedCid) {
      return res.status(400).json({
        success: false,
        error: "A valid 10-digit Google Ads Customer ID is required. Please connect a Google Ads account in Settings.",
        code: "INVALID_CUSTOMER_ID"
      });
    }

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required (x-organization-id header or orgId parameter).",
        code: "MISSING_ORG_ID"
      });
    }

    if (!campaignState || !campaignState.campaignType) {
      return res.status(400).json({
        success: false,
        error: "Missing campaign configuration state or campaignType.",
        code: "MISSING_CAMPAIGN_STATE"
      });
    }

    const cleanCid = resolvedCid.replace(/-/g, "").trim();

    // 1. Strict customer ownership validation
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({
        success: false,
        error: "Access denied. The specified Google Ads account is not associated with this organization.",
        code: "CUSTOMER_ACCESS_DENIED"
      });
    }

    // 2. Build CampaignPlan using existing CampaignPlanMapper
    const plan: CampaignPlan = CampaignPlanMapper.fromState(orgId, cleanCid, campaignState);

    // 3. Run strict deterministic CampaignPlanValidator
    const preflight = await CampaignPlanValidator.validate(orgId, cleanCid, plan);
    plan.preflightChecks = preflight;

    // 4. Produce consolidated CampaignReviewSummary
    const review: CampaignReviewSummary = CampaignPlanMapper.buildReviewSummary(plan, preflight);

    // This endpoint NEVER creates or mutates anything in Google Ads
    return res.status(200).json({
      success: true,
      review,
      preflight,
      readyForPublish: review.readyForPublish,
      warnings: review.warnings,
      blockingIssues: review.blockingIssues
    });
  } catch (error: any) {
    console.error("[AI Guided Final Review Error]:", error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate final campaign review summary."
    });
  }
});

// POST /api/ads/ai-guided/create-campaign
router.post("/create-campaign", async (req, res) => {
  // Set socket timeout to 10 minutes for Google Ads campaign mutation pipeline
  if (req.socket) {
    req.socket.setTimeout(10 * 60 * 1000);
  }
  const idempotencyKey = (req.body?.idempotencyKey || req.headers["x-idempotency-key"] || "") as string;
  let orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body?.orgId || "") as string;
  let cleanCid = ((req.body?.customerId || "") as string).replace(/-/g, "").trim();
  let customerCurrency = ((req.body?.campaignState?.currencyCode || req.body?.campaignState?.currency || "INR") as string).toUpperCase();
  try {
    const { customerId, campaignState, userConfirmed } = req.body;
    orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    // Auto-resolve customerId if missing or unselected from client
    const resolvedCid = await resolveEffectiveCustomerId(orgId, customerId || campaignState?.customerId);

    if (!resolvedCid) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: "Google Ads Customer ID is required. Please connect a Google Ads account in Settings or specify a customerId.",
        code: "MISSING_CUSTOMER_ID"
      });
    }

    cleanCid = resolvedCid.replace(/-/g, "").trim();

    const requestBodyForHash = JSON.stringify({
      customerId: cleanCid,
      orgId,
      campaignType: campaignState?.campaignType,
      objective: campaignState?.objective,
      campaignName: campaignState?.campaignName,
      budget: campaignState?.dailyBudget || campaignState?.totalBudget || campaignState?.budget
    });
    const currentRequestHash = crypto.createHash("sha256").update(requestBodyForHash).digest("hex");

    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim()) {
      const existing = idempotencyCache.get(idempotencyKey.trim());
      if (existing) {
        if (existing.requestHash && existing.requestHash !== currentRequestHash) {
          return res.status(409).json({
            error: "Idempotency key was previously used with a different campaign request payload.",
            code: "IDEMPOTENCY_KEY_COLLISION"
          });
        }
        if (existing.status === "SUCCESS") {
          return res.status(200).json({
            success: true,
            message: existing.message || "Campaign already created successfully (idempotent replay).",
            result: existing.result,
            isIdempotentReplay: true
          });
        }
        if (existing.status === "IN_PROGRESS") {
          return res.status(409).json({
            error: "A campaign creation request with this idempotency key is already in progress. Please wait for completion.",
            isDuplicateInProgress: true
          });
        }
      }
      // Register or reset to IN_PROGRESS
      idempotencyCache.set(idempotencyKey.trim(), {
        status: "IN_PROGRESS",
        organizationId: orgId,
        customerId: cleanCid,
        requestHash: currentRequestHash,
        timestamp: Date.now()
      });
    }

    if (!orgId) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({ error: "Missing organization ID (x-organization-id header or orgId parameter)" });
    }
    if (!campaignState || !campaignState.campaignType) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({ error: "Missing campaignState or campaignType" });
    }

    // Explicit User Confirmation Gate (Mandatory before mutation)
    if (userConfirmed !== true) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: "Campaign creation requires explicit user confirmation. Please review and confirm the campaign configuration.",
        code: "USER_CONFIRMATION_REQUIRED"
      });
    }

    // Customer ownership validation before mutation
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(403).json({
        error: "Access denied. The specified Google Ads account is not associated with this organization."
      });
    }

    // Resolve customer currency dynamically if not present on state
    customerCurrency = campaignState.currencyCode || campaignState.currency;
    if (!customerCurrency) {
      try {
        customerCurrency = await GoogleAdsKeywordPlannerService.getCustomerCurrency(orgId, cleanCid);
      } catch {
        customerCurrency = "INR";
      }
    }
    campaignState.currencyCode = customerCurrency;
    campaignState.currency = customerCurrency;

    // ── Build Deterministic CampaignPlan ─────────────────────────────────────
    const plan: CampaignPlan = CampaignPlanMapper.fromState(orgId, cleanCid, campaignState);

    // ── Run Strict Preflight Validation ──────────────────────────────────────
    const preflight = await CampaignPlanValidator.validate(orgId, cleanCid, plan);
    plan.preflightChecks = preflight;

    if (!preflight.passed) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: "Campaign preflight validation failed. Missing required assets or account readiness requirements.",
        validationErrors: preflight.issues.map(i => ({ field: i.field || "general", message: i.message, type: "FIELD" })),
        missingFields: preflight.issues.map(i => i.message),
        preflight
      });
    }

    const state: CampaignState = campaignState;

    // Process approved extensions and assets from CampaignPlan
    const approvedExtensions = plan.extensionsAndAssets || [];
    const extensionNotices: string[] = [];

    if (approvedExtensions.length > 0) {
      // Revalidate ownership for approved items associated with campaign/customer
      for (const item of approvedExtensions) {
        if (item.type === "SITELINK") {
          // If sitelink text/url is provided, ensure it is added to state.sitelinks if not already present
          if (!Array.isArray(state.sitelinks)) state.sitelinks = [];
          const exists = state.sitelinks.some((s: any) => (s.text || s.sitelinkText) === item.name);
          if (!exists) {
            state.sitelinks.push({
              text: item.name,
              url: item.description?.startsWith("http") ? item.description : (state.website || state.finalUrl || "")
            });
          }
        } else if (item.type === "CALLOUT") {
          if (!Array.isArray(state.callouts)) state.callouts = [];
          if (!state.callouts.includes(item.name)) {
            state.callouts.push(item.name);
          }
        } else if (item.type === "CALL_ASSET") {
          if (!state.callPhoneNumber && item.name) {
            state.callPhoneNumber = item.name;
          }
        } else if (item.type === "STRUCTURED_SNIPPET") {
          if (!Array.isArray(state.structuredSnippets)) state.structuredSnippets = [];
          const exists = state.structuredSnippets.some((sn: any) => sn.header === item.name);
          if (!exists && item.description) {
            const values = item.description.split(",").map((v: string) => v.trim()).filter(Boolean);
            state.structuredSnippets.push({
              header: item.name,
              values: values.length > 0 ? values : [item.name]
            });
          }
        } else {
          // Advisory item (e.g. ASSET_GROUP, PROMOTION, LEAD_FORM) retained in plan as advisory
          extensionNotices.push(`Extension/Asset "${item.name}" (${item.type}) remains linked as advisory context.`);
        }
      }
    }
    if (!state.locations || !Array.isArray(state.locations) || state.locations.filter((l: any) => l && String(l).trim()).length === 0) {
      state.locations = ["India"];
    }
    if (!state.language || !state.language.trim()) {
      state.language = "All languages";
    }

    // ── Pipeline Step 1 & 2: Normalization & Strict Validation ─────────────────────
    const rawType = state.campaignType;
    const campaignType: SupportedCampaignType = CampaignNormalizationService.normalizeCampaignType(rawType);
    const objective: SupportedObjective = CampaignNormalizationService.normalizeObjective(state.objective);

    // Validate objective compatibility with campaign type (throws if unsupported, NO silent fallback)
    try {
      CampaignNormalizationService.validateObjectiveCompatibility(campaignType, objective);
    } catch (objErr: any) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: objErr.message,
        code: objErr.code || "INCOMPATIBLE_CAMPAIGN_OBJECTIVE",
        field: "objective"
      });
    }

    state.campaignType = campaignType;
    (state as any).objective = objective;

    // Validate dates before budget calculation (reject endDate < startDate)
    let normalizedDates;
    try {
      normalizedDates = CampaignNormalizationService.validateAndNormalizeDates(
        state.startDate,
        state.endDate,
        (state.budgetType || "DAILY").toUpperCase() as "DAILY" | "TOTAL"
      );
    } catch (dateErr: any) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: dateErr.message,
        code: dateErr.code || "INVALID_DATES",
        field: dateErr.field || "dates"
      });
    }

    state.startDate = normalizedDates.startDate;
    state.endDate = normalizedDates.endDate;

    // Normalize budget with strict parsing and API capability checking
    let normalizedBudget;
    try {
      normalizedBudget = CampaignNormalizationService.normalizeBudget(
        state,
        campaignType,
        normalizedDates
      );
    } catch (bErr: any) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: bErr.message,
        code: bErr.code || "INVALID_BUDGET",
        field: bErr.field || "budget"
      });
    }

    // Normalize bidding strategy with CPA vs ROAS mutual exclusivity
    let normalizedBidding;
    try {
      normalizedBidding = CampaignNormalizationService.normalizeBidding(
        state,
        campaignType,
        normalizedBudget.type
      );
    } catch (bidErr: any) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: bidErr.message,
        code: bidErr.code || "INVALID_BIDDING",
        field: bidErr.field || "biddingStrategy"
      });
    }

    // Normalize languages & locations
    const normalizedLanguages = CampaignNormalizationService.normalizeLanguages(state);
    const normalizedLocations = CampaignNormalizationService.normalizeLocations(state);

    state.dailyBudget = normalizedBudget.dailyBudget;
    state.totalBudget = normalizedBudget.totalBudget;
    state.budgetType = normalizedBudget.type;
    state.biddingStrategy = normalizedBidding.strategy;
    state.targetCpa = normalizedBidding.targetCpa;
    state.targetRoas = normalizedBidding.targetRoas;
    state.locations = normalizedLocations.locations;
    state.languages = normalizedLanguages.languages;

    // Ensure customerId is explicitly set on campaign state for common rule validation
    state.customerId = cleanCid;

    // Ensure AI Guided flow context flags
    (state as any).isAiGuided = true;
    (state as any).source = "AI_GUIDED";

    // Run GoogleAdsCampaignValidator
    const valResult = GoogleAdsCampaignValidator.validate(state);
    if (!valResult.isValid) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({
        error: "Campaign validation failed. Missing required assets or configuration.",
        validationErrors: valResult.errors,
        missingFields: valResult.missingSummary
      });
    }

    const campaignName = GoogleAdsBaseService.cleanAdText(state.campaignName || `${state.businessName} - ${campaignType}`, 100);
    const budgetType = normalizedBudget.type;
    const dailyBudget = normalizedBudget.dailyBudget;
    const totalBudget = normalizedBudget.totalBudget;
    const locations = normalizedLocations.locations;
    const languages = normalizedLanguages.languages;

    // Centralize Ad Schedule Normalization & Deduplication across all campaign types
    const normalizedAdSchedule = (() => {
      const rawSched = (state as any).adSchedule || (state as any).adScheduleList || [];
      if (!Array.isArray(rawSched)) return [];
      const seen = new Set<string>();
      return rawSched.filter((s: any) => {
        if (!s || !s.day || !s.start || !s.end) return false;
        const isAllDay = (s.start === "00:00" || s.start === "0:00") && (s.end === "00:00" || s.end === "0:00" || s.end === "24:00" || s.end === "23:45");
        const isAllDays = String(s.day).trim().toLowerCase() === "all days";
        if (isAllDay && isAllDays) return false;
        const key = `${String(s.day).trim().toLowerCase()}_${String(s.start).trim()}_${String(s.end).trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })();

    // Centralize Devices Normalization across all campaign types
    const rawDevices = (state as any).devices;
    const normalizedDevices = (() => {
      if (Array.isArray(rawDevices)) {
        return rawDevices.map((d: any) => String(d).trim().toUpperCase()).filter(Boolean);
      }
      if (rawDevices && typeof rawDevices === "object") {
        const devs: string[] = [];
        if (rawDevices.computers !== false && rawDevices.desktop !== false) devs.push("DESKTOP");
        if (rawDevices.mobile !== false) devs.push("MOBILE");
        if (rawDevices.tablets !== false && rawDevices.tablet !== false) devs.push("TABLET");
        if (rawDevices.tv !== false && rawDevices.connectedTv !== false) devs.push("CONNECTED_TV");
        return devs;
      }
      return ["DESKTOP", "MOBILE", "TABLET", "CONNECTED_TV"];
    })();

    const validHeadlines = ((state as any).headlines || [])
      .map((h: any) => GoogleAdsBaseService.cleanAdText(typeof h === "string" ? h : h?.text || "", 30))
      .filter((h: string) => h.length > 0);
    const validLongHeadlines = ((state as any).longHeadlines || [])
      .map((lh: any) => GoogleAdsBaseService.cleanAdText(typeof lh === "string" ? lh : lh?.text || "", 90))
      .filter((lh: string) => lh.length > 0);
    const validDescriptions = ((state as any).descriptions || [])
      .map((d: any) => GoogleAdsBaseService.cleanAdText(typeof d === "string" ? d : d?.text || "", 90))
      .filter((d: string) => d.length > 0);
    const validKeywords = ((state as any).keywords || [])
      .map((k: any) => GoogleAdsBaseService.cleanAdText(typeof k === "string" ? k : k?.keyword || k?.text || "", 80))
      .filter((k: string) => k.length > 0);

    let result: any;

    switch (state.campaignType as any) {
      case "SEARCH": {
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: state.website || state.finalUrl || anyState.websiteVisitsUrl,
          websiteVisitsUrl: state.website || state.finalUrl || anyState.websiteVisitsUrl,
          businessName: state.businessName,
          dailyBudget,
          budget: budgetType === "TOTAL" && totalBudget ? totalBudget : dailyBudget,
          budgetType,
          totalBudget,
          locations,
          languages: languages.length > 0 ? languages : ["English"],
          biddingFocus: state.biddingStrategy || "Maximize conversions",
          biddingStrategy: state.biddingStrategy || "Maximize conversions",
          targetCpa: state.targetCpa || undefined,
          targetRoas: state.targetRoas || undefined,
          maxCpcLimit: (state as any).maxCpcLimit || undefined,
          impressionShareLocation: (state as any).impressionShareLocation || undefined,
          targetImpressionSharePercent: (state as any).targetImpressionSharePercent || undefined,
          maxCpcImpressionShare: (state as any).maxCpcImpressionShare || undefined,
          startDate: state.startDate,
          endDate: state.endDate,
          keywords: validKeywords,
          headlines: validHeadlines,
          descriptions: validDescriptions,
          euPolitical: state.euPolitical || "NO",
          // Search Networks & Location Settings
          networkSearch: anyState.networkSearch !== undefined ? anyState.networkSearch : (state.networkSearch !== undefined ? state.networkSearch : true),
          networkDisplay: anyState.networkDisplay !== undefined ? anyState.networkDisplay : (state.networkDisplay !== undefined ? state.networkDisplay : false),
          locationOptionsPresence: anyState.locationOptionsPresence || state.locationOptionsPresence || "PRESENCE_INTEREST",
          locationOptionsExclude: anyState.locationOptionsExclude || state.locationOptionsExclude || "PRESENCE",
          adRotationMode: anyState.adRotationMode || state.adRotationMode || "OPTIMIZE",
          displayPath1: anyState.displayPath1 || state.displayPath1 || undefined,
          displayPath2: anyState.displayPath2 || state.displayPath2 || undefined,
          adGroupName: anyState.adGroupName || state.adGroupName || undefined,
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || state.customParameters || [],
          urlCustomParameters: anyState.customParameters || state.customParameters || [],
          brandInclusions: anyState.brandInclusions || state.brandInclusions || [],
          brandExclusions: anyState.brandExclusions || state.brandExclusions || [],
          locationsOfInterest: anyState.locationsOfInterest || state.locationsOfInterest || [],
          urlInclusions: anyState.urlInclusions || state.urlInclusions || [],
          onlyBidNewCustomers: anyState.onlyBidNewCustomers !== undefined ? anyState.onlyBidNewCustomers : state.onlyBidNewCustomers,
          adjustLapsedCustomers: anyState.adjustLapsedCustomers !== undefined ? anyState.adjustLapsedCustomers : state.adjustLapsedCustomers,
          customerAcquisitionMode: anyState.customerAcquisitionMode || state.customerAcquisitionMode || (state.onlyBidNewCustomers ? "TARGET_NEW_CUSTOMER_ONLY" : "TARGET_ALL_EQUALLY"),
          // AI Max & Search Term Matching
          enableAiMax: anyState.enableAiMax !== undefined ? anyState.enableAiMax : (state.aiMax !== undefined ? state.aiMax : true),
          enableTextCustomization: anyState.enableTextCustomization !== undefined ? anyState.enableTextCustomization : true,
          enableFinalUrlExpansion: anyState.enableFinalUrlExpansion !== undefined ? anyState.enableFinalUrlExpansion : true,
          useSearchTermMatchingAdGroup: anyState.useSearchTermMatchingAdGroup !== undefined ? anyState.useSearchTermMatchingAdGroup : true,
          searchThemes: state.searchThemes || anyState.searchThemes || [],
          // Schedules & Extensions
          adSchedule: normalizedAdSchedule,
          devices: normalizedDevices,
          sitelinks: anyState.sitelinks || state.sitelinks || [],
          callouts: anyState.callouts || state.callouts || [],
          structuredSnippets: anyState.structuredSnippets || state.structuredSnippets || [],
          callAsset: anyState.callAsset || (anyState.callPhone || anyState.callPhoneNumber || state.callPhoneNumber ? { phoneNumber: anyState.callPhone || anyState.callPhoneNumber || state.callPhoneNumber, countryCode: anyState.callCountryCode || "IN" } : undefined),
          callPhoneNumber: state.callPhoneNumber || anyState.callPhoneNumber || anyState.callPhone || undefined,
          callPhone: state.callPhoneNumber || anyState.callPhoneNumber || anyState.callPhone || undefined,
          promotions: anyState.promotions || state.promotions || [],
          prices: anyState.prices || state.prices || [],
          messages: anyState.messages || state.messages || [],
          leadForms: anyState.leadForms || state.leadForms || [],
          app: anyState.app || (state.appId ? { appId: state.appId, appName: state.appName, platform: state.platform } : undefined),
          merchantCenterId: state.useMerchantInCampaign !== false ? (state.merchantCenterId || state.merchantId || anyState.merchantCenterId) : undefined,
          merchantId: state.useMerchantInCampaign !== false ? (state.merchantCenterId || state.merchantId || anyState.merchantId) : undefined,
          salesCountry: state.salesCountry || anyState.salesCountry,
          feedLabel: state.feedLabel || anyState.feedLabel,
          images: state.images && state.images.length > 0 ? state.images : [],
          logos: state.logos && state.logos.length > 0 ? state.logos : [],
          conversionGoals: anyState.conversionGoals || state.conversionGoals || []
        };
        if (objective === "NO_GUIDANCE") {
          result = await NoGuidanceSearchService.createCampaign(orgId, customerId, payload);
        } else if (objective === "LEADS") {
          result = await LeadsSearchService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficSearchService.createCampaign(orgId, customerId, payload);
        } else if (objective === "SALES") {
          result = await SalesSearchService.createCampaign(orgId, customerId, payload);
        } else {
          return res.status(400).json({ error: `Unsupported objective "${objective}" for Search campaigns.` });
        }
        break;
      }

      case "PERFORMANCE_MAX": {
        const rawPmaxUrl = state.website || state.finalUrl || "";
        const cleanPmaxUrl = GoogleAdsBaseService.cleanUrl(rawPmaxUrl);
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: cleanPmaxUrl,
          businessName: state.businessName,
          dailyBudget,
          budget: budgetType === "TOTAL" && totalBudget ? totalBudget : dailyBudget,
          budgetType,
          totalBudget,
          locations,
          languages,
          biddingFocus: state.biddingStrategy || (state as any).biddingFocus || (objective === "LEADS" ? "Maximize conversions" : "Maximize conversion value"),
          targetCpa: state.targetCpa || undefined,
          targetRoas: state.targetRoas || undefined,
          headlines: validHeadlines,
          longHeadlines: validLongHeadlines,
          descriptions: validDescriptions,
          images: state.images || [],
          logos: state.logos || [],
          brandLogos: state.logos || [],
          assetGroupName: (anyState.assetGroupName && String(anyState.assetGroupName).trim()) ? String(anyState.assetGroupName).trim() : `${state.businessName || (objective === "WEBSITE_TRAFFIC" ? "Website Traffic" : objective === "LEADS" ? "Leads" : (objective === "LOCAL" || objective === "STORE_VISITS") ? "Store Visits" : objective === "NO_GUIDANCE" ? "All Channels" : "Sales")} - ${objective === "WEBSITE_TRAFFIC" ? "Traffic Growth" : objective === "LEADS" ? "Lead Generation" : (objective === "LOCAL" || objective === "STORE_VISITS") ? "Store Visits" : objective === "NO_GUIDANCE" ? "Performance Max" : "Sales Growth"}`,
          brandGuidelinesEnabled: Boolean(anyState.brandGuidelinesEnabled),
          startDate: state.startDate,
          endDate: state.endDate,
          euPolitical: anyState.euPolitical || "NO",
          // Enhanced Performance Max Parameters from State
          merchantCenterId: state.merchantCenterId || state.merchantId,
          merchantId: state.merchantCenterId || state.merchantId,
          feedLabel: state.feedLabel,
          salesCountry: state.salesCountry,
          customerAcquisitionMode: CampaignNormalizationService.normalizeCustomerAcquisitionMode(state.customerAcquisitionMode || anyState.customerAcquisitionMode),
          positiveGeoTargetType: anyState.positiveGeoTargetType || anyState.locationOptionsPresence,
          negativeGeoTargetType: anyState.negativeGeoTargetType || anyState.locationOptionsExclude,
          trackingTemplate: state.trackingTemplate,
          finalUrlSuffix: state.finalUrlSuffix,
          customParameters: state.customParameters,
          displayPath1: state.displayPath1,
          displayPath2: state.displayPath2,
          mobileFinalUrl: state.mobileFinalUrl,
          searchThemes: anyState.searchThemes || [],
          audienceSignals: plan?.targeting?.audienceSignalIds?.length
            ? plan.targeting.audienceSignalIds
            : (state?.audienceSignalIds?.length
              ? state.audienceSignalIds
              : (anyState.audienceSignals || anyState.audiences || [])),
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          promotions: anyState.promotions || [],
          prices: anyState.prices || [],
          messages: anyState.messages || [],
          leadForms: anyState.leadForms || [],
          callAsset: anyState.callPhoneNumber ? { phone: anyState.callPhoneNumber, countryCode: "IN" } : anyState.callAsset,
          structuredSnippets: anyState.structuredSnippets || [],
          adSchedule: normalizedAdSchedule,
          devices: normalizedDevices,
          brandExclusions: anyState.brandExclusions || anyState.createdBrandLists || [],
          demographicExclusions: anyState.demographicExclusions,
          dataExclusions: anyState.dataExclusions || anyState.selectedDataExclusions || [],
          conversionGoals: anyState.conversionGoals || state.conversionGoals || [],
          localServicesEnabled: objective === "LOCAL" || objective === "STORE_VISITS"
        };
        if (objective === "NO_GUIDANCE") {
          result = await NoGuidancePerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else if (objective === "LOCAL" || objective === "STORE_VISITS") {
          result = await StoreVisitsPerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else if (objective === "LEADS") {
          result = await LeadsPerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficPerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else if (objective === "SALES") {
          result = await SalesPerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else {
          return res.status(400).json({ error: `Unsupported objective "${objective}" for Performance Max.` });
        }
        break;
      }

      case "DISPLAY": {
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: state.website || state.finalUrl,
          mobileFinalUrl: anyState.mobileFinalUrl || undefined,
          businessName: state.businessName,
          dailyBudget,
          budget: dailyBudget,
          locations,
          languages,
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          biddingFocus: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          targetCpa: state.targetCpa || undefined,
          targetRoas: state.targetRoas || undefined,
          targetCpc: anyState.targetCpc || anyState.maxCpc || undefined,
          maxCpc: anyState.maxCpc || undefined,
          cpcBid: anyState.cpcBid || undefined,
          viewableCpmBid: anyState.viewableCpmBid || undefined,
          startDate: state.startDate,
          endDate: state.endDate,
          headlines: validHeadlines,
          longHeadlines: state.longHeadlines && state.longHeadlines.length > 0 ? state.longHeadlines : (validHeadlines.length > 0 ? [validHeadlines[0]] : []),
          descriptions: validDescriptions,
          images: state.images && state.images.length > 0 ? state.images : [],
          logos: state.logos && state.logos.length > 0 ? state.logos : [],
          videos: state.videos && state.videos.length > 0 ? state.videos : [],
          callToAction: anyState.callToAction || anyState.callToActionText || "Automated",
          euPolitical: state.euPolitical || "NO",
          deviceTargeting: anyState.deviceTargeting || anyState.deviceOption || "ALL",
          devices: normalizedDevices,
          adSchedule: normalizedAdSchedule,
          adRotation: anyState.adRotation || anyState.adRotationOption || "OPTIMIZE",
          trackingTemplate: anyState.trackingTemplate || undefined,
          finalUrlSuffix: anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || anyState.customParamsList || [],
          ipExclusions: anyState.ipExclusions || undefined,
          audiences: anyState.audiences || anyState.selectedAudiences || [],
          selectedAudiences: anyState.selectedAudiences || [],
          audience: anyState.audience || undefined,
          demographicsGender: anyState.demographicsGender || undefined,
          demographicsAge: anyState.demographicsAge || undefined,
          demographicsParental: anyState.demographicsParental || undefined,
          demographicsIncome: anyState.demographicsIncome || undefined,
          demographics: anyState.demographics || undefined,
          topics: anyState.topics || anyState.selectedTopics || [],
          selectedTopics: anyState.selectedTopics || [],
          placements: anyState.placements || anyState.selectedPlacements || [],
          selectedPlacements: anyState.selectedPlacements || [],
          keywords: anyState.keywords || [],
          enteredKeywordsText: anyState.enteredKeywordsText || undefined,
          contentLabels: anyState.contentLabels || undefined,
          sensitiveContent: anyState.sensitiveContent || undefined,
          contentTypeExclusions: anyState.contentTypeExclusions || undefined,
          useOptimizedTargeting: anyState.useOptimizedTargeting !== undefined ? Boolean(anyState.useOptimizedTargeting) : true,
          optimizedTargeting: anyState.optimizedTargeting !== undefined ? Boolean(anyState.optimizedTargeting) : true,
          useAssetEnhancements: anyState.useAssetEnhancements !== undefined ? Boolean(anyState.useAssetEnhancements) : undefined,
          useAutoGeneratedVideo: anyState.useAutoGeneratedVideo !== undefined ? Boolean(anyState.useAutoGeneratedVideo) : undefined,
          useNativeFormats: anyState.useNativeFormats !== undefined ? Boolean(anyState.useNativeFormats) : undefined,
          useDynamicFeed: anyState.useDynamicFeed !== undefined ? Boolean(anyState.useDynamicFeed) : undefined,
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          structuredSnippets: anyState.structuredSnippets || [],
          promotions: anyState.promotions || [],
          callAsset: anyState.callAsset || undefined,
          leadFormAsset: anyState.leadFormAsset || undefined,
          conversionGoals: anyState.conversionGoals || state.conversionGoals || []
        };
        if (objective === "LEADS") {
          result = await LeadsDisplayService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficDisplayService.createCampaign(orgId, customerId, payload);
        } else if (objective === "AWARENESS" || objective === "YOUTUBE_REACH") {
          result = await YoutubeDisplayLocalService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE") {
          result = await NoGuidanceDisplayService.createCampaign(orgId, customerId, payload);
        } else if (objective === "SALES") {
          result = await SalesDisplayService.createCampaign(orgId, customerId, payload);
        } else {
          return res.status(400).json({ error: `Unsupported objective "${objective}" for Display campaigns.` });
        }
        break;
      }

      case "DEMAND_GEN": {
        const anyState = state as any;
        const resolvedBudgetType = anyState.demandGenBudgetType || (budgetType === "TOTAL" ? "Total" : "Daily");
        const resolvedAccentBrandColor = anyState.accentBrandColor || state.accentBrandColor || (Array.isArray(anyState.brandColors) ? anyState.brandColors[1] : undefined);
        const resolvedMainBrandColor = anyState.mainBrandColor || state.mainBrandColor || (Array.isArray(anyState.brandColors) ? anyState.brandColors[0] : undefined);
        const resolvedBrandFont = anyState.brandFont || state.brandFont || undefined;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          campaignGoal: anyState.campaignGoal || state.objective || objective || "Website Traffic",
          objective: anyState.campaignGoal || state.objective || objective || "Website Traffic",
          finalUrl: state.website || state.finalUrl,
          website: state.website || state.finalUrl,
          businessName: state.businessName,
          dailyBudget,
          budget: resolvedBudgetType.toLowerCase().includes("total") && totalBudget ? totalBudget : dailyBudget,
          totalBudget: totalBudget || (resolvedBudgetType.toLowerCase().includes("total") ? (state.totalBudget || state.dailyBudget) : undefined),
          budgetType: resolvedBudgetType,
          demandGenBudgetType: resolvedBudgetType,
          callPhoneNumber: state.callPhoneNumber || anyState.callPhoneNumber || undefined,
          locations,
          languages,
          biddingStrategy: state.biddingStrategy,
          biddingFocus: state.biddingStrategy,
          targetCpa: state.targetCpa || undefined,
          targetRoas: state.targetRoas || undefined,
          startDate: state.startDate,
          endDate: state.endDate,
          adFormat: state.adFormat || "SINGLE_IMAGE",
          channelTargeting: state.channelTargeting || "ALL",
          channels: state.channels || [],
          carouselCards: state.carouselCards || [],
          callToAction: state.callToAction || anyState.callToAction || "Automated",
          headlines: validHeadlines,
          longHeadlines: state.longHeadlines && state.longHeadlines.length > 0 ? state.longHeadlines : (validHeadlines.length > 0 ? [validHeadlines[0]] : []),
          descriptions: validDescriptions,
          images: state.images && state.images.length > 0 ? state.images : [],
          logos: state.logos && state.logos.length > 0 ? state.logos : [],
          videos: state.videos && state.videos.length > 0 ? state.videos : [],
          euPolitical: state.euPolitical || "NO",
          includeViewThrough: anyState.includeViewThrough !== undefined ? Boolean(anyState.includeViewThrough) : true,
          mainBrandColor: resolvedMainBrandColor,
          accentBrandColor: resolvedAccentBrandColor,
          brandFont: resolvedBrandFont,
          brandGuidelines: anyState.brandGuidelines || (state.brandGuidelinesEnabled || (resolvedMainBrandColor && resolvedAccentBrandColor) ? {
            mainBrandColor: resolvedMainBrandColor,
            accentBrandColor: resolvedAccentBrandColor,
            brandFont: resolvedBrandFont,
            mainColor: resolvedMainBrandColor,
            accentColor: resolvedAccentBrandColor,
            font: resolvedBrandFont
          } : undefined),
          optAdaptiveLayouts: anyState.optAdaptiveLayouts !== undefined ? Boolean(anyState.optAdaptiveLayouts) : true,
          optAnimatedImages: anyState.optAnimatedImages !== undefined ? Boolean(anyState.optAnimatedImages) : true,
          optGeneratedVideos: anyState.optGeneratedVideos !== undefined ? Boolean(anyState.optGeneratedVideos) : true,
          optShorterVideos: anyState.optShorterVideos !== undefined ? Boolean(anyState.optShorterVideos) : true,
          optResizedVideos: anyState.optResizedVideos !== undefined ? Boolean(anyState.optResizedVideos) : true,
          optLandingPagePreviews: anyState.optLandingPagePreviews !== undefined ? Boolean(anyState.optLandingPagePreviews) : true,
          adName: anyState.adName || state.adName || undefined,
          adGroupName: anyState.adGroupName || state.adGroupName || undefined,
          adGroups: anyState.adGroups || (state as any).adGroups || undefined,
          displayPath1: anyState.displayPath1 || state.displayPath1 || undefined,
          displayPath2: anyState.displayPath2 || state.displayPath2 || undefined,
          adSchedule: normalizedAdSchedule,
          mobileFinalUrl: anyState.mobileFinalUrl || state.mobileFinalUrl || undefined,
          deviceTargeting: anyState.deviceTargeting || "ALL",
          devices: normalizedDevices,
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || anyState.customParamsList || [],
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          structuredSnippets: anyState.structuredSnippets || [],
          promotions: anyState.promotions || [],
          audience: anyState.audience || undefined,
          audienceSignal: anyState.audienceSignal || anyState.audienceSignals?.[0] || undefined,
          audienceSignals: anyState.audienceSignals || (anyState.audienceSignal ? (Array.isArray(anyState.audienceSignal) ? anyState.audienceSignal : [anyState.audienceSignal]) : (state.audienceSignals || [])),
          searchThemes: anyState.searchThemes || state.searchThemes || [],
          keywords: anyState.keywords || state.keywords || [],
          demographicExclusions: anyState.demographicExclusions || state.demographicExclusions || undefined,
          genderExclusions: anyState.demographicExclusions?.genders || anyState.genderExclusions || undefined,
          ageExclusions: anyState.demographicExclusions?.ages || anyState.ageExclusions || undefined,
          brandExclusions: anyState.brandExclusions || (state as any).brandExclusions || undefined,
          brandInclusions: anyState.brandInclusions || (state as any).brandInclusions || undefined,
          valueRules: anyState.valueRules || (state as any).valueRules || undefined,
          merchantCenterId: state.merchantCenterId || state.merchantId || anyState.merchantCenterId || anyState.merchantId || undefined,
          merchantId: state.merchantCenterId || state.merchantId || anyState.merchantCenterId || anyState.merchantId || undefined,
          customerAcquisitionMode: anyState.customerAcquisitionMode || (state.onlyBidNewCustomers ? "ONLY_NEW" : "EQUAL"),
          optimizedTargeting: anyState.optimizedTargeting !== undefined ? Boolean(anyState.optimizedTargeting) : true,
          ipExclusions: anyState.ipExclusions || undefined,
          conversionGoals: anyState.conversionGoals || state.conversionGoals || []
        };
        if (objective === "LEADS") {
          result = await LeadsDemandGenService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficDemandGenService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE") {
          result = await NoGuidanceDemandGenService.createCampaign(orgId, customerId, payload);
        } else if (objective === "AWARENESS" || objective === "YOUTUBE" || objective === "YOUTUBE_REACH") {
          result = await YoutubeDemandGenService.createCampaign(orgId, customerId, payload);
        } else if (objective === "SALES") {
          result = await SalesDemandGenService.createCampaign(orgId, customerId, payload);
        } else {
          return res.status(400).json({ error: `Unsupported objective "${objective}" for Demand Gen campaigns.` });
        }
        break;
      }

      case "SHOPPING": {
        const anyState = state as any;
        const audSignal = anyState.audienceSignal || (anyState.audienceSignals?.[0] ? anyState.audienceSignals[0] : (state.audienceSignals?.[0] || undefined));
        const audSignals = anyState.audienceSignals || (anyState.audienceSignal ? (Array.isArray(anyState.audienceSignal) ? anyState.audienceSignal : [anyState.audienceSignal]) : (state.audienceSignals || []));
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: state.website || state.finalUrl,
          merchantCenterId: state.merchantCenterId || state.merchantId,
          salesCountry: state.salesCountry,
          feedLabel: state.feedLabel || state.salesCountry,
          dailyBudget,
          budget: budgetType === "TOTAL" && totalBudget ? totalBudget : dailyBudget,
          budgetType,
          totalBudget,
          locations,
          languages: Array.isArray(languages) && languages.length > 0 ? languages : ["All languages"],
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSION_VALUE",
          biddingFocus: state.biddingStrategy || "MAXIMIZE_CONVERSION_VALUE",
          targetRoas: state.targetRoas || undefined,
          maxCpcLimit: anyState.maxCpcLimit || anyState.maxCpc || undefined,
          campaignPriority: anyState.campaignPriority || state.campaignPriority || "LOW",
          customerAcquisitionMode: anyState.customerAcquisitionMode || state.customerAcquisitionMode || "ALL_CUSTOMERS",
          localProducts: Boolean(state.localProducts || anyState.enableLocalProducts),
          adGroupName: anyState.adGroupName || state.adGroupName || "Ad group 1",
          adGroupBid: anyState.adGroupBid || state.adGroupBid || undefined,
          productGroupFilter: anyState.productGroupFilter || state.productGroupFilter || "Use all products",
          productGroupSelectBy: anyState.productGroupSelectBy || state.productGroupSelectBy || undefined,
          productGroupCustomLabel: anyState.productGroupCustomLabel || state.productGroupCustomLabel || undefined,
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || anyState.customParamsList || [],
          adSchedule: normalizedAdSchedule,
          deviceTargeting: anyState.deviceTargeting || "ALL",
          devices: normalizedDevices,
          startDate: state.startDate,
          endDate: state.endDate,
          keywords: validKeywords.length > 0 ? validKeywords : (anyState.keywords || []),
          searchThemes: anyState.searchThemes || state.searchThemes || [],
          audienceSignal: audSignal,
          audienceSignals: audSignals,
          audience: anyState.audience || undefined,
          headlines: validHeadlines,
          descriptions: validDescriptions,
          euPolitical: state.euPolitical || "NO",
          conversionGoals: anyState.conversionGoals || state.conversionGoals || []
        };
        if (objective === "LEADS") {
          result = await LeadsShoppingService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficShoppingService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE") {
          result = await NoGuidanceShoppingService.createCampaign(orgId, customerId, payload);
        } else if (objective === "SALES") {
          result = await SalesShoppingService.createCampaign(orgId, customerId, payload);
        } else {
          return res.status(400).json({ error: `Unsupported objective "${objective}" for Shopping campaigns.` });
        }
        break;
      }

      case "APP": {
        if (objective !== "APP_PROMOTION") {
          return res.status(400).json({ error: `Unsupported objective "${objective}" for APP campaigns. Only APP_PROMOTION is supported.` });
        }
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          platform: state.platform,
          appId: state.appId,
          appName: state.appName || undefined,
          businessName: state.businessName || undefined,
          locations,
          languages,
          headlines: validHeadlines,
          descriptions: validDescriptions,
          targetCpa: state.targetCpa,
          dailyBudget,
          budget: dailyBudget,
          startDate: state.startDate,
          endDate: state.endDate,
          euPolitical: state.euPolitical || "NO",
          images: (state as any).images || (state as any).marketingImages || [],
          videos: (state as any).videos || (state as any).youtubeVideos || [],
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || anyState.customParamsList || [],
          conversionGoals: anyState.conversionGoals || state.conversionGoals || []
        };
        result = await AppPromotionAppService.createCampaign(orgId, customerId, payload);
        break;
      }

      default:
        return res.status(400).json({ error: `Unsupported campaign type: ${state.campaignType}` });
    }

    const anyState = state as any;
    console.log(`\n==================== 🚀 [GOOGLE ADS SUCCESS] ====================`);
    console.log(`✅ Campaign Created Successfully in Google Ads!`);
    console.log(`-----------------------------------------------------------------`);
    console.log(`📌 Customer ID:          ${customerId}`);
    console.log(`📌 Campaign ID:          ${result?.campaign?.googleAdsCampaignId || result?.campaignId || "N/A"}`);
    console.log(`📌 Campaign Name:        ${campaignName}`);
    console.log(`📌 Campaign Type:        ${state.campaignType}`);
    console.log(`📌 Objective:            ${objective}`);
    console.log(`📌 Budget Type:          ${budgetType === "TOTAL" ? "Campaign Total Budget" : "Average Daily Budget"}`);
    if (budgetType === "TOTAL") {
      console.log(`📌 Campaign Total:       ₹${totalBudget} (Effective Daily: ₹${dailyBudget}/day)`);
    } else {
      console.log(`📌 Daily Budget:         ₹${dailyBudget}/day (Budget Resource: ${result?.budgetResourceName || result?.campaign?.budgetResourceName || "N/A"})`);
    }
    console.log(`📌 Bidding Strategy:     ${anyState?.biddingStrategy || anyState?.biddingFocus || "Maximize conversions"}`);
    if (anyState?.targetCpa) console.log(`📌 Target CPA:           ₹${anyState?.targetCpa}`);
    if (anyState?.targetRoas) console.log(`📌 Target ROAS:          ${anyState?.targetRoas}%`);
    console.log(`📌 Final / Website URL:  ${anyState?.website || anyState?.websiteVisitsUrl || anyState?.finalUrl || "N/A"}`);
    console.log(`📌 Locations:            ${JSON.stringify(anyState?.locations || (anyState?.location ? [anyState.location] : ["India"]))}`);
    console.log(`📌 Languages:            ${JSON.stringify(anyState?.languages || (state?.language ? [state.language] : ["All languages"]))}`);
    if (anyState?.startDate) console.log(`📌 Start Date:           ${anyState?.startDate}`);
    if (anyState?.endDate) console.log(`📌 End Date:             ${anyState?.endDate}`);

    // Shopping Campaign Specific Settings (Merchant Center, Feed Label, Priority, Inventory)
    if (state.campaignType === "SHOPPING" || anyState?.merchantCenterId || anyState?.merchantId) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🛍️ Google Shopping & Merchant Center:`);
      console.log(`   • Merchant Center ID:     ${anyState?.merchantCenterId || anyState?.merchantId || anyState?.shoppingSetting?.merchantId || "N/A"}`);
      console.log(`   • Sales / Feed Country:   ${anyState?.salesCountry || anyState?.shoppingSetting?.salesCountry || "IN"}`);
      console.log(`   • Feed Label:             ${anyState?.feedLabel || anyState?.shoppingSetting?.feedLabel || anyState?.salesCountry || "IN"}`);
      console.log(`   • Campaign Priority:      ${anyState?.campaignPriority || anyState?.shoppingSetting?.campaignPriority || "LOW"}`);
      console.log(`   • Customer Acquisition:   ${anyState?.customerAcquisitionMode || "ALL_CUSTOMERS"}`);
      console.log(`   • Local Products Enabled: ${Boolean(anyState?.localProducts || anyState?.enableLocalProducts)}`);
      console.log(`   • Product Group Filter:   ${anyState?.productGroupFilter || "Use all products"}`);
      if (anyState?.productGroupSelectBy) console.log(`   • Selected Product By:    ${anyState?.productGroupSelectBy}`);
      if (anyState?.adGroupName) console.log(`   • Ad Group Name:          ${anyState?.adGroupName} (Bid: ${anyState?.adGroupBid ? `₹${anyState?.adGroupBid}` : "Auto/Strategy"})`);
    }

    // Target Keywords (Supported and logged for SEARCH, DISPLAY, VIDEO, or custom targeting)
    const kws = state.campaignType === "DEMAND_GEN" ? [] : (anyState?.keywords || validKeywords || []);
    if (kws.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🔑 Target Keywords (${kws.length}):`);
      kws.forEach((kw: string, i: number) => console.log(`   [${i + 1}] ${kw}`));
    }

    // YouTube Video Links (Specifically logged for VIDEO and YOUTUBE campaigns)
    const vids = anyState?.videos || anyState?.youtubeVideos || [];
    if (Array.isArray(vids) && vids.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🎬 YouTube Videos (${vids.length}):`);
      vids.forEach((v: any, i: number) => {
        const vUrl = typeof v === "string" ? v : v?.url || v?.videoId || v?.asset || "N/A";
        console.log(`   [${i + 1}] ${vUrl}`);
      });
    }

    // Brand Guidelines (Brand Font, Main Color, Accent Color)
    if (anyState?.mainBrandColor || anyState?.accentBrandColor || anyState?.brandFont) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🎨 Brand Guidelines:`);
      if (anyState.mainBrandColor) console.log(`   • Main Brand Color:   ${anyState.mainBrandColor}`);
      if (anyState.accentBrandColor) console.log(`   • Accent Brand Color: ${anyState.accentBrandColor}`);
      if (anyState.brandFont) console.log(`   • Brand Font:         ${anyState.brandFont}`);
    }

    // Channels Targeting
    const channelsList = anyState?.channels || [];
    if (Array.isArray(channelsList) && channelsList.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`📺 Channels Targeting (${channelsList.length}): ${channelsList.join(", ")}`);
    }

    // Device Targeting
    if (anyState?.deviceTargeting || anyState?.devices) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`📱 Device Targeting: ${anyState.deviceTargeting || "ALL"}`);
      if (anyState.devices) console.log(`   Devices: ${JSON.stringify(anyState.devices)}`);
    }

    // Audience Signal / Targeting
    const audSignal = anyState?.audienceSignal || anyState?.audienceSignals || anyState?.audience;
    if (audSignal) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`👥 Audience Signal / Targeting:`, typeof audSignal === "object" ? JSON.stringify(audSignal) : audSignal);
    }

    // Headlines
    const hls = anyState?.headlines || validHeadlines || [];
    if (hls.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`📝 Headlines (${hls.length}):`);
      hls.forEach((h: string, i: number) => console.log(`   [${i + 1}] ${h}`));
    }

    // Long Headlines
    const lhls = anyState?.longHeadlines || validLongHeadlines || [];
    if (lhls.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`📝 Long Headlines (${lhls.length}):`);
      lhls.forEach((lh: string, i: number) => console.log(`   [${i + 1}] ${lh}`));
    }

    // Descriptions
    const descs = anyState?.descriptions || validDescriptions || [];
    if (descs.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`📄 Descriptions (${descs.length}):`);
      descs.forEach((d: string, i: number) => console.log(`   [${i + 1}] ${d}`));
    }

    // Media Assets
    const imgs = anyState?.images || [];
    const logos = anyState?.logos || [];
    if (imgs.length > 0 || logos.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🖼️ Media Assets: ${imgs.length} Images, ${logos.length} Logos`);
    }

    // Sitelinks
    const stlinks = anyState?.sitelinks || [];
    if (stlinks.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🔗 Sitelink Extensions (${stlinks.length}):`);
      stlinks.forEach((st: any, i: number) => console.log(`   [${i + 1}] "${st.text}" -> ${st.url}${st.desc1 ? ` (${st.desc1})` : ""}`));
    }

    // Callout Extensions
    const calloutsList = anyState?.callouts || [];
    if (calloutsList.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`📢 Callout Extensions (${calloutsList.length}):`);
      calloutsList.forEach((co: any, i: number) => console.log(`   [${i + 1}] "${typeof co === 'string' ? co : co.text || co}"`));
    }

    // Structured Snippets
    const snipsList = anyState?.structuredSnippets || [];
    if (snipsList.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`📋 Structured Snippets (${snipsList.length}):`);
      snipsList.forEach((sn: any, i: number) => console.log(`   [${i + 1}] ${sn.header}: ${(sn.values || []).join(", ")}`));
    }

    // Search Themes (Supported and logged for PMAX, SEARCH, VIDEO, DEMAND_GEN)
    const sthemesList = anyState?.searchThemes || [];
    if (sthemesList.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🎯 Search Themes / Signals (${sthemesList.length}):`);
      sthemesList.forEach((th: any, i: number) => console.log(`   [${i + 1}] ${typeof th === 'string' ? th : th.text || th}`));
    }

    // Ad Schedule
    const schedList = anyState?.adSchedule || anyState?.adScheduleList || [];
    if (Array.isArray(schedList) && schedList.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`⏰ Ad Schedule (${schedList.length}):`);
      schedList.forEach((sc: any, i: number) => console.log(`   [${i + 1}] ${sc.day || sc.dayOfWeek || 'All days'}: ${sc.start || '00:00'} - ${sc.end || '00:00'}`));
    }

    console.log(`-----------------------------------------------------------------`);
    console.log(`📦 Full Google Ads Result Object:`);
    console.log(JSON.stringify(result, (key, value) => typeof value === "bigint" ? value.toString() : value, 2));

    // Attach selected shared negative lists if present in campaign plan / state
    const createdCampaignId = result?.campaign?.googleAdsCampaignId || result?.campaignId || result?.campaign?.id;
    const sharedSetIdsToAttach = Array.isArray((plan as any)?.keywordsConfig?.linkedSharedNegativeSetIds)
      ? (plan as any).keywordsConfig.linkedSharedNegativeSetIds
      : (Array.isArray(state?.linkedSharedNegativeSetIds) ? state.linkedSharedNegativeSetIds : []);

    if (createdCampaignId && sharedSetIdsToAttach.length > 0) {
      console.log(`🔗 Attaching ${sharedSetIdsToAttach.length} user-approved shared negative lists to campaign ${createdCampaignId}...`);
      for (const setId of sharedSetIdsToAttach) {
        try {
          await GoogleAdsSharedSetService.attachListToCampaign(
            orgId,
            cleanCid,
            String(setId),
            String(createdCampaignId)
          );
          console.log(`   ✅ Attached shared set ${setId} to campaign ${createdCampaignId}`);
        } catch (setAttachErr: any) {
          console.warn(`   ⚠️ Warning attaching shared set ${setId} to campaign ${createdCampaignId}:`, setAttachErr.message);
        }
      }
    }
    console.log(`=================================================================\n`);

    const safeCreationResult = {
      campaignId: String(createdCampaignId || "N/A"),
      campaignName: String(campaignName || "AI Campaign"),
      campaignType: String(state.campaignType || "SEARCH"),
      customerId: String(cleanCid),
      budget: budgetType === "TOTAL" && totalBudget !== undefined ? Number(totalBudget) : Number(dailyBudget || 0),
      dailyBudget: Number(dailyBudget || 0),
      budgetType: String(budgetType || "DAILY"),
      totalBudget: totalBudget !== undefined ? Number(totalBudget) : undefined,
      startDate: state.startDate ? String(state.startDate).split("T")[0] : null,
      endDate: state.endDate ? String(state.endDate).split("T")[0] : null,
      locations: Array.isArray(locations) ? locations : [],
      languages: Array.isArray(languages) ? languages : ["All languages"],
      biddingStrategy: String(anyState?.biddingStrategy || anyState?.biddingFocus || "Maximize conversions"),
      targetCpa: anyState?.targetCpa !== undefined && anyState?.targetCpa !== null && anyState?.targetCpa !== "" ? Number(anyState.targetCpa) : undefined,
      targetRoas: anyState?.targetRoas !== undefined && anyState?.targetRoas !== null && anyState?.targetRoas !== "" ? Number(anyState.targetRoas) : undefined,
      finalUrl: state.website || state.finalUrl || anyState.websiteVisitsUrl || result?.campaign?.finalUrl || undefined,
      mobileFinalUrl: anyState.mobileFinalUrl || undefined,
      businessName: state.businessName || undefined,
      displayPath1: anyState.displayPath1 || state.displayPath1 || undefined,
      displayPath2: anyState.displayPath2 || state.displayPath2 || undefined,
      trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
      finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
      customParameters: anyState.customParameters || state.customParameters || undefined,
      headlines: Array.isArray(validHeadlines) && validHeadlines.length > 0 ? validHeadlines : (result?.campaign?.headlines || undefined),
      longHeadlines: Array.isArray(validLongHeadlines) && validLongHeadlines.length > 0 ? validLongHeadlines : undefined,
      descriptions: Array.isArray(validDescriptions) && validDescriptions.length > 0 ? validDescriptions : (result?.campaign?.descriptions || undefined),
      images: Array.isArray(state.images) && state.images.length > 0 ? state.images : undefined,
      logos: Array.isArray(state.logos) && state.logos.length > 0 ? state.logos : undefined,
      videos: Array.isArray(state.videos) && state.videos.length > 0 ? state.videos : undefined,
      searchThemes: Array.isArray(anyState.searchThemes) && anyState.searchThemes.length > 0 ? anyState.searchThemes : (result?.campaign?.searchThemes || undefined),
      audienceSignals: plan?.targeting?.audienceSignalIds?.length
        ? plan.targeting.audienceSignalIds
        : (state?.audienceSignalIds?.length
          ? state.audienceSignalIds
          : (Array.isArray(anyState.audienceSignals) && anyState.audienceSignals.length > 0 ? anyState.audienceSignals : undefined)),
      devices: normalizedDevices,
      sitelinks: Array.isArray(anyState.sitelinks) && anyState.sitelinks.length > 0 ? anyState.sitelinks : undefined,
      callouts: Array.isArray(anyState.callouts) && anyState.callouts.length > 0 ? anyState.callouts : undefined,
      structuredSnippets: Array.isArray(anyState.structuredSnippets) && anyState.structuredSnippets.length > 0 ? anyState.structuredSnippets : undefined,
      callAsset: anyState.callAsset || (anyState.callPhoneNumber ? { phoneNumber: anyState.callPhoneNumber } : undefined),
      leadForms: Array.isArray(anyState.leadForms) && anyState.leadForms.length > 0 ? anyState.leadForms : undefined,
      promotions: Array.isArray(anyState.promotions) && anyState.promotions.length > 0 ? anyState.promotions : undefined,
      prices: Array.isArray(anyState.prices) && anyState.prices.length > 0 ? anyState.prices : undefined,
      messages: Array.isArray(anyState.messages) && anyState.messages.length > 0 ? anyState.messages : undefined,
      merchantCenterId: state.merchantCenterId || state.merchantId || anyState.merchantCenterId || anyState.merchantId || undefined,
      feedLabel: state.feedLabel || anyState.feedLabel || undefined,
      salesCountry: state.salesCountry || anyState.salesCountry || undefined,
      customerAcquisitionMode: state.customerAcquisitionMode || anyState.customerAcquisitionMode || undefined,
      brandGuidelinesEnabled: anyState.brandGuidelinesEnabled !== undefined ? Boolean(anyState.brandGuidelinesEnabled) : undefined,
      assetGroupName: anyState.assetGroupName || undefined,
      conversionGoals: state.conversionGoals || anyState.conversionGoals || undefined,
      adSchedule: Array.isArray(anyState.adSchedule) && anyState.adSchedule.length > 0 ? anyState.adSchedule : (result?.campaign?.adSchedule || undefined),
      status: "SUCCESS",
      createdAt: new Date().toISOString(),
      resourceName: result?.campaign?.resourceName || result?.resourceName || undefined,
      budgetResourceName: result?.budgetResourceName || result?.campaign?.budgetResourceName || undefined
    };

    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim()) {
      idempotencyCache.set(idempotencyKey.trim(), {
        status: "SUCCESS",
        result: safeCreationResult,
        message: `Campaign "${campaignName}" created successfully!`,
        timestamp: Date.now()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Campaign "${campaignName}" created successfully!`,
      result: safeCreationResult,
      notices: extensionNotices.length > 0 ? extensionNotices : undefined
    });
  } catch (error: any) {
    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim()) {
      // Mark as failed with metadata so user can retry or understand previous failure
      idempotencyCache.set(idempotencyKey.trim(), {
        status: "FAILED",
        error: error?.message || "Failed to create campaign",
        timestamp: Date.now()
      });
    }
    console.error("[AI Guided Campaign Creation Error]:", error?.response?.data || error.message);
    const errContext = { organizationId: orgId, customerId: cleanCid, currencyCode: customerCurrency || "INR" };
    const budgetErr = GoogleAdsBaseService.parseGoogleAdsBudgetError(error, errContext);
    if (budgetErr && budgetErr.isBudgetBelowMinimum) {
      return res.status(422).json({
        success: false,
        errorCode: budgetErr.errorCode,
        error: budgetErr.message,
        message: budgetErr.message,
        minimumBudgetAmountMicros: budgetErr.minimumBudgetAmountMicros,
        minimumBudgetUnits: budgetErr.minimumBudgetUnits,
        currencyCode: budgetErr.currencyCode
      });
    }
    const formattedError = GoogleAdsBaseService.formatGoogleAdsError(error, errContext);
    const errorDetails = error?.response?.data || error.message;
    return res.status(500).json({
      error: formattedError || error?.response?.data?.error?.message || error.message || "Failed to create campaign via AI Guided flow.",
      details: errorDetails
    });
  }
});
// Export AI guided routes
export default router;


