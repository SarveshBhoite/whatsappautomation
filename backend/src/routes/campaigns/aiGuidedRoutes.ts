import { Router } from "express";
import { GoogleAdsAiAssistantService, CampaignState } from "../../services/googleAds/GoogleAdsAiAssistantService";
import { GoogleAdsImageGenService } from "../../services/googleAds/GoogleAdsImageGenService";
import { GoogleAdsCampaignValidator } from "../../services/googleAds/shared/GoogleAdsCampaignValidator";
import { GoogleAdsBaseService } from "../../services/googleAds/shared/GoogleAdsBaseService";
import { analyzeWebsiteUrl } from "../../services/googleAds/shared/websiteAnalyzer";
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

import prisma from "../../utils/prisma";

const router = Router();

// GET /api/ads/ai-guided/user-profile — Fetch detailed login, organization & Google Ads business profile
router.get("/user-profile", async (req, res) => {
  try {
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || "demo-org-123") as string;
    const customerId = (req.query.customerId || "") as string;

    const org = await (prisma.organization as any).findUnique({
      where: { id: orgId },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        gmbConfig: true,
        aiAgentConfig: true,
        googleAdAccounts: true,
        aiKnowledgeItems: { where: { isActive: true }, take: 5 }
      }
    });

    let currentAccount = null;
    if (org?.googleAdAccounts && customerId) {
      currentAccount = org.googleAdAccounts.find((a: any) => a.customerId === customerId.replace(/-/g, ""));
    }
    if (!currentAccount && org?.googleAdAccounts?.length) {
      currentAccount = org.googleAdAccounts[0];
    }

    const firstUser = org?.users?.[0];
    const orgName = org?.name || "";
    const gmbLocation = org?.gmbConfig?.locationName || "";
    const gmbAccount = org?.gmbConfig?.accountName || "";
    const knowledgeSnippets = org?.aiKnowledgeItems?.map((k: any) => k.content).join("\n") || "";

    const businessName = currentAccount?.name || gmbLocation || orgName || "My Business";
    const userName = firstUser?.name || firstUser?.email?.split("@")[0] || "User";

    res.status(200).json({
      success: true,
      orgId,
      organizationName: orgName,
      userName,
      userEmail: firstUser?.email || "",
      userRole: firstUser?.role || "agent",
      businessName,
      locationName: gmbLocation,
      accountName: gmbAccount,
      customerId: currentAccount?.customerId || org?.gmbConfig?.googleAdsCustomerId || customerId,
      currencyCode: currentAccount?.currencyCode || "INR",
      timeZone: currentAccount?.timeZone || "Asia/Kolkata",
      knowledgeSummary: knowledgeSnippets,
      agentGreeting: org?.aiAgentConfig?.greetingMessage || ""
    });
  } catch (error: any) {
    console.error("[AI-GUIDED] Error fetching user profile:", error);
    res.status(500).json({ error: error.message || "Failed to fetch user profile" });
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
      } catch {}
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
    const { messages = [], campaignState = {} } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
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
    const aiResponse = await GoogleAdsAiAssistantService.processChat(messages, campaignState);
    return res.status(200).json(aiResponse);
  } catch (error: any) {
    console.error("[AI Guided Route Error]:", error?.message || error);
    return res.status(500).json({
      error: "Failed to process AI chat message.",
      details: error.message
    });
  }
});

interface IdempotencyRecord {
  status: "IN_PROGRESS" | "SUCCESS" | "FAILED";
  result?: any;
  message?: string;
  timestamp: number;
}

// In-memory idempotency cache (TTL: 15 minutes)
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

