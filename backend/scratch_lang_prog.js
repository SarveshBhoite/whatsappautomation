const { MetaAIConversationService, MetaLanguageAnalyzerService } = require('./src/services/meta-ads/metaAIConversationService');

let lang;
lang = MetaLanguageAnalyzerService.analyzeUserLanguage("muze sales boost karni hai konsa campaign choose karu");
console.log('Turn 1 lang:', lang);

lang = MetaLanguageAnalyzerService.analyzeUserLanguage("mere business ka nam jisnu hai or ham software development provide karte hai", lang);
console.log('Turn 2 lang:', lang);

lang = MetaLanguageAnalyzerService.analyzeUserLanguage("None", lang);
console.log('Turn 3 lang:', lang);

lang = MetaLanguageAnalyzerService.analyzeUserLanguage("WhatsApp Chat", lang);
console.log('Turn 4 lang:', lang);
console.log('Turn 4 style:', MetaLanguageAnalyzerService.getLanguageStyle(lang));
