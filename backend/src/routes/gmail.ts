import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import axios from "axios";
import { 
  syncGmailThreads, 
  sendGmailReply, 
  generateGmailAiDraft, 
  getGmailAccessToken,
  updateGmailThreadLabels,
  deleteGmailThreadViaApi
} from "../services/gmailService";
import { io } from "../index";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Helper to resolve org ID from request headers
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || DEFAULT_ORG_ID;
};

// GET: Fetch Gmail configuration settings
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    let config = await prisma.gmailConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      config = await prisma.gmailConfig.create({
        data: {
          organizationId,
          emailAddress: "",
          accessToken: "",
          refreshToken: "",
          autoReplyEnabled: false,
          autoReplyTemplate: "You are a helpful customer support agent. Answer questions politely and offer solutions.",
        },
      });
    }

    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching Gmail config:", error);
    return res.status(500).json({ error: "Failed to fetch Gmail config", details: error.message });
  }
});

// POST: Update Gmail Config settings
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { autoReplyEnabled, autoReplyTemplate, emailAddress } = req.body;

    const config = await prisma.gmailConfig.upsert({
      where: { organizationId },
      update: {
        autoReplyEnabled,
        autoReplyTemplate,
        emailAddress,
      },
      create: {
        organizationId,
        autoReplyEnabled: autoReplyEnabled || false,
        autoReplyTemplate: autoReplyTemplate || "",
        emailAddress: emailAddress || "",
        accessToken: "",
        refreshToken: "",
      },
    });

    return res.status(200).json({ message: "Gmail configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating Gmail config:", error);
    return res.status(500).json({ error: "Failed to update Gmail config", details: error.message });
  }
});

