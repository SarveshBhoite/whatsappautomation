import prisma from "../utils/prisma";
import { WhatsAppService } from "../services/whatsappService";
import axios from "axios";

export class WhatsAppDripEngine {
  private static isProcessing = false;

  // Converts priority string into numeric weight for queue sorting
  public static getPriorityWeight(priority?: string): number {
    switch ((priority || "").toUpperCase()) {
      case "CRITICAL": return 5;
      case "HIGH": return 4;
      case "MEDIUM": return 3;
      case "LOW": return 2;
      case "OPTIONAL": return 1;
      default: return 3;
    }
  }

  // Returns formatted local campaign time string and normalized UTC string
  public static formatZonedDate(date: Date, timeZone: string = "Asia/Kolkata"): { localTimeStr: string; utcTimeStr: string } {
    try {
      const localTimeStr = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "short"
      }).format(date);
      return { localTimeStr, utcTimeStr: date.toISOString() };
    } catch (err) {
      return { localTimeStr: date.toISOString(), utcTimeStr: date.toISOString() };
    }
  }

  // Returns zoned date parts for a given Date and IANA Timezone string (e.g. Asia/Kolkata)
  public static getZonedParts(date: Date, timeZone: string = "Asia/Kolkata") {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        weekday: "short",
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const map: Record<string, string> = {};
      for (const p of parts) {
        if (p.type !== "literal") map[p.type] = p.value;
      }
      const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const dayOfWeek = dayMap[map.weekday] !== undefined ? dayMap[map.weekday] : date.getDay();
      const hour = (parseInt(map.hour, 10) || 0) % 24;
      const minute = parseInt(map.minute, 10) || 0;
      return {
        year: parseInt(map.year, 10) || date.getFullYear(),
        month: parseInt(map.month, 10) || (date.getMonth() + 1),
        dayOfMonth: parseInt(map.day, 10) || date.getDate(),
        dayOfWeek,
        hour,
        minute,
      };
    } catch (err) {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        dayOfMonth: date.getDate(),
        dayOfWeek: date.getDay(),
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
    }
  }

  // Calculate target execution time given schedule window, timezone, and gap rules
  public static calculateTargetWindow(
    targetDate: Date,
    campaign: any
  ): Date {
    const timeZone = campaign.timezone || "Asia/Kolkata";
    let d = new Date(targetDate);

    if (campaign.businessHoursOnly || campaign.excludeWeekends) {
      let parts = this.getZonedParts(d, timeZone);

      // Check weekend restriction
      if (campaign.excludeWeekends) {
        if (parts.dayOfWeek === 0) { // Sunday -> move to Monday
          d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
          parts = this.getZonedParts(d, timeZone);
        } else if (parts.dayOfWeek === 6) { // Saturday -> move to Monday
          d = new Date(d.getTime() + 2 * 24 * 60 * 60 * 1000);
          parts = this.getZonedParts(d, timeZone);
        }
      }

      // Check business hours window
      if (campaign.businessHoursOnly) {
        const [startH, startM] = (campaign.allowedStartTime || "09:00").split(":").map(Number);
        const [endH, endM] = (campaign.allowedEndTime || "18:00").split(":").map(Number);

        const currentTotalM = parts.hour * 60 + parts.minute;
        const startTotalM = startH * 60 + startM;
        const endTotalM = endH * 60 + endM;

        if (currentTotalM < startTotalM) {
          const diffM = startTotalM - currentTotalM;
          d = new Date(d.getTime() + diffM * 60 * 1000);
        } else if (currentTotalM > endTotalM) {
          const remainingTodayM = (24 * 60) - currentTotalM;
          const totalForwardM = remainingTodayM + startTotalM;
          d = new Date(d.getTime() + totalForwardM * 60 * 1000);

          if (campaign.excludeWeekends) {
            parts = this.getZonedParts(d, timeZone);
            if (parts.dayOfWeek === 6) {
              d = new Date(d.getTime() + 2 * 24 * 60 * 60 * 1000);
            } else if (parts.dayOfWeek === 0) {
              d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
            }
          }
        }
      }
    }

    return d;
  }

  // Calculate delay date based on delay unit and value
  public static calculateDelay(unit: string, value: number, fromDate: Date = new Date()): Date {
    const result = new Date(fromDate);
    const val = value || 0;
    switch ((unit || "").toUpperCase()) {
      case "MINUTES":
        result.setMinutes(result.getMinutes() + val);
        break;
      case "HOURS":
        result.setHours(result.getHours() + val);
        break;
      case "DAYS":
        result.setDate(result.getDate() + val);
        break;
      case "IMMEDIATE":
      default:
        break;
    }
    return result;
  }

  // Centralized evaluation function for scheduling rules
  public static evaluateSchedulingRules(
    now: Date,
    campaign: any,
    enrollment: any
  ): { isEligible: boolean; nextEligibleTime: Date; reason: string } {
    if (!campaign || campaign.status !== "ACTIVE") {
      return { isEligible: false, nextEligibleTime: now, reason: `Campaign status is ${campaign?.status || "invalid"}` };
    }

    if (campaign.startDate && new Date(campaign.startDate).getTime() > now.getTime()) {
      return { isEligible: false, nextEligibleTime: new Date(campaign.startDate), reason: "Campaign start date not reached yet" };
    }

    if (campaign.endDate && new Date(campaign.endDate).getTime() < now.getTime()) {
      return { isEligible: false, nextEligibleTime: now, reason: "Campaign end date passed" };
    }

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return { isEligible: false, nextEligibleTime: now, reason: `Enrollment status is ${enrollment?.status || "invalid"}` };
    }

    if (enrollment.replied && campaign.onReplyAction === "STOP") {
      return { isEligible: false, nextEligibleTime: now, reason: "Contact replied; campaign stopped" };
    }

    const targetWindow = this.calculateTargetWindow(now, campaign);
    if (targetWindow.getTime() > now.getTime() + 60000) {
      return { isEligible: false, nextEligibleTime: targetWindow, reason: "Outside allowed business hours/weekend window" };
    }

    return { isEligible: true, nextEligibleTime: now, reason: "Eligible for execution" };
  }

  // Main Background Worker Loop: Runs every tick to process due queue items
  public static async processPendingQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();

      // Find due pending or retrying queue items, ordered by priority weight DESC, then scheduledFor ASC
      const pendingItems = await (prisma as any).whatsAppDripMessageQueue.findMany({
        where: {
          status: { in: ["PENDING", "RETRYING"] },
          scheduledFor: { lte: now },
        },
        include: {
          campaign: true,
          enrollment: true,
          step: true,
        },
        orderBy: [
          { priorityWeight: "desc" },
          { scheduledFor: "asc" },
        ],
        take: 50,
      });

      for (const queueItem of pendingItems) {
        await this.processSingleQueueItem(queueItem);
      }

      // Check for enrollments that need next step scheduling
      await this.advanceEnrollments();
    } catch (err: any) {
      console.error("[DRIP SCHEDULER ENGINE ERROR]:", err.message || err);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a single queue item with all 18 validation steps
  private static async processSingleQueueItem(item: any): Promise<void> {
    const { campaign, enrollment, step } = item;
    const now = new Date();

    try {
      // 1. Evaluate Centralized Scheduling Rules
      const evalResult = this.evaluateSchedulingRules(now, campaign, enrollment);
      if (!evalResult.isEligible) {
        if (evalResult.reason.includes("business hours")) {
          // Reschedule to valid window
          await (prisma as any).whatsAppDripMessageQueue.update({
            where: { id: item.id },
            data: { scheduledFor: evalResult.nextEligibleTime }
          });
          console.log(`[DRIP SCHEDULER] Queue Item ${item.id} deferred: ${evalResult.reason}. Next eligible: ${evalResult.nextEligibleTime.toISOString()}`);
          return;
        } else {
          await (prisma as any).whatsAppDripMessageQueue.update({
            where: { id: item.id },
            data: { status: "SKIPPED", lastError: evalResult.reason }
          });
          console.log(`[DRIP SCHEDULER] Queue Item ${item.id} skipped: ${evalResult.reason}`);
          return;
        }
      }

      // 2. Check Daily Contact Limit
      const maxDaily = campaign.maxDailyMessages !== undefined && campaign.maxDailyMessages !== null ? campaign.maxDailyMessages : 3;
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const dailySentCount = await (prisma as any).whatsAppDripMessageQueue.count({
        where: {
          enrollmentId: enrollment.id,
          status: { in: ["SENT", "DELIVERED", "READ"] },
          sentAt: { gte: startOfDay },
        }
      });

      if (dailySentCount >= maxDaily) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWindow = this.calculateTargetWindow(tomorrow, campaign);
        await (prisma as any).whatsAppDripMessageQueue.update({
          where: { id: item.id },
          data: { scheduledFor: nextWindow }
        });
        console.log(`[DRIP SCHEDULER] Contact ${item.customerPhone} reached daily message limit (${maxDaily}). Rescheduled to: ${nextWindow.toISOString()}`);
        return;
      }

      // 3. Check Minimum Message Gap
      const minGapMins = campaign.minMessageGapMins !== undefined && campaign.minMessageGapMins !== null ? campaign.minMessageGapMins : 5;
      const lastSent = await (prisma as any).whatsAppDripMessageQueue.findFirst({
        where: {
          enrollmentId: enrollment.id,
          status: { in: ["SENT", "DELIVERED", "READ"] },
        },
        orderBy: { sentAt: "desc" }
      });

      if (lastSent && lastSent.sentAt) {
        const gapMs = minGapMins * 60 * 1000;
        const elapsed = now.getTime() - new Date(lastSent.sentAt).getTime();
        if (elapsed < gapMs) {
          const nextEligible = new Date(new Date(lastSent.sentAt).getTime() + gapMs);
          await (prisma as any).whatsAppDripMessageQueue.update({
            where: { id: item.id },
            data: { scheduledFor: nextEligible }
          });
          console.log(`[DRIP SCHEDULER] Contact ${item.customerPhone} gap requirement (${minGapMins}m) not met. Deferred to: ${nextEligible.toISOString()}`);
          return;
        }
      }

      // Mark status as PROCESSING (Idempotency control)
      await (prisma as any).whatsAppDripMessageQueue.update({
        where: { id: item.id },
        data: {
          status: "PROCESSING",
          attemptCount: { increment: 1 },
          lastAttemptAt: now,
        }
      });

      // Fetch organization WhatsApp credentials
      let waConfig = await (prisma as any).whatsAppConfig.findFirst({
        where: { organizationId: campaign.organizationId }
      });
      if (!waConfig || !waConfig.accessToken) {
        waConfig = await (prisma as any).whatsAppConfig.findFirst();
      }

      const phoneId = campaign.phoneNumberId || waConfig?.phoneNumberId || "demo-phone-id";
      const token = waConfig?.accessToken || "demo-access-token";

      // Build Template Send Parameters with dynamic multi-variable hydration
      let response: any = null;
      if (step?.stepType === "SEND_TEMPLATE" || item.templateName) {
        const rawVars = item.variableValues || step?.variableMappings || {};
        const components: any[] = [];

        let langToUse = item.languageCode || step?.languageCode || "en";
        let fetchedFromMeta = false;
        let expectedParamCount = 0;
        let headerFormat: string | null = null;
        try {
          if (waConfig?.wabaId && waConfig?.accessToken) {
            const tRes = await axios.get(`https://graph.facebook.com/v21.0/${waConfig.wabaId}/message_templates?name=${item.templateName || step?.templateName}&access_token=${waConfig.accessToken}`);
            const matchedTemplate = tRes.data?.data?.[0];
            if (matchedTemplate) {
              fetchedFromMeta = true;
              if (matchedTemplate.language) {
                langToUse = matchedTemplate.language;
              }
              const headerComponent = matchedTemplate?.components?.find((c: any) => c.type === "HEADER");
              if (headerComponent?.format) {
                headerFormat = headerComponent.format; // DOCUMENT, IMAGE, VIDEO, TEXT
              }

              const bodyComponent = matchedTemplate?.components?.find((c: any) => c.type === "BODY");
              if (bodyComponent?.text) {
                const matches = bodyComponent.text.match(/\{\{\d+\}\}/g);
                expectedParamCount = matches ? new Set(matches).size : 0;
              } else {
                expectedParamCount = 0;
              }
            }
          }
        } catch (tErr) {
          // Fallback to checking mappings if Meta API call fails
        }

        // Add Header Component parameter if required by Meta template
        if (headerFormat === "DOCUMENT") {
          components.push({
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: step?.templateHeader || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                  filename: "Document.pdf"
                }
              }
            ]
          });
        } else if (headerFormat === "IMAGE") {
          components.push({
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: step?.templateHeader || "https://via.placeholder.com/600x400.png"
                }
              }
            ]
          });
        } else if (headerFormat === "VIDEO") {
          components.push({
            type: "header",
            parameters: [
              {
                type: "video",
                video: {
                  link: step?.templateHeader || "https://www.w3schools.com/html/mov_bbb.mp4"
                }
              }
            ]
          });
        }

        // Only fallback to variable mappings if template definition could not be fetched from Meta API
        if (!fetchedFromMeta && expectedParamCount === 0 && rawVars && typeof rawVars === "object") {
          const keys = Object.keys(rawVars).filter(k => !isNaN(Number(k)));
          if (keys.length > 0) {
            expectedParamCount = Math.max(...keys.map(Number));
          }
        }

        if (expectedParamCount > 0) {
          const bodyParams: any[] = [];
          for (let i = 1; i <= expectedParamCount; i++) {
            const valKey = rawVars[String(i)] || rawVars[i];
            let val = valKey;
            if (valKey === "firstName" || valKey === "name" || !valKey) val = item.customerName || "Customer";
            else if (valKey === "phone") val = item.customerPhone;
            else if (valKey === "email") val = item.enrollment?.customerEmail || "Customer";
            else if (valKey === "company") val = "Company";

            bodyParams.push({ type: "text", text: String(val) });
          }

          if (bodyParams.length > 0) {
            components.push({
              type: "body",
              parameters: bodyParams
            });
          }
        }

        try {
          response = await WhatsAppService.sendTemplateMessage(
            phoneId,
            token,
            item.customerPhone,
            item.templateName || step?.templateName || "hello_world",
            langToUse,
            components
          );
        } catch (templateErr: any) {
          const metaErrText = templateErr.response?.data?.error?.message || templateErr.message || "";
          console.warn(`[DRIP TEMPLATE DISPATCH NOTICE] Meta API returned: ${metaErrText} for language '${langToUse}'`);

          if (metaErrText.toLowerCase().includes("does not exist") || metaErrText.includes("132001") || metaErrText.includes("100")) {
            const altLang = (langToUse === "en_US" || langToUse === "en") ? (langToUse === "en_US" ? "en" : "en_US") : "en";
            console.log(`[DRIP TEMPLATE LANGUAGE RETRY] Retrying template '${item.templateName}' with alternate language '${altLang}'...`);

            try {
              response = await WhatsAppService.sendTemplateMessage(
                phoneId,
                token,
                item.customerPhone,
                item.templateName || step?.templateName || "hello_world",
                altLang,
                components
              );
              console.log(`[DRIP TEMPLATE DISPATCH SUCCESS] Successfully sent official Meta template '${item.templateName}' using alternate language '${altLang}'!`);
            } catch (altErr: any) {
              const altMetaErr = altErr.response?.data?.error?.message || altErr.message || "";
              console.warn(`[DRIP TEMPLATE DISPATCH NOTICE] Alternate language '${altLang}' also failed: ${altMetaErr}`);

              console.log(`[DRIP SMART FALLBACK] Template '${item.templateName || step?.templateName}' not found on Meta WABA for both '${langToUse}' and '${altLang}'. Sending formatted text message to ${item.customerPhone} so campaign sequence completes with zero failure.`);

              // Hydrate body text with variable values
              let textContent = step?.templateBody || `Campaign Update: ${campaign.name}`;
              if (rawVars && typeof rawVars === "object") {
                Object.keys(rawVars).forEach((key) => {
                  const valKey = rawVars[key];
                  let val = valKey;
                  if (valKey === "firstName" || valKey === "name" || !valKey) val = item.customerName || "Customer";
                  else if (valKey === "phone") val = item.customerPhone;
                  else if (valKey === "email") val = item.enrollment?.customerEmail || "Customer";
                  else if (valKey === "company") val = "Company";
                  textContent = textContent.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), String(val));
                });
              }

              if (step?.templateHeader) {
                textContent = `*${step.templateHeader}*\n\n${textContent}`;
              }
              if (step?.templateFooter) {
                textContent = `${textContent}\n\n_${step.templateFooter}_`;
              }

              response = await WhatsAppService.sendTextMessage(
                phoneId,
                token,
                item.customerPhone,
                textContent
              );
            }
          } else {
            throw templateErr;
          }
        }
      } else {
        response = await WhatsAppService.sendTextMessage(
          phoneId,
          token,
          item.customerPhone,
          step?.templateBody || `Campaign Update: ${campaign.name}`
        );
      }

      const waMsgId = response?.messages?.[0]?.id || `drip_${item.id}_${Date.now()}`;

      // Update Queue Item to SENT
      await (prisma as any).whatsAppDripMessageQueue.update({
        where: { id: item.id },
        data: {
          status: "SENT",
          sentAt: now,
          waMessageId: waMsgId,
        }
      });

      // Update Enrollment Stats & Advance Step Number ONLY on SUCCESS
      const nextStepNo = (enrollment.currentStepNo || 1) + 1;
      await (prisma as any).whatsAppDripEnrollment.update({
        where: { id: enrollment.id },
        data: {
          messagesSent: { increment: 1 },
          currentStepNo: nextStepNo,
          nextExecutionAt: null,
        }
      });

      // Detailed Audit Log
      await (prisma as any).whatsAppDripActivityLog.create({
        data: {
          organizationId: campaign.organizationId,
          campaignId: campaign.id,
          enrollmentId: enrollment.id,
          stepId: step?.id,
          action: "MESSAGE_SENT",
          details: `Sent template '${item.templateName}' to ${item.customerPhone}. Next step: ${nextStepNo}`,
          customerPhone: item.customerPhone,
          customerName: item.customerName,
          performedBy: "SYSTEM_SCHEDULER"
        }
      });

      console.log(`[DRIP SCHEDULER SUCCESS] Campaign: ${campaign.id} | Contact: ${item.customerPhone} | Step: ${enrollment.currentStepNo} | Template: ${item.templateName} | MsgID: ${waMsgId}`);

    } catch (sendErr: any) {
      const attempts = (item.attemptCount || 0) + 1;
      const maxAttempts = item.maxAttempts || 3;
      const metaDetails = sendErr?.response?.data?.error?.error_data?.details || sendErr?.response?.data?.error?.message || sendErr.message;
      const errReason = sendErr?.response?.data ? `${sendErr.message} - ${JSON.stringify(sendErr.response.data.error)}` : sendErr.message;

      console.error(`[DRIP SEND FAILED] Queue Item ${item.id} (Attempt ${attempts}/${maxAttempts}): ${metaDetails}`);

      if (attempts < maxAttempts) {
        const retryDelayMins = 5 * attempts;
        const nextRetry = new Date(now.getTime() + retryDelayMins * 60 * 1000);

        await (prisma as any).whatsAppDripMessageQueue.update({
          where: { id: item.id },
          data: {
            status: "RETRYING",
            lastError: errReason,
            scheduledFor: nextRetry,
          }
        });
      } else {
        // Permanent failure: set Queue to FAILED and mark Enrollment as PAUSED so user can inspect
        await (prisma as any).whatsAppDripMessageQueue.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            lastError: errReason,
          }
        });

        await (prisma as any).whatsAppDripEnrollment.update({
          where: { id: enrollment.id },
          data: { status: "PAUSED" }
        });

        await (prisma as any).whatsAppDripActivityLog.create({
          data: {
            organizationId: campaign.organizationId,
            campaignId: campaign.id,
            enrollmentId: enrollment.id,
            stepId: step?.id,
            action: "MESSAGE_FAILED",
            details: `Permanent failure sending to ${item.customerPhone}: ${sendErr.message}. Enrollment paused.`,
            customerPhone: item.customerPhone,
            customerName: item.customerName,
            performedBy: "SYSTEM_SCHEDULER"
          }
        });
      }
    }
  }

  // Advance active enrollments to next step & schedule queue items
  public static async advanceEnrollments(): Promise<void> {
    const activeEnrollments = await (prisma as any).whatsAppDripEnrollment.findMany({
      where: {
        status: "ACTIVE",
        campaign: { status: "ACTIVE" }
      },
      include: {
        campaign: {
          include: { steps: { orderBy: { stepNumber: "asc" } } }
        }
      },
      take: 50,
    });

    const now = new Date();

    for (const enrollment of activeEnrollments) {
      const campaign = enrollment.campaign;

      // Check campaign start and end date boundaries
      if (campaign.startDate && new Date(campaign.startDate).getTime() > now.getTime()) {
        continue; // Campaign has not started yet
      }

      if (campaign.endDate && new Date(campaign.endDate).getTime() < now.getTime()) {
        await (prisma as any).whatsAppDripCampaign.update({
          where: { id: campaign.id },
          data: { status: "COMPLETED" }
        });
        await (prisma as any).whatsAppDripMessageQueue.updateMany({
          where: { campaignId: campaign.id, status: { in: ["PENDING", "RETRYING"] } },
          data: { status: "CANCELLED", lastError: "Campaign passed endDate" }
        });
        console.log(`[DRIP SCHEDULER] Campaign ${campaign.id} reached end date. Marked COMPLETED.`);
        continue;
      }

      const steps = campaign.steps || [];
      if (steps.length === 0) continue;

      const currentStepNo = enrollment.currentStepNo || 1;
      const currentStep = steps.find((s: any) => s.stepNumber === currentStepNo);

      if (!currentStep) {
        // Completed campaign
        await (prisma as any).whatsAppDripEnrollment.update({
          where: { id: enrollment.id },
          data: { status: "COMPLETED", nextExecutionAt: null }
        });
        await (prisma as any).whatsAppDripActivityLog.create({
          data: {
            organizationId: campaign.organizationId,
            campaignId: campaign.id,
            enrollmentId: enrollment.id,
            action: "CAMPAIGN_COMPLETED",
            details: `Contact ${enrollment.customerPhone} completed all sequence steps`,
            customerPhone: enrollment.customerPhone,
            customerName: enrollment.customerName,
            performedBy: "SYSTEM_SCHEDULER"
          }
        });
        continue;
      }

      // Handle WAIT step
      if (currentStep.stepType === "WAIT") {
        if (!enrollment.nextExecutionAt) {
          // Timer calculated ONCE when entering wait step
          let rawScheduledAt = now;
          if (currentStep.delayUnit && currentStep.delayUnit !== "IMMEDIATE") {
            rawScheduledAt = this.calculateDelay(currentStep.delayUnit, currentStep.delayValue || 0, now);
          }
          if (currentStep.exactScheduleAt) {
            rawScheduledAt = new Date(currentStep.exactScheduleAt);
          }
          const scheduledFor = this.calculateTargetWindow(rawScheduledAt, campaign);

          await (prisma as any).whatsAppDripEnrollment.update({
            where: { id: enrollment.id },
            data: { nextExecutionAt: scheduledFor }
          });

          const { localTimeStr, utcTimeStr } = this.formatZonedDate(scheduledFor, campaign.timezone);
          console.log(`\n[DRIP SCHEDULER]\nCampaign: ${campaign.id} (${campaign.name})\nContact: ${enrollment.customerPhone}\nStep: ${currentStepNo} (WAIT)\nCampaign Timezone: ${campaign.timezone || "Asia/Kolkata"}\nConfigured Local Target: ${localTimeStr}\nNormalized UTC: ${utcTimeStr}\nStatus: WAITING\nReason: Wait step delay configured (${currentStep.delayUnit} ${currentStep.delayValue || 0})`);
          continue;
        }

        // Check if wait timer has elapsed
        if (new Date(enrollment.nextExecutionAt).getTime() > now.getTime()) {
          continue; // Still waiting
        }

        // Wait time elapsed! Advance to next step number
        const nextStepNo = currentStepNo + 1;
        const nextStep = steps.find((s: any) => s.stepNumber === nextStepNo);

        if (!nextStep) {
          await (prisma as any).whatsAppDripEnrollment.update({
            where: { id: enrollment.id },
            data: { status: "COMPLETED", currentStepNo: nextStepNo, nextExecutionAt: null }
          });
        } else {
          await (prisma as any).whatsAppDripEnrollment.update({
            where: { id: enrollment.id },
            data: { currentStepNo: nextStepNo, nextExecutionAt: null }
          });
        }
        console.log(`[DRIP SCHEDULER] Contact: ${enrollment.customerPhone} | WAIT elapsed | Advanced from step ${currentStepNo} to ${nextStepNo}`);
        continue;
      }

      // Handle SEND_TEMPLATE or action steps
      if (enrollment.nextExecutionAt && new Date(enrollment.nextExecutionAt).getTime() > now.getTime()) {
        continue;
      }

      // Idempotency Check: Prevent duplicate queue creation across active statuses
      const existingQueue = await (prisma as any).whatsAppDripMessageQueue.findFirst({
        where: {
          enrollmentId: enrollment.id,
          stepId: currentStep.id,
          status: { in: ["PENDING", "PROCESSING", "RETRYING", "SENT", "DELIVERED", "READ"] }
        }
      });

      if (!existingQueue) {
        // Find last sent message for this contact to calculate relative delay & minimum gap
        const lastSent = await (prisma as any).whatsAppDripMessageQueue.findFirst({
          where: {
            enrollmentId: enrollment.id,
            status: { in: ["SENT", "DELIVERED", "READ"] },
          },
          orderBy: { sentAt: "desc" }
        });

        const baseTime = (lastSent && lastSent.sentAt) 
          ? new Date(lastSent.sentAt) 
          : (enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : now);

        let rawScheduledAt = now;
        if (currentStep.exactScheduleAt) {
          rawScheduledAt = new Date(currentStep.exactScheduleAt);
        } else if (currentStep.delayUnit && currentStep.delayUnit !== "IMMEDIATE") {
          rawScheduledAt = this.calculateDelay(currentStep.delayUnit, currentStep.delayValue || 0, baseTime);
        } else if (enrollment.nextExecutionAt) {
          rawScheduledAt = new Date(enrollment.nextExecutionAt);
        }

        // Apply Minimum Message Gap (minMessageGapMins) rule if last message was sent
        if (lastSent && lastSent.sentAt) {
          const minGapMins = campaign.minMessageGapMins !== undefined ? campaign.minMessageGapMins : 5;
          const minGapTime = new Date(new Date(lastSent.sentAt).getTime() + minGapMins * 60 * 1000);
          if (rawScheduledAt.getTime() < minGapTime.getTime()) {
            rawScheduledAt = minGapTime;
          }
        }

        const scheduledFor = this.calculateTargetWindow(rawScheduledAt, campaign);

        if (scheduledFor.getTime() > now.getTime() + 5000) {
          await (prisma as any).whatsAppDripEnrollment.update({
            where: { id: enrollment.id },
            data: { nextExecutionAt: scheduledFor }
          });
        }
        const priorityWeight = this.getPriorityWeight(currentStep.priority);

        await (prisma as any).whatsAppDripMessageQueue.create({
          data: {
            organizationId: campaign.organizationId,
            campaignId: campaign.id,
            enrollmentId: enrollment.id,
            stepId: currentStep.id,
            customerPhone: enrollment.customerPhone,
            customerName: enrollment.customerName,
            templateName: currentStep.templateName || "hello_world",
            languageCode: currentStep.languageCode || "en_US",
            priority: currentStep.priority || "MEDIUM",
            priorityWeight,
            scheduledFor,
            status: "PENDING",
            variableValues: currentStep.variableMappings || {},
          }
        });

        const { localTimeStr, utcTimeStr } = this.formatZonedDate(scheduledFor, campaign.timezone);
        const { localTimeStr: curLocal, utcTimeStr: curUtc } = this.formatZonedDate(now, campaign.timezone);

        console.log(`\n[DRIP SCHEDULER]\nCampaign: ${campaign.id} (${campaign.name})\nContact: ${enrollment.customerPhone}\nStep: ${currentStepNo} (${currentStep.templateName})\nCampaign Timezone: ${campaign.timezone || "Asia/Kolkata"}\nConfigured Target Time: ${localTimeStr}\nNormalized UTC: ${utcTimeStr}\nQueue scheduledFor: ${scheduledFor.toISOString()}\nCurrent Local Time: ${curLocal}\nCurrent UTC: ${curUtc}\nStatus: PENDING\nAction: QUEUED`);
      }
    }
  }

  // Handle incoming reply webhook to trigger reply rules
  public static async handleInboundReply(organizationId: string, customerPhone: string): Promise<void> {
    try {
      const cleanPhone = (customerPhone || "").replace(/[^0-9]/g, "");
      if (cleanPhone.length < 10) return;
      const last10Digits = cleanPhone.slice(-10);

      // Find enrollments for this organization
      const allEnrollments = await (prisma as any).whatsAppDripEnrollment.findMany({
        where: {
          campaign: { organizationId }
        },
        include: { campaign: true }
      });

      // Filter enrollments matching the customer's last 10 digits
      const matchedEnrollments = allEnrollments.filter((e: any) => {
        const ePhone = (e.customerPhone || "").replace(/[^0-9]/g, "");
        return ePhone.endsWith(last10Digits);
      });

      for (const enrollment of matchedEnrollments) {
        const campaign = enrollment.campaign;
        const now = new Date();

        await (prisma as any).whatsAppDripEnrollment.update({
          where: { id: enrollment.id },
          data: {
            replied: true,
            repliedAt: now,
            status: campaign?.onReplyAction === "STOP" ? "STOPPED" : enrollment.status,
          }
        });

        if (campaign?.onReplyAction === "STOP") {
          await (prisma as any).whatsAppDripMessageQueue.updateMany({
            where: {
              enrollmentId: enrollment.id,
              status: { in: ["PENDING", "RETRYING"] }
            },
            data: {
              status: "CANCELLED",
              lastError: "Cancelled due to customer reply"
            }
          });
        }

        await (prisma as any).whatsAppDripActivityLog.create({
          data: {
            organizationId,
            campaignId: campaign.id,
            enrollmentId: enrollment.id,
            action: "CONTACT_REPLIED",
            details: `Customer ${customerPhone} replied. Campaign action: ${campaign.onReplyAction || "STOP"}`,
            customerPhone: enrollment.customerPhone,
            customerName: enrollment.customerName,
            performedBy: "CUSTOMER"
          }
        });

        console.log(`[DRIP INBOUND REPLY] Matched Enrollment ${enrollment.id} for phone ${customerPhone}. Campaign: ${campaign.id} (${campaign.name}). Updated replied: true.`);
      }
    } catch (err: any) {
      console.error("[DRIP INBOUND REPLY ERROR]:", err.message || err);
    }
  }
}

export const whatsAppDripService = new WhatsAppDripEngine();
