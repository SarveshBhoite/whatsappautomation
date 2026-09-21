const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

// 1. Update DetectedLanguageInfo interface to include style
code = code.replace(
  'export interface DetectedLanguageInfo {\n  code: string;\n  name: string;\n  nativeName: string;\n  metaLocaleKey: number;\n  localeCode: string;\n  script: string;\n  confidence: number;\n}',
  'export interface DetectedLanguageInfo {\n  code: string;\n  name: string;\n  nativeName: string;\n  metaLocaleKey: number;\n  localeCode: string;\n  script: string;\n  confidence: number;\n  style?: "hinglish" | "marathlish" | "mr" | "hi" | "gu" | "en" | string;\n}'
);

// 2. Update analyzeUserLanguage in MetaLanguageAnalyzerService to populate style and correct script
code = code.replace(
  '      if (marathiScore > 0 && marathiScore >= hindiScore) {\n        return { code: "mr", name: "Marathi", nativeName: "मराठी", metaLocaleKey: 21, localeCode: "mr_IN", script: "Devanagari (मराठी)", confidence: 0.99 };\n      }\n      if (hindiScore > 0 && hindiScore > marathiScore) {\n        return { code: "hi", name: "Hindi", nativeName: "हिंदी", metaLocaleKey: 20, localeCode: "hi_IN", script: "Devanagari (हिंदी)", confidence: 0.99 };\n      }',
  '      if (marathiScore > 0 && marathiScore >= hindiScore) {\n        return { code: "mr", name: "Marathi", nativeName: "मराठी", metaLocaleKey: 21, localeCode: "mr_IN", script: "Devanagari (मराठी)", confidence: 0.99, style: "mr" };\n      }\n      if (hindiScore > 0 && hindiScore > marathiScore) {\n        return { code: "hi", name: "Hindi", nativeName: "हिंदी", metaLocaleKey: 20, localeCode: "hi_IN", script: "Devanagari (हिंदी)", confidence: 0.99, style: "hi" };\n      }'
);

code = code.replace(
  '    if (marathiScore > 0 && marathiScore >= hindiScore) {\n      return { code: "mr", name: "Marathi", nativeName: "मराठी", metaLocaleKey: 21, localeCode: "mr_IN", script: "Devanagari (मराठी)", confidence: 0.98 };\n    }\n    if (hindiScore > 0 && hindiScore > marathiScore) {\n      return { code: "hi", name: "Hindi", nativeName: "हिंदी", metaLocaleKey: 20, localeCode: "hi_IN", script: "Devanagari (हिंदी)", confidence: 0.98 };\n    }\n    if (englishSentenceScore > 0) {\n      return { code: "en", name: "English", nativeName: "English", metaLocaleKey: 6, localeCode: "en_US", script: "Latin", confidence: 0.98 };\n    }',
  '    if (marathiScore > 0 && marathiScore >= hindiScore) {\n      return { code: "mr", name: "Marathi", nativeName: "मराठी", metaLocaleKey: 21, localeCode: "mr_IN", script: "Latin", confidence: 0.98, style: "marathlish" };\n    }\n    if (hindiScore > 0 && hindiScore > marathiScore) {\n      return { code: "hi", name: "Hindi", nativeName: "हिंदी", metaLocaleKey: 20, localeCode: "hi_IN", script: "Latin", confidence: 0.98, style: "hinglish" };\n    }\n    if (englishSentenceScore > 0) {\n      return { code: "en", name: "English", nativeName: "English", metaLocaleKey: 6, localeCode: "en_US", script: "Latin", confidence: 0.98, style: "en" };\n    }'
);

