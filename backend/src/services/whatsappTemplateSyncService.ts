import axios from "axios";
import prisma from "../utils/prisma";

export class WhatsAppTemplateSyncService {
  /**
   * Idempotently sync Meta WABA templates for an Organization
   */
  public static async syncTemplatesForOrg(organizationId: string): Promise<{
    syncedCount: number;
    updatedCount: number;
    createdCount: number;
    templates: any[];
  }> {
    const waConfig = await prisma.whatsAppConfig.findUnique({
      where: { organizationId }
    });

    if (!waConfig || !waConfig.wabaId || !waConfig.accessToken) {
      console.warn(`[WABA TEMPLATE SYNC] Skipping org ${organizationId}: Missing WABA config or access token`);
      return { syncedCount: 0, updatedCount: 0, createdCount: 0, templates: [] };
    }

    try {
      console.log(`[WABA TEMPLATE SYNC] Fetching templates for Org: ${organizationId}, WABA: ${waConfig.wabaId}`);
      const url = `https://graph.facebook.com/v21.0/${waConfig.wabaId}/message_templates?limit=250&access_token=${waConfig.accessToken}`;
      const response = await axios.get(url);
      const metaTemplates: any[] = response.data?.data || [];

      let createdCount = 0;
      let updatedCount = 0;

      for (const t of metaTemplates) {
        const result = await this.upsertSingleTemplate(organizationId, waConfig.wabaId, waConfig.phoneNumberId, t);
        if (result.isNew) createdCount++;
        else if (result.isUpdated) updatedCount++;
      }

      console.log(`[WABA TEMPLATE SYNC SUCCESS] Org ${organizationId}: Synced ${metaTemplates.length} (Created: ${createdCount}, Updated: ${updatedCount})`);
      
      const allMasterTemplates = await prisma.whatsAppTemplateMaster.findMany({
        where: { organizationId },
        orderBy: { updatedAt: "desc" }
      });

      return {
        syncedCount: metaTemplates.length,
        createdCount,
        updatedCount,
        templates: allMasterTemplates
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      console.error(`[WABA TEMPLATE SYNC ERROR] Org ${organizationId}: ${errMsg}`);
      throw new Error(`Failed to sync Meta WhatsApp templates: ${errMsg}`);
    }
  }

  /**
   * Upsert a single Meta template with versioning, status history, and component analysis
   */
  public static async upsertSingleTemplate(
    organizationId: string,
    wabaId?: string,
    phoneNumberId?: string,
    rawMetaTemplate?: any
  ): Promise<{ isNew: boolean; isUpdated: boolean; master: any }> {
    const metaTemplateId = rawMetaTemplate.id;
    const name = rawMetaTemplate.name;
    const language = rawMetaTemplate.language || "en_US";
    const category = rawMetaTemplate.category || "MARKETING";
    const status = (rawMetaTemplate.status || "PENDING").toUpperCase();
    const qualityRating = rawMetaTemplate.quality_score?.score || rawMetaTemplate.quality_rating || "UNKNOWN";
    const rejectionReason = rawMetaTemplate.rejected_reason || rawMetaTemplate.rejection_reason || null;

    // Component Analysis
    const components: any[] = Array.isArray(rawMetaTemplate.components) ? rawMetaTemplate.components : [];
    const componentAnalysis = this.analyzeComponents(components);

    // Look for existing master record
    const existing = await prisma.whatsAppTemplateMaster.findFirst({
      where: {
        OR: [
          { metaTemplateId },
          { organizationId, name, language }
        ]
      }
    });

    if (!existing) {
      // CREATE NEW MASTER RECORD
      const master = await prisma.whatsAppTemplateMaster.create({
        data: {
          organizationId,
          metaTemplateId,
          name,
          namespace: rawMetaTemplate.namespace || "",
          wabaId: wabaId || null,
          phoneNumberId: phoneNumberId || null,
          language,
          category,
          status,
          previousStatus: null,
          qualityRating: String(qualityRating),
          rejectionReason,
          headerType: componentAnalysis.headerType,
          headerContent: componentAnalysis.headerContent,
          bodyContent: componentAnalysis.bodyContent,
          footerContent: componentAnalysis.footerContent,
          buttons: componentAnalysis.buttons,
          numberOfVariables: componentAnalysis.numberOfVariables,
          variablePositions: componentAnalysis.variablePositions,
          sampleVariables: componentAnalysis.sampleVariables,
          characterCounts: componentAnalysis.characterCounts,
          mediaRequirements: componentAnalysis.mediaRequirements,
          currentVersion: 1,
          lastSyncedAt: new Date()
        }
      });

      // Create Initial Version Snapshot
      await prisma.whatsAppTemplateVersion.create({
        data: {
          templateId: master.id,
          versionNumber: 1,
          name: master.name,
          language: master.language,
          category: master.category,
          status: master.status,
          headerContent: master.headerContent,
          bodyContent: master.bodyContent,
          footerContent: master.footerContent,
          buttons: master.buttons || [],
          changeSummary: "Initial import from Meta Graph API"
        }
      });

      // Log Initial Status Entry
      await prisma.whatsAppTemplateStatusHistory.create({
        data: {
          templateId: master.id,
          organizationId,
          fromStatus: null,
          toStatus: status,
          reason: rejectionReason || "Initial template sync"
        }
      });

      return { isNew: true, isUpdated: false, master };
    } else {
      // UPDATE EXISTING MASTER RECORD
      let isUpdated = false;
      const statusChanged = existing.status !== status;
      const bodyChanged = existing.bodyContent !== componentAnalysis.bodyContent;

      let newVersionNumber = existing.currentVersion;
      if (bodyChanged) {
        newVersionNumber += 1;
        isUpdated = true;
      }

      if (statusChanged || existing.category !== category || existing.qualityRating !== String(qualityRating)) {
        isUpdated = true;
      }

      // Quality History Log update
      const qualityHistory: any[] = Array.isArray(existing.qualityHistory) ? (existing.qualityHistory as any[]) : [];
      if (existing.qualityRating !== String(qualityRating)) {
        qualityHistory.push({
          rating: String(qualityRating),
          timestamp: new Date().toISOString()
        });
      }

      const master = await prisma.whatsAppTemplateMaster.update({
        where: { id: existing.id },
        data: {
          metaTemplateId, // Ensure link is saved
          category,
          status,
          previousStatus: statusChanged ? existing.status : existing.previousStatus,
          qualityRating: String(qualityRating),
          qualityHistory,
          rejectionReason: rejectionReason || existing.rejectionReason,
          headerType: componentAnalysis.headerType,
          headerContent: componentAnalysis.headerContent,
          bodyContent: componentAnalysis.bodyContent,
          footerContent: componentAnalysis.footerContent,
          buttons: componentAnalysis.buttons,
          numberOfVariables: componentAnalysis.numberOfVariables,
          variablePositions: componentAnalysis.variablePositions,
          sampleVariables: componentAnalysis.sampleVariables,
          characterCounts: componentAnalysis.characterCounts,
          mediaRequirements: componentAnalysis.mediaRequirements,
          currentVersion: newVersionNumber,
          lastSyncedAt: new Date()
        }
      });

      // Record Status History Transition if Changed
      if (statusChanged) {
        await prisma.whatsAppTemplateStatusHistory.create({
          data: {
            templateId: existing.id,
            organizationId,
            fromStatus: existing.status,
            toStatus: status,
            reason: rejectionReason || `Status transitioned from ${existing.status} to ${status}`
          }
        });
      }

      // Record New Version Snapshot if Body / Components Changed
      if (bodyChanged) {
        await prisma.whatsAppTemplateVersion.create({
          data: {
            templateId: existing.id,
            versionNumber: newVersionNumber,
            name: master.name,
            language: master.language,
            category: master.category,
            status: master.status,
            headerContent: master.headerContent,
            bodyContent: master.bodyContent,
            footerContent: master.footerContent,
            buttons: master.buttons || [],
            changeSummary: `Content updated to version ${newVersionNumber}`
          }
        });
      }

      return { isNew: false, isUpdated, master };
    }
  }

  /**
   * Component parsing and character/variable analysis helper
   */
  private static analyzeComponents(components: any[]) {
    let headerType = "NONE";
    let headerContent = "";
    let bodyContent = "";
    let footerContent = "";
    let buttons: any[] = [];
    let sampleVariables: any[] = [];

    for (const c of components) {
      if (c.type === "HEADER") {
        headerType = c.format || "TEXT";
        headerContent = c.text || c.example?.header_handle?.[0] || "";
      } else if (c.type === "BODY") {
        bodyContent = c.text || "";
        if (c.example?.body_text?.[0]) {
          sampleVariables = c.example.body_text[0];
        }
      } else if (c.type === "FOOTER") {
        footerContent = c.text || "";
      } else if (c.type === "BUTTONS" && Array.isArray(c.buttons)) {
        buttons = c.buttons;
      }
    }

    // Extract Variable Positions e.g. {{1}}, {{2}}
    const varMatches = bodyContent.match(/\{\{\d+\}\}/g) || [];
    const variablePositions = Array.from(new Set(varMatches));
    const numberOfVariables = variablePositions.length;

    // Character Counts
    const characterCounts = {
      header: headerContent.length,
      body: bodyContent.length,
      footer: footerContent.length,
      total: headerContent.length + bodyContent.length + footerContent.length
    };

    // Media Requirements
    const mediaRequirements = {
      requiresMedia: ["IMAGE", "DOCUMENT", "VIDEO", "LOCATION"].includes(headerType),
      headerFormat: headerType
    };

    return {
      headerType,
      headerContent,
      bodyContent,
      footerContent,
      buttons,
      numberOfVariables,
      variablePositions,
      sampleVariables,
      characterCounts,
      mediaRequirements
    };
  }
}
