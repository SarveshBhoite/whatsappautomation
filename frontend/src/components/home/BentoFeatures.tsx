"use client";

import React from "react";
import {
  MessageSquare,
  TrendingUp,
  Star,
  Bot,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Zap,
  Clock,
  Lock,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function BentoFeatures() {
  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* ── BENTO CARD 1: WhatsApp Multi-Agent Live Inbox (Large 7-col) ── */}
      <div className="md:col-span-7 bento-card bento-glow-border p-8 flex flex-col justify-between overflow-hidden relative group">
        <div className="flex flex-col gap-4 z-10">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Official Meta Cloud API
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Collaborative Multi-Agent Inbox &amp; Smart Routing
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-lg">
              Never let customer messages slip away. Route incoming inquiries automatically across your sales team with live presence, shared notes, and instant template broadcasts.
            </p>
          </div>
        </div>

        {/* Visual Mockup inside Card */}
        <div className="mt-6 bg-slate-50/90 rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  R
                </span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  S
                </span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                  AI
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700">3 Active Agents Online</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Live Routing
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-semibold">Active Chats</div>
              <div className="text-base font-black text-slate-900">42</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-semibold">Avg Reply Time</div>
              <div className="text-base font-black text-emerald-600">&lt; 4s</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-semibold">CSAT Score</div>
              <div className="text-base font-black text-brand-blue">99.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO CARD 2: Unified Ads Commander (5-col) ── */}
      <div className="md:col-span-5 bento-card bento-glow-border p-8 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-brand-blue flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Google &amp; Meta OAuth 2.0
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Single-Pane Ad Analytics &amp; ROAS
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Track cross-channel campaign spend, generate high-performing ad headlines, and sync leads instantly with your CRM without manual exports.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Cross-Network ROAS</div>
            <div className="text-2xl font-black text-slate-900">4.82x</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Synced Inbound Leads</div>
            <div className="text-2xl font-black text-brand-blue">+1,420</div>
          </div>
        </div>
      </div>

      {/* ── BENTO CARD 3: Google Business Reputation (5-col) ── */}
      <div className="md:col-span-5 bento-card bento-glow-border p-8 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <Star className="h-6 w-6 fill-amber-500" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Reputation Engine
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              1-Click Google Review AI Responder
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Maintain a 5-star reputation effortlessly. AI auto-detects customer sentiment and drafts personalized, professional responses across all your branch profiles.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-600" />
            100% Review Coverage Guarantee
          </span>
          <span className="font-extrabold text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
            5★ Rating
          </span>
        </div>
      </div>

      {/* ── BENTO CARD 4: Autonomous AI Knowledge Agent (7-col) ── */}
      <div className="md:col-span-7 bento-card bento-glow-border p-8 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Autonomous AI Agent
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Custom Knowledge Engine &amp; Lead Qualification
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-lg">
              Upload your service menus, pricing sheets, and FAQs. The agent answers customer questions accurately, schedules appointments, and sends instant CRM updates 24/7.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">Strict anti-hallucination guardrails</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Clock className="h-5 w-5 text-brand-blue shrink-0" />
            <span className="font-semibold text-slate-800">Zero downtime &amp; sub-5s response</span>
          </div>
        </div>
      </div>
    </div>
  );
}
