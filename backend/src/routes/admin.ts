import { Router, Request, Response } from "express";
import axios from "axios";
import prisma from "../utils/prisma";
import { validateAccountOwnership } from "../utils/accountResolver";
import { WhatsAppService } from "../services/whatsappService";
import { generateFlow } from "../services/aiFlowGenerator";
import { io } from "../index";

const router = Router();
const DEFAULT_ORG_ID = "";

// Helper to resolve org ID from request headers
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || "";
};

// POST: Authenticate user credentials against PostgreSQL database
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 1. Find user in database by email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { organization: true }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email address or password" });
    }

    // 2. Validate password
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: "Invalid email address or password" });
    }

    // 3. Super Admin Login Validation
    if (loginType === "super_admin") {
      if (user.role !== "super_admin") {
        return res.status(403).json({ error: "Access denied. User account is not a Super Admin." });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          enabledModules: (user.organization as any)?.enabledModules || []
        }
      });
    }

    // 4. Client Portal Login (Organization automatically linked from DB)
    if (user.organization && (user.organization as any).status === "SUSPENDED") {
      return res.status(403).json({ error: "Organization account has been suspended. Please contact support." });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || "Client Workspace",
        enabledModules: (user.organization as any)?.enabledModules || []
      }
    });
  } catch (error: any) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ error: "Authentication failed", details: error.message });
  }
});

