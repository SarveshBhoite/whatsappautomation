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
    if (content.includes('<LanguageDropdown ') && !content.includes('import { LanguageDropdown }')) {
      const parts = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('import ')) {
          insertIndex = i;
        }
      }
      // Insert after the last import statement, but we need to handle multiline imports.
      // So instead, just insert it after the first import block.
      parts.splice(2, 0, 'import { LanguageDropdown } from "@/components/LanguageDropdown";');
      fs.writeFileSync(filepath, parts.join('\n'), 'utf8');
      console.log(`Added import to ${filepath}`);
    }
  }
});
