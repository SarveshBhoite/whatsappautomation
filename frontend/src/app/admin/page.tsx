"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Shield, Check, X, Copy, RefreshCw, Layers, Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  enabledModules: string[];
  status: string;
  users: User[];
  waConfig?: { phoneNumberId: string; wabaId: string } | null;
  gmbConfig?: { locationId: string; accountId: string } | null;
  gmailConfig?: { email: string } | null;
  linkedInConfig?: { memberName: string; companyName: string } | null;
}

const ALL_MODULES = [
  { key: "whatsapp", label: "WhatsApp Automation" },
  { key: "instagram", label: "Instagram Messaging" },
  { key: "gmb", label: "Google Business Profile" },
  { key: "gmail", label: "Gmail Auto-Reply" },
  { key: "linkedin", label: "LinkedIn Scheduler" },
  { key: "youtube", label: "YouTube Comments" },
  { key: "google_ads", label: "Google Ads Manager" },
  { key: "meta_ads", label: "Meta Ads Manager" },
  { key: "reviews", label: "Google Reviews" },
  { key: "ai_agent", label: "AI Agent Studio" },
  { key: "tools", label: "Tools Suite" },
];

export default function AdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Org Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULES.map(m => m.key));
  const [saving, setSaving] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/admin/organizations");
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newAdminEmail) return;

    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName,
          adminEmail: newAdminEmail,
          adminName: newAdminName,
          enabledModules: selectedModules,
        }),
      });

      if (!res.ok) throw new Error("Failed to create client organization");
      
      setNewOrgName("");
      setNewAdminEmail("");
      setNewAdminName("");
      setShowCreateModal(false);
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleModule = async (orgId: string, currentModules: string[], moduleKey: string) => {
    const updatedModules = currentModules.includes(moduleKey)
      ? currentModules.filter(m => m !== moduleKey)
      : [...currentModules, moduleKey];

    // Optimistic UI update
    setOrganizations(prev =>
      prev.map(org => (org.id === orgId ? { ...org, enabledModules: updatedModules } : org))
    );

    try {
      await fetch(`http://localhost:5000/api/admin/organizations/${orgId}/modules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabledModules: updatedModules }),
      });
    } catch (err) {
      console.error("Failed to update modules", err);
      fetchOrganizations();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied Organization ID: ${text}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Super Admin Console</h1>
                <p className="text-sm text-slate-400">Manage client organizations, assign credentials & toggle platform access</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrganizations}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Onboard New Client</span>
            </button>
          </div>
        </div>

        {/* Organizations Table / Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Loading Client Organizations...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 hover:border-slate-700/80 transition-all"
              >
                {/* Org Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg">
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">{org.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                          {org.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> ID: {org.id.slice(0, 8)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(org.id)}
                          className="hover:text-primary transition-colors text-slate-500 flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> Copy Full ID
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connected Accounts Indicators */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${org.waConfig?.wabaId ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                      WhatsApp {org.waConfig?.wabaId ? "✓" : "—"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${org.gmbConfig?.accountId ? "bg-blue-950/40 border-blue-800/60 text-blue-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                      GMB {org.gmbConfig?.accountId ? "✓" : "—"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${org.gmailConfig?.email ? "bg-purple-950/40 border-purple-800/60 text-purple-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                      Gmail {org.gmailConfig?.email ? "✓" : "—"}
                    </span>
                  </div>
                </div>

                {/* Enabled Modules Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5" /> Enabled Platform Modules
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {ALL_MODULES.map((m) => {
                      const isEnabled = org.enabledModules?.includes(m.key);
                      return (
                        <button
                          key={m.key}
                          onClick={() => handleToggleModule(org.id, org.enabledModules || [], m.key)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                            isEnabled
                              ? "bg-primary/10 border-primary/40 text-primary shadow-sm"
                              : "bg-slate-950/60 border-slate-800/60 text-slate-500 hover:border-slate-700"
                          }`}
                        >
                          <span>{m.label}</span>
                          {isEnabled ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Users List */}
                <div className="space-y-2 pt-2 border-t border-slate-800/40 text-xs text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span>Admins: {org.users.map(u => `${u.name || u.email} (${u.role})`).join(", ") || "No users"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Client Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Onboard New Client Organization</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Organization / Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp Digital"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Client Admin Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@acmecorp.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Admin Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-2">Enabled Sidebar Modules</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {ALL_MODULES.map((m) => {
                      const checked = selectedModules.includes(m.key);
                      return (
                        <label
                          key={m.key}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                            checked ? "bg-primary/10 border-primary/40 text-white" : "bg-slate-950 border-slate-800 text-slate-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModules([...selectedModules, m.key]);
                              } else {
                                setSelectedModules(selectedModules.filter(k => k !== m.key));
                              }
                            }}
                            className="hidden"
                          />
                          <span>{m.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-md shadow-primary/20"
                  >
                    {saving ? "Creating..." : "Create Organization"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
