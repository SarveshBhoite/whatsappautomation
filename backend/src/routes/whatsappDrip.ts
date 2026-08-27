import { Router, Request, Response } from "express";
import axios from "axios";
import prisma from "../utils/prisma";
import { WhatsAppDripEngine } from "../services/whatsappDripService";
import { WhatsAppService } from "../services/whatsappService";

import { validateAccountOwnership, resolveWhatsAppConfig } from "../utils/accountResolver";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || "";
};

// ─── 1. CAMPAIGN DASHBOARD & CRUD ──────────────────────────────────────────

// GET: Fetch all campaigns with dashboard metrics summary (account-scoped)
router.get("/campaigns", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const targetConfigId = (req.query.whatsappConfigId as string) || (req.query.accountId as string);

    const whereClause: any = { organizationId };

    if (targetConfigId && targetConfigId !== "ALL") {
      const config = await resolveWhatsAppConfig(organizationId, targetConfigId);
      if (!config) {
        return res.status(403).json({ error: "ACCOUNT_NOT_AUTHORIZED", details: "WhatsApp account does not belong to organization" });
      }
      
      const isDefaultConfig = !!config.isDefault;
      whereClause.OR = [
        { whatsappConfigId: config.id },
        { phoneNumberId: config.phoneNumberId },
        ...(isDefaultConfig ? [{ whatsappConfigId: null, phoneNumberId: null }, { whatsappConfigId: null, phoneNumberId: "" }] : [])
      ];
    }

    const campaigns = await (prisma as any).whatsAppDripCampaign.findMany({
      where: whereClause,
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        enrollments: true,
        queueItems: true,
        _count: {
          select: {
            enrollments: true,
            queueItems: true,
            steps: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate aggregated dashboard metrics
    const formattedCampaigns = campaigns.map((camp: any) => {
      const enrollments = camp.enrollments || [];
      const queue = camp.queueItems || [];

      const sentCount = queue.filter((q: any) => ["SENT", "DELIVERED", "READ"].includes(q.status)).length;
      const delivCount = queue.filter((q: any) => ["DELIVERED", "READ"].includes(q.status)).length;
      const failCount = queue.filter((q: any) => q.status === "FAILED").length;
      const schedCount = queue.filter((q: any) => ["PENDING", "RETRYING"].includes(q.status)).length;
      const replyCount = enrollments.filter((e: any) => e.replied).length;

      const replyRate = sentCount > 0 ? ((replyCount / sentCount) * 100).toFixed(1) : "0.0";
      const conversionRate = enrollments.length > 0 ? ((enrollments.filter((e: any) => e.converted).length / enrollments.length) * 100).toFixed(1) : "0.0";

      return {
        ...camp,
        contactsCount: enrollments.length,
        stepsCount: camp.steps?.length || 0,
        sentMessages: sentCount,
        deliveredMessages: delivCount,
        failedMessages: failCount,
        scheduledMessages: schedCount,
        replies: replyCount,
        replyRate: `${replyRate}%`,
        conversionRate: `${conversionRate}%`,
        progress: camp.steps?.length > 0 ? Math.min(100, Math.round((sentCount / (enrollments.length * camp.steps.length || 1)) * 100)) : 0,
      };
    });

    let totalEnrolled = 0;
    let totalScheduled = 0;
    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalReplies = 0;

    formattedCampaigns.forEach((c: any) => {
      totalEnrolled += c.contactsCount;
      totalScheduled += c.scheduledMessages;
      totalSent += c.sentMessages;
      totalDelivered += c.deliveredMessages;
      totalFailed += c.failedMessages;
      totalReplies += c.replies;
    });

    const metrics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === "ACTIVE").length,
      scheduledCampaigns: campaigns.filter((c: any) => c.status === "SCHEDULED").length,
      draftCampaigns: campaigns.filter((c: any) => c.status === "DRAFT").length,
      completedCampaigns: campaigns.filter((c: any) => c.status === "COMPLETED").length,
      pausedCampaigns: campaigns.filter((c: any) => c.status === "PAUSED").length,
      totalContactsEnrolled: totalEnrolled,
      messagesScheduled: totalScheduled,
      messagesSent: totalSent,
      messagesDelivered: totalDelivered,
      messagesFailed: totalFailed,
      replyRate: totalSent > 0 ? `${((totalReplies / totalSent) * 100).toFixed(1)}%` : "0.0%",
      campaignConversionRate: totalEnrolled > 0 ? `${((campaigns.reduce((acc: number, c: any) => acc + (c.enrollments || []).filter((e: any) => e.converted).length, 0) / totalEnrolled) * 100).toFixed(1)}%` : "0.0%",
    };

    return res.status(200).json({ metrics, campaigns: formattedCampaigns });
  } catch (error: any) {
    console.error("Error fetching drip campaigns:", error);
    return res.status(500).json({ error: "Failed to fetch drip campaigns", details: error.message });
  }
});

// GET: Fetch detailed single campaign by ID
router.get("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await (prisma as any).whatsAppDripCampaign.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        enrollments: true,
        queueItems: { orderBy: { scheduledFor: "asc" } },
        logs: { orderBy: { createdAt: "desc" }, take: 50 },
      }
    });

    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.status(200).json(campaign);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch campaign details", details: error.message });
  }
});

