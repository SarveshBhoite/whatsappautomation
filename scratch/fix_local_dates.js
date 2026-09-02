const fs = require('fs');

const filepath = 'frontend/src/app/ads/campaigns/create/local/performance-max/page.tsx';
let c = fs.readFileSync(filepath, 'utf8');

// Find start date input and replace
// Use a regex to handle CRLF/LF differences
const startInputRe = /<input\s*\r?\n\s*type="date"\s*\r?\n\s*value=\{startDate\}\s*\r?\n\s*onChange=\{\(e\) => setStartDate\(e\.target\.value\)\}\s*\r?\n\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"\s*\r?\n\s*\/>/;
const newStartInput = `<input
                             type="date"
                             min={new Date().toISOString().split("T")[0]}
                             value={startDate}
                             onChange={(e) => {
                               setStartDate(e.target.value);
                               const today = new Date().toISOString().split("T")[0];
                               if (e.target.value && e.target.value < today) { setStartDateError("Start date cannot be in the past."); } else { setStartDateError(null); }
                               if (endDate && e.target.value && endDate <= e.target.value) { const d = new Date(e.target.value); d.setDate(d.getDate()+1); setEndDate(d.toISOString().split("T")[0]); setEndDateError(null); }
                             }}
                             className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary \${startDateError ? "border-rose-400" : "border-slate-200"}\`}
                           />
                           {startDateError && <p className="text-[11px] text-rose-500 font-semibold">{startDateError}</p>}`;

if (startInputRe.test(c)) {
  c = c.replace(startInputRe, newStartInput);
  console.log('Fixed start date input');
} else {
  console.log('WARNING: start date regex did not match');
}

// Find end date input and replace
const endInputRe = /<input\s*\r?\n\s*type="date"\s*\r?\n\s*value=\{endDate\}\s*\r?\n\s*onChange=\{\(e\) => setEndDate\(e\.target\.value\)\}\s*\r?\n\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"\s*\r?\n\s*\/>/;
const newEndInput = `<input
                             type="date"
                             min={startDate ? (() => { const d = new Date(startDate); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; })() : new Date().toISOString().split("T")[0]}
                             value={endDate}
                             onChange={(e) => {
                               setEndDate(e.target.value);
                               if (startDate && e.target.value && e.target.value <= startDate) { setEndDateError("End date must be after start date."); } else { setEndDateError(null); }
                             }}
                             className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary \${endDateError ? "border-rose-400" : "border-slate-200"}\`}
                           />
                           {endDateError && <p className="text-[11px] text-rose-500 font-semibold">{endDateError}</p>}`;

if (endInputRe.test(c)) {
  c = c.replace(endInputRe, newEndInput);
  console.log('Fixed end date input');
} else {
  console.log('WARNING: end date regex did not match');
}

fs.writeFileSync(filepath, c, 'utf8');
console.log('Done.');
console.log('startDateError in file:', c.includes('startDateError &&'));
console.log('endDateError in file:', c.includes('endDateError &&'));
