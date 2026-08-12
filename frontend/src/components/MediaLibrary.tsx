"use client";

import React, { useState } from "react";
import { Image as ImageIcon, FileText, Video, Folder, Search, Upload, Tag, ExternalLink } from "lucide-react";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "LOGO";
  size: string;
  tags: string[];
  createdAt: string;
}

const SAMPLE_ASSETS: MediaAsset[] = [
  { id: "1", name: "Corporate Logo Dark.png", url: "https://media.licdn.com/dms/image/v2/D4D03AQEgN7t-O_27RQ/profile-displayphoto-shrink_800_800/B4DZRzCOOXHcAc-/0/1737096750397?e=1787184000&v=beta&t=6xadld4GJnE_8gbg7khAZ1xw0QS6YjxCGEx_eKYvkRg", type: "LOGO", size: "140 KB", tags: ["Branding", "Logo"], createdAt: "2026-07-28" },
  { id: "2", name: "CRM Product Banner.jpg", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", type: "IMAGE", size: "1.2 MB", tags: ["Banner", "Marketing"], createdAt: "2026-07-29" },
  { id: "3", name: "Q3 Business Strategy.pdf", url: "#", type: "DOCUMENT", size: "3.4 MB", tags: ["Strategy", "PDF"], createdAt: "2026-07-30" }
];

interface MediaLibraryProps {
  onSelectMedia?: (url: string) => void;
}

export function MediaLibrary({ onSelectMedia }: MediaLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>(SAMPLE_ASSETS);

  const filteredAssets = assets.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
            Central Media Asset Library ({assets.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={() => alert("Upload asset dialog opened.")}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" /> Upload Asset
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
        <Search className="h-4 w-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search media assets by name or tag..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 truncate max-w-[140px]">{asset.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{asset.size}</span>
              </div>
              {asset.type === "IMAGE" || asset.type === "LOGO" ? (
                <img src={asset.url} alt={asset.name} className="h-24 w-full object-cover rounded-lg border border-slate-800" />
              ) : (
                <div className="h-24 w-full bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-slate-500">
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-850">
              <div className="flex items-center gap-1 flex-wrap">
                {asset.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
              {onSelectMedia && (
                <button
                  type="button"
                  onClick={() => onSelectMedia(asset.url)}
                  className="text-[11px] font-semibold text-blue-400 hover:underline cursor-pointer"
                >
                  Use →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
