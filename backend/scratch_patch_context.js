const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

// 1. Add Reset Handler at top of processMessage right after language detection
const resetCode = `    // 2.00 RESET CAMPAIGN INTENT
    if (/^(?:reset|restart|clear|reset campaign|restart campaign|suru pasun|shuru se|clear draft)\\b/i.test(normalizedUserText.trim())) {
      state.draft.campaign = { name: undefined as any, dailyBudget: undefined as any };
      state.draft.destination = {};
      state.draft.targeting = {};
      state.draft.creative = {};
      state.draft.sourceMap = {};
      state.status = "DISCOVERY";
      state.requiresConfirmation = false;
      const s = MetaLanguageAnalyzerService.getLanguageStyle(detectedLang);
      state.conversation.push({
        id: \`msg_ai_\${Date.now()}\`,
        sender: "ai",
        text: s.isMarathlish ? "Campaign draft reset zala ahe. Navin campaign suru karu!" : s.isHinglish ? "Campaign draft reset ho gaya hai. Chaliye naya campaign shuru karein!" : s.isMarathi ? "मोहीम रीसेट केली आहे. चला नवीन मोहीम सुरू करूया!" : "Campaign draft reset. Let's start fresh!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);
      return state;
    }`;

code = code.replace(
  '    // 2.0 ZERO-FRICTION ONE-SHOT INTERCEPTOR:',
  `${resetCode}\n\n    // 2.0 ZERO-FRICTION ONE-SHOT INTERCEPTOR:`
);

// 2. Add Correction Handler & Promoted Service Extraction
const serviceAndCorrectionCode = `    // User correction / explicit field change intent
    const matchBrandChange = normalizedUserText.match(/(?:brand|brand name|name|nav|naam)\\s*(?:change|badla|update|change karo|badlo)\\s*(?:to|as|into|ko)?\\s*(.+)/i) ||
      normalizedUserText.match(/(?:change|badla|update|change karo|badlo)\\s*(?:brand|brand name|name|nav|naam)?\\s*(?:to|as|into|ko)\\s*(.+)/i);
    if (matchBrandChange && matchBrandChange[1]) {
      const newBrand = matchBrandChange[1].trim();
      state.draft.campaign.name = newBrand;
      (state.draft.campaign as any).brandName = newBrand;
      MetaCampaignDraftService.setField(state.draft, "campaign.name", newBrand, "USER", 1.0, "User corrected brand name");
    }

    // Promoted Product / Service Extraction
    if (!state.draft.campaign.promotedService) {
      const servicePatterns = [
        /(?:ham|hum|amhi|आम्ही|we)\\s+([a-zA-Z0-9\\u0900-\\u097F\\s&'-]+?)\\s+(?:provide karte|offer karte|dete|karto|vikto|विकतो|dene|deta|karein|आहे)/i,
        /(?:service|product|offer|provide|provide karte|dene|deta|karto|vikto|विकतो|सेवा|काम|उत्पादन)\\s*(?:is|:)?\\s*([a-zA-Z0-9\\u0900-\\u097F\\s&'-]+?)(?:\\s+(?:ahe|आहे|hai|है|provide|,|\\.|$))/i,
        /(?:for|sathi|साठी|ke liye|के लिए)\\s+([a-zA-Z0-9\\u0900-\\u097F\\s&'-]+?)\\s+(?:chahiye|pahije|sales|leads|customers|ad|campaign|promote)/i,
        /(?:sales|leads|inquir|customers|ad|campaign|promote).*(?:for|sathi|साठी|ke liye|के लिए)\\s+([a-zA-Z0-9\\u0900-\\u097F\\s&'-]+?)(?:[,\\n]|$)/i,
      ];
      for (const sp of servicePatterns) {
        const sm = normalizedUserText.match(sp);
        if (sm && sm[1] && sm[1].trim().length >= 3 && !/^(?:ahe|आहे|hai|है|and|आणि|yes|no)$/i.test(sm[1].trim())) {
          state.draft.campaign.promotedService = sm[1].trim();
          MetaCampaignDraftService.setField(
            state.draft,
            "campaign.promotedService",
            state.draft.campaign.promotedService,
            "USER",
            0.95,
            "Extracted promoted service/product from conversation"
          );
          break;
        }
      }
    }

    // Placements extraction (Advantage+ vs Manual)
    if (/advantage\\+|advantage plus|सर्व प्लॅटफॉर्म|सभी प्लेटफॉर्म|all platforms/i.test(normalizedUserText) && !selectedOptionValue) {
      state.draft.targeting.placements = "ADVANTAGE_PLUS";
      state.draft.targeting.publisherPlatforms = ["facebook", "instagram", "audience_network", "messenger"];
      MetaCampaignDraftService.setField(state.draft, "targeting.placements", "ADVANTAGE_PLUS", "USER", 1.0, "Advantage+ Placements");
    }`;

code = code.replace(
  '    // 2.3 Deterministic Business Name & Product/Service Offer Extraction',
  `${serviceAndCorrectionCode}\n\n    // 2.3 Deterministic Business Name & Product/Service Offer Extraction`
);

// 3. Fix brand splitting regex so dots in Pvt.Ltd are not split
code = code.replace(
  'const firstPart = normalizedUserText.split(/[,.\\n]|(?:\\s+(?:amhi|आम्ही|we|and|ani|आणि|hai|ahe)\\b)/i)[0].trim();',
  'const firstPart = normalizedUserText.split(/[\\n]|(?:\\s+(?:amhi|आम्ही|we|and|ani|आणि|hai|ahe)\\b)/i)[0].trim();'
);

fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully added service, correction, and reset handlers!');
