const fs = require('fs');

const file = 'frontend/src/app/ads/campaigns/create/sales/demand-gen/page.tsx';
let c = fs.readFileSync(file, 'utf8');

// The end of the file is currently corrupted. Let's find the EXCLUSIONS BROWSE SUB-MODAL string
// and replace from there to the end of the file with the correct footer.
const startIdx = c.lastIndexOf('{/* 6. EXCLUSIONS BROWSE SUB-MODAL */}');

if (startIdx === -1) {
    console.error("Could not find EXCLUSIONS BROWSE SUB-MODAL");
    process.exit(1);
}

const correctEnd = `{/* 6. EXCLUSIONS BROWSE SUB-MODAL */}
              {activeAudienceSubTab === "EXCLUSIONS_BROWSE" && (
                <div className="fixed inset-0 z-[130] bg-slate-50/95 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <h3 className="font-bold text-slate-800 text-sm">Browse Exclusions</h3>
                      <button onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setActiveAudienceSubTab("NONE")}
                        className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => router.push(\`/ads/campaigns/create\${customerId ? \`?customerId=\${customerId}\` : ""}\`)}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {demandGenStep === "AD_GROUP" && (
            <button
              onClick={() => setDemandGenStep("AD")}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Continue to Ad
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {demandGenStep === "AD" && (
            <button
              onClick={() => setDemandGenStep("REVIEW")}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Review Campaign
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {demandGenStep === "REVIEW" && (
            <button
              onClick={() => {
                alert(\`Sales Demand Gen campaign "\${demandGenCampaignName}" published successfully!\`);
                router.push(\`/ads\${customerId ? \`?customerId=\${customerId}\` : ""}\`);
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
            >
              Save & Publish
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
`;

c = c.substring(0, startIdx) + correctEnd;
fs.writeFileSync(file, c, 'utf8');
console.log("Fixed end of file.");
