import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  Star,
  CheckCircle2,
  Layers
} from "lucide-react";
import HeroShowcase from "@/components/home/HeroShowcase";
import WorkflowPipeline from "@/components/home/WorkflowPipeline";
import AllModulesGrid from "@/components/home/AllModulesGrid";
import BentoFeatures from "@/components/home/BentoFeatures";
import ComparisonMatrix from "@/components/home/ComparisonMatrix";
import RoiCalculator from "@/components/home/RoiCalculator";
import FaqAccordion from "@/components/home/FaqAccordion";
import BottomCta from "@/components/home/BottomCta";

/* ── Page-level SEO metadata ── */
export const metadata: Metadata = {
  title: "Jisnu CRM – Unified WhatsApp, Ads & Google Business Automation",
  description:
    "Jisnu CRM is a complete omnichannel customer growth platform. " +
    "Connect official WhatsApp Business Cloud API, Google Ads, Meta Ads, and " +
    "Google Business Profile to automate replies, manage campaigns, and scale revenue.",
  openGraph: {
    title: "Jisnu CRM – Omnichannel Marketing Automation Platform",
    description:
      "Manage WhatsApp broadcasts, Google Ads, and Google Business Profile " +
      "reviews from one secure, unified command center.",
    siteName: "Jisnu CRM",
    type: "website",
  },
};

/* ── Data usage transparency cards ── */
const dataPoints = [
  {
    icon: RefreshCw,
    title: "What Google Data We Access",
    body: "When you link your Google account, Jisnu CRM requests read and write access strictly for Google Ads campaigns, ad groups, and budgets, as well as read access for Google Business Profile customer reviews and locations.",
  },
  {
    icon: Lock,
    title: "How Your Data Is Used",
    body: "Your data is used exclusively to power the features you trigger inside the CRM dashboard — displaying campaigns, generating AI draft replies, and running user-configured marketing automations.",
  },
  {
    icon: ShieldCheck,
    title: "How We Protect Your Information",
    body: "All authentication tokens are secured with AES-256 encryption. We never sell or share your data. You can disconnect your Google account anytime with a single click in Settings, instantly revoking access.",
  },
];

