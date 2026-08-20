"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Building2, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"admin" | "super_admin">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          loginType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Invalid credentials.");
      }

      const user = data.user;
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("organization_id", user.organizationId);
      localStorage.setItem("user_name", user.name || user.email);
      if (user.enabledModules) {
        localStorage.setItem("enabled_modules", JSON.stringify(user.enabledModules));
      }

      if (user.role === "super_admin") {
        router.push("/admin");
      } else {
        router.push("/whatsapp");
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans text-slate-900 overflow-hidden select-none">
      {/* Brand Gradient Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-200/40 via-blue-100/30 to-orange-100/20 blur-3xl pointer-events-none -z-10" />

      {/* Main Login Box */}
      <div className="w-full max-w-[420px] space-y-6">
        
        {/* Brand Logo & Title Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group cursor-pointer">
            <div className="h-16 w-16 mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-md shadow-sky-500/10 group-hover:scale-105 group-hover:border-sky-500 transition-all bg-white p-1">
              <img src="/icon.jpeg" alt="Jisnu CRM Brand Logo" className="h-full w-full object-cover rounded-[12px]" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Jisnu CRM</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Sign in to your organization workspace</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
          
          {/* Tab Selector (Client Portal vs Super Admin) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginType("admin");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                loginType === "admin"
                  ? "bg-white text-sky-700 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Building2 className={`h-4 w-4 ${loginType === "admin" ? "text-sky-600" : "text-slate-400"}`} />
              <span>Client Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType("super_admin");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                loginType === "super_admin"
                  ? "bg-white text-orange-700 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Shield className={`h-4 w-4 ${loginType === "super_admin" ? "text-orange-500" : "text-slate-400"}`} />
              <span>Super Admin</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={loginType === "super_admin" ? "superadmin@automationcrm.com" : "admin@client.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-900 text-xs rounded-xl pl-10 pr-10 py-2.5 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Brand Theme Primary Button (#0284C7 Sky Blue) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-600/25 transition-all text-xs mt-6 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : loginType === "super_admin" ? "Access Super Admin Console" : "Log In to Workspace"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Org Isolation Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Secure Multi-Tenant Scoped Session</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Powered by Jisnu CRM Multi-Tenant Engine &copy; 2026
        </p>

      </div>
    </div>
  );
}
