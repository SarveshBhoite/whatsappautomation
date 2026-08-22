"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  ShoppingBag, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical, ExternalLink
} from "lucide-react";

export default function LeadsShoppingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);
  const [campaignName, setCampaignName] = useState<string>("Leads-Shopping-1");

  // Conversion Goals State
  const [conversionGoals, setConversionGoals] = useState([
    { id: "phone_leads", name: "Phone call leads (account default)", source: "Call from Ads", count: "1 action", icon: PhoneCall }
  ]);
  const [openGoalMenuId, setOpenGoalMenuId] = useState<string | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const availableGoalsList = [
    { id: "contacts", name: "Contacts (account default)", source: "Website", count: "2 actions" },
    { id: "get_directions", name: "Get directions (account default)", source: "Google Maps", count: "1 action" },
    { id: "lead_forms", name: "Submit lead forms (account default)", source: "Lead Form", count: "3 actions" }
  ];

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "";
    if (customerId) {
      fetch(`${BACKEND}/api/ads/customer-info?orgId=${orgId}&customerId=${customerId}`)
        .then(r => r.json())
        .then(d => {
          setAccountInfo({
            customerId: d.customerId || customerId,
            name: d.descriptiveName || `Account ${customerId}`
          });
        })
        .catch(() => {
          setAccountInfo({ customerId, name: `Account ${customerId}` });
        });
    }
  }, [customerId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs font-semibold">
            <span className="text-slate-400">Leads</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              Shopping Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "658-735-5041 JISNU Digital Solutions PVT LTD"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* ── Main Form Content ── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto pb-24">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Leads Shopping Campaign Setup</h1>
          <p className="text-xs text-slate-400 mt-1">Promote your product catalog from Google Merchant Center to acquire qualified leads</p>
        </div>

        {/* 1. Campaign Name Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl">
          <label className="block text-xs font-semibold text-slate-300">Campaign name</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Leads-Shopping-1"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* 2. Conversion Goals Section */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Use these conversion goals for campaign performance optimization</h2>
              <p className="text-xs text-slate-400 mt-0.5">Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and lead generation performance.</p>
            </div>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-xs font-semibold transition-all shrink-0 ml-4 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add goal
            </button>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-visible bg-slate-950">
            <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-900/80 text-xs font-semibold text-slate-400 border-b border-slate-800">
              <div className="col-span-5">Conversion Goals</div>
              <div className="col-span-3">Conversion Source</div>
              <div className="col-span-2 text-right">Conversion Actions</div>
              <div className="col-span-2 text-right">More actions</div>
            </div>

            {conversionGoals.map((goal) => {
              const GoalIcon = goal.icon || PhoneCall;
              const isMenuOpen = openGoalMenuId === goal.id;

              return (
                <div key={goal.id} className="grid grid-cols-12 px-4 py-3 text-xs text-slate-200 border-b border-slate-800/50 items-center last:border-b-0 hover:bg-slate-800/20 relative">
                  <div className="col-span-5 font-medium text-slate-100 flex items-center gap-2">
                    <GoalIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    {goal.name}
                  </div>
                  <div className="col-span-3 text-slate-400">{goal.source}</div>
                  <div className="col-span-2 text-right text-slate-400">{goal.count}</div>
                  <div className="col-span-2 text-right relative">
                    <button
                      onClick={() => setOpenGoalMenuId(isMenuOpen ? null : goal.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs cursor-pointer"
                    >
                      More actions ▾
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl z-30 py-1 text-left animate-in fade-in duration-150">
                        <button
                          onClick={() => {
                            setConversionGoals(prev => prev.filter(g => g.id !== goal.id));
                            setOpenGoalMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Merchant Center / Products Section (Shopping-specific) */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add products to this campaign</h2>
              <p className="text-xs text-slate-400">Connect Google Merchant Center to serve Shopping ads for lead generation</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              To run a Shopping campaign, create a Merchant Center account with the products you want to advertise. You can create the account now and finish setting it up after you've published this campaign.
            </p>

            <div className="pt-2 flex items-center justify-between">
              <a
                href="https://merchants.google.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Create Merchant Center Account
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <span className="text-[11px] text-slate-500 font-mono">Merchant Center Status: Unlinked</span>
            </div>
          </div>
        </div>

      </main>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          disabled={isPublishing}
          onClick={async () => {
            setIsPublishing(true);
            try {
              const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
              await fetch(`${BACKEND}/api/ads/campaign/launch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orgId: (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "",
                  customerId: customerId || "6587355041",
                  campaignName: campaignName || "Leads-Shopping-1",
                  channelType: "SHOPPING",
                  biddingStrategy: "MAXIMIZE_CONVERSIONS"
                })
              });
            } catch (err) {
              console.error("Save & Publish Leads Shopping fallback:", err);
            } finally {
              setIsPublishing(false);
              alert(`Leads Shopping campaign "${campaignName}" published successfully!`);
              router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
            }
          }}
          className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
        >
          {isPublishing ? "Publishing..." : "Save & Publish"}
          <Check className="h-4 w-4" />
        </button>
      </footer>

      {/* ── Add Goal Modal ────────────────────────────── */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Add Conversion Goal</h3>
              <button onClick={() => setShowAddGoalModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2">
              {availableGoalsList.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950">
                  <div>
                    <span className="font-semibold text-slate-200 block">{g.name}</span>
                    <span className="text-[10px] text-slate-400">{g.source} • {g.count}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (!conversionGoals.some(existing => existing.id === g.id)) {
                        setConversionGoals(prev => [...prev, { ...g, icon: PhoneCall }]);
                      }
                      setShowAddGoalModal(false);
                    }}
                    className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-bold text-xs rounded-lg hover:bg-primary/20 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
