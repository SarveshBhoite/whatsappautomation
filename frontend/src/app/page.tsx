"use client";
import Link from "next/link";
import { 
  Megaphone, ShieldCheck, Zap, MessageSquare, Star, 
  ArrowRight, Users, LayoutDashboard, Globe, Settings
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-background text-foreground flex flex-col font-sans scrollbar-thin">
      {/* Navbar */}
      <header className="border-b border-border bg-background/85 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-border shrink-0 shadow-lg shadow-primary/10">
            <img src="/icon.jpeg" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-slate-300 bg-clip-text text-transparent">
            Jisnu CRM
          </span>
        </div>
        <Link href="/whatsapp" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary text-background text-sm font-bold transition-all shadow-lg shadow-primary/20">
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center gap-6">
        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          ⚡ Automated Marketing Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl text-slate-100 leading-tight">
          Supercharge Customer Connections with <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Jisnu CRM</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
          Jisnu CRM is a complete customer relationship management and automation platform. We help you connect your WhatsApp Business account, Google Business Profile, and Google Ads account to sync reviews, manage campaigns, automate replies, and boost customer retention.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <Link href="/whatsapp" className="px-6 py-3.5 rounded-xl bg-primary hover:bg-secondary text-background font-bold transition-all shadow-lg shadow-primary/25 flex items-center gap-2">
            Get Started <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <a href="#features" className="px-6 py-3.5 rounded-xl bg-card border border-border hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-semibold transition-all">
            Learn More
          </a>
        </div>

        {/* Feature Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
          {/* WhatsApp Automation */}
          <div className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-3 hover:border-border transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100">WhatsApp Automation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect your WhatsApp Business API to run automated flows, broadcast messages, and manage multi-agent live support chats from a single inbox.
            </p>
          </div>

          {/* Google Ads Integration */}
          <div className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-3 hover:border-border transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Megaphone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100">Google Ads Platform</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Securely connect your Google Ads account to manage budgets, campaigns, and ad groups. Use AI-generated headlines, descriptions, and health analysis inside your CRM.
            </p>
          </div>

          {/* Google Business Profile */}
          <div className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-3 hover:border-border transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Star className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100">Google Business Reviews</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sync your business locations, view customer reviews, and set up AI auto-replies to maintain a 5-star reputation effortlessly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-10 px-6 mt-16 text-center md:text-left shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div>
            <p>© {new Date().getFullYear()} Jisnu CRM. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Providing automated CRM, WhatsApp, and Google Ads management tools.</p>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
