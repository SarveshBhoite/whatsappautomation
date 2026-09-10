import { Router } from "express";
import { GoogleAdsAiAssistantService, CampaignState } from "../../services/googleAds/GoogleAdsAiAssistantService";
import { GoogleAdsImageGenService } from "../../services/googleAds/GoogleAdsImageGenService";
import { GoogleAdsCampaignValidator } from "../../services/googleAds/shared/GoogleAdsCampaignValidator";
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

const router = Router();

// POST /api/ads/ai-guided/analyze-url
router.post("/analyze-url", async (req, res) => {
  const { url } = req.body;
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

    // Derive business name from title or hostname
    let derivedBusinessName = "";
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

    // Generate real Search & PMax ad copy and purchase-intent keywords from website content
    let headlines: string[] = [];
    let longHeadlines: string[] = [];
    let descriptions: string[] = [];
    let keywords: string[] = [];

    const groqKey = process.env.GROQ_KEY || "";
    if (groqKey) {
      try {
        const prompt = `Extract authentic Google Ads Search & Performance Max ad copy and high purchase-intent keywords from this website content.
Website URL: ${url}
Page Title: ${analysis.title || ""}
Meta Description: ${analysis.description || ""}
Headings: ${(analysis.headings || []).join(" | ")}
Website Snippet: ${(analysis.mainTextSnippet || "").slice(0, 1000)}

Rules:
1. Business Name: max 25 characters
2. Headlines: exactly 3 to 7 distinct, punchy headlines, each <= 30 characters
3. Long Headlines: 1 to 2 long headlines, each <= 90 characters
4. Descriptions: 2 to 4 distinct descriptions, each <= 90 characters
5. Keywords: 5 to 10 highly relevant search/purchase-intent keywords based strictly on the actual products/services on this website. Include standard plain keywords or match types ([exact], "phrase").
6. Only extract genuine claims, offerings, and value propositions found in the website content. Do not hallucinate fake products or claims.

Return JSON format:
{
  "businessName": "string",
  "headlines": ["string"],
  "longHeadlines": ["string"],
  "descriptions": ["string"],
  "keywords": ["string"]
}`;

        const groqRes = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a Google Ads specialist extracting ad copy and keywords from verified website content. Return ONLY JSON." },
              { role: "user", content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 800,
            response_format: { type: "json_object" }
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`
            },
            timeout: 10000
          }
        );

        const copyData = JSON.parse(groqRes.data?.choices?.[0]?.message?.content || "{}");
        if (copyData.businessName && typeof copyData.businessName === "string" && copyData.businessName.length <= 25) {
          derivedBusinessName = copyData.businessName.trim();
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
        console.warn("[AI-GUIDED] Groq copy extraction from website failed, using heuristic extraction:", gErr.message);
      }
    }

    // Heuristic fallback extraction if Groq copy was not generated
    if (headlines.length < 3) {
      const candidates: string[] = [];
      if (analysis.title) candidates.push(analysis.title.slice(0, 30));
      if (analysis.headings) {
        for (const h of analysis.headings) {
          if (h.length <= 30 && !candidates.includes(h)) candidates.push(h);
        }
      }
      if (derivedBusinessName && !candidates.includes(derivedBusinessName)) {
        candidates.unshift(derivedBusinessName.slice(0, 30));
      }
      headlines = candidates.slice(0, 5);
    }

    if (longHeadlines.length < 1) {
      if (analysis.description && analysis.description.length <= 90) {
        longHeadlines.push(analysis.description);
      } else if (analysis.title && analysis.title.length > 30) {
        longHeadlines.push(analysis.title.slice(0, 90));
      }
    }

    if (descriptions.length < 2) {
      if (analysis.description) {
        descriptions.push(analysis.description.slice(0, 90));
      }
      if (analysis.mainTextSnippet) {
        const sentences = analysis.mainTextSnippet.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length >= 20 && s.length <= 90);
        for (const s of sentences) {
          if (!descriptions.includes(s) && descriptions.length < 4) {
            descriptions.push(s);
          }
        }
      }
    }

    // Heuristic keywords fallback if keywords not yet generated
    if (keywords.length < 3) {
      const kwSet = new Set<string>();
      if (derivedBusinessName) kwSet.add(derivedBusinessName.toLowerCase());
      if (analysis.headings) {
        for (const h of analysis.headings) {
          const cleanH = h.replace(/[^a-zA-Z0-9\s]/g, "").trim().toLowerCase();
          if (cleanH.length >= 4 && cleanH.length <= 40 && !cleanH.includes("http")) {
            kwSet.add(cleanH);
          }
        }
      }
      keywords = Array.from(kwSet).slice(0, 8);
    }

    return res.status(200).json({
      ...analysis,
      derivedBusinessName: derivedBusinessName.slice(0, 25),
      headlines,
      longHeadlines,
      descriptions,
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
        fieldType
      });
    }

    // Fallback if no ImageKit credentials configured in dev
    return res.status(200).json({
      success: true,
      url: typeof file === "string" && file.startsWith("http") ? file : "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
      name,
      fieldType
    });
  } catch (error: any) {
    console.error("[AI Guided upload-media error]:", error?.response?.data || error.message);
    return res.status(500).json({
      error: error?.response?.data?.message || error.message || "Failed to upload media"
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
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;

    if (!customerId) {
      return res.status(400).json({ error: "Missing customerId" });
    }
    if (!campaignState || !campaignState.campaignType) {
      return res.status(400).json({ error: "Missing campaignState or campaignType" });
    }

    const state: CampaignState = campaignState;
    const valResult = GoogleAdsCampaignValidator.validate(state);
    if (!valResult.isValid) {
      return res.status(400).json({
        error: "Campaign validation failed. Missing required assets or configuration.",
        validationErrors: valResult.errors,
        missingFields: valResult.missingSummary
      });
    }

    const campaignName = state.campaignName || `${state.businessName || "My Business"} - ${state.campaignType}`;
    const dailyBudget = Number(state.dailyBudget);
    const locations = (state.locations && state.locations.length > 0) ? state.locations : ["India"];
    const languages = [state.language || "English"];

    const validHeadlines = (state.headlines || []).filter(h => h && h.trim().length > 0);
    const validDescriptions = (state.descriptions || []).filter(d => d && d.trim().length > 0);
    const validKeywords = (state.keywords || []).filter(k => k && k.trim().length > 0);

    let result: any;
    const objective = (state.objective || "SALES").toUpperCase();

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
        const payload = {
          source: "AI_GUIDED",
          isAiGuided: true,
          campaignName,
          finalUrl: state.website || state.finalUrl,
          businessName: state.businessName,
          dailyBudget,
          locations,
          languages,
          biddingFocus: state.biddingStrategy || (objective === "LEADS" ? "Maximize conversions" : "Maximize conversion value"),
          targetCpa: state.targetCpa || undefined,
          targetRoas: state.targetRoas || undefined,
          headlines: validHeadlines,
          longHeadlines: state.longHeadlines && state.longHeadlines.length > 0 ? state.longHeadlines : [],
          descriptions: validDescriptions,
          images: state.images || [],
          logos: state.logos || [],
          brandLogos: state.logos || [],
          assetGroupName: `${state.businessName || (objective === "WEBSITE_TRAFFIC" ? "Website Traffic" : objective === "LEADS" ? "Leads" : (objective === "LOCAL" || objective === "STORE_VISITS") ? "Store Visits" : objective === "NO_GUIDANCE" ? "All Channels" : "Sales")} - ${objective === "WEBSITE_TRAFFIC" ? "Traffic Growth" : objective === "LEADS" ? "Lead Generation" : (objective === "LOCAL" || objective === "STORE_VISITS") ? "Store Visits" : objective === "NO_GUIDANCE" ? "Performance Max" : "Sales Growth"}`,
          startDate: state.startDate,
          endDate: state.endDate,
          euPolitical: state.euPolitical || "NO"
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
          brandGuidelines: anyState.brandGuidelines || undefined,
          adSchedule: anyState.adSchedule || anyState.adScheduleList || [],
          mobileFinalUrl: anyState.mobileFinalUrl || undefined,
          deviceTargeting: anyState.deviceTargeting || "ALL",
          devices: anyState.devices || [],
          sitelinks: anyState.sitelinks || [],
          callouts: anyState.callouts || [],
          structuredSnippets: anyState.structuredSnippets || [],
          promotions: anyState.promotions || [],
          audience: anyState.audience || undefined,
          customerAcquisitionMode: anyState.customerAcquisitionMode || undefined,
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
        const payload = {
          campaignName,
          finalUrl: state.website || "https://www.google.com",
          businessName: state.businessName || "My Business",
          dailyBudget,
          locations,
          languages,
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          biddingFocus: state.biddingStrategy || "Maximize conversions",
          targetCpa: state.targetCpa || undefined,
          targetRoas: state.targetRoas || undefined,
          startDate: state.startDate,
          endDate: state.endDate,
          adFormat: state.adFormat || "SINGLE_IMAGE",
          channelTargeting: state.channelTargeting || "ALL",
          channels: state.channels || [],
          carouselCards: state.carouselCards || [],
          callToAction: state.callToAction || "Automated",
          youtubeVideos: state.videos && state.videos.length > 0 ? state.videos : [],
          headlines: validHeadlines.length > 0 ? validHeadlines : ["Watch Video Now", "Explore Solutions"],
          longHeadlines: state.longHeadlines && state.longHeadlines.length > 0 ? state.longHeadlines : [validHeadlines[0] || "Watch Video Now and Explore Solutions"],
          descriptions: validDescriptions.length > 0 ? validDescriptions : ["Discover how our solutions help your business succeed."],
          images: state.images && state.images.length > 0 ? state.images : [],
          logos: state.logos && state.logos.length > 0 ? state.logos : [],
          videos: state.videos && state.videos.length > 0 ? state.videos : [],
          euPolitical: state.euPolitical || "NO"
        };
        if (objective === "LEADS") {
          result = await LeadsVideoService.createCampaign(orgId, customerId, payload);
        } else if (objective === "WEBSITE_TRAFFIC") {
          result = await WebsiteTrafficVideoService.createCampaign(orgId, customerId, payload);
        } else if (objective === "AWARENESS") {
          result = await YoutubeVideoService.createCampaign(orgId, customerId, payload);
        } else if (objective === "NO_GUIDANCE") {
          result = await NoGuidanceVideoService.createCampaign(orgId, customerId, payload);
        } else {
          result = await SalesVideoService.createCampaign(orgId, customerId, payload);
        }
        break;
      }

      case "APP": {
        const payload = {
          campaignName,
          platform: state.platform || (state.appStore === "APPLE_APP_STORE" ? "IOS" : "ANDROID"),
          appId: state.appId,
          appName: state.appName || undefined,
          businessName: state.businessName || undefined,
          locations,
          languages,
          headlines: validHeadlines,
          descriptions: validDescriptions,
          targetCpa: state.targetCpa,
          dailyBudget: Number(state.dailyBudget),
          euPolitical: state.euPolitical || "NO",
          images: (state as any).images || (state as any).marketingImages || [],
          videos: (state as any).videos || (state as any).youtubeVideos || []
        };
        result = await AppPromotionAppService.createCampaign(orgId, customerId, payload);
        break;
      }

      case "SHOPPING": {
        const payload = {
          campaignName,
          finalUrl: state.website || state.finalUrl,
          merchantCenterId: state.merchantCenterId || state.merchantId,
          salesCountry: state.salesCountry || "IN",
          feedLabel: state.feedLabel || state.salesCountry || "IN",
          dailyBudget,
          locations,
          languages,
          biddingStrategy: state.biddingStrategy,
          biddingFocus: state.biddingStrategy,
          targetRoas: state.targetRoas || undefined,
          maxCpcLimit: state.maxCpcLimit || undefined,
          campaignPriority: state.campaignPriority || "LOW",
          customerAcquisitionMode: state.customerAcquisitionMode || "ALL_CUSTOMERS",
          localProducts: Boolean(state.localProducts || state.enableLocalProducts),
          adGroupName: state.adGroupName || "Ad group 1",
          adGroupBid: state.adGroupBid || undefined,
          productGroupFilter: state.productGroupFilter || "Use all products",
          productGroupSelectBy: state.productGroupSelectBy || undefined,
          productGroupCustomLabel: state.productGroupCustomLabel || undefined,
          trackingTemplate: state.trackingTemplate || undefined,
          finalUrlSuffix: state.finalUrlSuffix || undefined,
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

    return res.status(200).json({
      success: true,
      message: `Campaign "${campaignName}" created successfully!`,
      result
    });
  } catch (error: any) {
    console.error("[AI Guided Campaign Creation Error]:", error?.response?.data || error.message);
    const errorDetails = error?.response?.data || error.message;
    return res.status(500).json({
      error: error?.response?.data?.error?.message || error.message || "Failed to create campaign via AI Guided flow.",
      details: errorDetails
    });
  }
});

export default router;
