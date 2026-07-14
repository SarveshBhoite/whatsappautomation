import { Router } from "express";
import prisma from "../utils/prisma";
import { GoogleAdsService } from "../services/googleAdsService";
import axios from "axios";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// 1. POST: Launch Local Search Campaign (Creates Budget, Campaign, AdGroup, Responsive Ad, and Keywords)
router.post("/campaign/launch", async (req, res) => {
  try {
    const {
      orgId = DEFAULT_ORG_ID,
      campaignName,
      budget,
      startDate,
      endDate,
      finalUrl,
      headlines,
      descriptions,
      keywords
    } = req.body;

    if (!campaignName || !budget || !finalUrl || !headlines || !descriptions) {
      return res.status(400).json({ error: "Missing required fields for campaign launch." });
    }

    // Call GoogleAdsService to build the entire campaign structure in Google Ads API
    const result = await GoogleAdsService.launchLocalSearchCampaign({
      organizationId: orgId,
      campaignName,
      budget: Number(budget),
      startDate,
      endDate,
      finalUrl,
      headlines,
      descriptions,
      keywords: keywords || []
    });

    // Save to local database
    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        googleAdsCampaignId: result.campaignId,
        name: campaignName,
        budget: Number(budget),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: "PAUSED", // PAUSED in Google Ads initially
        headlines: headlines,
        descriptions: descriptions,
        keywords: keywords || []
      }
    });

    res.status(201).json({
      message: "Google Ads campaign created successfully",
      campaign: localCampaign,
      resourceName: result.campaignResourceName
    });
  } catch (error: any) {
    console.error("Failed to launch Google Ads campaign:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Google Ads campaign creation failed",
      details: error?.response?.data || error.message
    });
  }
});

// 2. GET: List campaigns and fetch live performance
router.get("/campaigns", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    // Fetch local campaigns from database
    const localCampaigns = await prisma.googleAdCampaign.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });

    try {
      // Attempt to pull live performance insights from Google Ads API
      const livePerformance = await GoogleAdsService.getCampaignPerformance(orgId);

      // Map live stats back to database records
      const combinedCampaigns = localCampaigns.map(lc => {
        const liveMatch = livePerformance.find((lp: any) => lp.id === lc.googleAdsCampaignId);
        return {
          ...lc,
          liveStatus: liveMatch ? liveMatch.status : lc.status,
          impressions: liveMatch ? liveMatch.impressions : 0,
          clicks: liveMatch ? liveMatch.clicks : 0,
          ctr: liveMatch ? liveMatch.ctr : "0%",
          conversions: liveMatch ? liveMatch.conversions : 0,
          cost: liveMatch ? liveMatch.cost : "0.00"
        };
      });

      return res.status(200).json(combinedCampaigns);
    } catch (apiError: any) {
      console.warn("Could not retrieve live Google Ads performance. Returning local campaigns only:", apiError.message);
      
      // Fallback: Return local database records with zeroed metrics if API call fails (e.g. invalid test customer ID)
      const fallbackCampaigns = localCampaigns.map(lc => ({
        ...lc,
        liveStatus: lc.status,
        impressions: 0,
        clicks: 0,
        ctr: "0%",
        conversions: 0,
        cost: "0.00"
      }));

      return res.status(200).json(fallbackCampaigns);
    }
  } catch (error: any) {
    console.error("Failed to fetch Google campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. POST: Generate campaign headlines and descriptions using Gemini AI
router.post("/generate-copy", async (req, res) => {
  try {
    const { businessDescription, campaignTheme, keywords } = req.body;

    if (!businessDescription || !campaignTheme) {
      return res.status(400).json({ error: "Business description and campaign theme are required." });
    }

    // Call Gemini 1.5 Flash API for low-latency ad copy generation
    // We can use a developer API key or fallback to a standard free-tier public key
    const geminiApiKey = process.env.GEMINI_API_KEY || "YOUR_FREE_GEMINI_KEY"; // Fallback placeholder or instructions
    const model = "gemini-1.5-flash";
    const prompt = `
      You are an expert Google Ads Specialist. Write high-converting headlines and descriptions for a Responsive Search Ad.
      
      Business Details: ${businessDescription}
      Campaign Theme: ${campaignTheme}
      Target Keywords: ${keywords ? keywords.join(", ") : "Local area search"}

      Google Ads limits:
      - Headlines MUST be 30 characters or less.
      - Descriptions MUST be 90 characters or less.

      Return a JSON object with two arrays:
      1. "headlines": Array of exactly 6 unique H1 headlines (each <= 30 chars).
      2. "descriptions": Array of exactly 3 unique descriptions (each <= 90 chars).

      Strictly format your response as a raw, parsable JSON string. No markdown block wrapper.
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsedCopy = JSON.parse(responseText.trim());

      res.status(200).json(parsedCopy);
    } catch (apiError: any) {
      console.warn("Gemini API generation failed. Returning default ad copy.", apiError.message);
      
      // Fallback mock ad copies if API key is not ready yet
      const fallbackCopy = {
        headlines: [
          `Jisnu Digital Marketing`,
          `Affordable GMB Setup`,
          `Grow Your Business Online`,
          `Top Agency in Pune`,
          `Get More Customer Leads`,
          `Best SEO Services`
        ],
        descriptions: [
          `Boost your Google My Business rankings and attract local customer calls today.`,
          `Full service GMB and social media setup. Partner with Pune's top digital agency.`,
          `Professional local SEO, reviews optimization, and automated Google ad services.`
        ]
      };

      res.status(200).json(fallbackCopy);
    }
  } catch (error: any) {
    console.error("Ad Copy generation failed:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