// GET: Fetch All-in-One Omnichannel Command Dashboard Overview
router.get("/dashboard/overview", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    // 1. Fetch organization with configurations
    const org = await (prisma.organization as any).findUnique({
      where: { id: organizationId },
      include: {
        waConfig: true,
        igConfig: true,
        ytConfig: true,
        gmbConfig: true,
        linkedInConfig: true,
        gmailConfig: true,
        aiAgentConfig: true,
      }
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // 2. Compute Connected Platforms Health Status
    const isGoogleConnected = Boolean(org.gmbConfig?.googleRefreshToken || org.gmbConfig?.accessToken || org.gmbConfig?.refreshToken);
    const hasGoogleAds = Boolean(org.gmbConfig?.googleAdsCustomerId || org.gmbConfig?.accountId || isGoogleConnected);
    const hasGmb = Boolean(org.gmbConfig?.googleLocationId || org.gmbConfig?.locationId || isGoogleConnected || org.gmbConfig?.locationName);

    const platforms = {
      whatsapp: {
        connected: Boolean(org.waConfig?.phoneNumberId && org.waConfig?.accessToken),
        name: "WhatsApp Cloud API",
        status: org.waConfig?.phoneNumberId ? "Operational" : "Not Configured"
      },
      instagram: {
        connected: Boolean(org.igConfig?.pageAccessToken && org.igConfig?.instagramAccountId),
        name: "Instagram Messaging",
        status: org.igConfig?.instagramAccountId ? "Operational" : "Not Configured"
      },
      google_ads: {
        connected: hasGoogleAds,
        name: "Google Ads",
        status: hasGoogleAds ? "Operational" : "Not Configured"
      },
      meta_ads: {
        connected: Boolean(org.igConfig?.pageAccessToken),
        name: "Meta Ads Manager",
        status: org.igConfig?.pageAccessToken ? "Operational" : "Not Configured"
      },
      linkedin: {
        connected: Boolean(org.linkedInConfig?.accessToken),
        name: "LinkedIn Publishing",
        status: org.linkedInConfig?.accessToken ? "Operational" : "Not Configured"
      },
      youtube: {
        connected: Boolean(org.ytConfig?.accessToken),
        name: "YouTube Channel",
        status: org.ytConfig?.accessToken ? "Operational" : "Not Configured"
      },
      gmb: {
        connected: hasGmb,
        name: "Google Business Profile",
        status: hasGmb ? "Operational" : "Not Configured"
      },
      gmail: {
        connected: Boolean(org.gmailConfig?.emailAddress && (org.gmailConfig?.accessToken || org.gmailConfig?.refreshToken)),
        name: "Gmail Auto-Pilot",
        status: org.gmailConfig?.emailAddress ? "Operational" : "Not Configured"
      },
      ai_agent: {
        connected: Boolean(org.aiAgentConfig?.isActive !== false),
        name: "AI Autonomous Agent",
        status: "Operational"
      }
    };

    // 3. Quantitative KPI Aggregations (Org Isolated)
    const [
      totalConversations,
      whatsappConvs,
      instagramConvs,
      aiInquiriesHandled,
      aiRepliesCount,
      capturedLeadsCount,
      totalReviewCount,
      reviewsAutoReplied,
      linkedInPostsCount,
      activeGoogleCampaigns,
      activeMetaCampaigns,
      gmailThreadsCount,
      knowledgeItemsCount
    ] = await Promise.all([
      prisma.conversation.count({ where: { organizationId } }),
      prisma.conversation.count({ where: { organizationId, platform: "whatsapp" } }),
      prisma.conversation.count({ where: { organizationId, platform: "instagram" } }),
      // Conversations handled autonomously by AI (bot not paused)
      prisma.conversation.count({ where: { organizationId, isBotPaused: false } }),
      // Total outbound AI replies dispatched across conversations
      prisma.message.count({
        where: {
          conversation: { organizationId },
          direction: "outbound"
        }
      }),
      prisma.aiCapturedLead.count({ where: { organizationId } }),
      prisma.googleReview.count({ where: { organizationId } }),
      // Reviews with automated AI reply status or attached reviewReply
      prisma.googleReview.count({
        where: {
          organizationId,
          OR: [
            { replyStatus: "REPLIED" },
            { replyStatus: "AI_REPLIED" },
            { replyText: { not: null } },
            { reviewReply: { isNot: null } }
          ]
        }
      }),
      prisma.linkedInPost.count({ where: { organizationId } }),
      prisma.googleAdCampaign.count({ where: { organizationId, status: "ENABLED" } }).catch(() => 0),
      prisma.metaAdCampaign.count({ where: { organizationId, status: "ACTIVE" } }).catch(() => 0),
      prisma.gmailThread.count({ where: { organizationId } }).catch(() => 0),
      prisma.aiKnowledgeItem.count({ where: { organizationId } }).catch(() => 0)
    ]);

    // 4. Calculate Dynamic Real Efficiency Metrics
    const totalOutbound = aiRepliesCount;
    const automationRate = totalConversations > 0
      ? Math.round((aiInquiriesHandled / totalConversations) * 100)
      : 100;

    // Platform Distribution Breakdown (Real Counts)
    const channelDistribution = [
      { name: "WhatsApp", count: whatsappConvs, color: "#10B981" },
      { name: "Instagram", count: instagramConvs, color: "#EC4899" },
      { name: "Google Reviews", count: totalReviewCount, color: "#F59E0B" },
      { name: "AI Leads", count: capturedLeadsCount, color: "#8B5CF6" },
      { name: "Social & Ads", count: activeGoogleCampaigns + activeMetaCampaigns + linkedInPostsCount, color: "#0284C7" },
      { name: "Gmail Threads", count: gmailThreadsCount, color: "#F43F5E" }
    ];

    // 5. 7-Day Activity Trend (Daily Aggregation)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [recentMessages, recentLeads, recentReviews] = await Promise.all([
      prisma.message.findMany({
        where: {
          conversation: { organizationId },
          createdAt: { gte: sevenDaysAgo }
        },
        select: { createdAt: true, direction: true }
      }),
      prisma.aiCapturedLead.findMany({
        where: {
          organizationId,
          createdAt: { gte: sevenDaysAgo }
        },
        select: { createdAt: true }
      }),
      prisma.googleReview.findMany({
        where: {
          organizationId,
          createdAt: { gte: sevenDaysAgo }
        },
        select: { createdAt: true }
      })
    ]);

    // Days bucketing (7 days)
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const trendDays: Array<{ day: string; date: string; inquiries: number; leads: number; reviews: number; total: number }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayLabels[d.getDay()];

      const dayInquiries = recentMessages.filter(m => m.createdAt.toISOString().split("T")[0] === dateStr).length;
      const dayLeads = recentLeads.filter(l => l.createdAt.toISOString().split("T")[0] === dateStr).length;
      const dayReviews = recentReviews.filter(r => r.createdAt.toISOString().split("T")[0] === dateStr).length;

      trendDays.push({
        day: i === 0 ? "Today" : dayName,
        date: dateStr,
        inquiries: dayInquiries,
        leads: dayLeads,
        reviews: dayReviews,
        total: dayInquiries + dayLeads + dayReviews
      });
    }

    // 5. Latest 4 Cross-Platform Notifications / Activity Events
    const rawEvents: Array<{
      id: string;
      platform: "whatsapp" | "instagram" | "reviews" | "linkedin" | "gmail" | "ai_agent" | "ads";
      platformName: string;
      title: string;
      description: string;
      badge: string;
      timestamp: Date;
      link: string;
    }> = [];

    // Latest conversations messages
    const latestConvs = await prisma.conversation.findMany({
      where: { organizationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 4
    });

    for (const conv of latestConvs) {
      if (conv.messages.length > 0) {
        const lastMsg = conv.messages[0];
        const isIg = conv.platform === "instagram";
        let snippet = lastMsg.content || "Inbound message";
        if (snippet.includes("lookaside.fbsbx.com")) snippet = "📷 Photo Attachment";
        if (snippet.includes(".mp4") || snippet.includes("video")) snippet = "🎥 Video / Reel";

        rawEvents.push({
          id: `conv_${conv.id}`,
          platform: isIg ? "instagram" : "whatsapp",
          platformName: isIg ? "Instagram DM" : "WhatsApp Chat",
          title: `New message from ${conv.customerName || conv.customerPhone}`,
          description: snippet.slice(0, 80),
          badge: lastMsg.direction === "inbound" ? "Inbound" : "Auto-Replied",
          timestamp: lastMsg.createdAt,
          link: isIg ? "/instagram" : "/whatsapp"
        });
      }
    }

    // Latest Google Reviews
    const latestReviews = await prisma.googleReview.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 2
    });

    for (const r of latestReviews) {
      rawEvents.push({
        id: `rev_${r.id}`,
        platform: "reviews",
        platformName: "Google Business",
        title: `New ${r.starRating}★ Review from ${r.reviewerName || "Customer"}`,
        description: r.comment ? r.comment.slice(0, 80) : "Customer left a 5-star rating on Google Maps.",
        badge: "Review Sync",
        timestamp: r.createdAt,
        link: "/reviews"
      });
    }

    // Latest AI Captured Leads
    const latestLeads = await prisma.aiCapturedLead.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 2
    });

    for (const l of latestLeads) {
      rawEvents.push({
        id: `lead_${l.id}`,
        platform: "ai_agent",
        platformName: "AI Lead Capture",
        title: `New Lead Captured: ${l.customerName || l.customerPhone}`,
        description: `Phone: ${l.customerPhone} • Inquiry: ${l.topicDiscussed || "Customer Consultation"}`,
        badge: "Lead Qualified",
        timestamp: l.createdAt,
        link: "/ai-agent"
      });
    }

    // Latest LinkedIn Posts
    const latestPosts = await prisma.linkedInPost.findMany({
      where: { organizationId },
      orderBy: { publishedAt: "desc" },
      take: 1
    });

    for (const p of latestPosts) {
      rawEvents.push({
        id: `post_${p.id}`,
        platform: "linkedin",
        platformName: "LinkedIn Studio",
        title: `Published Post: "${(p.summary || "LinkedIn Update").slice(0, 45)}..."`,
        description: `Engagement: ${p.likesCount || 0} Likes, ${p.commentsCount || 0} Comments`,
        badge: "Published",
        timestamp: p.publishedAt || p.createdAt,
        link: "/linkedin"
      });
    }

    // Sort all events by newest first and pick top 4
    rawEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestNotifications = rawEvents.slice(0, 4);

    return res.status(200).json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        status: org.status,
        enabledModules: org.enabledModules,
      },
      platforms,
      kpis: {
        totalConversations,
        whatsappConvs,
        instagramConvs,
        aiInquiriesHandled,
        aiRepliesCount,
        capturedLeadsCount,
        totalReviewCount,
        reviewsAutoReplied,
        linkedInPostsCount,
        activeAdCampaigns: activeGoogleCampaigns + activeMetaCampaigns,
        gmailThreadsCount,
        knowledgeItemsCount
      },
      efficiency: {
        automationRate,
        aiRepliesCount,
        inquiriesHandled: aiInquiriesHandled,
        activeChannels: Object.values(platforms).filter(p => p.connected).length
      },
      channelDistribution,
      trendDays,
      latestNotifications
    });
  } catch (error: any) {
    console.error("[DashboardOverview] Error generating dashboard overview:", error);
    return res.status(500).json({ error: "Failed to generate dashboard overview", details: error.message });
  }
});

// GET: Fetch organization's WhatsApp Configuration
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.whatsAppConfig.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { isDefault: "desc" },
    });
    return res.status(200).json(config || {
      phoneNumberId: "",
      wabaId: "",
      accessToken: "",
      webhookVerifyToken: `verify_${organizationId.slice(0, 8)}`,
    });
  } catch (error: any) {
    console.error("Error fetching WhatsApp config:", error);
    return res.status(500).json({ error: "Failed to fetch WhatsApp config", details: error.message });
  }
});

