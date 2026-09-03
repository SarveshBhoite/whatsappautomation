"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Search,
  Printer,
  Lock,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Mail,
  FileText,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Server,
  UserCheck,
  Globe,
  Database,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";

// Section definitions for TOC and Search
const SECTIONS = [
  { id: "overview", title: "1. Overview & Scope", tag: "General" },
  { id: "data-collection", title: "2. Information We Collect", tag: "Data Collection" },
  { id: "data-usage", title: "3. How We Use Your Information", tag: "Usage" },
  { id: "google-data-policy", title: "4. Google & YouTube User Data Policy", tag: "Google Compliance" },
  { id: "meta-whatsapp-policy", title: "5. Meta WhatsApp Cloud API Compliance", tag: "Meta Compliance" },
  { id: "security-safeguards", title: "6. Data Security & AES-256 Encryption", tag: "Security" },
  { id: "data-retention", title: "7. Retention & 1-Click Revocation", tag: "Control" },
  { id: "subprocessors", title: "8. Subprocessors & Third-Party Sharing", tag: "Sharing" },
  { id: "cookies", title: "9. Cookies & Analytics", tag: "Tracking" },
  { id: "user-rights", title: "10. Your Rights (GDPR, CCPA & DPDP Act)", tag: "Rights" },
  { id: "children-privacy", title: "11. Children's Privacy", tag: "General" },
  { id: "revisions", title: "12. Policy Revisions & Notifications", tag: "General" },
  { id: "contact-dpo", title: "13. Contact Us & Data Protection Officer", tag: "Support" },
];

