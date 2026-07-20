"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle, GitMerge, Star, Store, Megaphone, Settings
} from "lucide-react";

// WhatsApp SVG icon
const WhatsApp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Instagram SVG icon
const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// YouTube SVG icon
const Youtube = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.866.553 9.388.553 9.388.553s7.522 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// ─── Nav definition ──────────────────────────────────────────────────────────
interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  match: string | string[];
}

const navItems: NavItem[] = [
  { href: "/whatsapp",  icon: <WhatsApp className="h-5 w-5" />,    label: "WhatsApp Chats",   match: "/whatsapp" },
  { href: "/instagram", icon: <Instagram className="h-5 w-5" />,   label: "Instagram Chats",  match: "/instagram" },
  { href: "/youtube",   icon: <Youtube className="h-5 w-5" />,     label: "YouTube Comments", match: "/youtube" },
  { href: "/flows",     icon: <GitMerge className="h-5 w-5" />,    label: "Flows",            match: "/flows" },
  { href: "/reviews",   icon: <Star className="h-5 w-5" />,        label: "Google Reviews",   match: "/reviews" },
  { href: "/gmb",       icon: <Store className="h-5 w-5" />,       label: "Google Listing",   match: "/gmb" },
  { href: "/ads",       icon: <Megaphone className="h-5 w-5" />,   label: "Google Ads",       match: "/ads" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (match: string | string[]) => {
    const matches = Array.isArray(match) ? match : [match];
    return matches.some(m => pathname === m || pathname.startsWith(m + "/"));
  };

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────── */}
      <aside className="hidden sm:flex w-16 flex-col items-center py-4 border-r border-slate-800 bg-slate-950 justify-between shrink-0 z-40">
        
        {/* Logo */}
        <div className="flex flex-col items-center w-full gap-2">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-slate-800 mb-3 shrink-0 shadow-lg shadow-primary/10">
            <img src="/icon.jpeg" alt="Logo" className="h-full w-full object-cover" />
          </div>

          {navItems.map((item) => {
            const active = isActive(item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center relative group shrink-0
                  transition-all duration-200
                  ${active
                    ? "bg-primary/15 text-primary shadow-sm shadow-primary/20"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"}
                `}
              >
                {/* Active left accent bar */}
                {active && (
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                {item.icon}
                {/* Tooltip */}
                <span className="
                  absolute left-full ml-3 px-2.5 py-1.5
                  bg-slate-900 border border-slate-700/60
                  text-xs text-slate-200 font-medium rounded-lg
                  whitespace-nowrap shadow-xl
                  scale-0 opacity-0 origin-left
                  group-hover:scale-100 group-hover:opacity-100
                  transition-all duration-150 z-50 pointer-events-none
                ">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Settings at bottom */}
        <Link
          href="/settings"
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center relative group shrink-0
            transition-all duration-200
            ${isActive("/settings")
              ? "bg-primary/15 text-primary"
              : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"}
          `}
        >
          {isActive("/settings") && (
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
          )}
          <Settings className="h-5 w-5" />
          <span className="
            absolute left-full ml-3 px-2.5 py-1.5
            bg-slate-900 border border-slate-700/60
            text-xs text-slate-200 font-medium rounded-lg
            whitespace-nowrap shadow-xl
            scale-0 opacity-0 origin-left
            group-hover:scale-100 group-hover:opacity-100
            transition-all duration-150 z-50 pointer-events-none
          ">
            Settings
          </span>
        </Link>
      </aside>

      {/* ── Mobile bottom bar ───────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur border-t border-slate-800 flex items-center justify-around">
        {[
          { href: "/whatsapp",  icon: <WhatsApp className="h-5 w-5" />,  label: "WA" },
          { href: "/instagram", icon: <Instagram className="h-5 w-5" />, label: "IG" },
          { href: "/youtube",   icon: <Youtube className="h-5 w-5" />,   label: "YT" },
          { href: "/flows",     icon: <GitMerge className="h-5 w-5" />,  label: "Flows" },
          { href: "/reviews",   icon: <Star className="h-5 w-5" />,      label: "Reviews" },
          { href: "/gmb",       icon: <Store className="h-5 w-5" />,     label: "Listing" },
          { href: "/ads",       icon: <Megaphone className="h-5 w-5" />, label: "Ads" },
          { href: "/settings",  icon: <Settings className="h-5 w-5" />,  label: "Settings" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2.5 px-2 flex-1 transition-colors ${
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "text-primary"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-semibold tracking-wide">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
