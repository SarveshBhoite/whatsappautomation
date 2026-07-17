import { Router } from "express";
import prisma from "../utils/prisma";
import { GoogleAdsService } from "../services/googleAdsService";
import axios from "axios";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.GROQ_KEY || "";

// Helper: parse orgId from query or body
const getOrgId = (req: any) => (req.query.orgId || req.body?.orgId || DEFAULT_ORG_ID) as string;
const getCustomerId = (req: any) => (req.query.customerId || req.body?.customerId || "") as string;

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTS (MCC-aware)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/ads/accessible-customers
 * Lists all account resource names accessible to this OAuth token.
 */
router.get("/accessible-customers", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const resourceNames = await GoogleAdsService.listAccessibleCustomers(orgId);
    const customerIds = resourceNames.map((rn: string) => rn.split("/")[1]);
    res.status(200).json({ customerIds, resourceNames });
  } catch (error: any) {
    console.error("Failed to list accessible customers:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * POST /api/ads/setup-manager
 * MCC onboarding: saves the manager account and auto-discovers all sub-accounts.
 * Body: { managerCustomerId: "5617051013" }
 */
router.post("/setup-manager", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, managerCustomerId } = req.body;
    const managerId = (managerCustomerId || "").replace(/-/g, "").trim();
    if (!managerId) return res.status(400).json({ error: "managerCustomerId is required" });

    // 1. Save manager ID to config (used as login-customer-id for all API calls)
    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: { googleAdsCustomerId: managerId },
      create: { organizationId: orgId, googleAdsCustomerId: managerId, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4 }
    });

    // 2. Save manager account record
    await prisma.googleAdAccount.upsert({
      where: { organizationId_customerId: { organizationId: orgId, customerId: managerId } },
      update: { isManager: true },
      create: { organizationId: orgId, customerId: managerId, name: `Manager (${managerId})`, isManager: true }
    });

    // 3. Fetch all sub-accounts via customer_client GAQL
    let subAccounts: any[] = [];
    try {
      subAccounts = await GoogleAdsService.listSubAccounts(orgId, managerId);
    } catch (subErr: any) {
      console.warn("Could not list sub-accounts:", subErr.message);
    }

    // 4. Save each sub-account
    const savedAccounts: any[] = [];
    for (const acc of subAccounts) {
      const cidStr = String(acc.customerId);
      if (cidStr === managerId) {
        // Update manager name from the GAQL response
        await prisma.googleAdAccount.update({
          where: { organizationId_customerId: { organizationId: orgId, customerId: managerId } },
          data: { name: acc.name, currencyCode: acc.currencyCode, timeZone: acc.timeZone }
        }).catch(() => {});
        continue;
      }
      try {
        const saved = await prisma.googleAdAccount.upsert({
          where: { organizationId_customerId: { organizationId: orgId, customerId: cidStr } },
          update: { name: acc.name, currencyCode: acc.currencyCode, timeZone: acc.timeZone, isManager: acc.isManager },
          create: { organizationId: orgId, customerId: cidStr, name: acc.name, currencyCode: acc.currencyCode, timeZone: acc.timeZone, isManager: acc.isManager }
        });
        savedAccounts.push(saved);
      } catch { /* skip */ }
    }

    res.status(200).json({
      message: "Manager account setup complete",
      managerCustomerId: managerId,
      subAccountsFound: savedAccounts.length,
      subAccounts: savedAccounts
    });
  } catch (error: any) {
    console.error("Setup manager error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * GET /api/ads/sub-accounts?managerCustomerId=XXX
 * Live-fetch sub-accounts from Google Ads API for a given manager.
 */
router.get("/sub-accounts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const managerCustomerId = req.query.managerCustomerId as string;
    if (!managerCustomerId) return res.status(400).json({ error: "managerCustomerId required" });
    const subAccounts = await GoogleAdsService.listSubAccounts(orgId, managerCustomerId);
    res.status(200).json(subAccounts);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * POST /api/ads/connect-customer
 * Add/register a specific client account for this org.
 * Body: { customerId, name?, currencyCode?, timeZone?, isManager? }
 */
router.post("/connect-customer", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, customerId, name, currencyCode, timeZone, isManager } = req.body;
    if (!customerId) return res.status(400).json({ error: "customerId is required" });
    const cidClean = customerId.replace(/-/g, "");

    // If saving a manager account, also update the config
    if (isManager) {
      await prisma.googleBusinessConfig.upsert({
        where: { organizationId: orgId },
        update: { googleAdsCustomerId: cidClean },
        create: { organizationId: orgId, googleAdsCustomerId: cidClean, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4 }
      });
    }

    const saved = await prisma.googleAdAccount.upsert({
      where: { organizationId_customerId: { organizationId: orgId, customerId: cidClean } },
      update: { name: name || `Account ${cidClean}`, currencyCode, timeZone, isManager: isManager || false, isActive: true },
      create: { organizationId: orgId, customerId: cidClean, name: name || `Account ${cidClean}`, currencyCode, timeZone, isManager: isManager || false }
    });

    res.status(200).json({ message: "Account connected", account: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ads/select-account
 * Sets the active Google Ads customer ID for the organization.
 * Body: { customerId }
 */
router.post("/select-account", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: "customerId is required" });
    const cidClean = customerId.replace(/-/g, "");

    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: { googleAdsCustomerId: cidClean },
      create: { organizationId: orgId, googleAdsCustomerId: cidClean, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4 }
    });

    res.status(200).json({ message: "Active account updated successfully", customerId: cidClean });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ads/accounts
 * List all saved accounts for this org. Manager account comes first.
 */
router.get("/accounts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const accounts = await prisma.googleAdAccount.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: [{ isManager: "desc" }, { createdAt: "asc" }]
    });
    res.status(200).json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ads/customer-info — Get live account info from Google Ads API
 */
router.get("/customer-info", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId query param required" });
    const info = await GoogleAdsService.getCustomerInfo(orgId, customerId);
    res.status(200).json(info);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// BUDGETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/budgets
router.get("/budgets", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const budgets = await GoogleAdsService.listBudgets(orgId, customerId);
    res.status(200).json(budgets);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/budgets
router.post("/budgets", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, amountPerDay, deliveryMethod, shared } = req.body;
    if (!customerId || !amountPerDay) return res.status(400).json({ error: "customerId and amountPerDay required" });
    const resourceName = await GoogleAdsService.createBudget(orgId, customerId, { name, amountPerDay: Number(amountPerDay), deliveryMethod, shared });
    res.status(201).json({ message: "Budget created", resourceName });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/budgets/:budgetId — update budget amount
router.put("/budgets/:budgetId", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, amountPerDay, resourceName: explicitResourceName } = req.body;
    const resourceName = explicitResourceName || `customers/${customerId}/campaignBudgets/${req.params.budgetId}`;
    const result = await GoogleAdsService.updateBudget(orgId, customerId, resourceName, Number(amountPerDay));
    res.status(200).json({ message: "Budget updated", result });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGNS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/campaigns — list campaigns with live performance
router.get("/campaigns", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);

    // Get from DB first
    const whereClause: any = { organizationId: orgId };
    if (customerId) whereClause.customerId = customerId;
    const localCampaigns = await prisma.googleAdCampaign.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });

    if (!customerId) return res.status(200).json(localCampaigns);

    try {
      const livePerformance = await GoogleAdsService.getCampaignPerformance(orgId, customerId);

      // Auto-sync any Google campaigns not in DB
      for (const lp of livePerformance) {
        const existing = localCampaigns.find(lc => lc.googleAdsCampaignId === String(lp.id));
        if (!existing) {
          try {
            const created = await prisma.googleAdCampaign.create({
              data: {
                organizationId: orgId,
                customerId,
                googleAdsCampaignId: String(lp.id),
                name: lp.name,
                campaignType: lp.channelType || "SEARCH",
                biddingStrategy: lp.biddingStrategy,
                budget: lp.budgetAmountMicros ? Number(lp.budgetAmountMicros) / 1_000_000 : 0,
                budgetResourceName: lp.budgetResourceName,
                startDate: lp.startDate ? new Date(lp.startDate) : new Date(),
                status: lp.status,
                headlines: [],
                descriptions: [],
                keywords: []
              }
            });
            localCampaigns.push(created);
          } catch { /* skip */ }
        } else {
          // Sync name/status/budget
          const needsUpdate = existing.name !== lp.name || existing.status !== lp.status;
          if (needsUpdate) {
            try {
              await prisma.googleAdCampaign.update({
                where: { id: existing.id },
                data: { name: lp.name, status: lp.status, biddingStrategy: lp.biddingStrategy }
              });
            } catch { /* skip */ }
          }
        }
      }

      const combined = localCampaigns.map(lc => {
        const lm = livePerformance.find((lp: any) => String(lp.id) === lc.googleAdsCampaignId);
        return { ...lc, live: lm || null, impressions: lm?.impressions || 0, clicks: lm?.clicks || 0, ctr: lm?.ctr || "0%", conversions: lm?.conversions || 0, cost: lm?.cost || "0.00", avgCpc: lm?.avgCpc || "0.00" };
      });

      res.status(200).json(combined);
    } catch (apiErr: any) {
      console.warn("Live data unavailable, returning local:", apiErr.message);
      res.status(200).json(localCampaigns.map(lc => ({ ...lc, live: null, impressions: 0, clicks: 0, ctr: "0%", conversions: 0, cost: "0.00" })));
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ads/campaign/launch — full campaign creation wizard
router.post("/campaign/launch", async (req, res) => {
  try {
    const {
      orgId = DEFAULT_ORG_ID, customerId, campaignName, budget,
      channelType, biddingStrategy, targetCpa, targetRoas,
      startDate, endDate, finalUrl, headlines, descriptions, keywords,
      geoTargetIds, networkDisplay
    } = req.body;

    if (!customerId || !campaignName || !budget || !finalUrl || !headlines || !descriptions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await GoogleAdsService.launchLocalSearchCampaign({
      organizationId: orgId, customerId,
      campaignName, budget: Number(budget),
      channelType, biddingStrategy, targetCpa: targetCpa ? Number(targetCpa) : undefined,
      targetRoas: targetRoas ? Number(targetRoas) : undefined,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate, finalUrl, headlines, descriptions, keywords: keywords || [],
      geoTargetIds, networkDisplay
    });

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: result.campaignId || null,
        name: campaignName,
        campaignType: channelType || "SEARCH",
        biddingStrategy: biddingStrategy || "MANUAL_CPC",
        budget: Number(budget),
        budgetResourceName: result.budgetResourceName,
        startDate: new Date(startDate || new Date()),
        endDate: endDate ? new Date(endDate) : null,
        status: "PAUSED",
        finalUrl,
        headlines, descriptions, keywords: keywords || [],
        geoTargets: geoTargetIds || []
      }
    });

    res.status(201).json({ message: "Campaign launched successfully!", campaign: localCampaign, resourceNames: result });
  } catch (error: any) {
    console.error("Campaign launch error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/campaigns/:id — update campaign
router.put("/campaigns/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, status, endDate } = req.body;
    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const cid = customerId || campaign.customerId;
    if (campaign.googleAdsCampaignId) {
      const resourceName = `customers/${cid}/campaigns/${campaign.googleAdsCampaignId}`;
      await GoogleAdsService.updateCampaign(orgId, cid, resourceName, { name, status, endDate });
    }

    const updated = await prisma.googleAdCampaign.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(status && { status }), ...(endDate && { endDate: new Date(endDate) }) }
    });
    res.status(200).json({ message: "Campaign updated", campaign: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaign/status — toggle enabled/paused
router.post("/campaign/status", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, campaignId, customerId, status } = req.body;
    if (!campaignId || !status) return res.status(400).json({ error: "campaignId and status required" });
    if (!["ENABLED", "PAUSED"].includes(status)) return res.status(400).json({ error: "status must be ENABLED or PAUSED" });

    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: campaignId, organizationId: orgId } });
    if (!campaign?.googleAdsCampaignId) return res.status(404).json({ error: "Campaign not found" });

    const cid = customerId || campaign.customerId;
    const resourceName = `customers/${cid}/campaigns/${campaign.googleAdsCampaignId}`;
    await GoogleAdsService.updateCampaign(orgId, cid, resourceName, { status });

    const updated = await prisma.googleAdCampaign.update({ where: { id: campaignId }, data: { status } });
    res.status(200).json({ message: `Campaign ${status.toLowerCase()} successfully`, campaign: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/campaigns/:id
router.delete("/campaigns/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const cid = customerId || campaign.customerId;
    if (campaign.googleAdsCampaignId) {
      const resourceName = `customers/${cid}/campaigns/${campaign.googleAdsCampaignId}`;
      await GoogleAdsService.removeCampaign(orgId, cid, resourceName);
    }

    await prisma.googleAdCampaign.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Campaign removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AD GROUPS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/ad-groups
router.get("/ad-groups", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const campaignId = req.query.campaignId as string;
    if (!customerId) return res.status(400).json({ error: "customerId required" });

    const adGroups = await GoogleAdsService.listAdGroups(orgId, customerId, campaignId);

    // Sync to local DB
    for (const ag of adGroups) {
      try {
        // Find local campaign
        const localCampaign = campaignId
          ? await prisma.googleAdCampaign.findFirst({ where: { googleAdsCampaignId: campaignId, organizationId: orgId } })
          : null;

        if (localCampaign) {
          await prisma.googleAdGroup.upsert({
            where: { googleAdGroupId: ag.id },
            update: { name: ag.name, status: ag.status },
            create: {
              organizationId: orgId,
              campaignId: localCampaign.id,
              customerId,
              googleAdGroupId: ag.id,
              googleCampaignId: campaignId,
              name: ag.name,
              status: ag.status,
              adGroupType: ag.type || "SEARCH_STANDARD"
            }
          });
        }
      } catch { /* skip */ }
    }

    res.status(200).json(adGroups);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/ad-groups
router.post("/ad-groups", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignId, campaignResourceName, name, type, cpcBid } = req.body;
    if (!customerId || !name || !campaignResourceName) return res.status(400).json({ error: "customerId, name, campaignResourceName required" });

    const adGroupRef = await GoogleAdsService.createAdGroup(orgId, customerId, {
      name, campaignResourceName, type,
      cpcBidMicros: cpcBid ? Math.round(Number(cpcBid) * 1_000_000) : undefined
    });

    const adGroupId = adGroupRef?.split("/").pop();

    // Save to local DB
    if (campaignId && adGroupId) {
      await prisma.googleAdGroup.create({
        data: {
          organizationId: orgId,
          campaignId,
          customerId,
          googleAdGroupId: adGroupId,
          googleCampaignId: campaignResourceName.split("/").pop(),
          name,
          status: "ENABLED",
          adGroupType: type || "SEARCH_STANDARD"
        }
      });
    }

    res.status(201).json({ message: "Ad Group created", resourceName: adGroupRef, adGroupId });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/ad-groups/:id
router.put("/ad-groups/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, status, cpcBid } = req.body;
    const localAg = await prisma.googleAdGroup.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAg) return res.status(404).json({ error: "Ad Group not found" });

    const cid = customerId || localAg.customerId;
    const resourceName = `customers/${cid}/adGroups/${localAg.googleAdGroupId}`;
    await GoogleAdsService.updateAdGroup(orgId, cid, resourceName, {
      name, status,
      cpcBidMicros: cpcBid ? Math.round(Number(cpcBid) * 1_000_000) : undefined
    });

    const updated = await prisma.googleAdGroup.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(status && { status }) }
    });
    res.status(200).json({ message: "Ad Group updated", adGroup: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/ad-groups/:id
router.delete("/ad-groups/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const localAg = await prisma.googleAdGroup.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAg) return res.status(404).json({ error: "Ad Group not found" });

    const cid = customerId || localAg.customerId;
    if (localAg.googleAdGroupId) {
      await GoogleAdsService.removeAdGroup(orgId, cid, `customers/${cid}/adGroups/${localAg.googleAdGroupId}`);
    }
    await prisma.googleAdGroup.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Ad Group removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/ads
router.get("/ads", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const adGroupId = req.query.adGroupId as string;
    if (!customerId) return res.status(400).json({ error: "customerId required" });

    const ads = await GoogleAdsService.listAds(orgId, customerId, adGroupId);
    res.status(200).json(ads);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/ads
router.post("/ads", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, adGroupId, adGroupResourceName, finalUrls, headlines, descriptions, path1, path2 } = req.body;
    if (!customerId || !adGroupResourceName || !finalUrls || !headlines || !descriptions) {
      return res.status(400).json({ error: "customerId, adGroupResourceName, finalUrls, headlines, descriptions required" });
    }

    const adRef = await GoogleAdsService.createAd(orgId, customerId, {
      adGroupResourceName, finalUrls,
      headlines: headlines.map((h: string | object) => typeof h === "string" ? { text: h } : h),
      descriptions: descriptions.map((d: string | object) => typeof d === "string" ? { text: d } : d),
      path1, path2
    });

    // Save to local DB
    if (adGroupId) {
      const localAg = await prisma.googleAdGroup.findFirst({ where: { googleAdGroupId: adGroupId, organizationId: orgId } });
      if (localAg) {
        await prisma.googleAd.create({
          data: {
            organizationId: orgId,
            adGroupId: localAg.id,
            customerId,
            googleAdId: adRef?.split("/").pop(),
            googleAdGroupId: adGroupId,
            status: "ENABLED",
            headlines,
            descriptions,
            finalUrls,
            path1, path2
          }
        });
      }
    }

    res.status(201).json({ message: "Ad created", resourceName: adRef });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/ads/:id
router.put("/ads/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, adGroupId, status, finalUrls } = req.body;
    const localAd = await prisma.googleAd.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAd) return res.status(404).json({ error: "Ad not found" });

    const cid = customerId || localAd.customerId;
    const adResourceName = `customers/${cid}/adGroupAds/${localAd.googleAdGroupId}~${localAd.googleAdId}`;
    await GoogleAdsService.updateAd(orgId, cid, adResourceName, { status, finalUrls });

    const updated = await prisma.googleAd.update({ where: { id: req.params.id }, data: { ...(status && { status }), ...(finalUrls && { finalUrls }) } });
    res.status(200).json({ message: "Ad updated", ad: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/ads/:id
router.delete("/ads/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const localAd = await prisma.googleAd.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAd) return res.status(404).json({ error: "Ad not found" });

    const cid = customerId || localAd.customerId;
    if (localAd.googleAdGroupId && localAd.googleAdId) {
      await GoogleAdsService.removeAd(orgId, cid, `customers/${cid}/adGroupAds/${localAd.googleAdGroupId}~${localAd.googleAdId}`);
    }
    await prisma.googleAd.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Ad removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORDS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/keywords
router.get("/keywords", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const adGroupId = req.query.adGroupId as string;
    const includeNegatives = req.query.includeNegatives !== "false";
    if (!customerId) return res.status(400).json({ error: "customerId required" });

    const keywords = await GoogleAdsService.listKeywords(orgId, customerId, adGroupId, includeNegatives);
    res.status(200).json(keywords);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/keywords
router.post("/keywords", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, adGroupId, adGroupResourceName, keywords } = req.body;
    if (!customerId || !adGroupResourceName || !keywords?.length) {
      return res.status(400).json({ error: "customerId, adGroupResourceName, and keywords array required" });
    }

    const results = await GoogleAdsService.addKeywords(orgId, customerId, adGroupResourceName, keywords);

    // Sync to local DB
    const localAg = await prisma.googleAdGroup.findFirst({ where: { googleAdGroupId: adGroupId, organizationId: orgId } });
    if (localAg) {
      for (let i = 0; i < keywords.length; i++) {
        const kw = keywords[i];
        const kwId = results[i]?.resourceName?.split("/").pop();
        await prisma.googleAdKeyword.create({
          data: {
            organizationId: orgId,
            adGroupId: localAg.id,
            customerId,
            googleKeywordId: kwId,
            googleAdGroupId: adGroupId,
            text: kw.text,
            matchType: kw.matchType || "BROAD",
            isNegative: kw.isNegative || false,
            status: "ENABLED"
          }
        }).catch(() => {});
      }
    }

    res.status(201).json({ message: "Keywords added", results });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/keywords/:id
router.put("/keywords/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, status, cpcBid } = req.body;
    const kw = await prisma.googleAdKeyword.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!kw) return res.status(404).json({ error: "Keyword not found" });

    const cid = customerId || kw.customerId;
    const resourceName = `customers/${cid}/adGroupCriteria/${kw.googleAdGroupId}~${kw.googleKeywordId}`;
    await GoogleAdsService.updateKeyword(orgId, cid, resourceName, {
      status,
      cpcBidMicros: cpcBid ? Math.round(Number(cpcBid) * 1_000_000) : undefined
    });

    const updated = await prisma.googleAdKeyword.update({ where: { id: req.params.id }, data: { ...(status && { status }) } });
    res.status(200).json({ message: "Keyword updated", keyword: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/keywords/:id
router.delete("/keywords/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const kw = await prisma.googleAdKeyword.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!kw) return res.status(404).json({ error: "Keyword not found" });

    const cid = customerId || kw.customerId;
    if (kw.googleAdGroupId && kw.googleKeywordId) {
      await GoogleAdsService.removeKeyword(orgId, cid, `customers/${cid}/adGroupCriteria/${kw.googleAdGroupId}~${kw.googleKeywordId}`);
    }
    await prisma.googleAdKeyword.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Keyword removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// EXTENSIONS / ASSETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/extensions
router.get("/extensions", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const extensions = await GoogleAdsService.listExtensions(orgId, customerId);
    res.status(200).json(extensions);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/extensions/sitelinks
router.post("/extensions/sitelinks", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignResourceName, sitelinks } = req.body;
    if (!customerId || !campaignResourceName || !sitelinks?.length) {
      return res.status(400).json({ error: "customerId, campaignResourceName, sitelinks required" });
    }
    const refs = await GoogleAdsService.createSitelinkExtension(orgId, customerId, campaignResourceName, sitelinks);
    res.status(201).json({ message: "Sitelinks created", resourceNames: refs });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/extensions/callouts
router.post("/extensions/callouts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignResourceName, callouts } = req.body;
    if (!customerId || !campaignResourceName || !callouts?.length) {
      return res.status(400).json({ error: "customerId, campaignResourceName, callouts required" });
    }
    const refs = await GoogleAdsService.createCalloutExtension(orgId, customerId, campaignResourceName, callouts);
    res.status(201).json({ message: "Callouts created", resourceNames: refs });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSIONS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/conversions
router.get("/conversions", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const conversions = await GoogleAdsService.listConversions(orgId, customerId);
    res.status(200).json(conversions);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/conversions
router.post("/conversions", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, category, value, countingType, lookbackDays } = req.body;
    if (!customerId || !name || !category) return res.status(400).json({ error: "customerId, name, category required" });
    const resourceName = await GoogleAdsService.createConversion(orgId, customerId, { name, category, value, countingType, lookbackDays });
    res.status(201).json({ message: "Conversion action created", resourceName });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIENCES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/audiences
router.get("/audiences", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const audiences = await GoogleAdsService.listAudiences(orgId, customerId);
    res.status(200).json(audiences);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GEO TARGETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/geo-targets/search
router.get("/geo-targets/search", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const query = req.query.q as string;
    if (!customerId || !query) return res.status(400).json({ error: "customerId and q required" });
    const results = await GoogleAdsService.searchGeoTargets(orgId, customerId, query);
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/geo-targets
router.post("/geo-targets", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignResourceName, geoTargetIds } = req.body;
    if (!customerId || !campaignResourceName || !geoTargetIds?.length) {
      return res.status(400).json({ error: "customerId, campaignResourceName, geoTargetIds required" });
    }
    const results = await GoogleAdsService.addGeoTargets(orgId, customerId, campaignResourceName, geoTargetIds);
    res.status(201).json({ message: "Geo targets added", results });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE REPORTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/reports/overview
router.get("/reports/overview", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const overview = await GoogleAdsService.getAccountOverview(orgId, customerId, dateRange);
    res.status(200).json(overview);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// GET /api/ads/reports/daily
router.get("/reports/daily", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const data = await GoogleAdsService.getPerformanceByDate(orgId, customerId, dateRange);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// GET /api/ads/reports/search-terms
router.get("/reports/search-terms", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const data = await GoogleAdsService.getSearchTermsReport(orgId, customerId, dateRange);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// GET /api/ads/reports/ads
router.get("/reports/ads", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const data = await GoogleAdsService.getAdPerformanceReport(orgId, customerId, dateRange);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AI COPY GENERATION
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ads/generate-copy — AI-generated RSA headlines, descriptions, keywords
router.post("/generate-copy", async (req, res) => {
  try {
    const { businessDescription, campaignTheme, targetLocation, keywords, campaignType } = req.body;

    if (!businessDescription || !campaignTheme) {
      return res.status(400).json({ error: "businessDescription and campaignTheme are required." });
    }

    const prompt = `You are an expert Google Ads specialist with 10+ years experience writing high-converting ${campaignType || "Search"} ads.

Write compelling ad copy for a Google ${campaignType || "Search"} campaign:
- Business: ${businessDescription}
- Goal/Theme: ${campaignTheme}
- Target Location: ${targetLocation || "Local area"}
- Seed Keywords: ${keywords ? (Array.isArray(keywords) ? keywords.join(", ") : keywords) : "local search"}

STRICT Google Ads character limits:
- Headlines: MAXIMUM 30 characters each (including spaces)
- Descriptions: MAXIMUM 90 characters each

Requirements:
1. Generate exactly 15 unique headlines (max 30 chars each) — include primary keyword in at least 3
2. Generate exactly 4 unique descriptions (max 90 chars each) — with clear CTAs
3. Generate exactly 15 relevant keywords (mix of broad, phrase [in quotes], exact [in brackets])
4. Generate 5 sitelink suggestions (linkText: max 25 chars, description1: max 35 chars, description2: max 35 chars)
5. Generate 5 callout text suggestions (max 25 chars each)
6. Double-check ALL character limits before responding

Return ONLY a raw JSON object (no markdown, no explanation):
{
  "headlines": ["...(max 30 chars)..."],
  "descriptions": ["...(max 90 chars)..."],
  "keywords": ["keyword1", "\\"phrase match\\"", "[exact match]"],
  "sitelinks": [{"linkText": "...", "description1": "...", "description2": "...", "url": ""}],
  "callouts": ["...", "..."]
}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.65,
        max_tokens: 1500
      },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` } }
    );

    const raw = response.data?.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json({
      headlines: (parsed.headlines || []).map((h: string) => h.substring(0, 30)),
      descriptions: (parsed.descriptions || []).map((d: string) => d.substring(0, 90)),
      keywords: parsed.keywords || [],
      sitelinks: parsed.sitelinks || [],
      callouts: parsed.callouts || []
    });
  } catch (error: any) {
    console.error("Ad copy generation error:", error?.response?.data || error.message);
    res.status(500).json({ error: "AI copy generation failed. Please try again." });
  }
});

// POST /api/ads/generate-keywords — AI keyword expansion
router.post("/generate-keywords", async (req, res) => {
  try {
    const { seedKeywords, businessDescription, targetLocation } = req.body;
    if (!seedKeywords?.length) return res.status(400).json({ error: "seedKeywords required" });

    const prompt = `You are a Google Ads keyword research expert.

Expand these seed keywords for a Google Ads campaign:
Seeds: ${Array.isArray(seedKeywords) ? seedKeywords.join(", ") : seedKeywords}
Business: ${businessDescription || ""}
Location: ${targetLocation || ""}

Generate 30 highly relevant keywords in all 3 match types:
- 10 broad match (just the keyword)
- 10 phrase match (in "quotes")
- 10 exact match (in [brackets])

Focus on: commercial intent, local search, problem-solving queries.

Return ONLY a JSON array of strings (no markdown):
["keyword1", "\\"phrase match\\"", "[exact match]", ...]`;

    const response = await axios.post(
      GROQ_API_URL,
      { model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.5, max_tokens: 800 },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` } }
    );

    const raw = response.data?.choices?.[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    const keywords = JSON.parse(cleaned);

    res.status(200).json({ keywords: Array.isArray(keywords) ? keywords : [] });
  } catch (error: any) {
    res.status(500).json({ error: "Keyword generation failed." });
  }
});

// POST /api/ads/analyze-campaign — AI campaign health analysis
router.post("/analyze-campaign", async (req, res) => {
  try {
    const { campaignData, adGroups, keywords, searchTerms } = req.body;
    if (!campaignData) return res.status(400).json({ error: "campaignData required" });

    const prompt = `You are a Google Ads expert analyzing campaign performance.

Campaign: ${JSON.stringify(campaignData)}
${adGroups ? `Ad Groups: ${JSON.stringify(adGroups).substring(0, 500)}` : ""}
${keywords ? `Top Keywords: ${JSON.stringify(keywords).substring(0, 500)}` : ""}
${searchTerms ? `Search Terms: ${JSON.stringify(searchTerms).substring(0, 500)}` : ""}

Provide an expert analysis with:
1. Overall performance assessment (score 1-10)
2. Top 3 strengths
3. Top 3 issues found
4. 5 specific optimization recommendations (with exact actions)
5. Suggested bid adjustments
6. Negative keyword suggestions based on search terms

Return ONLY a JSON object:
{
  "score": 7,
  "assessment": "...",
  "strengths": ["...", "...", "..."],
  "issues": ["...", "...", "..."],
  "recommendations": [{"title": "...", "action": "...", "impact": "HIGH/MEDIUM/LOW"}],
  "bidAdjustments": ["..."],
  "negativeKeywords": ["..."]
}`;

    const response = await axios.post(
      GROQ_API_URL,
      { model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.4, max_tokens: 1200 },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` } }
    );

    const raw = response.data?.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    const analysis = JSON.parse(cleaned);

    res.status(200).json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: "Campaign analysis failed." });
  }
});

export default router;
