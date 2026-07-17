import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Jisnu CRM – Marketing Automation Platform",
    template: "%s | Jisnu CRM",
  },
  description:
    "Jisnu CRM is an all-in-one marketing automation platform. Manage WhatsApp " +
    "Business messaging, Google Ads campaigns, and Google Business Profile reviews " +
    "from a single secure dashboard.",
  applicationName: "Jisnu CRM",
  keywords: [
    "Jisnu CRM",
    "WhatsApp automation",
    "Google Ads management",
    "Google Business Profile",
    "CRM platform",
    "marketing automation",
  ],
  icons: {
    icon: "/icon.jpeg",
    apple: "/icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}


