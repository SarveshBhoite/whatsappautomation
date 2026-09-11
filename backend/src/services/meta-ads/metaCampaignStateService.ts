import { MetaCampaignDraft, FieldSource } from "./metaCampaignDraftService";
import { MetaAdsContext } from "./metaAIContextService";

export type StateOperationType = "set" | "remove" | "append";

export interface CampaignStateOperation {
  op: StateOperationType;
  path: string;
  value?: any;
  source: FieldSource;
  confidence: number;
  reason?: string;
}

export interface ExtractedFact {
  entity: string;
  value: any;
  confidence: number;
  sourceText?: string;
}

export interface AIRecommendation {
  field: string;
  recommendedValue: any;
  rationale: string;
  suggestedAction?: string;
}

export interface AIConversationDecision {
  intent:
    | "CREATE_CAMPAIGN"
    | "UPDATE_CAMPAIGN"
    | "CORRECT_CAMPAIGN"
    | "ASK_QUESTION"
    | "REQUEST_RECOMMENDATION"
    | "PREVIEW_CAMPAIGN"
    | "CONFIRM_CAMPAIGN"
    | "PUBLISH_CAMPAIGN"
    | "CANCEL_CAMPAIGN"
    | "START_NEW_CAMPAIGN";
  confidence: number;
  stateOperations: CampaignStateOperation[];
  extractedFacts: ExtractedFact[];
  assumptions: AIRecommendation[];
  missingFields: string[];
  nextAction:
    | "ASK_USER"
    | "UPDATE_STATE"
    | "VALIDATE"
    | "GENERATE_CREATIVE"
    | "SHOW_PREVIEW"
    | "REQUEST_CONFIRMATION"
    | "EXECUTE"
    | "RECOVER_FROM_ERROR";
  userResponse: string;
  quickReplyIntent?: string[];
  quickOptions?: Array<{ label: string; value: string }>;
  isReadyForReview?: boolean;
}

export interface CampaignDraftVersionSnapshot {
  id: string;
  draftId: string;
  versionNumber: number;
  stateSnapshot: MetaCampaignDraft;
  appliedOperations: CampaignStateOperation[];
  triggeredBy: "USER" | "AI" | "SYSTEM" | "META";
  messageId?: string;
  intent?: string;
  confidence: number;
  createdAt: string;
}

export interface ApplyPatchResult {
  draft: MetaCampaignDraft;
  appliedOperations: CampaignStateOperation[];
  rejectedOperations: Array<{ op: CampaignStateOperation; reason: string }>;
  versionNumber: number;
  invalidatedFields: string[];
}

