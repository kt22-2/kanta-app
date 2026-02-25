import Link from "next/link";
import { Globe, Shield, Plane, MapPin, ChevronRight } from "lucide-react";

const REGIONS = [
  { id: "Asia", label: "アジア", emoji: "🌏", countries: 49 },
  { id: "Europe", label: "ヨーロッパ", emoji: "🌍", countries: 44 },
  { id: "Americas", label: "アメリカ", emoji: "🌎", countries: 35 },
  { id: "Africa", label: "アフリカ", emoji: "🌍", countries: 54 },
  { id: "Oceania", label: "オセアニア", emoji: "🌏", countries: 14 },
];

const FEATURES = [
  {
    icon: Shield,
    title: "安全情報",
    desc: "危険レベル・渡航警報をリアルタイムで確認",
  },
  {
    icon: Plane,
    title: "入国要件",
    desc: "ビザ・パスポート残存期間を国ごとに確認",
  },
  {
    icon: MapPin,
    title: "観光スポット",
    desc: "AI生成の旅行ガイドで現地の魅力を発見",
  },
  {
    icon: Globe,
    title: "国基本情報",
    desc: "言語・通貨・文化など必要な情報をまとめて",
  },
];

export default function HomePage() {
  return (
    <div className="topo-bg">
      {/* ヒーローセクション */}
      <section className="relative px-4 pt-16 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A2B4A]/30 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C8A96E]/30 bg-[#C8A96E]/10 px-4 py-1.5 text-sm text-[#C8A96E]">
            <Globe className="h-4 w-4" />
            世界一周旅行者のための情報ハブ
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#F5F5F0] sm:text-5xl">
            世界を旅する、
            <br />
            <span className="text-[#C8A96E]">安全に。</span>
          </h1>
          <p className="mt-4 text-lg text-[#8899AA]">
            195カ国の安全情報・入国要件・観光スポットを
            <br />
            スマートフォンひとつで確認できる旅行者向けアプリ
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8A96E] px-6 py-3 font-bold text-[#0F1923] hover:bg-[#D4B87A] transition-colors"
            >
              国を探す <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/countries?region=Asia"
              className="inline-flex items-center gap-2 rounded-lg border border-[#1C2D3E] bg-[#1C2D3E] px-6 py-3 font-bold text-[#F5F5F0] hover:border-[#C8A96E] transition-colors"
            >
              アジアを見る
            </Link>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E]/60 p-4 text-center"
            >
              <f.icon className="mx-auto mb-2 h-7 w-7 text-[#C8A96E]" />
              <h3 className="font-bold text-sm text-[#F5F5F0]">{f.title}</h3>
              <p className="mt-1 text-xs text-[#8899AA] leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 地域別ナビゲーション */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-5 text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#C8A96E]" />
            地域から探す
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {REGIONS.map((r) => (
              <Link
                key={r.id}
                href={`/countries?region=${r.id}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4 hover:border-[#C8A96E] hover:bg-[#1A2B4A] transition-all"
              >
                <span className="text-3xl">{r.emoji}</span>
                <span className="font-bold text-sm text-[#F5F5F0] group-hover:text-[#C8A96E]">
                  {r.label}
                </span>
                <span className="text-xs text-[#8899AA]">{r.countries}カ国</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