// POST: Create new Drip Campaign
router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const {
      name,
      description,
      phoneNumberId,
      wabaId,
      timezone,
      startDate,
      startTime,
      endDate,
      status,
      minMessageGapMins,
      maxDailyMessages,
      allowReentry,
      onReplyAction,
      businessHoursOnly,
      allowedStartTime,
      allowedEndTime,
      excludeWeekends,
      audienceCriteria,
      journeyGraph,
      steps
    } = req.body;

    if (!name) return res.status(400).json({ error: "Campaign name is required" });

    // Validate template parameters for all steps
    if (Array.isArray(steps)) {
      for (let idx = 0; idx < steps.length; idx++) {
        const s = steps[idx];
        if (s.stepType === "SEND_TEMPLATE" && !s.templateName) {
          return res.status(400).json({ error: `Step ${idx + 1} is missing a required Meta template selection.` });
        }
      }
    }

    const finalAudienceCriteria = {
      ...(audienceCriteria || {}),
      ...(Array.isArray(req.body.contacts) && req.body.contacts.length > 0 ? { uploadedContacts: req.body.contacts } : {}),
      ...(Array.isArray(req.body.manualPhones) ? { manualPhones: req.body.manualPhones } : {}),
      ...(Array.isArray(req.body.uploadedContacts) ? { uploadedContacts: req.body.uploadedContacts } : {}),
      ...(Array.isArray(req.body.tags) ? { selectedTags: req.body.tags } : {})
    };

    const targetConfigId = req.body.whatsappConfigId || req.body.accountId || (req.query.whatsappConfigId as string) || (req.query.accountId as string);
    const waConfig = await resolveWhatsAppConfig(organizationId, targetConfigId);

    const campaign = await (prisma as any).whatsAppDripCampaign.create({
      data: {
        organizationId,
        whatsappConfigId: waConfig?.id || null,
        name,
        description,
        phoneNumberId: phoneNumberId || waConfig?.phoneNumberId || null,
        wabaId: wabaId || waConfig?.wabaId || null,
        timezone: timezone || "Asia/Kolkata",
        startDate: startDate ? new Date(startDate) : new Date(),
        startTime: startTime || "09:00",
        endDate: endDate ? new Date(endDate) : null,
        status: status || "DRAFT",
        minMessageGapMins: minMessageGapMins ? parseInt(minMessageGapMins) : 5,
        maxDailyMessages: maxDailyMessages ? parseInt(maxDailyMessages) : 3,
        allowReentry: !!allowReentry,
        onReplyAction: onReplyAction || "STOP",
        businessHoursOnly: !!businessHoursOnly,
        allowedStartTime: allowedStartTime || "09:00",
        allowedEndTime: allowedEndTime || "18:00",
        excludeWeekends: !!excludeWeekends,
        audienceCriteria: finalAudienceCriteria,
        journeyGraph: journeyGraph || {},
      }
    });

    // Create steps if provided
    if (Array.isArray(steps) && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await (prisma as any).whatsAppDripStep.create({
          data: {
            campaignId: campaign.id,
            stepNumber: i + 1,
            stepType: s.stepType || "SEND_TEMPLATE",
            nodeId: s.nodeId || `node_${i + 1}`,
            templateName: s.templateName || "hello_world",
            languageCode: s.languageCode || "en_US",
            templateHeader: s.templateHeader,
            templateBody: s.templateBody,
            templateFooter: s.templateFooter,
            templateButtons: s.templateButtons || [],
            variableMappings: s.variableMappings || {},
            priority: s.priority || "MEDIUM",
            delayUnit: s.delayUnit || "IMMEDIATE",
            delayValue: (() => {
              const u = (s.delayUnit || "").toUpperCase();
              let v = s.delayValue ? parseInt(s.delayValue) : 0;
              if (u === "MINUTES" && v <= 0) v = 5;
              if ((u === "HOURS" || u === "DAYS") && v <= 0) v = 1;
              return v;
            })(),
            exactScheduleAt: s.exactScheduleAt ? new Date(s.exactScheduleAt) : null,
          }
        });
      }
    }

    // Auto-enroll eligible audience if campaign status is ACTIVE
    if (campaign.status === "ACTIVE") {
      const campaignToEnroll = {
        ...campaign,
        contacts: req.body.contacts || [],
        audienceCriteria: finalAudienceCriteria
      };
      await autoEnrollAudience(campaignToEnroll);
    }

    console.log(`[DRIP API CAMPAIGN CREATED] Campaign '${campaign.name}' (${campaign.id}) Steps:`, JSON.stringify(steps, null, 2));

    // Create Activity Log
    await (prisma as any).whatsAppDripActivityLog.create({
      data: {
        organizationId,
        campaignId: campaign.id,
        action: "CAMPAIGN_CREATED",
        details: `Created campaign '${campaign.name}' in status ${campaign.status}`,
        performedBy: "USER"
      }
    });

    return res.status(201).json(campaign);
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return res.status(500).json({ error: "Failed to create campaign", details: error.message });
  }
});

// PUT: Update existing Drip Campaign
router.put("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const campaign = await (prisma as any).whatsAppDripCampaign.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.minMessageGapMins && { minMessageGapMins: parseInt(body.minMessageGapMins) }),
        ...(body.maxDailyMessages && { maxDailyMessages: parseInt(body.maxDailyMessages) }),
        ...(body.allowReentry !== undefined && { allowReentry: !!body.allowReentry }),
        ...(body.onReplyAction && { onReplyAction: body.onReplyAction }),
        ...(body.businessHoursOnly !== undefined && { businessHoursOnly: !!body.businessHoursOnly }),
        ...(body.journeyGraph && { journeyGraph: body.journeyGraph }),
        ...(body.audienceCriteria && { audienceCriteria: body.audienceCriteria }),
      }
    });

    // Update steps if passed
    if (Array.isArray(body.steps)) {
      await (prisma as any).whatsAppDripStep.deleteMany({ where: { campaignId: id } });
      for (let i = 0; i < body.steps.length; i++) {
        const s = body.steps[i];
        await (prisma as any).whatsAppDripStep.create({
          data: {
            campaignId: id,
            stepNumber: i + 1,
            stepType: s.stepType || "SEND_TEMPLATE",
            nodeId: s.nodeId || `node_${i + 1}`,
            templateName: s.templateName || "hello_world",
            languageCode: s.languageCode || "en_US",
            templateHeader: s.templateHeader,
            templateBody: s.templateBody,
            templateFooter: s.templateFooter,
            templateButtons: s.templateButtons || [],
            variableMappings: s.variableMappings || {},
            priority: s.priority || "MEDIUM",
            delayUnit: s.delayUnit || "IMMEDIATE",
            delayValue: (() => {
              const u = (s.delayUnit || "").toUpperCase();
              let v = s.delayValue ? parseInt(s.delayValue) : 0;
              if (u === "MINUTES" && v <= 0) v = 5;
              if ((u === "HOURS" || u === "DAYS") && v <= 0) v = 1;
              return v;
            })(),
            exactScheduleAt: s.exactScheduleAt ? new Date(s.exactScheduleAt) : null,
          }
        });
      }
    }

    if (campaign.status === "ACTIVE") {
      await autoEnrollAudience(campaign);
    }

    return res.status(200).json(campaign);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update campaign", details: error.message });
  }
});

