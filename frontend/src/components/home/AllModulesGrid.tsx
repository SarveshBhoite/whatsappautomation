"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Megaphone,
  Star,
  Store,
  GitMerge,
  Mail,
  Wrench,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronRight,
  MessageSquare,
  Clock,
  Send,
  CheckCheck,
  Calendar,
  Layers,
  ThumbsUp,
  Lock
} from "lucide-react";

// Custom SVG Icons
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.866.553 9.388.553 9.388.553s7.522 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
  </svg>
);

const MetaIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.5 12c0-5.799-4.701-10.5-10.5-10.5S1.5 6.201 1.5 12c0 5.24 3.84 9.584 8.86 10.368v-7.334h-2.665V12h2.665V9.797c0-2.632 1.568-4.085 3.966-4.085 1.149 0 2.351.205 2.351.205v2.585h-1.324c-1.305 0-1.712.81-1.712 1.64V12h2.913l-.466 3.034h-2.447v7.334c5.02-.784 8.86-5.128 8.86-10.368z"/>
  </svg>
);

interface ModuleItem {
  id: string;
  name: string;
  category: "conversational" | "advertising" | "growth";
  icon: React.ReactNode;
  iconBg: string;
  badge: string;
  tagline: string;
  description: string;
  keyFeature: string;
  stats: string;
  visualPreview: React.ReactNode;
}