export class MetaCampaignStateService {
  /**
   * Deterministically applies JSON Patch / State Operations to campaign draft
   * Enforcing provenance priority: USER > SYSTEM > AI_RECOMMENDATION
   */
  static applyOperations(
    currentDraft: MetaCampaignDraft,
    operations: CampaignStateOperation[],
    currentVersion: number = 1
  ): ApplyPatchResult {
    // Deep clone to ensure immutability
    const draft: MetaCampaignDraft = JSON.parse(JSON.stringify(currentDraft));
    if (!draft.sourceMap) draft.sourceMap = {};

    const appliedOperations: CampaignStateOperation[] = [];
    const rejectedOperations: Array<{ op: CampaignStateOperation; reason: string }> = [];
    const invalidatedFields: string[] = [];

    for (const op of operations) {
      // 1. Confidence Gating: operations with confidence < 0.70 are held for clarification
      if (op.confidence !== undefined && op.confidence < 0.70) {
        rejectedOperations.push({
          op,
          reason: `Confidence ${op.confidence.toFixed(2)} is below minimum threshold (0.70). Required user clarification.`,
        });
        continue;
      }

      const existingProv = draft.sourceMap[op.path];

      // 2. Provenance Protection Guard: AI Recommendations NEVER overwrite explicit USER choices
      if (existingProv && existingProv.source === "USER" && op.source === "AI_RECOMMENDATION") {
        rejectedOperations.push({
          op,
          reason: `Field '${op.path}' was explicitly locked by USER and cannot be overwritten by AI recommendation.`,
        });
        continue;
      }

      if (op.op === "set") {
        const normalizedPath = op.path.startsWith("/") ? op.path.slice(1).replace(/\//g, ".") : op.path;
        
        // 3. Strict Production-Level Validation Guards:
        // Validate Business Name / Campaign Name
        if (normalizedPath === "campaign.name" && typeof op.value === "string") {
          const trimmedVal = op.value.trim();
          const isInvalidName = 
            /^[0-9+\-*/=()\\.,\s_#@!$%^&*]+$/.test(trimmedVal) ||
            !/[a-zA-Z\u0900-\u0D7F]/.test(trimmedVal) ||
            trimmedVal.length < 2 ||
            /^(.)\1{3,}$/.test(trimmedVal);

          if (isInvalidName) {
            rejectedOperations.push({
              op,
              reason: `Invalid business name '${trimmedVal}'. A valid business/brand name must contain letters and cannot be pure digits, math symbols, or keyboard mash.`,
            });
            continue;
          }
        }

        // Validate Target Cities
        if (normalizedPath === "targeting.cities" && Array.isArray(op.value)) {
          const validCities = op.value.filter((c: any) => typeof c === "string" && /[a-zA-Z\u0900-\u0D7F]/.test(c) && !/^[0-9+\-*/=()\\.,\s_#@!$%^&*]+$/.test(c.trim()));
          if (validCities.length === 0) {
            rejectedOperations.push({
              op,
              reason: `Target cities must contain valid location names with letters.`,
            });
            continue;
          }
          op.value = validCities;
        }

        // Validate Location Description
        if (normalizedPath === "targeting.locationDescription" && typeof op.value === "string") {
          const trimmedLoc = op.value.trim();
          if (/^[0-9+\-*/=()\\.,\s_#@!$%^&*]+$/.test(trimmedLoc) || !/[a-zA-Z\u0900-\u0D7F]/.test(trimmedLoc)) {
            rejectedOperations.push({
              op,
              reason: `Invalid location description '${trimmedLoc}'. Must contain actual city or region names.`,
            });
            continue;
          }
        }

        // Validate Budget
        if ((normalizedPath === "campaign.dailyBudget" || normalizedPath === "campaign.lifetimeBudget") && typeof op.value === "number") {
          if (isNaN(op.value) || op.value < 100 || op.value > 10000000) {
            rejectedOperations.push({
              op,
              reason: `Budget ₹${op.value} is out of valid range (₹100 to ₹10,000,000).`,
            });
            continue;
          }
        }

        // Track major dependency changes (e.g., destination changed from WEBSITE to WHATSAPP)
        if (normalizedPath === "destination.type") {
          const oldDest = draft.destination?.type;
          const newDest = String(op.value).toUpperCase();
          if (oldDest && oldDest !== newDest) {
            invalidatedFields.push("creative.callToAction", "campaign.objective");
            // Re-evaluate dependent fields cleanly
            if (newDest === "WHATSAPP") {
              draft.creative.callToAction = "WHATSAPP_MESSAGE";
              draft.campaign.objective = "OUTCOME_LEADS";
            } else if (newDest === "WEBSITE") {
              draft.creative.callToAction = "LEARN_MORE";
              draft.campaign.objective = "OUTCOME_SALES";
            }
          }
        }

        this.setDeepPath(draft, normalizedPath, op.value);
        draft.sourceMap[normalizedPath] = {
          value: op.value,
          source: op.source,
          confidence: op.confidence ?? 1.0,
          reason: op.reason,
          updatedAt: new Date().toISOString(),
        };
        appliedOperations.push(op);
      } else if (op.op === "remove") {
        const normalizedPath = op.path.startsWith("/") ? op.path.slice(1).replace(/\//g, ".") : op.path;
        this.deleteDeepPath(draft, normalizedPath);
        delete draft.sourceMap[normalizedPath];
        appliedOperations.push(op);
      } else if (op.op === "append") {
        const normalizedPath = op.path.startsWith("/") ? op.path.slice(1).replace(/\//g, ".") : op.path;
        const currentArr = this.getDeepPath(draft, normalizedPath) || [];
        if (Array.isArray(currentArr)) {
          const updatedArr = [...currentArr, op.value];
          this.setDeepPath(draft, normalizedPath, updatedArr);
          draft.sourceMap[normalizedPath] = {
            value: updatedArr,
            source: op.source,
            confidence: op.confidence ?? 1.0,
            reason: op.reason,
            updatedAt: new Date().toISOString(),
          };
          appliedOperations.push(op);
        }
      }
    }

    return {
      draft,
      appliedOperations,
      rejectedOperations,
      versionNumber: currentVersion + (appliedOperations.length > 0 ? 1 : 0),
      invalidatedFields,
    };
  }

  /**
   * Generates a User vs Recommendation Diff for No-Surprise Confirmation
   */
  static generateConfigurationDiff(draft: MetaCampaignDraft) {
    const userConfirmed: Array<{ field: string; value: any }> = [];
    const aiRecommendations: Array<{ field: string; value: any; rationale?: string }> = [];
    const systemDefaults: Array<{ field: string; value: any }> = [];

    const sourceMap = draft.sourceMap || {};
    for (const [path, prov] of Object.entries(sourceMap)) {
      if (prov.source === "USER") {
        userConfirmed.push({ field: path, value: prov.value });
      } else if (prov.source === "AI_RECOMMENDATION") {
        aiRecommendations.push({ field: path, value: prov.value, rationale: prov.reason });
      } else if (prov.source === "SYSTEM") {
        systemDefaults.push({ field: path, value: prov.value });
      }
    }

    return {
      userConfirmed,
      aiRecommendations,
      systemDefaults,
      summary: {
        budget: draft.campaign.dailyBudget ? `₹${draft.campaign.dailyBudget}/day` : "Not set",
        objective: draft.campaign.objective || "OUTCOME_LEADS",
        destination: draft.destination.type || "WHATSAPP",
        locations: draft.targeting.cities?.join(", ") || draft.targeting.locationDescription || "Broad Target",
        audience: `Age ${draft.targeting.ageMin || 18}–${draft.targeting.ageMax || 65}, ${draft.targeting.gender || "ALL"}`,
      },
    };
  }

  private static setDeepPath(obj: any, path: string, value: any) {
    const keys = path.split(".");
    let curr = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]] || typeof curr[keys[i]] !== "object") {
        curr[keys[i]] = {};
      }
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;
  }

  private static getDeepPath(obj: any, path: string) {
    const keys = path.split(".");
    let curr = obj;
    for (const k of keys) {
      if (!curr || typeof curr !== "object") return undefined;
      curr = curr[k];
    }
    return curr;
  }

  private static deleteDeepPath(obj: any, path: string) {
    const keys = path.split(".");
    let curr = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) return;
      curr = curr[keys[i]];
    }
    delete curr[keys[keys.length - 1]];
  }
}