// POST: Save/Update organization's WhatsApp Configuration
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { phoneNumberId, wabaId, accessToken, phoneNumber, accountName } = req.body;

    const existing = await prisma.whatsAppConfig.findFirst({
      where: { organizationId, phoneNumberId: phoneNumberId || undefined },
    });

    let config;
    if (existing) {
      config = await prisma.whatsAppConfig.update({
        where: { id: existing.id },
        data: {
          ...(phoneNumberId !== undefined && { phoneNumberId }),
          ...(wabaId !== undefined && { wabaId }),
          ...(accessToken !== undefined && { accessToken }),
          ...(phoneNumber && { phoneNumber }),
          ...(accountName && { accountName }),
        },
      });
    } else {
      const existingCount = await prisma.whatsAppConfig.count({ where: { organizationId } });
      config = await prisma.whatsAppConfig.create({
        data: {
          organizationId,
          phoneNumberId: phoneNumberId || "",
          wabaId: wabaId || "",
          accessToken: accessToken || "",
          phoneNumber: phoneNumber || "",
          isDefault: existingCount === 0,
        },
      });
    }
    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error saving WhatsApp config:", error);
    return res.status(500).json({ error: "Failed to save WhatsApp config", details: error.message });
  }
});

// GET: List all conversations for the organization (account-scoped)
router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { phoneNumberId, instagramAccountId, platform, accountId } = req.query;

    const whereClause: any = { organizationId };

    if (platform) {
      whereClause.platform = platform as string;
    }

    if (platform === "whatsapp") {
      let targetPhoneId = phoneNumberId as string;
      if (accountId) {
        const isValid = await validateAccountOwnership(organizationId, "whatsapp", accountId as string);
        if (!isValid) {
          return res.status(403).json({ error: "ACCOUNT_NOT_AUTHORIZED", details: "Account does not belong to organization" });
        }
        const waConfig = await prisma.whatsAppConfig.findUnique({ where: { id: accountId as string } });
        if (waConfig && waConfig.phoneNumberId) {
          targetPhoneId = waConfig.phoneNumberId;
        }
      }
      if (targetPhoneId) {
        whereClause.phoneNumberId = targetPhoneId;
      } else {
        const activeConfig = await prisma.whatsAppConfig.findFirst({
          where: { organizationId, isActive: true },
          orderBy: { isDefault: "desc" },
        });
        if (activeConfig && activeConfig.phoneNumberId) {
          whereClause.phoneNumberId = activeConfig.phoneNumberId;
        }
      }
    } else if (platform === "instagram") {
      let targetIgId = instagramAccountId as string;
      if (accountId) {
        const isValid = await validateAccountOwnership(organizationId, "instagram", accountId as string);
        if (!isValid) {
          return res.status(403).json({ error: "ACCOUNT_NOT_AUTHORIZED", details: "Account does not belong to organization" });
        }
        const igConfig = await prisma.instagramConfig.findUnique({ where: { id: accountId as string } });
        if (igConfig && igConfig.instagramAccountId) {
          targetIgId = igConfig.instagramAccountId;
        }
      }
      if (targetIgId) {
        whereClause.instagramAccountId = targetIgId;
      }
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Include only the last message for list view snippet
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json(conversations);
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Failed to fetch conversations", details: error.message });
  }
});

// GET: Fetch message history for a specific conversation
router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const messages = await prisma.message.findMany({
      where: { conversationId: id as string },
      include: {
        quotedMessage: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error fetching message history:", error);
    return res.status(500).json({ error: "Failed to fetch message history", details: error.message });
  }
});

// GET: Fetch active flow or list of flows
router.get("/flows", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { platform, category, status, search } = req.query;

    const whereClause: any = { organizationId };

    if (platform) {
      whereClause.platform = platform as string;
    }
    if (category && category !== "All") {
      whereClause.category = category as string;
    }
    if (status && status !== "All") {
      whereClause.status = status as string;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { category: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const flows = await prisma.flow.findMany({
      where: whereClause,
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });

    return res.status(200).json(flows);
  } catch (error: any) {
    console.error("Error fetching flows:", error);
    return res.status(500).json({ error: "Failed to fetch flows", details: error.message });
  }
});

// GET: Fetch single flow by ID
router.get("/flows/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const flow = await prisma.flow.findFirst({
      where: { id: id as string, organizationId },
    });

    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    return res.status(200).json(flow);
  } catch (error: any) {
    console.error("Error fetching flow:", error);
    return res.status(500).json({ error: "Failed to fetch flow", details: error.message });
  }
});

// POST: Save or Update a Flow
router.post("/flows", async (req: Request, res: Response) => {
  console.log("------------------------------------------");
  console.log("[SAVE FLOW API] Incoming Request Payload:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const organizationId = getOrgId(req);
    const { id, name, description, category, status, isDefault, graphJson, isActive, platform } = req.body;

    if (!name || !graphJson) {
      const valError = "Missing required fields: name, graphJson";
      console.error("[SAVE FLOW API] Validation Error:", valError);
      return res.status(400).json({ success: false, error: valError });
    }

    const flowPlatform = platform || "whatsapp";
    const flowCategory = category || "Custom";
    let flowStatus = status || (isActive ? "Active" : "Draft");

    if (isActive) {
      flowStatus = "Active";
      // Deactivate all other flows OF THE SAME PLATFORM
      await prisma.flow.updateMany({
        where: { organizationId, platform: flowPlatform, isActive: true },
        data: { isActive: false, status: "Published" },
      });
    }

    if (isDefault) {
      await prisma.flow.updateMany({
        where: { organizationId, platform: flowPlatform, isDefault: true },
        data: { isDefault: false },
      });
    }

    let flow;

    if (id) {
      // Check if updating to an existing flow ID that exists
      const existingFlow = await prisma.flow.findUnique({ where: { id } });
      if (existingFlow) {
        flow = await prisma.flow.update({
          where: { id },
          data: {
            name,
            description: description || "",
            category: flowCategory,
            status: flowStatus,
            isDefault: !!isDefault,
            graphJson,
            platform: flowPlatform,
            isActive: !!isActive,
          },
        });
      } else {
        // If ID does not exist in DB (e.g. temporary ID), create new record
        flow = await prisma.flow.create({
          data: {
            name,
            description: description || "",
            category: flowCategory,
            status: flowStatus,
            isDefault: !!isDefault,
            graphJson,
            platform: flowPlatform,
            isActive: !!isActive,
            organizationId,
          },
        });
      }
    } else {
      // Create new
      flow = await prisma.flow.create({
        data: {
          name,
          description: description || "",
          category: flowCategory,
          status: flowStatus,
          isDefault: !!isDefault,
          graphJson,
          platform: flowPlatform,
          isActive: !!isActive,
          organizationId,
        },
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit(id ? "flow-updated" : "flow-created", flow);
      if (isActive) {
        io.to(organizationId).emit("flow-activated", flow);
      }
    }

    console.log("[SAVE FLOW API] Response Payload:");
    console.log(JSON.stringify(flow, null, 2));

    return res.status(200).json({ success: true, message: "Flow saved successfully", data: flow });
  } catch (error: any) {
    console.error("==========================================");
    console.error("[SAVE FLOW API] EXCEPTION ENCOUNTERED:");
    console.error("Error Message:", error?.message || error);
    console.error("Error Code:", error?.code);
    console.error("Stack Trace:\n", error?.stack);
    console.error("==========================================");

    let clientMessage = error?.message || "Failed to save flow";
    if (error?.code === "P2002") {
      clientMessage = "Flow name already exists.";
    }

    return res.status(500).json({
      success: false,
      error: clientMessage,
      details: error?.message,
      code: error?.code,
      stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined
    });
  }
});

// POST: Activate Flow
router.post("/flows/:id/activate", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const targetFlow = await prisma.flow.findFirst({
      where: { id: id as string, organizationId },
    });

    if (!targetFlow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    // Deactivate ALL other flows for the exact SAME platform
    await prisma.flow.updateMany({
      where: {
        organizationId,
        platform: targetFlow.platform,
        isActive: true,
      },
      data: { isActive: false, status: "Published" },
    });

    const updatedFlow = await prisma.flow.update({
      where: { id: id as string },
      data: { isActive: true, status: "Active" },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-activated", updatedFlow);
      io.to(organizationId).emit("flow-updated", updatedFlow);
    }

    return res.status(200).json({ message: "Flow activated successfully", data: updatedFlow });
  } catch (error: any) {
    console.error("Error activating flow:", error);
    return res.status(500).json({ error: "Failed to activate flow", details: error.message });
  }
});

// POST: Archive Flow
router.post("/flows/:id/archive", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const updatedFlow = await prisma.flow.update({
      where: { id: id as string },
      data: { isActive: false, status: "Archived" },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-updated", updatedFlow);
    }

    return res.status(200).json({ message: "Flow archived successfully", data: updatedFlow });
  } catch (error: any) {
    console.error("Error archiving flow:", error);
    return res.status(500).json({ error: "Failed to archive flow", details: error.message });
  }
});

// POST: Duplicate Flow
router.post("/flows/:id/duplicate", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const originalFlow = await prisma.flow.findFirst({
      where: { id: id as string, organizationId },
    });

    if (!originalFlow) {
      return res.status(404).json({ error: "Original flow not found" });
    }

    const duplicatedFlow = await prisma.flow.create({
      data: {
        organizationId,
        name: `${originalFlow.name} (Copy)`,
        description: originalFlow.description,
        category: originalFlow.category,
        platform: originalFlow.platform,
        status: "Draft",
        isActive: false,
        isDefault: false,
        graphJson: originalFlow.graphJson as any,
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-created", duplicatedFlow);
    }

    return res.status(200).json({ message: "Flow duplicated successfully", data: duplicatedFlow });
  } catch (error: any) {
    console.error("Error duplicating flow:", error);
    return res.status(500).json({ error: "Failed to duplicate flow", details: error.message });
  }
});

// DELETE: Delete Flow
router.delete("/flows/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const deletedFlow = await prisma.flow.delete({
      where: { id: id as string },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-deleted", { id });
    }

    return res.status(200).json({ message: "Flow deleted successfully", data: deletedFlow });
  } catch (error: any) {
    console.error("Error deleting flow:", error);
    return res.status(500).json({ error: "Failed to delete flow", details: error.message });
  }
});

