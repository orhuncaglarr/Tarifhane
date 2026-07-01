import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ADSENSE_CLIENT_ID, SITE_URL } from "@/lib/config";
import "./globals.css";

const codexDisplay = Cormorant_Garamond({
  variable: "--font-codex-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const codexText = EB_Garamond({
  variable: "--font-codex-text",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tarifhane - Türkçe Yemek Tarifleri",
    template: "%s | Tarifhane",
  },
  description: "Türkçe yemek tarifleri veritabanı: çorbalar, ana yemekler, tatlılar ve daha fazlası.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${codexDisplay.variable} ${codexText.variable}`}>
      <body>
        {ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
