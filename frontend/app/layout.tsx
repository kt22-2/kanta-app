import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

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
    <html lang="ja">
      <body className="min-h-screen bg-[#0F1923] text-[#F5F5F0] antialiased">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