// POST: Generate Flow via AI (Groq)
router.post("/flows/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, platform } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing required field: prompt" });
    }

    const flowPlatform = platform === "youtube" ? "youtube" : platform === "instagram" ? "instagram" : "whatsapp";
    const generatedGraph = await generateFlow(prompt, flowPlatform);

    return res.status(200).json({
      success: true,
      flow: generatedGraph
    });
  } catch (error: any) {
    console.error("Error generating flow:", error);
    if (error.message && error.message.includes("Schema validation failed")) {
      return res.status(422).json({ error: error.message, details: error.message });
    }
    return res.status(500).json({ error: error.message, details: error.message });
  }
});

// GET: Fetch WhatsApp Config credentials
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    let config = await prisma.whatsAppConfig.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { isDefault: "desc" },
    });

    if (!config) {
      config = await prisma.whatsAppConfig.create({
        data: {
          organizationId,
          phoneNumberId: "",
          wabaId: "",
          accessToken: "",
          isDefault: true,
        },
      });
    }

    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching config:", error);
    return res.status(500).json({ error: "Failed to fetch config", details: error.message });
  }
});

// POST: Update WhatsApp Config credentials
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { phoneNumberId, wabaId, accessToken } = req.body;

    const existing = await prisma.whatsAppConfig.findFirst({
      where: { organizationId, phoneNumberId: phoneNumberId || undefined },
    });

    let config;
    if (existing) {
      config = await prisma.whatsAppConfig.update({
        where: { id: existing.id },
        data: {
          ...(phoneNumberId !== undefined && { phoneNumberId }),
          ...(wabaId !== undefined && { wabaId }),
          ...(accessToken !== undefined && { accessToken }),
        },
      });
    } else {
      const existingCount = await prisma.whatsAppConfig.count({ where: { organizationId } });
      config = await prisma.whatsAppConfig.create({
        data: {
          organizationId,
          phoneNumberId: phoneNumberId || "",
          wabaId: wabaId || "",
          accessToken: accessToken || "",
          isDefault: existingCount === 0,
        },
      });
    }

    return res.status(200).json({ message: "WhatsApp configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating config:", error);
    return res.status(500).json({ error: "Failed to update config", details: error.message });
  }
});

// GET: Fetch Instagram Config credentials & live Meta account metrics
router.get("/instagram/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    if (!organizationId) {
      return res.status(200).json({
        config: null,
        liveProfile: null
      });
    }

    // Verify organization exists first
    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!org) {
      return res.status(200).json({
        config: null,
        liveProfile: null
      });
    }

    const accounts = await prisma.instagramConfig.findMany({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const config = accounts.find((a) => a.isDefault) || accounts[0] || null;

    let liveProfile: { followers_count?: number; media_count?: number; username?: string; name?: string } | null = null;

    if (config?.pageAccessToken && config?.instagramAccountId) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${config.instagramAccountId}?fields=followers_count,media_count,username,name,profile_picture_url&access_token=${config.pageAccessToken}`
        );
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          liveProfile = metaData;
        }
      } catch (e) {
        console.warn("Could not fetch live Graph API stats:", e);
      }
    }

    return res.status(200).json({
      config,
      accounts,
      liveProfile: liveProfile || null
    });
  } catch (error: any) {
    console.error("Error fetching Instagram config:", error);
    return res.status(500).json({ error: "Failed to fetch Instagram config", details: error.message });
  }
});

export async function syncAllInstagramAccountsForToken(organizationId: string, accessToken: string) {
  try {
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${accessToken}`
    );

    if (!pagesRes.ok) return;
    const pagesData = await pagesRes.json();
    const pages = pagesData.data || [];

    for (const page of pages) {
      const ig = page.instagram_business_account;
      if (ig && ig.id) {
        const instagramAccountId = ig.id;
        const pageId = page.id;
        const pageAccessToken = page.access_token || accessToken;
        const username = ig.username || "";
        const name = ig.name || page.name || "";
        const profilePic = ig.profile_picture_url || "";

        const existingCount = await prisma.instagramConfig.count({ where: { organizationId } });
        const existing = await prisma.instagramConfig.findFirst({
          where: { organizationId, instagramAccountId }
        });

        if (existing) {
          await prisma.instagramConfig.update({
            where: { id: existing.id },
            data: {
              pageId,
              pageAccessToken,
              username,
              name,
              profilePic,
              isActive: true,
            }
          });
        } else {
          await prisma.instagramConfig.create({
            data: {
              organizationId,
              instagramAccountId,
              pageId,
              pageAccessToken,
              username,
              name,
              profilePic,
              isDefault: existingCount === 0,
              isActive: true,
            }
          });
        }
      }
    }
  } catch (err: any) {
    console.warn("[MULTI-IG SYNC] Auto-sync notice:", err?.message);
  }
}

