"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Search, Menu, X } from "lucide-react";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/countries?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1C2D3E] bg-[#0F1923]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Compass className="h-6 w-6 text-[#C8A96E]" />
            <span className="font-bold text-lg tracking-widest text-[#F5F5F0]">
              KANTA
            </span>
          </Link>

          {/* 検索バー（デスクトップ） */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-sm items-center gap-2 rounded-lg border border-[#1C2D3E] bg-[#1C2D3E] px-3 py-1.5"
          >
            <Search className="h-4 w-4 text-[#8899AA]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="国を検索..."
              className="flex-1 bg-transparent text-sm text-[#F5F5F0] placeholder:text-[#8899AA] outline-none"
            />
          </form>

          {/* ナビゲーションリンク（デスクトップ） */}
          <nav className="hidden sm:flex items-center gap-4 text-sm text-[#8899AA]">
            <Link href="/countries" className="hover:text-[#C8A96E] transition-colors">
              国一覧
            </Link>
            <Link href="/countries?region=Asia" className="hover:text-[#C8A96E] transition-colors">
              アジア
            </Link>
            <Link href="/countries?region=Europe" className="hover:text-[#C8A96E] transition-colors">
              ヨーロッパ
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="sm:hidden text-[#8899AA] hover:text-[#F5F5F0]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#1C2D3E] bg-[#0F1923] px-4 py-3 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-lg border border-[#1C2D3E] bg-[#1C2D3E] px-3 py-2">
            <Search className="h-4 w-4 text-[#8899AA]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="国を検索..."
              className="flex-1 bg-transparent text-sm text-[#F5F5F0] placeholder:text-[#8899AA] outline-none"
            />
          </form>
          <nav className="flex flex-col gap-2 text-sm text-[#8899AA]">
            <Link href="/countries" onClick={() => setMenuOpen(false)} className="hover:text-[#C8A96E]">国一覧</Link>
            <Link href="/countries?region=Asia" onClick={() => setMenuOpen(false)} className="hover:text-[#C8A96E]">アジア</Link>
            <Link href="/countries?region=Europe" onClick={() => setMenuOpen(false)} className="hover:text-[#C8A96E]">ヨーロッパ</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
