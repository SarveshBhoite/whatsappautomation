const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

// 1. Update analyzeUserLanguage to add variant property to DetectedLanguageInfo
code = code.replace(
  'export interface DetectedLanguageInfo {\n  code: string;\n  name: string;\n  nativeName: string;\n  metaLocaleKey: number;\n  localeCode: string;\n  script: string;\n  confidence: number;\n  style?: "hinglish" | "marathlish" | "mr" | "hi" | "gu" | "en" | string;\n}',
  'export interface DetectedLanguageInfo {\n  code: string;\n  name: string;\n  nativeName: string;\n  metaLocaleKey: number;\n  localeCode: string;\n  script: string;\n  confidence: number;\n  style?: "hinglish" | "marathlish" | "mr" | "hi" | "gu" | "en" | string;\n  variant?: "hinglish" | "marathlish" | "mr" | "hi" | "gu" | "en" | string;\n}'
);

// Update returns in analyzeUserLanguage
code = code.replace(
  'return { code: "mr", name: "Marathi", nativeName: "मराठी", metaLocaleKey: 21, localeCode: "mr_IN", script: "Latin", confidence: 0.98, style: "marathlish" };',
  'return { code: "mr", name: "Marathi", nativeName: "मराठी", metaLocaleKey: 21, localeCode: "mr_IN", script: "Latin", confidence: 0.98, style: "marathlish", variant: "marathlish" };'
);

code = code.replace(
  'return { code: "hi", name: "Hindi", nativeName: "हिंदी", metaLocaleKey: 20, localeCode: "hi_IN", script: "Latin", confidence: 0.98, style: "hinglish" };',
  'return { code: "hi", name: "Hindi", nativeName: "हिंदी", metaLocaleKey: 20, localeCode: "hi_IN", script: "Latin", confidence: 0.98, style: "hinglish", variant: "hinglish" };'
);

// Also fix transliteration matches in analyzeUserLanguage
code = code.replace(
  '    const hindiTranslitMatches = trimmed.match(/\\b(?:mere|meri|mera|muze|mujhe|hum|hume|humko|aap|aapka|aapke|aapki|hain|hoga|hogi|hoge|nahin|chahiye|karna|karni|karne|kare|karenge|karo|chalana|chalani|chalaye|batao|bataiye|bhejo|kaise|kaisa|kaisi|kitna|kitne|kitni|apna|apne|apni|badana|badhana|bikri|bikree|shuru|shuruat|theek|kripya|naam|karna hai|karni hai)\\b/gi) || [];',
  '    const hindiTranslitMatches = trimmed.match(/\\b(?:mere|meri|mera|muze|mujhe|hum|hume|humko|ham|hamko|aap|aapka|aapke|aapki|hain|hai|hoga|hogi|hoge|nahin|nahi|chahiye|karna|karni|karne|kare|karenge|karo|karte|karta|karti|chalana|chalani|chalaye|batao|bataiye|bhejo|kaise|kaisa|kaisi|kitna|kitne|kitni|apna|apne|apni|badana|badhana|bikri|bikree|shuru|shuruat|theek|kripya|naam|nam|karna hai|karni hai|karte hai|karte hain|konsa|kaunsa|kya|kyu|kyun)\\b/gi) || [];'
);

