import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { InstagramService } from "../services/instagramService";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || "demo-org-123";
};

// GET: Fetch live media (Reels + Feed Posts) from Meta Graph API with pagination support
router.get("/media", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const afterCursor = (req.query.after as string) || "";
    const limit = Math.min(parseInt((req.query.limit as string) || "25"), 50);

    const config = await prisma.instagramConfig.findFirst({
      where: {
        OR: [
          { organizationId },
          { organizationId: "demo-org-123" }
        ]
      }
    });

    const activeToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN || config?.pageAccessToken;
    const instagramAccountId = config?.instagramAccountId || "17841479044967079";

    if (activeToken && instagramAccountId) {
      try {
        let metaUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media?fields=id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${activeToken}`;
        if (afterCursor) {
          metaUrl += `&after=${afterCursor}`;
        }

        const metaRes = await fetch(metaUrl);
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          const rawItems = metaData.data || [];
          const paging = metaData.paging || {};

          const mediaItems = rawItems.map((m: any) => ({
            id: m.id,
            caption: m.caption || `${m.media_product_type || m.media_type || "POST"} (${m.id})`,
            media_type: m.media_type || "IMAGE",
            media_product_type: m.media_product_type || (m.media_type === "VIDEO" ? "REELS" : "FEED"),
            media_url: m.media_url || m.thumbnail_url || "",
            thumbnail_url: m.thumbnail_url || m.media_url || "",
            permalink: m.permalink || "#",
            timestamp: m.timestamp,
            like_count: m.like_count || 0,
            comments_count: m.comments_count || 0
          }));

          return res.status(200).json({
            media: mediaItems,
            paging: {
              after: paging.cursors?.after || null,
              hasMore: !!paging.next
            }
          });
        } else {
          const errData = await metaRes.json();
          console.warn("[META GRAPH API MEDIA FETCH WARN]:", errData);
        }
      } catch (err: any) {
        console.error("[META GRAPH API MEDIA FETCH ERROR]:", err.message);
      }
    }

    // Return fallback items if token expired or missing
    return res.status(200).json({
      media: [
        { id: "17993791172808708", caption: "🚀 We're Hiring | SEO Executive | Jisnu Digital Solutions", media_type: "IMAGE", media_product_type: "FEED", thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300", permalink: "#", timestamp: new Date().toISOString(), like_count: 2, comments_count: 0 },
        { id: "17982994734042524", caption: "🚀 Google Just Made Business Growth Easier!", media_type: "CAROUSEL_ALBUM", media_product_type: "FEED", thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300", permalink: "#", timestamp: new Date().toISOString(), like_count: 5, comments_count: 2 }
      ],
      paging: { after: null, hasMore: false }
    });
  } catch (error: any) {
    console.error("Error fetching IG media list:", error);
    return res.status(500).json({ error: "Failed to fetch media list", details: error.message });
  }
});

// GET: Fetch all automations with analytics metrics
router.get("/comment-automations", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    const automations = await (prisma as any).instagramCommentAutomation.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { auditLogs: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Aggregate overall performance metrics
    const metrics = {
      totalAutomations: automations.length,
      activeAutomations: automations.filter((a: any) => a.status === "ACTIVE").length,
      pausedAutomations: automations.filter((a: any) => a.status === "PAUSED").length,
      totalCommentsMonitored: automations.reduce((acc: number, a: any) => acc + (a.commentsCount || 0), 0),
      totalMatchesTriggered: automations.reduce((acc: number, a: any) => acc + (a.matchesCount || 0), 0),
      totalDmsSent: automations.reduce((acc: number, a: any) => acc + (a.dmsSentCount || 0), 0),
      conversionRate: automations.reduce((acc: number, a: any) => acc + (a.commentsCount || 0), 0) > 0
        ? `${((automations.reduce((acc: number, a: any) => acc + (a.dmsSentCount || 0), 0) / automations.reduce((acc: number, a: any) => acc + (a.commentsCount || 0), 0)) * 100).toFixed(1)}%`
        : "0.0%"
    };

    return res.status(200).json({ metrics, automations });
  } catch (error: any) {
    console.error("Error fetching comment automations:", error);
    return res.status(500).json({ error: "Failed to fetch comment automations", details: error.message });
  }
});

// GET: Fetch single automation details with audit logs
router.get("/comment-automations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const automation = await (prisma as any).instagramCommentAutomation.findUnique({
      where: { id },
      include: {
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 100
        }
      }
    });

    if (!automation) return res.status(404).json({ error: "Automation not found" });

    return res.status(200).json(automation);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch automation details", details: error.message });
  }
});

// POST: Create new Instagram Comment-to-DM automation
router.post("/comment-automations", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const {
      name,
      mediaId,
      mediaType,
      mediaUrl,
      mediaCaption,
      keywords,
      matchingMode,
      privateMessageTemplate,
      documentUrl,
      documentName,
      enablePublicReply,
      publicReplyTemplate,
      status
    } = req.body;

    if (!name || !mediaId || !keywords || keywords.length === 0 || !privateMessageTemplate) {
      return res.status(400).json({ error: "Missing required fields (name, mediaId, keywords, privateMessageTemplate)" });
    }

    const automation = await (prisma as any).instagramCommentAutomation.create({
      data: {
        organizationId,
        name,
        mediaId: mediaId.trim(),
        mediaType: mediaType || "POST",
        mediaUrl,
        mediaCaption,
        keywords: Array.isArray(keywords) ? keywords.map((k: string) => k.toUpperCase().trim()) : [keywords.toUpperCase().trim()],
        matchingMode: matchingMode || "CONTAINS",
        privateMessageTemplate,
        documentUrl,
        documentName,
        enablePublicReply: enablePublicReply !== undefined ? !!enablePublicReply : true,
        publicReplyTemplate: publicReplyTemplate || "Thanks @{username}! Check your DMs for the link 📩",
        status: status || "ACTIVE"
      }
    });

    return res.status(201).json(automation);
  } catch (error: any) {
    console.error("Error creating comment automation:", error);
    return res.status(500).json({ error: "Failed to create comment automation", details: error.message });
  }
});

// PUT: Edit existing automation
router.put("/comment-automations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const automation = await (prisma as any).instagramCommentAutomation.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.mediaId && { mediaId: body.mediaId.trim() }),
        ...(body.mediaType && { mediaType: body.mediaType }),
        ...(body.keywords && { keywords: Array.isArray(body.keywords) ? body.keywords.map((k: string) => k.toUpperCase().trim()) : [body.keywords.toUpperCase().trim()] }),
        ...(body.matchingMode && { matchingMode: body.matchingMode }),
        ...(body.privateMessageTemplate && { privateMessageTemplate: body.privateMessageTemplate }),
        ...(body.documentUrl !== undefined && { documentUrl: body.documentUrl }),
        ...(body.documentName !== undefined && { documentName: body.documentName }),
        ...(body.enablePublicReply !== undefined && { enablePublicReply: !!body.enablePublicReply }),
        ...(body.publicReplyTemplate !== undefined && { publicReplyTemplate: body.publicReplyTemplate }),
        ...(body.status && { status: body.status }),
      }
    });

    return res.status(200).json(automation);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update automation", details: error.message });
  }
});

// POST: Actions (PAUSE, RESUME, DELETE)
router.post("/comment-automations/:id/action", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (action === "PAUSE") {
      const updated = await (prisma as any).instagramCommentAutomation.update({
        where: { id },
        data: { status: "PAUSED" }
      });
      return res.status(200).json(updated);
    }

    if (action === "RESUME") {
      const updated = await (prisma as any).instagramCommentAutomation.update({
        where: { id },
        data: { status: "ACTIVE" }
      });
      return res.status(200).json(updated);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    return res.status(500).json({ error: "Action failed", details: error.message });
  }
});

// DELETE: Delete automation
router.delete("/comment-automations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).instagramCommentAutomation.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Automation deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: "Delete failed", details: error.message });
  }
});

// ─── 2. TEST AUTOMATION SIMULATOR ──────────────────────────────────────────

// POST: Execute safe test automation without waiting for real Instagram comment
router.post("/comment-automations/:id/test", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testUsername, testCommentText } = req.body;

    const automation = await (prisma as any).instagramCommentAutomation.findUnique({
      where: { id }
    });

    if (!automation) return res.status(404).json({ error: "Automation not found" });

    const username = testUsername || "test_user";
    const commentText = testCommentText || automation.keywords[0] || "PDF";

    const matched = checkKeywordMatch(commentText, automation.keywords, automation.matchingMode);

    if (!matched.isMatch) {
      return res.status(200).json({
        success: false,
        message: `Test comment "${commentText}" did not match keywords [${automation.keywords.join(", ")}] under mode '${automation.matchingMode}'`
      });
    }

    // Build custom message with document link
    const documentLink = automation.documentUrl || "https://www.jisnudigital.com/docs/guide.pdf";
    let dmText = automation.privateMessageTemplate.replace(/\{document_link\}/gi, documentLink);
    dmText = dmText.replace(/\{username\}/gi, username);

    let publicReply = automation.publicReplyTemplate?.replace(/\{username\}/gi, username) || `Thanks @${username}! Check your DMs for the link 📩`;

    return res.status(200).json({
      success: true,
      matchedKeyword: matched.keyword,
      previewDmText: dmText,
      previewPublicReply: publicReply,
      documentAttached: documentLink,
      message: `Test passed! Matched keyword '${matched.keyword}'. Private DM & Public reply rendered successfully.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Test execution failed", details: error.message });
  }
});

// Helper matching logic
export function checkKeywordMatch(
  commentText: string,
  keywords: string[],
  matchingMode: string = "CONTAINS"
): { isMatch: boolean; keyword: string } {
  const text = (commentText || "").toUpperCase().trim();
  for (const kw of keywords) {
    const target = kw.toUpperCase().trim();
    if (!target) continue;

    if (matchingMode === "EXACT" && text === target) {
      return { isMatch: true, keyword: kw };
    }
    if (matchingMode === "CONTAINS" && text.includes(target)) {
      return { isMatch: true, keyword: kw };
    }
    if (matchingMode === "WHOLE_WORD") {
      const regex = new RegExp(`\\b${target}\\b`, "i");
      if (regex.test(text)) {
        return { isMatch: true, keyword: kw };
      }
    }
  }
  return { isMatch: false, keyword: "" };
}

export default router;