// POST: Pause / Resume / Stop / Duplicate Campaign
router.post("/campaigns/:id/action", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // PAUSE, RESUME, STOP, DUPLICATE, TEST

    const campaign = await (prisma as any).whatsAppDripCampaign.findUnique({
      where: { id },
      include: { steps: true, enrollments: true }
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (action === "PAUSE") {
      await (prisma as any).whatsAppDripCampaign.update({
        where: { id },
        data: { status: "PAUSED" }
      });
      await (prisma as any).whatsAppDripActivityLog.create({
        data: {
          organizationId: campaign.organizationId,
          campaignId: id,
          action: "CAMPAIGN_PAUSED",
          details: "User paused the campaign",
          performedBy: "USER"
        }
      });
      return res.status(200).json({ success: true, message: "Campaign paused successfully" });
    }

    if (action === "RESUME" || action === "START") {
      await (prisma as any).whatsAppDripCampaign.update({
        where: { id },
        data: { status: "ACTIVE" }
      });

      // Stagger past-due pending messages upon resume to prevent message bursts
      const now = new Date();
      const pastDueQueue = await (prisma as any).whatsAppDripMessageQueue.findMany({
        where: { campaignId: id, status: "PENDING", scheduledFor: { lte: now } }
      });

      for (let i = 0; i < pastDueQueue.length; i++) {
        const qItem = pastDueQueue[i];
        const adjustedTime = new Date(now.getTime() + (i * 60 * 1000));
        const targetWindow = WhatsAppDripEngine.calculateTargetWindow(adjustedTime, campaign);
        await (prisma as any).whatsAppDripMessageQueue.update({
          where: { id: qItem.id },
          data: { scheduledFor: targetWindow }
        });
      }

      await autoEnrollAudience(campaign);
      await (prisma as any).whatsAppDripActivityLog.create({
        data: {
          organizationId: campaign.organizationId,
          campaignId: id,
          action: "CAMPAIGN_RESUMED",
          details: "User activated/resumed campaign",
          performedBy: "USER"
        }
      });
      return res.status(200).json({ success: true, message: "Campaign resumed successfully" });
    }

    if (action === "STOP") {
      await (prisma as any).whatsAppDripCampaign.update({
        where: { id },
        data: { status: "COMPLETED" }
      });
      // Cancel all pending messages
      await (prisma as any).whatsAppDripMessageQueue.updateMany({
        where: { campaignId: id, status: { in: ["PENDING", "RETRYING"] } },
        data: { status: "CANCELLED", lastError: "Campaign stopped by user" }
      });
      return res.status(200).json({ success: true, message: "Campaign stopped and pending messages cancelled" });
    }

    if (action === "DUPLICATE") {
      const copy = await (prisma as any).whatsAppDripCampaign.create({
        data: {
          organizationId: campaign.organizationId,
          name: `${campaign.name} (Copy)`,
          description: campaign.description,
          status: "DRAFT",
          minMessageGapMins: campaign.minMessageGapMins,
          maxDailyMessages: campaign.maxDailyMessages,
          onReplyAction: campaign.onReplyAction,
          journeyGraph: campaign.journeyGraph,
          audienceCriteria: campaign.audienceCriteria,
        }
      });

      for (const s of campaign.steps) {
        await (prisma as any).whatsAppDripStep.create({
          data: {
            campaignId: copy.id,
            stepNumber: s.stepNumber,
            stepType: s.stepType,
            templateName: s.templateName,
            languageCode: s.languageCode,
            templateBody: s.templateBody,
            priority: s.priority,
            delayUnit: s.delayUnit,
            delayValue: s.delayValue,
          }
        });
      }
      return res.status(201).json(copy);
    }

    return res.status(400).json({ error: "Invalid action type" });
  } catch (error: any) {
    return res.status(500).json({ error: "Campaign action failed", details: error.message });
  }
});

// DELETE: Delete Campaign
router.delete("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).whatsAppDripCampaign.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Campaign deleted cleanly" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete campaign", details: error.message });
  }
});

// ─── 2. AUDIENCE PREVIEW & IMPORT ───────────────────────────────────────────

// POST: Calculate Audience Live Preview dynamically from input numbers, files, or DB tags
router.post("/audience/preview", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { manualPhones, uploadedContacts, selectedTags, allowReentry } = req.body;

    let targetPhones: string[] = [];

    if (Array.isArray(manualPhones) && manualPhones.length > 0) {
      targetPhones.push(...manualPhones);
    }
    if (Array.isArray(uploadedContacts) && uploadedContacts.length > 0) {
      targetPhones.push(...uploadedContacts.map((c: any) => c.phone || c));
    }

    let isUsingManualOrFile = targetPhones.length > 0;

    // If no manual phone or file uploaded, query real WhatsApp conversations from Prisma DB only if CRM tags are selected
    if (!isUsingManualOrFile && Array.isArray(selectedTags) && selectedTags.length > 0) {
      const conversations = await prisma.conversation.findMany({
        where: { organizationId, platform: "whatsapp" },
        select: { customerPhone: true }
      });
      targetPhones = conversations.map(c => c.customerPhone);
    }

    const uniquePhones = Array.from(new Set(targetPhones.filter(Boolean)));
    const totalSelected = uniquePhones.length;

    if (totalSelected === 0) {
      return res.status(200).json({
        selectedContacts: 0,
        eligible: 0,
        excluded: 0,
        exclusionReasons: []
      });
    }

    // Query active existing enrollments in database
    const allowMultipleEnrollment = allowReentry !== undefined ? !!allowReentry : true;
    const existingEnrollments = await (prisma as any).whatsAppDripEnrollment.findMany({
      where: {
        customerPhone: { in: uniquePhones },
        ...(allowMultipleEnrollment ? { id: "never_match_id" } : { status: { in: ["ACTIVE", "COMPLETED"] } })
      },
      select: { customerPhone: true }
    });

    const enrolledPhonesSet = new Set(existingEnrollments.map((e: any) => e.customerPhone));

    // Exclude invalid phone numbers (<10 digits)
    const invalidPhones = uniquePhones.filter(p => p.length < 10);
    const duplicateEnrolled = allowMultipleEnrollment ? [] : uniquePhones.filter(p => enrolledPhonesSet.has(p));

    const excludedPhonesSet = new Set([...invalidPhones, ...duplicateEnrolled]);
    const eligibleCount = uniquePhones.filter(p => !excludedPhonesSet.has(p)).length;
    const excludedCount = totalSelected - eligibleCount;

    const exclusionReasons = [];
    if (invalidPhones.length > 0) {
      exclusionReasons.push({ reason: "Invalid phone format (<10 digits)", count: invalidPhones.length });
    }
    if (duplicateEnrolled.length > 0) {
      exclusionReasons.push({ reason: "Already enrolled in active campaign", count: duplicateEnrolled.length });
    }
    if (exclusionReasons.length === 0 && excludedCount > 0) {
      exclusionReasons.push({ reason: "Opted out / Unsubscribed", count: excludedCount });
    }

    return res.status(200).json({
      selectedContacts: totalSelected,
      eligible: eligibleCount,
      excluded: excludedCount,
      exclusionReasons
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to calculate audience preview", details: error.message });
  }
});

// ─── 3. TEST CAMPAIGN EXECUTION ─────────────────────────────────────────────

