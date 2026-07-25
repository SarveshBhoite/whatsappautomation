import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import axios from "axios";
import { 
  syncGmailThreads, 
  sendGmailReply, 
  generateGmailAiDraft, 
  getGmailAccessToken,
  updateGmailThreadLabels,
  deleteGmailThreadViaApi,
  sendSingleBulkEmail
} from "../services/gmailService";
import multer from "multer";

const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });
const activeCampaignTasks = new Map<string, { status: "SENDING" | "PAUSED" | "CANCELLED" }>();

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Helper to resolve org ID from request headers
const getOrgId = (req: Request): string => {
  const headerVal = req.headers["x-organization-id"];
  if (Array.isArray(headerVal)) return headerVal[0] || DEFAULT_ORG_ID;
  return headerVal || DEFAULT_ORG_ID;
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
      await syncGmailThreads(orgId, (global as any).io);
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
    const result = await syncGmailThreads(organizationId, (global as any).io, label);
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

// ─── BULK EMAIL CAMPAIGN & TEMPLATE ROUTES ───────────────────────────────────

// POST: Extract emails & custom column placeholder data from uploaded file (Excel, CSV, PDF)
router.post("/campaigns/extract-file", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filename = req.file.originalname.toLowerCase();
    const buffer = req.file.buffer;
    let extractedRows: Array<{ email: string; name?: string; company?: string; designation?: string; customData?: any }> = [];

    // Flexible regex for custom domain extensions (.com, .org, .co.in, .tech, .ai, .io, etc.)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g;
    const testEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/;

    if (filename.endsWith(".xlsx") || filename.endsWith(".xls") || filename.endsWith(".csv")) {
      const xlsx = require("xlsx");
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonRows: any[] = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      for (const row of jsonRows) {
        // Find email key in row
        const rowKeys = Object.keys(row);
        const emailKey = rowKeys.find(k => k.toLowerCase().includes("email") || k.toLowerCase().includes("e-mail") || k.toLowerCase() === "to");
        
        let foundEmail = "";
        if (emailKey && row[emailKey]) {
          const match = String(row[emailKey]).match(emailRegex);
          if (match && match.length > 0) {
            foundEmail = match[0].toLowerCase().trim();
          }
        }

        // If email not found by key, search all values in the row
        if (!foundEmail) {
          const rowStr = Object.values(row).join(" ");
          const match = rowStr.match(emailRegex);
          if (match && match.length > 0) {
            foundEmail = match[0].toLowerCase().trim();
          }
        }

        if (foundEmail) {
          const nameKey = rowKeys.find(k => k.toLowerCase().includes("name") || k.toLowerCase().includes("recipient") || k.toLowerCase().includes("first"));
          const companyKey = rowKeys.find(k => k.toLowerCase().includes("company") || k.toLowerCase().includes("organization") || k.toLowerCase().includes("business"));
          const desigKey = rowKeys.find(k => k.toLowerCase().includes("designation") || k.toLowerCase().includes("title") || k.toLowerCase().includes("role"));

          extractedRows.push({
            email: foundEmail,
            name: nameKey ? String(row[nameKey]).trim() : undefined,
            company: companyKey ? String(row[companyKey]).trim() : undefined,
            designation: desigKey ? String(row[desigKey]).trim() : undefined,
            customData: row
          });
        }
      }
    } else if (filename.endsWith(".pdf")) {
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      const pdfText = pdfData.text || "";
      const matches: string[] = pdfText.match(emailRegex) || [];
      const uniqueEmails: string[] = Array.from(new Set(matches.map((e: string) => e.toLowerCase().trim())));
      extractedRows = uniqueEmails.map((email: string) => ({
        email,
        name: email.split("@")[0],
        customData: { email }
      }));
    } else {
      return res.status(400).json({ error: "Unsupported file format. Please upload .xlsx, .xls, .csv, or .pdf file." });
    }

    // Deduplicate emails & validate
    const seen = new Set<string>();
    const validRecipients: typeof extractedRows = [];
    let duplicateCount = 0;
    let invalidCount = 0;

    for (const item of extractedRows) {
      if (!item.email || !testEmailRegex.test(item.email)) {
        invalidCount++;
        continue;
      }
      if (seen.has(item.email)) {
        duplicateCount++;
        continue;
      }
      seen.add(item.email);
      validRecipients.push(item);
    }

    return res.status(200).json({
      success: true,
      totalExtracted: extractedRows.length,
      validCount: validRecipients.length,
      duplicateCount,
      invalidCount,
      recipients: validRecipients
    });
  } catch (error: any) {
    console.error("Error extracting file emails:", error);
    return res.status(500).json({ error: "Failed to extract emails from uploaded file", details: error.message });
  }
});

