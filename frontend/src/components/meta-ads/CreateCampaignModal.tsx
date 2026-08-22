"use client";
import { useState } from "react";
import {
  X, Megaphone, MousePointerClick, MessageSquare, Filter, Users, Tag,
  Target, ArrowUpRight, Check
} from "lucide-react";

interface CreateCampaignModalProps {
  onClose: () => void;
  onContinue: (objective: string) => void;
}

const OBJECTIVES = [
  {
    id: "OUTCOME_AWARENESS",
    name: "Awareness",
    icon: Megaphone,
    desc: "Show your ads to people most likely to remember them.",
    previewTitle: "Awareness",
    previewDesc: "Reach the maximum number of people who are likely to remember your brand, video content, or store location.",
    tags: ["Reach", "Brand awareness", "Video views", "Store location awareness"],
  },
  {
    id: "OUTCOME_TRAFFIC",
    name: "Traffic",
    icon: MousePointerClick,
    desc: "Send people to a destination like your website or WhatsApp.",
    previewTitle: "Traffic",
    previewDesc: "Send people to a destination, such as your website, shop, landing page, or WhatsApp chat.",
    tags: ["Link clicks", "Landing page views", "Messenger and WhatsApp", "Calls"],
  },
  {
    id: "OUTCOME_ENGAGEMENT",
    name: "Engagement",
    icon: MessageSquare,
    desc: "Get more WhatsApp messages, video views, or page likes.",
    previewTitle: "Engagement",
    previewDesc: "Get more WhatsApp messages, post engagement, video views, Page likes, or event responses.",
    tags: ["Messenger, Instagram and WhatsApp", "Video views", "Post engagement", "Conversions"],
  },
  {
    id: "OUTCOME_LEADS",
    name: "Leads",
    icon: Filter,
    desc: "Collect leads for your business via instant forms & WhatsApp.",
    previewTitle: "Leads",
    previewDesc: "Collect leads for your business or brand through Meta Click-to-WhatsApp ads and instant lead forms.",
    tags: ["Website and instant forms", "Instant forms", "Messenger, Instagram and WhatsApp", "Calls"],
  },
  {
    id: "OUTCOME_APP_PROMOTION",
    name: "App promotion",
    icon: Users,
    desc: "Find new people to install and use your mobile app.",
    previewTitle: "App promotion",
    previewDesc: "Find new people to install your mobile app and continue using it.",
    tags: ["App installs", "App events"],
  },
  {
    id: "OUTCOME_SALES",
    name: "Sales",
    icon: Tag,
    desc: "Find people likely to purchase your products or services.",
    previewTitle: "Sales",
    previewDesc: "Find people likely to purchase your products or services online or via direct messaging.",
    tags: ["Conversions", "Catalog sales", "Messenger, Instagram and WhatsApp", "Calls"],
  },
];

export default function CreateCampaignModal({
  onClose,
  onContinue,
}: CreateCampaignModalProps) {
  const [campObjective, setCampObjective] = useState<string>("OUTCOME_ENGAGEMENT");

  const selectedObj = OBJECTIVES.find((o) => o.id === campObjective) || OBJECTIVES[0];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal (Clean Light Theme) */}
      <div className="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] w-full max-w-3xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                Step 1 of 2
              </span>
              <h3 className="font-bold text-slate-900 text-base">Step 1: Choose a Campaign Objective</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select your campaign outcome. Parameters in Step 2 will adapt specifically to your chosen objective.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Objective Cards */}
            <div className="space-y-2.5">
              {OBJECTIVES.map((obj) => {
                const Icon = obj.icon;
                const isSelected = campObjective === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={() => setCampObjective(obj.id)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-slate-900 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                      isSelected ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-500 border border-slate-200"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${isSelected ? "text-blue-950" : "text-slate-900"}`}>{obj.name}</p>
                        {isSelected && <Check className="h-4 w-4 text-blue-600 stroke-[2.5]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{obj.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Preview Card (Right Side) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Target className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-slate-900 text-sm">
                  {selectedObj.previewTitle}
                </h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {selectedObj.previewDesc}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Good for:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedObj.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href="https://www.facebook.com/business/help/1438417719785200"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-bold"
              >
                About campaign objectives <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onContinue(campObjective)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            Continue to {selectedObj.name} Setup →
          </button>
        </div>
      </div>
    </div>
  );
}
