import { Router } from "express";
import configRoutes from "./configRoutes";
import trafficRoutes from "./trafficRoutes";
import awarenessRoutes from "./awarenessRoutes";
import leadsRoutes from "./leadsRoutes";
import appPromotionRoutes from "./appPromotionRoutes";
import salesRoutes from "./salesRoutes";
import engagementRoutes from "./engagementRoutes";
import aiCampaignRoutes from "./aiCampaignRoutes";

const router = Router();

// Mount all modular Meta Ads sub-routes
router.use("/", configRoutes);
router.use("/", trafficRoutes);
router.use("/", awarenessRoutes);
router.use("/", leadsRoutes);
router.use("/", appPromotionRoutes);
router.use("/", salesRoutes);
router.use("/", engagementRoutes);
router.use("/", aiCampaignRoutes);

export default router;
