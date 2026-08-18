"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Building2, Lock, Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"admin" | "super_admin">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (loginType === "admin" && !orgId.trim()) {
        throw new Error("Organization ID is required for Client Portal login");
      }

      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          loginType,
          orgId: orgId.trim(),
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 p-0.5 shadow-xl shadow-primary/20">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Automation CRM Portal</h1>
            <p className="text-sm text-slate-400 mt-1">Multi-Tenant Marketing & Messaging Automation</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                loginType === "admin"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="h-4 w-4 text-primary" />
              <span>Client Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginType("super_admin")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                loginType === "super_admin"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Super Admin</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder={loginType === "super_admin" ? "superadmin@automationcrm.com" : "admin@client.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-primary text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-primary text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
                />
              </div>
            </div>

            {loginType === "admin" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Organization ID <span className="text-primary font-normal">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. demo-org-123 or client UUID"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-primary text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all text-sm mt-6"
            >
              <span>{loading ? "Authenticating..." : loginType === "super_admin" ? "Access Super Admin Console" : "Log In to Workspace"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Powered by Automation CRM Multi-Tenant Engine &copy; 2026
        </p>

      </div>
    </div>
  );
}
