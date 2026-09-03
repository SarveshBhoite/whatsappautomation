"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white pt-10 pb-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Row: Brand Info (Left) + Nav Links (Right) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
          
          {/* Brand Logo & Subtitle */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 p-0.5 bg-white shadow-2xs flex items-center justify-center">
                <img 
                  src="/icon.jpeg" 
                  alt="Jisnu CRM Logo" 
                  className="h-full w-full object-cover rounded-full" 
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Jisnu <span className="text-blue-600 font-bold">CRM</span>
              </span>
            </Link>

            <p className="text-sm text-slate-600 font-normal">
              WhatsApp Business API, Google Ads &amp; Google Business Profile Automation Suite.
            </p>
          </div>

          {/* Navigation Links in One Clean Row */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-700 whitespace-nowrap">
            <Link href="/#cockpit" className="hover:text-blue-600 transition-colors">
              Cockpit
            </Link>
            <Link href="/#workflow" className="hover:text-blue-600 transition-colors">
              Workflow
            </Link>
            <Link href="/#modules" className="hover:text-blue-600 transition-colors">
              Modules
            </Link>
            <Link href="/#features" className="hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="/#comparison" className="hover:text-blue-600 transition-colors">
              Comparison
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>

        {/* Horizontal Divider Line */}
        <div className="w-full border-t border-slate-200 my-4" />

        {/* Bottom Tier Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-normal">
          <div>
            &copy; {currentYear} Jisnu CRM. All rights reserved.
          </div>

          <div>
            WhatsApp Business API &bull; Google Ads &bull; Google Business Profile
          </div>
        </div>
      </div>
    </footer>
  );
}
