"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BottomCta() {
  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl border-2 border-slate-800 bg-slate-950 p-6 sm:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-950/40">
      {/* Decorative gradient glow halos */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center gap-5 sm:gap-6 max-w-3xl mx-auto">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-sky-400 text-xs font-bold backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span className="text-white font-extrabold truncate">Next-Generation Omnichannel Command Center</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          Ready to Automate WhatsApp, Ads &amp; Reviews in One Place?
        </h2>

        {/* Subtitle */}
        <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-medium">
          Connect your accounts in under 2 minutes through official Meta Embedded Signup &amp; Google OAuth 2.0. Scale your customer conversions today.
        </p>

        {/* Trust Checklist strip */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-200 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-white text-[11px] sm:text-xs">2-Minute Setup</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="text-white text-[11px] sm:text-xs">Official Meta API</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-white text-[11px] sm:text-xs">AES-256 Encryption</span>
          </div>
        </div>

        {/* Action Buttons using Shadcn Button components */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-black border-transparent shadow-xl"
            >
              Launch Your Workspace <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-brand-blue" />
            </Button>
          </Link>
          <a href="#modules" className="w-full sm:w-auto">
            <Button
              variant="dark"
              size="lg"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold"
            >
              Explore All 12 Modules
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