export default function PrivacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Google Compliance", "Meta Compliance", "Security", "Control", "Rights"];

  const matchesSearch = (title: string, content: string) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || content.toLowerCase().includes(query);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen w-full bg-mesh-canvas text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900 print:bg-white print:text-black">
      
      {/* ── Top Glass Navigation Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-2xl overflow-hidden border border-slate-200 p-0.5 bg-white shadow-2xs group-hover:border-brand-blue/60 transition-colors">
              <img src="/icon.jpeg" alt="Jisnu CRM Logo" className="h-full w-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-slate-900 leading-tight">
                Jisnu <span className="text-brand-blue">CRM</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Legal &amp; Privacy Center
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 font-bold text-slate-700">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <Button onClick={handlePrint} variant="outline" size="sm" className="hidden sm:flex gap-1.5 font-bold">
              <Printer className="h-4 w-4 text-slate-500" /> Print Policy
            </Button>
            <Link href="/login">
              <Button variant="default" size="sm" className="shadow-md shadow-brand-blue/20">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Header Banner ───────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-b from-white via-slate-50/50 to-transparent border-b border-slate-200/70 pt-10 pb-12 px-4 sm:px-6 lg:px-8 print:border-b-0 print:py-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/80 mb-4">
            <Shield className="h-4 w-4 text-brand-blue" />
            <span>Official Privacy Policy &amp; Platform Transparency</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Privacy Policy &amp; Data Governance
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl font-normal leading-relaxed">
            Learn how Jisnu CRM collects, uses, encrypts, and protects your information across Meta WhatsApp Cloud API, Google Ads, and Google Business Profile integrations.
          </p>
        </div>
      </section>

      {/* ── Main Layout: Search + TOC + Legal Content ───────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Transparency Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 print:hidden">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-brand-blue border border-sky-100 mb-1">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">1. Data We Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We request read &amp; write access strictly for your authorized Meta WhatsApp API, Google Ads campaigns, and Google Business reviews.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 mb-1">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">2. How Data Is Used</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exclusively to power CRM user automations, draft AI customer replies, and show lead metrics inside your workspace dashboard.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 mb-1">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">3. 1-Click Revocation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              OAuth tokens are encrypted at rest with AES-256. You can disconnect integrations or request total data deletion at any time.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search policy (e.g. Google, AES-256, Cookies)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                  activeCategory === cat
                    ? "bg-brand-blue text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid: Sticky Sidebar + Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Table of Contents Navigation (LG screens) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-4 print:hidden">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
                <FileText className="h-4 w-4 text-brand-blue" />
                <span>Table of Contents</span>
              </div>
              
              <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 text-xs font-semibold scrollbar-thin">
                {SECTIONS.filter(s => activeCategory === "All" || s.tag === activeCategory).map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center justify-between p-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-brand-blue transition-colors group"
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-blue shrink-0" />
                  </a>
                ))}
              </nav>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href="#contact-dpo"
                  className="w-full text-center py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5" /> Contact Compliance Officer
                </a>
              </div>
            </div>
          </aside>

          {/* Detailed Legal Sections */}
          <main className="lg:col-span-8 space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-2xs leading-relaxed text-sm text-slate-700">
            
            {/* Section 1: Overview */}
            <section id="overview" className="space-y-3 pt-2 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 1</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">1. Overview &amp; Scope</h2>
              </div>
              <p>
                Welcome to <strong>Jisnu CRM</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;the Platform&quot;), operated by Jisnu Digital Technologies. This Privacy Policy governs your use of our software-as-a-service website, customer relationship management dashboard, and API integrations with <strong>Google Ads API</strong>, <strong>Google Business Profile API</strong>, <strong>YouTube Data &amp; Analytics API</strong>, <strong>Meta WhatsApp Business Cloud API</strong>, and <strong>Meta Ads API</strong>.
              </p>
              <p>
                By connecting your workspace to Jisnu CRM, you consent to the data practices described in this policy. If you do not agree with these terms, you must not link your platform credentials or use our automated marketing, analytics, and messaging services.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2: Information We Collect */}
            <section id="data-collection" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 2</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">2. Information We Collect</h2>
              </div>
              <p>
                We collect information directly from you when you register an account, as well as automatically when you connect third-party platforms to your Jisnu CRM workspace:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong className="text-slate-900">Account Credentials &amp; Basic Profile:</strong> Full name, business email address, phone number, organization name, primary Google Account email address, basic Google profile information, and encrypted authentication credentials.
                </li>
                <li>
                  <strong className="text-slate-900">Google &amp; YouTube API Integration Data:</strong> When you connect Google Business Profile, Google Ads, or YouTube, we collect OAuth 2.0 access &amp; refresh tokens, customer location IDs, business reviews, campaign IDs, ad set metadata, performance metrics, keyword configurations, and authorized YouTube videos, comments, captions, ratings, and YouTube Analytics data.
                </li>
                <li>
                  <strong className="text-slate-900">Meta WhatsApp Cloud API Data:</strong> WhatsApp Phone Number IDs, WhatsApp Business Account (WABA) credentials, approved message templates, chat metadata, and incoming customer conversation payloads.
                </li>
                <li>
                  <strong className="text-slate-900">Usage &amp; Telemetry Data:</strong> IP address, browser user-agent, dashboard navigation metrics, API request logs, and error telemetry.
                </li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* Section 3: How We Use Your Information */}
            <section id="data-usage" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 3</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">3. How We Use Your Information</h2>
              </div>
              <p>
                We process your information exclusively to deliver, maintain, and optimize the features of Jisnu CRM:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-brand-blue" /> Campaign Management &amp; Analytics
                  </div>
                  <p className="text-xs text-slate-600">
                    Executing user-configured WhatsApp broadcast flows, triggering ad bid updates, syncing ad sets, and visualizing YouTube metrics.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> AI Review &amp; Social Responses
                  </div>
                  <p className="text-xs text-slate-600">
                    Drafting personalized responses to Google customer reviews and social interactions upon your explicit trigger or automation rule.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 4: Google & YouTube User Data Policy (CRITICAL FOR GOOGLE/YOUTUBE OAUTH REVIEW) */}
            <section id="google-data-policy" className="space-y-4 scroll-mt-28 p-5 rounded-2xl bg-sky-50/60 border border-sky-200/80">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-brand-blue text-white text-[10px]">Mandatory Disclosure</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">4. Google &amp; YouTube User Data Policy</h2>
              </div>

              {/* Explicit User Data Disclosure Cards */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white border border-sky-200 text-xs space-y-1.5 text-slate-700">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-brand-blue" />
                    Google User Data
                  </h3>
                  <p className="leading-relaxed">
                    Jisnu CRM accesses Google and YouTube user data only after the user authorizes the requested permissions through Google&apos;s OAuth consent process.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-sky-200 text-xs space-y-1.5 text-slate-700">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-brand-blue" />
                    YouTube Data Access
                  </h3>
                  <p className="leading-relaxed">
                    Jisnu CRM may access YouTube videos, comments, captions, ratings, and YouTube Analytics data only to provide the YouTube management and analytics features explicitly initiated and used by the customer within the Jisnu CRM application.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-sky-200 text-xs space-y-1.5 text-slate-700">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-brand-blue" />
                    Basic Google Account Information
                  </h3>
                  <p className="leading-relaxed">
                    Jisnu CRM may access basic Google profile information and the user&apos;s primary Google Account email address to identify the Google account connected by the user and associate that authorized account with the user&apos;s Jisnu CRM account.
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white border border-sky-200 text-xs space-y-2 text-slate-700">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-blue" />
                  Compliance with Google&apos;s Limited Use Requirements
                </p>
                <p>
                  Jisnu CRM&apos;s use and transfer of information received from Google APIs will strictly adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-blue font-bold underline hover:text-brand-blue-deep inline-flex items-center gap-0.5"
                  >
                    Google API Services User Data Policy <ExternalLink className="h-3 w-3" />
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                Specifically regarding data obtained via Google Ads API, Google Business Profile API, and YouTube Data &amp; Analytics APIs:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>We <strong>do not sell</strong> your Google or YouTube user data to any third parties or data brokers.</li>
                <li>We <strong>do not use</strong> your Google or YouTube user data for serving personalized ads or cross-site retargeting.</li>
                <li>We <strong>do not share</strong> your Google or YouTube user data with unauthorized human operators, except when required for legal compliance or explicit user support requests.</li>
                <li>We process Google and YouTube API data <strong>only to provide and improve customer-facing CRM features</strong> explicitly requested by your organization inside our dashboard.</li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* Section 5: Meta WhatsApp Cloud API Compliance */}
            <section id="meta-whatsapp-policy" className="space-y-4 scroll-mt-28 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="bg-emerald-600 text-white text-[10px]">Meta Platform Guidelines</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">5. Meta WhatsApp Cloud API Compliance</h2>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Jisnu CRM connects to Meta&apos;s Official WhatsApp Business Cloud API. When using our WhatsApp automation tools, you must strictly comply with Meta&apos;s Business Messaging Policies:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li><strong>Opt-In Consent:</strong> You guarantee that all contacts receiving broadcast messages have provided explicit, verifiable opt-in consent to receive communications from your organization.</li>
                <li><strong>Template Approval:</strong> Outbound business-initiated messages must use official Meta-approved template categories (Utility, Authentication, or Marketing).</li>
                <li><strong>Instant Unsubscribe:</strong> You agree to provide a clear mechanism (e.g., replying &quot;STOP&quot;) for users to opt-out of message flows.</li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* Section 6: Data Security & Encryption */}
            <section id="security-safeguards" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 6</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">6. Data Security &amp; Encryption Safeguards</h2>
              </div>
              <p>
                We employ industry-leading security practices to safeguard your organization&apos;s credentials and customer records:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Lock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <div className="font-extrabold text-slate-900 text-xs">AES-256 Encryption</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Tokens encrypted at rest in secure databases.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Server className="h-5 w-5 text-brand-blue mx-auto mb-1" />
                  <div className="font-extrabold text-slate-900 text-xs">TLS 1.3 in Transit</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">All API calls encrypted over HTTPS.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Database className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <div className="font-extrabold text-slate-900 text-xs">Isolated Workspaces</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Strict multi-tenant organization boundaries.</div>
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 7: Data Retention & 1-Click Revocation */}
            <section id="data-retention" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 7</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">7. Data Retention &amp; 1-Click Revocation</h2>
              </div>
              <p>
                You retain complete ownership and control over your connected accounts:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Instant Disconnect:</strong> You may revoke access to your Google account or WhatsApp credentials anytime inside <em>Settings &gt; Connected Integrations</em> with a single click.
                </li>
                <li>
                  <strong>Data Purging:</strong> Upon account closure or disconnection, OAuth refresh tokens are immediately purged from our servers, and cached campaign data is deleted within 30 days.
                </li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* Section 8: Subprocessors & Third-Party Sharing */}
            <section id="subprocessors" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 8</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">8. Subprocessors &amp; Service Providers</h2>
              </div>
              <p>
                To provide our cloud infrastructure, we partner with vetted third-party subprocessors who adhere to strict data protection standards:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-lg">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-extrabold">
                      <th className="p-2.5 border border-slate-200">Partner / Subprocessor</th>
                      <th className="p-2.5 border border-slate-200">Role / Purpose</th>
                      <th className="p-2.5 border border-slate-200">Location</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr>
                      <td className="p-2.5 border border-slate-200 font-semibold text-slate-900">Meta Cloud Platform</td>
                      <td className="p-2.5 border border-slate-200">WhatsApp Business Cloud API messaging routing</td>
                      <td className="p-2.5 border border-slate-200">United States / Global</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border border-slate-200 font-semibold text-slate-900">Google Cloud / APIs</td>
                      <td className="p-2.5 border border-slate-200">OAuth authentication, Google Ads &amp; GBP integration</td>
                      <td className="p-2.5 border border-slate-200">United States / Global</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border border-slate-200 font-semibold text-slate-900">PostgreSQL / Redis Storage</td>
                      <td className="p-2.5 border border-slate-200">Encrypted relational workspace data &amp; queue state</td>
                      <td className="p-2.5 border border-slate-200">Secure Cloud Data Center</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 9: Cookies & Analytics */}
            <section id="cookies" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 9</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">9. Cookies &amp; Tracking Technologies</h2>
              </div>
              <p>
                Jisnu CRM uses essential session cookies to maintain your login state, secure your workspace session, and remember active workspace preferences. We do not use intrusive third-party tracking cookies or advertising pixels to monitor your web browsing outside of our dashboard.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 10: Your Rights */}
            <section id="user-rights" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 10</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">10. Your Rights (GDPR, CCPA &amp; Digital Personal Data Protection)</h2>
              </div>
              <p>
                Depending on your location, you have statutory privacy rights regarding your personal data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Right of Access &amp; Portability:</strong> Request a copy of all workspace records and integrations data.</li>
                <li><strong>Right to Rectification:</strong> Correct or update inaccurate account details in your profile settings.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request permanent deletion of your account data.</li>
                <li><strong>Right to Restrict Processing:</strong> Pause automated workflows or AI drafting rules.</li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* Section 11: Protection of Minors */}
            <section id="children-privacy" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 11</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">11. Protection of Minors &amp; Children&apos;s Privacy</h2>
              </div>
              <p>
                Jisnu CRM is a business-to-business marketing platform intended exclusively for adult professionals aged 18 and older. We do not knowingly collect personal information from individuals under the age of 18.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 12: Revisions */}
            <section id="revisions" className="space-y-3 scroll-mt-28">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-[10px]">Section 12</Badge>
                <h2 className="text-xl font-extrabold text-slate-900">12. Policy Revisions &amp; Notifications</h2>
              </div>
              <p>
                We may update this Privacy Policy periodically to reflect shifts in legal requirements or platform updates. Material changes will be communicated via email notification to organization administrators at least 14 days prior to taking effect.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 13: Contact DPO */}
            <section id="contact-dpo" className="space-y-4 scroll-mt-28 p-6 rounded-2xl bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Badge className="bg-brand-blue text-white text-[10px]">Section 13</Badge>
                <h2 className="text-xl font-extrabold text-white">13. Contact Us &amp; Data Protection Officer</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you have questions regarding this Privacy Policy, wish to exercise your data rights, or need to contact our Data Protection Officer (DPO), please reach out directly:
              </p>
              
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Mail className="h-4 w-4 text-brand-blue" />
                  <strong className="text-white">Email Contact:</strong>{" "}
                  <a href="mailto:support@jisnudigital.com" className="text-brand-cyan hover:underline font-bold">
                    support@jisnudigital.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <strong className="text-white">Organization:</strong> Jisnu Digital Technologies Inc.
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:support@jisnudigital.com?subject=Privacy%20Inquiry%20-%20Jisnu%20CRM"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5" /> Submit Privacy Inquiry
                </a>
                <Link
                  href="/terms"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-slate-700"
                >
                  <FileText className="h-3.5 w-3.5" /> View Terms of Service
                </Link>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* ── Reusable Production Footer Component ───────────────────────────── */}
      <Footer />
    </div>
  );
}
