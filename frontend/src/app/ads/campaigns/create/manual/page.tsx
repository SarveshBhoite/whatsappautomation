"use client";

import { Suspense } from "react";
import CampaignCreatePage from "../page";

export default function ManualCampaignCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
          Loading Campaign Studio...
        </div>
      }
    >
      <CampaignCreatePage />
    </Suspense>
  );
}
