"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, X, MessageSquare, Clock, UserCheck } from "lucide-react";

export interface PendingApprovalItem {
  id: string;
  summary: string;
  mediaUrl?: string | null;
  scheduledAt?: string | Date | null;
  approvalStatus?: string | null; // PENDING_APPROVAL, APPROVED, REJECTED
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: string | Date;
}

interface ApprovalWorkflowQueueProps {
  organizationId?: string;
  pendingPosts: PendingApprovalItem[];
  userRole?: string; // Owner, Admin, Manager, Content Creator, Viewer
  onRefresh?: () => void;
}

export function ApprovalWorkflowQueue({
  organizationId = "demo-org-123",
  pendingPosts,
  userRole = "Admin",
  onRefresh
}: ApprovalWorkflowQueueProps) {
  const [actionId, setActionId] = useState<string | null>(null);

  const canApprove = ["Owner", "Admin", "Manager"].includes(userRole);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/linkedin/schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({ id, approvalStatus: "APPROVED", approvedBy: userRole })
      });
      if (res.ok && onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Error approving post: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter reason for rejecting this post proposal:");
    if (reason === null) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/linkedin/schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId
        },
        body: JSON.stringify({ id, approvalStatus: "REJECTED", rejectionReason: reason })
      });
      if (res.ok && onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Error rejecting post: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            Post Approval Workflow Queue ({pendingPosts.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Role: <strong className="text-blue-400">{userRole}</strong>
        </span>
      </div>

      {pendingPosts.length > 0 ? (
        <div className="space-y-3">
          {pendingPosts.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.approvalStatus === "APPROVED"
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/80"
                        : item.approvalStatus === "REJECTED"
                        ? "bg-red-950/60 text-red-400 border-red-800/80"
                        : "bg-amber-950/60 text-amber-400 border-amber-800/80"
                    }`}
                  >
                    {item.approvalStatus || "PENDING_APPROVAL"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{item.summary}</p>
                {item.rejectionReason && (
                  <p className="text-[11px] text-red-400 bg-red-950/30 p-1.5 rounded border border-red-800/40">
                    Rejection note: {item.rejectionReason}
                  </p>
                )}
              </div>

              {canApprove && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(item.id)}
                    disabled={actionId === item.id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(item.id)}
                    disabled={actionId === item.id}
                    className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-900/30 flex flex-col items-center gap-2">
          <UserCheck className="h-8 w-8 text-slate-600" />
          <span>No posts awaiting manager approval.</span>
        </div>
      )}
    </div>
  );
}