// GET: All linked Instagram accounts
router.get("/instagram/accounts", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    let accounts = await prisma.instagramConfig.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    if (accounts.length === 0) {
      accounts = await prisma.instagramConfig.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    const tokenConfig = accounts.find((a) => a.pageAccessToken);
    if (tokenConfig && tokenConfig.pageAccessToken) {
      syncAllInstagramAccountsForToken(organizationId, tokenConfig.pageAccessToken).catch(() => {});
    }

    return res.status(200).json({ success: true, accounts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch Instagram accounts", details: error.message });
  }
});

// POST: Set default Instagram account
router.post("/instagram/set-default", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { accountId } = req.body;

    if (!accountId) return res.status(400).json({ error: "Missing accountId" });

    await prisma.instagramConfig.updateMany({
      where: { organizationId },
      data: { isDefault: false },
    });

    const updated = await prisma.instagramConfig.update({
      where: { id: accountId },
      data: { isDefault: true },
    });

    return res.status(200).json({ success: true, message: "Default Instagram account set", activeAccount: updated });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to set default Instagram account", details: error.message });
  }
});

// POST: Update or Connect Instagram Config credentials
router.post("/instagram/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { instagramAccountId, pageId, pageAccessToken, username, name } = req.body;

    if (!instagramAccountId) {
      return res.status(400).json({ error: "Instagram Account ID is required" });
    }

    // Try fetching profile details from Meta Graph API
    let metaUsername = username || "";
    let metaName = name || "";
    let profilePic = "";
    if (pageAccessToken && instagramAccountId) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=username,name,profile_picture_url&access_token=${pageAccessToken}`
        );
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          if (metaData.username) metaUsername = metaData.username;
          if (metaData.name) metaName = metaData.name;
          if (metaData.profile_picture_url) profilePic = metaData.profile_picture_url;
        }
      } catch (err) {
        console.warn("Could not auto-fetch IG username details:", err);
      }
    }

    const existingCount = await prisma.instagramConfig.count({ where: { organizationId } });
    const isFirst = existingCount === 0;

    const existing = await prisma.instagramConfig.findFirst({
      where: { organizationId, instagramAccountId },
    });

    let config;
    if (existing) {
      config = await prisma.instagramConfig.update({
        where: { id: existing.id },
        data: {
          pageId: pageId || existing.pageId,
          pageAccessToken: pageAccessToken || existing.pageAccessToken,
          ...(metaUsername && { username: metaUsername }),
          ...(metaName && { name: metaName }),
          ...(profilePic && { profilePic }),
          isActive: true,
        },
      });
    } else {
      config = await prisma.instagramConfig.create({
        data: {
          organizationId,
          instagramAccountId,
          pageId: pageId || "",
          pageAccessToken: pageAccessToken || "",
          username: metaUsername || `ig_${instagramAccountId.slice(-4)}`,
          name: metaName || "",
          profilePic,
          isDefault: isFirst,
          isActive: true,
        },
      });
    }

    return res.status(200).json({ message: "Instagram configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating Instagram config:", error);
    return res.status(500).json({ error: "Failed to update Instagram config", details: error.message });
  }
});

// POST: Exchange code from Meta Instagram Login / Embedded Signup for system access token and sync IG accounts
router.post("/instagram/embedded-signup/callback", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code from Meta" });
    }

    const appId = process.env.META_APP_ID || "36702477879366478";
    const appSecret = process.env.META_APP_SECRET || "31a42564bf74d77abc944800042fad9a";

    let accessToken = "";
    try {
      const tokenResponse = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
        params: {
          client_id: appId,
          client_secret: appSecret,
          code: code,
          redirect_uri: redirectUri || "https://crm.jisnudigital.com/settings?tab=instagram",
        },
      });
      accessToken = tokenResponse.data.access_token;
    } catch (err1: any) {
      console.warn("[IG EMBEDDED SIGNUP] Token exchange fallback without redirect_uri...", err1?.response?.data?.error?.message);
      const tokenResponse = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
        params: {
          client_id: appId,
          client_secret: appSecret,
          code: code,
        },
      });
      accessToken = tokenResponse.data.access_token;
    }

    if (!accessToken) {
      return res.status(400).json({ error: "Failed to obtain access token from Meta Graph API" });
    }

    await syncAllInstagramAccountsForToken(organizationId, accessToken);

    const config = await prisma.instagramConfig.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Instagram Business Account connected successfully via Meta!",
      config,
    });
  } catch (error: any) {
    console.error("Error processing Meta Instagram Embedded Signup callback:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to connect Instagram account",
      details: error?.response?.data || error.message,
    });
  }
});

// POST: Disconnect an Instagram Account
router.post("/instagram/disconnect", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { accountId } = req.body;

    const config = accountId
      ? await prisma.instagramConfig.findUnique({ where: { id: accountId } })
      : await prisma.instagramConfig.findFirst({ where: { organizationId, isDefault: true } });

    if (config) {
      await prisma.instagramConfig.delete({ where: { id: config.id } });

      const remaining = await prisma.instagramConfig.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.instagramConfig.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Instagram account disconnected successfully.",
    });
  } catch (error: any) {
    console.error("Error disconnecting Instagram:", error);
    return res.status(500).json({ error: "Failed to disconnect Instagram account", details: error.message });
  }
});

// In-memory real-time store for Instagram comments automation feed
export const instagramCommentsFeed: Array<{
  id: string;
  fromUser: string;
  commentText: string;
  createdAt: string;
  status: "ACTIVE" | "REPLIED";
  autoReplyText: string;
}> = [];

// GET: Fetch Instagram comments & automation status (fetches live comments from Graph API if available)
router.get("/instagram/comments", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.instagramConfig.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { isDefault: "desc" },
    });

    let liveComments = [...instagramCommentsFeed];

    if (config?.pageAccessToken && config?.instagramAccountId) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${config.instagramAccountId}/media?fields=comments{text,username,timestamp}&access_token=${config.pageAccessToken}`
        );
        let metaData: any = {};
        if (metaRes.ok) {
          metaData = await metaRes.json();
        }

        const mediaList = metaData.data || [];
        const fetchedCmts: typeof instagramCommentsFeed = [];

        mediaList.forEach((item: any) => {
          if (item.comments && item.comments.data) {
            item.comments.data.forEach((c: any) => {
              fetchedCmts.push({
                id: `ig_live_${c.id || Date.now()}`,
                fromUser: c.username || "instagram_user",
                commentText: c.text || "",
                createdAt: c.timestamp || new Date().toISOString(),
                status: "REPLIED",
                autoReplyText: `Thank you for your comment @${c.username || 'user'}! We appreciate your support. 🚀`
              });
            });
          }
        });

        if (fetchedCmts.length > 0) {
          liveComments = [...fetchedCmts, ...instagramCommentsFeed];
        }
      } catch (err) {
        console.warn("Could not fetch Graph API comments:", err);
      }
    }

    return res.status(200).json({
      status: "Active",
      autoReplyEnabled: true,
      defaultTemplate: "Thanks for commenting @{user}! How can we assist you today? Feel free to DM us! 🚀",
      comments: liveComments
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST: Simulate or receive live Instagram comment & trigger auto reply
router.post("/instagram/comments/simulate", async (req: Request, res: Response) => {
  try {
    const { fromUser, commentText } = req.body;

    if (!fromUser || !commentText) {
      return res.status(400).json({ error: "fromUser and commentText are required for comment processing" });
    }

    const reply = `Thank you for your comment @${fromUser}! We appreciate your support. 🚀`;

    const newComment = {
      id: `ig_cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromUser,
      commentText,
      createdAt: new Date().toISOString(),
      status: "REPLIED" as const,
      autoReplyText: reply
    };

    instagramCommentsFeed.unshift(newComment);

    const io = req.app.get("io");
    if (io) {
      io.to(DEFAULT_ORG_ID).emit("instagram-comment-received", newComment);
    }

    return res.status(200).json({
      success: true,
      message: "Comment processed successfully",
      comment: newComment
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST: Upload visual builder node media file
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { filename, fileBase64 } = req.body;
    if (!filename || !fileBase64) {
      return res.status(400).json({ error: "Missing filename or fileBase64" });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!privateKey || !urlEndpoint) {
      console.error("[ADMIN UPLOAD ERROR]: IMAGEKIT_PRIVATE_KEY or IMAGEKIT_URL_ENDPOINT is missing in backend/.env");
      return res.status(500).json({
        error: "Cloud Storage Configuration Error",
        message: "ImageKit credentials are missing in backend/.env. Localhost upload fallbacks are disabled."
      });
    }

    console.log("[ADMIN UPLOAD] Uploading file to ImageKit cloud storage...");
    
    const formData = new FormData();
    formData.append("file", fileBase64);
    formData.append("fileName", filename);
    formData.append("useUniqueFileName", "true");

    const axios = require("axios");
    const token = Buffer.from(`${privateKey}:`).toString("base64");
    
    const response = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
      headers: {
        Authorization: `Basic ${token}`,
      }
    });

    const publicUrl = response.data?.url;
    if (!publicUrl || publicUrl.includes("localhost")) {
      return res.status(500).json({ error: "ImageKit Upload Failed", message: "Invalid CDN URL returned by ImageKit API." });
    }

    console.log("[ADMIN UPLOAD SUCCESS]: ImageKit CDN URL:", publicUrl);
    return res.status(200).json({ url: publicUrl });
  } catch (error: any) {
    console.error("[ADMIN UPLOAD FAILED]: ImageKit upload error:", error?.response?.data || error.message || error);
    return res.status(500).json({ error: "Failed to upload file", details: error.message });
  }
});

// GET: Fetch message templates directly from Meta WABA API
router.get("/whatsapp/templates", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accountId = (req.query.accountId as string) || (req.headers["x-account-id"] as string);

    let waConfig = accountId
      ? await (prisma as any).whatsAppEmbeddedConfig.findFirst({ where: { id: accountId } })
        || await prisma.whatsAppConfig.findFirst({ where: { id: accountId } })
      : await (prisma as any).whatsAppEmbeddedConfig.findFirst({ where: { organizationId, isDefault: true } })
        || await prisma.whatsAppConfig.findFirst({ where: { organizationId, isActive: true }, orderBy: { isDefault: "desc" } });

    if (!waConfig || !waConfig.accessToken) {
      waConfig = await (prisma as any).whatsAppEmbeddedConfig.findFirst() || await prisma.whatsAppConfig.findFirst();
    }

    if (!waConfig?.accessToken || !waConfig?.wabaId) {
      return res.status(400).json({ error: "WhatsApp WABA ID or Access Token missing in configuration" });
    }

    console.log(`[WABA TEMPLATES] Fetching templates for Org: ${organizationId}, WABA: ${waConfig.wabaId}...`);
    const metaRes = await fetch(
      `https://graph.facebook.com/v21.0/${waConfig.wabaId}/message_templates?limit=250&access_token=${waConfig.accessToken}`
    );

    if (!metaRes.ok) {
      const errData = await metaRes.json();
      console.warn(`[WABA TEMPLATES] Error from Meta API:`, errData);
      return res.status(metaRes.status).json({ error: errData.error?.message || "Failed to fetch Meta templates" });
    }

    const data = await metaRes.json();
    console.log(`[WABA TEMPLATES] Successfully fetched ${data.data?.length || 0} templates from Meta!`);
    return res.status(200).json({ templates: data.data || [] });
  } catch (error: any) {
    console.error("Error fetching WABA templates:", error);
    return res.status(500).json({ error: "Failed to fetch templates from Meta", details: error.message });
  }
});

// POST: Submit a new WhatsApp message template to Meta for approval
router.post("/whatsapp/templates", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { accountId, name, category, language, headerType, headerText, headerMediaUrl, bodyText, footerText, buttonText, buttonUrl, sampleVariables, buttons } = req.body;

    if (!name || !bodyText) {
      return res.status(400).json({ error: "Template name and body text are required" });
    }

    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");

    let waConfig = accountId
      ? await (prisma as any).whatsAppEmbeddedConfig.findFirst({ where: { id: accountId } })
        || await prisma.whatsAppConfig.findFirst({ where: { id: accountId } })
      : await (prisma as any).whatsAppEmbeddedConfig.findFirst({ where: { organizationId, isDefault: true } })
        || await prisma.whatsAppConfig.findFirst({ where: { organizationId, isActive: true }, orderBy: { isDefault: "desc" } });

    if (!waConfig?.accessToken || !waConfig?.wabaId) {
      return res.status(400).json({ error: "WhatsApp WABA ID or Access Token missing" });
    }

    const components: any[] = [];

    // Header component handling (TEXT, IMAGE, DOCUMENT, VIDEO, LOCATION, or NONE)
    const selectedHeaderType = headerType ? headerType.toUpperCase() : (headerText ? "TEXT" : "NONE");

    if (selectedHeaderType === "TEXT" && headerText && headerText.trim()) {
      const headerObj: any = {
        type: "HEADER",
        format: "TEXT",
        text: headerText.trim().substring(0, 60)
      };
      const headerMatches = headerText.match(/\{\{\d+\}\}/g);
      if (headerMatches && headerMatches.length > 0) {
        headerObj.example = {
          header_text: ["Sample Header"]
        };
      }
      components.push(headerObj);
    } else if (["IMAGE", "DOCUMENT", "VIDEO"].includes(selectedHeaderType)) {
      const headerObj: any = {
        type: "HEADER",
        format: selectedHeaderType
      };
      if (headerMediaUrl && headerMediaUrl.trim()) {
        headerObj.example = {
          header_handle: [headerMediaUrl.trim()]
        };
      } else {
        const sampleUrl = selectedHeaderType === "IMAGE"
          ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
          : selectedHeaderType === "VIDEO"
          ? "https://www.w3schools.com/html/mov_bbb.mp4"
          : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        headerObj.example = {
          header_handle: [sampleUrl]
        };
      }
      components.push(headerObj);
    }

    // Body component with variable placeholder examples support (Meta Graph API mandate)
    const bodyObj: any = {
      type: "BODY",
      text: bodyText.trim()
    };

    // Extract placeholders {{1}}, {{2}} to build required example body_text parameters array
    const matches = bodyText.match(/\{\{\d+\}\}/g);
    if (matches && matches.length > 0) {
      const sampleParams = Array.isArray(sampleVariables) && sampleVariables.length === matches.length
        ? sampleVariables
        : matches.map((placeholder: string, idx: number) => `Sample_${idx + 1}`);
      bodyObj.example = {
        body_text: [sampleParams]
      };
    }
    components.push(bodyObj);

    // Footer component
    if (footerText && footerText.trim()) {
      components.push({
        type: "FOOTER",
        text: footerText.trim().substring(0, 60)
      });
    }

    // Button components (URL, QUICK_REPLY, PHONE_NUMBER, COPY_CODE)
    const buttonsList: any[] = [];
    if (buttons && Array.isArray(buttons)) {
      buttonsList.push(...buttons);
    } else if (buttonText && buttonText.trim()) {
      buttonsList.push({
        type: req.body.buttonType || "URL",
        text: buttonText.trim(),
        url: buttonUrl && buttonUrl.trim() ? buttonUrl.trim() : "https://www.jisnudigital.com/",
        phone_number: req.body.buttonPhoneNumber || "+919876543210",
        code: req.body.buttonCopyCode || "DISCOUNT20"
      });
    }

    if (buttonsList.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttonsList.map((btn: any) => {
          if (btn.type === "PHONE_NUMBER") {
            return {
              type: "PHONE_NUMBER",
              text: (btn.text || "Call Us").substring(0, 25),
              phone_number: btn.phone_number || btn.phoneNumber || "+919876543210"
            };
          }
          if (btn.type === "QUICK_REPLY") {
            return {
              type: "QUICK_REPLY",
              text: (btn.text || "Reply").substring(0, 25)
            };
          }
          if (btn.type === "COPY_CODE") {
            return {
              type: "COPY_CODE",
              example: btn.code || "OFFER20"
            };
          }
          // URL Button
          const urlObj: any = {
            type: "URL",
            text: (btn.text || "Visit Website").substring(0, 25),
            url: btn.url || "https://www.jisnudigital.com/"
          };
          if (urlObj.url.includes("{{1}}")) {
            urlObj.example = [btn.urlExample || "product-123"];
          }
          return urlObj;
        })
      });
    }

    const payload = {
      name: cleanName,
      category: category || "MARKETING",
      language: language || "en_US",
      components
    };

    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${waConfig.wabaId}/message_templates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${waConfig.accessToken}`
        },
        body: JSON.stringify(payload)
      }
    );

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      console.error("Meta Template Submission Error:", metaData);
      return res.status(metaRes.status).json({
        error: metaData.error?.message || "Meta Template approval request failed",
        details: metaData.error
      });
    }

    return res.status(200).json({
      success: true,
      message: "Template submitted to Meta for approval successfully!",
      template: metaData
    });
  } catch (error: any) {
    console.error("Error submitting Meta template:", error);
    return res.status(500).json({ error: "Failed to submit template to Meta", details: error.message });
  }
});

// POST: Execute WhatsApp Bulk Messaging Campaign
router.post("/whatsapp/bulk-broadcast", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { recipients, messageText, mediaUrl, templateName, sendType } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients array is required and must not be empty" });
    }

    if (!messageText) {
      return res.status(400).json({ error: "messageText is required for bulk messaging" });
    }

    const targetTemplate = templateName || "jisnu_official_welcome";
    const templateLang = targetTemplate === "hello_world" ? "en_US" : "en";

    const waConfig = await prisma.whatsAppConfig.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { isDefault: "desc" },
    });

    const results: any[] = [];

    for (const rawItem of recipients) {
      let rawPhone = typeof rawItem === "object" ? (rawItem.phone || "") : rawItem;
      let leadName = typeof rawItem === "object" ? (rawItem.name || "") : "";

      let cleanPhone = rawPhone.toString().replace(/[^\d]/g, "").trim();
      if (!cleanPhone) continue;

      // Automatically prepend India country code 91 if a 10-digit number is provided
      if (cleanPhone.length === 10) {
        cleanPhone = `91${cleanPhone}`;
      }

      const finalName = leadName.trim() || `Lead (${cleanPhone.slice(-4)})`;

      try {
        // 1. Find or create conversation
        let conversation = await prisma.conversation.findFirst({
          where: {
            organizationId,
            platform: "whatsapp",
            customerPhone: cleanPhone
          }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId,
              platform: "whatsapp",
              customerPhone: cleanPhone,
              customerName: finalName,
              isBotPaused: false
            }
          });
        } else if (leadName && (conversation.customerName || "").startsWith("Lead (")) {
          // Update customerName if name was provided
          conversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: { customerName: leadName.trim() }
          });
        }

        // 2. Dispatch via WhatsApp Cloud API service if credentials present
        let responseData: any = null;
        if (waConfig?.phoneNumberId && waConfig?.accessToken) {
          if (sendType === "custom") {
            // Send Custom CRM Portal Message (Text / PDF / Image) directly to customer
            if (mediaUrl) {
              const lowerMedia = mediaUrl.toLowerCase();
              const isPdf = lowerMedia.endsWith(".pdf") || lowerMedia.includes("/pdf") || lowerMedia.includes("document");
              const mediaType = isPdf ? "document" : "image";
              const filename = isPdf ? "Brochure.pdf" : "broadcast.jpg";

              responseData = await WhatsAppService.sendMediaMessage(
                waConfig.phoneNumberId,
                waConfig.accessToken,
                cleanPhone,
                mediaType,
                mediaUrl,
                filename,
                messageText
              );
            } else {
              responseData = await WhatsAppService.sendTextMessage(
                waConfig.phoneNumberId,
                waConfig.accessToken,
                cleanPhone,
                messageText
              );
            }
            console.log(`Custom CRM Message SENT to ${cleanPhone}:`, responseData?.messages?.[0]?.id);
          } else {
            // Dispatch chosen Meta Approved Template per lead
            try {
              responseData = await WhatsAppService.sendTemplateMessage(
                waConfig.phoneNumberId,
                waConfig.accessToken,
                cleanPhone,
                targetTemplate,
                templateLang
              );
              console.log(`Approved Template (${targetTemplate}) SENT to ${cleanPhone}:`, responseData?.messages?.[0]?.id);
            } catch (tErr: any) {
              const metaErrMsg = tErr.response?.data?.error?.message || tErr.message;
              console.warn(`Template ${targetTemplate} error for ${cleanPhone}:`, metaErrMsg);
              try {
                responseData = await WhatsAppService.sendTemplateMessage(
                  waConfig.phoneNumberId,
                  waConfig.accessToken,
                  cleanPhone,
                  "welcome_jisnu_marketing",
                  "en_US"
                );
              } catch (err: any) {
                const fallbackErrMsg = err.response?.data?.error?.message || err.message;
                console.warn(`Fallback template (welcome_jisnu_marketing) error for ${cleanPhone}:`, fallbackErrMsg);
                try {
                  // Final fallback to Meta's default pre-approved template on every WABA account
                  responseData = await WhatsAppService.sendTemplateMessage(
                    waConfig.phoneNumberId,
                    waConfig.accessToken,
                    cleanPhone,
                    "hello_world",
                    "en_US"
                  );
                  console.log(`Default Template (hello_world) SENT to ${cleanPhone}:`, responseData?.messages?.[0]?.id);
                } catch (finalErr: any) {
                  const finalMsg = finalErr.response?.data?.error?.message || finalErr.message;
                  console.warn(`Final hello_world template error for ${cleanPhone}:`, finalMsg);
                }
              }
            }
          }
        }

        const waMessageId = responseData?.messages?.[0]?.id || `bulk_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // 3. Create outbound message record in database
        const savedMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: "outbound",
            messageType: mediaUrl ? "image" : "text",
            content: mediaUrl ? `${mediaUrl}|caption:${messageText}` : messageText,
            waMessageId,
            status: "sent",
            senderName: "Bulk Campaign"
          }
        });

        // 4. Broadcast to frontend agents via Socket.IO
        io.to(organizationId).emit("new-message", {
          conversationId: conversation.id,
          message: savedMessage
        });

        results.push({ phone: cleanPhone, status: "SENT", messageId: savedMessage.id });

        // Add 500ms delay between consecutive bulk dispatches for Meta rate queue pacing
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (itemErr: any) {
        results.push({ phone: cleanPhone, status: "FAILED", error: itemErr.message });
      }
    }

    return res.status(200).json({
      success: true,
      totalSent: results.filter(r => r.status === "SENT").length,
      totalFailed: results.filter(r => r.status === "FAILED").length,
      details: results
    });
  } catch (error: any) {
    console.error("Error executing bulk WhatsApp broadcast:", error);
    return res.status(500).json({ error: "Failed to execute bulk broadcast", details: error.message });
  }
});