// 3. Update parseBulkLocationInput to avoid false positives with phone numbers and demographics
const oldParseBulkLoc = `  static parseBulkLocationInput(rawText: string): {
    countries: string[];
    cityConfigs: Array<{ name: string; radiusKm: number }>;
    postalCodes: string[];
    hasBulkData: boolean;
  } {
    const text = rawText || "";
    const countries: string[] = [];
    const cityConfigs: Array<{ name: string; radiusKm: number }> = [];
    const postalCodes: string[] = [];

    // 1. Extract postal / PIN codes (5-6 digits e.g. 411001, 411038)
    const pinRegex = /\\b\\d{5,6}\\b/g;
    let pinMatch;
    while ((pinMatch = pinRegex.exec(text)) !== null) {
      if (!postalCodes.includes(pinMatch[0])) {
        postalCodes.push(pinMatch[0]);
      }
    }

    // 2. Extract countries
    const countryKeywords: Record<string, string> = {
      india: "India",
      bharat: "India",
      uae: "United Arab Emirates",
      "united arab emirates": "United Arab Emirates",
      dubai: "United Arab Emirates",
      usa: "United States",
      "united states": "United States",
      us: "United States",
      uk: "United Kingdom",
      "united kingdom": "United Kingdom",
      canada: "Canada",
      australia: "Australia",
      singapore: "Singapore",
      germany: "Germany",
      france: "France",
      saudi: "Saudi Arabia",
      qatar: "Qatar",
      kuwait: "Kuwait",
      oman: "Oman",
    };
    for (const [kw, formal] of Object.entries(countryKeywords)) {
      const reg = new RegExp(\`\\\\b\${kw}\\\\b\`, "i");
      if (reg.test(text) && !countries.includes(formal)) {
        countries.push(formal);
      }
    }

    // 3. Extract cities with optional radius (e.g. "Mumbai (40km)", "Pune 25 km", "Delhi 30km")
    const cityWithRadiusRegex = /([a-zA-Z\\u0900-\\u097F\\s]{2,25}?)\\s*\\(?(\\d{1,3})\\s*(?:km|kms|kilometer|kilometers)?\\)?/gi;
    let match;
    const seenCityNames = new Set<string>();

    while ((match = cityWithRadiusRegex.exec(text)) !== null) {
      const candCity = match[1].trim().replace(/^(?:cities|city|in|at|and|or|targeting|locations?)\\s+/i, "").trim();
      const radius = parseInt(match[2], 10);
      if (
        candCity.length >= 3 &&
        radius >= 15 &&
        radius <= 80 &&
        !seenCityNames.has(candCity.toLowerCase()) &&
        !/^(countries?|pincodes?|postal|zip|budget|daily|total|days?|age|gender)$/i.test(candCity)
      ) {
        seenCityNames.add(candCity.toLowerCase());
        cityConfigs.push({
          name: candCity.charAt(0).toUpperCase() + candCity.slice(1),
          radiusKm: radius,
        });
      }
    }

    // Also check for known cities mentioned without explicit radius from KNOWN_INDIAN_CITIES_GEO_KEYS
    const words = text.split(/[,;\\n\\r|/]+/);
    for (const w of words) {
      const clean = w.trim().replace(/[^\\w\\s\\u0900-\\u097F]/g, "").trim().toLowerCase();
      if (!clean) continue;
      for (const [key, info] of Object.entries(MetaAdsCapabilityService.KNOWN_INDIAN_CITIES_GEO_KEYS)) {
        if (clean.includes(key) && !seenCityNames.has(key)) {
          seenCityNames.add(key);
          cityConfigs.push({
            name: info.name.split(",")[0].trim(),
            radiusKm: 30,
          });
        }
      }
    }

    const hasBulkData = countries.length > 0 || (cityConfigs.length > 0 && (postalCodes.length > 0 || cityConfigs.length > 1 || /bulk|radius|km|pincode|postal/i.test(text))) || postalCodes.length > 0;
    return { countries, cityConfigs, postalCodes, hasBulkData };
  }`;

