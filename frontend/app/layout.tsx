import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "KANTA TRAVEL🧳 - 世界一周旅行者向け情報アプリ",
  description: "安全情報・入国要件・観光スポット情報を提供する世界一周旅行者向けアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-background focus:font-bold">
          メインコンテンツへスキップ
        </a>
        <NavBar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
