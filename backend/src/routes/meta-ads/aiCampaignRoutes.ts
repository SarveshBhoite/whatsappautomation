import { Router, Request, Response } from "express";
import { MetaAIConversationService } from "../../services/meta-ads/metaAIConversationService";
import { MetaCampaignExecutionService } from "../../services/meta-ads/metaCampaignExecutionService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * GET /api/meta-ads/ai/conversation/init
 * Initialize a dynamic campaign strategy session with real authenticated Meta context
 */
router.get("/ai/conversation/init", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const session = await MetaAIConversationService.getInitialSession(orgId);
    res.json({ success: true, session });
  } catch (error: any) {
    console.error("[AIRoutes] Error initializing conversation session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/ai/conversation/message
 * Process natural language user message, extract facts, update draft, and validate
 */
router.post("/ai/conversation/message", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { currentState, message, selectedOption } = req.body;

    if (!currentState) {
      return res.status(400).json({ success: false, error: "currentState is required." });
    }

    const updatedState = await MetaAIConversationService.processMessage(
      orgId,
      currentState,
      message || selectedOption || "",
      selectedOption
    );

    res.json({ success: true, state: updatedState });
  } catch (error: any) {
    console.error("[AIRoutes] Error processing conversation message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/ai/conversation/confirm-publish
 * Explicit user confirmation trigger to execute campaign on Meta Graph API
 */
router.post("/ai/conversation/confirm-publish", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { draft, executionId } = req.body;

    if (!draft) {
      return res.status(400).json({ success: false, error: "draft is required for publishing." });
    }

    const execId = executionId || `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = await MetaCampaignExecutionService.publishCampaign(orgId, draft, execId);

    res.json({ success: result.status === "SUCCESS", result });
  } catch (error: any) {
    console.error("[AIRoutes] Error confirming campaign publication:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
