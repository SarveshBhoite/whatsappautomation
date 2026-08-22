"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";

interface EnterpriseReportsProps {
  organizationId?: string;
  publishedCount?: number;
  scheduledCount?: number;
}

export function EnterpriseReports({ organizationId = "demo-org-123", publishedCount = 0, scheduledCount = 0 }: EnterpriseReportsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: "weekly-csv" | "weekly-pdf" | "monthly-excel" | "monthly-pdf" | "audit-csv") => {
    setExporting(type);
    try {
      let endpoint = "";
      switch (type) {
        case "weekly-csv":
          endpoint = "/api/reports/weekly/csv";
          break;
        case "weekly-pdf":
          endpoint = "/api/reports/weekly/pdf";
          break;
        case "monthly-excel":
          endpoint = "/api/reports/monthly/excel";
          break;
        case "monthly-pdf":
          endpoint = "/api/reports/monthly/pdf";
          break;
        case "audit-csv":
          endpoint = "/api/reports/audit/csv";
          break;
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "x-organization-id": organizationId
        }
      });

      if (!response.ok) {
        throw new Error(`Report generation server error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `report_${Date.now()}`;

      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("[REPORT DOWNLOAD ERROR]:", err.message);
      alert(`Report export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-[#0A66C2]" />
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
            Enterprise Reporting & Export Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
          PDF • Excel • CSV
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Report 1: Weekly Performance */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Weekly Executive Report</h4>
            <p className="text-[11px] text-slate-500">7-day performance summary, published count, and activity log.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("weekly-csv")}
              disabled={exporting === "weekly-csv"}
              className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> {exporting === "weekly-csv" ? "Exporting..." : "CSV"}
            </button>
            <button
              onClick={() => handleExport("weekly-pdf")}
              disabled={exporting === "weekly-pdf"}
              className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-red-600" /> {exporting === "weekly-pdf" ? "Exporting..." : "PDF"}
            </button>
          </div>
        </div>

        {/* Report 2: Monthly Campaign Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Monthly Campaign Report</h4>
            <p className="text-[11px] text-slate-500">30-day publishing history, growth trends, and engagement analysis.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("monthly-excel")}
              disabled={exporting === "monthly-excel"}
              className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> {exporting === "monthly-excel" ? "Exporting..." : "Excel"}
            </button>
            <button
              onClick={() => handleExport("monthly-pdf")}
              disabled={exporting === "monthly-pdf"}
              className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-red-600" /> {exporting === "monthly-pdf" ? "Exporting..." : "PDF"}
            </button>
          </div>
        </div>

        {/* Report 3: Audit & Compliance */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Audit & Compliance Log</h4>
            <p className="text-[11px] text-slate-500">Full audit log of login events, approvals, role changes, and API actions.</p>
          </div>
          <button
            onClick={() => handleExport("audit-csv")}
            disabled={exporting === "audit-csv"}
            className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> {exporting === "audit-csv" ? "Exporting..." : "Download Audit CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