code = code.replace(
  '    const marathiTranslitMatches = trimmed.match(/\\b(?:mala|tula|aamhi|amhi|aahe|ahe|ahet|aahet|nahi|naahi|pahije|pahijet|karaych[aei]|chalvaych[aei]|vadhvaych[aei]|kara|karu|karave|karava|karavi|karto|karte|kartat|divas|bhetel|sanga|sangitla|sangitlele|maharashtra|punyat|mumbait|chalu|karun|kiti|kuthe|kay|kash[aei]|kasa|kasi|kase|sathi|madhe|mde|alele|aalele|vr|wale|theu|dya|baddal|tyanchya|tumcha|tumchi|tumche|tumhi|maza|majha|mazi|majhi|maaze|maze|maz[ao]|hawa|havi|hawe|aani|ani|pan|jar|tar|mhanun|lavauche|thevayche|dakhav|dakhva|dakhvaychi|pahile|aata|kra|kraychi|set karaychi)\\b/gi) || [];',
  '    const marathiTranslitMatches = trimmed.match(/\\b(?:mala|tula|aamhi|amhi|aahe|ahe|ahet|aahet|nahi|naahi|pahije|pahijet|karaych[aei]|chalvaych[aei]|vadhvaych[aei]|kara|karu|karave|karava|karavi|karto|kartat|divas|bhetel|sanga|sangitla|sangitlele|maharashtra|punyat|mumbait|chalu|karun|kiti|kuthe|kay|kash[aei]|kasa|kasi|kase|sathi|madhe|mde|alele|aalele|vr|wale|theu|dya|baddal|tyanchya|tumcha|tumchi|tumche|tumhi|maza|majha|mazi|majhi|maaze|maze|maz[ao]|hawa|havi|hawe|aani|ani|pan|jar|tar|mhanun|lavauche|thevayche|dakhav|dakhva|dakhvaychi|pahile|aata|kra|kraychi|set karaychi)\\b/gi) || [];'
);

// 2. Fix app regex so "approach" does not trigger APP destination
code = code.replace(
  '    } else if (/app|mobile app|app install|download app|play store|app store|ॲप|ऐप|डाउनलोड/i.test(normalizedUserText) && !/whatsapp/i.test(normalizedUserText)) {',
  '    } else if (/\\bapp\\b|mobile app|app install|download app|play store|app store|ॲप|ऐप|डाउनलोड/i.test(normalizedUserText) && !/whatsapp|approach/i.test(normalizedUserText)) {'
);