// GET: List all bulk campaigns
router.get("/campaigns", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    let campaigns: any[] = [];

    if (prisma.gmailBulkCampaign && typeof prisma.gmailBulkCampaign.findMany === "function") {
      campaigns = await prisma.gmailBulkCampaign.findMany({
        where: { organizationId },
        include: { recipients: true },
        orderBy: { createdAt: "desc" }
      });
    } else {
      campaigns = await prisma.$queryRawUnsafe(`
        SELECT * FROM "gmail_bulk_campaigns"
        WHERE "organizationId" = '${organizationId}'
        ORDER BY "createdAt" DESC
      `);
    }

    return res.status(200).json(campaigns);
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ error: "Failed to fetch bulk campaigns", details: error.message });
  }
});

// GET: Single campaign details with recipient report
router.get("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const campaign = await prisma.gmailBulkCampaign.findUnique({
      where: { id },
      include: { recipients: true }
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    return res.status(200).json(campaign);
  } catch (error: any) {
    console.error("Error fetching campaign details:", error);
    return res.status(500).json({ error: "Failed to fetch campaign details", details: error.message });
  }
});

// POST: Create and launch or schedule a bulk campaign
router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { name, subject, bodyTemplate, recipients, delaySeconds = 3, scheduledAt } = req.body;

    if (!name || !subject || !bodyTemplate || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Name, subject, message body, and at least one recipient are required." });
    }

    const initialStatus = scheduledAt ? "SCHEDULED" : "SENDING";

    let campaign: any;

    if (prisma.gmailBulkCampaign && typeof prisma.gmailBulkCampaign.create === "function") {
      campaign = await prisma.gmailBulkCampaign.create({
        data: {
          organizationId,
          name,
          subject,
          bodyTemplate,
          delaySeconds: Number(delaySeconds) || 3,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          status: initialStatus,
          totalRecipients: recipients.length,
          recipients: {
            create: recipients.map((r: any) => ({
              email: r.email,
              name: r.name || null,
              company: r.company || null,
              designation: r.designation || null,
              customData: r.customData ? JSON.stringify(r.customData) : null,
              status: "PENDING"
            }))
          }
        },
        include: { recipients: true }
      });
    } else {
      // Raw SQL Fallback if Prisma Client runtime hasn't reloaded the model dynamically
      const rawCampaigns: any[] = await prisma.$queryRawUnsafe(`
        INSERT INTO "gmail_bulk_campaigns" ("id", "organizationId", "name", "subject", "bodyTemplate", "delaySeconds", "scheduledAt", "status", "totalRecipients", "sentCount", "failedCount", "skippedCount", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), '${organizationId}', '${name.replace(/'/g, "''")}', '${subject.replace(/'/g, "''")}', '${bodyTemplate.replace(/'/g, "''")}', ${Number(delaySeconds) || 3}, ${scheduledAt ? `'${new Date(scheduledAt).toISOString()}'` : 'NULL'}, '${initialStatus}', ${recipients.length}, 0, 0, 0, NOW(), NOW())
        RETURNING *
      `);
      campaign = rawCampaigns[0];

      for (const r of recipients) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "gmail_campaign_recipients" ("id", "campaignId", "email", "name", "company", "designation", "customData", "status", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), '${campaign.id}', '${r.email.replace(/'/g, "''")}', ${r.name ? `'${r.name.replace(/'/g, "''")}'` : 'NULL'}, ${r.company ? `'${r.company.replace(/'/g, "''")}'` : 'NULL'}, ${r.designation ? `'${r.designation.replace(/'/g, "''")}'` : 'NULL'}, ${r.customData ? `'${JSON.stringify(r.customData).replace(/'/g, "''")}'` : 'NULL'}, 'PENDING', NOW(), NOW())
        `);
      }
    }

    if (!scheduledAt) {
      runCampaignSendingProcess(campaign.id, organizationId).catch(console.error);
    }

    return res.status(200).json(campaign);
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return res.status(500).json({ error: "Failed to create campaign", details: error.message });
  }
});

// POST: Control campaign status (Pause / Resume / Cancel)
router.post("/campaigns/:id/control", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const id = req.params.id as string;
    const { action } = req.body; // "PAUSE" | "RESUME" | "CANCEL"

    const campaign = await prisma.gmailBulkCampaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    let newStatus = campaign.status;

    if (action === "PAUSE") {
      newStatus = "PAUSED";
      activeCampaignTasks.set(id, { status: "PAUSED" });
    } else if (action === "RESUME") {
      newStatus = "SENDING";
      activeCampaignTasks.set(id, { status: "SENDING" });
      runCampaignSendingProcess(id, organizationId).catch(console.error);
    } else if (action === "CANCEL") {
      newStatus = "CANCELLED";
      activeCampaignTasks.set(id, { status: "CANCELLED" });
    }

    const updated = await prisma.gmailBulkCampaign.update({
      where: { id },
      data: { status: newStatus }
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    console.error("Error controlling campaign:", error);
    return res.status(500).json({ error: "Failed to update campaign state", details: error.message });
  }
});

// GET: Download CSV report for campaign
router.get("/campaigns/:id/report", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    let campaign: any = null;
    let recipients: any[] = [];

    if (prisma.gmailBulkCampaign && typeof prisma.gmailBulkCampaign.findUnique === "function") {
      campaign = await prisma.gmailBulkCampaign.findUnique({
        where: { id },
        include: { recipients: true }
      });
      if (campaign) recipients = campaign.recipients || [];
    } else {
      const rawC: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "gmail_bulk_campaigns" WHERE "id" = '${id}'`);
      campaign = rawC[0];
      if (campaign) {
        recipients = await prisma.$queryRawUnsafe(`SELECT * FROM "gmail_campaign_recipients" WHERE "campaignId" = '${id}'`);
      }
    }

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const header = "Email,Name,Company,Designation,Status,Error Message,Sent At\n";
    const rows = recipients.map((r: any) => {
      const email = `"${(r.email || "").replace(/"/g, '""')}"`;
      const name = `"${(r.name || "").replace(/"/g, '""')}"`;
      const company = `"${(r.company || "").replace(/"/g, '""')}"`;
      const desig = `"${(r.designation || "").replace(/"/g, '""')}"`;
      const status = `"${(r.status || "").replace(/"/g, '""')}"`;
      const errMsg = `"${(r.errorMessage || "").replace(/"/g, '""')}"`;
      const sentAt = r.sentAt ? `"${new Date(r.sentAt).toISOString()}"` : '""';
      return `${email},${name},${company},${desig},${status},${errMsg},${sentAt}`;
    }).join("\n");

    const csvContent = header + rows;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="campaign-${campaign.name.replace(/[^a-zA-Z0-9]/g, "_")}-report.csv"`);
    return res.send(csvContent);
  } catch (error: any) {
    console.error("Error generating report:", error);
    return res.status(500).json({ error: "Failed to generate campaign report", details: error.message });
  }
});

// GET: Fetch email templates
router.get("/templates", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const templates = await prisma.gmailEmailTemplate.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json(templates);
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return res.status(500).json({ error: "Failed to fetch templates", details: error.message });
  }
});

// POST: Save new email template
router.post("/templates", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { name, subject, body } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ error: "Template name, subject, and body are required." });
    }

    const template = await prisma.gmailEmailTemplate.create({
      data: { organizationId, name, subject, body }
    });

    return res.status(200).json(template);
  } catch (error: any) {
    console.error("Error creating template:", error);
    return res.status(500).json({ error: "Failed to create template", details: error.message });
  }
});

// DELETE: Delete template
router.delete("/templates/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.gmailEmailTemplate.delete({
      where: { id }
    });
    return res.status(200).json({ success: true, message: "Template deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting template:", error);
    return res.status(500).json({ error: "Failed to delete template", details: error.message });
  }
});

// ─── HELPER: Background Campaign Executor with Anti-Spam Delays ───────────────
async function runCampaignSendingProcess(campaignId: string, orgId: string) {
  activeCampaignTasks.set(campaignId, { status: "SENDING" });

  const campaign = await prisma.gmailBulkCampaign.findUnique({
    where: { id: campaignId },
    include: { recipients: true }
  });

  if (!campaign) return;

  const pendingRecipients = campaign.recipients.filter(r => r.status === "PENDING");
  let sentCount = campaign.sentCount;
  let failedCount = campaign.failedCount;

  for (const recipient of pendingRecipients) {
    const taskState = activeCampaignTasks.get(campaignId);
    if (taskState?.status === "PAUSED" || taskState?.status === "CANCELLED") {
      console.log(`[BULK CAMPAIGN] Campaign ${campaignId} ${taskState.status}. Halting execution.`);
      return;
    }

    // Build personalized template text replacing placeholders like {{Name}}, {{Company}}, {{Designation}}
    let personalizedBody = campaign.bodyTemplate;
    let personalizedSubject = campaign.subject;

    let parsedCustom: any = {};
    try {
      if (recipient.customData) parsedCustom = JSON.parse(recipient.customData);
    } catch (e) {}

    const placeholderMap: Record<string, string> = {
      "{{name}}": recipient.name || parsedCustom.name || "Valued Recipient",
      "{{email}}": recipient.email,
      "{{company}}": recipient.company || parsedCustom.company || "Your Company",
      "{{designation}}": recipient.designation || parsedCustom.designation || "Team",
    };

    // Include all custom key values from uploaded Excel columns
    Object.keys(parsedCustom).forEach(k => {
      placeholderMap[`{{${k.toLowerCase().trim()}}}`] = String(parsedCustom[k] || "");
    });

    Object.keys(placeholderMap).forEach(key => {
      const regex = new RegExp(key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), "gi");
      personalizedBody = personalizedBody.replace(regex, placeholderMap[key]);
      personalizedSubject = personalizedSubject.replace(regex, placeholderMap[key]);
    });

    try {
      await sendSingleBulkEmail(orgId, recipient.email, personalizedSubject, personalizedBody);
      sentCount++;

      if (prisma.gmailCampaignRecipient && typeof prisma.gmailCampaignRecipient.update === "function") {
        await prisma.gmailCampaignRecipient.update({
          where: { id: recipient.id },
          data: { status: "SENT", sentAt: new Date() }
        });
        await prisma.gmailBulkCampaign.update({
          where: { id: campaignId },
          data: { sentCount }
        });
      } else {
        await prisma.$executeRawUnsafe(`
          UPDATE "gmail_campaign_recipients"
          SET "status" = 'SENT', "sentAt" = NOW(), "updatedAt" = NOW()
          WHERE "id" = '${recipient.id}'
        `);
        await prisma.$executeRawUnsafe(`
          UPDATE "gmail_bulk_campaigns"
          SET "sentCount" = ${sentCount}, "updatedAt" = NOW()
          WHERE "id" = '${campaignId}'
        `);
      }
    } catch (sendErr: any) {
      failedCount++;
      const errorMsg = (sendErr?.response?.data?.error?.message || sendErr.message || "Failed to send").replace(/'/g, "''");

      if (prisma.gmailCampaignRecipient && typeof prisma.gmailCampaignRecipient.update === "function") {
        await prisma.gmailCampaignRecipient.update({
          where: { id: recipient.id },
          data: { status: "FAILED", errorMessage: errorMsg }
        });
        await prisma.gmailBulkCampaign.update({
          where: { id: campaignId },
          data: { failedCount }
        });
      } else {
        await prisma.$executeRawUnsafe(`
          UPDATE "gmail_campaign_recipients"
          SET "status" = 'FAILED', "errorMessage" = '${errorMsg}', "updatedAt" = NOW()
          WHERE "id" = '${recipient.id}'
        `);
        await prisma.$executeRawUnsafe(`
          UPDATE "gmail_bulk_campaigns"
          SET "failedCount" = ${failedCount}, "updatedAt" = NOW()
          WHERE "id" = '${campaignId}'
        `);
      }
    }

    // Emit live Socket.io progress update to frontend
    try {
      const globalIo = (global as any).io;
      if (globalIo) {
        globalIo.to(orgId).emit("gmail-campaign-progress", {
          campaignId,
          sentCount,
          failedCount,
          totalRecipients: campaign.totalRecipients
        });
      }
    } catch (e) {}

    // Anti-spam delay between emails (e.g. 3-5 seconds default)
    const delay = (campaign.delaySeconds || 3) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Mark campaign completed
  if (prisma.gmailBulkCampaign && typeof prisma.gmailBulkCampaign.update === "function") {
    await prisma.gmailBulkCampaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED" }
    });
  } else {
    await prisma.$executeRawUnsafe(`
      UPDATE "gmail_bulk_campaigns"
      SET "status" = 'COMPLETED', "updatedAt" = NOW()
      WHERE "id" = '${campaignId}'
    `);
  }

  activeCampaignTasks.delete(campaignId);
}

export default router;
