"use client";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-background text-foreground p-8 font-sans scrollbar-thin">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-fit mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-slate-300 bg-clip-text text-transparent">Terms of Service</h1>
        </div>
        <p className="text-xs text-muted-foreground">Last updated: July 17, 2026</p>
        
        <div className="border-t border-border pt-6 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">1. Acceptance of Terms</h2>
            <p>
              By accessing or using **Jisnu CRM** (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, you must immediately cease using the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">2. Usage Rights & Integrations</h2>
            <p>
              The Service integrates with third-party platforms including Meta WhatsApp API, Google My Business, and Google Ads API:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You agree to comply with Google's and Meta's respective Policies and Terms of Service.</li>
              <li>You are solely responsible for the content of the campaigns, ads, reviews, and messages sent or updated through Jisnu CRM.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">3. Accounts & Security</h2>
            <p>
              You must maintain the confidentiality of your account credentials. We are not liable for any loss or damage arising from unauthorized access to your integrations or customer records.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">4. Limitation of Liability</h2>
            <p>
              Jisnu CRM is provided "as is". In no event shall we be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform, including any suspensions or actions taken by Google Ads or Meta WhatsApp on your accounts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, without notice, for conduct that we believe violates these Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
