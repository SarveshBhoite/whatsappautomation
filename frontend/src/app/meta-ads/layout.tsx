import React, { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function MetaAdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-medium">
          Loading Meta Ads Manager...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
