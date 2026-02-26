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
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/countries", label: "国一覧", match: (p: string) => p.startsWith("/countries") },
    { href: "/journey", label: "KANTAの軌跡", match: (p: string) => p.startsWith("/journey") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-background/75 backdrop-blur-xl shadow-[0_1px_0_rgba(200,169,110,0.08)]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Compass className="h-6 w-6 text-accent transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-bold text-lg tracking-widest text-foreground">
              KANTA TRAVEL🧳
            </span>
          </Link>

          {/* 検索バー（デスクトップ） */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-sm items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 focus-within:border-accent/40 focus-within:bg-white/6 transition-all duration-200"
          >
            <Search className="h-4 w-4 text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="国を検索..."
              aria-label="国を検索"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
            />
          </form>

          {/* ナビゲーションリンク（デスクトップ） */}
          <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="メインナビゲーション">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors duration-200 ${
                  link.match(pathname)
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="sm:hidden text-muted hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー（CSS transitionで開閉） */}
      <div
        className={`sm:hidden border-t border-white/6 bg-background/90 backdrop-blur-xl px-4 overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? "max-h-60 py-3 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        <div className={`space-y-3 transition-transform duration-300 ${menuOpen ? "translate-y-0" : "-translate-y-2"}`}>
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-2">
            <Search className="h-4 w-4 text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="国を検索..."
              aria-label="国を検索"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
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
                    ? "text-accent font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
