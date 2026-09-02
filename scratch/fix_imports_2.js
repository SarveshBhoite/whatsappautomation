const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'frontend/src/app/ads/campaigns/create');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let filepath = path.join(dir, file);
    let stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else {
      callback(filepath);
    }
  });
}

walk(targetDir, (filepath) => {
  if (filepath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filepath, 'utf8');
    if (content.includes('LanguageDropdown')) {
      let lines = content.split('\n');
      
      // Remove all existing LanguageDropdown imports (some might be malformed inside other imports)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import { LanguageDropdown } from "@/components/LanguageDropdown";')) {
          lines.splice(i, 1);
          i--;
        }
      }

      // Re-insert at the top, after "use client";
      let insertIndex = 0;
      if (lines[0] && lines[0].includes('"use client"')) {
        insertIndex = 1;
      }
      
      // Make sure it doesn't leave an empty line, or just insert it cleanly
      lines.splice(insertIndex, 0, 'import { LanguageDropdown } from "@/components/LanguageDropdown";');
      
      fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
      console.log(`Fixed import in ${filepath}`);
    }
  }
});
