import Link from "next/link";
import { Globe, Shield, Plane, MapPin, ChevronRight } from "lucide-react";
import CounterAnimation from "@/components/CounterAnimation";

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
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A2B4A]/30 to-transparent pointer-events-none" />
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none glow-accent"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(200,169,110,0.09) 0%, rgba(200,169,110,0.03) 40%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          {/* バッジ */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C8A96E]/40 bg-gradient-to-r from-[#C8A96E]/10 to-[#E8C980]/5 px-4 py-1.5 text-sm text-[#C8A96E] shadow-[0_0_20px_rgba(200,169,110,0.1)]">
            <Globe className="h-4 w-4 shrink-0" />
            世界一周旅行者のための情報ハブ
          </div>

          {/* タイトル */}
          <h1 className="text-4xl font-black tracking-tight text-[#F5F5F0] sm:text-6xl leading-[1.1]">
            世界を旅する、
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 50%, #C8A96E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              } as React.CSSProperties}
            >
              安全に。
            </span>
          </h1>

          <p className="mt-5 text-lg text-[#8899AA] leading-relaxed">
            195カ国の安全情報・入国要件・観光スポットを
            <br className="hidden sm:block" />
            スマートフォンひとつで確認できる旅行者向けアプリ
          </p>

          {/* CTAボタン */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/countries"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 font-bold text-[#0F1923] transition-all duration-200 hover:shadow-[0_0_28px_rgba(200,169,110,0.45)] hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 50%, #D4B87A 100%)",
              }}
            >
              国を探す <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/countries?region=Asia"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.05] px-7 py-3.5 font-bold text-[#F5F5F0] hover:border-[#C8A96E]/40 hover:bg-white/[0.09] backdrop-blur-sm transition-all duration-200"
            >
              アジアを見る
            </Link>
          </div>
        </div>
      </section>

      {/* 統計カウンター */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <CounterAnimation />
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass-card gradient-border-hover rounded-xl p-5 text-center transition-all duration-300 hover:shadow-[0_4px_20px_rgba(200,169,110,0.12)] hover:-translate-y-0.5 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10">
                <f.icon className="h-6 w-6 text-[#C8A96E]" />
              </div>
              <h3 className="font-bold text-sm text-[#F5F5F0]">{f.title}</h3>
              <p className="mt-1 text-xs text-[#8899AA] leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 地域別ナビゲーション */}
      <section className="px-4 py-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-5 text-xl font-bold text-[#F5F5F0] flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10">
              <MapPin className="h-4 w-4 text-[#C8A96E]" />
            </div>
            地域から探す
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {REGIONS.map((r, i) => (
              <Link
                key={r.id}
                href={`/countries?region=${r.id}`}
                className="group glass-card gradient-border-hover flex flex-col items-center gap-2 rounded-xl p-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(200,169,110,0.15)] hover:-translate-y-0.5 animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {r.emoji}
                </span>
                <span className="font-bold text-sm text-[#F5F5F0] group-hover:text-[#C8A96E] transition-colors duration-200">
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
