"use client";

import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full bg-mesh-canvas text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
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
                Terms of Service
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 font-bold text-slate-700">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="font-bold">
                Privacy Policy
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Terms Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/80">
            <FileText className="h-4 w-4 text-brand-blue" />
            <span>Master Services Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            Last Updated: September 3, 2026
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <Badge variant="brand" className="text-[10px] mb-1">Section 1</Badge>
            <h2 className="text-lg font-extrabold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing, registering for, or using <strong>Jisnu CRM</strong> (the &quot;Service&quot;), operated by Jisnu Digital Technologies, you agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, you must immediately cease using the platform and disconnect your workspace integrations.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <Badge variant="brand" className="text-[10px] mb-1">Section 2</Badge>
            <h2 className="text-lg font-extrabold text-slate-900">2. Platform Integrations &amp; Acceptable Use</h2>
            <p>
              Jisnu CRM provides workflow automation tools connecting third-party platforms including Meta WhatsApp Cloud API, Google Ads API, and Google Business Profile API:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>You agree to comply with Google&apos;s API Terms of Service and Meta&apos;s Business Messaging Policies at all times.</li>
              <li>You are solely responsible for all content, campaign settings, ad copy, broadcast messages, and customer interactions triggered from your organization&apos;s workspace.</li>
              <li>Prohibited activities include sending unsolicited spam, deceptive advertising, distributing malware, or violating recipient opt-out preferences.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <Badge variant="brand" className="text-[10px] mb-1">Section 3</Badge>
            <h2 className="text-lg font-extrabold text-slate-900">3. Workspace Security &amp; OAuth Credentials</h2>
            <p>
              You must maintain the confidentiality of your organization&apos;s login credentials and access tokens. Jisnu CRM encrypts credentials with AES-256 standards, but you remain responsible for activities occurring under your authorized workspace accounts.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <Badge variant="brand" className="text-[10px] mb-1">Section 4</Badge>
            <h2 className="text-lg font-extrabold text-slate-900">4. Limitation of Liability</h2>
            <p>
              Jisnu CRM is provided on an &quot;as is&quot; and &quot;as available&quot; basis. In no event shall Jisnu Digital Technologies be liable for indirect, incidental, special, or consequential damages resulting from platform downtime, third-party API policy changes, account suspensions imposed by Google or Meta, or data loss.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <Badge variant="brand" className="text-[10px] mb-1">Section 5</Badge>
            <h2 className="text-lg font-extrabold text-slate-900">5. Termination &amp; Disconnection</h2>
            <p>
              You may terminate your account at any time by disconnecting your integrations in <em>Settings &gt; Connected Integrations</em> and requesting account deletion. We reserve the right to suspend accounts that violate platform acceptable use guidelines.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <Badge variant="brand" className="text-[10px] mb-1">Section 6</Badge>
            <h2 className="text-lg font-extrabold text-slate-900">6. Governing Law &amp; Contact</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws. For questions regarding these Terms, contact our legal team at{" "}
              <a href="mailto:support@jisnudigital.com" className="text-brand-blue font-bold hover:underline">
                support@jisnudigital.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