// POST /api/ads/ai-guided/create-campaign
router.post("/create-campaign", async (req, res) => {
  const idempotencyKey = (req.body?.idempotencyKey || req.headers["x-idempotency-key"] || "") as string;
  try {
    const { customerId, campaignState } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim()) {
      const existing = idempotencyCache.get(idempotencyKey.trim());
      if (existing) {
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
        timestamp: Date.now()
      });
    }

    if (!customerId || !/^\d{3}-?\d{3}-?\d{4}$|^\d{10}$/.test(String(customerId).trim())) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({ error: "Invalid customerId format. Must be a 10-digit Google Ads Customer ID (e.g. '123-456-7890' or '1234567890')." });
    }
    if (!orgId) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({ error: "Missing organization ID (x-organization-id header or orgId parameter)" });
    }
    if (!campaignState || !campaignState.campaignType) {
      if (idempotencyKey) idempotencyCache.delete(idempotencyKey.trim());
      return res.status(400).json({ error: "Missing campaignState or campaignType" });
    }

    const state: CampaignState = campaignState;
    if (!state.locations || !Array.isArray(state.locations) || state.locations.filter((l: any) => l && String(l).trim()).length === 0) {
      state.locations = ["India"];
    }
    if (!state.language || !state.language.trim()) {
      state.language = "All languages";
    }

    // Auto-sanitize dates so past dates from referenced campaigns or drafts are safely moved to today
    const todayStr = new Date().toISOString().split("T")[0];
    if (!state.startDate || !String(state.startDate).trim() || String(state.startDate).trim() < todayStr) {
      state.startDate = todayStr;
    }
    if (state.endDate) {
      const rawEndDate = String(state.endDate).trim();
      if (!rawEndDate) {
        delete state.endDate;
      } else {
        const startMs = new Date(state.startDate).getTime();
        const endMs = new Date(rawEndDate).getTime();
        if (isNaN(endMs) || endMs <= startMs) {
          delete state.endDate;
        } else {
          state.endDate = rawEndDate;
        }
      }
    }

    // Ensure AI Guided flow context flags
    (state as any).isAiGuided = true;
    (state as any).source = "AI_GUIDED";

    if (state.campaignType === "PERFORMANCE_MAX" || state.campaignType === "DISPLAY") {
      const DEFAULT_IMAGE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";
      const DEFAULT_LOGO = "https://ik.imagekit.io/automationjds/tr:w-500,h-500,fo-auto/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";

      if (state.campaignType === "DISPLAY") {
        // Strip out pre-existing customer asset resource strings (which may not match 1:1 Display logo spec)
        if (Array.isArray(state.logos)) {
          state.logos = state.logos.filter((l: any) => {
            const raw = typeof l === "string" ? l : l?.url || l?.data || "";
            return raw && !raw.startsWith("customers/");
          });
        }
        if (Array.isArray(state.images)) {
          state.images = state.images.filter((im: any) => {
            const raw = typeof im === "string" ? im : im?.url || im?.data || "";
            return raw && !raw.startsWith("customers/");
          });
        }
      }

      if (!state.images || !Array.isArray(state.images) || state.images.length === 0) {
        state.images = [
          { url: DEFAULT_IMAGE, fieldType: "MARKETING_IMAGE", name: "Default_Landscape_Marketing_Image", aspectRatio: "1.91:1" },
          { url: DEFAULT_IMAGE, fieldType: "SQUARE_MARKETING_IMAGE", name: "Default_Square_Marketing_Image", aspectRatio: "1:1" }
        ];
      }
      if (!state.logos || !Array.isArray(state.logos) || state.logos.length === 0) {
        state.logos = [
          { url: DEFAULT_LOGO, fieldType: "LOGO", name: "Default_Brand_Logo", aspectRatio: "1:1" }
        ];
      }
    }

    const valResult = GoogleAdsCampaignValidator.validate(state);
    if (!valResult.isValid) {
      return res.status(400).json({
        error: "Campaign validation failed. Missing required assets or configuration.",
        validationErrors: valResult.errors,
        missingFields: valResult.missingSummary
      });
    }

    const campaignName = GoogleAdsBaseService.cleanAdText(state.campaignName || `${state.businessName} - ${state.campaignType}`, 100);
    const budgetType = (state.budgetType || "DAILY").toUpperCase() as "DAILY" | "TOTAL";
    let effectiveDailyBudget = Number(state.dailyBudget);
    const totalBudget = state.totalBudget ? Number(state.totalBudget) : (budgetType === "TOTAL" ? Number(state.dailyBudget) : undefined);

    if (budgetType === "TOTAL" && totalBudget && totalBudget > 0) {
      if (state.startDate && state.endDate) {
        const start = new Date(state.startDate).getTime();
        const end = new Date(state.endDate).getTime();
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        effectiveDailyBudget = Math.max(1, Math.round(totalBudget / days));
      } else {
        effectiveDailyBudget = Math.max(1, Math.round(totalBudget / 30));
      }
    }
    const dailyBudget = effectiveDailyBudget;
    const locations = (state.locations && state.locations.length > 0) ? state.locations : [];
    const languages = (state.language && !["all languages", "all", "any", "all_languages"].includes(state.language.trim().toLowerCase())) 
      ? [state.language] 
      : (Array.isArray(state.languages) ? state.languages.filter((l: string) => l && !["all languages", "all", "any", "all_languages"].includes(String(l).trim().toLowerCase())) : []);

    const validHeadlines = (state.headlines || [])
      .map(h => GoogleAdsBaseService.cleanAdText(String(h), 30))
      .filter(h => h.length > 0);
    const validLongHeadlines = (state.longHeadlines || [])
      .map(lh => GoogleAdsBaseService.cleanAdText(String(lh), 90))
      .filter(lh => lh.length > 0);
    const validDescriptions = (state.descriptions || [])
      .map(d => GoogleAdsBaseService.cleanAdText(String(d), 90))
      .filter(d => d.length > 0);
    const validKeywords = (state.keywords || [])
      .map(k => GoogleAdsBaseService.cleanAdText(String(k), 80))
      .filter(k => k.length > 0);

    let result: any;
    const objective = (state.objective || "").toUpperCase();

    switch (state.campaignType) {
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
          locations: (state.locations && state.locations.length > 0) ? state.locations : [],
          languages: (anyState.languages && anyState.languages.length > 0) ? anyState.languages : (state.language ? [state.language] : []),
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
          networkDisplay: anyState.networkDisplay !== undefined ? anyState.networkDisplay : (state.networkDisplay !== undefined ? state.networkDisplay : true),
          locationOptionsPresence: anyState.locationOptionsPresence || state.locationOptionsPresence || "PRESENCE_INTEREST",
          locationOptionsExclude: anyState.locationOptionsExclude || state.locationOptionsExclude || "PRESENCE",
          adRotationMode: anyState.adRotationMode || state.adRotationMode || "OPTIMIZE",
          displayPath1: anyState.displayPath1 || state.displayPath1 || undefined,
          displayPath2: anyState.displayPath2 || state.displayPath2 || undefined,
          adGroupName: anyState.adGroupName || state.adGroupName || undefined,
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          brandInclusions: anyState.brandInclusions || state.brandInclusions || [],
          brandExclusions: anyState.brandExclusions || state.brandExclusions || [],
          onlyBidNewCustomers: anyState.onlyBidNewCustomers !== undefined ? anyState.onlyBidNewCustomers : state.onlyBidNewCustomers,
          adjustLapsedCustomers: anyState.adjustLapsedCustomers !== undefined ? anyState.adjustLapsedCustomers : state.adjustLapsedCustomers,
          customerAcquisitionMode: anyState.customerAcquisitionMode || state.customerAcquisitionMode || (state.onlyBidNewCustomers ? "TARGET_NEW_CUSTOMER_ONLY" : "TARGET_ALL_EQUALLY"),
          // AI Max & Search Term Matching
          enableAiMax: anyState.enableAiMax !== undefined ? anyState.enableAiMax : (state.aiMax !== undefined ? state.aiMax : true),
          enableTextCustomization: anyState.enableTextCustomization !== undefined ? anyState.enableTextCustomization : true,
          enableFinalUrlExpansion: anyState.enableFinalUrlExpansion !== undefined ? anyState.enableFinalUrlExpansion : true,
          useSearchTermMatchingAdGroup: anyState.useSearchTermMatchingAdGroup !== undefined ? anyState.useSearchTermMatchingAdGroup : true,
          // Schedules & Extensions
          adSchedule: anyState.adSchedule || anyState.adScheduleList || [],
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          structuredSnippets: anyState.structuredSnippets || [],
          callAsset: anyState.callAsset || (anyState.callPhone ? { phoneNumber: anyState.callPhone, countryCode: anyState.callCountryCode || "IN" } : undefined),
          promotions: anyState.promotions || [],
          prices: anyState.prices || [],
          leadForms: anyState.leadForms || []
        };
        if (objective === "NO_GUIDANCE" || objective === "NO-GUIDANCE") {
          result = await NoGuidanceSearchService.createCampaign(orgId, customerId, payload);
        } else if (objective === "LEADS") {
          result = await LeadsSearchService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficSearchService.createCampaign(orgId, customerId, payload);
        } else {
          result = await SalesSearchService.createCampaign(orgId, customerId, payload);
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
          assetGroupName: anyState.assetGroupName || `${state.businessName || (objective === "WEBSITE_TRAFFIC" ? "Website Traffic" : objective === "LEADS" ? "Leads" : (objective === "LOCAL" || objective === "STORE_VISITS") ? "Store Visits" : objective === "NO_GUIDANCE" ? "All Channels" : "Sales")} - ${objective === "WEBSITE_TRAFFIC" ? "Traffic Growth" : objective === "LEADS" ? "Lead Generation" : (objective === "LOCAL" || objective === "STORE_VISITS") ? "Store Visits" : objective === "NO_GUIDANCE" ? "Performance Max" : "Sales Growth"}`,
          brandGuidelinesEnabled: Boolean(anyState.brandGuidelinesEnabled),
          startDate: state.startDate,
          endDate: state.endDate,
          euPolitical: anyState.euPolitical || "NO",
          // Enhanced Performance Max Parameters from State
          merchantCenterId: state.merchantCenterId || state.merchantId,
          merchantId: state.merchantCenterId || state.merchantId,
          feedLabel: state.feedLabel,
          salesCountry: state.salesCountry,
          customerAcquisitionMode: state.customerAcquisitionMode,
          positiveGeoTargetType: anyState.positiveGeoTargetType || anyState.locationOptionsPresence,
          negativeGeoTargetType: anyState.negativeGeoTargetType || anyState.locationOptionsExclude,
          trackingTemplate: state.trackingTemplate,
          finalUrlSuffix: state.finalUrlSuffix,
          customParameters: state.customParameters,
          displayPath1: state.displayPath1,
          displayPath2: state.displayPath2,
          mobileFinalUrl: state.mobileFinalUrl,
          searchThemes: anyState.searchThemes || [],
          audienceSignals: anyState.audienceSignals || anyState.audiences || [],
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          promotions: anyState.promotions || [],
          prices: anyState.prices || [],
          messages: anyState.messages || [],
          leadForms: anyState.leadForms || [],
          callAsset: anyState.callPhoneNumber ? { phone: anyState.callPhoneNumber, countryCode: "IN" } : anyState.callAsset,
          structuredSnippets: anyState.structuredSnippets || [],
          adSchedule: (() => {
            const rawSched = anyState.adSchedule || anyState.adScheduleList || [];
            if (!Array.isArray(rawSched)) return [];
            const seen = new Set<string>();
            return rawSched.filter((s: any) => {
              if (!s || !s.day || !s.start || !s.end) return false;
              const key = `${s.day}_${s.start}_${s.end}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          })(),
          devices: anyState.devices,
          brandExclusions: anyState.brandExclusions || anyState.createdBrandLists || [],
          demographicExclusions: anyState.demographicExclusions,
          dataExclusions: anyState.dataExclusions || anyState.selectedDataExclusions || [],
          localServicesEnabled: objective === "LOCAL" || objective === "STORE_VISITS" || objective === "STORE-VISITS"
        };
        if (objective === "NO_GUIDANCE" || objective === "NO-GUIDANCE") {
          result = await NoGuidancePerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else if (objective === "LOCAL" || objective === "STORE_VISITS" || objective === "STORE-VISITS") {
          result = await StoreVisitsPerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else if (objective === "LEADS") {
          result = await LeadsPerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficPerformanceMaxService.createCampaign(orgId, customerId, payload);
        } else {
          result = await SalesPerformanceMaxService.createCampaign(orgId, customerId, payload);
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
          dailyBudget: anyState.dailyBudget !== undefined ? Number(anyState.dailyBudget) : dailyBudget,
          budget: anyState.budget !== undefined ? Number(anyState.budget) : dailyBudget,
          locations: (state.locations && state.locations.length > 0) ? state.locations : locations,
          languages: (anyState.languages && anyState.languages.length > 0) ? anyState.languages : languages,
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
          devices: anyState.devices || [],
          adSchedule: anyState.adSchedule || anyState.adScheduleList || [],
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
          conversionGoals: anyState.conversionGoals || []
        };
        if (objective === "LEADS") {
          result = await LeadsDisplayService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC" || objective === "WEBSITE-TRAFFIC") {
          result = await WebsiteTrafficDisplayService.createCampaign(orgId, customerId, payload);
        } else if (objective === "AWARENESS" || objective === "YOUTUBE_REACH") {
          result = await YoutubeDisplayLocalService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE") {
          result = await NoGuidanceDisplayService.createCampaign(orgId, customerId, payload);
        } else {
          result = await SalesDisplayService.createCampaign(orgId, customerId, payload);
        }
        break;
      }

      case "DEMAND_GEN": {
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: state.website || state.finalUrl,
          businessName: state.businessName,
          dailyBudget: anyState.dailyBudget !== undefined ? Number(anyState.dailyBudget) : undefined,
          budget: anyState.budget !== undefined ? Number(anyState.budget) : undefined,
          demandGenBudgetType: anyState.demandGenBudgetType || "Daily",
          locations: (state.locations && state.locations.length > 0) ? state.locations : (anyState.location ? [anyState.location] : []),
          languages: (anyState.languages && anyState.languages.length > 0) ? anyState.languages : (state.language ? [state.language] : []),
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
          callToAction: state.callToAction || "Automated",
          headlines: validHeadlines,
          longHeadlines: state.longHeadlines && state.longHeadlines.length > 0 ? state.longHeadlines : (validHeadlines.length > 0 ? [validHeadlines[0]] : []),
          descriptions: validDescriptions,
          images: state.images && state.images.length > 0 ? state.images : [],
          logos: state.logos && state.logos.length > 0 ? state.logos : [],
          videos: state.videos && state.videos.length > 0 ? state.videos : [],
          euPolitical: state.euPolitical || "NO",
          includeViewThrough: anyState.includeViewThrough !== undefined ? Boolean(anyState.includeViewThrough) : false,
          mainBrandColor: anyState.mainBrandColor || state.mainBrandColor || undefined,
          accentBrandColor: anyState.accentBrandColor || state.accentBrandColor || undefined,
          brandFont: anyState.brandFont || state.brandFont || undefined,
          brandGuidelines: anyState.brandGuidelines || (state.brandGuidelinesEnabled ? {
            mainColor: anyState.mainBrandColor || state.mainBrandColor,
            accentColor: anyState.accentBrandColor || state.accentBrandColor,
            font: anyState.brandFont || state.brandFont
          } : undefined),
          // Google AI Creative Enhancements
          optAdaptiveLayouts: anyState.optAdaptiveLayouts !== undefined ? Boolean(anyState.optAdaptiveLayouts) : true,
          optAnimatedImages: anyState.optAnimatedImages !== undefined ? Boolean(anyState.optAnimatedImages) : true,
          optGeneratedVideos: anyState.optGeneratedVideos !== undefined ? Boolean(anyState.optGeneratedVideos) : true,
          optShorterVideos: anyState.optShorterVideos !== undefined ? Boolean(anyState.optShorterVideos) : true,
          optResizedVideos: anyState.optResizedVideos !== undefined ? Boolean(anyState.optResizedVideos) : true,
          optLandingPagePreviews: anyState.optLandingPagePreviews !== undefined ? Boolean(anyState.optLandingPagePreviews) : true,
          adName: anyState.adName || state.adName || undefined,
          adSchedule: anyState.adSchedule || anyState.adScheduleList || [],
          mobileFinalUrl: anyState.mobileFinalUrl || state.mobileFinalUrl || undefined,
          deviceTargeting: anyState.deviceTargeting || "ALL",
          devices: anyState.devices || [],
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || anyState.customParamsList || [],
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          structuredSnippets: anyState.structuredSnippets || [],
          promotions: anyState.promotions || [],
          audience: anyState.audience || undefined,
          customerAcquisitionMode: anyState.customerAcquisitionMode || (state.onlyBidNewCustomers ? "ONLY_NEW" : "EQUAL"),
          optimizedTargeting: anyState.optimizedTargeting !== undefined ? Boolean(anyState.optimizedTargeting) : true,
          ipExclusions: anyState.ipExclusions || undefined,
          conversionGoals: anyState.conversionGoals || []
        };
        if (objective === "LEADS") {
          result = await LeadsDemandGenService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficDemandGenService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE" || objective === "NO-GUIDANCE") {
          result = await NoGuidanceDemandGenService.createCampaign(orgId, customerId, payload);
        } else if (objective === "AWARENESS" || objective === "YOUTUBE" || objective === "YOUTUBE_REACH" || objective === "YOUTUBE-REACH") {
          result = await YoutubeDemandGenService.createCampaign(orgId, customerId, payload);
        } else {
          result = await SalesDemandGenService.createCampaign(orgId, customerId, payload);
        }
        break;
      }

      case "VIDEO": {
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: state.website || state.finalUrl,
          businessName: state.businessName,
          dailyBudget: anyState.dailyBudget !== undefined ? Number(anyState.dailyBudget) : dailyBudget,
          budget: anyState.budget !== undefined ? Number(anyState.budget) : dailyBudget,
          demandGenBudgetType: anyState.budgetType === "TOTAL" ? "Total" : (anyState.demandGenBudgetType || "Daily"),
          locations: (state.locations && state.locations.length > 0) ? state.locations : (anyState.location ? [anyState.location] : []),
          languages: (anyState.languages && anyState.languages.length > 0) ? anyState.languages : (state.language ? [state.language] : []),
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          biddingFocus: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          targetCpa: state.targetCpa || undefined,
          targetRoas: state.targetRoas || undefined,
          startDate: state.startDate,
          endDate: state.endDate,
          adFormat: state.adFormat || "SINGLE_IMAGE",
          channelTargeting: state.channelTargeting || "ALL",
          channels: state.channels || [],
          carouselCards: state.carouselCards || [],
          callToAction: state.callToAction || "Automated",
          youtubeVideos: (state.videos && state.videos.length > 0) ? state.videos : (anyState.youtubeVideos || []),
          headlines: validHeadlines.length > 0 ? validHeadlines : ["Watch Video Now", "Explore Solutions"],
          longHeadlines: state.longHeadlines && state.longHeadlines.length > 0 ? state.longHeadlines : [validHeadlines[0] || "Watch Video Now and Explore Solutions"],
          descriptions: validDescriptions.length > 0 ? validDescriptions : ["Discover how our solutions help your business succeed."],
          images: state.images && state.images.length > 0 ? state.images : [],
          logos: state.logos && state.logos.length > 0 ? state.logos : [],
          videos: state.videos && state.videos.length > 0 ? state.videos : [],
          euPolitical: state.euPolitical || "NO",
          includeViewThrough: anyState.includeViewThrough !== undefined ? Boolean(anyState.includeViewThrough) : false,
          mainBrandColor: anyState.mainBrandColor || state.mainBrandColor || undefined,
          accentBrandColor: anyState.accentBrandColor || state.accentBrandColor || undefined,
          brandFont: anyState.brandFont || state.brandFont || undefined,
          brandGuidelines: anyState.brandGuidelines || (state.brandGuidelinesEnabled ? {
            mainColor: anyState.mainBrandColor || state.mainBrandColor,
            accentColor: anyState.accentBrandColor || state.accentBrandColor,
            font: anyState.brandFont || state.brandFont
          } : undefined),
          // Google AI Creative Enhancements
          optAdaptiveLayouts: anyState.optAdaptiveLayouts !== undefined ? Boolean(anyState.optAdaptiveLayouts) : true,
          optAnimatedImages: anyState.optAnimatedImages !== undefined ? Boolean(anyState.optAnimatedImages) : true,
          optGeneratedVideos: anyState.optGeneratedVideos !== undefined ? Boolean(anyState.optGeneratedVideos) : true,
          optShorterVideos: anyState.optShorterVideos !== undefined ? Boolean(anyState.optShorterVideos) : true,
          optResizedVideos: anyState.optResizedVideos !== undefined ? Boolean(anyState.optResizedVideos) : true,
          optLandingPagePreviews: anyState.optLandingPagePreviews !== undefined ? Boolean(anyState.optLandingPagePreviews) : true,
          adName: anyState.adName || state.adName || undefined,
          adSchedule: anyState.adSchedule || anyState.adScheduleList || [],
          mobileFinalUrl: anyState.mobileFinalUrl || state.mobileFinalUrl || undefined,
          displayPath1: anyState.displayPath1 || state.displayPath1 || undefined,
          displayPath2: anyState.displayPath2 || state.displayPath2 || undefined,
          deviceTargeting: anyState.deviceTargeting || "ALL",
          devices: anyState.devices || [],
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || anyState.customParamsList || [],
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          structuredSnippets: anyState.structuredSnippets || [],
          promotions: anyState.promotions || [],
          audience: anyState.audience || undefined,
          customerAcquisitionMode: anyState.customerAcquisitionMode || (state.onlyBidNewCustomers ? "ONLY_NEW" : "EQUAL"),
          optimizedTargeting: anyState.optimizedTargeting !== undefined ? Boolean(anyState.optimizedTargeting) : true,
          ipExclusions: anyState.ipExclusions || undefined,
          conversionGoals: anyState.conversionGoals || []
        };
        if (objective === "LEADS") {
          result = await LeadsVideoService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficVideoService.createCampaign(orgId, customerId, payload);
        } else if (objective === "AWARENESS" || objective === "YOUTUBE_REACH" || objective === "YOUTUBE") {
          result = await YoutubeVideoService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE" || objective === "NO-GUIDANCE") {
          result = await NoGuidanceVideoService.createCampaign(orgId, customerId, payload);
        } else {
          result = await SalesVideoService.createCampaign(orgId, customerId, payload);
        }
        break;
      }

      case "APP": {
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          platform: state.platform || (state.appStore === "APPLE_APP_STORE" ? "IOS" : "ANDROID"),
          appId: state.appId,
          appName: state.appName || undefined,
          businessName: state.businessName || undefined,
          locations: (state.locations && state.locations.length > 0) ? state.locations : locations,
          languages: (anyState.languages && anyState.languages.length > 0) ? anyState.languages : languages,
          headlines: validHeadlines,
          descriptions: validDescriptions,
          targetCpa: state.targetCpa,
          dailyBudget: anyState.dailyBudget !== undefined ? Number(anyState.dailyBudget) : dailyBudget,
          budget: anyState.budget !== undefined ? Number(anyState.budget) : dailyBudget,
          startDate: state.startDate,
          endDate: state.endDate,
          euPolitical: state.euPolitical || "NO",
          images: (state as any).images || (state as any).marketingImages || [],
          videos: (state as any).videos || (state as any).youtubeVideos || [],
          trackingTemplate: state.trackingTemplate || anyState.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || anyState.finalUrlSuffix || undefined,
          customParameters: anyState.customParameters || anyState.customParamsList || []
        };
        result = await AppPromotionAppService.createCampaign(orgId, customerId, payload);
        break;
      }

      case "SHOPPING": {
        const anyState = state as any;
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: state.website || state.finalUrl,
          merchantCenterId: state.merchantCenterId || state.merchantId,
          salesCountry: state.salesCountry || "IN",
          feedLabel: state.feedLabel || state.salesCountry || "IN",
          dailyBudget: anyState.dailyBudget !== undefined ? Number(anyState.dailyBudget) : dailyBudget,
          budget: anyState.budget !== undefined ? Number(anyState.budget) : dailyBudget,
          budgetType: anyState.budgetType || "DAILY",
          locations: (state.locations && state.locations.length > 0) ? state.locations : locations,
          languages: (anyState.languages && anyState.languages.length > 0) ? anyState.languages : languages,
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
          adSchedule: anyState.adSchedule || anyState.adScheduleList || [],
          deviceTargeting: anyState.deviceTargeting || "ALL",
          devices: anyState.devices || [],
          startDate: state.startDate,
          endDate: state.endDate,
          headlines: validHeadlines.length > 0 ? validHeadlines : ["Shop Top Deals Now"],
          descriptions: validDescriptions.length > 0 ? validDescriptions : ["Explore our exclusive shopping collection with fast delivery and great discounts."],
          euPolitical: state.euPolitical || "NO"
        };
        if (objective === "LEADS") {
          result = await LeadsShoppingService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC" || objective === "TRAFFIC") {
          result = await WebsiteTrafficShoppingService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE" || objective === "WITHOUT_GUIDANCE") {
          result = await NoGuidanceShoppingService.createCampaign(orgId, customerId, payload);
        } else {
          result = await SalesShoppingService.createCampaign(orgId, customerId, payload);
        }
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

    // Keywords
    const kws = anyState?.keywords || validKeywords || [];
    if (kws.length > 0) {
      console.log(`-----------------------------------------------------------------`);
      console.log(`🔑 Target Keywords (${kws.length}):`);
      kws.forEach((kw: string, i: number) => console.log(`   [${i + 1}] ${kw}`));
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

    console.log(`-----------------------------------------------------------------`);
    console.log(`📦 Full Google Ads Result Object:`);
    console.log(JSON.stringify(result, (key, value) => typeof value === "bigint" ? value.toString() : value, 2));
    console.log(`=================================================================\n`);

    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim()) {
      idempotencyCache.set(idempotencyKey.trim(), {
        status: "SUCCESS",
        result,
        message: `Campaign "${campaignName}" created successfully!`,
        timestamp: Date.now()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Campaign "${campaignName}" created successfully!`,
      result
    });
  } catch (error: any) {
    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim()) {
      // Mark as failed or delete so user can retry upon genuine failure
      idempotencyCache.set(idempotencyKey.trim(), {
        status: "FAILED",
        timestamp: Date.now()
      });
    }
    console.error("[AI Guided Campaign Creation Error]:", error?.response?.data || error.message);
    const formattedError = GoogleAdsBaseService.formatGoogleAdsError(error);
    const errorDetails = error?.response?.data || error.message;
    return res.status(500).json({
      error: formattedError || error?.response?.data?.error?.message || error.message || "Failed to create campaign via AI Guided flow.",
      details: errorDetails
    });
  }
});

export default router;
