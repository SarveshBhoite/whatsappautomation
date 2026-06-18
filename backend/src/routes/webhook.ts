import { Router } from "express";
import { verifyWebhook, handleWebhook } from "../controllers/webhookController";

const router = Router();

// GET endpoint for Meta webhook verification
router.get("/whatsapp", verifyWebhook);

// POST endpoint for receiving WhatsApp message payloads
router.post("/whatsapp", handleWebhook);

export default router;