const modules: ModuleItem[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Cloud Hub",
    category: "conversational",
    icon: <WhatsAppIcon className="h-5 w-5" />,
    iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    badge: "Official Meta API",
    tagline: "Broadcasts, Template Approval & Live Multi-Agent Inbox",
    description: "Broadcast rich templates, manage shared agent chats, and automate follow-ups with official Cloud API credentials.",
    keyFeature: "Zero account bans with sub-5s automated replies",
    stats: "99.8% Open Rate",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live WhatsApp Broadcast Inbox
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Meta Cloud Verified
          </span>
        </div>
        <div className="bg-emerald-600 text-white p-2.5 rounded-xl rounded-tr-none text-[11px] self-end max-w-[90%] shadow-xs">
          🔥 Exclusive 20% Discount for returning customers! Click below to claim.
          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-100">
            <span>11:04 AM</span>
            <CheckCheck className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="flex gap-1.5 pt-1">
          <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
            📦 View Catalog
          </span>
          <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
            💬 Talk to Human Agent
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "ai-agent",
    name: "AI Agent Studio",
    category: "growth",
    icon: <Bot className="h-5 w-5" />,
    iconBg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    badge: "Autonomous Engine",
    tagline: "Custom Prompt Engineering & Knowledge Vector Store",
    description: "Train agents on business PDFs and FAQs to qualify leads, provide accurate quotes, and schedule CRM appointments 24/7.",
    keyFeature: "Strict anti-hallucination vector knowledge base",
    stats: "24/7 Autopilot",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50/50 border border-purple-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-purple-200/80">
          <span className="font-bold text-purple-950 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            Knowledge Base Indexed
          </span>
          <span className="text-[10px] font-bold text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200">
            84 FAQs Active
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-white border border-purple-100 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-slate-400">Agent Persona Prompt:</div>
          <p className="text-[11px] text-slate-800 font-semibold italic">
            &quot;You are Jisnu Senior Sales Assistant. Answer client questions accurately based only on verified price tiers.&quot;
          </p>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-purple-900 bg-white p-2 rounded-lg border border-purple-100">
          <span>Guardrail Status: Anti-Hallucination ON</span>
          <span className="text-emerald-600">✓ 100% Precision</span>
        </div>
      </div>
    ),
  },
  {
    id: "google-ads",
    name: "Google Ads Commander",
    category: "advertising",
    icon: <Megaphone className="h-5 w-5" />,
    iconBg: "bg-sky-500/10 text-brand-blue border-sky-500/20",
    badge: "Google Ads API v17",
    tagline: "Cross-Campaign Budget & AI Headline Generator",
    description: "Create Search, Performance Max, Demand Gen and Video ads with real-time ROAS feedback and instant lead webhook capture.",
    keyFeature: "Direct OAuth 2.0 with instant CRM sync",
    stats: "4.8x Avg ROAS",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/50 border border-sky-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-sky-200/80">
          <span className="font-bold text-sky-950 flex items-center gap-1.5">
            <Megaphone className="h-3.5 w-3.5 text-brand-blue" />
            Google Ads Live Campaign Radar
          </span>
          <span className="text-[10px] font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
            Search &amp; PMax
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-white rounded-lg border border-sky-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Spend (This Month)</span>
            <span className="text-sm font-black text-slate-900">₹42,500</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-sky-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Leads Captured</span>
            <span className="text-sm font-black text-brand-blue">412 Leads (₹38 CPL)</span>
          </div>
        </div>
        <div className="p-2 bg-white rounded-lg border border-sky-100 text-[10px] text-slate-700 flex items-center justify-between">
          <span>AI Suggested Headline: &quot;Automate Support in 1-Click&quot;</span>
          <span className="text-emerald-600 font-bold">+22% CTR</span>
        </div>
      </div>
    ),
  },
  {
    id: "meta-ads",
    name: "Meta Ads Manager",
    category: "advertising",
    icon: <MetaIcon className="h-5 w-5" />,
    iconBg: "bg-blue-600/10 text-blue-600 border-blue-600/20",
    badge: "Meta Graph API v21",
    tagline: "Lead Form & Video Reel Retargeting Hub",
    description: "Sync Facebook & Instagram lead forms directly to WhatsApp in <200ms without manual CSV downloads.",
    keyFeature: "Real-time webhook sync to sales team",
    stats: "< 200ms Latency",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-blue-200/80">
          <span className="font-bold text-blue-950 flex items-center gap-1.5">
            <MetaIcon className="h-3.5 w-3.5 text-blue-600" />
            Meta Instant Lead Webhook
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Live Stream
          </span>
        </div>
        <div className="p-2.5 bg-white rounded-lg border border-blue-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900 text-[11px]">Instagram Reel Campaign</div>
            <div className="text-[10px] text-slate-500">628 Inbound Leads • ₹31.50 CPL</div>
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            4.6x ROAS
          </span>
        </div>
        <div className="text-[10px] text-slate-600 font-semibold bg-white p-2 rounded-lg border border-blue-100 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Lead forms pushed to WhatsApp inbox in 180ms
        </div>
      </div>
    ),
  },
  {
    id: "reviews",
    name: "Google Reviews & Reputation",
    category: "growth",
    icon: <Star className="h-5 w-5 fill-amber-500" />,
    iconBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badge: "Reputation Autopilot",
    tagline: "1-Click AI Auto-Replies & Sentiment Radar",
    description: "Monitor and respond to customer feedback across all business branches with personalized brand-aligned AI responses.",
    keyFeature: "100% review coverage boosts local SEO",
    stats: "4.9 ★ Rating",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
          <span className="font-bold text-amber-950 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            Google Business Review Radar
          </span>
          <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
            100% Replied
          </span>
        </div>
        <div className="p-2.5 bg-white rounded-lg border border-amber-100 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-[11px]">Rahul K. • 5★ Review</span>
            <span className="text-[9px] text-slate-400">2h ago</span>
          </div>
          <p className="text-[10px] text-slate-600 italic">&quot;Super fast response time! Very satisfied with service.&quot;</p>
        </div>
        <div className="p-2 bg-amber-100/60 rounded-lg text-[10px] text-amber-900 font-semibold border border-amber-200">
          ⚡ AI Response: &quot;Thank you Rahul! We love supporting your team!&quot;
        </div>
      </div>
    ),
  },
  {
    id: "gmb",
    name: "Google Business Profile",
    category: "growth",
    icon: <Store className="h-5 w-5" />,
    iconBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    badge: "Local SEO Sync",
    tagline: "Multi-Location Business Profile Management",
    description: "Manage branch addresses, business hours, photos, and local service updates across multiple locations in one place.",
    keyFeature: "Unified branch updates & listings",
    stats: "Multi-Location",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-teal-50/50 border border-teal-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-teal-200/80">
          <span className="font-bold text-teal-950 flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-teal-600" />
            Branch Profile Manager
          </span>
          <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
            3 Locations Synced
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="p-2 bg-white rounded-lg border border-teal-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-800">Mumbai Bandra HQ</span>
            <span className="text-emerald-600 font-semibold text-[10px]">✓ Open Now (9 AM - 8 PM)</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-teal-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-800">Bengaluru Tech Hub</span>
            <span className="text-emerald-600 font-semibold text-[10px]">✓ Open Now (9 AM - 8 PM)</span>
          </div>
        </div>
        <div className="text-[10px] text-teal-900 bg-white p-2 rounded-lg border border-teal-100 flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
          1-Click sync updates address, phone &amp; holiday hours everywhere.
        </div>
      </div>
    ),
  },
  {
    id: "flows",
    name: "Visual Automation Flows",
    category: "advertising",
    icon: <GitMerge className="h-5 w-5" />,
    iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    badge: "Drag & Drop Builder",
    tagline: "Conversational Decision Trees & Lead Scoring",
    description: "Build custom multi-step automation sequences with conditional triggers, keyword matches, and CRM status updates.",
    keyFeature: "Visual branching logic & lead tagging",
    stats: "Unlimited Flows",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-200/80">
          <span className="font-bold text-indigo-950 flex items-center gap-1.5">
            <GitMerge className="h-3.5 w-3.5 text-indigo-600" />
            Visual Decision Flow
          </span>
          <span className="text-[10px] font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
            Active Trigger
          </span>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px]">
          <div className="p-1.5 bg-white rounded border border-indigo-100 font-bold text-slate-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trigger: Prospect replies &quot;PRICING&quot;
          </div>
          <div className="pl-4 text-slate-400 font-bold">↓ If Budget &gt; ₹50,000</div>
          <div className="p-1.5 bg-indigo-100/70 text-indigo-900 rounded border border-indigo-200 font-bold">
            Action: Send VIP Brochure + Notify Senior Sales Agent
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "instagram",
    name: "Instagram DM & Comments",
    category: "conversational",
    icon: <InstagramIcon className="h-5 w-5" />,
    iconBg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    badge: "IG Direct API",
    tagline: "Story Mentions & Post Comment Auto-Replies",
    description: "Never miss a customer DM. Auto-reply to post comments and turn Instagram engagement into qualified CRM leads.",
    keyFeature: "Keyword-triggered comment auto-DMs",
    stats: "Instant DM",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50/50 border border-rose-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-rose-200/80">
          <span className="font-bold text-rose-950 flex items-center gap-1.5">
            <InstagramIcon className="h-3.5 w-3.5 text-rose-600" />
            Instagram Post Auto-DM
          </span>
          <span className="text-[10px] font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-200">
            Auto-Trigger
          </span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-rose-100 text-[11px]">
          <span className="text-slate-400 block text-[9px] font-semibold">User Comment on Reel:</span>
          <span className="font-bold text-slate-800">&quot;How much for this software?&quot;</span>
        </div>
        <div className="p-2 bg-rose-100/70 text-rose-900 rounded-lg text-[10px] font-semibold border border-rose-200">
          ⚡ Auto DM Dispatched: &quot;Hey! Sent you the pricing breakdown in your DMs! Check it out!&quot;
        </div>
      </div>
    ),
  },
  {
    id: "youtube",
    name: "YouTube Comments Auto-Reply",
    category: "conversational",
    icon: <YoutubeIcon className="h-5 w-5" />,
    iconBg: "bg-red-500/10 text-red-600 border-red-500/20",
    badge: "Video Engagement",
    tagline: "Channel Sentiment & Automated Engagement",
    description: "Engage viewers automatically under your YouTube tutorials and video ads. Filter spam and respond with tailored AI drafts.",
    keyFeature: "Automated sentiment detection",
    stats: "Spam Guard",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-red-50/50 border border-red-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-red-200/80">
          <span className="font-bold text-red-950 flex items-center gap-1.5">
            <YoutubeIcon className="h-3.5 w-3.5 text-red-600" />
            YouTube Video Comment Moderation
          </span>
          <span className="text-[10px] font-bold text-red-800 bg-white px-2 py-0.5 rounded border border-red-200">
            Channel Synced
          </span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-red-100 text-[11px]">
          <span className="text-slate-400 block text-[9px] font-semibold">Comment on Tutorial Video:</span>
          <span className="font-bold text-slate-800">&quot;Can this connect with Meta Ads?&quot;</span>
        </div>
        <div className="p-2 bg-red-100/70 text-red-900 rounded-lg text-[10px] font-semibold border border-red-200">
          ⚡ Creator Auto-Reply: &quot;Yes! Jisnu CRM integrates directly with Meta Graph API.&quot;
        </div>
      </div>
    ),
  },
  {
    id: "gmail",
    name: "Gmail AI Auto-Responder",
    category: "conversational",
    icon: <Mail className="h-5 w-5" />,
    iconBg: "bg-amber-600/10 text-amber-700 border-amber-600/20",
    badge: "Email Intelligence",
    tagline: "Inbox Parsing & Intelligent Drafting",
    description: "Sync your business Gmail accounts. AI reads inquiries, extracts customer requirements, and drafts professional replies.",
    keyFeature: "Autonomous email lead parsing",
    stats: "Smart Drafts",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
          <span className="font-bold text-amber-950 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-amber-700" />
            Inbound Email AI Parser
          </span>
          <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
            Smart Draft
          </span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-amber-100 text-[11px]">
          <span className="text-slate-400 block text-[9px] font-semibold">Subject: Request for Enterprise Proposal</span>
          <span className="font-bold text-slate-800">From: contact@acmecorp.com</span>
        </div>
        <div className="p-2 bg-amber-100/70 text-amber-900 rounded-lg text-[10px] font-semibold border border-amber-200">
          ⚡ AI Drafted: &quot;Hi Team Acme, Attached is the custom enterprise breakdown...&quot;
        </div>
      </div>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn B2B Outreach",
    category: "conversational",
    icon: <LinkedInIcon className="h-5 w-5" />,
    iconBg: "bg-blue-700/10 text-blue-700 border-blue-700/20",
    badge: "B2B Social CRM",
    tagline: "Post Scheduling & Lead Engagement",
    description: "Manage professional B2B lead generation. Schedule company posts and capture profile inquiries directly into the CRM pipeline.",
    keyFeature: "B2B client tracking with corporate attribution",
    stats: "B2B Sync",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-blue-200/80">
          <span className="font-bold text-blue-950 flex items-center gap-1.5">
            <LinkedInIcon className="h-3.5 w-3.5 text-blue-700" />
            B2B Pipeline &amp; Post Publisher
          </span>
          <span className="text-[10px] font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
            Company Page Synced
          </span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-blue-100 text-[11px]">
          <span className="text-slate-400 block text-[9px] font-semibold">Scheduled Post for Tomorrow 10 AM:</span>
          <span className="font-bold text-slate-800">&quot;How Omnichannel CRM reduces sales response latency by 80%&quot;</span>
        </div>
        <div className="text-[10px] text-blue-900 bg-white p-2 rounded-lg border border-blue-100 flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />
          Lead inquiries automatically captured with corporate job titles.
        </div>
      </div>
    ),
  },
  {
    id: "tools",
    name: "Tools Suite & Integrations",
    category: "growth",
    icon: <Wrench className="h-5 w-5" />,
    iconBg: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    badge: "Developer Suite",
    tagline: "API Tokens, Webhooks & Export Utilities",
    description: "Connect your existing software stack with custom webhooks, generate link tracking parameters, and export custom analytics.",
    keyFeature: "REST APIs with 256-bit encrypted token vault",
    stats: "AES-256",
    visualPreview: (
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-100 border border-slate-300 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-300">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            256-bit Encrypted Token Vault
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            AES-256
          </span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600">
          POST /api/webhooks/v1/lead-ingest • Status: 200 OK
        </div>
        <div className="text-[10px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Granular API Scopes with 1-click token rotation.
        </div>
      </div>
    ),
  },
];

