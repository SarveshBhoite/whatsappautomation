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
  CheckCheck,
  UserCheck,
  PhoneCall,
  Clock
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
  visualPreview: React.ReactNode;
}

export default function WorkflowPipeline() {
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const steps: StepData[] = [
    {
      id: "step-1",
      step: "01",
      badge: "Instant Capture (<200ms)",
      badgeColor: "bg-sky-50 text-brand-blue border-sky-200",
      title: "Lead Capture & Instant Sync",
      subtitle: "Google Ads & Meta Lead Forms",
      description:
        "When an interested prospect submits a Meta Lead Form or clicks your Google Search ad, Jisnu CRM captures their name, phone, and campaign source in under 200 milliseconds.",
      bullets: [
        "Zero CSV exports or manual data entry required",
        "Auto-tags source, keyword, and campaign ID",
        "Deduplication engine prevents double messaging",
      ],
      metrics: { label: "Capture Speed", value: "< 180ms" },
      visualPreview: (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
              New Lead Captured Automatically
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              ⚡ Live Synced
            </span>
          </div>

          {/* Lead Card Visual */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs">
                KS
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Karan Singhania</div>
                <div className="text-[11px] text-slate-500 font-medium">+91 98201 98201</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 block">
                Google Search Ad
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 block">Captured 120ms ago</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Auto-Tagged: #HighIntent #Q3Campaign
            </span>
            <span className="text-slate-400">Pushed to WhatsApp →</span>
          </div>
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
      visualPreview: (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              WhatsApp AI Conversation
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Sub-3s Reply
            </span>
          </div>
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl rounded-tr-none text-[11px] self-end max-w-[90%]">
            👋 Hi Karan! Thanks for checking out Jisnu CRM. Are you looking to automate WhatsApp, Google Ads, or both?
          </div>
          <div className="bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl rounded-tl-none text-[11px] self-start max-w-[90%] shadow-2xs">
            Both! We run Meta lead ads and need fast WhatsApp follow-ups.
          </div>
          <div className="bg-sky-50 border border-sky-200 text-slate-800 p-2.5 rounded-xl rounded-tr-none text-[11px] self-end max-w-[90%]">
            <span className="font-bold text-brand-blue block text-[10px] mb-0.5">⚡ Jisnu AI Assistant</span>
            Perfect! Jisnu CRM connects both via official APIs. Would you like to see a quick 10-min live demo with our team?
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
      visualPreview: (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3 text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-black text-slate-900 flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-brand-blue" />
              Meeting Booked &amp; Opportunity Created
            </span>
            <span className="text-[10px] font-extrabold text-brand-blue bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              High-Intent
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-semibold">Assigned Agent</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Rahul M. (Online)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-semibold">Scheduled Slot</span>
              <span className="font-bold text-brand-blue flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" /> Tomorrow, 3:00 PM
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            Automated calendar invite &amp; WhatsApp reminder dispatched.
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
      visualPreview: (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              5★ Google Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            &quot;Incredible CRM! The automated WhatsApp follow-ups and ad sync saved our team hours every day.&quot;
          </p>
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px]">
            <span className="font-bold text-amber-900 block mb-0.5 text-[10px]">⚡ 1-Click AI Response Drafted:</span>
            <span className="text-slate-700">&quot;Thank you for the 5-star review, Karan! We love supporting your team&apos;s growth!&quot;</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
      {/* Step Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {steps.map((item, idx) => {
          const isSelected = selectedStep === idx;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedStep(idx)}
              className={`rounded-3xl border p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "bg-white border-slate-400 shadow-xl shadow-slate-200/80 -translate-y-1 ring-2 ring-brand-blue/30"
                  : "bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center font-black text-xs">
                    {item.step}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5 mb-2">
                  {item.subtitle}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-semibold">{item.metrics.label}</span>
                <span className="font-extrabold text-slate-900 text-xs">{item.metrics.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Step Visual Detail Card */}
      <div className="w-full bento-card bento-glow-border p-5 sm:p-8 bg-white/95">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left info */}
          <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-blue text-white shadow-xs">
                Stage {steps[selectedStep].step} Live Architecture
              </span>
              <span className="text-xs font-bold text-slate-500">{steps[selectedStep].subtitle}</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {steps[selectedStep].title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {steps[selectedStep].description}
            </p>

            <div className="space-y-2 pt-1">
              {steps[selectedStep].bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Simulator Preview */}
          <div className="lg:col-span-6">
            {steps[selectedStep].visualPreview}
          </div>
        </div>
      </div>
    </div>
  );
}
