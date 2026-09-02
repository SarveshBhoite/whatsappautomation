const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/app/ads/campaigns/create/sales/performance-max/page.tsx',
  'frontend/src/app/ads/campaigns/create/leads/performance-max/page.tsx',
  'frontend/src/app/ads/campaigns/create/website-traffic/performance-max/page.tsx',
  'frontend/src/app/ads/campaigns/create/local/performance-max/page.tsx',
  'frontend/src/app/ads/campaigns/create/no-guidance/performance-max/page.tsx',
];

const baseDir = path.join(__dirname, '..');

files.forEach(relPath => {
  const filepath = path.join(baseDir, relPath);
  if (!fs.existsSync(filepath)) {
    console.log(`SKIP (not found): ${filepath}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. ADD NEW STATE VARIABLES for validations (after existing savedCallouts line)
  // ─────────────────────────────────────────────────────────────────────────

  // Add sitelink validation states
  if (!content.includes('sitelinkDupeError')) {
    content = content.replace(
      `const [savedCallouts, setSavedCallouts] = useState<string[]>([]);`,
      `const [savedCallouts, setSavedCallouts] = useState<string[]>([]);

  // Sitelink validation states
  const [sitelinkText, setSitelinkText] = useState<string>("");
  const [sitelinkDesc1, setSitelinkDesc1] = useState<string>("");
  const [sitelinkDesc2, setSitelinkDesc2] = useState<string>("");
  const [sitelinkUrl, setSitelinkUrl] = useState<string>("");
  const [sitelinkDupeError, setSitelinkDupeError] = useState<string | null>(null);
  const [sitelinkUrlError, setSitelinkUrlError] = useState<string | null>(null);
  const [sitelinkDescError, setSitelinkDescError] = useState<string | null>(null);
  const [sitelinkItems, setSitelinkItems] = useState<Array<{ text: string; desc1: string; desc2: string; url: string }>>([{ text: "", desc1: "", desc2: "", url: "" }]);`
    );
    changed = true;
  }

  // Add promo validation states
  if (!content.includes('promoStartDateError')) {
    content = content.replace(
      `const [promoStartDate, setPromoStartDate] = useState<string>("");`,
      `const [promoStartDate, setPromoStartDate] = useState<string>("");
  const [promoStartDateError, setPromoStartDateError] = useState<string | null>(null);
  const [promoEndDateError, setPromoEndDateError] = useState<string | null>(null);
  const [promoFinalUrlError, setPromoFinalUrlError] = useState<string | null>(null);`
    );
    changed = true;
  }

  // Add asset sched validation states
  if (!content.includes('assetSchedDupeError')) {
    content = content.replace(
      `const [assetSchedStartDate, setAssetSchedStartDate] = useState<string>("");`,
      `const [assetSchedStartDate, setAssetSchedStartDate] = useState<string>("");
  const [assetSchedStartError, setAssetSchedStartError] = useState<string | null>(null);
  const [assetSchedEndError, setAssetSchedEndError] = useState<string | null>(null);
  const [assetSchedDupeError, setAssetSchedDupeError] = useState<string | null>(null);`
    );
    changed = true;
  }

  // Add callout validation states
  if (!content.includes('calloutStartError')) {
    content = content.replace(
      `const [calloutStartDateType, setCalloutStartDateType] = useState<"none" | "date">("none");`,
      `const [calloutStartDateType, setCalloutStartDateType] = useState<"none" | "date">("none");
  const [calloutStartError, setCalloutStartError] = useState<string | null>(null);
  const [calloutEndError, setCalloutEndError] = useState<string | null>(null);
  const [calloutSchedDupeError, setCalloutSchedDupeError] = useState<string | null>(null);
  const [calloutDupeError, setCalloutDupeError] = useState<string | null>(null);`
    );
    changed = true;
  }

  // Add campaign date validation states
  if (!content.includes('startDateError')) {
    content = content.replace(
      `const [startDate, setStartDate] = useState<string>(todayDateString);`,
      `const [startDate, setStartDate] = useState<string>(todayDateString);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);`
    );
    changed = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SITELINKS MODAL: Replace with controlled state-based version
  // ─────────────────────────────────────────────────────────────────────────
  if (content.includes('<input id="sitelinkTextInp"')) {
    const oldSitelinkModal = `              <h4 className="font-bold text-slate-800">Sitelink 1</h4>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Sitelink text</label>
                <input id="sitelinkTextInp" type="text" maxLength={25} placeholder="Sitelink text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description line 1 (recommended)</label>
                <input id="sitelinkDesc1Inp" type="text" maxLength={35} placeholder="Description line 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 35</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description line 2 (recommended)</label>
                <input id="sitelinkDesc2Inp" type="text" maxLength={35} placeholder="Description line 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 35</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Final URL</label>
                <input id="sitelinkUrlInp" type="text" placeholder="https://www.example.com/sitelink1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono" />
              </div>`;

    const newSitelinkModal = `              {sitelinkItems.map((item, sIdx) => (
                <div key={sIdx} className="space-y-3 pb-3 border-b border-slate-100 last:border-0">
                  <h4 className="font-bold text-slate-800">Sitelink {sIdx + 1}</h4>
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Sitelink text</label>
                    <input
                      type="text" maxLength={25} placeholder="Sitelink text"
                      value={item.text}
                      onChange={(e) => setSitelinkItems(prev => prev.map((it, i) => i === sIdx ? { ...it, text: e.target.value } : it))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 block">Text is {item.text.length} characters out of 25</span>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Description line 1 (recommended)</label>
                    <input
                      type="text" maxLength={35} placeholder="Description line 1"
                      value={item.desc1}
                      onChange={(e) => setSitelinkItems(prev => prev.map((it, i) => i === sIdx ? { ...it, desc1: e.target.value } : it))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 block">Text is {item.desc1.length} characters out of 35</span>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Description line 2 (recommended)</label>
                    <input
                      type="text" maxLength={35} placeholder="Description line 2"
                      value={item.desc2}
                      onChange={(e) => setSitelinkItems(prev => prev.map((it, i) => i === sIdx ? { ...it, desc2: e.target.value } : it))}
                      className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 \${item.desc1 && item.desc2 && item.desc1.trim() === item.desc2.trim() ? "border-rose-400" : "border-slate-200"}\`}
                    />
                    <span className="text-[10px] text-slate-500 block">Text is {item.desc2.length} characters out of 35</span>
                    {item.desc1 && item.desc2 && item.desc1.trim() === item.desc2.trim() && (
                      <p className="text-[11px] text-rose-500 font-semibold">Description Line 1 and Line 2 must be different.</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Final URL</label>
                    <input
                      type="text" placeholder="https://www.example.com/sitelink"
                      value={item.url}
                      onChange={(e) => {
                        setSitelinkItems(prev => prev.map((it, i) => i === sIdx ? { ...it, url: e.target.value } : it));
                        setSitelinkUrlError(null);
                      }}
                      className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono \${sitelinkUrlError && sIdx === 0 ? "border-rose-400" : "border-slate-200"}\`}
                    />
                    {sitelinkUrlError && sIdx === 0 && (
                      <p className="text-[11px] text-rose-500 font-semibold">{sitelinkUrlError}</p>
                    )}
                  </div>
                  {sIdx > 0 && (
                    <button type="button" onClick={() => setSitelinkItems(prev => prev.filter((_, i) => i !== sIdx))} className="text-rose-400 text-[11px] font-semibold hover:underline">Remove sitelink</button>
                  )}
                </div>
              ))}
              {sitelinkDupeError && (
                <p className="text-[11px] text-rose-500 font-semibold">{sitelinkDupeError}</p>
              )}`;

    content = content.replace(oldSitelinkModal, newSitelinkModal);
    changed = true;
  }

  // Fix "+ Sitelink 2" button
  if (content.includes('<button type="button" className="text-primary font-bold text-xs hover:underline">+ Sitelink 2</button>')) {
    content = content.replace(
      '<button type="button" className="text-primary font-bold text-xs hover:underline">+ Sitelink 2</button>',
      `<button type="button" onClick={() => setSitelinkItems(prev => prev.length < 4 ? [...prev, { text: "", desc1: "", desc2: "", url: "" }] : prev)} className="text-primary font-bold text-xs hover:underline cursor-pointer">+ Add another sitelink</button>`
    );
    changed = true;
  }

  // Fix Save Sitelinks button to use state
  if (content.includes('const txt = (document.getElementById("sitelinkTextInp")')) {
    content = content.replace(
      `onClick={() => {
                  const txt = (document.getElementById("sitelinkTextInp") as HTMLInputElement)?.value || "Sitelink 1";
                  const d1 = (document.getElementById("sitelinkDesc1Inp") as HTMLInputElement)?.value || "";
                  const d2 = (document.getElementById("sitelinkDesc2Inp") as HTMLInputElement)?.value || "";
                  let url = (document.getElementById("sitelinkUrlInp") as HTMLInputElement)?.value?.trim() || "";
                  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
                    url = \`https://\${url}\`;
                  }
                  if (!url) {
                    url = finalUrl || "https://www.example.com";
                  }
                  setSavedSitelinks(prev => [...prev, { text: txt, desc1: d1, desc2: d2, url }]);
                  setActiveModal(null);
                }}`,
      `onClick={() => {
                  setSitelinkDupeError(null);
                  setSitelinkUrlError(null);
                  const validItems = sitelinkItems.filter(it => it.text.trim());
                  if (validItems.length === 0) {
                    setSitelinkDupeError("Please enter at least one sitelink text.");
                    return;
                  }
                  // URL validation
                  for (let i = 0; i < sitelinkItems.length; i++) {
                    const it = sitelinkItems[i];
                    if (!it.text.trim()) continue;
                    const url = it.url.trim();
                    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
                      setSitelinkUrlError("Final URL must start with http:// or https://");
                      return;
                    }
                    // Desc1 !== Desc2
                    if (it.desc1.trim() && it.desc2.trim() && it.desc1.trim() === it.desc2.trim()) {
                      setSitelinkDupeError(\`Sitelink \${i+1}: Description Line 1 and Line 2 must be different.\`);
                      return;
                    }
                  }
                  // Duplicate text check
                  const existingTexts = savedSitelinks.map(s => s.text.trim().toLowerCase());
                  for (const it of validItems) {
                    if (existingTexts.includes(it.text.trim().toLowerCase())) {
                      setSitelinkDupeError(\`Duplicate sitelink: "\${it.text.trim()}" already exists.\`);
                      return;
                    }
                  }
                  const toAdd = validItems.map(it => ({
                    text: it.text.trim(),
                    desc1: it.desc1,
                    desc2: it.desc2,
                    url: it.url.trim() || finalUrl || "https://www.example.com"
                  }));
                  setSavedSitelinks(prev => [...prev, ...toAdd]);
                  setSitelinkItems([{ text: "", desc1: "", desc2: "", url: "" }]);
                  setSitelinkDupeError(null);
                  setActiveModal(null);
                }}`
    );
    changed = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. PROMOTIONS: Add inline validation for Final URL + dates
  // ─────────────────────────────────────────────────────────────────────────

  // Add inline error below promoFinalUrl input
  if (content.includes('placeholder="https://www.example.com/promo"') && !content.includes('promoFinalUrlError &&')) {
    content = content.replace(
      `                    placeholder="https://www.example.com/promo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>`,
      `                    placeholder="https://www.example.com/promo"
                    onChange={(e) => { setPromoFinalUrl(e.target.value); setPromoFinalUrlError(null); }}
                    className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono text-slate-900 \${promoFinalUrlError ? "border-rose-400" : "border-slate-200"}\`}
                  />
                  {promoFinalUrlError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{promoFinalUrlError}</p>}
                </div>
              </div>`
    );
    changed = true;
  }

  // Add min to promoStartDate and inline errors
  if (content.includes('value={promoStartDate}') && !content.includes('promoStartDateError &&')) {
    content = content.replace(
      `                     <input
                       type="date"
                       value={promoStartDate}
                       onChange={(e) => setPromoStartDate(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                     />`,
      `                     <input
                       type="date"
                       min={todayIsoStr}
                       value={promoStartDate}
                       onChange={(e) => {
                         setPromoStartDate(e.target.value);
                         setPromoStartDateError(null);
                         if (promoEndDate && e.target.value && promoEndDate <= e.target.value) {
                           const d = new Date(e.target.value);
                           d.setDate(d.getDate() + 1);
                           setPromoEndDate(d.toISOString().split("T")[0]);
                           setPromoEndDateError(null);
                         }
                       }}
                       className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 \${promoStartDateError ? "border-rose-400" : "border-slate-200"}\`}
                     />
                     {promoStartDateError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{promoStartDateError}</p>}`
    );
    changed = true;
  }

  // Add min to promoEndDate and inline errors
  if (content.includes('value={promoEndDate}') && !content.includes('promoEndDateError &&')) {
    content = content.replace(
      `                     <input
                       type="date"
                       value={promoEndDate}
                       onChange={(e) => setPromoEndDate(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                     />`,
      `                     <input
                       type="date"
                       min={promoStartDate ? (() => { const d = new Date(promoStartDate); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })() : todayIsoStr}
                       value={promoEndDate}
                       onChange={(e) => { setPromoEndDate(e.target.value); setPromoEndDateError(null); }}
                       className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 \${promoEndDateError ? "border-rose-400" : "border-slate-200"}\`}
                     />
                     {promoEndDateError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{promoEndDateError}</p>}`
    );
    changed = true;
  }

  // Add inline error and validation to Save Promotion button
  if (content.includes("alert(\"Final URL must start with http:// or https://\")")) {
    content = content.replace(
      `                  let cleanPromoUrl = promoFinalUrl.trim();
                  if (cleanPromoUrl && !cleanPromoUrl.startsWith("http://") && !cleanPromoUrl.startsWith("https://")) {
                    alert("Final URL must start with http:// or https://");
                    return;
                  }`,
      `                  setPromoFinalUrlError(null);
                  setPromoStartDateError(null);
                  setPromoEndDateError(null);
                  let cleanPromoUrl = promoFinalUrl.trim();
                  if (cleanPromoUrl && !cleanPromoUrl.startsWith("http://") && !cleanPromoUrl.startsWith("https://")) {
                    setPromoFinalUrlError("Final URL must start with http:// or https://");
                    return;
                  }
                  if (promoStartDate && promoStartDate < todayIsoStr) {
                    setPromoStartDateError("Start Date cannot be in the past.");
                    return;
                  }
                  if (promoEndDate && promoStartDate && promoEndDate <= promoStartDate) {
                    setPromoEndDateError("End Date must be after Start Date.");
                    return;
                  }`
    );
    changed = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. PROMOTIONS Asset Scheduling: Duplicate Days & Hours validation
  // ─────────────────────────────────────────────────────────────────────────
  if (content.includes('setAssetSchedules(prev => [...prev, { id:') && content.includes('"Add schedule"') && !content.includes('assetSchedDupeError &&')) {
    // Add dupe error display before add schedule button
    content = content.replace(
      `                        <button
                          type="button"
                          onClick={() => setAssetSchedules(prev => [...prev, { id: \`as-\${Date.now()}\`, day: "All days", start: "12:00 AM", end: "12:00 AM" }])}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add schedule
                        </button>`,
      `                        {assetSchedDupeError && <p className="text-[11px] text-rose-500 font-semibold">{assetSchedDupeError}</p>}
                        <button
                          type="button"
                          onClick={() => {
                            const newSched = { id: \`as-\${Date.now()}\`, day: "All days", start: "12:00 AM", end: "12:00 AM" };
                            const isDupe = assetSchedules.some(s => s.day === newSched.day && s.start === newSched.start && s.end === newSched.end);
                            if (isDupe) { setAssetSchedDupeError("Duplicate schedule entry already exists."); return; }
                            setAssetSchedDupeError(null);
                            setAssetSchedules(prev => [...prev, newSched]);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add schedule
                        </button>`
    );
    changed = true;
  }

  // Also fix assetSchedules onChange to check for dupes
  if (content.includes('updated[idx].day = e.target.value;\n                                setAssetSchedules(updated)') && !content.includes('assetSchedDupeError') ) {
    // already handled above, skip
  }

  // Add inline errors for assetSched dates
  if (content.includes('min={todayIsoStr}\n                             value={assetSchedStartDate}') && !content.includes('assetSchedStartError &&')) {
    content = content.replace(
      `                             value={assetSchedStartDate}
                            onChange={(e) => {
                              setAssetSchedStartDate(e.target.value);
                              if (assetSchedEndDate && e.target.value && assetSchedEndDate <= e.target.value) {
                                const d = new Date(e.target.value);
                                d.setDate(d.getDate() + 1);
                                setAssetSchedEndDate(d.toISOString().split("T")[0]);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />`,
      `                             value={assetSchedStartDate}
                            onChange={(e) => {
                              setAssetSchedStartDate(e.target.value);
                              setAssetSchedStartError(null);
                              if (assetSchedEndDate && e.target.value && assetSchedEndDate <= e.target.value) {
                                const d = new Date(e.target.value);
                                d.setDate(d.getDate() + 1);
                                setAssetSchedEndDate(d.toISOString().split("T")[0]);
                                setAssetSchedEndError(null);
                              }
                              if (e.target.value && e.target.value < todayIsoStr) {
                                setAssetSchedStartError("Start Date cannot be in the past.");
                              }
                            }}
                            className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 \${assetSchedStartError ? "border-rose-400" : "border-slate-200"}\`}
                          />
                          {assetSchedStartError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{assetSchedStartError}</p>}`
    );
    changed = true;
  }

  if (content.includes('min={assetSchedStartDate ? (() => { const d = new Date(assetSchedStartDate)') && !content.includes('assetSchedEndError &&')) {
    content = content.replace(
      `                            value={assetSchedEndDate}
                            onChange={(e) => setAssetSchedEndDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />`,
      `                            value={assetSchedEndDate}
                            onChange={(e) => {
                              setAssetSchedEndDate(e.target.value);
                              setAssetSchedEndError(null);
                              if (assetSchedStartDate && e.target.value && e.target.value <= assetSchedStartDate) {
                                setAssetSchedEndError("End Date must be after Start Date.");
                              }
                            }}
                            className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 \${assetSchedEndError ? "border-rose-400" : "border-slate-200"}\`}
                          />
                          {assetSchedEndError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{assetSchedEndError}</p>}`
    );
    changed = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. CALLOUTS: Dates validation + duplicate day/hours + duplicate callout text
  // ─────────────────────────────────────────────────────────────────────────

  // Callout Start Date with min + inline error
  if (content.includes('value={calloutStartDateValue}\n                        onChange={(e) => setCalloutStartDateValue(e.target.value)}') && !content.includes('calloutStartError &&')) {
    content = content.replace(
      `                      <input
                        type="date"
                        value={calloutStartDateValue}
                        onChange={(e) => setCalloutStartDateValue(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-900"
                      />`,
      `                      <div>
                        <input
                          type="date"
                          min={todayIsoStr}
                          value={calloutStartDateValue}
                          onChange={(e) => {
                            setCalloutStartDateValue(e.target.value);
                            setCalloutStartError(null);
                            if (calloutEndDateValue && e.target.value && calloutEndDateValue <= e.target.value) {
                              const d = new Date(e.target.value);
                              d.setDate(d.getDate() + 1);
                              setCalloutEndDateValue(d.toISOString().split("T")[0]);
                              setCalloutEndError(null);
                            }
                            if (e.target.value && e.target.value < todayIsoStr) {
                              setCalloutStartError("Start Date cannot be in the past.");
                            }
                          }}
                          className={\`bg-slate-50 border rounded-xl px-3 py-1 text-xs text-slate-900 \${calloutStartError ? "border-rose-400" : "border-slate-200"}\`}
                        />
                        {calloutStartError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{calloutStartError}</p>}
                      </div>`
    );
    changed = true;
  }

  // Callout End Date with min + inline error
  if (content.includes('value={calloutEndDateValue}\n                        onChange={(e) => setCalloutEndDateValue(e.target.value)}') && !content.includes('calloutEndError &&')) {
    content = content.replace(
      `                      <input
                        type="date"
                        value={calloutEndDateValue}
                        onChange={(e) => setCalloutEndDateValue(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-900"
                      />`,
      `                      <div>
                        <input
                          type="date"
                          min={calloutStartDateValue ? (() => { const d = new Date(calloutStartDateValue); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })() : todayIsoStr}
                          value={calloutEndDateValue}
                          onChange={(e) => {
                            setCalloutEndDateValue(e.target.value);
                            setCalloutEndError(null);
                            if (calloutStartDateValue && e.target.value && e.target.value <= calloutStartDateValue) {
                              setCalloutEndError("End Date must be after Start Date.");
                            }
                          }}
                          className={\`bg-slate-50 border rounded-xl px-3 py-1 text-xs text-slate-900 \${calloutEndError ? "border-rose-400" : "border-slate-200"}\`}
                        />
                        {calloutEndError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{calloutEndError}</p>}
                      </div>`
    );
    changed = true;
  }

  // Callout duplicate schedule error display + add schedule button  
  if (content.includes('+ Add schedule multiply') && !content.includes('calloutSchedDupeError &&')) {
    content = content.replace(
      `              <button
                type="button"
                onClick={() => {
                  setCalloutSchedules(prev => [...prev, { id: \`cos-\${Date.now()}-\${Math.random()}\`, day: "All days", start: "00:00", end: "23:45" }]);
                }}
                className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline cursor-pointer"
              >
                + Add schedule multiply
              </button>`,
      `              <button
                type="button"
                onClick={() => {
                  setCalloutSchedDupeError(null);
                  const newEntry = { day: "All days", start: "00:00", end: "23:45" };
                  const isDupe = calloutSchedules.some(s => s.day === newEntry.day && s.start === newEntry.start && s.end === newEntry.end);
                  if (isDupe) { setCalloutSchedDupeError("Duplicate schedule entry. Please change day or hours before adding."); return; }
                  setCalloutSchedules(prev => [...prev, { id: \`cos-\${Date.now()}-\${Math.random()}\`, ...newEntry }]);
                }}
                className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline cursor-pointer"
              >
                + Add schedule
              </button>
              {calloutSchedDupeError && <p className="text-[11px] text-rose-500 font-semibold mt-1">{calloutSchedDupeError}</p>}`
    );
    changed = true;
  }

  // Add duplicate callout text check in Save Callouts
  if (content.includes('let finalCallouts = [...modalCalloutTexts];') && !content.includes('calloutDupeError')) {
    content = content.replace(
      `                  let finalCallouts = [...modalCalloutTexts];
                  if (newCalloutInput.trim()) {
                    finalCallouts.push(newCalloutInput.trim());
                  }
                  
                  if (finalCallouts.length > 0) {
                    setSavedCallouts(prev => [...prev, ...finalCallouts]);
                  }`,
      `                  setCalloutDupeError(null);
                  let finalCallouts = [...modalCalloutTexts];
                  if (newCalloutInput.trim()) {
                    finalCallouts.push(newCalloutInput.trim());
                  }
                  // Duplicate callout text check
                  const existingCallouts = savedCallouts.map(c => c.trim().toLowerCase());
                  const dupesFound = finalCallouts.filter(c => existingCallouts.includes(c.trim().toLowerCase()));
                  if (dupesFound.length > 0) {
                    setCalloutDupeError(\`Duplicate callout text: "\${dupesFound[0]}" already exists.\`);
                    return;
                  }
                  // Check duplicates within the batch
                  const unique = new Set(finalCallouts.map(c => c.trim().toLowerCase()));
                  if (unique.size < finalCallouts.length) {
                    setCalloutDupeError("Duplicate callout text detected within the current batch.");
                    return;
                  }
                  if (finalCallouts.length > 0) {
                    setSavedCallouts(prev => [...prev, ...finalCallouts]);
                  }`
    );
    changed = true;
  }

  // Show calloutDupeError near Save Callouts button
  if (content.includes('Save Callouts') && !content.includes('calloutDupeError &&')) {
    content = content.replace(
      `              <button
                type="button"
                onClick={() => {
                  setCalloutDupeError(null);`,
      `              {calloutDupeError && <p className="text-[11px] text-rose-500 font-semibold">{calloutDupeError}</p>}
              <button
                type="button"
                onClick={() => {
                  setCalloutDupeError(null);`
    );
    changed = true;
  }

  // Also add duplicate check in the "Add" button for callout (within modal)
  if (content.includes('if (newCalloutInput.trim()) {\n                        setModalCalloutTexts(prev => [...prev, newCalloutInput.trim()]);') && !content.includes('modalCalloutTexts.includes(newCalloutInput.trim())')) {
    content = content.replace(
      `                    onClick={() => {
                      if (newCalloutInput.trim()) {
                        setModalCalloutTexts(prev => [...prev, newCalloutInput.trim()]);
                        setNewCalloutInput("");
                      }
                    }}`,
      `                    onClick={() => {
                      const trimmed = newCalloutInput.trim();
                      if (!trimmed) return;
                      const existingCallouts = savedCallouts.map(c => c.trim().toLowerCase());
                      if (existingCallouts.includes(trimmed.toLowerCase()) || modalCalloutTexts.map(c=>c.toLowerCase()).includes(trimmed.toLowerCase())) {
                        setCalloutDupeError(\`Callout "\${trimmed}" already exists.\`);
                        return;
                      }
                      setCalloutDupeError(null);
                      setModalCalloutTexts(prev => [...prev, trimmed]);
                      setNewCalloutInput("");
                    }}`
    );
    changed = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. CAMPAIGN DATES: startDateError + endDateError inline
  // ─────────────────────────────────────────────────────────────────────────
  if (content.includes('<span className="text-[10px] text-slate-500">Must be today or a future date</span>') && !content.includes('startDateError &&')) {
    content = content.replace(
      `                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                           />
                           <span className="text-[10px] text-slate-500">Must be today or a future date</span>`,
      `                           className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary \${startDateError ? "border-rose-400" : "border-slate-200"}\`}
                           />
                           {startDateError ? (
                             <p className="text-[11px] text-rose-500 font-semibold">{startDateError}</p>
                           ) : (
                             <span className="text-[10px] text-slate-500">Must be today or a future date</span>
                           )}`
    );
    changed = true;
  }

  // Add setStartDateError to startDate onChange
  if (content.includes('setStartDate(newStart);') && !content.includes('setStartDateError')) {
    content = content.replace(
      `                              const newStart = e.target.value;
                              setStartDate(newStart);
                              if (newStart && endDate) {`,
      `                              const newStart = e.target.value;
                              setStartDate(newStart);
                              if (newStart && newStart < todayDateString) {
                                setStartDateError("Start date cannot be in the past.");
                              } else {
                                setStartDateError(null);
                              }
                              if (newStart && endDate) {`
    );
    changed = true;
  }

  // Add setEndDateError to endDate onChange
  if (content.includes('onChange={(e) => setEndDate(e.target.value)}') && !content.includes('setEndDateError')) {
    content = content.replace(
      `                               onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"`,
      `                               onChange={(e) => {
                                  setEndDate(e.target.value);
                                  if (startDate && e.target.value && e.target.value <= startDate) {
                                    setEndDateError("End date must be after start date.");
                                  } else {
                                    setEndDateError(null);
                                  }
                                }}
                                className={\`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary \${endDateError ? "border-rose-400" : "border-slate-200"}\`}`
    );
    changed = true;
  }

  // Add endDateError display after endDate input
  if (content.includes('<span className="text-[10px] text-slate-500">Must be after the start date</span>') && !content.includes('endDateError &&')) {
    content = content.replace(
      `                               <span className="text-[10px] text-slate-500">Must be after the start date</span>`,
      `                               {endDateError ? (
                                 <p className="text-[11px] text-rose-500 font-semibold">{endDateError}</p>
                               ) : (
                                 <span className="text-[10px] text-slate-500">Must be after the start date</span>
                               )}`
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated: ${relPath}`);
  } else {
    console.log(`No changes needed: ${relPath}`);
  }
});
