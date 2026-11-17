"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Film,
  ShieldCheck,
  Key,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Save,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "";
};

export default function InstagramProfilePage({ onConfigUpdated }: { onConfigUpdated?: () => void }) {
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
    id?: string;
    instagramAccountId: string;
    pageId: string;
    pageAccessToken: string;
    webhookVerifyToken?: string;
  }>({
    instagramAccountId: "",
    pageId: "",
    pageAccessToken: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [showManualForm, setShowManualForm] = useState<boolean>(false);

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
            id: data.config.id,
            instagramAccountId: data.config.instagramAccountId || "",
            pageId: data.config.pageId || "",
            pageAccessToken: data.config.pageAccessToken || "",
            webhookVerifyToken: data.config.webhookVerifyToken || "",
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

  const handleSaveManualConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/instagram/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        await fetchProfileConfig();
        if (onConfigUpdated) onConfigUpdated();
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this Instagram account?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/instagram/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": getOrgId()
        },
        body: JSON.stringify({ accountId: config.instagramAccountId })
      });
      await fetchProfileConfig();
      if (onConfigUpdated) onConfigUpdated();
    } catch (err) {
      console.warn("Failed to disconnect Instagram:", err);
    }
  };

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
                Meta Graph v21.0
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Live Meta Graph API account details, metrics, and webhook credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProfileConfig}
            disabled={refreshing}
            className="border-slate-200 text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-pink-600" : ""}`} />
            Sync Stats
          </Button>

          {config.instagramAccountId && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>
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
                  {config.instagramAccountId
                    ? "Official Instagram Business Account connected to CRM Webhook & AI engine"
                    : "Connect your Instagram Business Account from the Settings page to view live metrics."}
                </p>
                {config.instagramAccountId && (
                  <p className="text-[11px] text-slate-400 font-mono pt-0.5">
                    Account ID: <span className="text-slate-700 font-bold">{config.instagramAccountId}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={config.instagramAccountId ? "success" : "outline"} className="text-xs shrink-0">
                {config.instagramAccountId ? "Connected & Verified" : "Not Configured"}
              </Badge>
            </div>
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

        {/* Manual Credentials Accordion */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-600" />
                Manual Credentials &amp; Webhook Setup
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                For custom Meta Developer applications or manual token configuration
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer"
            >
              {showManualForm ? "Hide" : "Show"}
            </button>
          </div>

          {showManualForm && (
            <div className="space-y-6 pt-2 animate-fadeIn">
              <form onSubmit={handleSaveManualConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Business Account ID</label>
                  <input
                    type="text"
                    value={config.instagramAccountId}
                    onChange={(e) => setConfig({ ...config, instagramAccountId: e.target.value })}
                    placeholder="e.g. 17841401234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page ID</label>
                  <input
                    type="text"
                    value={config.pageId}
                    onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
                    placeholder="e.g. 10203040506070"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Access Token</label>
                  <textarea
                    value={config.pageAccessToken}
                    onChange={(e) => setConfig({ ...config, pageAccessToken: e.target.value })}
                    placeholder="Paste permanent Meta Page Access Token here"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    {saveStatus === "success" && <span className="text-emerald-600 font-bold">✓ Saved successfully!</span>}
                    {saveStatus === "error" && <span className="text-rose-600 font-bold">Failed to save credentials.</span>}
                  </span>
                  <button
                    type="submit"
                    disabled={saveStatus === "saving"}
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saveStatus === "saving" ? "Saving..." : "Save Credentials"}
                  </button>
                </div>
              </form>

              {/* Webhook Configuration Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-pink-600" />
                  Meta Developer Console Webhook Parameters
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Callback URL</span>
                    <span className="font-mono text-slate-800 text-[11px] select-all bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                      {`${BACKEND_URL}/api/webhook/instagram`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Verify Token</span>
                    <span className="font-mono text-slate-800 text-[11px] select-all bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                      {config.webhookVerifyToken || "c7b8e192-3498-4c27-b50a-3c48520bf2a1"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