// 3. Add Consultative Advisors in processMessage right before Section 2.1
const consultativeCode = `
    // 2.0C CONSULTATIVE ADVISOR INTENTS (Senior Media Buyer guidance for Goal, Destination & Budget)
    const style = MetaLanguageAnalyzerService.getLanguageStyle(detectedLang);

    // Goal Advice Intent
    const isGoalConsultation =
      /(?:konsa|kaunsa|konta|which|what|best).*(?:campaign|goal|objective|ad|choose|select|karu|karna chahiye)|(?:sales|leads|grow).*(?:boost|increase|grow|karna hai|karni hai|karaychi).*(?:konsa|kaunsa|konta|which|kaise|kasa)/i.test(normalizedUserText);

    if (isGoalConsultation && !state.draft.campaign.promotedService) {
      let goalAdviceMsg = \`🎯 **Senior Media Buyer Recommendation**:\\n\\nFor maximum ROI and fast direct inquiries, **Click-to-WhatsApp** and **Instant Lead Generation** deliver the lowest Cost Per Acquisition (CPA) for growing businesses!\\n\\n🏢 **Aapke business, shop ya brand ka naam kya hai?** Aur aap kya product, service ya offer advertise karna chahte hain?\`;

      let goalChips = [
        { label: "💬 Click-to-WhatsApp (High Direct Sales)", value: "GOAL_WHATSAPP" },
        { label: "📝 Instant Lead Form (Qualified Quotes)", value: "GOAL_LEAD_GEN" },
        { label: "🌐 Website Traffic / Landing Page", value: "GOAL_WEBSITE" },
      ];

      if (style.isMarathlish) {
        goalAdviceMsg = \`🎯 **Senior Media Buyer Recommendation**:\\n\\nDirect customer inquiry ani sales sathi **Click-to-WhatsApp** kinva **Instant Lead Gen** sarvat best result detat!\\n\\n🏢 **Tumchya business, shop kinva brand che nav kay ahe?** Ani tumhi konti service kinva offer promote karu ichhita?\`;
      } else if (style.isMarathi) {
        goalAdviceMsg = \`🎯 **Senior Media Buyer सल्ला**:\\n\\nथेट ग्राहक संपर्क आणि जलद विक्रीसाठी **Click-to-WhatsApp** आणि **इन्स्टंट लीड जनरेशन** सर्वोत्तम परिणाम देतात!\\n\\n🏢 **तुमच्या व्यवसाय, दुकान किंवा ब्रँडचे नाव काय आहे?** आणि तुम्ही कोणते उत्पादन, सेवा किंवा ऑफर जाहिरातीत दाखवू इच्छिता?\`;
        goalChips = [
          { label: "💬 Click-to-WhatsApp (थेट विक्रीसाठी)", value: "GOAL_WHATSAPP" },
          { label: "📝 इन्स्टंट लीड फॉर्म", value: "GOAL_LEAD_GEN" },
          { label: "🌐 वेबसाईट ट्रॅफिक", value: "GOAL_WEBSITE" },
        ];
      } else if (style.isHindi) {
        goalAdviceMsg = \`🎯 **Senior Media Buyer सलाह**:\\n\\nसीधी बिक्री और तुरंत ग्राहक पूछताछ के लिए **Click-to-WhatsApp** और **इंस्टेंट लीड फॉर्म** सबसे प्रभावी हैं!\\n\\n🏢 **आपके व्यवसाय, दुकान या ब्रांड का नाम क्या है?** और आप किस उत्पाद, सेवा या ऑफर का प्रचार करना चाहते हैं?\`;
        goalChips = [
          { label: "💬 Click-to-WhatsApp (सीधी बिक्री)", value: "GOAL_WHATSAPP" },
          { label: "📝 इंस्टेंट लीड फॉर्म", value: "GOAL_LEAD_GEN" },
          { label: "🌐 वेबसाइट ट्रैफ़िक", value: "GOAL_WEBSITE" },
        ];
      }

      state.status = "DISCOVERY";
      state.requiresConfirmation = false;
      state.conversation.push({
        id: \`msg_ai_\${Date.now()}\`,
        sender: "ai",
        text: goalAdviceMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickOptions: goalChips,
      });

      state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);
      return state;
    }

    // Destination Advice Intent
    const isDestinationConsultation =
      /(?:konsa|kaunsa|konta|which|best|recommend|approach).*(?:destination|platform|bhejna|pathvaycha|approach)|(?:destination|approach).*(?:best|sahi|chaan|konta|kaunsa|konsa)/i.test(normalizedUserText) ||
      /best approach.*destination/i.test(normalizedUserText);

    if (isDestinationConsultation) {
      let destAdviceMsg = \`🎯 **Senior Media Buyer Destination Strategy**:\\n\\n1. **Click-to-WhatsApp (Recommended)**: Best for direct 1-on-1 customer interaction, instant negotiations, and 3x higher conversion rate in India.\\n2. **Instant Lead Form**: Best for collecting detailed requirements, quote requests, and email/phone lists inside Meta without drop-offs.\\n3. **Website**: Best if you have a fast e-commerce store or booking landing page.\\n\\n👇 **Aap kaunsa destination prefer karenge?**\`;

      let destChips = [
        { label: "💬 WhatsApp Chat (Recommended)", value: "DESTINATION_WHATSAPP" },
        { label: "📝 Instant Lead Form", value: "DESTINATION_INSTANT_FORM" },
        { label: "🌐 Website / Landing Page", value: "DESTINATION_WEBSITE" },
        { label: "📞 Direct Phone Call", value: "DESTINATION_PHONE_CALL" },
      ];

      if (style.isMarathlish) {
        destAdviceMsg = \`🎯 **Senior Media Buyer Destination Strategy**:\\n\\n1. **Click-to-WhatsApp (Recommended)**: Direct client communication ani high conversion sathi sarvat best.\\n2. **Instant Lead Form**: Quotation ani custom inquiry collect karnyasathi changle.\\n\\n👇 **Tumhi konta option nivadal?**\`;
      } else if (style.isMarathi) {
        destAdviceMsg = \`🎯 **Senior Media Buyer गंतव्य सल्ला**:\\n\\n1. **Click-to-WhatsApp (शिफारस केलेले)**: ग्राहकांशी थेट संवाद आणि सर्वात जास्त रूपांतरण (Conversion Rate) मिळवण्यासाठी सर्वोत्तम.\\n2. **इन्स्टंट लीड फॉर्म**: ग्राहकांचे नाव, फोन आणि गरजा गोळा करण्यासाठी योग्य.\\n\\n👇 **तुम्हाला कोणता पर्याय निवडायचा आहे?**\`;
      } else if (style.isHindi) {
        destAdviceMsg = \`🎯 **Senior Media Buyer गंतव्य सलाह**:\\n\\n1. **Click-to-WhatsApp (अनुशंसित)**: सीधे ग्राहक बातचीत और 3x बेहतर कन्वर्शन दर के लिए सबसे उपयुक्त।\\n2. **इंस्टेंट लीड फॉर्म**: ग्राहकों की जानकारी और कोटेशन अनुरोध प्राप्त करने के लिए सर्वोत्तम।\\n\\n👇 **आप कौन सा विकल्प चुनना चाहेंगे?**\`;
      }

      state.status = "DRAFTING";
      state.requiresConfirmation = false;
      state.conversation.push({
        id: \`msg_ai_\${Date.now()}\`,
        sender: "ai",
        text: destAdviceMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickOptions: destChips,
      });

      state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);
      return state;
    }

    // Budget Advice Intent
    const isBudgetConsultation =
      !validNewBudget &&
      (/(?:kitna|kiti|how much|what|suggest|recommend).*(?:budget|spend|cost|kharch|rakhu|thevu|sahi|yogya|best)|(?:budget|spend).*(?:sahi|kitna|kiti|recommend|suggest|sweet spot)/i.test(normalizedUserText) ||
      /kitna budget sahi rahega/i.test(normalizedUserText));

    if (isBudgetConsultation) {
      let budgetAdviceMsg = \`💰 **Senior Media Buyer Budget Strategy**:\\n\\nFor regional business campaigns, **₹500 / day (Advantage CBO)** is the optimal algorithmic sweet spot. It gives Meta's AI enough conversion data to find high-intent buyers, delivering ~**12 to 25 daily WhatsApp conversations** at ~₹25–₹45 CPA.\\n\\n👇 **Kitna daily budget set karna chahenge?**\`;

      let budgetChips = [
        { label: "💰 ₹500 / day (Recommended Sweet Spot)", value: "BUDGET_500" },
        { label: "🚀 ₹1,000 / day (Accelerated Growth)", value: "BUDGET_1000" },
        { label: "🌱 ₹300 / day (Starter Testing)", value: "BUDGET_300" },
      ];

      if (style.isMarathlish) {
        budgetAdviceMsg = \`💰 **Senior Media Buyer Budget Strategy**:\\n\\nLocal business sathi **₹500 / divas (Advantage CBO)** ha ideal sweet spot ahe. Meta AI la purrsa data milto ani darroj ~**12 te 25 inquiries** bhetatat.\\n\\n👇 **Kiti daily budget thevayche ahe?**\`;
      } else if (style.isMarathi) {
        budgetAdviceMsg = \`💰 **Senior Media Buyer बजेट सल्ला**:\\n\\nस्थानिक व्यवसायासाठी **₹५०० / दिवस (Advantage CBO)** हे सर्वात योग्य आणि कार्यक्षम बजेट आहे. यामुळे दररोज सुमारे **१२ ते २५ थेट चौकशी/संभाषणे** मिळू शकतात.\\n\\n👇 **तुम्हाला दररोज किती बजेट ठेवायचे आहे?**\`;
      } else if (style.isHindi) {
        budgetAdviceMsg = \`💰 **Senior Media Buyer बजट सलाह**:\\n\\nस्थानीय व्यवसायों के लिए **₹500 / दिन (Advantage CBO)** सबसे उपयुक्त स्वीट स्पॉट है। इससे मेटा के एआई को पर्याप्त डेटा मिलता है और प्रतिदिन लगभग **12 से 25 सीधी पूछताछ** प्राप्त होती हैं।\\n\\n👇 **आप प्रतिदिन कितना बजट सेट करना चाहते हैं?**\`;
      }

      state.status = "DRAFTING";
      state.requiresConfirmation = false;
      state.conversation.push({
        id: \`msg_ai_\${Date.now()}\`,
        sender: "ai",
        text: budgetAdviceMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickOptions: budgetChips,
      });

      state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);
      return state;
    }
`;

code = code.replace(
  '    // 2.1 IN-FLIGHT CAMPAIGN CREATIVE SELECTION & APPROVAL (AI Graphic Banner vs Direct Upload)',
  `${consultativeCode}\n    // 2.1 IN-FLIGHT CAMPAIGN CREATIVE SELECTION & APPROVAL (AI Graphic Banner vs Direct Upload)`
);

fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully patched consultative advisors!');
