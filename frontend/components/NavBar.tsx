"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Compass, Search, Menu, X } from "lucide-react";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/countries?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const navLinks = [
    { href: "/countries", label: "国一覧", match: (p: string) => p.startsWith("/countries") },
    { href: "/countries?region=Asia", label: "アジア", match: (p: string) => p === "/countries?region=Asia" },
    { href: "/countries?region=Europe", label: "ヨーロッパ", match: (p: string) => p === "/countries?region=Europe" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0F1923]/75 backdrop-blur-xl shadow-[0_1px_0_rgba(200,169,110,0.08)]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Compass className="h-6 w-6 text-[#C8A96E] transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-bold text-lg tracking-widest text-[#F5F5F0]">
              KANTA
            </span>
          </Link>

          {/* 検索バー（デスクトップ） */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-sm items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 focus-within:border-[#C8A96E]/40 focus-within:bg-white/[0.06] transition-all duration-200"
          >
            <Search className="h-4 w-4 text-[#8899AA] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="国を検索..."
              className="flex-1 bg-transparent text-sm text-[#F5F5F0] placeholder:text-[#8899AA] outline-none"
            />
          </form>

          {/* ナビゲーションリンク（デスクトップ） */}
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors duration-200 ${
                  link.match(pathname)
                    ? "text-[#C8A96E]"
                    : "text-[#8899AA] hover:text-[#F5F5F0]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="sm:hidden text-[#8899AA] hover:text-[#F5F5F0] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/[0.06] bg-[#0F1923]/90 backdrop-blur-xl px-4 py-3 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2">
            <Search className="h-4 w-4 text-[#8899AA] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="国を検索..."
              className="flex-1 bg-transparent text-sm text-[#F5F5F0] placeholder:text-[#8899AA] outline-none"
            />
          </form>
          <nav className="flex flex-col gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-2 py-1.5 rounded-md transition-colors duration-200 ${
                  link.match(pathname)
                    ? "text-[#C8A96E] font-medium"
                    : "text-[#8899AA] hover:text-[#F5F5F0]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
