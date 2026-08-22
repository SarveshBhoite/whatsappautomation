"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";

interface RefreshProfileButtonProps {
  organizationId?: string;
  onSuccess?: () => void;
  onError?: (err: string) => void;
  className?: string;
}

export function RefreshProfileButton({
  organizationId = "",
  onSuccess,
  onError,
  className
}: RefreshProfileButtonProps) {
  const [syncing, setSyncing] = useState(false);

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/linkedin/sync`, {
        method: "POST",
        headers: { "x-organization-id": organizationId }
      });
      const data = await res.json();

      if (res.ok) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError(data.error || "Failed to sync profile");
      }
    } catch (err: any) {
      if (onError) onError(err.message || "Network error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={syncing}
      className={
        className ||
        "px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
      }
    >
      <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-blue-400" : ""}`} />
      {syncing ? "Refreshing..." : "Refresh Profile"}
    </button>
  );
}
