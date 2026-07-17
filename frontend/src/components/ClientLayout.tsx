"use client";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";

/** Routes that should render without the app shell (sidebar etc.) */
const PUBLIC_ROUTES = ["/", "/privacy", "/terms"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    // Public marketing / legal pages — render children directly, no sidebar
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
