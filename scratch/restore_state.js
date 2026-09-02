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

// For each file that still has dangling languageSearchInput but uses LanguageDropdown
// we just need to add back the state variable declaration, since the state was removed
// but JSX references remain.

walk(targetDir, (filepath) => {
  if (!filepath.endsWith('page.tsx')) return;
  
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Check if the file has LanguageDropdown imported (was processed) and still has languageSearchInput references
  if (content.includes('LanguageDropdown') && content.includes('languageSearchInput')) {
    
    // Find where selectedLanguages state is declared and add languageSearchInput state right after it
    const lines = content.split('\n');
    
    // Check if languageSearchInput state is already declared
    const hasState = lines.some(l => l.includes('const [languageSearchInput, setLanguageSearchInput]'));
    
    if (!hasState) {
      // Find the line with selectedLanguages state declaration
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const [selectedLanguages, setSelectedLanguages]')) {
          // Insert after this line
          lines.splice(i + 1, 0, '  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");');
          break;
        }
      }
      
      fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
      console.log(`Restored languageSearchInput state in ${filepath}`);
    }
  }
});
