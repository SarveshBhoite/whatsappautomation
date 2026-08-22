import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { InstagramCommentEngine } from "../services/instagramCommentEngine";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.organizationId as string) || "";
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
        let allRawItems: any[] = [];
        let afterCursor = (req.query.after as string) || "";
        let hasNext = true;
        let pageCount = 0;
        const fetchAll = req.query.fetchAll !== "false";

        while (hasNext && pageCount < 10) {
          pageCount++;
          let metaUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media?fields=id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count&limit=100&access_token=${activeToken}`;
          if (afterCursor) {
            metaUrl += `&after=${afterCursor}`;
          }

          const metaRes = await fetch(metaUrl);
          if (!metaRes.ok) {
            const errData = await metaRes.json();
            console.warn("[META GRAPH API MEDIA FETCH WARN]:", errData);
            break;
          }

          const metaData = await metaRes.json();
          const items = metaData.data || [];
          allRawItems.push(...items);

          if (fetchAll && metaData.paging?.cursors?.after && items.length > 0) {
            afterCursor = metaData.paging.cursors.after;
          } else {
            hasNext = false;
          }
        }

        const mediaItems = allRawItems.map((m: any) => ({
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
          total: mediaItems.length,
          paging: {
            after: afterCursor || null,
            hasMore: hasNext
          }
        });
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

    const totalMonitored = automations.reduce((acc: number, a: any) => acc + (a.commentsCount || 0), 0);
    const totalMatches = automations.reduce((acc: number, a: any) => acc + (a.matchesCount || 0), 0);
    const totalDms = automations.reduce((acc: number, a: any) => acc + (a.dmsSentCount || 0), 0);

    const metrics = {
      totalAutomations: automations.length,
      activeAutomations: automations.filter((a: any) => a.status === "ACTIVE").length,
      pausedAutomations: automations.filter((a: any) => a.status === "PAUSED").length,
      totalCommentsMonitored: totalMonitored,
      totalMatchesTriggered: totalMatches,
      totalDmsSent: totalDms,
      conversionRate: totalMonitored > 0
        ? `${((totalDms / totalMonitored) * 100).toFixed(1)}%`
        : "0.0%"
    };

    return res.status(200).json({ metrics, automations });
  } catch (error: any) {
    console.error("Error fetching comment automations:", error);
    return res.status(500).json({ error: "Failed to fetch comment automations", details: error.message });
  }
});

// GET: Production Analytics Summary
router.get("/comment-automations/analytics/summary", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    const automations = await (prisma as any).instagramCommentAutomation.findMany({
      where: { organizationId }
    });

    const auditLogs = await (prisma as any).instagramCommentAuditLog.findMany({
      where: { organizationId },
      take: 1000,
      orderBy: { createdAt: "desc" }
    });

    const totalCommentsReceived = automations.reduce((acc: number, a: any) => acc + (a.commentsCount || 0), 0);
    const totalMatched = auditLogs.filter((l: any) => l.status === "SUCCESS" || l.status === "COMPLETED" || l.status === "MATCHED").length;
    const totalSkipped = auditLogs.filter((l: any) => l.status === "SKIPPED").length;
    const totalFailed = auditLogs.filter((l: any) => l.status === "FAILED").length;
    const totalPublicReplies = auditLogs.filter((l: any) => !!l.publicReplySent).length;
    const totalPrivateMessages = auditLogs.filter((l: any) => l.privateDmSent === true).length;

    // Top Keywords calculation
    const kwMap: Record<string, number> = {};
    for (const log of auditLogs) {
      if (log.matchedKeyword) {
        kwMap[log.matchedKeyword] = (kwMap[log.matchedKeyword] || 0) + 1;
      }
    }
    const topKeywords = Object.entries(kwMap)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top Posts calculation
    const postMap: Record<string, number> = {};
    for (const log of auditLogs) {
      if (log.mediaId) {
        postMap[log.mediaId] = (postMap[log.mediaId] || 0) + 1;
      }
    }
    const topPosts = Object.entries(postMap)
      .map(([mediaId, count]) => ({ mediaId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const durations = auditLogs.map((l: any) => l.processingDurationMs).filter(Boolean);
    const avgProcessingTimeMs = durations.length > 0
      ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length)
      : 0;

    return res.status(200).json({
      totalCommentsReceived,
      totalMatched,
      totalSkipped,
      totalFailed,
      totalPublicReplies,
      totalPrivateMessages,
      matchRate: totalCommentsReceived > 0 ? `${((totalMatched / totalCommentsReceived) * 100).toFixed(1)}%` : "0.0%",
      avgProcessingTimeMs,
      topKeywords,
      topPosts
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Analytics query failed", details: error.message });
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

// POST: Create new Instagram Comment-to-DM automation with full parameter support
router.post("/comment-automations", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const body = req.body;

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
      status,

      // Advanced parameters
      instagramAccountId,
      triggerType,
      triggerPhrases,
      exactMatchText,
      partialMatchText,
      isCaseSensitive,
      matchBehavior,
      excludedKeywords,
      excludedPhrases,
      targetPostSelection,
      targetPostIds,
      postFilter,
      responseAction,
      publicReplyConfig,
      privateMessageConfig,
      actions,
      delayConfig,
      limitsConfig,
      duplicatePrevention,
      cooldownConfig,
      scheduleConfig,
      priority,
      conflictPolicy,
      errorHandlingConfig,
      isTestMode,
      normalizationConfig,
      userConditionsConfig,
      commentConditionsConfig
    } = body;

    // Safety validation
    if (!name || (!mediaId && targetPostSelection !== "ALL")) {
      return res.status(400).json({ error: "Missing required fields (name, mediaId or targetPostSelection)" });
    }

    const parsedKeywords = Array.isArray(keywords)
      ? keywords.map((k: string) => k.trim())
      : (keywords ? [keywords.trim()] : []);

    const automation = await (prisma as any).instagramCommentAutomation.create({
      data: {
        organizationId,
        name,
        mediaId: (mediaId || "ALL").trim(),
        mediaType: mediaType || "POST",
        mediaUrl,
        mediaCaption,
        keywords: parsedKeywords,
        matchingMode: matchingMode || "CONTAINS",
        privateMessageTemplate: privateMessageTemplate || "Thanks for commenting! Check your DMs.",
        documentUrl,
        documentName,
        enablePublicReply: enablePublicReply !== undefined ? !!enablePublicReply : true,
        publicReplyTemplate: publicReplyTemplate || "Thanks @{username}! Check your DMs for details 📩",
        status: status || "ACTIVE",

        instagramAccountId: instagramAccountId || "ALL",
        triggerType: triggerType || "SPECIFIC_KEYWORD",
        triggerPhrases: Array.isArray(triggerPhrases) ? triggerPhrases : [],
        exactMatchText,
        partialMatchText,
        isCaseSensitive: !!isCaseSensitive,
        matchBehavior: matchBehavior || "ANY",
        excludedKeywords: Array.isArray(excludedKeywords) ? excludedKeywords : [],
        excludedPhrases: Array.isArray(excludedPhrases) ? excludedPhrases : [],
        targetPostSelection: targetPostSelection || (mediaId === "ALL" ? "ALL" : "SPECIFIC"),
        targetPostIds: Array.isArray(targetPostIds) ? targetPostIds : (mediaId ? [mediaId] : []),
        postFilter,
        responseAction: responseAction || "BOTH",
        publicReplyConfig,
        privateMessageConfig,
        actions,
        delayConfig,
        limitsConfig,
        duplicatePrevention,
        cooldownConfig,
        scheduleConfig,
        priority: typeof priority === "number" ? priority : 10,
        conflictPolicy: conflictPolicy || "HIGHEST_PRIORITY_ONLY",
        errorHandlingConfig,
        isTestMode: !!isTestMode,
        normalizationConfig,
        userConditionsConfig,
        commentConditionsConfig
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
        ...(body.keywords && { keywords: Array.isArray(body.keywords) ? body.keywords.map((k: string) => k.trim()) : [body.keywords.trim()] }),
        ...(body.matchingMode && { matchingMode: body.matchingMode }),
        ...(body.privateMessageTemplate && { privateMessageTemplate: body.privateMessageTemplate }),
        ...(body.documentUrl !== undefined && { documentUrl: body.documentUrl }),
        ...(body.documentName !== undefined && { documentName: body.documentName }),
        ...(body.enablePublicReply !== undefined && { enablePublicReply: !!body.enablePublicReply }),
        ...(body.publicReplyTemplate !== undefined && { publicReplyTemplate: body.publicReplyTemplate }),
        ...(body.status && { status: body.status }),

        ...(body.instagramAccountId && { instagramAccountId: body.instagramAccountId }),
        ...(body.triggerType && { triggerType: body.triggerType }),
        ...(body.triggerPhrases && { triggerPhrases: body.triggerPhrases }),
        ...(body.exactMatchText !== undefined && { exactMatchText: body.exactMatchText }),
        ...(body.partialMatchText !== undefined && { partialMatchText: body.partialMatchText }),
        ...(body.isCaseSensitive !== undefined && { isCaseSensitive: !!body.isCaseSensitive }),
        ...(body.matchBehavior && { matchBehavior: body.matchBehavior }),
        ...(body.excludedKeywords && { excludedKeywords: body.excludedKeywords }),
        ...(body.excludedPhrases && { excludedPhrases: body.excludedPhrases }),
        ...(body.targetPostSelection && { targetPostSelection: body.targetPostSelection }),
        ...(body.targetPostIds && { targetPostIds: body.targetPostIds }),
        ...(body.postFilter !== undefined && { postFilter: body.postFilter }),
        ...(body.responseAction && { responseAction: body.responseAction }),
        ...(body.publicReplyConfig !== undefined && { publicReplyConfig: body.publicReplyConfig }),
        ...(body.privateMessageConfig !== undefined && { privateMessageConfig: body.privateMessageConfig }),
        ...(body.actions !== undefined && { actions: body.actions }),
        ...(body.delayConfig !== undefined && { delayConfig: body.delayConfig }),
        ...(body.limitsConfig !== undefined && { limitsConfig: body.limitsConfig }),
        ...(body.duplicatePrevention !== undefined && { duplicatePrevention: body.duplicatePrevention }),
        ...(body.cooldownConfig !== undefined && { cooldownConfig: body.cooldownConfig }),
        ...(body.scheduleConfig !== undefined && { scheduleConfig: body.scheduleConfig }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.conflictPolicy && { conflictPolicy: body.conflictPolicy }),
        ...(body.errorHandlingConfig !== undefined && { errorHandlingConfig: body.errorHandlingConfig }),
        ...(body.isTestMode !== undefined && { isTestMode: !!body.isTestMode }),
        ...(body.normalizationConfig !== undefined && { normalizationConfig: body.normalizationConfig }),
        ...(body.userConditionsConfig !== undefined && { userConditionsConfig: body.userConditionsConfig }),
        ...(body.commentConditionsConfig !== undefined && { commentConditionsConfig: body.commentConditionsConfig }),
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

// ─── TEST AUTOMATION SIMULATOR ──────────────────────────────────────────────
router.post("/comment-automations/:id/test", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testUsername, testCommentText } = req.body;

    const simulation = await InstagramCommentEngine.evaluateTestSimulation(id, (testUsername as string) || "", (testCommentText as string) || "");

    if (!simulation.success) {
      return res.status(200).json({
        success: false,
        message: simulation.diagnostic || `Test comment did not match rule criteria.`,
        details: simulation
      });
    }

    return res.status(200).json({
      success: true,
      matchedKeyword: simulation.matchedKeyword,
      previewDmText: simulation.previewDmText,
      previewPublicReply: simulation.previewPublicReply,
      documentAttached: simulation.documentLinkAttached,
      details: simulation,
      message: `Test passed! Matched trigger '${simulation.matchedKeyword}' cleanly.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Test execution failed", details: error.message });
  }
});

// Helper matching logic for backwards compatibility
export function checkKeywordMatch(
  commentText: string,
  keywords: string[],
  matchingMode: string = "CONTAINS"
): { isMatch: boolean; keyword: string } {
  const matchResult = InstagramCommentEngine.evaluateTriggerMatch(commentText, {
    keywords,
    matchingMode,
    triggerType: "SPECIFIC_KEYWORD"
  });

  return {
    isMatch: matchResult.isMatch,
    keyword: matchResult.matchedKeyword || ""
  };
}

export default router;
