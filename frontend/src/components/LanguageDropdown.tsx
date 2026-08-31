"use client";

import React, { useState, useEffect } from "react";
import { SearchIcon, X } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface Language {
  id: string;
  code: string;
  name: string;
  targetable: boolean;
}

interface LanguageDropdownProps {
  selectedLanguages: string[];
  setSelectedLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  customerId?: string;
}

export function LanguageDropdown({ selectedLanguages, setSelectedLanguages, customerId }: LanguageDropdownProps) {
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchLanguages() {
      setIsLoading(true);
      try {
        const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
        const cid = customerId || "6587355041";
        const res = await fetch(`${BACKEND}/api/ads/languages?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableLanguages(data || []);
        }
      } catch (err) {
        console.error("Error fetching languages:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLanguages();
  }, [customerId]);

  const filteredLanguages = availableLanguages.filter(l => 
    l.name && l.name.toLowerCase().includes(languageSearchInput.trim().toLowerCase())
  );

  return (
    <div className="space-y-3 text-xs w-full">
      <div className="space-y-1 max-w-md">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={languageSearchInput}
            maxLength={50}
            onChange={(e) => setLanguageSearchInput(e.target.value)}
            placeholder="Start typing to search languages (e.g. English, Hindi)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
          />
          {languageSearchInput.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setLanguageSearchInput("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="text-[10px] text-slate-500 block text-right font-mono">{languageSearchInput.length} / 50</span>
      </div>

      {/* Languages Matching Results - Only displayed when user types search term */}
      {languageSearchInput.trim().length > 0 && (
        <div className="border border-slate-200 rounded-xl bg-slate-50 p-2 max-h-48 overflow-y-auto animate-in fade-in duration-150 max-w-md">
          {isLoading ? (
            <p className="text-slate-500 text-xs p-2 text-center">Loading languages...</p>
          ) : filteredLanguages.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredLanguages.map((lang, idx) => {
                const isSelected = selectedLanguages.includes(lang.name);
                return (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 p-1.5 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLanguages(prev => [...prev, lang.name]);
                        else setSelectedLanguages(prev => prev.filter(l => l !== lang.name));
                      }}
                      className="rounded text-primary h-3.5 w-3.5"
                    />
                    <span className="font-medium text-xs">{lang.name}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-xs p-2 text-center">No matching languages found for "{languageSearchInput}"</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {selectedLanguages.length === 0 ? (
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-slate-700 font-medium">
            All languages
          </span>
        ) : null}
        {selectedLanguages.map((lang, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
            <span>{lang}</span>
            <button 
              type="button"
              onClick={() => setSelectedLanguages(prev => prev.filter((_, i) => i !== idx))}
              title={`Remove ${lang}`}
              className="text-primary hover:text-primary/70 focus:outline-none flex items-center justify-center p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
