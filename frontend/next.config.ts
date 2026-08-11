import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

try {
  const srcFile = path.resolve(__dirname, "src/app/ads/campaigns/create/GenericCampaignFlow.tsx");
  const destFile = path.resolve(__dirname, "src/app/ads/campaigns/create/no-guidance/search/page.tsx");
  if (fs.existsSync(srcFile)) {
    let content = fs.readFileSync(srcFile, "utf-8");
    content = content.replace(
      "export default function GenericCampaignFlowPage({ objective, type }: CampaignFlowProps) {",
      `export default function NoGuidanceSearchPage() {
  const objective = "no-guidance";
  const type = "search";`
    );
    fs.writeFileSync(destFile, content);
    console.log("Copied GenericCampaignFlow.tsx to no-guidance/search successfully.");
  }
} catch (e) {
  console.error("Failed to copy:", e);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.76.110.172', 'localhost:3000'],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
