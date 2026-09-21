const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

const oldStyle = `    const isHinglish = code === "hi" && isLatin;
    const isMarathlish = code === "mr" && isLatin;
    const isHindi = code === "hi" && !isLatin;
    const isMarathi = code === "mr" && !isLatin;`;

const newStyle = `    const isHinglish = (code === "hi" && isLatin) || detected?.style === "hinglish" || detected?.variant === "hinglish";
    const isMarathlish = (code === "mr" && isLatin) || detected?.style === "marathlish" || detected?.variant === "marathlish";
    const isHindi = code === "hi" && !isHinglish;
    const isMarathi = code === "mr" && !isMarathlish;`;

code = code.replace(oldStyle, newStyle);
fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully updated getLanguageStyle!');
