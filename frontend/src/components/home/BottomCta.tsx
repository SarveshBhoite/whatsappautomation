"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Zap, Sparkles, Lock } from "lucide-react";

export default function BottomCta() {
  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl border-2 border-slate-800 bg-slate-950 p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-950/40">
      {/* Decorative gradient glow halos */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-sky-400 text-xs font-bold backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span className="text-white font-extrabold">Next-Generation Omnichannel Command Center</span>
        </div>

        {/* Headline with 100% pure white high-contrast text */}
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Ready to Automate WhatsApp, Ads &amp; Reviews in One Place?
        </h2>

        {/* Subtitle with high-contrast slate-200 text */}
        <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-xl font-medium">
          Connect your accounts in under 2 minutes through official Meta Embedded Signup &amp; Google OAuth 2.0. Scale your customer conversions today.
        </p>

        {/* Trust Checklist strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-200 pt-2">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-white">2-Minute Embedded Setup</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="text-white">Official Meta Cloud API</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-white">AES-256 Token Encryption</span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
          <Link
            href="/login"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-base transition-all shadow-xl hover:-translate-y-0.5"
          >
            Launch Your Workspace <ArrowRight className="h-5 w-5 text-brand-blue" />
          </Link>
          <a
            href="#modules"
            className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base transition-all"
          >
            Explore All 12 Modules
          </a>
        </div>
      </div>
    </div>
  );
}
