const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

const oldBlock = `          if (detectedLang.code === "mr") {
            askPhoneMsg = \`या मोहिमेसाठी तुम्हाला कोणता व्हॉट्सअॅप नंबर वापरायचा आहे? कृपया खालीलपैकी पर्याय निवडा:\`;
          } else if (detectedLang.code === "hi") {
            askPhoneMsg = \`इस विज्ञापन के लिए आप किस व्हाट्सएप नंबर का उपयोग करना चाहते हैं? कृपया नीचे दिए गए विकल्पों में से चुनें:\`;
          } else if (detectedLang.code === "gu") {
            askPhoneMsg = \`આ જાહેરાત માટે તમે કયો વ્હોટ્સએપ નંબર વાપરવા માંગો છો? કૃપા કરીને નીચેના વિકલ્પોમાંથી પસંદ કરો:\`;
          } else {
            askPhoneMsg = \`Which WhatsApp number do you want to use for this campaign? Please select below:\`;
          }`;

const newBlock = `          if (style.isMarathlish) {
            askPhoneMsg = \`Ya campaign sathi tumhala konta WhatsApp number vapraycha ahe? Krupaya khali ek option select kara:\`;
          } else if (style.isMarathi) {
            askPhoneMsg = \`या मोहिमेसाठी तुम्हाला कोणता व्हॉट्सअॅप नंबर वापरायचा आहे? कृपया खालीलपैकी पर्याय निवडा:\`;
          } else if (style.isHinglish) {
            askPhoneMsg = \`Is ad ke liye aap kaunsa WhatsApp number use karna chahte hain? Kripya niche se option chunein:\`;
          } else if (style.isHindi) {
            askPhoneMsg = \`इस विज्ञापन के लिए आप किस व्हाट्सएप नंबर का उपयोग करना चाहते हैं? कृपया नीचे दिए गए विकल्पों में से चुनें:\`;
          } else if (style.isGujarati) {
            askPhoneMsg = \`આ જાહેરાત માટે તમે કયો વ્હોટ્સએપ નંબર વાપરવા માંગો છો? કૃપા કરીને નીચેના વિકલ્પોમાંથી પસંદ કરો:\`;
          } else {
            askPhoneMsg = \`Which WhatsApp number do you want to use for this campaign? Please select below:\`;
          }`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully updated askPhoneMsg with style checking!');
