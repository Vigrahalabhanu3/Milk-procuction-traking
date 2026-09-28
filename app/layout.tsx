import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0B5D3B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dairyflow.com"),
  title: "DairyFlow — Smart Milk Management for Modern Dairy Farms",
  description: "Track milk production, monitor quality, manage payments, and understand dairy performance from one simple platform.",
  manifest: "/manifest.json",
  keywords: ["dairy management", "milk collection", "milk fat test", "dairy cooperative", "dairy SaaS", "milk payout", "dairy PWA"],
  authors: [{ name: "DairyFlow Tech" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DairyFlow",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/favicon-32x32.png",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "DairyFlow — Smart Milk Management for Modern Dairy Farms",
    description: "Track milk production, monitor quality, manage payments, and understand dairy performance from one simple platform.",
    url: "https://dairyflow.com",
    siteName: "DairyFlow",
    images: [
      {
        url: "https://res.cloudinary.com/dzu7g2yts/image/upload/v1790573800/ChatGPT_Image_Sep_28_2026_10_31_10_AM_ts1tni.png",
        width: 1254,
        height: 1254,
        alt: "DairyFlow Official Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DairyFlow" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-[#FAFCF8] text-[#17231D] antialiased selection:bg-[#3A8F3D]/20 selection:text-[#0B5D3B]">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <PwaRegister />
              <PwaInstallPrompt />
              {children}
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
