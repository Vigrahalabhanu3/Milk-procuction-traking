import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dairyflow.com"),
  title: "DairyFlow — Smart Milk Management for Modern Dairy Farms",
  description: "Track milk production, monitor quality, manage payments, and understand dairy performance from one simple platform.",
  keywords: ["dairy management", "milk collection", "milk fat test", "dairy cooperative", "dairy SaaS", "milk payout"],
  authors: [{ name: "DairyFlow Tech" }],
  icons: {
    icon: "/official-logo.png",
    apple: "/official-logo.png",
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
        <link rel="icon" href="/official-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/official-logo.png" />
      </head>
      <body className="min-h-screen bg-[#FAFCF8] text-[#17231D] antialiased selection:bg-[#3A8F3D]/20 selection:text-[#0B5D3B]">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
