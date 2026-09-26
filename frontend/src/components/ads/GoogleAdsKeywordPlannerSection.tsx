"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Search,
  Globe,
  MapPin,
  ArrowUpDown,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  X,
  TrendingUp,
  Tag,
  BarChart2,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface MonthlyVolume {
  month: string;
  year: string;
  monthlySearches: number;
}

interface KeywordIdea {
  text: string;
  avgMonthlySearches: number;
  competition: "UNSPECIFIED" | "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
  competitionIndex: number;
  lowTopOfPageBid: number;
  highTopOfPageBid: number;
  monthlySearchVolumes: MonthlyVolume[];
}

interface TargetingOption {
  id: string;
  name: string;
  constant: string;
}

interface GoogleAdsKeywordPlannerSectionProps {
  customerId: string;
  orgId: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function GoogleAdsKeywordPlannerSection({
  customerId,
  orgId
}: GoogleAdsKeywordPlannerSectionProps) {
  // Config state
  const [languages, setLanguages] = useState<TargetingOption[]>([]);
  const [geoTargets, setGeoTargets] = useState<TargetingOption[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("languageConstants/1000"); // English
  const [selectedGeoTarget, setSelectedGeoTarget] = useState<string>("geoTargetConstants/2356"); // India

  // Input states
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [seedKeywords, setSeedKeywords] = useState<string[]>(["crm software", "whatsapp marketing"]);
  const [seedUrl, setSeedUrl] = useState<string>("");
  const [includeAdult, setIncludeAdult] = useState<boolean>(false);

  // Results & status states
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<KeywordIdea[]>([]);
  const [currencyCode, setCurrencyCode] = useState<string>("INR");
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [competitionFilter, setCompetitionFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"avgMonthlySearches" | "competitionIndex" | "lowTopOfPageBid" | "highTopOfPageBid" | "text">("avgMonthlySearches");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`${BACKEND}/api/ads/planner/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.config?.languages) setLanguages(data.config.languages);
          if (data.config?.geoTargets) setGeoTargets(data.config.geoTargets);
        }
      } catch (err: any) {
        console.warn("Could not load planner config:", err.message);
      }
    }
    loadConfig();
  }, []);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    const parts = trimmed.split(",").map(k => k.trim()).filter(Boolean);
    const newSet = Array.from(new Set([...seedKeywords, ...parts]));
    setSeedKeywords(newSet.slice(0, 20));
    setKeywordInput("");
  };

  const handleRemoveKeyword = (index: number) => {
    setSeedKeywords(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const fetchKeywordIdeas = useCallback(async () => {
    if (!customerId) {
      setError("Please select a valid Google Ads account.");
      return;
    }

    if (seedKeywords.length === 0 && !seedUrl.trim()) {
      setError("Please provide at least one seed keyword or a website URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND}/api/ads/planner/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId,
          keywords: seedKeywords,
          url: seedUrl.trim() || undefined,
          languageConstant: selectedLanguage,
          geoTargetConstants: [selectedGeoTarget],
          includeAdultKeywords: includeAdult
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate keyword ideas");
      }

      setResults(data.results || []);
      if (data.currencyCode) setCurrencyCode(data.currencyCode);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching keyword ideas");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, orgId, seedKeywords, seedUrl, selectedLanguage, selectedGeoTarget, includeAdult]);

  // Sorting and filtering
  const filteredResults = results
    .filter(item => {
      const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesComp = competitionFilter === "ALL" || item.competition === competitionFilter;
      return matchesSearch && matchesComp;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for metrics
    }
  };

  const getCompetitionBadge = (comp: string) => {
    switch (comp) {
      case "LOW":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Low</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">High</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Unknown</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currencyCode} ${amount.toFixed(2)}`;
  };

  const exportCsv = () => {
    if (filteredResults.length === 0) return;
    const headers = [
      "Keyword",
      "Avg Monthly Searches",
      "Competition",
      "Competition Index",
      `Top of Page Bid Low (${currencyCode})`,
      `Top of Page Bid High (${currencyCode})`
    ];

    const rows = filteredResults.map(r => [
      `"${r.text.replace(/"/g, '""')}"`,
      r.avgMonthlySearches,
      r.competition,
      r.competitionIndex,
      r.lowTopOfPageBid,
      r.highTopOfPageBid
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `google_ads_keyword_ideas_${customerId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Generator Header Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-none">
                  Google Ads Keyword Planner
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Generate high-intent keyword ideas, monthly search volumes, and bid ranges directly from Google Ads API v24.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Account: {customerId || "None"}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Currency: {currencyCode}
            </span>
          </div>
        </div>

        {/* ── Query Builder Form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Seed Keywords Column */}
          <div className="lg:col-span-6 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Seed Keywords <span className="text-slate-400 font-normal">(Press Enter or Comma to add, max 20)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type keyword and press Enter (e.g. crm software)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-16"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim()}
                className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 disabled:opacity-40 transition-all cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Seed Keywords Pills */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
              {seedKeywords.length === 0 ? (
                <span className="text-slate-400 text-xs italic self-center">No seed keywords added yet.</span>
              ) : (
                seedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs group"
                  >
                    <Tag className="h-3 w-3 text-blue-500" />
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(i)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove keyword"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Seed URL Column */}
          <div className="lg:col-span-6 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Optional Seed URL <span className="text-slate-400 font-normal">(Extract keyword ideas from a landing page)</span>
            </label>
            <div className="relative">
              <Globe className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={seedUrl}
                onChange={e => setSeedUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Targeting Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-slate-400" /> Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {languages.length > 0 ? (
                    languages.map(l => (
                      <option key={l.constant} value={l.constant}>
                        {l.name}
                      </option>
                    ))
                  ) : (
                    <option value="languageConstants/1000">English</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> Location Target
                </label>
                <select
                  value={selectedGeoTarget}
                  onChange={e => setSelectedGeoTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {geoTargets.length > 0 ? (
                    geoTargets.map(g => (
                      <option key={g.constant} value={g.constant}>
                        {g.name}
                      </option>
                    ))
                  ) : (
                    <option value="geoTargetConstants/2356">India (Country)</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium select-none">
              <input
                type="checkbox"
                checked={includeAdult}
                onChange={e => setIncludeAdult(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              Include Adult Keywords
            </label>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">
              Returns real-time competitive density and monthly search volumes directly from Google.
            </span>
          </div>

          <button
            onClick={fetchKeywordIdeas}
            disabled={loading || (seedKeywords.length === 0 && !seedUrl.trim())}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Google Search Trends...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Keyword Ideas
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Error Generating Keyword Ideas</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ── Results Container ── */}
      {results.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-0">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Found {filteredResults.length} Keyword Ideas
              </span>
              <span className="text-xs text-slate-400 font-normal">
                (from {results.length} total generated)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter by keyword text */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Filter ideas..."
                  className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                />
              </div>

              {/* Competition Selector */}
              <select
                value={competitionFilter}
                onChange={e => setCompetitionFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Competition</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              {/* CSV Export */}
              <button
                onClick={exportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
                title="Export results as CSV"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th
                    onClick={() => toggleSort("text")}
                    className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Keyword Idea
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("avgMonthlySearches")}
                    className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Avg. Monthly Searches
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center">Competition</th>
                  <th
                    onClick={() => toggleSort("competitionIndex")}
                    className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Comp. Index (0-100)
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("lowTopOfPageBid")}
                    className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Top of Page Bid (Low)
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("highTopOfPageBid")}
                    className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Top of Page Bid (High)
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center">Trend History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No keyword ideas match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((item, idx) => {
                    const isExpanded = expandedKeyword === item.text;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                            <span>{item.text}</span>
                          </div>
                        </td>

                        <td className="p-3.5 text-right font-mono font-semibold text-slate-900">
                          {item.avgMonthlySearches > 0
                            ? item.avgMonthlySearches.toLocaleString()
                            : "—"}
                        </td>

                        <td className="p-3.5 text-center">
                          {getCompetitionBadge(item.competition)}
                        </td>

                        <td className="p-3.5 text-right font-mono font-medium text-slate-600">
                          {item.competitionIndex > 0 ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.competitionIndex > 66
                                      ? "bg-rose-500"
                                      : item.competitionIndex > 33
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${item.competitionIndex}%` }}
                                />
                              </div>
                              <span>{item.competitionIndex}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="p-3.5 text-right font-mono text-slate-700">
                          {item.lowTopOfPageBid > 0
                            ? formatCurrency(item.lowTopOfPageBid)
                            : "—"}
                        </td>

                        <td className="p-3.5 text-right font-mono text-slate-700">
                          {item.highTopOfPageBid > 0
                            ? formatCurrency(item.highTopOfPageBid)
                            : "—"}
                        </td>

                        <td className="p-3.5 text-center">
                          {item.monthlySearchVolumes.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setExpandedKeyword(isExpanded ? null : item.text)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <TrendingUp className="h-3 w-3" />
                              {item.monthlySearchVolumes.length} Mo.
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Expanded Keyword Trend Detail Modal / Drawer */}
          {expandedKeyword && (
            <div className="p-5 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Monthly Search Trend History for &quot;{expandedKeyword}&quot;
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedKeyword(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  Close Trend
                </button>
              </div>

              {(() => {
                const target = results.find(r => r.text === expandedKeyword);
                if (!target || target.monthlySearchVolumes.length === 0) {
                  return <p className="text-xs text-slate-400">No monthly breakdown available.</p>;
                }
                const maxVol = Math.max(...target.monthlySearchVolumes.map(v => v.monthlySearches), 1);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
                    {target.monthlySearchVolumes.map((vol, vIdx) => {
                      const pct = Math.max(8, Math.round((vol.monthlySearches / maxVol) * 100));
                      return (
                        <div
                          key={vIdx}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center gap-1.5 shadow-2xs"
                        >
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {vol.month.slice(0, 3)} {vol.year.slice(2)}
                          </span>
                          <div className="w-full h-12 flex items-end justify-center py-0.5">
                            <div
                              className="w-4 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                              style={{ height: `${pct}%` }}
                              title={`${vol.monthlySearches.toLocaleString()} searches`}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 font-mono">
                            {vol.monthlySearches >= 1000
                              ? `${(vol.monthlySearches / 1000).toFixed(1)}k`
                              : vol.monthlySearches}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── Empty State before search ── */}
      {!loading && results.length === 0 && !error && (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Ready to Discover High-Value Keywords</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add seed keywords or your website URL above and click <strong>&quot;Generate Keyword Ideas&quot;</strong> to uncover real-time search volume estimates, CPC bid thresholds, and competitor density from Google.
          </p>
        </div>
      )}
    </div>
  );
}
