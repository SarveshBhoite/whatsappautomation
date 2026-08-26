"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";

import { AccountProvider } from "@/context/AccountContext";

const PUBLIC_ROUTES = ["/", "/login", "/admin", "/privacy", "/terms", "/reviews/submit"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith("/reviews/submit"));
  const isFullScreen = isPublic || pathname.startsWith("/ads/campaigns/create");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = localStorage.getItem("organization_id");
      const userRole = localStorage.getItem("user_role");

      // Super admin can access /admin
      if (pathname === "/admin") {
        setCheckingAuth(false);
        return;
      }

      // Public landing and auth pages
      if (isPublic) {
        setCheckingAuth(false);
        return;
      }

      // If accessing inner CRM modules without logged-in org, redirect to /login
      if (!orgId) {
        router.replace("/login");
      } else {
        setCheckingAuth(false);
      }
    }
  }, [pathname, isPublic, router]);

  if (isPublic) {
    // Render full screen without app sidebar for landing & auth pages
    return <AccountProvider>{children}</AccountProvider>;
  }

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <span className="text-xs font-semibold">Loading organization session...</span>
        </div>
      </div>
    );
  }

  return (
    <AccountProvider>
      <div className="flex h-[100dvh] w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
        <AppSidebar />
        {/* Page content fills the remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50 text-slate-900">
          {children}
        </div>
      </div>
    </AccountProvider>
  );
}

