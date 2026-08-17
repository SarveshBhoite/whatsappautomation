import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { WhatsAppService } from "../services/whatsappService";
import { generateFlow } from "../services/aiFlowGenerator";
import { io } from "../index";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Middleware to inject default org ID if not provided (Simplifies dev/sandbox testing)
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || "demo-org-123";
};

// GET: List all conversations for the organization
router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { phoneNumberId, platform } = req.query;

    const whereClause: any = { organizationId };
    if (platform && typeof platform === "string") {
      whereClause.platform = platform;
    }

    let conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Include only the last message for list view snippet
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (phoneNumberId && typeof phoneNumberId === "string") {
      conversations = conversations.filter((c) => {
        if (c.platform !== "whatsapp") return true;
        const fs = (c.flowState as Record<string, any>) || {};
        if (fs.phoneNumberId) {
          return fs.phoneNumberId === phoneNumberId;
        }
        return true;
      });
    }

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

// GET: Fetch WhatsApp Config credentials & live phone numbers from Meta
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    let config = await prisma.whatsAppConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      config = await prisma.whatsAppConfig.create({
        data: {
          organizationId,
          phoneNumberId: "",
          wabaId: "",
          accessToken: "",
        },
      });
    }

    // If WABA ID and Access Token are available, fetch real phone numbers from Meta Graph API
    if (config.wabaId && config.accessToken) {
      try {
        const graphVersion = process.env.META_GRAPH_VERSION || "v20.0";
        let livePhones: any[] = [];
        let fetchedBusinessName = config.businessName || "";

        // 1. Query dedicated /phone_numbers endpoint
        const listRes = await fetch(
          `https://graph.facebook.com/${graphVersion}/${config.wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${config.accessToken}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.data && Array.isArray(listData.data)) {
            livePhones.push(...listData.data);
          }
        }

        // 2. Query WABA node for name and embedded numbers
        const wabaRes = await fetch(
          `https://graph.facebook.com/${graphVersion}/${config.wabaId}?fields=id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}&access_token=${config.accessToken}`
        );
        if (wabaRes.ok) {
          const wabaData = await wabaRes.json();
          if (wabaData.name) fetchedBusinessName = wabaData.name;
          if (wabaData.phone_numbers?.data && Array.isArray(wabaData.phone_numbers.data)) {
            livePhones.push(...wabaData.phone_numbers.data);
          }
        }

        // 3. Query specific phone node if configured and not yet in live list
        if (livePhones.length === 0 && config.phoneNumberId) {
          try {
            const phoneRes = await fetch(
              `https://graph.facebook.com/${graphVersion}/${config.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${config.accessToken}`
            );
            if (phoneRes.ok) {
              const phoneData = await phoneRes.json();
              if (phoneData.id) {
                livePhones.push(phoneData);
              }
            }
          } catch (phoneErr) {
            console.warn("Direct phone fetch warning:", phoneErr);
          }
        }

        // Deduplicate numbers by ID
        const phoneMap = new Map();
        livePhones.forEach((p: any) => {
          if (p.id && !phoneMap.has(p.id)) {
            phoneMap.set(p.id, {
              id: p.id,
              display_phone_number: p.display_phone_number || p.id,
              verified_name: p.verified_name || fetchedBusinessName,
              quality_rating: p.quality_rating || "UNKNOWN",
              code_verification_status: p.code_verification_status || "UNKNOWN",
              platform_type: p.platform_type || "CLOUD_API",
              is_primary: config?.phoneNumberId ? p.id === config.phoneNumberId : false,
            });
          }
        });

        const deduplicatedList = Array.from(phoneMap.values());

        if (deduplicatedList.length > 0) {
          // If no active primary, mark first as primary
          if (!deduplicatedList.some((p: any) => p.is_primary)) {
            deduplicatedList[0].is_primary = true;
          }

          config = await prisma.whatsAppConfig.update({
            where: { organizationId },
            data: {
              ...(config.phoneNumberId ? {} : { phoneNumberId: deduplicatedList[0].id }),
            },
          });
        }
      } catch (graphErr) {
        console.warn("Could not fetch live WhatsApp numbers from Meta:", graphErr);
      }
    }

    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching config:", error);
    return res.status(500).json({ error: "Failed to fetch config", details: error.message });
  }
});

