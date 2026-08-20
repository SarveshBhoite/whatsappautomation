"use client";

import React, { useState } from "react";
import {
  Megaphone,
  MessageSquare,
  CalendarCheck,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Bot,
  Layers,
  ShieldCheck,
  Send,
  Sliders,
  CheckCheck
} from "lucide-react";

interface StepData {
  id: string;
  step: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  metrics: { label: string; value: string };
  codePreview: React.ReactNode;
}

export default function WorkflowPipeline() {
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const steps: StepData[] = [
    {
      id: "step-1",
      step: "01",
      badge: "Real-time Webhook (<200ms)",
      badgeColor: "bg-sky-50 text-brand-blue border-sky-200",
      title: "Lead Capture & Instant Sync",
      subtitle: "Google Ads & Meta Lead Forms",
      description:
        "When an interested prospect submits a Meta Lead Form or clicks your Google Search ad, Jisnu CRM ingests the contact within 200 milliseconds.",
      bullets: [
        "Zero CSV exports or manual data entry",
        "Auto-tags source, keyword, and campaign ID",
        "Deduplication engine prevents double messaging",
      ],
      metrics: { label: "Ingestion Latency", value: "< 180ms" },
      codePreview: (
        <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
            <span className="text-sky-400 font-bold">Webhook Ingestion Payload</span>
            <span className="text-emerald-400 font-semibold">200 OK</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "event": "leadgen.meta_ads",
  "lead_id": "LD_89421",
  "name": "Karan Singhania",
  "phone": "+919820198201",
  "campaign": "Search_High_Intent_2026",
  "sync_status": "INSTANT_PUSH_TO_WHATSAPP"
}`}
          </pre>
        </div>
      ),
    },
    {
      id: "step-2",
      step: "02",
      badge: "Official Meta Cloud API",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "24/7 AI Qualification & Nurturing",
      subtitle: "Sub-5s WhatsApp Engagement",
      description:
        "Jisnu CRM immediately triggers an automated 1-to-1 WhatsApp conversation. The AI answers queries using your knowledge base and qualifies lead intent.",
      bullets: [
        "Official WhatsApp Business Cloud API (0% ban risk)",
        "Trained on your custom services, pricing & FAQs",
        "Dynamic interactive buttons & product catalog links",
      ],
      metrics: { label: "Avg Open Rate", value: "98.8%" },
      codePreview: (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900">WhatsApp AI Interaction</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl rounded-tr-none text-[11px]">
            👋 Hi Karan! Thanks for checking out Jisnu CRM. Are you looking to automate WhatsApp, Google Ads, or both?
          </div>
          <div className="bg-slate-100 text-slate-800 p-2.5 rounded-xl rounded-tl-none text-[11px]">
            Both! We run Meta lead ads and need fast WhatsApp follow-ups.
          </div>
          <div className="bg-sky-50 border border-sky-200 text-slate-800 p-2.5 rounded-xl rounded-tr-none text-[11px]">
            <span className="font-bold text-brand-blue block text-[10px]">⚡ Jisnu AI Bot</span>
            Perfect! Jisnu CRM connects both via official APIs. Would you like to see a 10-min live demo with our solution team?
          </div>
        </div>
      ),
    },
    {
      id: "step-3",
      step: "03",
      badge: "Team Presence & Routing",
      badgeColor: "bg-brand-blue/10 text-brand-blue-deep border-brand-blue/20",
      title: "Automated Booking & Live Handoff",
      subtitle: "CRM Pipeline & Multi-Agent Inbox",
      description:
        "Qualified leads receive calendar scheduling links. Live agents get instant notifications and can seamlessly take over the chat at any time.",
      bullets: [
        "Automated WhatsApp meeting reminders reduce no-shows",
        "Team routing assigns chats by agent workload",
        "Shared internal notes & custom contact tags",
      ],
      metrics: { label: "Meeting Attendance", value: "+42% Higher" },
      codePreview: (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900">CRM Opportunity Created</span>
            <span className="text-[10px] font-extrabold text-brand-blue bg-sky-50 px-2 py-0.5 rounded">
              High-Intent Lead
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Assigned Agent</span>
              <span className="font-bold text-slate-800">Rahul M. (Online)</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Scheduled Slot</span>
              <span className="font-bold text-emerald-600">Tomorrow, 3:00 PM</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
            ✓ Automated calendar invite &amp; WhatsApp reminder dispatched.
          </div>
        </div>
      ),
    },
    {
      id: "step-4",
      step: "04",
      badge: "1-Click AI Responses",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      title: "Google Reviews & Reputation Autopilot",
      subtitle: "Google Business Profile Sync",
      description:
        "Post-purchase, Jisnu CRM sends an automated WhatsApp review request. Incoming feedback is monitored in real-time with 1-click AI reply drafting.",
      bullets: [
        "Syncs all branch locations in one central dashboard",
        "Instant sentiment analysis (Positive, Neutral, Urgent)",
        "Zero unanswered reviews keeps local SEO rank at the top",
      ],
      metrics: { label: "Review Coverage", value: "100%" },
      codePreview: (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-slate-400">Google Verified</span>
          </div>
          <p className="text-[11px] text-slate-700 italic">
            &quot;Incredible CRM! The WhatsApp broadcasts and ad tracking saved our team hours every day.&quot;
          </p>
          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[10px]">
            <span className="font-bold text-amber-900 block mb-0.5">⚡ AI Response Drafted:</span>
            <span className="text-slate-700">Thank you for the 5-star review! We love supporting your growth!</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      {/* Visual Step Process Map (100% Pure Code SVG Connectors & Node Flow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((item, idx) => {
          const isSelected = selectedStep === idx;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedStep(idx)}
              className={`rounded-3xl border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 relative ${
                isSelected
                  ? "bg-white border-slate-400 shadow-xl shadow-slate-200/80 -translate-y-1.5 ring-2 ring-brand-blue/30"
                  : "bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center font-black text-sm">
                  {item.step}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5 mb-2">
                  {item.subtitle}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-semibold">{item.metrics.label}</span>
                <span className="font-extrabold text-slate-900">{item.metrics.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Step Code-Rendered Interactive Stage Detail Card */}
      <div className="w-full bento-card bento-glow-border p-6 sm:p-8 bg-white/95">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-blue text-white shadow-xs">
                Stage {steps[selectedStep].step} Deep Dive
              </span>
              <span className="text-xs font-bold text-slate-500">{steps[selectedStep].subtitle}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {steps[selectedStep].title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {steps[selectedStep].description}
            </p>

            <div className="space-y-2 pt-2">
              {steps[selectedStep].bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pure Code Interactive Simulator Preview */}
          <div className="lg:col-span-6">
            {steps[selectedStep].codePreview}
          </div>
        </div>
      </div>
    </div>
  );
}
