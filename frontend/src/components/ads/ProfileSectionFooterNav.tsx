"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Loader2,
  Sparkles
} from "lucide-react";

export interface ProfileSectionFooterNavProps {
  currentTab: string;
  nextSectionName?: string;
  prevSectionName?: string;
  onSaveAndNext: () => void | Promise<void>;
  onPrevious?: () => void;
  onSaveDraft: () => void | Promise<void>;
  onApproveAndSave?: () => void | Promise<void>;
  isSaving: boolean;
  isApproved?: boolean;
  isLastSection?: boolean;
  stepNumber?: number;
  totalSteps?: number;
  className?: string;
}

export function ProfileSectionFooterNav({
  currentTab,
  nextSectionName,
  prevSectionName,
  onSaveAndNext,
  onPrevious,
  onSaveDraft,
  onApproveAndSave,
  isSaving,
  isApproved,
  isLastSection = false,
  stepNumber,
  totalSteps = 14,
  className = ""
}: ProfileSectionFooterNavProps) {
  return (
    <div
      className={`mt-8 pt-6 pb-2 border-t border-slate-200/80 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200/60 transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Previous Section Navigation */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
          {onPrevious && prevSectionName ? (
            <button
              type="button"
              onClick={onPrevious}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs group disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Previous: {prevSectionName}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Section 1 of {totalSteps}</span>
            </div>
          )}

          {stepNumber && (
            <span className="text-[11px] font-bold text-slate-400 sm:hidden">
              {stepNumber} / {totalSteps}
            </span>
          )}
        </div>

        {/* Center: Subtle Step / Sync Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Approved profile details automatically prefill AI Guided campaigns</span>
        </div>

        {/* Right: Actions (Save Draft + Save & Next) */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Save Draft Button */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Save Draft</span>
          </button>

          {/* Primary Action Button: Save & Next or Complete */}
          {isLastSection ? (
            <button
              type="button"
              onClick={onApproveAndSave || onSaveDraft}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Approve &amp; Complete Profile</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSaveAndNext}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 cursor-pointer group disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save &amp; Next{nextSectionName ? `: ${nextSectionName}` : ""}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