// GET: Dedicated endpoint to fetch all phone numbers under a WABA
router.get("/whatsapp/phone-numbers", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { wabaId, accessToken, phoneNumberId } = req.query;

    let targetWabaId = (wabaId as string) || "";
    let targetToken = (accessToken as string) || "";
    let targetPhoneId = (phoneNumberId as string) || "";

    if (!targetWabaId || !targetToken) {
      const config = await prisma.whatsAppConfig.findUnique({ where: { organizationId } });
      if (config) {
        targetWabaId = targetWabaId || config.wabaId;
        targetToken = targetToken || config.accessToken;
        targetPhoneId = targetPhoneId || config.phoneNumberId;
      }
    }

    if (!targetWabaId || !targetToken) {
      return res.status(400).json({ error: "Missing required parameters: wabaId and accessToken" });
    }

    const graphVersion = process.env.META_GRAPH_VERSION || "v20.0";
    let rawPhones: any[] = [];

    const phoneListRes = await fetch(
      `https://graph.facebook.com/${graphVersion}/${targetWabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${targetToken}`
    );

    if (phoneListRes.ok) {
      const data = await phoneListRes.json();
      if (data.data && Array.isArray(data.data)) {
        rawPhones.push(...data.data);
      }
    }

    // Fallback to phone node if list was empty and phone number ID provided
    if (rawPhones.length === 0 && targetPhoneId) {
      try {
        const singleRes = await fetch(
          `https://graph.facebook.com/${graphVersion}/${targetPhoneId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${targetToken}`
        );
        if (singleRes.ok) {
          const singleData = await singleRes.json();
          if (singleData.id) {
            rawPhones.push(singleData);
          }
        }
      } catch (err) {
        console.warn("Direct phone node fetch error:", err);
      }
    }

    const phoneNumbers = rawPhones.map((p: any) => ({
      id: p.id,
      display_phone_number: p.display_phone_number || p.id,
      verified_name: p.verified_name,
      quality_rating: p.quality_rating,
      code_verification_status: p.code_verification_status,
      platform_type: p.platform_type || "CLOUD_API",
    }));

    return res.status(200).json({
      success: true,
      wabaId: targetWabaId,
      phoneNumbers,
    });
  } catch (error: any) {
    console.error("Error fetching WABA phone numbers:", error);
    return res.status(500).json({ error: "Failed to fetch phone numbers", details: error.message });
  }
});