// GET: Fetch current organization's enabled modules
router.get("/organization/my-modules", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const org = await (prisma.organization as any).findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, enabledModules: true, status: true }
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    return res.status(200).json(org);
  } catch (error: any) {
    console.error("Error fetching organization modules:", error);
    return res.status(500).json({ error: "Failed to fetch organization modules", details: error.message });
  }
});

// GET: List all organizations (Super Admin)
router.get("/organizations", async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        users: { select: { id: true, email: true, name: true, role: true } },
        waConfig: { select: { phoneNumberId: true, wabaId: true } },
        gmbConfig: { select: { locationId: true, accountId: true } },
        gmailConfig: { select: { emailAddress: true } },
        linkedInConfig: { select: { memberName: true, companyName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json(organizations);
  } catch (error: any) {
    console.error("Error listing organizations:", error);
    return res.status(500).json({ error: "Failed to list organizations", details: error.message });
  }
});

// POST: Create a new organization and default Client Admin user
router.post("/organizations", async (req: Request, res: Response) => {
  try {
    const { name, adminEmail, adminName, adminPassword, enabledModules } = req.body;

    if (!name || !adminEmail) {
      return res.status(400).json({ error: "Organization name and admin email are required" });
    }

    const defaultModules = enabledModules || [
      "whatsapp", "instagram", "gmb", "gmail", "linkedin", "youtube", "google_ads", "meta_ads", "reviews", "ai_agent", "tools"
    ];

    const organization = await (prisma.organization as any).create({
      data: {
        name,
        enabledModules: defaultModules,
        status: "ACTIVE",
        users: {
          create: {
            email: adminEmail.trim().toLowerCase(),
            name: adminName || "Client Admin",
            password: adminPassword || "admin123",
            role: "admin"
          }
        }
      },
      include: {
        users: { select: { id: true, email: true, name: true, role: true, password: true } }
      }
    });

    return res.status(201).json({ success: true, organization });
  } catch (error: any) {
    console.error("Error creating organization:", error);
    return res.status(500).json({ error: "Failed to create organization", details: error.message });
  }
});

