import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

try {
  const srcFile = path.resolve(__dirname, "src/app/ads/campaigns/create/display/page.tsx");
  const destFile = path.resolve(__dirname, "src/app/ads/campaigns/create/awareness/display/page.tsx");
  if (fs.existsSync(srcFile)) {
    let content = fs.readFileSync(srcFile, "utf-8");
    
    // Rename component
    content = content.replace(
      "export default function DisplayCampaignCreatePage() {",
      "export default function YouTubeDisplayPage() {"
    );

    // Update Header
    content = content.replace(
      `<span className="text-sm font-semibold text-slate-200">Display Campaign Setup</span>`,
      `<span className="text-sm font-semibold text-slate-200">YouTube • Display</span>`
    );

    fs.writeFileSync(destFile, content);
    console.log("Copied display/page.tsx to awareness/display successfully.");
  }
} catch (e) {
  console.error("Failed to copy:", e);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.76.110.172', 'localhost:3000'],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
