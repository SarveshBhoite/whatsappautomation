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

const filesToUpdate = [];

walk(targetDir, (filepath) => {
  if (filepath.endsWith('page.tsx')) {
    const content = fs.readFileSync(filepath, 'utf8');
    if (content.includes('selectedLanguages')) {
      filesToUpdate.push(filepath);
    }
  }
});

console.log(`Found ${filesToUpdate.length} files with selectedLanguages`);

filesToUpdate.forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;

  // Add import if not present
  if (!content.includes('LanguageDropdown')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + 'import { LanguageDropdown } from "@/components/LanguageDropdown";\n' + content.slice(endOfLastImport + 1);
    changed = true;
  }

  // Replace the Languages UI block for "select" type (like in video/page.tsx)
  const selectRegex = /<div className="space-y-3">\s*<div className="relative max-w-md">\s*<select[\s\S]*?<\/select>\s*<\/div>[\s\S]*?<div className="flex flex-wrap gap-2 pt-1">[\s\S]*?<\/div>\s*<\/div>/g;
  if (selectRegex.test(content)) {
    content = content.replace(selectRegex, `<LanguageDropdown selectedLanguages={selectedLanguages} setSelectedLanguages={setSelectedLanguages} customerId={customerId || "6587355041"} />`);
    changed = true;
  }

  // Replace the Languages UI block for "searchable" type (like in search/page.tsx)
  // This is a broader regex that handles the whole block.
  const searchRegex = /<div className="space-y-1 max-w-md">[\s\S]*?{languageSearchInput\.trim\(\)\.length > 0 && \([\s\S]*?<\/div>\s*\)}[\s\S]*?<div className="flex flex-wrap gap-2 pt-1">[\s\S]*?<\/div>/g;
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, `<LanguageDropdown selectedLanguages={selectedLanguages} setSelectedLanguages={setSelectedLanguages} customerId={customerId || "6587355041"} />`);
    changed = true;
  }
  
  // also handle standard search/page.tsx style
  const alternateSearchRegex = /<div className="space-y-1 max-w-md">\s*<div className="relative">[\s\S]*?<\/div>\s*<\/div>\s*{languageSearchInput[\s\S]*?<\/div>\s*\)}\s*<div className="flex flex-wrap gap-2 pt-1">[\s\S]*?<\/div>/g;
  if (alternateSearchRegex.test(content)) {
      content = content.replace(alternateSearchRegex, `<LanguageDropdown selectedLanguages={selectedLanguages} setSelectedLanguages={setSelectedLanguages} customerId={customerId || "6587355041"} />`);
      changed = true;
  }

  // Remove unused state variables that might cause linter errors
  content = content.replace(/const \[languageSearchInput, setLanguageSearchInput\] = useState<string>\(""\);\n?/g, '');
  content = content.replace(/const \[showLanguageDropdown, setShowLanguageDropdown\] = useState<boolean>\(false\);\n?/g, '');
  
  // Also remove languagesList from search/page.tsx
  content = content.replace(/const languagesList = \[[^\]]*\];\n?/g, '');

  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