// POST: Update WhatsApp Config credentials
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { phoneNumberId, wabaId, accessToken } = req.body;

    const config = await prisma.whatsAppConfig.upsert({
      where: { organizationId },
      update: {
        ...(phoneNumberId !== undefined ? { phoneNumberId } : {}),
        ...(wabaId !== undefined ? { wabaId } : {}),
        ...(accessToken !== undefined ? { accessToken } : {}),
      },
      create: {
        organizationId,
        phoneNumberId: phoneNumberId || "",
        wabaId: wabaId || "",
        accessToken: accessToken || "",
      },
    });

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

    const config = await prisma.instagramConfig.findUnique({
      where: { organizationId },
    });

    let liveProfile: {
      id?: string;
      username?: string;
      name?: string;
      profile_picture_url?: string;
      account_type?: string;
      followers_count?: number;
      follows_count?: number;
      media_count?: number;
      biography?: string;
      website?: string;
    } | null = null;

    // If Meta Access Token and IG Account ID are available in database, fetch real live profile stats from Meta Graph API
    if (config && config.pageAccessToken && config.instagramAccountId) {
      try {
        // Attempt 1: Fetch via graph.facebook.com/v20.0/{instagramAccountId}
        const metaRes = await fetch(
          `https://graph.facebook.com/v20.0/${config.instagramAccountId}?fields=id,username,name,profile_picture_url,account_type,biography,website,followers_count,follows_count,media_count&access_token=${config.pageAccessToken}`
        );
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          if (metaData && (metaData.username || metaData.id)) {
            liveProfile = {
              id: metaData.id || config.instagramAccountId,
              username: metaData.username,
              name: metaData.name,
              profile_picture_url: metaData.profile_picture_url,
              account_type: metaData.account_type || "Professional Account (Business)",
              followers_count: metaData.followers_count,
              follows_count: metaData.follows_count,
              media_count: metaData.media_count,
              biography: metaData.biography,
              website: metaData.website,
            };
          }
        } else {
          // Attempt 2: Fallback to graph.instagram.com/me
          const igMeRes = await fetch(
            `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,account_type,followers_count,media_count&access_token=${config.pageAccessToken}`
          );
          if (igMeRes.ok) {
            const igMeData = await igMeRes.json();
            if (igMeData && (igMeData.username || igMeData.id)) {
              liveProfile = {
                id: igMeData.id || config.instagramAccountId,
                username: igMeData.username,
                name: igMeData.name,
                profile_picture_url: igMeData.profile_picture_url,
                account_type: igMeData.account_type || "Professional Account (Business)",
                followers_count: igMeData.followers_count,
                media_count: igMeData.media_count,
              };
            }
          }
        }

        // If fresh live data was fetched, persist it into the database
        if (liveProfile && (liveProfile.username || liveProfile.profile_picture_url)) {
          await prisma.instagramConfig.update({
            where: { organizationId },
            data: {
              ...(liveProfile.username ? { username: liveProfile.username } : {}),
              ...(liveProfile.name ? { name: liveProfile.name } : {}),
              ...(liveProfile.profile_picture_url ? { profilePictureUrl: liveProfile.profile_picture_url } : {}),
              ...(liveProfile.account_type ? { accountType: liveProfile.account_type } : {}),
              ...(liveProfile.followers_count !== undefined ? { followersCount: liveProfile.followers_count } : {}),
              ...(liveProfile.media_count !== undefined ? { mediaCount: liveProfile.media_count } : {}),
            },
          });
        }
      } catch (e) {
        console.warn("Could not fetch live Graph API profile stats:", e);
      }
    }

    const resolvedProfilePic = liveProfile?.profile_picture_url || config?.profilePictureUrl || undefined;
    const resolvedUsername = liveProfile?.username || config?.username || undefined;
    const resolvedName = liveProfile?.name || config?.name || undefined;
    const resolvedAccountType = liveProfile?.account_type || config?.accountType || "Professional Account (Business)";
    const resolvedFollowers = liveProfile?.followers_count ?? config?.followersCount ?? undefined;
    const resolvedMedia = liveProfile?.media_count ?? config?.mediaCount ?? undefined;

    return res.status(200).json({
      config,
      liveProfile: liveProfile || (config ? {
        id: config.instagramAccountId,
        username: resolvedUsername,
        name: resolvedName,
        profile_picture_url: resolvedProfilePic,
        account_type: resolvedAccountType,
        followers_count: resolvedFollowers,
        media_count: resolvedMedia,
      } : null)
    });
  } catch (error: any) {
    console.error("Error fetching Instagram config:", error);
    return res.status(500).json({ error: "Failed to fetch Instagram config", details: error.message });
  }
});