const newParseBulkLoc = `  static parseBulkLocationInput(rawText: string, selectedOption?: string): {
    countries: string[];
    cityConfigs: Array<{ name: string; radiusKm: number }>;
    postalCodes: string[];
    hasBulkData: boolean;
  } {
    const text = rawText || "";
    const countries: string[] = [];
    const cityConfigs: Array<{ name: string; radiusKm: number }> = [];
    const postalCodes: string[] = [];

    // Guard: ignore demographic, phone, budget, goal, or CTA option values
    if (
      selectedOption?.startsWith("AGE_") ||
      selectedOption?.startsWith("USE_PHONE_") ||
      selectedOption?.startsWith("BUDGET_") ||
      selectedOption?.startsWith("GOAL_") ||
      selectedOption?.startsWith("DESTINATION_") ||
      selectedOption?.startsWith("SPECIAL_AD_") ||
      selectedOption?.startsWith("INTEREST_") ||
      selectedOption?.startsWith("PLACEMENTS_") ||
      selectedOption === "ALL_INDIA" ||
      /(?:\\+?91[\\s-]?)?[6-9]\\d{9}/.test(text) ||
      /(?:लिंग|वर्ष|वय|आयु|साल|age|gender|years old|men only|women only|all genders)/i.test(text)
    ) {
      return { countries, cityConfigs, postalCodes, hasBulkData: false };
    }

    // 1. Extract postal / PIN codes (strictly 6 digits e.g. 411001, 411038)
    const pinRegex = /\\b[1-9]\\d{5}\\b/g;
    let pinMatch;
    while ((pinMatch = pinRegex.exec(text)) !== null) {
      if (!postalCodes.includes(pinMatch[0])) {
        postalCodes.push(pinMatch[0]);
      }
    }

    // 2. Extract countries
    const countryKeywords: Record<string, string> = {
      india: "India",
      bharat: "India",
      uae: "United Arab Emirates",
      "united arab emirates": "United Arab Emirates",
      dubai: "United Arab Emirates",
      usa: "United States",
      "united states": "United States",
      us: "United States",
      uk: "United Kingdom",
      "united kingdom": "United Kingdom",
      canada: "Canada",
      australia: "Australia",
      singapore: "Singapore",
      germany: "Germany",
      france: "France",
      saudi: "Saudi Arabia",
      qatar: "Qatar",
      kuwait: "Kuwait",
      oman: "Oman",
    };
    for (const [kw, formal] of Object.entries(countryKeywords)) {
      const reg = new RegExp(\`\\\\b\${kw}\\\\b\`, "i");
      if (reg.test(text) && !countries.includes(formal)) {
        countries.push(formal);
      }
    }

    // 3. Extract cities with optional radius (e.g. "Mumbai (40km)", "Pune 25 km", "Delhi 30km")
    const cityWithRadiusRegex = /([a-zA-Z\\u0900-\\u097F\\s]{2,25}?)\\s*\\(?(\\d{1,3})\\s*(?:km|kms|kilometer|kilometers|किमी|किलोमीटर)\\)?/gi;
    let match;
    const seenCityNames = new Set<string>();

    while ((match = cityWithRadiusRegex.exec(text)) !== null) {
      const candCity = match[1].trim().replace(/^(?:cities|city|in|at|and|or|targeting|locations?)\\s+/i, "").trim();
      const radius = parseInt(match[2], 10);
      if (
        candCity.length >= 3 &&
        radius >= 15 &&
        radius <= 80 &&
        !seenCityNames.has(candCity.toLowerCase()) &&
        !/^(countries?|pincodes?|postal|zip|budget|daily|total|days?|age|gender|लिंग|सर्व लिंग|सर्व|पुरुष|महिला|men|women|all|वय|वर्ष|साल|years|years old)$/i.test(candCity)
      ) {
        seenCityNames.add(candCity.toLowerCase());
        cityConfigs.push({
          name: candCity.charAt(0).toUpperCase() + candCity.slice(1),
          radiusKm: radius,
        });
      }
    }

    // Also check for known cities mentioned without explicit radius from KNOWN_INDIAN_CITIES_GEO_KEYS
    const words = text.split(/[,;\\n\\r|/]+/);
    for (const w of words) {
      const clean = w.trim().replace(/[^\\w\\s\\u0900-\\u097F]/g, "").trim().toLowerCase();
      if (!clean) continue;
      if (/^(?:लिंग|सर्व लिंग|सर्व|पुरुष|महिला|men|women|all|वय|वर्ष|साल|years|years old)$/i.test(clean)) continue;
      for (const [key, info] of Object.entries(MetaAdsCapabilityService.KNOWN_INDIAN_CITIES_GEO_KEYS)) {
        if (clean.includes(key) && !seenCityNames.has(key)) {
          seenCityNames.add(key);
          cityConfigs.push({
            name: info.name.split(",")[0].trim(),
            radiusKm: 30,
          });
        }
      }
    }

    const hasBulkData = countries.length > 0 || (cityConfigs.length > 0 && (postalCodes.length > 0 || cityConfigs.length > 1 || /bulk|radius|km|pincode|postal/i.test(text))) || postalCodes.length > 0;
    return { countries, cityConfigs, postalCodes, hasBulkData };
  }`;

code = code.replace(oldParseBulkLoc, newParseBulkLoc);

// 4. Update brandPatterns regex in processMessage and in generateDeterministicNextStep
const oldBrandPatternRegex = `        /(?:business|brand|shop|store|company|firm|agency|startup|व्यवसाय|ब्रँड|दुकान|कंपनी)\\s*(?:चे|चा|ची|का|की|के)?\\s*(?:नाव|नाम|name|nav|naav|naam)\\s*(?:is|ahe|आहे|hai|है|:)?\\s*([a-zA-Z0-9\\u0900-\\u097F\\s&'-]+?)(?:\\s+(?:ahe|आहे|amhi|आम्ही|and|ani|आणि|we|hai|है|,|\\.|\\n|$))/i,`;
const newBrandPatternRegex = `        /(?:my\\s+)?(?:mere\\s+)?(?:business|brand|shop|store|company|firm|agency|startup|व्यवसाय|ब्रँड|दुकान|कंपनी)\\s*(?:चे|चा|ची|का|की|के|cha|chi|che|ka|ki|ke)?\\s*(?:नाव|नाम|name|nav|naav|naam|nam)\\s*(?:is|ahe|आहे|hai|है|:)?\\s*([a-zA-Z0-9\\u0900-\\u097F\\s&'-]+?)(?:\\s+(?:ahe|आहे|amhi|आम्ही|and|ani|आणि|we|hai|है|or|aur|,|\\.|\\n|$))/i,`;

code = code.split(oldBrandPatternRegex).join(newBrandPatternRegex);

// 5. Update call to parseBulkLocationInput in processMessage
code = code.replace(
  'const bulkLocCheck = MetaAIConversationService.parseBulkLocationInput(userText);',
  'const bulkLocCheck = MetaAIConversationService.parseBulkLocationInput(userText, selectedOptionValue);'
);

fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully updated MetaAIConversationService!');
