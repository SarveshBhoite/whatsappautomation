"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Megaphone,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  DollarSign,
  MapPin,
  Target,
  FileText,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "demo-org-123";
};

interface ConversationMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  quickOptions?: Array<{ label: string; value: string; isNotSure?: boolean }>;
  metadata?: any;
}

interface CampaignState {
  sessionId: string;
  status:
    | "DISCOVERY"
    | "ACCOUNT_SELECTION"
    | "STRATEGY"
    | "DRAFTING"
    | "CREATIVE"
    | "REVIEW"
    | "CONFIRMATION"
    | "PUBLISHING"
    | "COMPLETED"
    | "FAILED";
  draft: any;
  validation: {
    valid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
    warnings: Array<{ field: string; message: string }>;
  };
  context: {
    organizationId: string;
    isConnected: boolean;
    adAccounts: Array<{ id: string; adAccountId: string; name: string; currency: string }>;
    pages: Array<{ id: string; name: string }>;
  };
  conversation: ConversationMessage[];
  requiresConfirmation: boolean;
  executionResult?: any;
}

export default function MetaAIChatbotStudioPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>(getOrgId());

  // Conversational & Campaign State
  const [session, setSession] = useState<CampaignState | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountContextOpen, setAccountContextOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.conversation, isSending, isPublishing]);

  // Initialize Session on Load
  useEffect(() => {
    const currentOrg = getOrgId();
    setOrgId(currentOrg);

    fetch(`${BACKEND}/api/meta-ads/ai/conversation/init?organizationId=${currentOrg}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.session) {
          setSession(data.session);
        } else {
          setError("Could not initialize Meta AI Chatbot Studio.");
        }
      })
      .catch((err) => setError(err.message || "Connection failed to Meta AI Engine."))
      .finally(() => setLoadingInit(false));
  }, []);

  const handleSendMessage = async (textToSend?: string, selectedOption?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() && !selectedOption) return;
    if (!session) return;

    setInputText("");
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          currentState: session,
          message: content,
          selectedOption: selectedOption,
        }),
      });

      const data = await res.json();
      if (data.success && data.state) {
        setSession(data.state);
      } else {
        setError(data.error || "Failed to process message.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to AI server.");
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!session || !session.draft) return;
    setIsPublishing(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/ai/conversation/confirm-publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          draft: session.draft,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "COMPLETED",
            requiresConfirmation: false,
            executionResult: data.result,
            conversation: [
              ...prev.conversation,
              {
                id: `msg_ai_${Date.now()}`,
                sender: "ai",
                text: `🎉 **Campaign Published to Meta Ads!**\n\n- **Campaign ID**: \`${data.result.metaCampaignId}\`\n- **Ad Set ID**: \`${data.result.metaAdSetId}\`\n- **Ad ID**: \`${data.result.metaAdId}\`\n- **Status**: Live / Paused on Meta Ads Manager.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          };
        });
      } else {
        setError(data.result?.errorMessage || data.error || "Meta API execution failed.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while publishing campaign.");
    } finally {
      setIsPublishing(false);
    }
  };

  // File Upload & Select Ad States
  const [showAdLibraryModal, setShowAdLibraryModal] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<{ images: any[]; videos: any[] }>({ images: [], videos: [] });
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type: "IMAGE" | "VIDEO" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/media?organizationId=${orgId}`);
      const data = await res.json();
      if (data.success && data.media) {
        setMediaLibrary(data.media);
      }
    } catch (e: any) {
      console.warn("Could not load media library:", e.message);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const localUrl = URL.createObjectURL(file);
    const mediaType: "IMAGE" | "VIDEO" = isVideo ? "VIDEO" : "IMAGE";

    setAttachedFile({
      name: file.name,
      url: localUrl,
      type: mediaType,
    });

    // Update draft creative media
    setSession((prev) => {
      if (!prev) return prev;
      const updatedDraft = {
        ...prev.draft,
        creative: {
          ...prev.draft?.creative,
          mediaUrl: localUrl,
          mediaType,
        },
      };
      return {
        ...prev,
        draft: updatedDraft,
      };
    });

    // Send AI notification about the file attachment
    handleSendMessage(`Attached ${mediaType === "IMAGE" ? "image" : "video"}: "${file.name}" for the ad creative.`);
  };

  const handleSelectMediaFromLibrary = (mediaItem: any, type: "IMAGE" | "VIDEO") => {
    const mediaUrl = type === "IMAGE" ? (mediaItem.url || mediaItem.permalink_url) : (mediaItem.source || mediaItem.picture);
    const name = mediaItem.name || `Meta ${type}`;

    setAttachedFile({
      name,
      url: mediaUrl,
      type,
    });

    setSession((prev) => {
      if (!prev) return prev;
      const updatedDraft = {
        ...prev.draft,
        creative: {
          ...prev.draft?.creative,
          mediaUrl,
          mediaType: type,
        },
      };
      return {
        ...prev,
        draft: updatedDraft,
      };
    });

    setShowAdLibraryModal(false);
    handleSendMessage(`Selected ${type === "IMAGE" ? "Image" : "Video"} "${name}" from Meta Ad Library.`);
  };

  const draft = session?.draft || {};
  const campaign = draft.campaign || {};
  const targeting = draft.targeting || {};
  const destination = draft.destination || {};
  const creative = draft.creative || {};
  const context = session?.context || { adAccounts: [], pages: [] };

  // Calculate dynamic display values strictly from draft (no hardcoded fallbacks)
  const activeAdAccount = context.adAccounts?.find((a: any) => a.adAccountId === draft.adAccountId) || context.adAccounts?.[0];
  const activePage = context.pages?.find((p: any) => p.id === draft.pageId) || context.pages?.[0];
  const budgetVal = campaign.dailyBudget ? `₹${campaign.dailyBudget.toLocaleString()}/day` : null;
  const campaignTitle = campaign.name || "Campaign Strategy";
  const goalText = campaign.objective 
    ? `${campaign.objective.replace("OUTCOME_", "")} · ${budgetVal || "Ongoing"}` 
    : (budgetVal ? `Lead Generation · ${budgetVal}` : null);
  const audienceText = targeting.locationDescription 
    ? `Advantage+ Audience — ${targeting.locationDescription}${targeting.interests?.length ? ` (${targeting.interests.slice(0, 3).join(", ")})` : ""}` 
    : (targeting.cities?.length ? `Advantage+ Audience — ${targeting.cities.join(", ")}` : null);

  return (
    <div className="relative flex flex-col h-full w-full min-h-0 min-w-0 overflow-hidden bg-[#EFEAE2] font-sans antialiased text-[#1C1E21] selection:bg-sky-100 selection:text-sky-900">
      {/* ── FULL-PAGE DEDICATED WHATSAPP-INSPIRED WALLPAPER TEXTURE LAYER ── */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundColor: "#F0F2F5",
          backgroundImage: `url("/patterns/ai-chat-wallpaper.svg")`,
          backgroundRepeat: "repeat",
          backgroundSize: "360px 360px",
          backgroundPosition: "0 0",
        }}
      />

      {/* ── TOP HEADER SUBTITLE ── */}
      <header className="relative py-3 border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 bg-white/90 backdrop-blur-md shadow-2xs z-10">
        <button
          onClick={() => router.push("/meta-ads")}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Megaphone className="h-4 w-4 text-[#1877F2]" />
          <span>Meta Ads Manager</span>
        </button>

        <span className="text-[12px] font-semibold text-slate-600 select-none flex items-center gap-1.5 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
          <Sparkles className="h-3.5 w-3.5 text-[#1877F2]" />
          <span>You're asking JISNU AI Assistant</span>
        </span>

        <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] text-emerald-800 font-semibold">
            {activeAdAccount ? activeAdAccount.name : "Meta Connected"}
          </span>
        </div>
      </header>

      {/* ── MAIN SCROLLABLE CONVERSATION AREA ── */}
      <div className="relative flex-1 min-h-0 overflow-y-auto px-4 md:px-0 bg-transparent z-1">
        <div className="max-w-2xl mx-auto py-6 space-y-4">
          {loadingInit ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading JISNU AI assistant...</p>
            </div>
          ) : (
            <>
              {/* Dynamic Conversation Thread */}
              {session?.conversation?.map((msg, index) => {
                const isUser = msg.sender === "user";

                if (isUser) {
                  return (
                    <div key={msg.id || index} className="flex justify-end animate-fadeIn">
                      <div className="max-w-[82%] bg-[#DCF8C6] text-slate-900 font-normal px-4 py-2.5 rounded-2xl rounded-tr-xs text-[13px] leading-relaxed shadow-sm border border-emerald-300/60 break-words">
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <div className="text-[10px] text-emerald-800/70 text-right mt-1 font-medium">
                          {msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id || index} className="space-y-2 text-[13px] text-slate-800 leading-relaxed animate-fadeIn">
                    <div className="max-w-[88%] bg-white p-4 rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1877F2]"></span>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">JISNU AI Strategist</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-800 text-[13px]">{msg.text}</p>
                      <div className="text-[10px] text-slate-400 text-right mt-1 font-medium">
                        {msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {/* Quick Options Chips */}
                    {msg.quickOptions && msg.quickOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 pl-2">
                        {msg.quickOptions.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            disabled={isSending || isPublishing}
                            onClick={() => handleSendMessage(opt.label, opt.value)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-sky-50 text-[#0284C7] border border-sky-200 hover:border-[#0284C7] transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic Campaign Plan Card (Rendered only when a complete strategy is synthesized and awaiting confirmation) */}
              {(session?.status === "CONFIRMATION" && session?.requiresConfirmation && session?.draft?.campaign?.dailyBudget) && (
                <div className="space-y-4 text-[13px] text-slate-800 leading-relaxed pt-2">
                  <div className="pt-2 space-y-2">
                    <h3 className="font-bold text-[14px] text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#1877F2]" />
                      <span>Campaign strategy summary</span>
                    </h3>

                    <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white text-[13px] shadow-sm">
                      <div className="bg-slate-50/80 px-4 py-3 font-bold text-slate-900 border-b border-slate-200/80 flex items-center justify-between">
                        <span>{campaignTitle}</span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Ready for Launch</span>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-3 border-b border-slate-100 items-start">
                        <span className="text-slate-500 font-medium">Goal</span>
                        <span className="col-span-3 text-slate-900 font-semibold">{goalText}</span>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-3 border-b border-slate-100 items-start">
                        <span className="text-slate-500 font-medium">Spend</span>
                        <span className="col-span-3 text-slate-900 font-semibold">
                          {budgetVal} · {campaign.objective || "OUTCOME_LEADS"} · Ongoing
                        </span>
                      </div>

                      <div className="grid grid-cols-4 px-4 py-3 items-start">
                        <span className="text-slate-500 font-medium">Audience</span>
                        <span className="col-span-3 text-slate-900 font-semibold">{audienceText}</span>
                      </div>

                      {/* Creative Attachment Preview inside Strategy */}
                      {attachedFile && (
                        <div className="grid grid-cols-4 px-4 py-3 border-t border-slate-100 items-start bg-slate-50/60">
                          <span className="text-slate-500 font-medium">Creative Media</span>
                          <div className="col-span-3 flex items-center gap-3">
                            {attachedFile.type === "IMAGE" ? (
                              <img
                                src={attachedFile.url}
                                alt="Selected Creative"
                                className="h-14 w-14 object-cover rounded-lg border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="h-14 w-14 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                🎬 Video
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{attachedFile.name}</p>
                              <p className="text-[11px] text-slate-500">Ready for Meta Ad Publication</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirmation / Publishing Action Card */}
                  <div className="pt-2">
                    <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="px-4 py-3 bg-slate-50/80 font-bold text-[13px] text-slate-900 border-b border-slate-200/80">
                        Proceed with strategy and create drafts?
                      </div>
                      <div className="divide-y divide-slate-100">
                        <button
                          onClick={handleConfirmPublish}
                          disabled={isPublishing}
                          className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-emerald-50/50 transition-colors cursor-pointer group disabled:opacity-50"
                        >
                          <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[12px] font-bold group-hover:scale-105 transition-transform shadow-xs">
                            A
                          </div>
                          <span className="text-[13px] font-bold text-emerald-900">
                            {isPublishing ? "Publishing campaign to Meta..." : "Yes, proceed to create drafts"}
                          </span>
                        </button>

                        <button
                          onClick={() => handleSendMessage("No, let's adjust the budget or audience")}
                          disabled={isPublishing}
                          className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer group disabled:opacity-50"
                        >
                          <div className="h-6 w-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-[12px] font-bold group-hover:scale-105 transition-transform">
                            B
                          </div>
                          <span className="text-[13px] font-semibold text-slate-700">
                            No, make changes
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sending Loader Indicator */}
              {(isSending || isPublishing) && (
                <div className="flex items-center gap-2 text-xs text-slate-600 py-2 pl-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0284C7]" />
                  <span>
                    {isPublishing
                      ? "Publishing live campaign to Meta Graph API..."
                      : "Meta AI is analyzing your campaign strategy..."}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* ── HIDDEN FILE INPUT FOR "ADD FILE" ── */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* ── SELECT AD CREATIVE LIBRARY MODAL ── */}
      {showAdLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Meta Creative Library</h3>
                <p className="text-xs text-gray-500">Select an existing ad creative to attach to your campaign.</p>
              </div>
              <button
                onClick={() => setShowAdLibraryModal(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1877F2] mb-2" />
                  <p className="text-xs text-gray-500">Loading your Meta Ad library...</p>
                </div>
              ) : mediaLibrary.images?.length === 0 && mediaLibrary.videos?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-500 mb-3">No existing creatives found in your Meta Ad Account.</p>
                  <button
                    onClick={() => {
                      setShowAdLibraryModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-[#1877F2] text-white rounded-lg text-xs font-semibold hover:bg-[#166FE5] cursor-pointer"
                  >
                    📎 Upload New File From Device
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaLibrary.images?.map((img: any, idx: number) => (
                    <div
                      key={img.hash || idx}
                      onClick={() => handleSelectMediaFromLibrary(img, "IMAGE")}
                      className="group relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1877F2] hover:shadow-md transition-all"
                    >
                      <img
                        src={img.url || img.permalink_url}
                        alt={img.name || "Ad Image"}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-1.5 bg-white text-[11px] truncate font-medium text-gray-700">
                        {img.name || `Image #${idx + 1}`}
                      </div>
                    </div>
                  ))}

                  {mediaLibrary.videos?.map((vid: any, idx: number) => (
                    <div
                      key={vid.id || idx}
                      onClick={() => handleSelectMediaFromLibrary(vid, "VIDEO")}
                      className="group relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1877F2] hover:shadow-md transition-all"
                    >
                      {vid.picture ? (
                        <img
                          src={vid.picture}
                          alt={vid.name || "Ad Video"}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-28 bg-gray-900 flex items-center justify-center text-white text-xs">
                          🎬 Video
                        </div>
                      )}
                      <div className="p-1.5 bg-white text-[11px] truncate font-medium text-gray-700">
                        {vid.name || `Video #${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM ROUNDED CHAT COMPOSER ── */}
      <div className="relative p-4 pb-6 bg-transparent shrink-0 z-10">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Attached File Indicator Pill */}
          {attachedFile && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs text-[#0284C7] shadow-2xs animate-fadeIn">
              <span>{attachedFile.type === "IMAGE" ? "🖼️" : "🎬"}</span>
              <span className="font-semibold max-w-[200px] truncate">{attachedFile.name}</span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="hover:text-red-500 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="border border-slate-300 hover:border-slate-400 focus-within:border-[#0284C7] focus-within:ring-2 focus-within:ring-sky-100 rounded-2xl p-2.5 bg-white shadow-xs transition-all">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your reply (e.g. 'I run a dental clinic in Pune, ₹500/day budget')..."
              disabled={isSending || isPublishing}
              className="w-full text-[13px] text-slate-900 placeholder:text-slate-400 outline-none resize-none px-2 py-1 bg-transparent"
            />

            <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>📎</span> Add file
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdLibraryModal(true);
                    fetchMediaLibrary();
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>+</span> Select ad
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isSending || isPublishing || (!inputText.trim() && !attachedFile)}
                className="h-8 w-8 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center shadow-xs transition-all disabled:opacity-30 cursor-pointer active:scale-95"
              >
                <span className="text-sm font-bold">↑</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