/* ── Social Proof Testimonials ── */
const testimonials = [
  {
    quote:
      "Jisnu CRM cut our lead response time from 3 hours to 4 seconds. The automated WhatsApp flows and AI review replies have noticeably elevated our customer satisfaction score.",
    name: "Vikram Malhotra",
    role: "Founder & CEO, Nexa Digital Agency",
    avatar: "VM",
  },
  {
    quote:
      "Managing Google Ads and WhatsApp broadcasts from one unified platform is a game-changer. Our team saved over 15 hours a week in manual coordination.",
    name: "Pooja Sharma",
    role: "Head of Marketing, BlueOrbit Retail",
    avatar: "PS",
  },
  {
    quote:
      "The Google Business review sync with instant AI drafting allows us to maintain a pristine 4.9-star rating across 12 branch locations effortlessly.",
    name: "Anand Deshmukh",
    role: "Operations Director, Zenith Healthcare",
    avatar: "AD",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-mesh-canvas text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">

      {/* ── Sticky Frosted Glass Navbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl overflow-hidden border border-slate-200/90 p-0.5 bg-white shadow-2xs group-hover:border-brand-blue/60 transition-colors">
              <img src="/icon.jpeg" alt="Jisnu CRM Logo" className="h-full w-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
                Jisnu <span className="text-brand-blue">CRM</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Automation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#cockpit" className="hover:text-brand-blue transition-colors">
              Cockpit
            </a>
            <a href="#workflow" className="hover:text-brand-blue transition-colors">
              Workflow
            </a>
            <a href="#modules" className="hover:text-brand-blue transition-colors">
              All 12 Modules
            </a>
            <a href="#bento-features" className="hover:text-brand-blue transition-colors">
              Capabilities
            </a>
            <a href="#comparison" className="hover:text-brand-blue transition-colors">
              Comparison
            </a>
            <a href="#calculator" className="hover:text-brand-blue transition-colors">
              ROI Impact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-blue hover:bg-slate-100/80 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-brand-blue/20"
            >
              Dashboard <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center w-full px-3.5 sm:px-6 lg:px-8">

        {/* ── 1. Hero Section ───────────────────────────────────────── */}
        <section className="w-full pt-10 sm:pt-16 pb-10 sm:pb-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Brand Shimmer Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-[11px] sm:text-xs font-bold shadow-2xs mb-6 sm:mb-8 max-w-full truncate">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-brand-blue font-extrabold shrink-0">NEW</span>
            <span className="text-slate-300">|</span>
            <span className="truncate">Meta WhatsApp API &amp; Google Ads Command Center</span>
          </div>

          {/* Main H1 Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-4xl leading-[1.14]">
            Supercharge Customer Growth Across{" "}
            <span className="text-brand-blue">WhatsApp</span>,{" "}
            <span className="text-sky-600">Ads</span> &amp;{" "}
            <span className="text-brand-orange">Reviews</span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg lg:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
            Connect your official WhatsApp Business API, Google Ads, Meta Ads, and Google Business Profile.
            Automate personalized broadcasts, generate AI review responses, and qualify high-intent leads — all from a single, secure platform.
          </p>

          {/* Action Button Row (Responsive Stacking on Mobile) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-brand-blue hover:bg-brand-blue-deep text-white font-black text-sm sm:text-base transition-all shadow-xl shadow-brand-blue/25"
            >
              Get Started Free <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <a
              href="#cockpit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm sm:text-base transition-all shadow-2xs hover:bg-slate-50"
            >
              <Sparkles className="h-4 w-4 text-brand-blue" />
              Explore Live Cockpit
            </a>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-8 sm:mt-12 w-full max-w-4xl pt-6 sm:pt-8 border-t border-slate-200/80 text-left sm:text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Official Meta Cloud API
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-blue shrink-0" />
              Google OAuth 2.0 Verified
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-600">
              <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              AES-256 Token Encryption
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-600">
              <Zap className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              Sub-5s Instant AI Replies
            </div>
          </div>
        </section>

        {/* ── 2. Live Command Cockpit ───────────────────────────────── */}
        <section id="cockpit" className="w-full py-6 sm:py-8 max-w-7xl mx-auto">
          <HeroShowcase />
        </section>

        {/* ── 3. Omnichannel Workflow Pipeline (How It Works) ────────── */}
        <section id="workflow" className="w-full py-12 sm:py-20 max-w-7xl mx-auto border-t border-slate-200/70">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              Complete 4-Stage Lifecycle
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How Jisnu CRM Automates Inbound Leads into 5-Star Reviews
            </h2>
            <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-slate-600 leading-relaxed">
              Every step of your customer acquisition, nurturing, booking, and reputation management operates autonomously.
            </p>
          </div>
          <WorkflowPipeline />
        </section>

        {/* ── 4. Complete 12-Module Suite Showcase ────────────────────── */}
        <section id="modules" className="w-full py-12 sm:py-20 max-w-7xl mx-auto border-t border-slate-200/70">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold mb-3">
              <Layers className="h-3.5 w-3.5 text-brand-blue" />
              Full Platform Suite
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              All 12 Growth Modules in One Integrated Platform
            </h2>
            <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-slate-600 leading-relaxed">
              From WhatsApp broadcasts and Instagram DMs to Google Ads and AI Agents — everything is ready out of the box.
            </p>
          </div>
          <AllModulesGrid />
        </section>

        {/* ── 5. Bento Features Architecture ────────────────────────── */}
        <section id="bento-features" className="w-full py-12 sm:py-20 max-w-7xl mx-auto border-t border-slate-200/70">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue-deep text-xs font-bold mb-3">
              <Layers className="h-3.5 w-3.5 text-brand-blue" />
              Engineered for Scalable Performance
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              High-Precision Capabilities for Growing Teams
            </h2>
            <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-slate-600 leading-relaxed">
              Designed with bespoke visual hierarchy, real presence routing, and cross-channel attribution.
            </p>
          </div>
          <BentoFeatures />
        </section>

        {/* ── 6. Workflow Comparison Matrix ─────────────────────────── */}
        <section id="comparison" className="w-full py-10 sm:py-16 max-w-7xl mx-auto">
          <ComparisonMatrix />
        </section>

        {/* ── 7. Interactive ROI Calculator Section ──────────────────── */}
        <section id="calculator" className="w-full py-10 sm:py-16 max-w-7xl mx-auto">
          <RoiCalculator />
        </section>

        {/* ── 8. Google Data Transparency & Security ─────────────────── */}
        <section id="security" className="w-full py-12 sm:py-20 max-w-7xl mx-auto border-t border-slate-200/70">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Verified Compliance &amp; Privacy
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Transparent Google &amp; Meta OAuth Security
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-slate-600 leading-relaxed">
              Jisnu CRM adheres strictly to official API security requirements. We maintain clear boundaries regarding data usage so you always retain complete ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {dataPoints.map((dp, idx) => {
              const Icon = dp.icon;
              return (
                <div
                  key={idx}
                  className="bento-card bento-glow-border p-5 sm:p-7 flex flex-col gap-3 sm:gap-4"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{dp.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{dp.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 9. Testimonials / Social Proof ─────────────────────────── */}
        <section className="w-full py-12 sm:py-16 max-w-7xl mx-auto bento-card bento-glow-border my-6 sm:my-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center text-amber-400 mb-2.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              Trusted by High-Growth Agencies &amp; Brands
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-4"
              >
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t.name}</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 10. FAQ Accordion ─────────────────────────────────────── */}
        <section id="faq" className="w-full py-12 sm:py-20 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-blue mb-1.5">
              Frequently Asked Questions
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Got questions? We have answers.
            </p>
          </div>
          <FaqAccordion />
        </section>

        {/* ── 11. Launchpad CTA ─────────────────────────────────────── */}
        <section className="w-full py-10 sm:py-16 max-w-7xl mx-auto">
          <BottomCta />
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-slate-200 bg-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-sm text-slate-500">
          {/* Brand Info */}
          <div className="flex flex-col gap-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="h-7 w-7 rounded-lg overflow-hidden border border-slate-200">
                <img src="/icon.jpeg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-extrabold text-base text-slate-900">Jisnu CRM</span>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Jisnu CRM. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-400">
              WhatsApp Business API, Google Ads &amp; Google Business Profile Automation Suite.
            </p>
          </div>

          {/* Links & Compliance */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold text-xs text-slate-600">
            <a href="#cockpit" className="hover:text-brand-blue transition-colors">Cockpit</a>
            <a href="#workflow" className="hover:text-brand-blue transition-colors">Workflow</a>
            <a href="#modules" className="hover:text-brand-blue transition-colors">Modules</a>
            <a href="#bento-features" className="hover:text-brand-blue transition-colors">Features</a>
            <a href="#comparison" className="hover:text-brand-blue transition-colors">Comparison</a>
            <Link href="/privacy" className="hover:text-brand-blue transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-blue transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