// PUT: Update organization details and enabled modules
router.put("/organizations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, enabledModules, status } = req.body;

    const updatedOrg = await (prisma.organization as any).update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(enabledModules && { enabledModules }),
        ...(typeof status === "string" && { status })
      },
      include: {
        users: { select: { id: true, email: true, name: true, role: true } }
      }
    });

    return res.status(200).json({ success: true, organization: updatedOrg });
  } catch (error: any) {
    console.error("Error updating organization:", error);
    return res.status(500).json({ error: "Failed to update organization", details: error.message });
  }
});

// PUT: Update organization enabled modules (compatibility endpoint)
router.put("/organizations/:id/modules", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabledModules, status } = req.body;

    const updatedOrg = await (prisma.organization as any).update({
      where: { id },
      data: {
        ...(enabledModules && { enabledModules }),
        ...(typeof status === "string" && { status })
      }
    });

    return res.status(200).json({ success: true, organization: updatedOrg });
  } catch (error: any) {
    console.error("Error updating organization modules:", error);
    return res.status(500).json({ error: "Failed to update organization modules", details: error.message });
  }
});

// DELETE: Delete an organization
router.delete("/organizations/:id", async (req: Request, res: Response) => {
  try {
    const orgId = req.params.id as string;

    // Delete related configs/users first if not cascaded
    await prisma.user.deleteMany({ where: { organizationId: orgId } });
    await prisma.whatsAppConfig.deleteMany({ where: { organizationId: orgId } });
    await prisma.instagramConfig.deleteMany({ where: { organizationId: orgId } });
    await prisma.googleBusinessConfig.deleteMany({ where: { organizationId: orgId } });
    await prisma.gmailConfig.deleteMany({ where: { organizationId: orgId } });
    await prisma.linkedInConfig.deleteMany({ where: { organizationId: orgId } });
    
    await prisma.organization.delete({ where: { id: orgId } });

    return res.status(200).json({ success: true, message: "Organization deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting organization:", error);
    return res.status(500).json({ error: "Failed to delete organization", details: error.message });
  }
});

export default router;
