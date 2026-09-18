import { CaseIdentifier } from "../GoogleAdsAiAssistantService";
import { GOOGLE_ADS_PROMPT_BASE } from "./GoogleAdsPromptBase";

// CASES
import { CASE_1_DISCOVERY_PROMPT } from "./cases/Case1DiscoveryPrompt";
import { CASE_2_OBJECTIVE_PROMPT } from "./cases/Case2ObjectivePrompt";
import { CASE_3_GOALS_PROMPT } from "./cases/Case3GoalsPrompt";
import { CASE_4_CAMPAIGN_TYPE_PROMPT } from "./cases/Case4CampaignTypePrompt";
import { CASE_5_SETUP_PROMPT } from "./cases/Case5SetupPrompt";
import { CASE_6_ASSETS_PROMPT } from "./cases/Case6AssetsPrompt";
import { CASE_7_REVIEW_PROMPT } from "./cases/Case7ReviewPrompt";
import { CASE_8_LAUNCH_PROMPT } from "./cases/Case8LaunchPrompt";

// CAMPAIGN TYPES
import { SEARCH_TYPE_RULES } from "./types/SearchTypeRules";
import { PMAX_TYPE_RULES } from "./types/PMaxTypeRules";
import { SHOPPING_TYPE_RULES } from "./types/ShoppingTypeRules";
import { APP_TYPE_RULES } from "./types/AppTypeRules";
import { DISPLAY_TYPE_RULES } from "./types/DisplayTypeRules";
import { DEMAND_GEN_TYPE_RULES } from "./types/DemandGenTypeRules";
import { VIDEO_TYPE_RULES } from "./types/VideoTypeRules";

// SCHEMAS
import { DISCOVERY_SCHEMA } from "./schemas/DiscoverySchema";
import { OBJECTIVE_SCHEMA } from "./schemas/ObjectiveSchema";
import { GOALS_SCHEMA } from "./schemas/GoalsSchema";
import { CAMPAIGN_TYPE_SCHEMA } from "./schemas/CampaignTypeSchema";
import { CAMPAIGN_SETUP_SCHEMA } from "./schemas/CampaignSetupSchema";
import { ASSET_SCHEMA } from "./schemas/AssetSchema";
import { REVIEW_SCHEMA } from "./schemas/ReviewSchema";
import { LAUNCH_SCHEMA } from "./schemas/LaunchSchema";

export interface PromptBuilderOptions {
  activeCase: CaseIdentifier;
  campaignState: any;
  lastUserMessage?: string;
}

export class PromptBuilder {
  /**
   * Builds a tailored system prompt dynamically combining:
   * GLOBAL_BASE + ACTIVE_CASE_PROMPT + ACTIVE_CAMPAIGN_TYPE_RULES (only when required) + SCHEMA + RELEVANT_STATE
   *
   * Consumes 0 AI tokens (pure deterministic TypeScript string composition).
   */
  public static buildCampaignSystemPrompt(options: PromptBuilderOptions): string {
    const { activeCase, campaignState } = options;
    const parts: string[] = [];

    // 1. GLOBAL BASE PROMPT
    parts.push(GOOGLE_ADS_PROMPT_BASE);

    // 2. ACTIVE CASE PROMPT
    switch (activeCase) {
      case "CASE_1_DISCOVERY":
        parts.push(CASE_1_DISCOVERY_PROMPT);
        break;
      case "CASE_2_OBJECTIVE":
        parts.push(CASE_2_OBJECTIVE_PROMPT);
        break;
      case "CASE_3_GOALS":
        parts.push(CASE_3_GOALS_PROMPT);
        break;
      case "CASE_4_CAMPAIGN_TYPE":
        parts.push(CASE_4_CAMPAIGN_TYPE_PROMPT);
        break;
      case "CASE_5_SETUP":
        parts.push(CASE_5_SETUP_PROMPT);
        break;
      case "CASE_6_ASSETS":
        parts.push(CASE_6_ASSETS_PROMPT);
        break;
      case "CASE_7_REVIEW":
        parts.push(CASE_7_REVIEW_PROMPT);
        break;
      case "CASE_8_LAUNCH":
        parts.push(CASE_8_LAUNCH_PROMPT);
        break;
      default:
        parts.push(CASE_1_DISCOVERY_PROMPT);
        break;
    }

    // 3. CAMPAIGN TYPE RULES (loaded ONLY when activeCase is CASE_5_SETUP, CASE_6_ASSETS, or CASE_7_REVIEW)
    const rawType = (campaignState?.campaignType || "").toUpperCase();
    const needsTypeRules = (activeCase === "CASE_5_SETUP" || activeCase === "CASE_6_ASSETS" || activeCase === "CASE_7_REVIEW") && rawType;

    if (needsTypeRules) {
      switch (rawType) {
        case "SEARCH":
          parts.push(SEARCH_TYPE_RULES);
          break;
        case "PERFORMANCE_MAX":
          parts.push(PMAX_TYPE_RULES);
          break;
        case "SHOPPING":
          parts.push(SHOPPING_TYPE_RULES);
          break;
        case "APP":
          parts.push(APP_TYPE_RULES);
          break;
        case "DISPLAY":
          parts.push(DISPLAY_TYPE_RULES);
          break;
        case "DEMAND_GEN":
          parts.push(DEMAND_GEN_TYPE_RULES);
          break;
        case "VIDEO":
          parts.push(VIDEO_TYPE_RULES);
          break;
        default:
          break;
      }
    }

    // 4. FOCUSED OUTPUT JSON SCHEMA
    switch (activeCase) {
      case "CASE_1_DISCOVERY":
        parts.push(DISCOVERY_SCHEMA);
        break;
      case "CASE_2_OBJECTIVE":
        parts.push(OBJECTIVE_SCHEMA);
        break;
      case "CASE_3_GOALS":
        parts.push(GOALS_SCHEMA);
        break;
      case "CASE_4_CAMPAIGN_TYPE":
        parts.push(CAMPAIGN_TYPE_SCHEMA);
        break;
      case "CASE_5_SETUP":
        parts.push(CAMPAIGN_SETUP_SCHEMA);
        break;
      case "CASE_6_ASSETS":
        parts.push(ASSET_SCHEMA);
        break;
      case "CASE_7_REVIEW":
        parts.push(REVIEW_SCHEMA);
        break;
      case "CASE_8_LAUNCH":
        parts.push(LAUNCH_SCHEMA);
        break;
      default:
        parts.push(DISCOVERY_SCHEMA);
        break;
    }

    // 5. CURRENT COMPACT STATE
    const stateJson = JSON.stringify(campaignState || {}, null, 2);
    parts.push(`Current Campaign State:\n${stateJson}`);

    return parts.join("\n\n");
  }
}
