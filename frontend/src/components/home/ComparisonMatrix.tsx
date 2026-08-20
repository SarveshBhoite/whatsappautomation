"use client";

import React from "react";
import { CheckCircle2, XCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ComparisonMatrix() {
  const comparisonItems = [
    {
      feature: "Lead Response Latency",
      traditional: "2 to 6 hours (leads go cold)",
      jisnu: "Sub-5 seconds via WhatsApp Flow",
      isHighlight: true,
    },
    {
      feature: "WhatsApp Account Safety",
      traditional: "High ban risk with web scrapers",
      jisnu: "0% Ban Risk (Official Meta API)",
      isHighlight: false,
    },
    {
      feature: "Ad Lead Capture",
      traditional: "Manual daily CSV exports",
      jisnu: "Real-time webhook sync (<200ms)",
      isHighlight: true,
    },
    {
      feature: "Google Review Management",
      traditional: "Checking multiple location tabs",
      jisnu: "Unified Inbox with 1-Click AI",
      isHighlight: false,
    },
    {
      feature: "Team Chat Collaboration",
      traditional: "Passing 1 phone around office",
      jisnu: "Multi-seat cloud team inbox",
      isHighlight: false,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bento-card bento-glow-border p-4 sm:p-10 bg-white/95 overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-blue mb-1 block">
          The Automation Advantage
        </span>
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          How Jisnu CRM transforms your daily operations
        </h3>
      </div>

      {/* Responsive Scrollable Container */}
      <div className="overflow-x-auto no-scrollbar sm:scrollbar-thin w-full">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-slate-500 w-1/3 text-xs">Workflow Area</th>
              <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-slate-400 w-1/3 text-xs">Traditional Manual</th>
              <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-extrabold text-brand-blue-deep bg-sky-50/70 rounded-t-xl w-1/3 text-xs">
                ⚡ Jisnu CRM Cloud
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisonItems.map((item, idx) => (
              <tr
                key={idx}
                className={`transition-colors ${
                  item.isHighlight ? "bg-slate-50/40" : "hover:bg-slate-50/60"
                }`}
              >
                <td className="py-3 sm:py-4 px-3 sm:px-4 font-bold text-slate-800 text-xs sm:text-sm">{item.feature}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 text-slate-500 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-500 shrink-0" />
                    <span>{item.traditional}</span>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 font-semibold text-slate-900 bg-sky-50/40 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                    <span>{item.jisnu}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium text-center sm:text-left">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          Seamless onboarding. No credit card required to explore demo.
        </div>
        <Link
          href="/login"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-xs transition-all shadow-md shadow-brand-blue/20 flex items-center justify-center gap-2"
        >
          Upgrade Your Marketing Operations <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
