"use client";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";

const FULLSCREEN_ROUTES = ["/", "/login", "/admin", "/privacy", "/terms", "/ads/campaigns/create"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = FULLSCREEN_ROUTES.some(r => pathname === r || pathname.startsWith("/ads/campaigns/create"));

  if (isFullScreen) {
    // Render full screen without app sidebar
    return <>{children}</>;
  }

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      <AppSidebar />
      {/* Page content fills the remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