// POST: Update Instagram Config credentials & profile metadata
router.post("/instagram/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const {
      instagramAccountId,
      pageId,
      pageAccessToken,
      username,
      name,
      profilePictureUrl,
      profile_picture_url,
      accountType,
      account_type,
      followersCount,
      followers_count,
      mediaCount,
      media_count
    } = req.body;

    const picUrl = profilePictureUrl || profile_picture_url || undefined;
    const accType = accountType || account_type || undefined;
    const followers = followersCount !== undefined ? Number(followersCount) : followers_count !== undefined ? Number(followers_count) : undefined;
    const media = mediaCount !== undefined ? Number(mediaCount) : media_count !== undefined ? Number(media_count) : undefined;

    const updateData: any = {};
    if (instagramAccountId !== undefined) updateData.instagramAccountId = instagramAccountId;
    if (pageId !== undefined) updateData.pageId = pageId;
    if (pageAccessToken !== undefined) updateData.pageAccessToken = pageAccessToken;
    if (username !== undefined) updateData.username = username;
    if (name !== undefined) updateData.name = name;
    if (picUrl !== undefined) updateData.profilePictureUrl = picUrl;
    if (accType !== undefined) updateData.accountType = accType;
    if (followers !== undefined) updateData.followersCount = followers;
    if (media !== undefined) updateData.mediaCount = media;

    const createData: any = {
      organizationId,
      instagramAccountId: instagramAccountId || "",
      pageId: pageId || "",
      pageAccessToken: pageAccessToken || "",
      username: username || "jisnu_digitalsolution_pvt_ltd",
      name: name || "JISNU Digital Solutions Pvt.Ltd",
      profilePictureUrl: picUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      accountType: accType || "Professional Account (Business)",
      followersCount: followers ?? 569,
      mediaCount: media ?? 100,
    };

    const config = await prisma.instagramConfig.upsert({
      where: { organizationId },
      update: updateData,
      create: createData,
    });

    return res.status(200).json({ message: "Instagram configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating Instagram config:", error);
    return res.status(500).json({ error: "Failed to update Instagram config", details: error.message });
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
    const config = await prisma.instagramConfig.findUnique({
      where: { organizationId }
    });

    let liveComments = [...instagramCommentsFeed];

    if (config?.pageAccessToken && config?.instagramAccountId) {
      try {
        let metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${config.instagramAccountId}/media?fields=comments{text,username,timestamp}&access_token=${config.pageAccessToken}`
        );
        let metaData: any = {};
        if (metaRes.ok) {
          metaData = await metaRes.json();
        } else {
          // Fallback query via business discovery endpoint
          metaRes = await fetch(
            `https://graph.facebook.com/v19.0/${config.instagramAccountId}?fields=business_discovery.username(jisnu_digitalsolution_pvt_ltd){media{comments{text,username,timestamp}}}&access_token=${config.pageAccessToken}`
          );
          if (metaRes.ok) {
            const discData = await metaRes.json();
            metaData = { data: discData.business_discovery?.media?.data || [] };
          }
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
    const waConfig = await prisma.whatsAppConfig.findUnique({
      where: { organizationId }
    });

    if (!waConfig?.accessToken || !waConfig?.wabaId) {
      return res.status(400).json({ error: "WhatsApp WABA ID or Access Token missing in configuration" });
    }

    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${waConfig.wabaId}/message_templates?access_token=${waConfig.accessToken}`
    );

    if (!metaRes.ok) {
      const errData = await metaRes.json();
      return res.status(metaRes.status).json({ error: errData.error?.message || "Failed to fetch Meta templates" });
    }

    const data = await metaRes.json();
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
    const { name, category, language, headerType, headerText, headerMediaUrl, bodyText, footerText, buttonText, buttonUrl } = req.body;

    if (!name || !bodyText) {
      return res.status(400).json({ error: "Template name and body text are required" });
    }

    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");

    const waConfig = await prisma.whatsAppConfig.findUnique({
      where: { organizationId }
    });

    if (!waConfig?.accessToken || !waConfig?.wabaId) {
      return res.status(400).json({ error: "WhatsApp WABA ID or Access Token missing" });
    }

    const components: any[] = [];

    // Header component handling (TEXT, IMAGE, DOCUMENT, VIDEO, or NONE)
    const selectedHeaderType = headerType ? headerType.toUpperCase() : (headerText ? "TEXT" : "NONE");

    if (selectedHeaderType === "TEXT" && headerText && headerText.trim()) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: headerText.trim()
      });
    } else if (["IMAGE", "DOCUMENT", "VIDEO"].includes(selectedHeaderType)) {
      const headerObj: any = {
        type: "HEADER",
        format: selectedHeaderType
      };
      if (headerMediaUrl && headerMediaUrl.trim()) {
        headerObj.example = {
          header_handle: [headerMediaUrl.trim()]
        };
      }
      components.push(headerObj);
    }

    // Body component
    components.push({
      type: "BODY",
      text: bodyText.trim()
    });

    // Footer component
    if (footerText && footerText.trim()) {
      components.push({
        type: "FOOTER",
        text: footerText.trim()
      });
    }

    // Button component
    if (buttonText && buttonText.trim()) {
      components.push({
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: buttonText.trim(),
            url: buttonUrl && buttonUrl.trim() ? buttonUrl.trim() : "https://www.jisnudigital.com/"
          }
        ]
      });
    }

    const payload = {
      name: cleanName,
      category: category || "MARKETING",
      language: language || "en",
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

    const waConfig = await prisma.whatsAppConfig.findUnique({
      where: { organizationId }
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
        let conversation = await prisma.conversation.findUnique({
          where: {
            organizationId_platform_customerPhone: {
              organizationId,
              platform: "whatsapp",
              customerPhone: cleanPhone
            }
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

export default router;
