import prisma from "../utils/prisma";
import { InstagramService } from "./instagramService";

export interface NormalizationOptions {
  trimWhitespace?: boolean;
  normalizeSpaces?: boolean;
  removePunctuation?: boolean;
  normalizeDiacritics?: boolean;
  isCaseSensitive?: boolean;
}

export interface MatchResult {
  isMatch: boolean;
  triggerType: string;
  matchedKeyword?: string;
  matchedPhrase?: string;
  matchedCondition?: string;
  skipReason?: string;
}

export interface ScheduleOptions {
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
  activeDays?: number[] | null; // 0=Sun, 1=Mon, ..., 6=Sat
  businessHoursOnly?: boolean | null;
}

export interface CooldownOptions {
  commentCooldownSeconds?: number;
  userCooldownSeconds?: number;
  postCooldownSeconds?: number;
  globalCooldownSeconds?: number;
}

export interface LimitsOptions {
  maxPerUser?: number;
  maxPerPost?: number;
  maxPerAutomation?: number;
  maxPerAccount?: number;
  maxPerMinute?: number;
  maxPerHour?: number;
  maxPerDay?: number;
}

export interface UserConditionsOptions {
  userType?: "ALL" | "NEW" | "EXISTING";
  requireNoPreviousMessage?: boolean;
  requireNoPreviousPublicReply?: boolean;
  maxMessagesPerUser?: number;
}

export interface ActionDefinition {
  id: string;
  type: "PUBLIC_REPLY" | "PRIVATE_MESSAGE" | "LOG_ACTIVITY" | "UPDATE_STATS";
  order: number;
  delaySeconds?: number;
  enabled?: boolean;
  templates?: string[];
  templateSelection?: "RANDOM" | "SEQUENCE";
  documentUrl?: string;
  documentName?: string;
  text?: string;
}

export interface ProcessCommentEventPayload {
  commentId: string;
  mediaId: string;
  commentText: string;
  fromUser: string;
  fromUserId?: string;
  postTimestamp?: Date | string;
  organizationId?: string;
  pageAccessToken?: string;
  pageId?: string;
  instagramAccountId?: string;
}

