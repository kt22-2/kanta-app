import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "KANTA - 世界一周旅行者向け情報アプリ",
  description: "安全情報・入国要件・観光スポット情報を提供する世界一周旅行者向けアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen bg-[#0F1923] text-[#F5F5F0] antialiased">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
