"use client";

import React, { useState } from "react";
import { Calculator, Sparkles, Clock, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RoiCalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState<number>(1200);

  // Calculations
  const hoursSavedPerWeek = Math.round((leadsPerMonth * 4.5) / 60);
  const conversionIncrease = Math.min(38, Math.round(18 + (leadsPerMonth / 800) * 2));
  const estimatedRevenueGain = (leadsPerMonth * 450).toLocaleString("en-IN");

  return (
    <div className="w-full max-w-5xl mx-auto bento-card bento-glow-border p-5 sm:p-10 bg-gradient-to-br from-white via-slate-50 to-sky-50/40 shadow-xl shadow-slate-200/50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left column: Controls */}
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue-deep text-xs font-bold w-fit">
            <Calculator className="h-3.5 w-3.5 text-brand-blue" />
            Interactive Impact Calculator
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            See how much time &amp; revenue your team unlocks
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By connecting automated WhatsApp follow-ups and AI instant responses, businesses convert high-intent inbound leads before competitors even reply.
          </p>

          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <label htmlFor="lead-slider-mobile" className="text-xs font-bold text-slate-700">
                Monthly Inbound Leads:
              </label>
              <span className="text-sm sm:text-base font-black text-brand-blue bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                {leadsPerMonth.toLocaleString()} leads / mo
              </span>
            </div>
            <input
              id="lead-slider-mobile"
              type="range"
              min="100"
              max="10000"
              step="100"
              value={leadsPerMonth}
              onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400 font-semibold">
              <span>100 leads</span>
              <span>5,000</span>
              <span>10,000+ leads</span>
            </div>
          </div>
        </div>

        {/* Right column: Projected Results */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-1.5 sm:gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-500">Manual Hours Saved</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{hoursSavedPerWeek} hrs</div>
            <div className="text-[10px] text-slate-400">per team every single week</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-1.5 sm:gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-500">Lead Conversion Boost</div>
            <div className="text-2xl sm:text-3xl font-black text-brand-blue">+{conversionIncrease}%</div>
            <div className="text-[10px] text-slate-400">sub-5s reply speed advantage</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-xs font-bold text-slate-700">Projected Pipeline Expansion</div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                High Impact
              </span>
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-900">
              ~₹{estimatedRevenueGain} <span className="text-xs font-normal text-slate-500">estimated added value</span>
            </div>
            <Link
              href="/login"
              className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md"
            >
              Unlock This Growth with Jisnu CRM <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