export class InstagramCommentEngine {
  // ─── 1. COMMENT NORMALIZATION ENGINE ─────────────────────────────────────
  public static normalizeText(text: string, options: NormalizationOptions = {}): string {
    if (!text) return "";

    let result = text;

    // A. Trim leading/trailing spaces
    if (options.trimWhitespace !== false) {
      result = result.trim();
    }

    // B. Normalize repeated whitespace
    if (options.normalizeSpaces !== false) {
      result = result.replace(/\s+/g, " ");
    }

    // C. Unicode-safe Accent / Diacritic Normalization (NFD)
    if (options.normalizeDiacritics) {
      result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // D. Optional Punctuation Insensitive Matching
    if (options.removePunctuation) {
      result = result.replace(/[.,/#!$%^&*;:{}=\-_`~()?'"!?]/g, "");
    }

    // E. Case Normalization
    if (!options.isCaseSensitive) {
      result = result.toLowerCase();
    }

    return result;
  }

  // ─── 2. TRIGGER & MATCH EVALUATOR ─────────────────────────────────────────
  public static evaluateTriggerMatch(
    rawComment: string,
    automation: any
  ): MatchResult {
    const isCaseSensitive = !!automation.isCaseSensitive;
    const normalizationOpts: NormalizationOptions = {
      trimWhitespace: true,
      normalizeSpaces: true,
      isCaseSensitive,
      ...(automation.normalizationConfig || {})
    };

    const normalizedComment = this.normalizeText(rawComment, normalizationOpts);

    if (!normalizedComment) {
      return { isMatch: false, triggerType: automation.triggerType || "SPECIFIC_KEYWORD", skipReason: "EMPTY_COMMENT" };
    }

    // A. Evaluate Negative Keywords & Negative Phrases FIRST
    const excludedKeywords: string[] = Array.isArray(automation.excludedKeywords) ? automation.excludedKeywords : [];
    const excludedPhrases: string[] = Array.isArray(automation.excludedPhrases) ? automation.excludedPhrases : [];

    for (const exKw of excludedKeywords) {
      if (!exKw) continue;
      const normalizedExKw = this.normalizeText(exKw, normalizationOpts);
      if (normalizedExKw && normalizedComment.includes(normalizedExKw)) {
        return {
          isMatch: false,
          triggerType: automation.triggerType || "SPECIFIC_KEYWORD",
          skipReason: `CONTAINED_EXCLUDED_KEYWORD:${exKw}`
        };
      }
    }

    for (const exPhr of excludedPhrases) {
      if (!exPhr) continue;
      const normalizedExPhr = this.normalizeText(exPhr, normalizationOpts);
      if (normalizedExPhr && normalizedComment.includes(normalizedExPhr)) {
        return {
          isMatch: false,
          triggerType: automation.triggerType || "SPECIFIC_KEYWORD",
          skipReason: `CONTAINED_EXCLUDED_PHRASE:${exPhr}`
        };
      }
    }

    const triggerType = automation.triggerType || "SPECIFIC_KEYWORD";
    const matchingMode = automation.matchingMode || "CONTAINS";

    // B. ANY COMMENT / EMOJI Trigger
    if (triggerType === "ANY_COMMENT" || matchingMode === "ANY_COMMENT") {
      return {
        isMatch: true,
        triggerType: "ANY_COMMENT",
        matchedKeyword: "ANY_COMMENT_EMOJI",
        matchedCondition: "ANY_COMMENT"
      };
    }

    // C. EXACT COMMENT Trigger
    if (triggerType === "EXACT_COMMENT" || matchingMode === "EXACT") {
      const exactTarget = automation.exactMatchText || (automation.keywords && automation.keywords[0]) || "";
      const normalizedExact = this.normalizeText(exactTarget, normalizationOpts);

      if (normalizedComment === normalizedExact) {
        return {
          isMatch: true,
          triggerType,
          matchedKeyword: exactTarget,
          matchedCondition: "EXACT_COMMENT"
        };
      }
      return { isMatch: false, triggerType };
    }

    // D. PHRASE MATCH Trigger
    if (triggerType === "PHRASE_MATCH" || matchingMode === "PHRASE") {
      const phrases: string[] = Array.isArray(automation.triggerPhrases) && automation.triggerPhrases.length > 0
        ? automation.triggerPhrases
        : (automation.keywords || []);

      for (const phrase of phrases) {
        if (!phrase) continue;
        const normalizedPhrase = this.normalizeText(phrase, normalizationOpts);
        if (normalizedPhrase && normalizedComment.includes(normalizedPhrase)) {
          return {
            isMatch: true,
            triggerType,
            matchedPhrase: phrase,
            matchedCondition: "PHRASE_MATCH"
          };
        }
      }
      return { isMatch: false, triggerType };
    }

    // E. PATTERN MATCH (Regex) Trigger
    if (triggerType === "PATTERN_MATCH" || matchingMode === "PATTERN") {
      const patternStr = automation.exactMatchText || (automation.keywords && automation.keywords[0]) || "";
      if (patternStr) {
        try {
          const flags = isCaseSensitive ? "" : "i";
          const regex = new RegExp(patternStr, flags);
          if (regex.test(rawComment)) {
            return {
              isMatch: true,
              triggerType,
              matchedCondition: `PATTERN_MATCH:${patternStr}`
            };
          }
        } catch (err: any) {
          console.warn(`[REGEXP MATCH WARN] Invalid regex pattern '${patternStr}':`, err.message);
          return { isMatch: false, triggerType, skipReason: "INVALID_REGEX_PATTERN" };
        }
      }
      return { isMatch: false, triggerType };
    }

    // F. MULTIPLE KEYWORDS & SPECIFIC KEYWORDS Trigger
    const keywords: string[] = Array.isArray(automation.keywords) ? automation.keywords : [];
    const matchBehavior = automation.matchBehavior || "ANY"; // ANY vs ALL

    if (keywords.length === 0) {
      return { isMatch: false, triggerType, skipReason: "NO_KEYWORDS_CONFIGURED" };
    }

    const matchedKeywords: string[] = [];

    for (const kw of keywords) {
      if (!kw) continue;
      const normalizedKw = this.normalizeText(kw, normalizationOpts);
      if (!normalizedKw) continue;

      let isKwMatched = false;

      if (matchingMode === "CONTAINS") {
        isKwMatched = normalizedComment.includes(normalizedKw);
      } else if (matchingMode === "WHOLE_WORD") {
        const escaped = normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = isCaseSensitive ? "" : "i";
        const regex = new RegExp(`(?:^|\\s|\\b)${escaped}(?:$|\\s|\\b)`, flags);
        isKwMatched = regex.test(normalizedComment);
      } else if (matchingMode === "STARTS_WITH") {
        isKwMatched = normalizedComment.startsWith(normalizedKw);
      } else if (matchingMode === "ENDS_WITH") {
        isKwMatched = normalizedComment.endsWith(normalizedKw);
      } else {
        isKwMatched = normalizedComment.includes(normalizedKw);
      }

      if (isKwMatched) {
        matchedKeywords.push(kw);
        if (matchBehavior === "ANY") {
          return {
            isMatch: true,
            triggerType,
            matchedKeyword: kw,
            matchedCondition: `KEYWORD_${matchingMode}:ANY`
          };
        }
      }
    }

    if (matchBehavior === "ALL" && matchedKeywords.length === keywords.length && keywords.length > 0) {
      return {
        isMatch: true,
        triggerType,
        matchedKeyword: matchedKeywords.join(" + "),
        matchedCondition: `KEYWORD_${matchingMode}:ALL`
      };
    }

    return { isMatch: false, triggerType };
  }

  // ─── 3. POST TARGETING & ELIGIBILITY ─────────────────────────────────────
  public static isPostEligible(mediaId: string, automation: any, postTimestamp?: Date | string): boolean {
    const selection = automation.targetPostSelection || (automation.mediaId === "ALL" ? "ALL" : "SPECIFIC");

    if (selection === "ALL" || automation.mediaId === "ALL") {
      return true;
    }

    if (selection === "SPECIFIC") {
      return automation.mediaId === mediaId || (Array.isArray(automation.targetPostIds) && automation.targetPostIds.includes(mediaId));
    }

    if (selection === "MULTIPLE") {
      const ids: string[] = Array.isArray(automation.targetPostIds) ? automation.targetPostIds : [automation.mediaId];
      return ids.includes(mediaId);
    }

    if (selection === "FUTURE") {
      if (!postTimestamp) return true;
      const pubDate = new Date(postTimestamp);
      const createdAt = new Date(automation.createdAt);
      return pubDate.getTime() >= createdAt.getTime();
    }

    return automation.mediaId === mediaId;
  }

  // ─── 4. SCHEDULE & BUSINESS HOURS CHECK ──────────────────────────────────
  public static isScheduleValid(schedule?: ScheduleOptions | null): { valid: boolean; reason?: string } {
    if (!schedule) return { valid: true };

    const now = new Date();

    if (schedule.startDate) {
      const start = new Date(schedule.startDate);
      if (now < start) {
        return { valid: false, reason: "BEFORE_SCHEDULE_START_DATE" };
      }
    }

    if (schedule.endDate) {
      const end = new Date(schedule.endDate);
      if (now > end) {
        return { valid: false, reason: "AFTER_SCHEDULE_END_DATE" };
      }
    }

    if (Array.isArray(schedule.activeDays) && schedule.activeDays.length > 0) {
      const currentDay = now.getDay(); // 0=Sunday, 1=Monday...
      if (!schedule.activeDays.includes(currentDay)) {
        return { valid: false, reason: `OUTSIDE_ACTIVE_DAYS:${currentDay}` };
      }
    }

    if (schedule.startTime && schedule.endTime) {
      const [startHour, startMin] = schedule.startTime.split(":").map(Number);
      const [endHour, endMin] = schedule.endTime.split(":").map(Number);

      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentMins = currentHour * 60 + currentMin;
      const startMins = startHour * 60 + (startMin || 0);
      const endMins = endHour * 60 + (endMin || 0);

      if (currentMins < startMins || currentMins > endMins) {
        return { valid: false, reason: `OUTSIDE_BUSINESS_HOURS:${schedule.startTime}-${schedule.endTime}` };
      }
    }

    return { valid: true };
  }

  // ─── 5. USER & COOLDOWN CONDITIONS ───────────────────────────────────────
  public static async evaluateUserAndCooldownConditions(
    automation: any,
    commenterUser: string,
    commenterId?: string,
    commentId?: string,
    mediaId?: string
  ): Promise<{ valid: boolean; reason?: string }> {
    const userKey = commenterId || commenterUser;

    // A. Check User Cooldown & Cooldown Options
    const cooldownOpts: CooldownOptions = automation.cooldownConfig || {};
    const now = new Date();

    if (cooldownOpts.userCooldownSeconds && cooldownOpts.userCooldownSeconds > 0) {
      const windowStart = new Date(now.getTime() - cooldownOpts.userCooldownSeconds * 1000);
      const recentUserLog = await (prisma as any).instagramCommentAuditLog.findFirst({
        where: {
          automationId: automation.id,
          OR: [
            { commenterUser },
            ...(commenterId ? [{ commenterId }] : [])
          ],
          createdAt: { gte: windowStart }
        }
      });

      if (recentUserLog) {
        return { valid: false, reason: `USER_COOLDOWN_ACTIVE:${cooldownOpts.userCooldownSeconds}s` };
      }
    }

    if (cooldownOpts.postCooldownSeconds && cooldownOpts.postCooldownSeconds > 0 && mediaId) {
      const windowStart = new Date(now.getTime() - cooldownOpts.postCooldownSeconds * 1000);
      const recentPostLog = await (prisma as any).instagramCommentAuditLog.findFirst({
        where: {
          automationId: automation.id,
          mediaId,
          createdAt: { gte: windowStart }
        }
      });

      if (recentPostLog) {
        return { valid: false, reason: `POST_COOLDOWN_ACTIVE:${cooldownOpts.postCooldownSeconds}s` };
      }
    }

    // B. Check Execution Limits (Max per user, Max per automation)
    const limitsOpts: LimitsOptions = automation.limitsConfig || {};
    if (limitsOpts.maxPerUser && limitsOpts.maxPerUser > 0) {
      const totalUserTriggers = await (prisma as any).instagramCommentAuditLog.count({
        where: {
          automationId: automation.id,
          OR: [
            { commenterUser },
            ...(commenterId ? [{ commenterId }] : [])
          ],
          status: "SUCCESS"
        }
      });

      if (totalUserTriggers >= limitsOpts.maxPerUser) {
        return { valid: false, reason: `MAX_USER_EXECUTIONS_REACHED:${limitsOpts.maxPerUser}` };
      }
    }

    if (limitsOpts.maxPerAutomation && limitsOpts.maxPerAutomation > 0) {
      const totalAutoTriggers = await (prisma as any).instagramCommentAuditLog.count({
        where: {
          automationId: automation.id,
          status: "SUCCESS"
        }
      });

      if (totalAutoTriggers >= limitsOpts.maxPerAutomation) {
        return { valid: false, reason: `MAX_AUTOMATION_EXECUTIONS_REACHED:${limitsOpts.maxPerAutomation}` };
      }
    }

    // C. User Conditions Config
    const userConditions: UserConditionsOptions = automation.userConditionsConfig || {};
    if (userConditions.userType === "NEW" || userConditions.requireNoPreviousMessage) {
      const priorLog = await (prisma as any).instagramCommentAuditLog.findFirst({
        where: {
          OR: [
            { commenterUser },
            ...(commenterId ? [{ commenterId }] : [])
          ],
          privateDmSent: true
        }
      });
      if (priorLog) {
        return { valid: false, reason: "USER_ALREADY_RECEIVED_DM" };
      }
    }

    return { valid: true };
  }

  // ─── 6. VARIABLE TEMPLATE RENDERER ───────────────────────────────────────
  public static renderTemplate(template: string, vars: Record<string, any>): string {
    if (!template) return "";

    let rendered = template;
    const defaultVars: Record<string, string> = {
      commenter_name: vars.commenterUser || vars.username || "friend",
      username: vars.commenterUser || vars.username || "friend",
      comment_text: vars.commentText || "",
      post_id: vars.mediaId || "",
      automation_name: vars.automationName || "",
      document_link: vars.documentUrl || "https://www.jisnudigital.com/docs/guide.pdf"
    };

    for (const [key, val] of Object.entries(defaultVars)) {
      const doubleRegex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
      const singleRegex = new RegExp(`\\{${key}\\}`, "gi");
      rendered = rendered.replace(doubleRegex, val).replace(singleRegex, val);
    }

    return rendered;
  }

  // ─── 7. MULTI-ACTION SELECTION & VARIATIONS ─────────────────────────────
  public static selectTemplateVariation(templates?: string[], mode: "RANDOM" | "SEQUENCE" = "RANDOM"): string {
    if (!templates || templates.length === 0) return "";
    if (templates.length === 1) return templates[0];

    if (mode === "RANDOM") {
      const idx = Math.floor(Math.random() * templates.length);
      return templates[idx];
    }

    // Fallback: pick first
    return templates[0];
  }

  // ─── 8. MAIN PRODUCTION AUTOMATION PROCESSOR ─────────────────────────────
  public static async processIncomingComment(payload: ProcessCommentEventPayload): Promise<{
    status: string;
    matchedRules: number;
    executedActions: number;
    results: any[];
  }> {
    const startTime = Date.now();
    const {
      commentId,
      mediaId,
      commentText,
      fromUser,
      fromUserId,
      postTimestamp,
      organizationId,
      pageAccessToken,
      pageId
    } = payload;

    // A. Self-Comment / Bot Loop Prevention
    const isSelfComment = fromUserId === pageId;

    if (isSelfComment) {
      console.log(`[INSTAGRAM ENGINE] Ignored comment from self/bot account (@${fromUser}).`);
      return { status: "SKIPPED_SELF_COMMENT", matchedRules: 0, executedActions: 0, results: [] };
    }

    // B. Fetch all ACTIVE Automations matching account/organization
    const automations = await (prisma as any).instagramCommentAutomation.findMany({
      where: {
        status: "ACTIVE",
        ...(organizationId ? { organizationId } : {})
      },
      orderBy: [
        { priority: "asc" }, // Priority 1 executes before Priority 10
        { createdAt: "desc" }
      ]
    });

    if (!automations || automations.length === 0) {
      return { status: "NO_ACTIVE_RULES", matchedRules: 0, executedActions: 0, results: [] };
    }

    const matchedAutomations: { automation: any; match: MatchResult }[] = [];

    // C. Evaluate Candidates
    for (const auto of automations) {
      // 1. Post Eligibility
      if (!this.isPostEligible(mediaId, auto, postTimestamp)) {
        continue;
      }

      // 2. Schedule & Business Hours
      const schedCheck = this.isScheduleValid(auto.scheduleConfig as any);
      if (!schedCheck.valid) {
        console.log(`[INSTAGRAM ENGINE] Automation '${auto.name}' schedule invalid: ${schedCheck.reason}`);
        continue;
      }

      // 3. Trigger Match
      const matchResult = this.evaluateTriggerMatch(commentText, auto);
      if (matchResult.isMatch) {
        matchedAutomations.push({ automation: auto, match: matchResult });
      }
    }

    if (matchedAutomations.length === 0) {
      return { status: "NOT_MATCHED", matchedRules: 0, executedActions: 0, results: [] };
    }

    // D. Conflict Policy Resolution
    let selectedRules = matchedAutomations;
    const primaryPolicy = matchedAutomations[0].automation.conflictPolicy || "HIGHEST_PRIORITY_ONLY";

    if (primaryPolicy === "HIGHEST_PRIORITY_ONLY" || primaryPolicy === "HIGHEST_PRIORITY_AND_STOP" || primaryPolicy === "FIRST_MATCHING") {
      selectedRules = [matchedAutomations[0]];
    }

    const executionResults: any[] = [];
    let totalActionsExecuted = 0;

    // E. Execute Selected Rules
    for (const { automation: auto, match } of selectedRules) {
      // 1. Cooldown & User Qualification
      const userCheck = await this.evaluateUserAndCooldownConditions(auto, fromUser, fromUserId, commentId, mediaId);
      if (!userCheck.valid) {
        console.log(`[INSTAGRAM ENGINE] Rule '${auto.name}' skipped for @${fromUser}: ${userCheck.reason}`);

        await (prisma as any).instagramCommentAuditLog.create({
          data: {
            organizationId: auto.organizationId,
            automationId: auto.id,
            commentId: `${commentId}_skipped_${auto.id}`,
            mediaId,
            commenterUser: fromUser,
            commenterId: fromUserId,
            commentText,
            matchedKeyword: match.matchedKeyword || match.matchedPhrase || "MATCHED",
            matchedPhrase: match.matchedPhrase,
            matchedCondition: match.matchedCondition,
            status: "SKIPPED",
            skipReason: userCheck.reason,
            processingDurationMs: Date.now() - startTime
          }
        }).catch(() => {});

        executionResults.push({ automationId: auto.id, name: auto.name, status: "SKIPPED", reason: userCheck.reason });
        continue;
      }

      // 2. Idempotency Guard (Ensure exact commentId is processed only once per rule)
      const existingLog = await (prisma as any).instagramCommentAuditLog.findUnique({
        where: { commentId }
      }).catch(() => null);

      if (existingLog) {
        console.log(`[INSTAGRAM ENGINE] Duplicate webhook event ignored for commentId ${commentId}`);
        executionResults.push({ automationId: auto.id, name: auto.name, status: "SKIPPED_DUPLICATE" });
        continue;
      }

      // 3. Build Action Sequence
      const actionSequence: ActionDefinition[] = [];
      if (Array.isArray(auto.actions) && auto.actions.length > 0) {
        actionSequence.push(...auto.actions);
      } else {
        // Fallback default action sequence based on responseAction
        const mode = auto.responseAction || "BOTH";
        if (mode === "PUBLIC_REPLY" || mode === "BOTH") {
          actionSequence.push({
            id: "act_pub_1",
            type: "PUBLIC_REPLY",
            order: 1,
            enabled: auto.enablePublicReply !== false,
            templates: auto.publicReplyConfig?.templates || [auto.publicReplyTemplate || "Thanks @{username}! Check your DMs for details 📩"]
          });
        }
        if (mode === "PRIVATE_MESSAGE" || mode === "BOTH") {
          actionSequence.push({
            id: "act_dm_1",
            type: "PRIVATE_MESSAGE",
            order: 2,
            enabled: true,
            templates: auto.privateMessageConfig?.templates || [auto.privateMessageTemplate],
            documentUrl: auto.documentUrl,
            documentName: auto.documentName
          });
        }
      }

      actionSequence.sort((a, b) => a.order - b.order);

      // 4. Pre-flight Token Check
      if (!pageAccessToken && !process.env.INSTAGRAM_ACCESS_TOKEN && !process.env.META_SYSTEM_USER_TOKEN) {
        console.warn(`[INSTAGRAM ENGINE] Missing pageAccessToken for Org ${auto.organizationId}`);
      }

      const activeToken = pageAccessToken || process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN || "";
      const actionStatuses: any[] = [];
      let dmSuccess = false;
      let publicReplyTextSent: string | null = null;
      let dmErrorMsg: string | null = null;

      // 5. Execute Action Pipeline
      for (const action of actionSequence) {
        if (action.enabled === false) continue;

        const actionStart = Date.now();
        let actionStatus = "PENDING";
        let actionError: string | null = null;

        // Apply Action Delay if configured
        if (action.delaySeconds && action.delaySeconds > 0) {
          await new Promise((resolve) => setTimeout(resolve, Math.min(action.delaySeconds! * 1000, 10000)));
        }

        if (action.type === "PUBLIC_REPLY") {
          const rawTemplate = this.selectTemplateVariation(action.templates || [auto.publicReplyTemplate], action.templateSelection);
          const replyText = this.renderTemplate(rawTemplate || "Thanks @{username}! Check your DMs 📩", {
            commenterUser: fromUser,
            mediaId,
            automationName: auto.name
          });

          publicReplyTextSent = replyText;

          if (activeToken) {
            try {
              await InstagramService.replyToComment(activeToken, commentId, replyText);
              actionStatus = "SUCCESS";
              console.log(`[INSTAGRAM ENGINE] Public reply sent for comment ${commentId}`);
            } catch (err: any) {
              actionStatus = "FAILED";
              actionError = err?.response?.data?.error?.message || err.message;
              console.warn(`[INSTAGRAM ENGINE] Public reply failed: ${actionError}`);
            }
          } else {
            actionStatus = "SUCCESS"; // Mock mode
          }
        } else if (action.type === "PRIVATE_MESSAGE") {
          const docLink = action.documentUrl || auto.documentUrl || "https://www.jisnudigital.com/docs/guide.pdf";
          const rawTemplate = this.selectTemplateVariation(action.templates || [auto.privateMessageTemplate], action.templateSelection);
          const dmText = this.renderTemplate(rawTemplate || auto.privateMessageTemplate, {
            commenterUser: fromUser,
            mediaId,
            automationName: auto.name,
            documentUrl: docLink
          });

          if (commentId && activeToken) {
            try {
              await InstagramService.sendPrivateReplyToComment(activeToken, commentId, dmText, pageId);
              dmSuccess = true;
              actionStatus = "SUCCESS";
              console.log(`[INSTAGRAM ENGINE] Private DM delivered to @${fromUser} via comment_id (${commentId})`);
            } catch (err: any) {
              actionStatus = "FAILED";
              actionError = err?.response?.data?.error?.message || err.message;
              dmErrorMsg = actionError;
              console.warn(`[INSTAGRAM ENGINE] Private DM failed for comment_id ${commentId}: ${actionError}`);
            }
          } else {
            dmSuccess = true;
            actionStatus = "SUCCESS";
          }
        }

        totalActionsExecuted++;
        actionStatuses.push({
          actionId: action.id,
          actionType: action.type,
          status: actionStatus,
          durationMs: Date.now() - actionStart,
          errorMessage: actionError
        });
      }

      const overallStatus = dmSuccess ? "SUCCESS" : actionStatuses.some(a => a.status === "FAILED") ? "FAILED" : "SUCCESS";
      const durationMs = Date.now() - startTime;

      // 6. Update Automation Performance Statistics in DB
      await (prisma as any).instagramCommentAutomation.update({
        where: { id: auto.id },
        data: {
          commentsCount: { increment: 1 },
          matchesCount: { increment: 1 },
          ...(dmSuccess ? { dmsSentCount: { increment: 1 } } : {}),
          lastTriggeredAt: new Date()
        }
      }).catch((err: any) => console.error("Error updating automation stats:", err));

      // 7. Record Production Execution Audit Log
      await (prisma as any).instagramCommentAuditLog.create({
        data: {
          organizationId: auto.organizationId,
          automationId: auto.id,
          commentId,
          mediaId,
          commenterUser: fromUser,
          commenterId: fromUserId,
          commentText,
          matchedKeyword: match.matchedKeyword || match.matchedPhrase || "MATCHED",
          matchedPhrase: match.matchedPhrase,
          matchedCondition: match.matchedCondition,
          documentSent: auto.documentUrl || null,
          publicReplySent: publicReplyTextSent,
          privateDmSent: dmSuccess,
          status: overallStatus,
          actionStatuses,
          errorMessage: dmErrorMsg,
          processingDurationMs: durationMs
        }
      }).catch((err: any) => console.error("Error creating audit log:", err));

      executionResults.push({
        automationId: auto.id,
        name: auto.name,
        status: overallStatus,
        durationMs,
        actionStatuses
      });
    }

    return {
      status: "COMPLETED",
      matchedRules: selectedRules.length,
      executedActions: totalActionsExecuted,
      results: executionResults
    };
  }

  // ─── 9. DRY-RUN / TEST MODE SIMULATOR ────────────────────────────────────
  public static async evaluateTestSimulation(automationId: string, testUsername: string, testCommentText: string): Promise<any> {
    const automation = await (prisma as any).instagramCommentAutomation.findUnique({
      where: { id: automationId }
    });

    if (!automation) {
      return { success: false, error: "Automation rule not found" };
    }

    const commenterUser = testUsername || "test_user";
    const rawComment = testCommentText || (automation.keywords && automation.keywords[0]) || "PRICE";

    // 1. Post Eligibility Test
    const postEligible = this.isPostEligible(automation.mediaId, automation);

    // 2. Schedule Test
    const scheduleCheck = this.isScheduleValid(automation.scheduleConfig as any);

    // 3. Trigger Match Test
    const matchResult = this.evaluateTriggerMatch(rawComment, automation);

    if (!matchResult.isMatch) {
      return {
        success: false,
        ruleName: automation.name,
        matched: false,
        skipReason: matchResult.skipReason || "KEYWORD_NOT_MATCHED",
        diagnostic: `Comment "${rawComment}" did not match automation rule under mode '${automation.matchingMode}'.`,
        configuredKeywords: automation.keywords,
        configuredPhrases: automation.triggerPhrases,
        excludedKeywords: automation.excludedKeywords
      };
    }

    // Render Preview Messages
    const docLink = automation.documentUrl || "https://www.jisnudigital.com/docs/guide.pdf";
    const previewDmText = this.renderTemplate(automation.privateMessageTemplate, {
      commenterUser,
      mediaId: automation.mediaId,
      automationName: automation.name,
      documentUrl: docLink
    });

    const previewPublicReply = this.renderTemplate(
      automation.publicReplyTemplate || "Thanks @{username}! Check your DMs for details 📩",
      { commenterUser, mediaId: automation.mediaId }
    );

    return {
      success: true,
      ruleName: automation.name,
      matched: true,
      triggerType: matchResult.triggerType,
      matchedKeyword: matchResult.matchedKeyword || matchResult.matchedPhrase,
      matchedCondition: matchResult.matchedCondition,
      postEligible,
      scheduleValid: scheduleCheck.valid,
      previewDmText,
      previewPublicReply,
      documentLinkAttached: docLink,
      actionsThatWouldExecute: [
        ...(automation.enablePublicReply !== false ? [{ type: "PUBLIC_REPLY", template: previewPublicReply }] : []),
        { type: "PRIVATE_MESSAGE", template: previewDmText, document: docLink }
      ]
    };
  }
}
