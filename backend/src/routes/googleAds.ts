import { Router } from "express";
import prisma from "../utils/prisma";
import { GoogleAdsService } from "../services/googleAdsService";
import axios from "axios";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.GROQ_KEY || "";

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET: List accessible Google Ads customer accounts linked via OAuth
// ─────────────────────────────────────────────────────────────────────────────
router.get("/accessible-customers", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const config = await prisma.googleBusinessConfig.findUnique({ where: { organizationId: orgId } });

    if (!config?.googleRefreshToken) {
      return res.status(400).json({ error: "Google account not connected. Please complete OAuth first." });
    }

    const { getGoogleAccessToken } = await import("../services/gmbSyncService");
    const accessToken = await getGoogleAccessToken(
      process.env.GOOGLE_CLIENT_ID || "",
      process.env.GOOGLE_CLIENT_SECRET || "",
      config.googleRefreshToken
    );

    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
    const listRes = await axios.get(
      "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": devToken,
          "Content-Type": "application/json"
        }
      }
    );

    const resourceNames: string[] = listRes.data.resourceNames || [];
    // Extract numeric IDs from "customers/XXXXXXXXXX"
    const customerIds = resourceNames.map((rn: string) => rn.split("/")[1]);

    res.status(200).json({ customerIds, resourceNames });
  } catch (error: any) {
    console.error("Failed to list accessible customers:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST: Save / update the Google Ads Customer ID for this org
// ─────────────────────────────────────────────────────────────────────────────
router.post("/connect-customer", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: "customerId is required" });

    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: { googleAdsCustomerId: customerId },
      create: {
        organizationId: orgId,
        googleAdsCustomerId: customerId,
        locationName: "",
        autoReplyEnabled: false,
        autoReplyMinRating: 4
      }
    });

    res.status(200).json({ message: "Google Ads Customer ID saved successfully", customerId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST: Launch a full Local Search Campaign (Budget → Campaign → AdGroup → Ad → Keywords)
// ─────────────────────────────────────────────────────────────────────────────
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

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        googleAdsCampaignId: result.campaignId,
        name: campaignName,
        budget: Number(budget),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: "PAUSED",
        headlines,
        descriptions,
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET: List campaigns with live Google Ads performance data
// ─────────────────────────────────────────────────────────────────────────────
router.get("/campaigns", async (req, res) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;

    const localCampaigns = await prisma.googleAdCampaign.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });

    try {
      const livePerformance = await GoogleAdsService.getCampaignPerformance(orgId);

      // Auto-upsert any campaigns from Google Ads to our local DB so they exist in CRM and can be toggled
      for (const lp of livePerformance) {
        const existing = localCampaigns.find(lc => lc.googleAdsCampaignId === String(lp.id));
        if (!existing) {
          try {
            const created = await prisma.googleAdCampaign.create({
              data: {
                organizationId: orgId,
                googleAdsCampaignId: String(lp.id),
                name: lp.name,
                budget: 0, // Placeholder budget
                startDate: new Date(),
                status: lp.status,
                headlines: [],
                descriptions: [],
                keywords: []
              }
            });
            localCampaigns.push(created);
            console.log(`[Sync] Auto-created local campaign record for Google Ads Campaign: ${lp.name} (${lp.id})`);
          } catch (createErr: any) {
            console.error(`[Sync] Failed to auto-create local campaign record:`, createErr.message);
          }
        } else if (existing.name !== lp.name || existing.status !== lp.status) {
          // Keep local name & status updated in case they changed it on Google Ads dashboard
          try {
            const updated = await prisma.googleAdCampaign.update({
              where: { id: existing.id },
              data: {
                name: lp.name,
                status: lp.status
              }
            });
            const index = localCampaigns.findIndex(lc => lc.id === existing.id);
            if (index !== -1) localCampaigns[index] = updated;
          } catch (updateErr: any) {
            console.error(`[Sync] Failed to update local campaign record:`, updateErr.message);
          }
        }
      }

      const combinedCampaigns = localCampaigns.map(lc => {
        const liveMatch = livePerformance.find((lp: any) => String(lp.id) === lc.googleAdsCampaignId);
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
      console.warn("Live Google Ads performance unavailable. Returning local campaigns:", apiError.message);
      const fallback = localCampaigns.map(lc => ({
        ...lc,
        liveStatus: lc.status,
        impressions: 0,
        clicks: 0,
        ctr: "0%",
        conversions: 0,
        cost: "0.00"
      }));
      return res.status(200).json(fallback);
    }
  } catch (error: any) {
    console.error("Failed to fetch Google campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST: Toggle campaign status (ENABLED ↔ PAUSED) in Google Ads + local DB
// ─────────────────────────────────────────────────────────────────────────────
router.post("/campaign/status", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, campaignId, status } = req.body;
    if (!campaignId || !status) return res.status(400).json({ error: "campaignId and status are required" });
    if (!["ENABLED", "PAUSED"].includes(status)) return res.status(400).json({ error: "status must be ENABLED or PAUSED" });

    // Update in Google Ads API
    const { headers, customerId } = await (GoogleAdsService as any).getAdsHeaders(orgId);
    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: campaignId, organizationId: orgId } });
    if (!campaign?.googleAdsCampaignId) return res.status(404).json({ error: "Campaign not found" });

    await axios.post(
      `https://googleads.googleapis.com/v17/customers/${customerId}/campaigns:mutate`,
      {
        operations: [{
          update: {
            resourceName: `customers/${customerId}/campaigns/${campaign.googleAdsCampaignId}`,
            status
          },
          updateMask: "status"
        }]
      },
      { headers }
    );

    // Update local DB
    const updated = await prisma.googleAdCampaign.update({
      where: { id: campaignId },
      data: { status }
    });

    res.status(200).json({ message: `Campaign ${status.toLowerCase()} successfully`, campaign: updated });
  } catch (error: any) {
    console.error("Failed to toggle campaign status:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. POST: Generate campaign ad copy using Groq Llama-3.3-70b
// ─────────────────────────────────────────────────────────────────────────────
router.post("/generate-copy", async (req, res) => {
  try {
    const { businessDescription, campaignTheme, targetLocation, keywords } = req.body;

    if (!businessDescription || !campaignTheme) {
      return res.status(400).json({ error: "businessDescription and campaignTheme are required." });
    }

    const prompt = `You are an expert Google Ads specialist with 10+ years of experience writing high-converting Responsive Search Ads.

Write compelling ad copy for a Google Search campaign with these details:
- Business: ${businessDescription}
- Campaign Goal / Theme: ${campaignTheme}
- Target Location: ${targetLocation || "Local area"}
- Seed Keywords: ${keywords ? (Array.isArray(keywords) ? keywords.join(", ") : keywords) : "local search"}

STRICT Google Ads character limits:
- Each headline: MAXIMUM 30 characters (including spaces)
- Each description: MAXIMUM 90 characters (including spaces)

Requirements:
1. Generate exactly 6 unique headlines (max 30 chars each) — include the primary keyword in at least 2 headlines
2. Generate exactly 3 unique descriptions (max 90 chars each) — include a clear call to action
3. Generate exactly 10 relevant keyword suggestions (broad to specific)
4. Verify every headline is under 30 characters before including it
5. Verify every description is under 90 characters before including it

Return ONLY a raw JSON object (no markdown, no explanation):
{
  "headlines": ["...", "...", "...", "...", "...", "..."],
  "descriptions": ["...", "...", "..."],
  "keywords": ["...", "...", "...", "...", "...", "...", "...", "...", "...", "..."]
}`;

    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          max_tokens: 800
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_KEY}`
          }
        }
      );

      const raw = response.data?.choices?.[0]?.message?.content || "{}";
      // Strip any markdown code fences if present
      const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
      const parsed = JSON.parse(cleaned);

      // Enforce character limits — truncate any overflowing copies
      const safeHeadlines = (parsed.headlines || []).map((h: string) => h.substring(0, 30));
      const safeDescriptions = (parsed.descriptions || []).map((d: string) => d.substring(0, 90));

      res.status(200).json({
        headlines: safeHeadlines,
        descriptions: safeDescriptions,
        keywords: parsed.keywords || []
      });
    } catch (groqErr: any) {
      console.error("Groq copy generation failed:", groqErr?.response?.data || groqErr.message);
      res.status(500).json({ error: "AI copy generation failed. Please try again." });
    }
  } catch (error: any) {
    console.error("Ad Copy generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
