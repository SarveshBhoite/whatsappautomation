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

    const groqKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY || "";
    if (groqKey) {
      try {
        const prompt = `Analyze this verified website content to extract comprehensive Google Ads business parameters and creative assets.
Website URL: ${url}
Page Title: ${analysis.title || ""}
Meta Description: ${analysis.description || ""}
Headings: ${(analysis.headings || []).join(" | ")}
Website Snippet: ${(analysis.mainTextSnippet || "").slice(0, 1500)}

Instructions:
1. Extract authentic, verified data only from the provided text. Do not invent products or claims not mentioned.
2. Business Name: Real business/brand name (max 25 characters).
3. Industry: Specific commercial or business category (e.g., "Computer Hardware & IT Retail", "Real Estate", "SaaS").
4. Products/Services: 3 to 6 actual products or service categories offered on this website.
5. Description: 1 to 2 clear sentences describing the business value proposition (max 150 chars).
6. USP: The Unique Selling Proposition or key benefit stated on the site (e.g., "Authorized Dealer with Free Same-Day Shipping").
7. Target Audience: Intended customer demographic (e.g., "Gamers, IT professionals, and students").
8. Locations: Geographic area or country served if detected (e.g. ["India"] or ["United States"]).
9. Language: Primary website language name or code (e.g., "English", "Hindi", "Marathi", "Gujarati", "Spanish", "French", "German").
10. Headlines: 3 to 7 punchy Google Ads headlines in the website's primary language (each <= 30 characters).
11. Long Headlines: 1 to 3 long headlines in the website's primary language (each <= 90 characters).
12. Descriptions: 2 to 4 descriptions in the website's primary language (each <= 90 characters).
13. Keywords: 5 to 10 purchase-intent search keywords based strictly on actual website offerings (in primary language or relevant search terms).

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
  "keywords": ["string"]
}`;

        const groqRes = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: "You are an expert Google Ads strategist extracting verified business information and ad copy from website content. Output strictly valid JSON." },
              { role: "user", content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: "json_object" }
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`
            },
            timeout: 12000
          }
        );

        const copyData = JSON.parse(groqRes.data?.choices?.[0]?.message?.content || "{}");
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

    return res.status(200).json({
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
      keywords
    });
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

// POST /api/ads/ai-guided/create-campaign
router.post("/create-campaign", async (req, res) => {
  try {
    const { customerId, campaignState } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;

    if (!customerId) {
      return res.status(400).json({ error: "Missing customerId" });
    }
    if (!orgId) {
      return res.status(400).json({ error: "Missing organization ID (x-organization-id header or orgId parameter)" });
    }
    if (!campaignState || !campaignState.campaignType) {
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
      const DEFAULT_LOGO = "https://ik.imagekit.io/automationjds/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";

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
          biddingFocus: state.biddingStrategy || (objective === "LEADS" ? "Maximize conversions" : "Maximize conversion value"),
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

    console.log(`-----------------------------------------------------------------`);
    console.log(`📦 Full Google Ads Result Object:`);
    console.log(JSON.stringify(result, (key, value) => typeof value === "bigint" ? value.toString() : value, 2));
    console.log(`=================================================================\n`);

    return res.status(200).json({
      success: true,
      message: `Campaign "${campaignName}" created successfully!`,
      result
    });
  } catch (error: any) {
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