export default function AllModulesGrid() {
  const [selectedModuleId, setSelectedModuleId] = useState<string>("whatsapp");

  const selectedModule = modules.find((m) => m.id === selectedModuleId) || modules[0];

  const conversationalList = modules.filter((m) => m.category === "conversational");
  const advertisingList = modules.filter((m) => m.category === "advertising");
  const growthList = modules.filter((m) => m.category === "growth");

  return (
    <div className="w-full max-w-7xl mx-auto bento-card bento-glow-border p-4 sm:p-8 bg-white/95 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-slate-100">
        <div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-blue block mb-1">
            Complete Omnichannel Architecture
          </span>
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            12 Integrated Modules. One Unified Command Center.
          </h3>
        </div>
        <span className="self-start sm:self-auto text-[11px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          All 12 Modules Included
        </span>
      </div>

      {/* Split-Pane Interactive Suite Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 sm:pt-6">
        {/* Left Side: 3 Categorized Columns with Pill Selectors */}
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-5">
          {/* Pillar 1: Conversational Channels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Conversational Channels ({conversationalList.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {conversationalList.map((m) => {
                const isSelected = selectedModuleId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all ${
                      isSelected
                        ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${m.iconBg}`}>
                        {m.icon}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{m.stats}</div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-emerald-600 translate-x-0.5" : "text-slate-300"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pillar 2: Advertising & Flows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Advertising &amp; Flows ({advertisingList.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {advertisingList.map((m) => {
                const isSelected = selectedModuleId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all ${
                      isSelected
                        ? "bg-sky-50/90 border-sky-300 ring-2 ring-sky-500/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${m.iconBg}`}>
                        {m.icon}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{m.stats}</div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-brand-blue translate-x-0.5" : "text-slate-300"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pillar 3: Reputation & AI Studio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                AI, Reputation &amp; Dev Tools ({growthList.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {growthList.map((m) => {
                const isSelected = selectedModuleId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all ${
                      isSelected
                        ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${m.iconBg}`}>
                        {m.icon}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{m.stats}</div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-amber-600 translate-x-0.5" : "text-slate-300"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Deep Interactive Visual Preview of the Selected Module */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-md">
          <div className="flex flex-col gap-3.5">
            {/* Badge & Icon header */}
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${selectedModule.iconBg}`}>
                {selectedModule.icon}
              </div>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-slate-900 text-white shadow-xs">
                {selectedModule.badge}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">
                Live Module Visual Preview
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {selectedModule.name}
              </h4>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {selectedModule.tagline}
              </p>
            </div>

            {/* Unique In-Code Visual Representation of the Selected Module */}
            <div className="py-1">
              {selectedModule.visualPreview}
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{selectedModule.keyFeature}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-slate-400">
              Direct access via sidebar
            </span>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              Open in CRM Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