// GET: Redirect to Google OAuth for Gmail scope
router.get("/oauth/connect", (req: Request, res: Response) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const redirectPath = (req.query.redirect as string) || "/gmail";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    // Callback URI registered in Google Console for Gmail
    const redirectUri = process.env.GMAIL_REDIRECT_URI || "http://localhost:5000/api/gmail/oauth/callback";

    if (!clientId) {
      return res.status(400).send("GOOGLE_CLIENT_ID is not configured in backend .env");
    }

    // Gmail modify scope (read, send, update labels) plus metadata info
    const scopes = [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ");
    
    const statePayload = JSON.stringify({ orgId, redirect: redirectPath });
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(statePayload)}`;
    
    res.redirect(oauthUrl);
  } catch (error: any) {
    res.status(500).send(`OAuth redirection error: ${error.message}`);
  }
});

// GET: Handle Google OAuth Callback code swap
router.get("/oauth/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const stateStr = req.query.state as string;
  
  let orgId = DEFAULT_ORG_ID;
  let redirectPath = "/gmail";

  if (stateStr) {
    try {
      const parsed = JSON.parse(stateStr);
      orgId = parsed.orgId || DEFAULT_ORG_ID;
      redirectPath = parsed.redirect || "/gmail";
    } catch {
      orgId = stateStr;
    }
  }

  if (!code) {
    return res.status(400).send("No authorization code returned from Google");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || "http://localhost:5000/api/gmail/oauth/callback";

  if (!clientId || !clientSecret) {
    return res.status(500).send("Google OAuth keys missing in backend .env");
  }

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });

    const { refresh_token, access_token } = tokenRes.data;

    // Fetch user's Gmail address
    let emailAddress = "";
    try {
      const emailRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      emailAddress = emailRes.data.email || "";
    } catch (profileErr: any) {
      console.warn("Could not retrieve user email automatically:", profileErr.message);
    }

    // Save tokens in database
    await prisma.gmailConfig.upsert({
      where: { organizationId: orgId },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token || undefined,
        emailAddress: emailAddress || undefined
      },
      create: {
        organizationId: orgId,
        accessToken: access_token,
        refreshToken: refresh_token || "",
        emailAddress: emailAddress || "",
        autoReplyEnabled: false,
        autoReplyTemplate: "You are a helpful customer support agent. Answer questions politely and offer solutions."
      }
    });

    // Sync threads immediately on success
    try {
      await syncGmailThreads(orgId, io);
    } catch (syncErr) {
      console.warn("OAuth initial sync failed:", syncErr);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=success&platform=gmail`);
  } catch (error: any) {
    console.error("Gmail OAuth Callback Error:", error?.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=error&platform=gmail`);
  }
});

// GET: List all threads and message histories with label support
router.get("/threads", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const label = ((req.query.label as string) || "INBOX").toUpperCase();

    let whereClause: any = { organizationId };

    if (label === "STARRED") {
      whereClause.isStarred = true;
    } else if (label === "SPAM") {
      whereClause.label = "SPAM";
    } else if (label === "TRASH") {
      whereClause.label = "TRASH";
    } else if (label === "SENT") {
      whereClause.label = "SENT";
    } else {
      // Default INBOX: show non-spam, non-trash inbox threads
      whereClause.label = "INBOX";
    }

    const threads = await prisma.gmailThread.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            attachments: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return res.status(200).json(threads);
  } catch (error: any) {
    console.error("Error fetching Gmail threads:", error);
    return res.status(500).json({ error: "Failed to fetch Gmail threads", details: error.message });
  }
});

// POST: Toggle Star on a thread
router.post("/threads/:threadId/star", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const threadId = req.params.threadId as string;
    const { isStarred } = req.body;

    const thread = await prisma.gmailThread.update({
      where: { threadId },
      data: { isStarred: Boolean(isStarred) }
    });

    // Sync with Google Gmail REST API
    try {
      const addLabels = isStarred ? ["STARRED"] : [];
      const removeLabels = isStarred ? [] : ["STARRED"];
      await updateGmailThreadLabels(organizationId, threadId, addLabels, removeLabels);
    } catch (apiErr: any) {
      console.warn(`[GMAIL API] Could not sync star status to Gmail API for thread ${threadId}:`, apiErr.message);
    }

    return res.status(200).json({ success: true, isStarred: thread.isStarred });
  } catch (error: any) {
    console.error("Error toggling star:", error);
    return res.status(500).json({ error: "Failed to update star status", details: error.message });
  }
});

// POST: Mark thread as Spam or move back to Inbox
router.post("/threads/:threadId/spam", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const threadId = req.params.threadId as string;
    const { isSpam } = req.body;

    const newLabel = isSpam ? "SPAM" : "INBOX";
    const thread = await prisma.gmailThread.update({
      where: { threadId },
      data: { isSpam: Boolean(isSpam), label: newLabel }
    });

    // Sync with Google Gmail REST API
    try {
      const addLabels = isSpam ? ["SPAM"] : ["INBOX"];
      const removeLabels = isSpam ? ["INBOX"] : ["SPAM"];
      await updateGmailThreadLabels(organizationId, threadId, addLabels, removeLabels);
    } catch (apiErr: any) {
      console.warn(`[GMAIL API] Could not sync spam status to Gmail API for thread ${threadId}:`, apiErr.message);
    }

    return res.status(200).json({ success: true, isSpam: thread.isSpam, label: thread.label });
  } catch (error: any) {
    console.error("Error toggling spam:", error);
    return res.status(500).json({ error: "Failed to update spam status", details: error.message });
  }
});

// DELETE: Move thread to Trash or permanently delete
router.delete("/threads/:threadId", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const threadId = req.params.threadId as string;

    const thread = await prisma.gmailThread.findUnique({
      where: { threadId }
    });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    if (thread.label === "TRASH") {
      // Permanently delete from local DB
      await prisma.gmailThread.delete({
        where: { threadId }
      });

      // Sync permanent delete to Google Gmail API
      try {
        await deleteGmailThreadViaApi(organizationId, threadId, true);
      } catch (apiErr: any) {
        console.warn(`[GMAIL API] Permanent delete failed on Gmail API for thread ${threadId}:`, apiErr.message);
      }

      return res.status(200).json({ success: true, message: "Thread permanently deleted" });
    } else {
      // Move to Trash folder locally
      await prisma.gmailThread.update({
        where: { threadId },
        data: { label: "TRASH" }
      });

      // Sync trash operation to Google Gmail API
      try {
        await deleteGmailThreadViaApi(organizationId, threadId, false);
      } catch (apiErr: any) {
        console.warn(`[GMAIL API] Trash sync failed on Gmail API for thread ${threadId}:`, apiErr.message);
      }

      return res.status(200).json({ success: true, message: "Thread moved to Trash" });
    }
  } catch (error: any) {
    console.error("Error deleting thread:", error);
    return res.status(500).json({ error: "Failed to delete thread", details: error.message });
  }
});

// POST: Trigger Manual/Approved reply on a thread
router.post("/reply", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { threadId, replyText } = req.body;

    if (!threadId || !replyText) {
      return res.status(400).json({ error: "Thread ID and reply text are required." });
    }

    const result = await sendGmailReply(organizationId, threadId, replyText);

    // Update status to REPLIED
    await prisma.gmailThread.update({
      where: { threadId },
      data: { status: "REPLIED" }
    });

    return res.status(200).json({ success: true, message: "Reply sent successfully", data: result });
  } catch (error: any) {
    console.error("Error sending Gmail reply:", error);
    return res.status(500).json({ error: "Failed to send Gmail reply", details: error.message });
  }
});

// GET: Single thread with messages
router.get("/threads/:threadId", async (req: Request, res: Response) => {
  try {
    const threadId = req.params.threadId as string;
    const thread = await prisma.gmailThread.findUnique({
      where: { threadId },
      include: {
        messages: {
          include: { attachments: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.status(200).json(thread);
  } catch (error: any) {
    console.error("Error fetching single thread:", error);
    return res.status(500).json({ error: "Failed to fetch thread details", details: error.message });
  }
});

// POST: Generate on-demand AI draft reply for a thread
router.post("/threads/:threadId/ai-reply", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const threadId = req.params.threadId as string;

    const thread = await prisma.gmailThread.findUnique({
      where: { threadId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!thread || !thread.messages || thread.messages.length === 0) {
      return res.status(404).json({ error: "Thread or messages not found." });
    }

    // Find the latest inbound message
    const inboundMessages = thread.messages.filter((m: any) => m.direction === "inbound");
    const targetMsg = inboundMessages[inboundMessages.length - 1] || thread.messages[thread.messages.length - 1];

    const aiDraft = await generateGmailAiDraft(
      organizationId,
      targetMsg.content,
      thread.subject || "Inquiry",
      targetMsg.sender
    );

    if (!aiDraft) {
      return res.status(500).json({ error: "Failed to generate AI response from Groq. Check your GROQ_KEY." });
    }

    // Cache generated draft on target message
    await prisma.gmailMessage.update({
      where: { id: targetMsg.id },
      data: { aiDraft }
    });

    return res.status(200).json({ success: true, aiDraft });
  } catch (error: any) {
    console.error("Error generating on-demand AI reply:", error);
    return res.status(500).json({ error: "Failed to generate AI reply", details: error.message });
  }
});

// POST: Force manual sync of threads (supporting custom categories/labels)
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const label = (req.body.label as string) || (req.query.label as string) || "INBOX";
    const result = await syncGmailThreads(organizationId, io, label);
    return res.status(200).json({ success: true, message: "Sync completed", syncedCount: result.syncedCount });
  } catch (error: any) {
    console.error("Manual sync failed:", error);
    return res.status(500).json({ error: "Gmail sync failed", details: error.message });
  }
});

// GET: Fetch message attachment proxy
router.get("/messages/:messageId/attachments/:attachmentId", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { messageId, attachmentId } = req.params;

    const token = await getGmailAccessToken(organizationId);

    const attachmentRes = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const { data, size } = attachmentRes.data;
    if (!data) {
      return res.status(404).json({ error: "Attachment data not found from Gmail API" });
    }

    // Decode base64url to binary buffer
    const buffer = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");

    // Retrieve attachment details from DB for Content-Type and Filename
    const attachment = await prisma.gmailAttachment.findFirst({
      where: { attachmentId: attachmentId as string }
    });

    const contentType = attachment?.mimeType || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", `inline; filename="${attachment?.filename || "attachment"}"`);

    return res.send(buffer);
  } catch (error: any) {
    console.error("Error fetching Gmail attachment:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch Gmail attachment", details: error.message });
  }
});

// GET: Get all auto-reply rules
router.get("/rules", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const rules = await prisma.gmailAutoReplyRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json(rules);
  } catch (error: any) {
    console.error("Error fetching rules:", error);
    return res.status(500).json({ error: "Failed to fetch rules", details: error.message });
  }
});

// POST: Create a new auto-reply rule
router.post("/rules", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { keyword, replyText } = req.body;

    if (!keyword || !replyText) {
      return res.status(400).json({ error: "Keyword and reply text are required." });
    }

    // Ensure organization exists before creating rule relation
    await prisma.organization.upsert({
      where: { id: organizationId },
      update: {},
      create: {
        id: organizationId,
        name: "Demo Organization"
      }
    });

    const rule = await prisma.gmailAutoReplyRule.create({
      data: {
        organizationId,
        keyword,
        replyText
      }
    });

    return res.status(200).json(rule);
  } catch (error: any) {
    console.error("Error creating rule:", error);
    return res.status(500).json({ error: "Failed to create rule", details: error.message });
  }
});

// DELETE: Delete an auto-reply rule
router.delete("/rules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.gmailAutoReplyRule.delete({
      where: { id: id as string }
    });
    return res.status(200).json({ success: true, message: "Rule deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting rule:", error);
    return res.status(500).json({ error: "Failed to delete rule", details: error.message });
  }
});

export default router;
