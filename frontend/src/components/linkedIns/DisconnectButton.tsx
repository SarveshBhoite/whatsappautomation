"use client";

import React, { useState } from "react";
import { Unplug } from "lucide-react";

interface DisconnectButtonProps {
  organizationId?: string;
  onSuccess?: () => void;
  onError?: (err: string) => void;
  className?: string;
}

export function DisconnectButton({
  organizationId = "",
  onSuccess,
  onError,
  className
}: DisconnectButtonProps) {
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your LinkedIn account? OAuth tokens will be removed, but activity history will be preserved.")) {
      return;
    }

    setDisconnecting(true);
    try {
      const res = await fetch(`/api/linkedin/disconnect`, {
        method: "POST",
        headers: { "x-organization-id": organizationId }
      });
      const data = await res.json();

      if (res.ok) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError(data.error || "Failed to disconnect account");
      }
    } catch (err: any) {
      if (onError) onError(err.message || "Network error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDisconnect}
      disabled={disconnecting}
      className={
        className ||
        "px-3 py-1.5 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
      }
    >
      <Unplug className="h-3.5 w-3.5" />
      {disconnecting ? "Disconnecting..." : "Disconnect"}
    </button>
  );
}
