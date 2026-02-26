import Link from "next/link";
import { Globe, Shield, Plane, MapPin, ChevronRight } from "lucide-react";
import CounterAnimation from "@/components/CounterAnimation";

const REGIONS = [
  { id: "Asia", label: "アジア", emoji: "🌏", countries: 49, flags: "🇯🇵🇹🇭🇰🇷" },
  { id: "Europe", label: "ヨーロッパ", emoji: "🌍", countries: 44, flags: "🇫🇷🇩🇪🇮🇹" },
  { id: "Americas", label: "アメリカ", emoji: "🌎", countries: 35, flags: "🇺🇸🇧🇷🇲🇽" },
  { id: "Africa", label: "アフリカ", emoji: "🌍", countries: 54, flags: "🇪🇬🇰🇪🇿🇦" },
  { id: "Oceania", label: "オセアニア", emoji: "🌏", countries: 14, flags: "🇦🇺🇳🇿🇫🇯" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "安全情報",
    desc: "外務省・米国務省の危険レベルをリアルタイム取得",
  },
  {
    icon: Plane,
    title: "入国要件",
    desc: "ビザ要否・パスポート残存期間を即座に確認",
  },
  {
    icon: MapPin,
    title: "観光スポット",
    desc: "世界遺産・AI推薦の旅行ガイドで現地の魅力を発見",
  },
  {
    icon: Globe,
    title: "国基本情報",
    desc: "言語・通貨・気候・為替など旅に必要な情報を網羅",
  },
];

const POPULAR_DESTINATIONS = [
  { code: "TH", name: "タイ", emoji: "🇹🇭", tagline: "微笑みの国" },
  { code: "IT", name: "イタリア", emoji: "🇮🇹", tagline: "歴史と美食" },
  { code: "US", name: "アメリカ", emoji: "🇺🇸", tagline: "多様な文化" },
  { code: "AU", name: "オーストラリア", emoji: "🇦🇺", tagline: "大自然の冒険" },
];

export default function HomePage() {
  return (
    <div className="topo-bg">
      {/* ヒーローセクション */}
      <section className="relative px-4 pt-16 pb-12 text-center overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent pointer-events-none" />
        {/* ドットグリッド背景 */}
        <div className="absolute inset-0 dot-grid pointer-events-none" style={{ animation: "dotFloat 6s ease-in-out infinite" }} />
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-gradient-to-r from-accent/10 to-accent-light/5 px-4 py-1.5 text-sm text-accent shadow-[0_0_20px_rgba(200,169,110,0.1)]">
            <Globe className="h-4 w-4 shrink-0" />
            世界一周旅行者のための情報ハブ
          </div>

          {/* タイトル */}
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl leading-[1.1]">
            世界を旅する、
            <br />
            <span className="gradient-text">安全に。</span>
          </h1>

          <p className="mt-5 text-lg text-muted leading-relaxed">
            外務省の安全情報から入国要件、AI推薦の観光スポットまで
            <br className="hidden sm:block" />
            195カ国の旅行情報をワンストップで確認
          </p>

          {/* CTAボタン */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/countries"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 font-bold text-background transition-all duration-200 hover:shadow-[0_0_28px_rgba(200,169,110,0.45)] hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 50%, #D4B87A 100%)",
              }}
            >
              国を探す <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/countries?region=Asia"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/5 px-7 py-3.5 font-bold text-foreground hover:border-accent/40 hover:bg-white/9 backdrop-blur-sm transition-all duration-200"
            >
              アジアを見る
            </Link>
          </div>
        </div>
      </section>

      {/* 人気の旅先 */}
      <section className="px-4 pb-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs text-muted mb-3 uppercase tracking-wider font-semibold">人気の旅先</p>
          <div className="grid grid-cols-4 gap-2">
            {POPULAR_DESTINATIONS.map((d, i) => (
              <Link
                key={d.code}
                href={`/countries/${d.code}`}
                className="group glass-card-interactive rounded-xl p-3 text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className="text-2xl block mb-1 transition-transform duration-300 group-hover:scale-110">{d.emoji}</span>
                <span className="font-bold text-xs text-foreground block">{d.name}</span>
                <span className="text-[10px] text-muted">{d.tagline}</span>
              </Link>
            ))}
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
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs text-muted mb-4 uppercase tracking-wider font-semibold">
            カバーする情報
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card rounded-xl p-5 text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-light/10">
                  <f.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{f.title}</h3>
                <p className="mt-1 text-xs text-muted leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 地域別ナビゲーション */}
      <section className="px-4 py-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-5 text-xl font-bold text-foreground flex items-center gap-3">
            <div className="section-icon">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            地域から探す
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {REGIONS.map((r, i) => (
              <Link
                key={r.id}
                href={`/countries?region=${r.id}`}
                className="group glass-card-interactive flex flex-col items-center gap-2 rounded-xl p-4 animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {r.emoji}
                </span>
                <span className="font-bold text-sm text-foreground group-hover:text-accent transition-colors duration-200">
                  {r.label}
                </span>
                <span className="text-xs text-muted">{r.countries}カ国</span>
                <span className="text-[10px] text-muted/60 tracking-wider">{r.flags}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