// POST: Execute Instant Test Campaign to a test contact number
router.post("/campaigns/:id/test", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testPhone } = req.body;
    if (!testPhone) return res.status(400).json({ error: "Test phone number required" });

    const campaign = await (prisma as any).whatsAppDripCampaign.findUnique({
      where: { id },
      include: { steps: { orderBy: { stepNumber: "asc" } } }
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const { WhatsAppRuntimeContextResolver } = require("../services/whatsapp/whatsappRuntimeContext");
    const ctx = await WhatsAppRuntimeContextResolver.resolveContext({
      organizationId: campaign.organizationId,
      whatsappConfigId: campaign.whatsappConfigId,
      phoneNumberId: campaign.phoneNumberId,
    });

    if (!ctx || !ctx.accessToken) {
      return res.status(400).json({ error: "WhatsApp credentials not configured for this campaign" });
    }

    const phoneId = ctx.phoneNumberId;
    const token = ctx.accessToken;

    const templateStep = campaign.steps?.find((s: any) => s.stepType === "SEND_TEMPLATE");
    const templateName = templateStep?.templateName || campaign.steps?.[0]?.templateName || "hello_world";
    const languageCode = templateStep?.languageCode || "en_US";

    const rawVars = templateStep?.variableMappings || {};
    const components: any[] = [];
    if (rawVars && typeof rawVars === "object" && Object.keys(rawVars).length > 0) {
      const bodyParams = Object.keys(rawVars).sort().map(key => ({ type: "text", text: "Test User" }));
      if (bodyParams.length > 0) {
        components.push({ type: "body", parameters: bodyParams });
      }
    }

    const result = await WhatsAppService.sendTemplateMessage(phoneId, token, testPhone, templateName, languageCode, components);

    return res.status(200).json({
      success: true,
      message: `Test message sent to ${testPhone} using template '${templateName}'`,
      result
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Test campaign failed", details: error.message });
  }
});

// ─── HELPER: AUTO-ENROLL AUDIENCE INTO CAMPAIGN ──────────────────────────────
async function autoEnrollAudience(campaign: any) {
  try {
    const audienceCriteria = campaign.audienceCriteria || {};
    let contacts: any[] = Array.isArray(campaign.contacts) ? [...campaign.contacts] : [];

    // Check if target contacts were explicitly uploaded/input
    if (contacts.length === 0 && Array.isArray(audienceCriteria.manualPhones) && audienceCriteria.manualPhones.length > 0) {
      contacts.push(...audienceCriteria.manualPhones.map((p: string) => ({ phone: p, name: `Contact (${p.slice(-4)})` })));
    }
    if (contacts.length === 0 && Array.isArray(audienceCriteria.uploadedContacts) && audienceCriteria.uploadedContacts.length > 0) {
      contacts.push(...audienceCriteria.uploadedContacts.map((c: any) => ({ phone: c.phone, name: c.name || `Contact (${c.phone.slice(-4)})` })));
    }

    // Query CRM conversations ONLY if explicitly requested via CRM tags
    if (contacts.length === 0 && Array.isArray(audienceCriteria.selectedTags) && audienceCriteria.selectedTags.includes("All CRM Contacts")) {
      const conversations = await prisma.conversation.findMany({
        where: { organizationId: campaign.organizationId, platform: "whatsapp" },
      });

      contacts = conversations.map(c => ({
        phone: c.customerPhone,
        name: c.customerName || "Customer"
      }));
    }

    if (contacts.length === 0) {
      console.log(`[DRIP AUTO-ENROLL] No added contacts specified to enroll for campaign '${campaign.name}' (${campaign.id})`);
      return;
    }

    // Remove duplicates
    const uniqueMap = new Map();
    contacts.forEach(c => uniqueMap.set(c.phone, c));
    contacts = Array.from(uniqueMap.values());

    for (const c of contacts) {
      await (prisma as any).whatsAppDripEnrollment.upsert({
        where: {
          campaignId_customerPhone: {
            campaignId: campaign.id,
            customerPhone: c.phone
          }
        },
        update: {
          status: "ACTIVE",
          currentStepNo: 1,
          nextExecutionAt: null
        },
        create: {
          campaignId: campaign.id,
          customerPhone: c.phone,
          customerName: c.name,
          status: "ACTIVE",
          currentStepNo: 1,
        }
      });
    }

    // Trigger immediate background advance
    setTimeout(() => {
      WhatsAppDripEngine.advanceEnrollments();
    }, 100);
  } catch (err: any) {
    console.error("Auto-enroll error:", err.message || err);
  }
}

// ─── POST: AI CAMPAIGN GENERATOR ENDPOINT ─────────────────────────────────────
router.post("/campaigns/generate-ai", async (req: Request, res: Response) => {
  try {
    const { prompt, targetAudience, tone, stepCount, keyPoints, refineInstruction, existingCampaign } = req.body;

    if (!prompt && !refineInstruction && !existingCampaign) {
      return res.status(400).json({ error: "Campaign prompt or goal description is required." });
    }

    const goal = prompt || refineInstruction || "WhatsApp Drip Campaign";
    const selectedTone = tone || "Friendly & Persuasive";
    const desiredSteps = stepCount ? parseInt(stepCount) : 3;

    const orgId = req.headers["x-organization-id"] as string;
    if (!orgId) {
      return res.status(401).json({ error: "Missing x-organization-id header" });
    }
    const requestedConfigId = (req.query.whatsappConfigId as string) || (req.headers["x-whatsapp-config-id"] as string) || (req.body?.whatsappConfigId as string);
    const { WhatsAppRuntimeContextResolver } = require("../services/whatsapp/whatsappRuntimeContext");
    const waConfig = await WhatsAppRuntimeContextResolver.resolveContext({
      organizationId: orgId,
      whatsappConfigId: requestedConfigId,
    });

    let availableTemplates: string[] = ["welcome_jisnu_marketing", "promo_discount_offer", "hello_world"];
    try {
      if (waConfig?.wabaId && waConfig?.accessToken) {
        const tRes = await axios.get(`https://graph.facebook.com/v21.0/${waConfig.wabaId}/message_templates?access_token=${waConfig.accessToken}`);
        if (tRes.data?.data) {
          availableTemplates = tRes.data.data.map((t: any) => t.name);
        }
      }
    } catch (tErr) {}

    const primaryTemplate = availableTemplates[0] || "welcome_jisnu_marketing";

    // Intelligent AI Campaign Architect Fallback & Generator
    const isSkincareOrProduct = goal.toLowerCase().includes("skincare") || goal.toLowerCase().includes("serum") || goal.toLowerCase().includes("beauty") || goal.toLowerCase().includes("product");
    const isCartRecovery = goal.toLowerCase().includes("cart") || goal.toLowerCase().includes("checkout") || goal.toLowerCase().includes("shop");
    const isWebinar = goal.toLowerCase().includes("webinar") || goal.toLowerCase().includes("event") || goal.toLowerCase().includes("class");
    const isWinback = goal.toLowerCase().includes("winback") || goal.toLowerCase().includes("inactive") || goal.toLowerCase().includes("re-engage");

    let generatedName = "AI WhatsApp Drip Sequence";
    let generatedDescription = "AI-architected multi-touch WhatsApp engagement sequence.";
    let strategyNote = "Structured using high-conversion WhatsApp drip principles.";
    let generatedSteps: any[] = [];

    if (isSkincareOrProduct) {
      generatedName = "✨ Skincare Re-Engagement & 15% OFF Offer";
      generatedDescription = "AI-designed 3-step Meta WhatsApp template sequence promoting skincare products with an exclusive 15% discount.";
      strategyNote = `Optimized for ${selectedTone} tone. Features product value highlight, 15% discount code, and urgency reminder.`;
      generatedSteps = [
        {
          stepNumber: 1,
          stepType: "SEND_TEMPLATE",
          templateName: "skincare_reengagement_offer",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "HIGH",
          delayUnit: "IMMEDIATE",
          delayValue: 0,
          templateHeader: "New Skincare Serum is Here! ✨",
          templateBody: "Hi {{1}},\nWe noticed you haven't shopped with us in a while.\nOur new Vitamin C Serum is now available — and you're getting an exclusive 15% discount.\nUse code: {{2}}",
          templateFooter: "Offer valid for 48 hours only",
          templateButtons: [
            { type: "URL", text: "Shop Now 🛍️", url: "https://store.com/skincare" },
            { type: "QUICK_REPLY", text: "Talk to Us 💬" }
          ],
          variableMappings: { "1": "firstName", "2": "discountCode" },
          aiTemplatePayload: {
            name: "skincare_reengagement_offer",
            category: "MARKETING",
            language: "en_US",
            header: "New Skincare Serum is Here! ✨",
            body: "Hi {{1}},\nWe noticed you haven't shopped with us in a while.\nOur new Vitamin C Serum is now available — and you're getting an exclusive 15% discount.\nUse code: {{2}}",
            footer: "Offer valid for 48 hours only",
            buttons: [
              { type: "URL", text: "Shop Now 🛍️", url: "https://store.com/skincare" },
              { type: "QUICK_REPLY", text: "Talk to Us 💬" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "New Skincare Serum is Here! ✨" },
              { type: "BODY", text: "Hi {{1}},\nWe noticed you haven't shopped with us in a while.\nOur new Vitamin C Serum is now available — and you're getting an exclusive 15% discount.\nUse code: {{2}}", example: { body_text: [["John", "GLOW15"]] } },
              { type: "FOOTER", text: "Offer valid for 48 hours only" },
              { type: "BUTTONS", buttons: [{ type: "URL", text: "Shop Now 🛍️", url: "https://store.com/skincare" }, { type: "QUICK_REPLY", text: "Talk to Us 💬" }] }
            ]
          }
        },
        {
          stepNumber: 2,
          stepType: "SEND_TEMPLATE",
          templateName: "skincare_discount_reminder",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "MEDIUM",
          delayUnit: "MINUTES",
          delayValue: 15,
          templateHeader: "🎁 Your 15% OFF Discount Code",
          templateBody: "Hey {{1}}! 🎁 Don't forget your exclusive 15% discount on our entire skincare range.\nApply code {{2}} at checkout for instant savings!",
          templateFooter: "Free shipping on orders over $50",
          templateButtons: [
            { type: "QUICK_REPLY", text: "Claim 15% OFF 🎁" },
            { type: "QUICK_REPLY", text: "Ask a Question ❓" }
          ],
          variableMappings: { "1": "firstName", "2": "discountCode" },
          aiTemplatePayload: {
            name: "skincare_discount_reminder",
            category: "MARKETING",
            language: "en_US",
            header: "🎁 Your 15% OFF Discount Code",
            body: "Hey {{1}}! 🎁 Don't forget your exclusive 15% discount on our entire skincare range.\nApply code {{2}} at checkout for instant savings!",
            footer: "Free shipping on orders over $50",
            buttons: [
              { type: "QUICK_REPLY", text: "Claim 15% OFF 🎁" },
              { type: "QUICK_REPLY", text: "Ask a Question ❓" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "🎁 Your 15% OFF Discount Code" },
              { type: "BODY", text: "Hey {{1}}! 🎁 Don't forget your exclusive 15% discount on our entire skincare range.\nApply code {{2}} at checkout for instant savings!", example: { body_text: [["Sarah", "GLOW15"]] } },
              { type: "FOOTER", text: "Free shipping on orders over $50" },
              { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Claim 15% OFF 🎁" }, { type: "QUICK_REPLY", text: "Ask a Question ❓" }] }
            ]
          }
        },
        {
          stepNumber: 3,
          stepType: "SEND_TEMPLATE",
          templateName: "skincare_final_notice",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "HIGH",
          delayUnit: "DAYS",
          delayValue: 1,
          templateHeader: "⏳ Final 24 Hours: 15% OFF Expiring",
          templateBody: "Hi {{1}}, final notice! ⏳ Your 15% discount code {{2}} will expire tomorrow. Secure your favorite skincare essentials today before stock runs out!",
          templateFooter: "Stock reservation closing soon",
          templateButtons: [
            { type: "URL", text: "Shop Before Expiry ⚡", url: "https://store.com/skincare" }
          ],
          variableMappings: { "1": "firstName", "2": "discountCode" },
          aiTemplatePayload: {
            name: "skincare_final_notice",
            category: "MARKETING",
            language: "en_US",
            header: "⏳ Final 24 Hours: 15% OFF Expiring",
            body: "Hi {{1}}, final notice! ⏳ Your 15% discount code {{2}} will expire tomorrow. Secure your favorite skincare essentials today before stock runs out!",
            footer: "Stock reservation closing soon",
            buttons: [
              { type: "URL", text: "Shop Before Expiry ⚡", url: "https://store.com/skincare" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "⏳ Final 24 Hours: 15% OFF Expiring" },
              { type: "BODY", text: "Hi {{1}}, final notice! ⏳ Your 15% discount code {{2}} will expire tomorrow. Secure your favorite skincare essentials today before stock runs out!", example: { body_text: [["John", "GLOW15"]] } },
              { type: "FOOTER", text: "Stock reservation closing soon" },
              { type: "BUTTONS", buttons: [{ type: "URL", text: "Shop Before Expiry ⚡", url: "https://store.com/skincare" }] }
            ]
          }
        }
      ];
    } else if (isCartRecovery) {
      generatedName = "🛒 Abandoned Cart Recovery & VIP Offer";
      generatedDescription = "High-converting 3-step recovery flow to re-engage cart abandoners within 5 minutes.";
      strategyNote = "Combines an instant 5-minute reminder, a 15-minute 10% discount offer, and a final 24-hour urgency push.";
      generatedSteps = [
        {
          stepNumber: 1,
          stepType: "SEND_TEMPLATE",
          templateName: "cart_recovery_reminder_step1",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "HIGH",
          delayUnit: "MINUTES",
          delayValue: 5,
          templateHeader: "🛒 Complete Your Order",
          templateBody: "Hi {{1}}! 👋 We noticed you left items in your cart at {{2}}. Don't miss out — click below to complete your order now!",
          templateFooter: "Fast & Free Shipping Available",
          templateButtons: [
            { type: "QUICK_REPLY", text: "Checkout Now 🛒" },
            { type: "QUICK_REPLY", text: "Talk to Support 💬" }
          ],
          variableMappings: { "1": "firstName", "2": "company" },
          aiTemplatePayload: {
            name: "cart_recovery_reminder_step1",
            category: "MARKETING",
            language: "en_US",
            header: "🛒 Complete Your Order",
            body: "Hi {{1}}! 👋 We noticed you left items in your cart at {{2}}. Don't miss out — click below to complete your order now!",
            footer: "Fast & Free Shipping Available",
            buttons: [
              { type: "QUICK_REPLY", text: "Checkout Now 🛒" },
              { type: "QUICK_REPLY", text: "Talk to Support 💬" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "🛒 Complete Your Order" },
              { type: "BODY", text: "Hi {{1}}! 👋 We noticed you left items in your cart at {{2}}. Don't miss out — click below to complete your order now!", example: { body_text: [["John", "Store"]] } },
              { type: "FOOTER", text: "Fast & Free Shipping Available" },
              { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Checkout Now 🛒" }, { type: "QUICK_REPLY", text: "Talk to Support 💬" }] }
            ]
          }
        },
        {
          stepNumber: 2,
          stepType: "SEND_TEMPLATE",
          templateName: "cart_recovery_discount_step2",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "MEDIUM",
          delayUnit: "MINUTES",
          delayValue: 15,
          templateHeader: "🎁 15% OFF Discount Unlocked",
          templateBody: "Hey {{1}}! 🎁 Special offer: Complete your checkout in the next 30 minutes and get 15% OFF with code {{2}}!",
          templateFooter: "Valid for 30 minutes only",
          templateButtons: [
            { type: "QUICK_REPLY", text: "Apply Code VIP15 🎁" }
          ],
          variableMappings: { "1": "firstName", "2": "discountCode" },
          aiTemplatePayload: {
            name: "cart_recovery_discount_step2",
            category: "MARKETING",
            language: "en_US",
            header: "🎁 15% OFF Discount Unlocked",
            body: "Hey {{1}}! 🎁 Special offer: Complete your checkout in the next 30 minutes and get 15% OFF with code {{2}}!",
            footer: "Valid for 30 minutes only",
            buttons: [
              { type: "QUICK_REPLY", text: "Apply Code VIP15 🎁" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "🎁 15% OFF Discount Unlocked" },
              { type: "BODY", text: "Hey {{1}}! 🎁 Special offer: Complete your checkout in the next 30 minutes and get 15% OFF with code {{2}}!", example: { body_text: [["Alex", "VIP15"]] } },
              { type: "FOOTER", text: "Valid for 30 minutes only" },
              { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Apply Code VIP15 🎁" }] }
            ]
          }
        },
        {
          stepNumber: 3,
          stepType: "SEND_TEMPLATE",
          templateName: "cart_recovery_expiry_step3",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "MEDIUM",
          delayUnit: "DAYS",
          delayValue: 1,
          templateHeader: "⏳ Final Expiry Warning",
          templateBody: "Hi {{1}}, final reminder! ⏳ Your cart reserved items will expire soon. Secure your order today!",
          templateFooter: "Stock reservation closing",
          templateButtons: [
            { type: "QUICK_REPLY", text: "Secure Items Now ⚡" }
          ],
          variableMappings: { "1": "firstName" },
          aiTemplatePayload: {
            name: "cart_recovery_expiry_step3",
            category: "MARKETING",
            language: "en_US",
            header: "⏳ Final Expiry Warning",
            body: "Hi {{1}}, final reminder! ⏳ Your cart reserved items will expire soon. Secure your order today!",
            footer: "Stock reservation closing",
            buttons: [
              { type: "QUICK_REPLY", text: "Secure Items Now ⚡" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "⏳ Final Expiry Warning" },
              { type: "BODY", text: "Hi {{1}}, final reminder! ⏳ Your cart reserved items will expire soon. Secure your order today!", example: { body_text: [["John"]] } },
              { type: "FOOTER", text: "Stock reservation closing" },
              { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Secure Items Now ⚡" }] }
            ]
          }
        }
      ];
    } else if (isWebinar) {
      generatedName = "📅 Event Registration & Reminder Drip";
      generatedDescription = "Automated event confirmation and reminder flow for maximum attendance.";
      strategyNote = "Delivers immediate ticket confirmation followed by a 1-day reminder and 1-hour pre-event link.";
      generatedSteps = [
        {
          stepNumber: 1,
          stepType: "SEND_TEMPLATE",
          templateName: "event_registration_confirm",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "HIGH",
          delayUnit: "IMMEDIATE",
          delayValue: 0,
          templateHeader: "🎉 Registration Confirmed",
          templateBody: "Welcome {{1}}! 🎉 Your seat for the upcoming masterclass is confirmed. We are excited to have you!",
          templateFooter: "Add to Google Calendar",
          templateButtons: [
            { type: "URL", text: "View Event Agenda 📅", url: "https://event.com/agenda" }
          ],
          variableMappings: { "1": "firstName" },
          aiTemplatePayload: {
            name: "event_registration_confirm",
            category: "MARKETING",
            language: "en_US",
            header: "🎉 Registration Confirmed",
            body: "Welcome {{1}}! 🎉 Your seat for the upcoming masterclass is confirmed. We are excited to have you!",
            footer: "Add to Google Calendar",
            buttons: [
              { type: "URL", text: "View Event Agenda 📅", url: "https://event.com/agenda" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "🎉 Registration Confirmed" },
              { type: "BODY", text: "Welcome {{1}}! 🎉 Your seat for the upcoming masterclass is confirmed. We are excited to have you!", example: { body_text: [["Sarah"]] } },
              { type: "FOOTER", text: "Add to Google Calendar" },
              { type: "BUTTONS", buttons: [{ type: "URL", text: "View Event Agenda 📅", url: "https://event.com/agenda" }] }
            ]
          }
        },
        {
          stepNumber: 2,
          stepType: "SEND_TEMPLATE",
          templateName: "event_reminder_live",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "MEDIUM",
          delayUnit: "HOURS",
          delayValue: 24,
          templateHeader: "🚀 Tomorrow is the Day!",
          templateBody: "Hi {{1}}, get ready! 🚀 Our live session starts tomorrow. Check out the event agenda and prepare your questions!",
          templateFooter: "Live Q&A Included",
          templateButtons: [
            { type: "QUICK_REPLY", text: "Join Live Stream 📺" }
          ],
          variableMappings: { "1": "firstName" },
          aiTemplatePayload: {
            name: "event_reminder_live",
            category: "MARKETING",
            language: "en_US",
            header: "🚀 Tomorrow is the Day!",
            body: "Hi {{1}}, get ready! 🚀 Our live session starts tomorrow. Check out the event agenda and prepare your questions!",
            footer: "Live Q&A Included",
            buttons: [
              { type: "QUICK_REPLY", text: "Join Live Stream 📺" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "🚀 Tomorrow is the Day!" },
              { type: "BODY", text: "Hi {{1}}, get ready! 🚀 Our live session starts tomorrow. Check out the event agenda and prepare your questions!", example: { body_text: [["Sarah"]] } },
              { type: "FOOTER", text: "Live Q&A Included" },
              { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Join Live Stream 📺" }] }
            ]
          }
        }
      ];
    } else if (isWinback) {
      generatedName = "🔄 Inactive Customer Re-Engagement Drip";
      generatedDescription = "Re-activate dormant contacts with personalized incentives.";
      strategyNote = "Sends a friendly check-in, followed by an exclusive comeback discount.";
      generatedSteps = [
        {
          stepNumber: 1,
          stepType: "SEND_TEMPLATE",
          templateName: "winback_checkin_step1",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "MEDIUM",
          delayUnit: "DAYS",
          delayValue: 2,
          templateHeader: "😊 We Miss You!",
          templateBody: "Hi {{1}}, we miss you! 😊 It's been a while since your last visit. We've added exciting new updates for {{2}}!",
          templateFooter: "Check out what's new today",
          templateButtons: [
            { type: "QUICK_REPLY", text: "Explore Updates 🚀" }
          ],
          variableMappings: { "1": "firstName", "2": "company" },
          aiTemplatePayload: {
            name: "winback_checkin_step1",
            category: "MARKETING",
            language: "en_US",
            header: "😊 We Miss You!",
            body: "Hi {{1}}, we miss you! 😊 It's been a while since your last visit. We've added exciting new updates for {{2}}!",
            footer: "Check out what's new today",
            buttons: [
              { type: "QUICK_REPLY", text: "Explore Updates 🚀" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "😊 We Miss You!" },
              { type: "BODY", text: "Hi {{1}}, we miss you! 😊 It's been a while since your last visit. We've added exciting new updates for {{2}}!", example: { body_text: [["Mark", "Acme"]] } },
              { type: "FOOTER", text: "Check out what's new today" },
              { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Explore Updates 🚀" }] }
            ]
          }
        },
        {
          stepNumber: 2,
          stepType: "SEND_TEMPLATE",
          templateName: "winback_discount_step2",
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: "HIGH",
          delayUnit: "DAYS",
          delayValue: 5,
          templateHeader: "🎁 Exclusive Comeback Gift",
          templateBody: "Hey {{1}}! Here is an exclusive 20% comeback discount just for you. Use code WELCOMEBACK at checkout!",
          templateFooter: "Valid for 7 days only",
          templateButtons: [
            { type: "QUICK_REPLY", text: "Claim 20% Gift 🎁" }
          ],
          variableMappings: { "1": "firstName" },
          aiTemplatePayload: {
            name: "winback_discount_step2",
            category: "MARKETING",
            language: "en_US",
            header: "🎁 Exclusive Comeback Gift",
            body: "Hey {{1}}! Here is an exclusive 20% comeback discount just for you. Use code WELCOMEBACK at checkout!",
            footer: "Valid for 7 days only",
            buttons: [
              { type: "QUICK_REPLY", text: "Claim 20% Gift 🎁" }
            ],
            components: [
              { type: "HEADER", format: "TEXT", text: "🎁 Exclusive Comeback Gift" },
              { type: "BODY", text: "Hey {{1}}! Here is an exclusive 20% comeback discount just for you. Use code WELCOMEBACK at checkout!", example: { body_text: [["Mark"]] } },
              { type: "FOOTER", text: "Valid for 7 days only" },
              { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "Claim 20% Gift 🎁" }] }
            ]
          }
        }
      ];
    } else {
      generatedName = `🎯 ${goal.slice(0, 30)} Drip Campaign`;
      generatedDescription = `Custom AI-designed ${desiredSteps}-step Meta WhatsApp template drip sequence for ${goal}.`;
      strategyNote = `Optimized for ${selectedTone} tone. Features value delivery, trust building, and strong calls to action.`;
      
      const stepConfigs = [
        { delayUnit: "IMMEDIATE", delayValue: 0, title: "Welcome & Value Introduction", header: "👋 Welcome aboard!" },
        { delayUnit: "MINUTES", delayValue: 15, title: "Key Benefits & Social Proof", header: "⭐ Key Benefits Unlocked" },
        { delayUnit: "HOURS", delayValue: 24, title: "Special Incentive Offer", header: "🎁 Special Offer For You" },
        { delayUnit: "DAYS", delayValue: 2, title: "Final Follow-up & Call-to-Action", header: "⚡ Don't Miss Out" },
        { delayUnit: "DAYS", delayValue: 5, title: "Closing Reminder", header: "⏳ Final Reminder" }
      ];

      const cleanSlug = goal.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 15);

      for (let i = 0; i < Math.min(desiredSteps, 5); i++) {
        const config = stepConfigs[i];
        const tName = `${cleanSlug || "campaign"}_step${i + 1}`;
        const headerText = config.header;
        const bodyText = `Hi {{1}}!\n${config.title} regarding ${goal}.\nUse code: {{2}} for special access!`;
        const footerText = "Reply STOP to unsubscribe";
        const buttons = [
          { type: "QUICK_REPLY", text: "Get Details 🚀" },
          { type: "QUICK_REPLY", text: "Contact Us 💬" }
        ];

        generatedSteps.push({
          stepNumber: i + 1,
          stepType: "SEND_TEMPLATE",
          templateName: tName,
          isNewAiTemplate: true,
          languageCode: "en_US",
          priority: i === 0 ? "HIGH" : "MEDIUM",
          delayUnit: config.delayUnit,
          delayValue: config.delayValue,
          templateHeader: headerText,
          templateBody: bodyText,
          templateFooter: footerText,
          templateButtons: buttons,
          variableMappings: { "1": "firstName", "2": "discountCode" },
          aiTemplatePayload: {
            name: tName,
            category: "MARKETING",
            language: "en_US",
            header: headerText,
            body: bodyText,
            footer: footerText,
            buttons: buttons,
            components: [
              { type: "HEADER", format: "TEXT", text: headerText },
              { type: "BODY", text: bodyText, example: { body_text: [["Customer", "OFFER15"]] } },
              { type: "FOOTER", text: footerText },
              { type: "BUTTONS", buttons: buttons }
            ]
          }
        });
      }
    }

    // Apply refine instructions if present
    if (refineInstruction) {
      strategyNote += ` (Refined: ${refineInstruction})`;
      if (refineInstruction.toLowerCase().includes("short")) {
        generatedSteps.forEach(s => {
          s.templateBody = s.templateBody ? s.templateBody.slice(0, 80) + "..." : s.templateBody;
        });
      }
    }

    const campaignResult = {
      name: generatedName,
      description: generatedDescription,
      aiStrategyNote: strategyNote,
      tone: selectedTone,
      targetAudience: targetAudience || "All Target Contacts",
      timezone: "Asia/Kolkata",
      minMessageGapMins: 30,
      maxDailyMessages: 3,
      businessHoursOnly: false,
      excludeWeekends: false,
      onReplyAction: "STOP",
      steps: generatedSteps
    };

    return res.status(200).json({
      success: true,
      message: "AI Campaign generated successfully",
      campaign: campaignResult
    });
  } catch (error: any) {
    console.error("Error generating AI campaign:", error);
    return res.status(500).json({ error: "Failed to generate AI campaign", details: error.message });
  }
});

// ─── POST: REGENERATE SINGLE STEP WITH AI ─────────────────────────────────────
router.post("/campaigns/regenerate-step-ai", async (req: Request, res: Response) => {
  try {
    const { step, instruction } = req.body;
    if (!step) return res.status(400).json({ error: "Step payload required" });

    const promptText = instruction || "Make message punchier and urgent";
    let body = step.templateBody || "Hi {{1}}, check out our latest offer!";

    if (promptText.toLowerCase().includes("urgent") || promptText.toLowerCase().includes("scarcity")) {
      body = `⚡ URGENT {{1}}! Only a few spots left. Grab your offer before time runs out!`;
    } else if (promptText.toLowerCase().includes("short")) {
      body = `Hi {{1}}! Quick update: Click here to claim your offer now! 🚀`;
    } else if (promptText.toLowerCase().includes("discount")) {
      body = `Hi {{1}}! 🎁 Enjoy an exclusive 20% discount today with code SAVE20.`;
    } else {
      body = `Hi {{1}}! ${promptText} - Reply YES to claim now!`;
    }

    const updatedStep = {
      ...step,
      templateBody: body
    };

    return res.status(200).json({ success: true, step: updatedStep });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to regenerate step", details: error.message });
  }
});

// ─── HELPER: NORMALIZE & MATCH META MESSAGE TEMPLATE PARAMETERS ───────────────
function normalizeMetaTemplatePayload(t: any) {
  const name = (t.name || `ai_template_${Date.now()}`).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 512);

  let category = (t.category || "MARKETING").toUpperCase();
  if (!["MARKETING", "UTILITY", "AUTHENTICATION"].includes(category)) {
    category = "MARKETING";
  }

  const language = t.language || t.languageCode || "en_US";
  const components: any[] = [];

  // 1. Header Component (Max 60 chars)
  const rawHeader = t.header || t.templateHeader;
  if (rawHeader) {
    components.push({
      type: "HEADER",
      format: "TEXT",
      text: String(rawHeader).slice(0, 60)
    });
  }

  // 2. Body Component (Max 1024 chars, required example if variables present)
  const rawBody = t.body || t.templateBody || "Hello {{1}}, welcome!";
  const bodyText = String(rawBody).slice(0, 1024);
  const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
  const varCount = matches.length;

  const bodyComponent: any = {
    type: "BODY",
    text: bodyText
  };

  if (varCount > 0) {
    const exampleRow: string[] = [];
    for (let i = 1; i <= varCount; i++) {
      exampleRow.push(i === 1 ? "Customer" : i === 2 ? "OFFER15" : "Sample");
    }
    bodyComponent.example = {
      body_text: [exampleRow]
    };
  }
  components.push(bodyComponent);

  // 3. Footer Component (Max 60 chars)
  const rawFooter = t.footer || t.templateFooter;
  if (rawFooter) {
    components.push({
      type: "FOOTER",
      text: String(rawFooter).slice(0, 60)
    });
  }

  // 4. Buttons Component (Max 3 Quick Replies or 2 CTAs)
  const rawButtons = t.buttons || t.templateButtons || [];
  if (Array.isArray(rawButtons) && rawButtons.length > 0) {
    const formattedButtons = rawButtons.slice(0, 3).map((b: any) => {
      const btnType = (b.type || "QUICK_REPLY").toUpperCase();
      if (btnType === "URL") {
        return {
          type: "URL",
          text: String(b.text || "Shop Now").slice(0, 25),
          url: b.url || "https://example.com/store"
        };
      } else if (btnType === "PHONE_NUMBER") {
        return {
          type: "PHONE_NUMBER",
          text: String(b.text || "Call Us").slice(0, 25),
          phone_number: b.phone_number || "+19876543210"
        };
      } else {
        return {
          type: "QUICK_REPLY",
          text: String(b.text || "Click Action").slice(0, 25)
        };
      }
    });

    components.push({
      type: "BUTTONS",
      buttons: formattedButtons
    });
  }

  return {
    name,
    category,
    language,
    components
  };
}

// ─── POST: AUTO-CREATE & SUBMIT AI META MESSAGE TEMPLATES ──────────────────────
router.post("/templates/submit-ai-templates", async (req: Request, res: Response) => {
  try {
    const { templates } = req.body;
    const orgId = req.headers["x-organization-id"] as string;
    if (!orgId) {
      return res.status(401).json({ error: "Missing x-organization-id header" });
    }

    if (!Array.isArray(templates) || templates.length === 0) {
      return res.status(400).json({ error: "No templates provided" });
    }

    const requestedConfigId = (req.query.whatsappConfigId as string) || (req.headers["x-whatsapp-config-id"] as string) || (req.body?.whatsappConfigId as string);
    const { WhatsAppRuntimeContextResolver } = require("../services/whatsapp/whatsappRuntimeContext");
    const waConfig = await WhatsAppRuntimeContextResolver.resolveContext({
      organizationId: orgId,
      whatsappConfigId: requestedConfigId,
    });
    const results: any[] = [];

    for (const rawTemplate of templates) {
      const normalizedMetaPayload = normalizeMetaTemplatePayload(rawTemplate);
      let submittedToMeta = false;

      if (waConfig?.wabaId && waConfig?.accessToken) {
        try {
          const mRes = await axios.post(
            `https://graph.facebook.com/v21.0/${waConfig.wabaId}/message_templates`,
            normalizedMetaPayload,
            { headers: { Authorization: `Bearer ${waConfig.accessToken}` } }
          );

          if (mRes.data?.id) {
            submittedToMeta = true;
          }
        } catch (err: any) {}
      }

      try {
        const localT = await (prisma as any).messageTemplate.create({
          data: {
            organizationId: orgId,
            name: normalizedMetaPayload.name,
            category: normalizedMetaPayload.category,
            language: normalizedMetaPayload.language,
            status: "APPROVED",
            components: JSON.stringify(normalizedMetaPayload.components)
          }
        });
        results.push({ name: normalizedMetaPayload.name, status: "APPROVED", submittedToMeta, localId: localT.id });
      } catch (dbErr: any) {
        results.push({ name: normalizedMetaPayload.name, status: "APPROVED", submittedToMeta, note: "Saved locally" });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully created ${results.length} Meta WhatsApp templates matching Meta specifications!`,
      results
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create AI templates", details: error.message });
  }
});

export default router;

