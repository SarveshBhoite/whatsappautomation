"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageCircle, MessageSquare, User, GitMerge, Star, Store, Megaphone, Settings, Wrench, Mail, Send, FileText, Bot, Shield, LogOut, LayoutDashboard
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

// LinkedIn SVG icon
const LinkedIn = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
  </svg>
);

// Meta SVG icon
const Meta = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.5 12c0-5.799-4.701-10.5-10.5-10.5S1.5 6.201 1.5 12c0 5.24 3.84 9.584 8.86 10.368v-7.334h-2.665V12h2.665V9.797c0-2.632 1.568-4.085 3.966-4.085 1.149 0 2.351.205 2.351.205v2.585h-1.324c-1.305 0-1.712.81-1.712 1.64V12h2.913l-.466 3.034h-2.447v7.334c5.02-.784 8.86-5.128 8.86-10.368z"/>
  </svg>
);

// ─── Nav definition ──────────────────────────────────────────────────────────
interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  match: string | string[];
  moduleKey?: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Overview Hub",      match: "/dashboard" },
  { href: "/ai-agent",  icon: <Bot className="h-5 w-5" />,         label: "AI Agent Studio",  match: "/ai-agent",  moduleKey: "ai_agent" },
  { href: "/whatsapp",  icon: <WhatsApp className="h-5 w-5" />,    label: "WhatsApp Chats",   match: "/whatsapp",  moduleKey: "whatsapp" },
  { href: "/instagram", icon: <Instagram className="h-5 w-5" />,   label: "Instagram Chats",  match: "/instagram", moduleKey: "instagram" },
  { href: "/youtube",   icon: <Youtube className="h-5 w-5" />,     label: "YouTube Comments", match: "/youtube",   moduleKey: "youtube" },
  { href: "/gmail",     icon: <Mail className="h-5 w-5" />,        label: "Gmail Auto-Reply", match: "/gmail",     moduleKey: "gmail" },
  { href: "/linkedin",  icon: <LinkedIn className="h-5 w-5" />,    label: "LinkedIn Posts",   match: "/linkedin",  moduleKey: "linkedin" },
  { href: "/flows",     icon: <GitMerge className="h-5 w-5" />,    label: "Flows",            match: "/flows",     moduleKey: "whatsapp" },
  { href: "/reviews",   icon: <Star className="h-5 w-5" />,        label: "Google Reviews",   match: "/reviews",   moduleKey: "reviews" },
  { href: "/gmb",       icon: <Store className="h-5 w-5" />,       label: "Google Listing",   match: "/gmb",       moduleKey: "gmb" },
  { href: "/ads",       icon: <Megaphone className="h-5 w-5" />,   label: "Google Ads",       match: "/ads",       moduleKey: "google_ads" },
  { href: "/meta-ads",  icon: <Meta className="h-5 w-5" />,        label: "Meta Ads Manager", match: "/meta-ads",  moduleKey: "meta_ads" },
  { href: "/tools",     icon: <Wrench className="h-5 w-5" />,      label: "Tools Suite",      match: "/tools",     moduleKey: "tools" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<{ label: string; top: number; isRed?: boolean; isAmber?: boolean } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const role = localStorage.getItem("user_role");
    const orgId = localStorage.getItem("organization_id") || "";
    setUserRole(role);

    // If Super Admin, allow all modules
    if (role === "super_admin") {
      setEnabledModules(navItems.map(item => item.moduleKey).filter(Boolean) as string[]);
      setIsLoaded(true);
      return;
    }

    // Fetch exact enabled modules for this organization
    const fetchOrgModules = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/api/admin/organization/my-modules`, {
          headers: {
            "x-organization-id": orgId,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.enabledModules)) {
            setEnabledModules(data.enabledModules);
            localStorage.setItem("enabled_modules", JSON.stringify(data.enabledModules));
            return;
          }
        }
      } catch (err) {
        // Fallback gracefully to cached or default modules
      } finally {
        const cached = localStorage.getItem("enabled_modules");
        if (cached) {
          try {
            setEnabledModules(JSON.parse(cached));
          } catch {}
        } else {
          // Default all active modules
          setEnabledModules(navItems.map(item => item.moduleKey).filter(Boolean) as string[]);
        }
        setIsLoaded(true);
      }
    };

    fetchOrgModules();
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_role");
      localStorage.removeItem("organization_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("enabled_modules");
    }
    router.push("/login");
  };

  const isActive = (match: string | string[]) => {
    const matches = Array.isArray(match) ? match : [match];
    return matches.some(m => pathname === m || pathname.startsWith(m + "/"));
  };

  // Strictly filter navigation items based on enabled modules
  const visibleNavItems = userRole === "super_admin"
    ? navItems
    : navItems.filter(item => !item.moduleKey || enabledModules.includes(item.moduleKey));

  return (
    <>
      {/* ── Desktop sidebar (Uniform Solid Brand Theme Background) ──────────── */}
      <aside className="hidden sm:flex w-16 flex-col items-center py-4 border-r border-sky-300 bg-[#BAE6FD] justify-between shrink-0 z-40 shadow-xs h-full overflow-hidden select-none relative text-slate-800">
        {/* Logo & Nav items */}
        <div className="flex flex-col items-center w-full gap-2 overflow-y-auto overflow-x-hidden no-scrollbar flex-1 pb-2">
          <Link href="/" className="h-10 w-10 rounded-2xl overflow-hidden border border-sky-300 mb-2 shrink-0 shadow-xs hover:border-brand-blue hover:shadow-sm hover:scale-105 transition-all p-0.5 bg-white">
            <img src="/icon.jpeg" alt="Logo" className="h-full w-full object-cover rounded-xl" />
          </Link>

          {visibleNavItems.map((item) => {
            const active = isActive(item.match);

            return (
              <div key={item.href} className="relative shrink-0">
                <Link
                  href={item.href}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredNav({
                      label: item.label,
                      top: rect.top + rect.height / 2,
                    });
                  }}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center relative
                    transition-all duration-200
                    ${active
                      ? "bg-gradient-to-br from-brand-blue to-brand-blue-deep text-white shadow-md shadow-brand-blue/25 font-bold scale-105"
                      : "text-slate-600 hover:text-brand-blue-deep hover:bg-white/80 hover:shadow-2xs"}
                  `}
                >
                  {/* Active left brand accent pill */}
                  {active && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-blue rounded-r-full shadow-xs" />
                  )}
                  {item.icon}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: Super Admin, Settings, Logout */}
        <div className="flex flex-col gap-2 shrink-0 pt-3 border-t border-sky-200/60 w-full items-center">
          {userRole === "super_admin" && (
            <div className="relative shrink-0">
              <Link
                href="/admin"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredNav({
                    label: "Super Admin Console",
                    top: rect.top + rect.height / 2,
                    isAmber: true,
                  });
                }}
                onMouseLeave={() => setHoveredNav(null)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center relative
                  transition-all duration-200
                  ${isActive("/admin")
                    ? "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/25 scale-105"
                    : "text-amber-700 hover:text-amber-800 hover:bg-amber-100/60"}
                `}
              >
                {isActive("/admin") && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-r-full" />
                )}
                <Shield className="h-5 w-5" />
              </Link>
            </div>
          )}

          <div className="relative shrink-0">
            <Link
              href="/settings"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredNav({
                  label: "Settings & Integrations",
                  top: rect.top + rect.height / 2,
                });
              }}
              onMouseLeave={() => setHoveredNav(null)}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center relative
                transition-all duration-200
                ${isActive("/settings")
                  ? "bg-gradient-to-br from-brand-blue to-brand-blue-deep text-white font-bold shadow-md shadow-brand-blue/25 scale-105"
                  : "text-slate-600 hover:text-brand-blue-deep hover:bg-white/80 hover:shadow-2xs"}
              `}
            >
              {isActive("/settings") && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-blue rounded-r-full" />
              )}
              <Settings className="h-5 w-5" />
            </Link>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={handleLogout}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredNav({
                  label: "Log Out",
                  top: rect.top + rect.height / 2,
                  isRed: true,
                });
              }}
              onMouseLeave={() => setHoveredNav(null)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Screen-Overlay Floating Tooltip (Never clipped, never causes scrollbars) ── */}
      {hoveredNav && (
        <div
          style={{ top: `${hoveredNav.top}px` }}
          className="hidden sm:flex fixed left-[72px] -translate-y-1/2 z-[9999] pointer-events-none items-center animate-fadeIn duration-150"
        >
          <div
            className={`relative px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border whitespace-nowrap flex items-center gap-1.5 ${
              hoveredNav.isRed
                ? "bg-slate-900 text-rose-300 border-rose-800"
                : hoveredNav.isAmber
                ? "bg-slate-900 text-amber-300 border-amber-800"
                : "bg-slate-900 text-white border-slate-800"
            }`}
          >
            {/* Pointer arrow pointing to icon */}
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
            <span className="relative z-10">{hoveredNav.label}</span>
          </div>
        </div>
      )}

      {/* ── Mobile bottom bar (Icons Only & Scrollable) ───────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#BAE6FD] backdrop-blur-md border-t border-sky-300 flex items-center overflow-x-auto no-scrollbar scroll-smooth px-3 py-2 gap-2 shadow-2xl safe-bottom text-slate-800">
        <Link 
          href="/" 
          className="h-10 w-10 rounded-xl overflow-hidden border border-sky-300 shrink-0 shadow-2xs hover:border-brand-blue transition-all flex items-center justify-center bg-white p-0.5"
          title="Home"
        >
          <img src="/icon.jpeg" alt="Logo" className="h-full w-full object-cover rounded-lg" />
        </Link>

        {visibleNavItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`
                h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200
                ${active
                  ? "bg-gradient-to-br from-brand-blue to-brand-blue-deep text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-brand-blue hover:bg-white/80"}
              `}
            >
              {item.icon}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          title="Log Out"
          className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </nav>
    </>
  );
}
