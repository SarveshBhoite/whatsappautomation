const fs = require('fs');

const files = [
  'frontend/src/app/ads/campaigns/create/sales/performance-max/page.tsx',
  'frontend/src/app/ads/campaigns/create/leads/performance-max/page.tsx',
  'frontend/src/app/ads/campaigns/create/website-traffic/performance-max/page.tsx',
  'frontend/src/app/ads/campaigns/create/no-guidance/performance-max/page.tsx',
];

files.forEach(relPath => {
  let c = fs.readFileSync(relPath, 'utf8');
  
  // Replace "Must be today or a future date" span with error-conditional version  
  const oldHint = /<span className="text\[10px\] text-slate-500">Must be today or a future date<\/span>/;
  if (!c.includes('{startDateError ?') && c.includes('Must be today or a future date')) {
    c = c.replace(
      `<span className="text-[10px] text-slate-500">Must be today or a future date</span>`,
      `{startDateError ? (
                             <p className="text-[11px] text-rose-500 font-semibold">{startDateError}</p>
                           ) : (
                             <span className="text-[10px] text-slate-500">Must be today or a future date</span>
                           )}`
    );
    console.log(relPath + ': fixed startDate hint');
  }

  // Replace "Must be after the start date" span with error-conditional version
  if (!c.includes('{endDateError ?') && c.includes('Must be after the start date')) {
    c = c.replace(
      `<span className="text-[10px] text-slate-500">Must be after the start date</span>`,
      `{endDateError ? (
                                 <p className="text-[11px] text-rose-500 font-semibold">{endDateError}</p>
                               ) : (
                                 <span className="text-[10px] text-slate-500">Must be after the start date</span>
                               )}`
    );
    console.log(relPath + ': fixed endDate hint');
  }

  // Fix the endDate onChange to include validation
  if (!c.includes('setEndDateError') && c.includes('onChange={(e) => setEndDate(e.target.value)}\n                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"')) {
    c = c.replace(
      `onChange={(e) => setEndDate(e.target.value)}\n                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"`,
      `onChange={(e) => {
                                  setEndDate(e.target.value);
                                  if (startDate && e.target.value && e.target.value <= startDate) {
                                    setEndDateError("End date must be after start date.");
                                  } else {
                                    setEndDateError(null);
                                  }
                                }}
                                className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary \${endDateError ? "border-rose-400" : "border-slate-200"}\`}`
    );
    console.log(relPath + ': fixed endDate onChange');
  }

  // Fix the startDate className to use error border
  if (!c.includes('startDateError ? "border-rose-400"') && c.includes('Must be today or a future date')) {
    // Use regex to find the className near startDate input (before setStartDate)
    const classRe = /className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"\s*\r?\n\s*\/>\s*\r?\n\s*(\{startDateError \?|<span className="text-\[10px\] text-slate-500">Must be today or a future date)/;
    if (classRe.test(c)) {
      c = c.replace(
        /className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"(\s*\r?\n\s*\/>)(\s*\r?\n\s*)(\{startDateError \?|<span className="text-\[10px\] text-slate-500">Must be today or a future date)/,
        (m, close, newline, after) => {
          return `className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary \${startDateError ? "border-rose-400" : "border-slate-200"}\`}${close}${newline}${after}`;
        }
      );
      console.log(relPath + ': fixed startDate className');
    }
  }

  fs.writeFileSync(relPath, c, 'utf8');
});

console.log('\nVerification:');
['sales','leads','website-traffic','no-guidance'].forEach(d => {
  const c = fs.readFileSync('frontend/src/app/ads/campaigns/create/'+d+'/performance-max/page.tsx', 'utf8');
  const ok = c.includes('{startDateError ?') && c.includes('{endDateError ?');
  console.log(d + ':', ok ? 'OK' : 'MISSING');
});
