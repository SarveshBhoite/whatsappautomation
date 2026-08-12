"use client";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-background text-foreground p-8 font-sans scrollbar-thin">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm w-fit mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-slate-300 bg-clip-text text-transparent">Privacy Policy</h1>
        </div>
        <p className="text-xs text-muted-foreground">Last updated: July 17, 2026</p>
        
        <div className="border-t border-border pt-6 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">1. Introduction</h2>
            <p>
              Welcome to **Jisnu CRM** (referred to as "we", "us", "our", or "the App"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our website, CRM dashboard, and our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">2. Information We Collect</h2>
            <p>
              When you use Jisnu CRM, we collect data required to provide our platform integration services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Basic details provided during signup.</li>
              <li><strong>Google API Integration Data:</strong> If you connect your Google Business Profile or Google Ads accounts, we securely retrieve location profiles, reviews, campaigns, ad groups, budgets, and keywords.</li>
              <li><strong>WhatsApp API Integration Data:</strong> Message payloads, templates, and contact lists to enable automated replies and chat routing.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">3. How We Use Google User Data</h2>
            <p>
              Jisnu CRM's use and transfer of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements. We use this data only to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Display campaigns, budgets, ad groups, and keywords for editing inside the CRM.</li>
              <li>Display and draft replies to customer reviews.</li>
              <li>Analyze campaigns with AI tools to offer bid and optimization suggestions.</li>
            </ul>
            <p>We do not sell your Google User Data or use it for personalized advertising.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">4. Data Storage and Security</h2>
            <p>
              All Google Ads OAuth access and refresh tokens are encrypted in transit and at rest in our secure database. Access is strictly limited to authorized organization workspace accounts only.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at **support@jisnudigital.com**.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
