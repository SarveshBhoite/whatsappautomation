"use client";

import React, { Suspense } from "react";
import PublicReviewFunnel from "@/components/PublicReviewFunnel";

export default function PublicReviewSubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-mesh-canvas flex items-center justify-center text-slate-600">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <span className="text-xs font-semibold text-slate-500">Loading review portal...</span>
          </div>
        </div>
      }
    >
      <PublicReviewFunnel />
    </Suspense>
  );
}
