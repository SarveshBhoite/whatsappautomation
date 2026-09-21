"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Film,
  ShieldCheck,
  Key,
  RefreshCw,
  Check,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "demo-org-123";
};

export default function InstagramProfilePage() {
  const [liveProfile, setLiveProfile] = useState<{
    followers_count?: number;
    media_count?: number;
    username?: string;
    name?: string;
    profile_picture_url?: string;
    biography?: string;
  }>({});
  const [imgError, setImgError] = useState<boolean>(false);
  const [config, setConfig] = useState<{
    instagramAccountId: string;
    accessToken: string;
  }>({
    instagramAccountId: "",
    accessToken: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchProfileConfig = async () => {
    setRefreshing(true);
    setImgError(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/config`, {
        headers: { "x-organization-id": getOrgId() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig({
            instagramAccountId: data.config.instagramAccountId || "",
            accessToken: data.config.pageAccessToken || "",
          });
        }
        if (data.liveProfile) {
          setLiveProfile(data.liveProfile);
        } else if (data.config?.profilePic) {
          setLiveProfile({
            profile_picture_url: data.config.profilePic,
            username: data.config.username,
            name: data.config.name,
          });
        } else {
          setLiveProfile({});
        }
      }
    } catch (err) {
      console.error("Failed to fetch IG profile config:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileConfig();
  }, []);

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 shadow-2xs">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Instagram Profile Overview
              <Badge variant="brand" className="text-[10px] font-mono">
                Verified Business
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Live Meta Graph API profile metrics and connected business account details
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchProfileConfig}
          disabled={refreshing}
          className="border-slate-200 text-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-pink-600" : ""}`} />
          Sync Profile Stats
        </Button>
      </header>

      {/* Main Page Layout */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Profile Card Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="h-18 w-18 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 p-0.5 shadow-md shadow-pink-500/15 shrink-0 overflow-hidden relative">
                {liveProfile.profile_picture_url && !imgError ? (
                  <img
                    src={liveProfile.profile_picture_url}
                    alt={liveProfile.name || "Instagram Profile"}
                    className="h-full w-full rounded-[14px] object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center text-pink-600 font-black text-2xl">
                    {liveProfile.name ? liveProfile.name[0].toUpperCase() : liveProfile.username ? liveProfile.username[0].toUpperCase() : "IG"}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    {liveProfile.name || (config.instagramAccountId ? "Connected Business Account" : "No Instagram Account Linked")}
                  </h2>
                  {liveProfile.username && (
                    <a
                      href={`https://instagram.com/${liveProfile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100/80 border border-pink-200/80 px-2 py-0.5 rounded-full transition-colors font-mono"
                    >
                      @{liveProfile.username}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>

                {liveProfile.biography && (
                  <p className="text-xs text-slate-600 max-w-xl line-clamp-2 leading-relaxed">
                    {liveProfile.biography}
                  </p>
                )}

                <p className="text-xs text-slate-500">
                  {config.instagramAccountId ? "Official Instagram Business Account connected to CRM Webhook engine" : "Link your Meta Page and Instagram Account in Settings to view metrics."}
                </p>
                {config.instagramAccountId && (
                  <p className="text-[11px] text-slate-400 font-mono pt-0.5">
                    Account ID: <span className="text-slate-700 font-bold">{config.instagramAccountId}</span>
                  </p>
                )}
              </div>
            </div>
            <Badge variant={config.instagramAccountId ? "success" : "outline"} className="text-xs shrink-0">
              {config.instagramAccountId ? "Connected & Verified" : "Not Configured"}
            </Badge>
          </div>

          {/* Account Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1 shadow-2xs">
              <Users className="h-4 w-4 text-pink-600 mx-auto" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Followers</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {liveProfile.followers_count !== undefined ? liveProfile.followers_count.toLocaleString() : "—"}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1 shadow-2xs">
              <Film className="h-4 w-4 text-purple-600 mx-auto" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Media Posts</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {liveProfile.media_count !== undefined ? liveProfile.media_count.toLocaleString() : "—"}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1 shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Status</span>
              <span className={`text-sm font-bold block pt-1 ${config.instagramAccountId ? "text-emerald-700" : "text-slate-400"}`}>
                {config.instagramAccountId ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1 shadow-2xs">
              <Key className="h-4 w-4 text-amber-600 mx-auto" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Meta API</span>
              <span className="text-sm font-bold text-amber-700 block pt-1">Graph v21.0</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
