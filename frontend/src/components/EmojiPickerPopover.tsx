"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";

// Dynamically import EmojiPicker to prevent SSR hydration mismatches
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="w-[320px] h-[380px] bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold animate-pulse shadow-xl">
      Loading Emoji Library...
    </div>
  ),
});

interface EmojiPickerPopoverProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  theme?: "emerald" | "pink" | "slate";
  className?: string;
}

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  onEmojiSelect,
  onClose,
  theme = "emerald",
  className = "bottom-16 left-4",
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const themeBorderColor =
    theme === "pink"
      ? "border-pink-200 shadow-pink-500/10"
      : theme === "emerald"
      ? "border-emerald-200 shadow-emerald-500/10"
      : "border-slate-200 shadow-slate-500/10";

  return (
    <div
      ref={popoverRef}
      className={`absolute ${className} z-50 animate-fadeIn transition-all shadow-2xl rounded-2xl overflow-hidden border ${themeBorderColor}`}
    >
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          if (emojiData && emojiData.emoji) {
            onEmojiSelect(emojiData.emoji);
          }
        }}
        width={340}
        height={400}
        theme={Theme.LIGHT}
        lazyLoadEmojis={true}
        searchPlaceHolder="Search emojis..."
        previewConfig={{
          showPreview: false,
        }}
        skinTonesDisabled={false}
      />
    </div>
  );
};

export default EmojiPickerPopover;
