import { Router } from "express";
import configRoutes from "./configRoutes";
import trafficRoutes from "./trafficRoutes";
import awarenessRoutes from "./awarenessRoutes";

const router = Router();

// Mount all modular Meta Ads sub-routes
router.use("/", configRoutes);
router.use("/", trafficRoutes);
router.use("/", awarenessRoutes);

export default router;
