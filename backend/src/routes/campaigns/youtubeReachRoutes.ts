import { Router } from "express";
import { YoutubeVideoService } from "../../services/googleAds/youtubeReach/YoutubeVideoService";
import { YoutubeDemandGenService } from "../../services/googleAds/youtubeReach/YoutubeDemandGenService";
import { YoutubeDisplayLocalService } from "../../services/googleAds/youtubeReach/YoutubeDisplayLocalService";

const router = Router();

const validatePayload = (req: any, res: any, next: any) => {
  const { customerId, campaignName } = req.body;
  if (!customerId || !campaignName) {
    return res.status(400).json({ error: "Missing required fields: customerId, campaignName" });
  }
  next();
};

router.post("/video", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await YoutubeVideoService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/demand-gen", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await YoutubeDemandGenService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/display-local", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await YoutubeDisplayLocalService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

export default router;
