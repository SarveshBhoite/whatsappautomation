import type { Metadata } from "next";
import Link from "next/link";
import {
  Megaphone, ShieldCheck, Zap, MessageSquare, Star,
  ArrowRight, Globe, BarChart2, Bot, Lock, RefreshCw, LayoutDashboard
} from "lucide-react";

/* ── Page-level SEO metadata (overrides root layout for this route) ── */
export const metadata: Metadata = {
  title: "Jisnu CRM ",
  description:
    "Jisnu CRM is an all-in-one customer relationship management platform. " +
    "Connect your WhatsApp Business API, Google Ads accounts, and Google Business " +
    "Profile to automate marketing, manage campaigns, sync reviews, and grow your business.",
  openGraph: {
    title: "Jisnu CRM ",
    description:
      "Manage WhatsApp broadcasts, Google Ads campaigns, and Google My Business " +
      "reviews from a single, secure dashboard.",
    siteName: "Jisnu CRM",
    type: "website",
  },
};

/* ── Feature cards data ─────────────────────────────────────────────── */
const features = [
  {
    icon: MessageSquare,
    color: "emerald",
    title: "WhatsApp Automation",
    description:
      "Connect your WhatsApp Business API to run automated flows, broadcast " +
      "promotional messages, and manage multi-agent live-support chats — all from " +
      "a unified inbox.",
  },
  {
    icon: Megaphone,
    color: "primary",
    title: "Google Ads Management",
    description:
      "Securely link your Google Ads account using OAuth 2.0. View campaigns, " +
      "manage ad groups and budgets, get AI-generated ad copy, and monitor " +
      "performance — without leaving the CRM.",
  },
  {
    icon: Star,
    color: "amber",
    title: "Google Business Reviews",
    description:
      "Sync all your Google Business Profile locations, read incoming customer " +
      "reviews, and configure AI auto-replies to maintain your online reputation " +
      "on autopilot.",
  },
  {
    icon: Bot,
    color: "violet",
    title: "AI-Powered Replies",
    description:
      "Leverage built-in AI to draft review responses, generate ad headlines, " +
      "write WhatsApp message templates, and suggest campaign improvements based " +
      "on real data.",
  },
  {
    icon: BarChart2,
    color: "sky",
    title: "Unified Analytics",
    description:
      "Get a bird's-eye view of your marketing performance — WhatsApp delivery " +
      "rates, ad spend, click-through rates, and review scores in one clean " +
      "dashboard.",
  },
  {
    icon: Lock,
    color: "rose",
    title: "Secure OAuth Connection",
    description:
      "We use Google's official OAuth 2.0 protocol to connect your accounts. " +
      "Jisnu CRM never stores your Google password. You can revoke access at any " +
      "time from your Google Account settings.",
  },
];

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  primary:  "bg-primary/10 text-primary border-primary/20",
  amber:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  violet:  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  sky:     "bg-sky-500/10 text-sky-400 border-sky-500/20",
  rose:    "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

/* ── Data usage transparency section ────────────────────────────────── */
const dataPoints = [
  {
    icon: RefreshCw,
    title: "What data we access",
    body: "When you connect a Google account, Jisnu CRM requests read and write access to your Google Ads campaigns, ad groups, and budgets, plus read access to your Google Business Profile reviews and locations.",
  },
  {
    icon: Lock,
    title: "How we use it",
    body: "Your data is used exclusively to power the features you see inside the CRM dashboard — displaying campaigns, posting review replies, and running automations you have explicitly configured.",
  },
  {
    icon: ShieldCheck,
    title: "How we protect it",
    body: "All tokens are stored encrypted and are never shared with third parties. You can disconnect your Google account at any time from the Settings page, which immediately revokes our access.",
  },
];

/* ══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-background text-foreground flex flex-col font-sans scrollbar-thin">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background/85 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-border shrink-0 shadow-lg shadow-primary/10">
            <img src="/icon.jpeg" alt="Jisnu CRM Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-slate-300 bg-clip-text text-transparent">
            Jisnu CRM
          </span>
        </div>
        <Link
          href="/whatsapp"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary text-background text-sm font-bold transition-all shadow-lg shadow-primary/20"
        >
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 flex flex-col items-center gap-0">

        {/* ── Hero Section ───────────────────────────────────────── */}
        <section className="py-20 flex flex-col items-center text-center gap-6 w-full">
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
            ⚡ All-in-One Marketing Automation Platform
          </div>

          {/* PRIMARY H1 — exact app name required for OAuth verification */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-100 leading-tight">
            Jisnu CRM
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
            Jisnu CRM is a complete customer relationship management and marketing
            automation platform. Connect your <strong className="text-slate-200">WhatsApp Business API</strong>,{" "}
            <strong className="text-slate-200">Google Ads</strong>, and{" "}
            <strong className="text-slate-200">Google Business Profile</strong> to
            manage campaigns, automate replies, sync reviews, and grow your business
            — all from one secure dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link
              href="/whatsapp"
              className="px-7 py-3.5 rounded-xl bg-primary hover:bg-secondary text-background font-bold transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="px-7 py-3.5 rounded-xl bg-card border border-border hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-semibold transition-all"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* ── What is Jisnu CRM? ─────────────────────────────────── */}
        <section className="w-full py-10 border-t border-border">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 px-8 py-8 text-center max-w-3xl mx-auto">
            <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-100 mb-3">What is Jisnu CRM?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jisnu CRM is a SaaS platform built for businesses and marketing agencies
              to manage their entire digital marketing workflow from a single place.
              The application connects to <strong className="text-slate-200">Google&apos;s APIs</strong> via
              the official OAuth 2.0 flow to request only the permissions required to
              display and manage your ad campaigns, business reviews, and account data.
              No passwords are stored. Access can be revoked at any time.
            </p>
          </div>
        </section>

        {/* ── Feature Grid ───────────────────────────────────────── */}
        <section id="features" className="w-full py-16">
          <h2 className="text-3xl font-black text-center text-slate-100 mb-2">Platform Features</h2>
          <p className="text-center text-muted-foreground mb-10 text-sm">
            Everything you need to run and automate your marketing in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-3 hover:border-primary/30 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-100">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Data Usage Transparency ────────────────────────────── */}
        <section id="data-usage" className="w-full py-16 border-t border-border">
          <h2 className="text-3xl font-black text-center text-slate-100 mb-2">
            How We Use Your Google Data
          </h2>
          <p className="text-center text-muted-foreground mb-10 text-sm max-w-xl mx-auto">
            Jisnu CRM requests access to your Google account solely to provide the
            features described below. We are fully transparent about what data we
            access and why.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataPoints.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-primary/10 text-primary border-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-100">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────────────── */}
        <section className="w-full py-16 text-center">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-8 py-12">
            <LayoutDashboard className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-black text-slate-100 mb-3">
              Ready to grow with Jisnu CRM?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Connect your accounts, automate your marketing, and focus on what
              matters — building great customer relationships.
            </p>
            <Link
              href="/whatsapp"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-secondary text-background font-bold transition-all shadow-lg shadow-primary/25 text-lg"
            >
              Start Free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-10 px-6 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-slate-300">Jisnu CRM</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              © {new Date().getFullYear()} Jisnu CRM. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              WhatsApp, Google Ads &amp; Google Business Profile automation platform.
            </p>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
